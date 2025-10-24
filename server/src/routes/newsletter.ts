import express from 'express';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getAllSubscriptions,
  getSubscriptionStats,
  deleteSubscription
} from '../controllers/newsletterController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribeToNewsletter);
router.post('/unsubscribe', unsubscribeFromNewsletter);

// Admin routes
router.get('/', requireAuth, requireAdmin, getAllSubscriptions);
router.get('/stats', requireAuth, requireAdmin, getSubscriptionStats);
router.delete('/:id', requireAuth, requireAdmin, deleteSubscription);

export default router;
