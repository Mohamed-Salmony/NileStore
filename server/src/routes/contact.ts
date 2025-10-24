import express from 'express';
import {
  submitContactMessage,
  getAllContactMessages,
  getContactMessage,
  updateContactMessageStatus,
  deleteContactMessage,
  getContactMessageStats
} from '../controllers/contactController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public route
router.post('/', submitContactMessage);

// Admin routes
router.get('/', requireAuth, requireAdmin, getAllContactMessages);
router.get('/stats', requireAuth, requireAdmin, getContactMessageStats);
router.get('/:id', requireAuth, requireAdmin, getContactMessage);
router.patch('/:id', requireAuth, requireAdmin, updateContactMessageStatus);
router.delete('/:id', requireAuth, requireAdmin, deleteContactMessage);

export default router;
