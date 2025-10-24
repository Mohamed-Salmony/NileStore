import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as wishlistController from '../controllers/wishlistController';

const router = Router();

// All routes require authentication
router.get('/', requireAuth, wishlistController.getWishlist);
router.post('/', requireAuth, wishlistController.addToWishlist);
router.delete('/:product_id', requireAuth, wishlistController.removeFromWishlist);
router.post('/check', requireAuth, wishlistController.checkWishlistStatus);

export default router;
