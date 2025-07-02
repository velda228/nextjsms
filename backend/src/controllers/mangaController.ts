import { Request, Response } from 'express';
import { pool } from '../database';

export const getMangaList = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, status, genres, author } = req.query;
    
    let query = 'SELECT * FROM manga WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    // Фильтрация по поиску
    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR title_original ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Фильтрация по статусу
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Фильтрация по жанрам
    if (genres) {
      const genreArray = genres.toString().split(',');
      query += ` AND genres && $${paramIndex}`;
      params.push(genreArray);
      paramIndex++;
    }
    
    // Фильтрация по автору
    if (author) {
      query += ` AND author ILIKE $${paramIndex}`;
      params.push(`%${author}%`);
      paramIndex++;
    }
    
    // Подсчет общего количества
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    
    // Пагинация
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const offset = (pageNum - 1) * limitNum;
    
    query += ` ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: {
        manga: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка получения списка манги'
    });
  }
};

export const getMangaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM manga WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Манга не найдена'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка получения манги'
    });
  }
};

export const getMangaChapters = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование манги
    const mangaResult = await pool.query('SELECT id FROM manga WHERE id = $1', [id]);
    if (mangaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Манга не найдена'
      });
    }
    
    // Получаем главы
    const chaptersResult = await pool.query(
      'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number',
      [id]
    );
    
    res.json({
      success: true,
      data: chaptersResult.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка получения глав'
    });
  }
};

export const createManga = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      title_original, 
      description, 
      author, 
      artist,
      status, 
      genres, 
      year,
      rating = 0,
      views = 0,
      cover_image
    } = req.body;
    const userId = (req as any).user?.id || null;
    const result = await pool.query(
      `INSERT INTO manga (title, title_original, description, author, artist, status, genres, year, rating, views, cover_image) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [title, title_original, description, author, artist, status, genres, year, rating, views, cover_image]
    );
    // Логируем создание
    await pool.query(
      'INSERT INTO manga_history (user_id, manga_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, result.rows[0].id, 'create', JSON.stringify(result.rows[0])]
    );
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Манга успешно создана'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка создания манги'
    });
  }
};

export const updateManga = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = (req as any).user?.id || null;
    // Проверяем существование манги
    const checkResult = await pool.query('SELECT id FROM manga WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Манга не найдена'
      });
    }
    // Строим динамический запрос для обновления
    const fields = Object.keys(updateData).filter(key => 
      ['title', 'title_original', 'description', 'author', 'artist', 'status', 'genres', 'year', 'rating', 'views', 'cover_image'].includes(key)
    );
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Нет полей для обновления'
      });
    }
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updateData[field])];
    const query = `UPDATE manga SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, values);
    // Логируем обновление
    await pool.query(
      'INSERT INTO manga_history (user_id, manga_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, id, 'update', JSON.stringify(updateData)]
    );
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Манга успешно обновлена'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления манги'
    });
  }
};

export const deleteManga = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || null;
    const result = await pool.query('DELETE FROM manga WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Манга не найдена'
      });
    }
    // Логируем удаление
    await pool.query(
      'INSERT INTO manga_history (user_id, manga_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, id, 'delete', null]
    );
    res.json({
      success: true,
      message: 'Манга успешно удалена'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления манги'
    });
  }
};

export const uploadCover = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cover_image } = req.body;
    
    // Проверяем существование манги
    const checkResult = await pool.query('SELECT id FROM manga WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Манга не найдена'
      });
    }
    
    // Обновляем обложку
    const result = await pool.query(
      'UPDATE manga SET cover_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING cover_image',
      [cover_image, id]
    );
    
    res.json({
      success: true,
      data: { cover_image: result.rows[0].cover_image },
      message: 'Обложка успешно обновлена'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка загрузки обложки'
    });
  }
};

export const getMangaHistory = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT h.*, u.username, m.title as manga_title FROM manga_history h
       LEFT JOIN users u ON h.user_id = u.id
       LEFT JOIN manga m ON h.manga_id = m.id
       ORDER BY h.created_at DESC LIMIT 200`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка получения истории изменений' });
  }
};