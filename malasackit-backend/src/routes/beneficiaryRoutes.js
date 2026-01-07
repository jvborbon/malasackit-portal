import express from 'express';
import {
    createBeneficiary,
    getAllBeneficiaries,
    getBeneficiaryById,
    updateBeneficiary,
    deleteBeneficiary,
    createBeneficiaryRequest,
    getAllBeneficiaryRequests,
    getBeneficiaryRequestById,
    updateBeneficiaryRequest,
    updateBeneficiaryRequestStatus,
    updateBeneficiaryRequestItems,
    getBeneficiaryRequestStatistics
} from '../controllers/beneficiaryControllers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// === BENEFICIARY MANAGEMENT ROUTES ===

// GET /api/beneficiaries - Get all beneficiaries with filtering and pagination
router.get('/', requireRole(['Resource Staff', 'Executive Admin']), getAllBeneficiaries);

// POST /api/beneficiaries - Create a new beneficiary
router.post('/', requireRole(['Resource Staff', 'Executive Admin']), createBeneficiary);

// GET /api/beneficiaries/statistics - Get beneficiary statistics
router.get('/statistics', requireRole(['Resource Staff', 'Executive Admin']), getBeneficiaryRequestStatistics);

// GET /api/beneficiaries/:beneficiaryId - Get specific beneficiary details
router.get('/:beneficiaryId', requireRole(['Resource Staff', 'Executive Admin']), getBeneficiaryById);

// PUT /api/beneficiaries/:beneficiaryId - Update beneficiary
router.put('/:beneficiaryId', requireRole(['Resource Staff', 'Executive Admin']), updateBeneficiary);

// DELETE /api/beneficiaries/:beneficiaryId - Delete beneficiary
router.delete('/:beneficiaryId', requireRole(['Executive Admin']), deleteBeneficiary);

// === BENEFICIARY REQUEST ROUTES ===

// GET /api/beneficiaries/requests/all - Get all beneficiary requests
router.get('/requests/all', requireRole(['Resource Staff', 'Executive Admin']), getAllBeneficiaryRequests);

// POST /api/beneficiaries/requests - Create a new beneficiary request
router.post('/requests', requireRole(['Resource Staff', 'Executive Admin']), createBeneficiaryRequest);

// GET /api/beneficiaries/requests/:requestId - Get beneficiary request with items
router.get('/requests/:requestId', requireRole(['Resource Staff', 'Executive Admin']), getBeneficiaryRequestById);

// PUT /api/beneficiaries/requests/:requestId - Update request details (purpose, urgency, notes, individuals_served)
router.put('/requests/:requestId', requireRole(['Resource Staff', 'Executive Admin']), updateBeneficiaryRequest);

// PUT /api/beneficiaries/requests/:requestId/status - Update request status
router.put('/requests/:requestId/status', requireRole(['Resource Staff', 'Executive Admin']), updateBeneficiaryRequestStatus);

// PUT /api/beneficiaries/requests/:requestId/items - Update request items
router.put('/requests/:requestId/items', requireRole(['Resource Staff', 'Executive Admin']), updateBeneficiaryRequestItems);

export default router;