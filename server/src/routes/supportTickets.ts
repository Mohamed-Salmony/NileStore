import express from 'express';
import {
  createTicket,
  getUserTickets,
  getTicketDetails,
  addTicketMessage,
  getAllTickets,
  adminGetTicketDetails,
  adminReplyToTicket,
  updateTicket,
  getTicketStats
} from '../controllers/supportTicketsController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = express.Router();

// User routes
router.post('/', requireAuth, createTicket);
router.get('/my', requireAuth, getUserTickets);
router.get('/:id', requireAuth, getTicketDetails);
router.post('/:id/messages', requireAuth, addTicketMessage);

// Admin routes
router.get('/admin/all', requireAuth, requireAdmin, getAllTickets);
router.get('/admin/stats', requireAuth, requireAdmin, getTicketStats);
router.get('/admin/:id', requireAuth, requireAdmin, adminGetTicketDetails);
router.post('/admin/:id/reply', requireAuth, requireAdmin, adminReplyToTicket);
router.patch('/admin/:id', requireAuth, requireAdmin, updateTicket);

export default router;
