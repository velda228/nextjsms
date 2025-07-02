import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import * as chapterController from '../controllers/chapterController';

const router = Router();

// Получить главу по ID
router.get('/:id', [
  param('id').isInt({ min: 1 }),
  validateRequest
], chapterController.getChapterById);

// Создать новую главу (только админ)
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('manga_id').isInt({ min: 1 }),
  body('chapter_number').isFloat({ min: 0 }),
  body('title').optional().isString(),
  body('pages').isArray(),
  body('pages.*').isString(),
  validateRequest
], chapterController.createChapter);

// Обновить главу (только админ)
router.put('/:id', [
  authMiddleware,
  adminMiddleware,
  param('id').isInt({ min: 1 }),
  body('chapter_number').optional().isFloat({ min: 0 }),
  body('title').optional().isString(),
  body('pages').optional().isArray(),
  body('pages.*').optional().isString(),
  validateRequest
], chapterController.updateChapter);

// Удалить главу (только админ)
router.delete('/:id', [
  authMiddleware,
  adminMiddleware,
  param('id').isInt({ min: 1 }),
  validateRequest
], chapterController.deleteChapter);

// Загрузить страницы главы (только админ)
router.post('/:id/pages', [
  authMiddleware,
  adminMiddleware,
  param('id').isInt({ min: 1 }),
  validateRequest
], chapterController.uploadPages);

export default router; 