import { Request, Response } from 'express';
import { pool } from '../database';
import bcrypt from 'bcrypt';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY id');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка получения пользователей' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      'SELECT id, username, email, role, avatar, banner, bio, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('PROFILE ERROR:', error);
    res.status(500).json({ success: false, error: 'Ошибка получения профиля', details: error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username, email, avatar, banner, bio } = req.body;
    
    // Проверяем уникальность username и email
    if (username) {
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ success: false, error: 'Пользователь с таким именем уже существует' });
      }
    }
    
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ success: false, error: 'Пользователь с такой почтой уже существует' });
      }
    }
    
    const result = await pool.query(
      `UPDATE users SET 
        username = COALESCE($1, username),
        email = COALESCE($2, email),
        avatar = COALESCE($3, avatar),
        banner = COALESCE($4, banner),
        bio = COALESCE($5, bio),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING id, username, email, role, avatar, banner, bio, created_at`,
      [username, email, avatar, banner, bio, userId]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка обновления профиля' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Необходимо указать текущий и новый пароль' });
    }
    
    // Получаем текущий пароль
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    
    // Проверяем текущий пароль
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, error: 'Неверный текущий пароль' });
    }
    
    // Хешируем новый пароль
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Обновляем пароль
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );
    
    res.json({ success: true, message: 'Пароль успешно изменён' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка изменения пароля' });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      `SELECT m.*, f.created_at as added_at 
       FROM favorites f 
       JOIN manga m ON f.manga_id = m.id 
       WHERE f.user_id = $1 
       ORDER BY f.created_at DESC`,
      [userId]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка получения закладок' });
  }
};

export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { manga_id } = req.body;
    
    // Проверяем существование манги
    const mangaCheck = await pool.query('SELECT id FROM manga WHERE id = $1', [manga_id]);
    if (mangaCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Манга не найдена' });
    }
    
    // Проверяем, не добавлена ли уже в закладки
    const existingCheck = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND manga_id = $2',
      [userId, manga_id]
    );
    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Манга уже в закладках' });
    }
    
    // Добавляем в закладки
    await pool.query(
      'INSERT INTO favorites (user_id, manga_id) VALUES ($1, $2)',
      [userId, manga_id]
    );
    
    res.json({ success: true, message: 'Манга добавлена в закладки' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка добавления в закладки' });
  }
};

export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { manga_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND manga_id = $2 RETURNING id',
      [userId, manga_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Закладка не найдена' });
    }
    
    res.json({ success: true, message: 'Манга удалена из закладок' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка удаления из закладок' });
  }
};

export const getReadingHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      `SELECT m.*, c.chapter_number, c.title as chapter_title, rh.page_number, rh.read_at
       FROM reading_history rh 
       JOIN manga m ON rh.manga_id = m.id 
       JOIN chapters c ON rh.chapter_id = c.id 
       WHERE rh.user_id = $1 
       ORDER BY rh.read_at DESC 
       LIMIT 20`,
      [userId]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка получения истории чтения' });
  }
};

export const updateReadingHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { manga_id, chapter_id, page_number } = req.body;
    
    // Проверяем существование записи
    const existingCheck = await pool.query(
      'SELECT id FROM reading_history WHERE user_id = $1 AND manga_id = $2 AND chapter_id = $3',
      [userId, manga_id, chapter_id]
    );
    
    if (existingCheck.rows.length > 0) {
      // Обновляем существующую запись
      await pool.query(
        'UPDATE reading_history SET page_number = $1, read_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND manga_id = $3 AND chapter_id = $4',
        [page_number, userId, manga_id, chapter_id]
      );
    } else {
      // Создаём новую запись
      await pool.query(
        'INSERT INTO reading_history (user_id, manga_id, chapter_id, page_number) VALUES ($1, $2, $3, $4)',
        [userId, manga_id, chapter_id, page_number]
      );
    }
    
    res.json({ success: true, message: 'История чтения обновлена' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка обновления истории чтения' });
  }
};

// Дополнительные крутые функции
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Статистика закладок
    const favoritesCount = await pool.query(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = $1',
      [userId]
    );
    
    // Статистика прочитанных глав
    const chaptersRead = await pool.query(
      'SELECT COUNT(DISTINCT chapter_id) as count FROM reading_history WHERE user_id = $1',
      [userId]
    );
    
    // Любимые жанры
    const favoriteGenres = await pool.query(
      `SELECT unnest(m.genres) as genre, COUNT(*) as count
       FROM favorites f 
       JOIN manga m ON f.manga_id = m.id 
       WHERE f.user_id = $1 
       GROUP BY genre 
       ORDER BY count DESC 
       LIMIT 5`,
      [userId]
    );
    
    // Последняя активность
    const lastActivity = await pool.query(
      'SELECT read_at FROM reading_history WHERE user_id = $1 ORDER BY read_at DESC LIMIT 1',
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        favorites_count: parseInt(favoritesCount.rows[0].count),
        chapters_read: parseInt(chaptersRead.rows[0].count),
        favorite_genres: favoriteGenres.rows,
        last_activity: lastActivity.rows[0]?.read_at || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка получения статистики' });
  }
}; 