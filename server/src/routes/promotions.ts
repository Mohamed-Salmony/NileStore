import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { cacheMiddleware } from '../middleware/cache';
import { createPromotionSchema, updatePromotionSchema, addProductToPromotionSchema } from '../schemas/validation';
import * as promotionController from '../controllers/promotionController';

const router = Router();

// Public routes
router.get('/active', cacheMiddleware(5 * 60 * 1000), promotionController.getActivePromotions);
router.get('/:id/products', cacheMiddleware(5 * 60 * 1000), promotionController.getPromotionProducts);

// Admin routes
router.get('/', requireAuth, requireAdmin, promotionController.getAllPromotions);
router.get('/:id', requireAuth, requireAdmin, promotionController.getPromotionById);
router.post('/', requireAuth, requireAdmin, validate(createPromotionSchema), promotionController.createPromotion);
router.put('/:id', requireAuth, requireAdmin, validate(updatePromotionSchema), promotionController.updatePromotion);
router.delete('/:id', requireAuth, requireAdmin, promotionController.deletePromotion);
router.post('/:id/products', requireAuth, requireAdmin, validate(addProductToPromotionSchema), promotionController.addProductToPromotion);
router.delete('/:id/products/:productId', requireAuth, requireAdmin, promotionController.removeProductFromPromotion);
router.put('/:id/products/:productId', requireAuth, requireAdmin, promotionController.updatePromotionProduct);

export default router;
