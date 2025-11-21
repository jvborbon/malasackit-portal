import express from 'express';
import {
    getAllInventory,
    getInventoryStats,
    getInventoryItem,
    updateInventoryItem,
    removeFromInventory,
    getLowStockItems,
    getSafetyThresholds
} from '../controllers/inventoryControllers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../db.js';

const router = express.Router();

// GET /api/inventory - Get all inventory items with filtering and pagination
router.get('/', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), getAllInventory);

// GET /api/inventory/stats - Get inventory statistics for dashboard
router.get('/stats', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), getInventoryStats);

// GET /api/inventory/low-stock - Get items with low stock for alerts
router.get('/low-stock', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), getLowStockItems);

// GET /api/inventory/safety-thresholds - Get safety thresholds for all item types
router.get('/safety-thresholds', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), getSafetyThresholds);

// GET /api/inventory/categories - Get all categories for walk-in form
router.get('/categories', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), async (req, res) => {
    try {
        const result = await query('SELECT itemcategory_id, category_name FROM ItemCategory ORDER BY category_name');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
});

// GET /api/inventory/item-types - Get all item types for walk-in form
router.get('/item-types', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                it.itemtype_id, 
                it.itemtype_name, 
                it.avg_retail_price,
                ic.category_name
            FROM ItemType it
            LEFT JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            ORDER BY ic.category_name, it.itemtype_name
        `);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching item types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch item types'
        });
    }
});

// POST /api/inventory/initialize - Initialize inventory system (admin only)
router.post('/initialize', authenticateToken, requireRole(['Executive Admin']), async (req, res) => {
    try {
        const { initializeInventoryTable } = await import('../controllers/inventoryControllers.js');
        const success = await initializeInventoryTable();
        
        if (success) {
            res.json({
                success: true,
                message: 'Inventory system initialized successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to initialize inventory system'
            });
        }
    } catch (error) {
        console.error('Error initializing inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize inventory system',
            error: error.message
        });
    }
});

// GET /api/inventory/:inventoryId - Get specific inventory item details
router.get('/:inventoryId', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), getInventoryItem);

// PUT /api/inventory/:inventoryId - Update inventory item (quantity, location, status)
router.put('/:inventoryId', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), updateInventoryItem);

// POST /api/inventory/distribute - Remove items from inventory for distribution
router.post('/distribute', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), removeFromInventory);

// POST /api/inventory/fix-quantities - Fix doubled quantities (one-time fix)
router.post('/fix-quantities', authenticateToken, requireRole(['Executive Admin']), async (req, res) => {
    try {
        // Halve all current quantities since they were doubled
        const fixQuery = `
            UPDATE Inventory 
            SET 
                quantity_available = quantity_available / 2,
                total_fmv_value = total_fmv_value / 2,
                last_updated = CURRENT_TIMESTAMP
            WHERE quantity_available > 0
            RETURNING inventory_id, quantity_available, total_fmv_value
        `;
        
        const result = await query(fixQuery);
        
        res.json({
            success: true,
            message: `Fixed quantities for ${result.rows.length} inventory items`,
            fixed: result.rows
        });
        
    } catch (error) {
        console.error('Error fixing quantities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix inventory quantities',
            error: error.message
        });
    }
});

// POST /api/inventory/sync-approved - Sync all approved donations to inventory (one-time fix)
router.post('/sync-approved', authenticateToken, requireRole(['Executive Admin']), async (req, res) => {
    try {
        const { addToInventoryFromDonation } = await import('../controllers/inventoryControllers.js');
        
        // Get all approved donations that might not be in inventory
        const approvedDonationsQuery = `
            SELECT donation_id, status
            FROM DonationRequests 
            WHERE status IN ('Approved', 'Completed')
            ORDER BY donation_id
        `;
        
        const result = await query(approvedDonationsQuery);
        let syncCount = 0;
        
        for (const donation of result.rows) {
            try {
                const status = donation.status === 'Completed' ? 'Available' : 'Reserved';
                await addToInventoryFromDonation(donation.donation_id, status);
                syncCount++;
                console.log(`Synced donation ${donation.donation_id} to inventory`);
            } catch (error) {
                console.error(`Error syncing donation ${donation.donation_id}:`, error);
            }
        }
        
        res.json({
            success: true,
            message: `Successfully synced ${syncCount} donations to inventory`,
            synced: syncCount,
            total: result.rows.length
        });
        
    } catch (error) {
        console.error('Error syncing approved donations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync approved donations to inventory',
            error: error.message
        });
    }
});

export default router;