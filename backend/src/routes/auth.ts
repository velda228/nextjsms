import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import * as authController from '../controllers/authController';

const router = Router();

// Регистрация
router.post('/register', [
  body('username').isString().isLength({ min: 3, max: 30 }),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 }),
  validateRequest
], authController.register);

// Вход
router.post('/login', [
  body('login').notEmpty(),
  body('password').isString(),
  validateRequest
], authController.login);

// Обновление токена
router.post('/refresh', authController.refreshToken);

// Выход
router.post('/logout', authController.logout);

export default router; 