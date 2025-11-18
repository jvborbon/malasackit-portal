import express from 'express';
import {
    submitDonationRequest,
    getDonorDonations,
    getDonationDetails,
    cancelDonationRequest,
    updateDonationRequest
} from '../controllers/donationControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All donation request routes require authentication
router.use(authenticateToken);

// POST /api/donation-requests - Submit a new donation request
router.post('/', submitDonationRequest);

// GET /api/donation-requests - Get user's donation requests (with optional filters)
router.get('/', getDonorDonations);

// GET /api/donation-requests/:donationId - Get specific donation request details
router.get('/:donationId', getDonationDetails);

// PUT /api/donation-requests/:donationId/cancel - Cancel a donation request
router.put('/:donationId/cancel', cancelDonationRequest);

// PUT /api/donation-requests/:donationId - Update a donation request
router.put('/:donationId', updateDonationRequest);

export default router;
