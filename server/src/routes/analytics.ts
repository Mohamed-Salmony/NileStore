import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import * as analyticsController from '../controllers/analyticsController';

const router = Router();

// All analytics routes require admin access
router.get('/dashboard', requireAuth, requireAdmin, analyticsController.getDashboardStats);
router.get('/sales', requireAuth, requireAdmin, analyticsController.getSalesReport);
router.get('/top-products', requireAuth, requireAdmin, analyticsController.getTopProducts);

export default router;
