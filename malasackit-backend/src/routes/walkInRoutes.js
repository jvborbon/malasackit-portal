import express from 'express';
import { createWalkIn, getWalkInDonations } from '../controllers/walkInControllers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Create walk-in donation (Staff only)
router.post('/create', 
  authenticateToken, 
  requireRole(['Resource Staff', 'Executive Admin']), 
  createWalkIn
);

// Get walk-in donations (Staff only)
router.get('/list', 
  authenticateToken, 
  requireRole(['Resource Staff', 'Executive Admin']), 
  getWalkInDonations
);

export default router;