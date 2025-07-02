import { Request, Response } from 'express';
import { pool } from '../database';

export const getChapterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM chapters WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Глава не найдена' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка получения главы' });
  }
};

export const createChapter = async (req: Request, res: Response) => {
  try {
    const { manga_id, chapter_number, title, pages } = req.body;
    const userId = (req as any).user?.id || null;
    
    // Проверяем существование манги
    const mangaResult = await pool.query('SELECT id FROM manga WHERE id = $1', [manga_id]);
    if (mangaResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Манга не найдена' });
    }
    
    // Проверяем, не существует ли уже глава с таким номером
    const existingChapter = await pool.query(
      'SELECT id FROM chapters WHERE manga_id = $1 AND chapter_number = $2',
      [manga_id, chapter_number]
    );
    if (existingChapter.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Глава с таким номером уже существует' });
    }
    
    // Добавляем главу
    const result = await pool.query(
      'INSERT INTO chapters (manga_id, chapter_number, title, pages) VALUES ($1, $2, $3, $4::text[]) RETURNING *',
      [manga_id, chapter_number, title, Array.isArray(pages) ? pages : []]
    );
    
    // Логируем добавление главы
    await pool.query(
      'INSERT INTO manga_history (user_id, manga_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, manga_id, 'add_chapter', JSON.stringify(result.rows[0])]
    );
    
    res.status(201).json({ success: true, data: result.rows[0], message: 'Глава добавлена' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка добавления главы' });
  }
};

export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { chapter_number, title, pages } = req.body;
    const userId = (req as any).user?.id || null;
    
    // Проверяем существование главы
    const checkResult = await pool.query('SELECT * FROM chapters WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Глава не найдена' });
    }
    
    const chapter = checkResult.rows[0];
    
    // Строим динамический запрос для обновления
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    if (chapter_number !== undefined) {
      updateFields.push(`chapter_number = $${paramIndex++}`);
      values.push(chapter_number);
    }
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (pages !== undefined) {
      updateFields.push(`pages = $${paramIndex++}::text[]`);
      values.push(Array.isArray(pages) ? pages : []);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'Нет полей для обновления' });
    }
    
    values.push(id);
    const query = `UPDATE chapters SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    
    // Логируем обновление
    await pool.query(
      'INSERT INTO manga_history (user_id, manga_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, chapter.manga_id, 'update_chapter', JSON.stringify({ chapter_id: id, changes: req.body })]
    );
    
    res.json({ success: true, data: result.rows[0], message: 'Глава обновлена' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка обновления главы' });
  }
};

export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || null;
    
    // Получаем информацию о главе перед удалением
    const chapterResult = await pool.query('SELECT * FROM chapters WHERE id = $1', [id]);
    if (chapterResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Глава не найдена' });
    }
    
    const chapter = chapterResult.rows[0];
    
    // Удаляем главу
    const result = await pool.query('DELETE FROM chapters WHERE id = $1 RETURNING id', [id]);
    
    // Логируем удаление
    await pool.query(
      'INSERT INTO manga_history (user_id, manga_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, chapter.manga_id, 'delete_chapter', JSON.stringify(chapter)]
    );
    
    res.json({ success: true, message: 'Глава удалена' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка удаления главы' });
  }
};

export const uploadPages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pages } = req.body;
    const userId = (req as any).user?.id || null;
    
    // Проверяем существование главы
    const checkResult = await pool.query('SELECT * FROM chapters WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Глава не найдена' });
    }
    
    const chapter = checkResult.rows[0];
    
    // Обновляем страницы
    const result = await pool.query(
      'UPDATE chapters SET pages = $1::text[], updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [Array.isArray(pages) ? pages : [], id]
    );
    
    // Логируем обновление страниц
    await pool.query(
      'INSERT INTO manga_history (user_id, manga_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, chapter.manga_id, 'update_pages', JSON.stringify({ chapter_id: id, pages_count: pages.length })]
    );
    
    res.json({ success: true, data: result.rows[0], message: 'Страницы обновлены' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка загрузки страниц' });
  }
}; 