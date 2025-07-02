import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import * as userController from '../controllers/userController';

const router = Router();

// Получить всех пользователей (только админ)
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);

// Получить профиль пользователя
router.get('/profile', authMiddleware, userController.getProfile);

// Обновить профиль
router.put('/profile', [
  authMiddleware,
  body('username').optional().isString().isLength({ min: 3, max: 30 }),
  body('email').optional().isEmail(),
  body('avatar').optional().isString(),
  body('banner').optional().isString(),
  body('bio').optional().isString().isLength({ max: 500 }),
  validateRequest
], userController.updateProfile);

// Изменить пароль
router.put('/password', [
  authMiddleware,
  body('currentPassword').isString().isLength({ min: 6 }),
  body('newPassword').isString().isLength({ min: 6 }),
  validateRequest
], userController.changePassword);

// Получить статистику пользователя
router.get('/stats', authMiddleware, userController.getUserStats);

// Получить избранное
router.get('/favorites', authMiddleware, userController.getFavorites);

// Добавить в избранное
router.post('/favorites', [
  authMiddleware,
  body('manga_id').isInt({ min: 1 }),
  validateRequest
], userController.addToFavorites);

// Удалить из избранного
router.delete('/favorites/:manga_id', [
  authMiddleware,
  param('manga_id').isInt({ min: 1 }),
  validateRequest
], userController.removeFromFavorites);

// Получить историю чтения
router.get('/reading-history', authMiddleware, userController.getReadingHistory);

// Обновить историю чтения
router.post('/reading-history', [
  authMiddleware,
  body('manga_id').isInt({ min: 1 }),
  body('chapter_id').isInt({ min: 1 }),
  body('page_number').isInt({ min: 1 }),
  validateRequest
], userController.updateReadingHistory);

export default router; 