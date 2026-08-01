import express from 'express';
import {
  getMyTickets,
  getTicketById,
  createTicket,
  replyToTicket,
  closeTicket,
  getAllTickets,
  adminReplyToTicket,
  updateTicket,
} from '../controllers/ticketController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.get('/', protect, getMyTickets);
router.get('/:id', protect, getTicketById);
router.post('/', protect, createTicket);
router.post('/:id/reply', protect, replyToTicket);
router.put('/:id/close', protect, closeTicket);

// Admin routes
router.get('/admin/all', protect, restrictTo('admin', 'super_admin', 'support_agent'), getAllTickets);
router.post('/admin/:id/reply', protect, restrictTo('admin', 'super_admin', 'support_agent'), adminReplyToTicket);
router.put('/admin/:id', protect, restrictTo('admin', 'super_admin', 'support_agent'), updateTicket);

export default router;
