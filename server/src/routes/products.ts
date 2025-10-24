import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { cacheMiddleware } from '../middleware/cache';
import { createProductSchema, updateProductSchema } from '../schemas/validation';
import * as productController from '../controllers/productController';

const router = Router();

// Cache product listings for 5 minutes
router.get('/', cacheMiddleware(5 * 60 * 1000), productController.getAllProducts);
router.get('/:id', cacheMiddleware(5 * 60 * 1000), productController.getProductById);
router.post('/', requireAuth, requireAdmin, validate(createProductSchema), productController.createProduct);
router.put('/:id', requireAuth, requireAdmin, validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', requireAuth, requireAdmin, productController.deleteProduct);

export default router;
