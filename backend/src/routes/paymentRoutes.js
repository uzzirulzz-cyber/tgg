import express from 'express';
import {
  createPayment,
  webhookHandler,
  getPaymentStatus,
  getAllPayments,
} from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/create', protect, paymentLimiter, createPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);
router.get('/:id', protect, getPaymentStatus);

// Admin
router.get('/admin/all', protect, restrictTo('admin', 'super_admin'), getAllPayments);

export default router;
