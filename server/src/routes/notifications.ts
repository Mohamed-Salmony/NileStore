import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  sendToAllUsers,
  getAllNotifications,
  adminDeleteNotification
} from '../controllers/notificationsController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = express.Router();

// User routes (require authentication)
router.get('/my', requireAuth, getUserNotifications);
router.get('/unread-count', requireAuth, getUnreadCount);
router.patch('/:id/read', requireAuth, markAsRead);
router.patch('/read-all', requireAuth, markAllAsRead);
router.delete('/:id', requireAuth, deleteNotification);

// Admin routes
router.post('/', requireAuth, requireAdmin, createNotification);
router.post('/send-all', requireAuth, requireAdmin, sendToAllUsers);
router.get('/all', requireAuth, requireAdmin, getAllNotifications);
router.delete('/admin/:id', requireAuth, requireAdmin, adminDeleteNotification);

export default router;
