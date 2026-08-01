import express from 'express';
import {
  getMyOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect, restrictTo('admin', 'super_admin'), getAllOrders);
router.put('/admin/:id/status', protect, restrictTo('admin', 'super_admin'), updateOrderStatus);

export default router;
