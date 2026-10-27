import express from 'express';
import {
  getAvailableDonations,
  getDonationById,
  getMyDonations,
  getMyClaims,
  createDonation,
  updateDonation,
  cancelDonation,
  claimDonation,
  markPickedUp,
  markCompleted
} from '../controllers/donationController.js';
import { authenticate, requireRole, requireVerifiedRecipient } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAvailableDonations);

// Protected routes with role guards
router.get('/my-donations', authenticate, requireRole('donor', 'admin'), getMyDonations);
router.get('/my-claims', authenticate, requireRole('recipient', 'admin'), getMyClaims);
router.get('/:id', getDonationById);

// Create donation (Donor or Admin)
router.post('/', authenticate, requireRole('donor', 'admin'), createDonation);

// Edit donation (Owner Donor or Admin)
router.put('/:id', authenticate, updateDonation);

// Cancel donation (Donor or Admin)
router.patch('/:id/cancel', authenticate, cancelDonation);

// Claim donation (Verified Recipient only, atomic concurrency control)
router.post('/:id/claim', authenticate, requireVerifiedRecipient, claimDonation);

// Update pickup status
router.post('/:id/pickup', authenticate, markPickedUp);

// Complete donation
router.post('/:id/complete', authenticate, markCompleted);

export default router;
