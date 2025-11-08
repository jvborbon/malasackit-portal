import express from 'express';
import {
    getDonationCategories,
    getItemTypesByCategory,
    createDonationCategory,
    createItemType,
    updateDonationCategory,
    deleteDonationCategory,
    getAllDonationRequests,
    updateDonationStatus,
    getDonationStatistics,
    getDonationDetails
} from '../controllers/donationControllers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/donations/categories - Get all donation categories with item types
router.get('/categories', getDonationCategories);

// GET /api/donations/categories/:categoryId/item-types - Get item types for a specific category
router.get('/categories/:categoryId/item-types', getItemTypesByCategory);

// POST /api/donations/categories - Create a new donation category
router.post('/categories', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), createDonationCategory);

// POST /api/donations/item-types - Create a new item type
router.post('/item-types', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), createItemType);

// PUT /api/donations/categories/:categoryId - Update a donation category
router.put('/categories/:categoryId', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), updateDonationCategory);

// DELETE /api/donations/categories/:categoryId - Delete a donation category
router.delete('/categories/:categoryId', authenticateToken, requireRole(['Executive Admin']), deleteDonationCategory);

// === Staff/Admin Management Routes ===

// GET /api/donations/requests - Get all donation requests (staff/admin only)
router.get('/requests', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), getAllDonationRequests);

// GET /api/donations/requests/:donationId - Get specific donation request details (staff/admin only)
router.get('/requests/:donationId', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), getDonationDetails);

// PUT /api/donations/requests/:donationId/status - Update donation request status
router.put('/requests/:donationId/status', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), updateDonationStatus);

// GET /api/donations/statistics - Get donation statistics for dashboard
router.get('/statistics', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), getDonationStatistics);

export default router;