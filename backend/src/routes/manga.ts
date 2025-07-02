import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import * as mangaController from '../controllers/mangaController';

const router = Router();

// Получить список манги с фильтрацией
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['ongoing', 'completed', 'hiatus']),
  query('genres').optional().isString(),
  query('author').optional().isString(),
  validateRequest
], mangaController.getMangaList);

// История изменений манги (только для админа) - ДОЛЖНА БЫТЬ ПЕРЕД РОУТАМИ С ПАРАМЕТРАМИ
router.get('/history', authMiddleware, adminMiddleware, mangaController.getMangaHistory);

// Получить мангу по ID
router.get('/:id', [
  param('id').isInt({ min: 1 }),
  validateRequest
], mangaController.getMangaById);

// Получить главы манги
router.get('/:id/chapters', [
  param('id').isInt({ min: 1 }),
  validateRequest
], mangaController.getMangaChapters);

// Создать новую мангу (только админ)
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('title').isString().isLength({ min: 1, max: 255 }),
  body('description').isString().isLength({ min: 1 }),
  body('author').isString().isLength({ min: 1, max: 255 }),
  body('status').isIn(['ongoing', 'completed', 'hiatus']),
  body('genres').isArray(),
  body('genres.*').isString(),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }),
  validateRequest
], mangaController.createManga);

// Обновить мангу (только админ)
router.put('/:id', [
  authMiddleware,
  adminMiddleware,
  param('id').isInt({ min: 1 }),
  body('title').optional().isString().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().isLength({ min: 1 }),
  body('author').optional().isString().isLength({ min: 1, max: 255 }),
  body('status').optional().isIn(['ongoing', 'completed', 'hiatus']),
  body('genres').optional().isArray(),
  body('genres.*').optional().isString(),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }),
  validateRequest
], mangaController.updateManga);

// Удалить мангу (только админ)
router.delete('/:id', [
  authMiddleware,
  adminMiddleware,
  param('id').isInt({ min: 1 }),
  validateRequest
], mangaController.deleteManga);

// Загрузить обложку манги (только админ)
router.post('/:id/cover', [
  authMiddleware,
  adminMiddleware,
  param('id').isInt({ min: 1 }),
  validateRequest
], mangaController.uploadCover);

export default router; 