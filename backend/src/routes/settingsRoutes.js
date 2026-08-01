import express from 'express';
import {
  getSettings,
  getAdminSettings,
  updateSettings,
} from '../controllers/settingsController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSettings);
router.get('/admin', protect, restrictTo('admin', 'super_admin'), getAdminSettings);
router.put('/admin', protect, restrictTo('admin', 'super_admin'), updateSettings);

export default router;
