import { query } from '../db.js';
import { addToInventoryFromDonation, updateInventoryStatusFromDonation } from './inventoryControllers.js';

/**
 * Submit a new donation request
 */
export const submitDonationRequest = async (req, res) => {
    try {
        const { 
            items, 
            deliveryMethod, 
            description, 
            scheduleDate,
            appointmentTime 
        } = req.body;
        const userId = req.user.userId; // From auth middleware

        // Validate required fields
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one donation item is required'
            });
        }

        if (!deliveryMethod || !['pickup', 'dropoff'].includes(deliveryMethod)) {
            return res.status(400).json({
                success: false,
                message: 'Valid delivery method is required (pickup or dropoff)'
            });
        }

        // Validate items
        for (const item of items) {
            if (!item.itemType || !item.quantity || !item.value) {
                return res.status(400).json({
                    success: false,
                    message: 'All items must have itemType, quantity, and value'
                });
            }
        }

        // Start transaction
        await query('BEGIN');

        try {
            // Create appointment if scheduled
            let appointmentId = null;
            if (scheduleDate) {
                const appointmentQuery = `
                    INSERT INTO Appointments (appointment_date, appointment_time, description, status)
                    VALUES ($1, $2, $3, 'Scheduled')
                    RETURNING appointment_id
                `;
                const appointmentResult = await query(appointmentQuery, [
                    scheduleDate,
                    appointmentTime || '09:00:00',
                    `Donation ${deliveryMethod} - ${userId}`
                ]);
                appointmentId = appointmentResult.rows[0].appointment_id;
            }

            // Create donation request
            const donationQuery = `
                INSERT INTO DonationRequests (user_id, status, notes, delivery_method, appointment_id)
                VALUES ($1, 'Pending', $2, $3, $4)
                RETURNING donation_id
            `;
            const donationResult = await query(donationQuery, [
                userId,
                description || 'Donation request submitted online',
                deliveryMethod,
                appointmentId
            ]);

            const donationId = donationResult.rows[0].donation_id;

            // Insert donation items
            for (const item of items) {
                // Get itemtype_id from itemtype_name
                const itemTypeQuery = 'SELECT itemtype_id FROM ItemType WHERE itemtype_name = $1';
                const itemTypeResult = await query(itemTypeQuery, [item.itemType]);
                
                if (itemTypeResult.rows.length === 0) {
                    throw new Error(`Invalid item type: ${item.itemType}`);
                }

                const itemTypeId = itemTypeResult.rows[0].itemtype_id;

                const itemQuery = `
                    INSERT INTO DonationItems (donation_id, itemtype_id, quantity, declared_value, description)
                    VALUES ($1, $2, $3, $4, $5)
                `;
                await query(itemQuery, [
                    donationId,
                    itemTypeId,
                    item.quantity,
                    item.value,
                    item.description || null
                ]);
            }

            // Commit transaction
            await query('COMMIT');

            // Log activity
            const activityQuery = `
                INSERT INTO UserActivityLogs (user_id, action, description)
                VALUES ($1, 'donation_submitted', $2)
            `;
            await query(activityQuery, [
                userId,
                `Submitted donation request with ${items.length} item types (ID: ${donationId})`
            ]);

            res.status(201).json({
                success: true,
                data: {
                    donationId,
                    appointmentId,
                    status: 'Pending',
                    itemCount: items.length
                },
                message: 'Donation request submitted successfully'
            });

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error submitting donation request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit donation request',
            error: error.message
        });
    }
};

/**
 * Get donation requests for a specific donor
 */
export const getDonorDonations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status, limit = 10, offset = 0 } = req.query;

        let whereClause = 'WHERE dr.user_id = $1';
        let params = [userId];

        if (status) {
            whereClause += ' AND dr.status = $2';
            params.push(status);
        }

        const donationsQuery = `
            SELECT 
                dr.donation_id,
                dr.status,
                dr.notes,
                dr.delivery_method,
                dr.created_at,
                a.appointment_date,
                a.appointment_time,
                a.status as appointment_status,
                COUNT(di.item_id) as item_count,
                SUM(di.quantity) as total_quantity,
                SUM(di.declared_value) as total_value
            FROM DonationRequests dr
            LEFT JOIN Appointments a ON dr.appointment_id = a.appointment_id
            LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
            ${whereClause}
            GROUP BY dr.donation_id, dr.status, dr.notes, dr.delivery_method, dr.created_at,
                     a.appointment_date, a.appointment_time, a.status
            ORDER BY dr.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        
        params.push(limit, offset);
        const result = await query(donationsQuery, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: result.rows.length
            },
            message: 'Donation requests retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting donor donations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve donation requests',
            error: error.message
        });
    }
};

/**
 * Get donation request details with items
 */
export const getDonationDetails = async (req, res) => {
    try {
        const { donationId } = req.params;
        const userId = req.user.userId;

        // Get donation request details
        const donationQuery = `
            SELECT 
                dr.donation_id,
                dr.user_id,
                dr.status,
                dr.notes,
                dr.delivery_method,
                a.created_at as request_created_at,
                u.full_name as donor_name,
                u.email as donor_email,
                a.appointment_date,
                a.appointment_time,
                a.status as appointment_status,
                a.remarks as appointment_remarks
            FROM DonationRequests dr
            JOIN Users u ON dr.user_id = u.user_id
            LEFT JOIN Appointments a ON dr.appointment_id = a.appointment_id
            WHERE dr.donation_id = $1
        `;

        const donationResult = await query(donationQuery, [donationId]);

        if (donationResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Donation request not found'
            });
        }

        const donation = donationResult.rows[0];

        // Check if user has permission to view this donation
        // Allow donor to view their own, or staff/admin to view any
        const isOwner = donation.user_id === userId;
        const isStaffOrAdmin = req.user.role === 'Resource Staff' || req.user.role === 'Executive Admin';
        
        if (!isOwner && !isStaffOrAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this donation request'
            });
        }

        // Get donation items
        const itemsQuery = `
            SELECT 
                di.item_id,
                di.quantity,
                di.declared_value,
                di.description,
                di.date_added,
                it.itemtype_name,
                ic.category_name
            FROM DonationItems di
            JOIN ItemType it ON di.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE di.donation_id = $1
            ORDER BY ic.category_name, it.itemtype_name
        `;

        const itemsResult = await query(itemsQuery, [donationId]);

        res.json({
            success: true,
            data: {
                donation,
                items: itemsResult.rows,
                summary: {
                    totalItems: itemsResult.rows.length,
                    totalQuantity: itemsResult.rows.reduce((sum, item) => sum + item.quantity, 0),
                    totalValue: itemsResult.rows.reduce((sum, item) => sum + parseFloat(item.declared_value), 0)
                }
            },
            message: 'Donation details retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting donation details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve donation details',
            error: error.message
        });
    }
};

/**
 * Cancel a donation request (donor only, before approval)
 */
export const cancelDonationRequest = async (req, res) => {
    try {
        const { donationId } = req.params;
        const userId = req.user.userId;

        // Check if donation exists and belongs to user
        const checkQuery = `
            SELECT donation_id, status, user_id 
            FROM DonationRequests 
            WHERE donation_id = $1 AND user_id = $2
        `;
        const checkResult = await query(checkQuery, [donationId, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Donation request not found or you do not have permission to cancel it'
            });
        }

        const donation = checkResult.rows[0];

        // Only allow cancellation if still pending
        if (donation.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel donation request with status: ${donation.status}`
            });
        }

        // Update donation status
        const updateQuery = `
            UPDATE DonationRequests 
            SET status = 'Cancelled' 
            WHERE donation_id = $1
            RETURNING *
        `;
        await query(updateQuery, [donationId]);

        // Log activity
        const activityQuery = `
            INSERT INTO UserActivityLogs (user_id, action, description)
            VALUES ($1, 'donation_cancelled', $2)
        `;
        await query(activityQuery, [
            userId,
            `Cancelled donation request (ID: ${donationId})`
        ]);

        res.json({
            success: true,
            message: 'Donation request cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling donation request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel donation request',
            error: error.message
        });
    }
};

/**
 * Get all donation requests for staff/admin (with filtering and pagination)
 */
export const getAllDonationRequests = async (req, res) => {
    try {
        const { 
            status, 
            deliveryMethod, 
            dateFrom, 
            dateTo, 
            limit = 20, 
            offset = 0,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        // Build dynamic WHERE clause
        let whereConditions = [];
        let params = [];
        let paramCount = 1;

        if (status) {
            whereConditions.push(`dr.status = $${paramCount++}`);
            params.push(status);
        }

        if (deliveryMethod) {
            whereConditions.push(`dr.delivery_method = $${paramCount++}`);
            params.push(deliveryMethod);
        }

        if (dateFrom) {
            whereConditions.push(`DATE(a.appointment_date) >= $${paramCount++}`);
            params.push(dateFrom);
        }

        if (dateTo) {
            whereConditions.push(`DATE(a.appointment_date) <= $${paramCount++}`);
            params.push(dateTo);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Validate sort parameters - use appointment_date since DonationRequests doesn't have created_at
        const allowedSortFields = ['appointment_date', 'status', 'delivery_method', 'total_value', 'donation_id'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'appointment_date';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        // Main query
        const donationsQuery = `
            SELECT 
                dr.donation_id,
                dr.user_id,
                dr.status,
                dr.notes,
                dr.delivery_method,
                a.created_at as request_created_at,
                u.full_name as donor_name,
                u.email as donor_email,
                u.contact_num as donor_phone,
                a.appointment_date,
                a.appointment_time,
                a.status as appointment_status,
                COUNT(di.item_id) as item_count,
                SUM(di.quantity) as total_quantity,
                SUM(di.declared_value) as total_value,
                STRING_AGG(DISTINCT ic.category_name, ', ') as categories
            FROM DonationRequests dr
            JOIN Users u ON dr.user_id = u.user_id
            LEFT JOIN Appointments a ON dr.appointment_id = a.appointment_id
            LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
            LEFT JOIN ItemType it ON di.itemtype_id = it.itemtype_id
            LEFT JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            ${whereClause}
            GROUP BY dr.donation_id, dr.user_id, dr.status, dr.notes, dr.delivery_method, 
                     a.created_at, u.full_name, u.email, u.contact_num,
                     a.appointment_date, a.appointment_time, a.status
            ORDER BY ${validSortBy === 'total_value' ? 'total_value' : 
                      validSortBy === 'appointment_date' ? 'a.appointment_date' : 
                      validSortBy === 'donation_id' ? 'dr.donation_id' : 
                      `dr.${validSortBy}`} ${validSortOrder}
            LIMIT $${paramCount++} OFFSET $${paramCount++}
        `;

        params.push(limit, offset);
        const result = await query(donationsQuery, params);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(DISTINCT dr.donation_id) as total
            FROM DonationRequests dr
            JOIN Users u ON dr.user_id = u.user_id
            LEFT JOIN Appointments a ON dr.appointment_id = a.appointment_id
            LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
            LEFT JOIN ItemType it ON di.itemtype_id = it.itemtype_id
            LEFT JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            ${whereClause}
        `;

        const countResult = await query(countQuery, params.slice(0, -2)); // Remove limit and offset
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(total / limit),
                currentPage: Math.floor(offset / limit) + 1
            },
            message: 'Donation requests retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting all donation requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve donation requests',
            error: error.message
        });
    }
};

/**
 * Update donation request status (approve/reject/complete)
 */
export const updateDonationStatus = async (req, res) => {
    try {
        const { donationId } = req.params;
        const { status, remarks } = req.body;
        const staffUserId = req.user.userId;

        // Validate status
        const allowedStatuses = ['Approved', 'Rejected', 'Completed', 'In Progress'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
            });
        }

        // Check if donation exists
        const checkQuery = `
            SELECT dr.*, u.full_name as donor_name, u.email as donor_email
            FROM DonationRequests dr
            JOIN Users u ON dr.user_id = u.user_id
            WHERE dr.donation_id = $1
        `;
        const checkResult = await query(checkQuery, [donationId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Donation request not found'
            });
        }

        const donation = checkResult.rows[0];

        // Update donation status
        const updateQuery = `
            UPDATE DonationRequests 
            SET status = $1, notes = COALESCE($2, notes)
            WHERE donation_id = $3
            RETURNING *
        `;
        
        const updateResult = await query(updateQuery, [status, remarks, donationId]);

        // Handle inventory updates based on status change
        if (status === 'Approved') {
            try {
                await addToInventoryFromDonation(donationId, 'Reserved'); // Items expected but not received yet
                console.log(`Items from donation ${donationId} added to inventory with 'Reserved' status`);
            } catch (inventoryError) {
                console.error('Error adding items to inventory:', inventoryError);
            }
        } else if (status === 'Completed' && donation.status !== 'Completed') {
            try {
                // Update existing inventory items from Reserved to Available
                await updateInventoryStatusFromDonation(donationId, 'Available');
                console.log(`Items from donation ${donationId} status updated to 'Available' in inventory`);
            } catch (inventoryError) {
                console.error('Error updating inventory availability:', inventoryError);
            }
        }

        // Log the action
        const activityQuery = `
            INSERT INTO UserActivityLogs (user_id, action, description)
            VALUES ($1, 'donation_status_updated', $2)
        `;
        await query(activityQuery, [
            staffUserId,
            `Updated donation ${donationId} status to "${status}" for donor ${donation.donor_name}${
                status === 'Approved' ? ' - Items reserved in inventory' : 
                (status === 'Completed' && donation.status !== 'Completed') ? ' - Items available in inventory' : ''
            }`
        ]);

        // TODO: Send notification to donor about status change
        // You can integrate with your notification system here

        res.json({
            success: true,
            data: updateResult.rows[0],
            message: `Donation request ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error('Error updating donation status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update donation status',
            error: error.message
        });
    }
};

/**
 * Get donation statistics for dashboard
 */
export const getDonationStatistics = async (req, res) => {
    try {
        const { period = '30' } = req.query; // days

        // Overall statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count,
                COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_count,
                SUM(
                    CASE WHEN status IN ('Approved', 'Completed') 
                    THEN (
                        SELECT SUM(di.declared_value) 
                        FROM DonationItems di 
                        WHERE di.donation_id = dr.donation_id
                    ) 
                    ELSE 0 END
                ) as total_approved_value
            FROM DonationRequests dr 
            WHERE dr.created_at >= NOW() - INTERVAL '${parseInt(period)} days'
        `;

        const statsResult = await query(statsQuery);
        const stats = statsResult.rows[0];

        // Recent activity
        const recentQuery = `
            SELECT 
                dr.donation_id,
                dr.status,
                dr.created_at,
                u.full_name as donor_name,
                COUNT(di.item_id) as item_count,
                SUM(di.quantity) as total_quantity
            FROM DonationRequests dr
            JOIN Users u ON dr.user_id = u.user_id
            LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
            WHERE dr.created_at >= NOW() - INTERVAL '7 days'
            GROUP BY dr.donation_id, dr.status, dr.created_at, u.full_name
            ORDER BY dr.created_at DESC
            LIMIT 10
        `;

        const recentResult = await query(recentQuery);

        res.json({
            success: true,
            data: {
                statistics: {
                    ...stats,
                    total_approved_value: parseFloat(stats.total_approved_value) || 0
                },
                recent_donations: recentResult.rows,
                period_days: parseInt(period)
            },
            message: 'Donation statistics retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting donation statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve donation statistics',
            error: error.message
        });
    }
};

/**
 * Get all donation categories with their item types
 */
export const getDonationCategories = async (req, res) => {
    try {
        const categoriesQuery = `
            SELECT 
                ic.itemcategory_id as category_id,
                ic.category_name,
                ic.description,
                ARRAY_AGG(
                    CASE 
                        WHEN it.itemtype_name IS NOT NULL 
                        THEN it.itemtype_name 
                        ELSE NULL 
                    END
                ) FILTER (WHERE it.itemtype_name IS NOT NULL) as item_types
            FROM ItemCategory ic
            LEFT JOIN ItemType it ON ic.itemcategory_id = it.itemcategory_id
            GROUP BY ic.itemcategory_id, ic.category_name, ic.description
            ORDER BY ic.category_name
        `;
        
        const result = await query(categoriesQuery);
        
        res.json({
            success: true,
            data: result.rows,
            message: 'Donation categories fetched successfully'
        });
        
    } catch (error) {
        console.error('Error fetching donation categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donation categories',
            error: error.message
        });
    }
};

/**
 * Get item types for a specific category
 */
export const getItemTypesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const itemTypesQuery = `
            SELECT 
                itemtype_id as item_type_id,
                itemtype_name as item_type_name,
                itemcategory_id as category_id
            FROM ItemType 
            WHERE itemcategory_id = $1
            ORDER BY itemtype_name
        `;
        
        const result = await query(itemTypesQuery, [categoryId]);
        
        res.json({
            success: true,
            data: result.rows,
            message: 'Item types fetched successfully'
        });
        
    } catch (error) {
        console.error('Error fetching item types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch item types',
            error: error.message
        });
    }
};

/**
 * Create a new donation category
 */
export const createDonationCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;
        
        if (!categoryName) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }
        
        // Check if category already exists
        const existingQuery = 'SELECT itemcategory_id FROM ItemCategory WHERE LOWER(category_name) = LOWER($1)';
        const existing = await query(existingQuery, [categoryName]);
        
        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }
        
        // Create new category
        const insertQuery = `
            INSERT INTO ItemCategory (category_name, description) 
            VALUES ($1, $2) 
            RETURNING itemcategory_id as category_id, category_name, description
        `;
        
        const result = await query(insertQuery, [categoryName, description || null]);
        
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Donation category created successfully'
        });
        
    } catch (error) {
        console.error('Error creating donation category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create donation category',
            error: error.message
        });
    }
};

/**
 * Create a new item type for a category
 */
export const createItemType = async (req, res) => {
    try {
        const { categoryId, itemTypeName } = req.body;
        
        if (!categoryId || !itemTypeName) {
            return res.status(400).json({
                success: false,
                message: 'Category ID and item type name are required'
            });
        }
        
        // Check if category exists
        const categoryQuery = 'SELECT itemcategory_id FROM ItemCategory WHERE itemcategory_id = $1';
        const categoryExists = await query(categoryQuery, [categoryId]);
        
        if (categoryExists.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Category does not exist'
            });
        }
        
        // Check if item type already exists for this category
        const existingQuery = `
            SELECT itemtype_id 
            FROM ItemType 
            WHERE itemcategory_id = $1 AND LOWER(itemtype_name) = LOWER($2)
        `;
        const existing = await query(existingQuery, [categoryId, itemTypeName]);
        
        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Item type already exists for this category'
            });
        }
        
        // Create new item type
        const insertQuery = `
            INSERT INTO ItemType (itemcategory_id, itemtype_name) 
            VALUES ($1, $2) 
            RETURNING itemtype_id as item_type_id, itemcategory_id as category_id, itemtype_name as item_type_name
        `;
        
        const result = await query(insertQuery, [categoryId, itemTypeName]);
        
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Item type created successfully'
        });
        
    } catch (error) {
        console.error('Error creating item type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create item type',
            error: error.message
        });
    }
};

/**
 * Update a donation category
 */
export const updateDonationCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { categoryName, description } = req.body;
        
        if (!categoryName) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }
        
        // Check if category exists
        const existingQuery = 'SELECT itemcategory_id FROM ItemCategory WHERE itemcategory_id = $1';
        const existing = await query(existingQuery, [categoryId]);
        
        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Update category
        const updateQuery = `
            UPDATE ItemCategory 
            SET category_name = $1, description = $2 
            WHERE itemcategory_id = $3 
            RETURNING itemcategory_id as category_id, category_name, description
        `;
        
        const result = await query(updateQuery, [categoryName, description, categoryId]);
        
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Donation category updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating donation category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update donation category',
            error: error.message
        });
    }
};

/**
 * Delete a donation category
 */
export const deleteDonationCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        // Check if category has any item types
        const itemTypesQuery = 'SELECT COUNT(*) as count FROM ItemType WHERE itemcategory_id = $1';
        const itemTypesCount = await query(itemTypesQuery, [categoryId]);
        
        if (parseInt(itemTypesCount.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category that has item types. Delete item types first.'
            });
        }
        
        // Delete category
        const deleteQuery = 'DELETE FROM ItemCategory WHERE itemcategory_id = $1 RETURNING category_name';
        const result = await query(deleteQuery, [categoryId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            message: `Category "${result.rows[0].category_name}" deleted successfully`
        });
        
    } catch (error) {
        console.error('Error deleting donation category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete donation category',
            error: error.message
        });
    }
};

/**
 * Get calendar appointments for approved donations
 * - Donors: See only their own appointments
 * - Staff/Admin: See all appointments
 */
export const getCalendarAppointments = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        // Default to current month if no dates provided
        const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const end = endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
        
        // Build query with conditional WHERE clause based on user role
        let calendarQuery;
        let queryParams;
        
        if (userRole === 'Donor') {
            // Donors only see their own appointments
            calendarQuery = `
                SELECT 
                    dr.donation_id,
                    dr.delivery_method,
                    u.full_name as donor_name,
                    u.email as donor_email,
                    u.contact_num as donor_phone,
                    a.appointment_date,
                    a.appointment_time,
                    COUNT(di.item_id) as item_types,
                    SUM(di.quantity) as total_quantity,
                    SUM(di.declared_value) as total_value,
                    STRING_AGG(DISTINCT ic.category_name, ', ') as categories
                FROM DonationRequests dr
                JOIN Users u ON dr.user_id = u.user_id
                JOIN Appointments a ON dr.appointment_id = a.appointment_id
                LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
                LEFT JOIN ItemType it ON di.itemtype_id = it.itemtype_id
                LEFT JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
                WHERE dr.status IN ('Approved', 'Completed')
                  AND a.appointment_date IS NOT NULL
                  AND a.appointment_date BETWEEN $1 AND $2
                  AND dr.user_id = $3
                GROUP BY dr.donation_id, dr.delivery_method, u.full_name, u.email, u.contact_num,
                         a.appointment_date, a.appointment_time
                ORDER BY a.appointment_date, a.appointment_time
            `;
            queryParams = [start, end, userId];
        } else {
            // Staff and Admin see all appointments
            calendarQuery = `
                SELECT 
                    dr.donation_id,
                    dr.delivery_method,
                    u.full_name as donor_name,
                    u.email as donor_email,
                    u.contact_num as donor_phone,
                    a.appointment_date,
                    a.appointment_time,
                    COUNT(di.item_id) as item_types,
                    SUM(di.quantity) as total_quantity,
                    SUM(di.declared_value) as total_value,
                    STRING_AGG(DISTINCT ic.category_name, ', ') as categories
                FROM DonationRequests dr
                JOIN Users u ON dr.user_id = u.user_id
                JOIN Appointments a ON dr.appointment_id = a.appointment_id
                LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
                LEFT JOIN ItemType it ON di.itemtype_id = it.itemtype_id
                LEFT JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
                WHERE dr.status IN ('Approved', 'Completed')
                  AND a.appointment_date IS NOT NULL
                  AND a.appointment_date BETWEEN $1 AND $2
                GROUP BY dr.donation_id, dr.delivery_method, u.full_name, u.email, u.contact_num,
                         a.appointment_date, a.appointment_time
                ORDER BY a.appointment_date, a.appointment_time
            `;
            queryParams = [start, end];
        }
        
        const result = await query(calendarQuery, queryParams);
        
        // Transform to calendar event format
        const events = result.rows.map(row => ({
            id: `donation-${row.donation_id}`,
            title: `${row.donor_name} - ${row.delivery_method}`,
            date: row.appointment_date,
            time: row.appointment_time,
            type: row.delivery_method.toLowerCase(),
            deliveryMethod: row.delivery_method.toLowerCase(),
            location: row.delivery_method === 'pickup' ? 'LASAC Office' : 'Donor Location',
            status: 'approved',
            participants: 1,
            description: `${row.total_quantity} items (${row.item_types} types) - ${row.categories}`,
            donor: {
                name: row.donor_name,
                email: row.donor_email,
                phone: row.donor_phone
            },
            donation: {
                id: row.donation_id,
                totalValue: row.total_value,
                totalQuantity: row.total_quantity,
                categories: row.categories
            }
        }));
        
        res.json({
            success: true,
            data: {
                events,
                count: events.length,
                dateRange: { start, end }
            }
        });
        
    } catch (error) {
        console.error('Error fetching calendar appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch calendar appointments',
            error: error.message
        });
    }
};