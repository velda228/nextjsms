import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'Все поля обязательны' });
  }
  try {
    // Проверка на существование email или username
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Пользователь с таким email или именем уже существует' });
    }
    // Хешируем пароль
    const password_hash = await bcrypt.hash(password, 10);
    // Сохраняем пользователя
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role, created_at',
      [username, email, password_hash]
    );
    const user = result.rows[0];
    res.status(201).json({ success: true, data: user, message: 'Регистрация успешна' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ success: false, error: 'Email/ник и пароль обязательны' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [login]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Неверный email/ник или пароль' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Неверный email/ник или пароль' });
    }
    // Генерируем JWT
    const token = jwt.sign({ user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar } }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      data: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, token },
      message: 'Вход выполнен'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  // Заглушка обновления токена
  res.status(501).json({ success: false, error: 'Обновление токена не реализовано' });
};

export const logout = async (req: Request, res: Response) => {
  // Заглушка выхода
  res.status(200).json({ success: true, message: 'Выход выполнен' });
}; 