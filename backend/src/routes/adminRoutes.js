import express from 'express';
import {
  getPlatformMetrics,
  getVerificationRequests,
  updateVerificationStatus,
  getAllUsers,
  toggleUserStatus,
  getAllDonations
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply admin guard to all admin routes
router.use(authenticate, requireRole('admin'));

router.get('/metrics', getPlatformMetrics);
router.get('/verifications', getVerificationRequests);
router.patch('/verifications/:userId', updateVerificationStatus);
router.get('/users', getAllUsers);
router.patch('/users/:userId/status', toggleUserStatus);
router.get('/donations', getAllDonations);

export default router;
