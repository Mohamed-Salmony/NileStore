import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '../schemas/validation';
import * as cartController from '../controllers/cartController';

const router = Router();

router.get('/', requireAuth, cartController.getCart);
router.post('/', requireAuth, validate(addToCartSchema), cartController.addToCart);
router.put('/:id', requireAuth, validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/:id', requireAuth, cartController.removeFromCart);
router.delete('/', requireAuth, cartController.clearCart);

export default router;
