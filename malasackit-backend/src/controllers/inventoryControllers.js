import { query } from '../db.js';

/**
 * Initialize inventory table if it doesn't exist
 */
export const initializeInventoryTable = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS Inventory (
                inventory_id SERIAL PRIMARY KEY,
                itemtype_id INT REFERENCES ItemType(itemtype_id),
                quantity_available INT DEFAULT 0,
                total_fmv_value NUMERIC(12,2) DEFAULT 0.00,
                location VARCHAR(255),
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'Available'
                    CHECK (status IN ('Available', 'Low Stock', 'No Stock', 'Reserved', 'Bazaar'))
            );
        `;
        
        await query(createTableQuery);
        console.log('Inventory table initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing inventory table:', error);
        return false;
    }
};

/**
 * Get all inventory items with detailed information
 */
export const getAllInventory = async (req, res) => {
    try {
        const { category, status, search, page = 1, limit = 50 } = req.query;
        
        const offset = (page - 1) * limit;
        let whereConditions = [];
        let queryParams = [];
        let paramCount = 0;
        
        // Base query with joins
        let inventoryQuery = `
            SELECT 
                i.inventory_id,
                i.quantity_available,
                i.total_fmv_value,
                i.location,
                i.status,
                i.last_updated,
                it.itemtype_name,
                it.fmv_value as unit_fmv,
                ic.category_name,
                ic.description as category_description
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
        `;
        
        // Add search condition
        if (search) {
            whereConditions.push(`(it.itemtype_name ILIKE $${++paramCount} OR ic.category_name ILIKE $${paramCount})`);
            queryParams.push(`%${search}%`);
        }
        
        // Add category filter
        if (category) {
            whereConditions.push(`ic.itemcategory_id = $${++paramCount}`);
            queryParams.push(category);
        }
        
        // Add status filter
        if (status) {
            whereConditions.push(`i.status = $${++paramCount}`);
            queryParams.push(status);
        }
        
        // Add WHERE clause if conditions exist
        if (whereConditions.length > 0) {
            inventoryQuery += ` WHERE ${whereConditions.join(' AND ')}`;
        }
        
        // Add ordering and pagination
        inventoryQuery += ` ORDER BY ic.category_name, it.itemtype_name LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        queryParams.push(limit, offset);
        
        const result = await query(inventoryQuery, queryParams);
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
        `;
        
        if (whereConditions.length > 0) {
            countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
        }
        
        const countResult = await query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset params
        const totalItems = parseInt(countResult.rows[0].total);
        
        res.json({
            success: true,
            data: {
                inventory: result.rows,
                pagination: {
                    total: totalItems,
                    page: parseInt(page),
                    pages: Math.ceil(totalItems / limit),
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching inventory:', error);
        
        // Check if it's a table/column not found error
        if (error.code === '42703' || error.code === '42P01') {
            return res.status(500).json({
                success: false,
                message: 'Inventory system not initialized. Please contact administrator.',
                error: 'Database schema issue'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory',
            error: error.message
        });
    }
};

/**
 * Get inventory statistics/summary
 */
export const getInventoryStats = async (req, res) => {
    try {
        // Get total categories with items (handle empty inventory)
        const categoriesQuery = `
            SELECT COALESCE(COUNT(DISTINCT ic.itemcategory_id), 0) as total_categories
            FROM ItemCategory ic
            WHERE EXISTS (
                SELECT 1 FROM Inventory i 
                JOIN ItemType it ON i.itemtype_id = it.itemtype_id 
                WHERE it.itemcategory_id = ic.itemcategory_id 
                AND i.quantity_available > 0
            )
        `;
        
        // Get total products (item types with stock)
        const productsQuery = `
            SELECT COALESCE(COUNT(*), 0) as total_products
            FROM Inventory i
            WHERE i.quantity_available > 0
        `;
        
        // Get top donated items (most quantity)
        const topItemsQuery = `
            SELECT 
                it.itemtype_name,
                i.quantity_available
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            WHERE i.quantity_available > 0
            ORDER BY i.quantity_available DESC
            LIMIT 1
        `;
        
        // Get total stocks per category
        const stocksByCategoryQuery = `
            SELECT 
                ic.category_name,
                COALESCE(SUM(i.quantity_available), 0) as total_stock
            FROM ItemCategory ic
            LEFT JOIN ItemType it ON ic.itemcategory_id = it.itemcategory_id
            LEFT JOIN Inventory i ON it.itemtype_id = i.itemtype_id AND i.quantity_available > 0
            GROUP BY ic.itemcategory_id, ic.category_name
            HAVING COALESCE(SUM(i.quantity_available), 0) > 0
            ORDER BY total_stock DESC
        `;
        
        // Get total value
        const totalValueQuery = `
            SELECT COALESCE(SUM(i.total_fmv_value), 0) as total_value
            FROM Inventory i
            WHERE i.quantity_available > 0
        `;
        
        const [
            categoriesResult,
            productsResult,
            topItemsResult,
            stocksByCategoryResult,
            totalValueResult
        ] = await Promise.all([
            query(categoriesQuery),
            query(productsQuery),
            query(topItemsQuery),
            query(stocksByCategoryQuery),
            query(totalValueQuery)
        ]);
        
        const stats = {
            totalCategories: categoriesResult.rows[0].total_categories || 0,
            totalProducts: productsResult.rows[0].total_products || 0,
            topDonatedItem: topItemsResult.rows[0] ? 
                `${topItemsResult.rows[0].itemtype_name} (${topItemsResult.rows[0].quantity_available})` : 
                'N/A',
            stocksByCategory: stocksByCategoryResult.rows,
            totalValue: parseFloat(totalValueResult.rows[0].total_value || 0)
        };
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error fetching inventory statistics:', error);
        
        // Check if it's a table/column not found error
        if (error.code === '42703' || error.code === '42P01') {
            return res.json({
                success: true,
                data: {
                    totalCategories: 0,
                    totalProducts: 0,
                    topDonatedItem: 'N/A',
                    stocksByCategory: [],
                    totalValue: 0
                }
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory statistics',
            error: error.message
        });
    }
};

/**
 * Get specific inventory item details
 */
export const getInventoryItem = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        
        const itemQuery = `
            SELECT 
                i.inventory_id,
                i.quantity_available,
                i.total_fmv_value,
                i.location,
                i.status,
                i.last_updated,
                it.itemtype_id,
                it.itemtype_name,
                it.fmv_value as unit_fmv,
                ic.itemcategory_id,
                ic.category_name,
                ic.description as category_description
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE i.inventory_id = $1
        `;
        
        const result = await query(itemQuery, [inventoryId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory item'
        });
    }
};

/**
 * Update inventory item quantities and status
 */
export const updateInventoryItem = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const { quantity_available, location, status, notes } = req.body;
        
        // Validate inventory item exists
        const existsQuery = 'SELECT inventory_id, itemtype_id FROM Inventory WHERE inventory_id = $1';
        const existsResult = await query(existsQuery, [inventoryId]);
        
        if (existsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }
        
        const itemTypeId = existsResult.rows[0].itemtype_id;
        
        // Get unit FMV value for calculations
        const fmvQuery = 'SELECT fmv_value FROM ItemType WHERE itemtype_id = $1';
        const fmvResult = await query(fmvQuery, [itemTypeId]);
        const unitFmv = parseFloat(fmvResult.rows[0].fmv_value || 0);
        
        // Calculate new total FMV value
        const newTotalValue = quantity_available * unitFmv;
        
        // Determine status based on quantity if not provided
        let newStatus = status;
        if (!newStatus) {
            if (quantity_available === 0) {
                newStatus = 'No Stock';
            } else if (quantity_available <= 10) { // Low stock threshold
                newStatus = 'Low Stock';
            } else {
                newStatus = 'Available';
            }
        }
        
        const updateQuery = `
            UPDATE Inventory 
            SET 
                quantity_available = $1,
                total_fmv_value = $2,
                location = COALESCE($3, location),
                status = $4,
                last_updated = CURRENT_TIMESTAMP
            WHERE inventory_id = $5
            RETURNING *
        `;
        
        const result = await query(updateQuery, [
            quantity_available,
            newTotalValue,
            location,
            newStatus,
            inventoryId
        ]);
        
        res.json({
            success: true,
            message: 'Inventory item updated successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update inventory item'
        });
    }
};

/**
 * Add items to inventory from donations
 * This function is called when donations are approved or completed
 */
export const addToInventoryFromDonation = async (donationId, inventoryStatus = 'Available') => {
    try {
        console.log(`Adding donation ${donationId} items to inventory with status: ${inventoryStatus}`);
        
        // Check if items from this donation are already in inventory
        const existingDonationCheck = `
            SELECT COUNT(*) as existing_count
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN DonationItems di ON it.itemtype_id = di.itemtype_id
            WHERE di.donation_id = $1
        `;
        
        const existingResult = await query(existingDonationCheck, [donationId]);
        const hasExistingItems = parseInt(existingResult.rows[0].existing_count) > 0;
        
        if (hasExistingItems && inventoryStatus === 'Reserved') {
            console.log(`Donation ${donationId} items already exist in inventory. Skipping duplicate addition.`);
            return true;
        }
        
        // Get donation items
        const donationItemsQuery = `
            SELECT 
                di.itemtype_id,
                di.quantity,
                di.declared_value,
                it.fmv_value,
                it.itemtype_name
            FROM DonationItems di
            JOIN ItemType it ON di.itemtype_id = it.itemtype_id
            WHERE di.donation_id = $1
        `;
        
        const donationItemsResult = await query(donationItemsQuery, [donationId]);
        
        console.log(`Found ${donationItemsResult.rows.length} items for donation ${donationId}:`, donationItemsResult.rows);
        
        if (donationItemsResult.rows.length === 0) {
            console.log(`No items found for donation ${donationId}`);
            return false;
        }
        
        for (const item of donationItemsResult.rows) {
            const { itemtype_id, quantity, declared_value, fmv_value, itemtype_name } = item;
            console.log(`Processing item: ${itemtype_name} (ID: ${itemtype_id}), Quantity: ${quantity}`);
            
            // Use declared value if available, otherwise use FMV
            let valueToUse;
            if (declared_value && parseFloat(declared_value) > 0) {
                valueToUse = parseFloat(declared_value);
            } else if (fmv_value && parseFloat(fmv_value) > 0) {
                valueToUse = parseFloat(fmv_value) * quantity;
            } else {
                valueToUse = 0; // Default fallback value
            }
            
            console.log(`Value calculation - Declared: ${declared_value}, FMV: ${fmv_value}, Final: ${valueToUse}`);
            
            // Check if inventory entry exists for this item type
            const existingQuery = 'SELECT inventory_id, quantity_available, total_fmv_value FROM Inventory WHERE itemtype_id = $1';
            const existingResult = await query(existingQuery, [itemtype_id]);
            
            if (existingResult.rows.length > 0) {
                // Update existing inventory
                const existing = existingResult.rows[0];
                const newQuantity = existing.quantity_available + quantity;
                const newTotalValue = parseFloat(existing.total_fmv_value) + valueToUse;
                
                // Use provided status, but override with quantity-based status if needed
                let finalStatus = inventoryStatus;
                if (inventoryStatus === 'Available') {
                    if (newQuantity === 0) {
                        finalStatus = 'No Stock';
                    } else if (newQuantity <= 10) {
                        finalStatus = 'Low Stock';
                    }
                }
                
                const updateQuery = `
                    UPDATE Inventory 
                    SET 
                        quantity_available = $1,
                        total_fmv_value = $2,
                        status = $3,
                        last_updated = CURRENT_TIMESTAMP
                    WHERE inventory_id = $4
                `;
                
                console.log(`Updating inventory: Quantity=${newQuantity}, Value=${newTotalValue}, Status=${finalStatus}`);
                await query(updateQuery, [newQuantity, newTotalValue, finalStatus, existing.inventory_id]);
            } else {
                // Create new inventory entry
                let finalStatus = inventoryStatus;
                if (inventoryStatus === 'Available') {
                    finalStatus = quantity <= 10 ? 'Low Stock' : 'Available';
                }
                
                const insertQuery = `
                    INSERT INTO Inventory (itemtype_id, quantity_available, total_fmv_value, location, status)
                    VALUES ($1, $2, $3, $4, $5)
                `;
                
                console.log(`Inserting new inventory: ItemType=${itemtype_id}, Quantity=${quantity}, Value=${valueToUse}, Status=${finalStatus}`);
                await query(insertQuery, [
                    itemtype_id,
                    quantity,
                    valueToUse,
                    'LASAC Warehouse', // default location
                    finalStatus
                ]);
            }
        }
        
        console.log(`Successfully added donation ${donationId} items to inventory`);
        return true;
        
    } catch (error) {
        console.error('Error adding items to inventory:', error);
        throw error;
    }
};

/**
 * Update inventory status for items from a specific donation
 * Used when donation status changes from Approved to Completed
 */
export const updateInventoryStatusFromDonation = async (donationId, newStatus = 'Available') => {
    try {
        console.log(`Updating inventory status for donation ${donationId} to: ${newStatus}`);
        
        // Get the item types from the donation
        const donationItemsQuery = `
            SELECT DISTINCT di.itemtype_id
            FROM DonationItems di
            WHERE di.donation_id = $1
        `;
        
        const donationItemsResult = await query(donationItemsQuery, [donationId]);
        
        for (const item of donationItemsResult.rows) {
            const { itemtype_id } = item;
            
            // Update inventory status for this item type
            const updateQuery = `
                UPDATE Inventory 
                SET 
                    status = $1,
                    last_updated = CURRENT_TIMESTAMP
                WHERE itemtype_id = $2 AND status = 'Reserved'
                RETURNING inventory_id, quantity_available
            `;
            
            const updateResult = await query(updateQuery, [newStatus, itemtype_id]);
            
            if (updateResult.rows.length > 0) {
                const updated = updateResult.rows[0];
                console.log(`Updated inventory item ${itemtype_id}: ${updated.quantity_available} items now ${newStatus}`);
                
                // Update status based on quantity if changing to Available
                if (newStatus === 'Available') {
                    let finalStatus = 'Available';
                    if (updated.quantity_available === 0) {
                        finalStatus = 'No Stock';
                    } else if (updated.quantity_available <= 10) {
                        finalStatus = 'Low Stock';
                    }
                    
                    if (finalStatus !== 'Available') {
                        await query(
                            'UPDATE Inventory SET status = $1 WHERE inventory_id = $2',
                            [finalStatus, updated.inventory_id]
                        );
                    }
                }
            }
        }
        
        console.log(`Successfully updated inventory status for donation ${donationId}`);
        return true;
        
    } catch (error) {
        console.error('Error updating inventory status:', error);
        throw error;
    }
};

/**
 * Remove items from inventory (for distributions)
 */
export const removeFromInventory = async (req, res) => {
    try {
        const { items } = req.body; // Array of {itemtype_id, quantity}
        
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items array is required'
            });
        }
        
        // Validate all items have sufficient stock first
        for (const item of items) {
            const { itemtype_id, quantity } = item;
            
            const stockQuery = 'SELECT quantity_available FROM Inventory WHERE itemtype_id = $1';
            const stockResult = await query(stockQuery, [itemtype_id]);
            
            if (stockResult.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `No inventory found for item type ${itemtype_id}`
                });
            }
            
            const availableQuantity = stockResult.rows[0].quantity_available;
            if (availableQuantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for item type ${itemtype_id}. Available: ${availableQuantity}, Requested: ${quantity}`
                });
            }
        }
        
        // Process removals
        const updates = [];
        for (const item of items) {
            const { itemtype_id, quantity } = item;
            
            // Get current inventory details
            const currentQuery = `
                SELECT 
                    i.inventory_id,
                    i.quantity_available,
                    i.total_fmv_value,
                    it.fmv_value
                FROM Inventory i
                JOIN ItemType it ON i.itemtype_id = it.itemtype_id
                WHERE i.itemtype_id = $1
            `;
            
            const currentResult = await query(currentQuery, [itemtype_id]);
            const current = currentResult.rows[0];
            
            const newQuantity = current.quantity_available - quantity;
            const valuePerUnit = current.total_fmv_value / current.quantity_available;
            const newTotalValue = Math.max(0, current.total_fmv_value - (valuePerUnit * quantity));
            
            // Determine new status
            let newStatus = 'Available';
            if (newQuantity === 0) {
                newStatus = 'No Stock';
            } else if (newQuantity <= 10) {
                newStatus = 'Low Stock';
            }
            
            const updateQuery = `
                UPDATE Inventory 
                SET 
                    quantity_available = $1,
                    total_fmv_value = $2,
                    status = $3,
                    last_updated = CURRENT_TIMESTAMP
                WHERE inventory_id = $4
                RETURNING *
            `;
            
            const updateResult = await query(updateQuery, [
                newQuantity,
                newTotalValue,
                newStatus,
                current.inventory_id
            ]);
            
            updates.push(updateResult.rows[0]);
        }
        
        res.json({
            success: true,
            message: 'Items removed from inventory successfully',
            data: updates
        });
        
    } catch (error) {
        console.error('Error removing items from inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove items from inventory'
        });
    }
};

/**
 * Get low stock items (for alerts)
 */
export const getLowStockItems = async (req, res) => {
    try {
        const { threshold = 10 } = req.query;
        
        const lowStockQuery = `
            SELECT 
                i.inventory_id,
                i.quantity_available,
                i.total_fmv_value,
                i.status,
                it.itemtype_name,
                ic.category_name
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE i.quantity_available <= $1 AND i.quantity_available > 0
            ORDER BY i.quantity_available ASC, ic.category_name, it.itemtype_name
        `;
        
        const result = await query(lowStockQuery, [threshold]);
        
        res.json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch low stock items'
        });
    }
};