import { query } from '../db.js';

/**
 * Calculate reserved quantity for a specific inventory item
 * Reserved = sum of quantities in Approved/Ongoing distribution plans
 * 
 * @param {number} inventoryId - The inventory item ID
 * @returns {Promise<number>} - Total reserved quantity
 */
export async function getReservedQuantity(inventoryId) {
    try {
        const result = await query(
            `SELECT COALESCE(SUM(dpi.quantity), 0) as reserved_quantity
             FROM DistributionPlanItems dpi
             JOIN DistributionPlans dp ON dpi.plan_id = dp.plan_id
             WHERE dpi.inventory_id = $1
             AND dp.status IN ('Approved', 'Ongoing')`,
            [inventoryId]
        );
        
        return parseInt(result.rows[0].reserved_quantity) || 0;
    } catch (error) {
        console.error('Error calculating reserved quantity:', error);
        return 0;
    }
}

/**
 * Calculate reserved quantities for multiple inventory items
 * 
 * @param {number[]} inventoryIds - Array of inventory item IDs
 * @returns {Promise<Object>} - Map of inventoryId to reserved quantity
 */
export async function getReservedQuantities(inventoryIds) {
    try {
        if (!inventoryIds || inventoryIds.length === 0) {
            return {};
        }

        const result = await query(
            `SELECT 
                dpi.inventory_id,
                COALESCE(SUM(dpi.quantity), 0) as reserved_quantity
             FROM DistributionPlanItems dpi
             JOIN DistributionPlans dp ON dpi.plan_id = dp.plan_id
             WHERE dpi.inventory_id = ANY($1)
             AND dp.status IN ('Approved', 'Ongoing')
             GROUP BY dpi.inventory_id`,
            [inventoryIds]
        );
        
        // Create map of inventory_id -> reserved_quantity
        const reservationMap = {};
        result.rows.forEach(row => {
            reservationMap[row.inventory_id] = parseInt(row.reserved_quantity) || 0;
        });
        
        // Fill in zeros for items with no reservations
        inventoryIds.forEach(id => {
            if (!(id in reservationMap)) {
                reservationMap[id] = 0;
            }
        });
        
        return reservationMap;
    } catch (error) {
        console.error('Error calculating reserved quantities:', error);
        return {};
    }
}

/**
 * Get truly available quantity (quantity_available - reserved)
 * 
 * @param {number} inventoryId - The inventory item ID
 * @returns {Promise<Object>} - Object with quantity_available, reserved_quantity, truly_available
 */
export async function getTrulyAvailableQuantity(inventoryId) {
    try {
        // Get current quantity
        const inventoryResult = await query(
            'SELECT quantity_available FROM Inventory WHERE inventory_id = $1',
            [inventoryId]
        );
        
        if (inventoryResult.rows.length === 0) {
            return {
                quantity_available: 0,
                reserved_quantity: 0,
                truly_available: 0
            };
        }
        
        const quantityAvailable = parseInt(inventoryResult.rows[0].quantity_available) || 0;
        const reservedQuantity = await getReservedQuantity(inventoryId);
        const trulyAvailable = Math.max(0, quantityAvailable - reservedQuantity);
        
        return {
            quantity_available: quantityAvailable,
            reserved_quantity: reservedQuantity,
            truly_available: trulyAvailable
        };
    } catch (error) {
        console.error('Error calculating truly available quantity:', error);
        return {
            quantity_available: 0,
            reserved_quantity: 0,
            truly_available: 0
        };
    }
}

/**
 * Check if sufficient unreserved inventory is available for distribution
 * 
 * @param {Array} items - Array of {inventory_id, quantity} objects
 * @returns {Promise<Object>} - {available: boolean, issues: Array}
 */
export async function checkInventoryAvailability(items) {
    try {
        const issues = [];
        
        for (const item of items) {
            const availability = await getTrulyAvailableQuantity(item.inventory_id);
            
            if (availability.truly_available < item.quantity) {
                // Get item details for better error message
                const itemDetails = await query(
                    `SELECT it.itemtype_name, i.quantity_available
                     FROM Inventory i
                     JOIN ItemType it ON i.itemtype_id = it.itemtype_id
                     WHERE i.inventory_id = $1`,
                    [item.inventory_id]
                );
                
                const itemName = itemDetails.rows[0]?.itemtype_name || 'Unknown item';
                
                issues.push({
                    inventory_id: item.inventory_id,
                    item_name: itemName,
                    requested: item.quantity,
                    total_in_stock: availability.quantity_available,
                    reserved: availability.reserved_quantity,
                    truly_available: availability.truly_available,
                    message: `Insufficient unreserved stock for ${itemName}. Requested: ${item.quantity}, Available: ${availability.truly_available} (${availability.reserved_quantity} reserved in other plans)`
                });
            }
        }
        
        return {
            available: issues.length === 0,
            issues: issues
        };
    } catch (error) {
        console.error('Error checking inventory availability:', error);
        return {
            available: false,
            issues: [{
                message: 'Error checking inventory availability: ' + error.message
            }]
        };
    }
}

/**
 * Get all items reserved in approved/ongoing distribution plans
 * Useful for viewing what's currently reserved
 * 
 * @returns {Promise<Array>} - Array of reserved items with details
 */
export async function getAllReservedItems() {
    try {
        const result = await query(
            `SELECT 
                dpi.inventory_id,
                it.itemtype_name,
                ic.category_name,
                SUM(dpi.quantity) as total_reserved,
                COUNT(DISTINCT dp.plan_id) as plan_count,
                i.quantity_available,
                i.quantity_available - SUM(dpi.quantity) as truly_available
             FROM DistributionPlanItems dpi
             JOIN DistributionPlans dp ON dpi.plan_id = dp.plan_id
             JOIN Inventory i ON dpi.inventory_id = i.inventory_id
             JOIN ItemType it ON i.itemtype_id = it.itemtype_id
             JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
             WHERE dp.status IN ('Approved', 'Ongoing')
             GROUP BY dpi.inventory_id, it.itemtype_name, ic.category_name, i.quantity_available
             ORDER BY ic.category_name, it.itemtype_name`
        );
        
        return result.rows.map(row => ({
            inventory_id: row.inventory_id,
            item_name: row.itemtype_name,
            category: row.category_name,
            total_reserved: parseInt(row.total_reserved),
            plan_count: parseInt(row.plan_count),
            quantity_available: parseInt(row.quantity_available),
            truly_available: Math.max(0, parseInt(row.truly_available))
        }));
    } catch (error) {
        console.error('Error getting all reserved items:', error);
        return [];
    }
}
