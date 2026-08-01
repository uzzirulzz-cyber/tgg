import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getTrackerSnapshot,
  updateStaffPresence,
  createIncidentAlert,
} from '../controllers/trackerController.js';

const router = express.Router();

router.use(protect);

router.get('/snapshot', getTrackerSnapshot);
router.put('/presence/:id', restrictTo('admin', 'super_admin', 'manager'), updateStaffPresence);
router.post('/alerts', restrictTo('admin', 'super_admin', 'manager'), createIncidentAlert);

export default router;
