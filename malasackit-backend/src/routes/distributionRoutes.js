import express from 'express';
import {
    createDistributionPlan,
    getAllDistributionPlans,
    getDistributionPlanById,
    updateDistributionPlanStatus,
    executeDistributionPlan,
    getDistributionLogs,
    getDistributionStatistics
} from '../controllers/distributionControllers.js';
import { 
    generateDistributionRecommendations,
    validateDistributionPlan,
    calculateDistributionMetrics,
    optimizeInventoryAllocation
} from '../services/distribution/distributionPlanningService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// === DISTRIBUTION PLAN ROUTES ===

// GET /api/distribution/plans - Get all distribution plans with filtering
router.get('/plans', requireRole(['Resource Staff', 'Executive Admin']), getAllDistributionPlans);

// POST /api/distribution/plans - Create a new distribution plan
router.post('/plans', requireRole(['Resource Staff', 'Executive Admin']), createDistributionPlan);

// GET /api/distribution/plans/statistics - Get distribution statistics
router.get('/plans/statistics', requireRole(['Resource Staff', 'Executive Admin']), getDistributionStatistics);

// GET /api/distribution/plans/:planId - Get specific distribution plan details
router.get('/plans/:planId', requireRole(['Resource Staff', 'Executive Admin']), getDistributionPlanById);

// PUT /api/distribution/plans/:planId/status - Update distribution plan status (approve/reject/cancel)
router.put('/plans/:planId/status', requireRole(['Executive Admin']), updateDistributionPlanStatus);

// POST /api/distribution/plans/:planId/execute - Execute distribution plan
router.post('/plans/:planId/execute', requireRole(['Resource Staff', 'Executive Admin']), executeDistributionPlan);

// === DISTRIBUTION PLANNING SERVICES ===

// POST /api/distribution/recommendations - Generate distribution recommendations
router.post('/recommendations', requireRole(['Resource Staff', 'Executive Admin']), async (req, res) => {
    try {
        const { requestIds } = req.body;
        
        if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request IDs array is required'
            });
        }

        const recommendations = await generateDistributionRecommendations(requestIds);
        
        res.json({
            success: true,
            data: recommendations.data,
            summary: recommendations.summary,
            message: 'Distribution recommendations generated successfully'
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate recommendations',
            error: error.message
        });
    }
});

// POST /api/distribution/validate-plan - Validate distribution plan
router.post('/validate-plan', requireRole(['Resource Staff', 'Executive Admin']), async (req, res) => {
    try {
        const { planItems } = req.body;
        
        if (!planItems || !Array.isArray(planItems)) {
            return res.status(400).json({
                success: false,
                message: 'Plan items array is required'
            });
        }

        const validation = await validateDistributionPlan(planItems);
        
        res.json({
            success: true,
            data: validation,
            message: 'Distribution plan validation completed'
        });
    } catch (error) {
        console.error('Error validating plan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate plan',
            error: error.message
        });
    }
});

// GET /api/distribution/metrics - Get distribution metrics and analytics
router.get('/metrics', requireRole(['Resource Staff', 'Executive Admin']), async (req, res) => {
    try {
        const { timeframe = 30 } = req.query;
        
        const metrics = await calculateDistributionMetrics(parseInt(timeframe));
        
        res.json({
            success: true,
            data: metrics,
            message: 'Distribution metrics retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve metrics',
            error: error.message
        });
    }
});

// POST /api/distribution/optimize-allocation - Optimize inventory allocation
router.post('/optimize-allocation', requireRole(['Resource Staff', 'Executive Admin']), async (req, res) => {
    try {
        const { planItems } = req.body;
        
        if (!planItems || !Array.isArray(planItems)) {
            return res.status(400).json({
                success: false,
                message: 'Plan items array is required'
            });
        }

        const optimization = await optimizeInventoryAllocation(planItems);
        
        res.json({
            success: true,
            data: optimization,
            message: 'Inventory allocation optimization completed'
        });
    } catch (error) {
        console.error('Error optimizing allocation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to optimize allocation',
            error: error.message
        });
    }
});

// === DISTRIBUTION LOGS ===

// GET /api/distribution/logs - Get distribution logs with filtering
router.get('/logs', requireRole(['Resource Staff', 'Executive Admin']), getDistributionLogs);

export default router;