import express from 'express';
import {
  getInventory,
  addInventory,
  deleteInventory,
  getLowStock,
  exportInventory,
} from '../controllers/inventoryController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/:productId', protect, restrictTo('admin', 'super_admin', 'manager'), getInventory);
router.post('/', protect, restrictTo('admin', 'super_admin', 'manager'), addInventory);
router.delete('/:id', protect, restrictTo('admin', 'super_admin'), deleteInventory);
router.get('/admin/low-stock', protect, restrictTo('admin', 'super_admin', 'manager'), getLowStock);
router.get('/admin/export', protect, restrictTo('admin', 'super_admin', 'manager'), exportInventory);

export default router;
