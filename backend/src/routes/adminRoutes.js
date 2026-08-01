import express from 'express';
import {
  getDashboardStats,
  getSalesAnalytics,
  getCustomerAnalytics,
  getAllCustomers,
  getCustomerDetails,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics/sales', getSalesAnalytics);
router.get('/analytics/customers', getCustomerAnalytics);
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerDetails);

export default router;
