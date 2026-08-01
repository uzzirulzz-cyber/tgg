import express from 'express';
import {
  getHomepage,
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from '../controllers/homepageController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getHomepage);

// Admin
router.get('/admin', protect, restrictTo('admin', 'super_admin'), getAllSections);
router.post('/admin', protect, restrictTo('admin', 'super_admin'), createSection);
router.put('/admin/reorder', protect, restrictTo('admin', 'super_admin'), reorderSections);
router.put('/admin/:id', protect, restrictTo('admin', 'super_admin'), updateSection);
router.delete('/admin/:id', protect, restrictTo('admin', 'super_admin'), deleteSection);

export default router;
