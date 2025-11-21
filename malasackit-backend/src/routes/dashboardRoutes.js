import express from 'express';
import {
  getStaffKPIMetrics,
  getAdminUserStatistics,
  getDonationAnalytics,
  getDistributionAnalytics
} from '../controllers/dashboardControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Staff KPI metrics
router.get('/staff/kpi', authenticateToken, getStaffKPIMetrics);

// Admin user statistics
router.get('/admin/users', authenticateToken, getAdminUserStatistics);

// Donation analytics
router.get('/donations/analytics', authenticateToken, getDonationAnalytics);

// Distribution analytics
router.get('/distributions/analytics', authenticateToken, getDistributionAnalytics);

export default router;