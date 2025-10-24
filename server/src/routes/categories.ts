import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { cacheMiddleware } from '../middleware/cache';
import { createCategorySchema, updateCategorySchema } from '../schemas/validation';
import * as categoryController from '../controllers/categoryController';

const router = Router();

// Cache categories for 10 minutes (they change less frequently)
router.get('/', cacheMiddleware(10 * 60 * 1000), categoryController.getAllCategories);
router.get('/:id', cacheMiddleware(10 * 60 * 1000), categoryController.getCategoryById);
router.post('/', requireAuth, requireAdmin, validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', requireAuth, requireAdmin, validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', requireAuth, requireAdmin, categoryController.deleteCategory);

export default router;
