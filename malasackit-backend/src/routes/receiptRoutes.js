import express from 'express';
import { 
    generateDonationReceipt, 
    getReceiptHistory, 
    getReceiptStatistics 
} from '../controllers/receiptControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/receipts/donation/:donationId
 * @desc    Generate donation acknowledgment receipt
 * @access  Private (Donors: own receipts only, Staff/Admin: all receipts)
 * @query   format - 'pdf' (default) or 'json'
 */
router.get('/donation/:donationId', generateDonationReceipt);

/**
 * @route   GET /api/receipts/history
 * @desc    Get receipt generation history
 * @access  Private (Donors: own history only, Staff/Admin: all history)
 * @query   limit, offset - pagination parameters
 */
router.get('/history', getReceiptHistory);

/**
 * @route   GET /api/receipts/statistics
 * @desc    Get receipt generation statistics
 * @access  Private (Donors: own stats only, Staff/Admin: all stats)
 * @query   period - number of days to include (default: 30)
 */
router.get('/statistics', getReceiptStatistics);

export default router;