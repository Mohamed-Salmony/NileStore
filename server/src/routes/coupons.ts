import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../schemas/validation';
import * as couponController from '../controllers/couponController';

const router = Router();

// Public routes
router.post('/validate', requireAuth, validate(validateCouponSchema), couponController.validateCoupon);

// Admin routes
router.get('/', requireAuth, requireAdmin, couponController.getAllCoupons);
router.get('/:id', requireAuth, requireAdmin, couponController.getCouponById);
router.get('/:id/usage', requireAuth, requireAdmin, couponController.getCouponUsage);
router.get('/:id/stats', requireAuth, requireAdmin, couponController.getCouponStats);
router.post('/', requireAuth, requireAdmin, validate(createCouponSchema), couponController.createCoupon);
router.put('/:id', requireAuth, requireAdmin, validate(updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', requireAuth, requireAdmin, couponController.deleteCoupon);

export default router;
