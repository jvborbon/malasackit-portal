import { query } from '../db.js';

/**
 * Create a new distribution plan
 */
export const createDistributionPlan = async (req, res) => {
    try {
        console.log('=== CREATE DISTRIBUTION PLAN DEBUG ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.user?.userId);
        
        const {
            request_id,
            planned_date,
            items, // Array of {inventory_id, quantity, allocated_value, notes}
            remarks
        } = req.body;
        const createdBy = req.user.userId;

        // Validate required fields
        console.log('Validation check - request_id:', request_id, 'items length:', items?.length);
        if (!request_id || !items || items.length === 0) {
            console.log('Validation failed: missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Request ID and items are required'
            });
        }
        console.log('Basic validation passed');

        // Check if request exists and is approved
        console.log('Checking beneficiary request:', request_id);
        const requestCheck = await query(
            'SELECT * FROM BeneficiaryRequests WHERE request_id = $1',
            [request_id]
        );
        console.log('Request check result:', requestCheck.rows.length > 0 ? requestCheck.rows[0] : 'NOT FOUND');

        if (requestCheck.rows.length === 0) {
            console.log('Error: Beneficiary request not found');
            return res.status(404).json({
                success: false,
                message: 'Beneficiary request not found'
            });
        }

        console.log('Request status:', requestCheck.rows[0].status);
        if (requestCheck.rows[0].status !== 'Approved') {
            console.log('Error: Request not approved, status is:', requestCheck.rows[0].status);
            return res.status(400).json({
                success: false,
                message: 'Can only create distribution plans for approved requests'
            });
        }
        console.log('Request validation passed');

        // Check if a plan already exists for this request
        console.log('Checking for existing plans for request:', request_id);
        const existingPlan = await query(
            'SELECT plan_id FROM DistributionPlans WHERE request_id = $1',
            [request_id]
        );
        console.log('Existing plans found:', existingPlan.rows.length);

        if (existingPlan.rows.length > 0) {
            console.log('Distribution plan already exists:', existingPlan.rows[0].plan_id);
            
            // Get the existing plan details to check its status
            const existingPlanDetails = await getDistributionPlanDetails(existingPlan.rows[0].plan_id);
            console.log('Existing plan status:', existingPlanDetails.status);
            
            // Return info about existing plan instead of creating duplicate
            console.log('Returning existing plan info instead of creating duplicate');
            return res.status(200).json({
                success: true,
                data: existingPlanDetails,
                message: `Distribution plan already exists for this request (Status: ${existingPlanDetails.status})`,
                isExisting: true
            });
        }
        console.log('No existing plans, proceeding to create new one');

        // Start transaction
        await query('BEGIN');

        try {
            // Create the distribution plan
            const planResult = await query(
                `INSERT INTO DistributionPlans (request_id, planned_date, created_by, remarks)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [request_id, planned_date, createdBy, remarks]
            );

            const planId = planResult.rows[0].plan_id;

            // Validate inventory availability and create plan items
            for (const item of items) {
                const { inventory_id, quantity, notes } = item;

                // Check inventory availability and get item details
                const inventoryCheck = await query(
                    `SELECT i.quantity_available, it.avg_retail_price 
                     FROM Inventory i
                     JOIN ItemType it ON i.itemtype_id = it.itemtype_id
                     WHERE i.inventory_id = $1`,
                    [inventory_id]
                );

                if (inventoryCheck.rows.length === 0) {
                    throw new Error(`Inventory item ${inventory_id} not found`);
                }

                const { quantity_available, avg_retail_price } = inventoryCheck.rows[0];

                if (quantity_available < quantity) {
                    throw new Error(`Insufficient stock for inventory item ${inventory_id}. Available: ${quantity_available}, Requested: ${quantity}`);
                }

                // Calculate allocated value based on quantity and unit price
                const calculatedAllocatedValue = parseFloat(avg_retail_price) * quantity;

                // Create plan item with calculated value
                await query(
                    `INSERT INTO DistributionPlanItems (plan_id, inventory_id, quantity, allocated_value, notes)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [planId, inventory_id, quantity, calculatedAllocatedValue, notes]
                );
            }

            await query('COMMIT');

            // Fetch the complete plan with items
            const completePlan = await getDistributionPlanDetails(planId);

            res.status(201).json({
                success: true,
                data: completePlan,
                message: 'Distribution plan created successfully'
            });

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error creating distribution plan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create distribution plan',
            error: error.message
        });
    }
};

/**
 * Get all distribution plans with filtering and pagination
 */
export const getAllDistributionPlans = async (req, res) => {
    try {
        const {
            status,
            dateFrom,
            dateTo,
            year,
            month,
            search,
            created_by,
            limit = 20,
            offset = 0,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        let whereConditions = [];
        let params = [];
        let paramCount = 1;

        if (status) {
            whereConditions.push(`dp.status = $${paramCount++}`);
            params.push(status);
        }

        if (created_by) {
            whereConditions.push(`dp.created_by = $${paramCount++}`);
            params.push(created_by);
        }

        // Handle search
        if (search) {
            whereConditions.push(`(
                b.name ILIKE $${paramCount} OR 
                br.purpose ILIKE $${paramCount} OR 
                dp.plan_id::text ILIKE $${paramCount} OR
                u1.full_name ILIKE $${paramCount}
            )`);
            params.push(`%${search}%`);
            paramCount++;
        }

        // Handle year and month filters
        if (year) {
            whereConditions.push(`EXTRACT(YEAR FROM dp.planned_date) = $${paramCount++}`);
            params.push(parseInt(year));
        }

        if (month) {
            whereConditions.push(`EXTRACT(MONTH FROM dp.planned_date) = $${paramCount++}`);
            params.push(parseInt(month));
        }

        // Handle legacy date range filters
        if (dateFrom) {
            whereConditions.push(`DATE(dp.created_at) >= $${paramCount++}`);
            params.push(dateFrom);
        }

        if (dateTo) {
            whereConditions.push(`DATE(dp.created_at) <= $${paramCount++}`);
            params.push(dateTo);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Validate sort column
        const sortColumnMap = {
            'created_at': 'dp.created_at',
            'planned_date': 'dp.planned_date',
            'distribution_date': 'dp.planned_date',
            'status': 'dp.status',
            'beneficiary_name': 'b.name'
        };
        const validSortBy = sortColumnMap[sortBy] || 'dp.created_at';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        const plansQuery = `
            SELECT dp.*,
                   br.purpose,
                   br.urgency,
                   b.name as beneficiary_name,
                   b.type as beneficiary_type,
                   b.address as beneficiary_address,
                   u1.full_name as created_by_name,
                   u2.full_name as approved_by_name,
                   COUNT(dpi.plan_item_id) as total_items,
                   SUM(dpi.allocated_value) as total_allocated_value
            FROM DistributionPlans dp
            JOIN BeneficiaryRequests br ON dp.request_id = br.request_id
            JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
            LEFT JOIN Users u1 ON dp.created_by = u1.user_id
            LEFT JOIN Users u2 ON dp.approved_by = u2.user_id
            LEFT JOIN DistributionPlanItems dpi ON dp.plan_id = dpi.plan_id
            ${whereClause}
            GROUP BY dp.plan_id, br.purpose, br.urgency, b.name, b.type, b.address, 
                     u1.full_name, u2.full_name
            ORDER BY ${validSortBy} ${validSortOrder}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;

        params.push(limit, offset);

        const countQuery = `
            SELECT COUNT(DISTINCT dp.plan_id) as total
            FROM DistributionPlans dp
            JOIN BeneficiaryRequests br ON dp.request_id = br.request_id
            JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
            LEFT JOIN Users u1 ON dp.created_by = u1.user_id
            ${whereClause}
        `;

        const [plansResult, countResult] = await Promise.all([
            query(plansQuery, params),
            query(countQuery, params.slice(0, -2))
        ]);

        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: plansResult.rows,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(total / limit),
                currentPage: Math.floor(offset / limit) + 1
            },
            message: 'Distribution plans retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting distribution plans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve distribution plans',
            error: error.message
        });
    }
};

/**
 * Get distribution plan by ID with complete details
 */
export const getDistributionPlanById = async (req, res) => {
    try {
        const { planId } = req.params;

        const planDetails = await getDistributionPlanDetails(planId);

        if (!planDetails) {
            return res.status(404).json({
                success: false,
                message: 'Distribution plan not found'
            });
        }

        res.json({
            success: true,
            data: planDetails,
            message: 'Distribution plan retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting distribution plan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve distribution plan',
            error: error.message
        });
    }
};

/**
 * Helper function to get complete distribution plan details
 */
async function getDistributionPlanDetails(planId) {
    const planQuery = `
        SELECT dp.*,
               br.beneficiary_id,
               br.purpose,
               br.urgency,
               br.notes as request_notes,
               b.name as beneficiary_name,
               b.type as beneficiary_type,
               b.contact_person,
               b.phone as beneficiary_phone,
               b.email as beneficiary_email,
               b.address as beneficiary_address,
               u1.full_name as created_by_name,
               u2.full_name as approved_by_name
        FROM DistributionPlans dp
        JOIN BeneficiaryRequests br ON dp.request_id = br.request_id
        JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
        LEFT JOIN Users u1 ON dp.created_by = u1.user_id
        LEFT JOIN Users u2 ON dp.approved_by = u2.user_id
        WHERE dp.plan_id = $1
    `;

    const itemsQuery = `
        SELECT dpi.*,
               i.itemtype_id,
               i.location,
               i.status as inventory_status,
               it.itemtype_name,
               ic.category_name
        FROM DistributionPlanItems dpi
        JOIN Inventory i ON dpi.inventory_id = i.inventory_id
        JOIN ItemType it ON i.itemtype_id = it.itemtype_id
        JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
        WHERE dpi.plan_id = $1
        ORDER BY ic.category_name, it.itemtype_name
    `;

    const [planResult, itemsResult] = await Promise.all([
        query(planQuery, [planId]),
        query(itemsQuery, [planId])
    ]);

    if (planResult.rows.length === 0) {
        return null;
    }

    const plan = planResult.rows[0];
    plan.items = itemsResult.rows;
    plan.total_items = itemsResult.rows.length;
    plan.total_allocated_value = itemsResult.rows.reduce((sum, item) => sum + parseFloat(item.allocated_value || 0), 0);

    return plan;
}

/**
 * Update distribution plan status (approve/reject)
 */
export const updateDistributionPlanStatus = async (req, res) => {
    try {
        const { planId } = req.params;
        const { status, remarks } = req.body;
        const approvedBy = req.user.userId;

        // Validate status
        const allowedStatuses = ['Draft', 'Approved', 'Ongoing', 'Completed', 'Cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Allowed values: ' + allowedStatuses.join(', ')
            });
        }

        // Get current plan
        const currentPlan = await query(
            'SELECT * FROM DistributionPlans WHERE plan_id = $1',
            [planId]
        );

        if (currentPlan.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Distribution plan not found'
            });
        }

        let updateFields = ['status = $1', 'remarks = COALESCE($2, remarks)', 'updated_at = CURRENT_TIMESTAMP'];
        let params = [status, remarks];

        // Add approval fields if approving
        if (status === 'Approved') {
            updateFields.push('approved_by = $3', 'approved_at = CURRENT_TIMESTAMP');
            params.push(approvedBy);
        }

        // Add planId as the last parameter
        params.push(planId);
        const planIdParamIndex = params.length;

        const updateQuery = `
            UPDATE DistributionPlans 
            SET ${updateFields.join(', ')}
            WHERE plan_id = $${planIdParamIndex}
            RETURNING *
        `;

        const result = await query(updateQuery, params);

        res.json({
            success: true,
            data: result.rows[0],
            message: `Distribution plan ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error('Error updating distribution plan status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update distribution plan status',
            error: error.message
        });
    }
};

/**
 * Execute distribution plan (distribute items to beneficiaries)
 */
export const executeDistributionPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const { distribution_date, distributed_by_override, execution_notes } = req.body;
        const distributedBy = distributed_by_override || req.user.userId;

        // Get plan details
        const planDetails = await getDistributionPlanDetails(planId);

        if (!planDetails) {
            return res.status(404).json({
                success: false,
                message: 'Distribution plan not found'
            });
        }

        if (planDetails.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Can only execute approved distribution plans'
            });
        }

        // Start transaction
        await query('BEGIN');

        try {
            // Update plan status to ongoing
            await query(
                'UPDATE DistributionPlans SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE plan_id = $2',
                ['Ongoing', planId]
            );

            // Process each item in the distribution plan
            for (const item of planDetails.items) {
                // Check current inventory availability
                const inventoryCheck = await query(
                    'SELECT quantity_available FROM Inventory WHERE inventory_id = $1',
                    [item.inventory_id]
                );

                if (inventoryCheck.rows.length === 0 || inventoryCheck.rows[0].quantity_available < item.quantity) {
                    throw new Error(`Insufficient inventory for item ${item.itemtype_name}. Available: ${inventoryCheck.rows[0]?.quantity_available || 0}, Required: ${item.quantity}`);
                }

                // Create distribution log entry
                await query(
                    `INSERT INTO DistributionLogs (plan_id, beneficiary_id, itemtype_id, quantity_distributed, distribution_date, distributed_by, remarks)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        planId,
                        planDetails.beneficiary_id,
                        item.itemtype_id,
                        item.quantity,
                        distribution_date || new Date(),
                        distributedBy,
                        execution_notes || item.notes
                    ]
                );

                // Get current inventory details for value calculation
                const currentInventory = await query(
                    'SELECT quantity_available, total_fmv_value FROM Inventory WHERE inventory_id = $1',
                    [item.inventory_id]
                );

                if (currentInventory.rows.length > 0) {
                    const { quantity_available: currentQty, total_fmv_value: currentValue } = currentInventory.rows[0];
                    
                    // Calculate the value per unit
                    const valuePerUnit = currentQty > 0 ? parseFloat(currentValue) / currentQty : 0;
                    
                    // Calculate the value to deduct
                    const valueToDeduct = valuePerUnit * item.quantity;
                    
                    // Update inventory - reduce both quantity and value
                    await query(
                        `UPDATE Inventory 
                         SET quantity_available = quantity_available - $1,
                             total_fmv_value = GREATEST(0, total_fmv_value - $2),
                             last_updated = CURRENT_TIMESTAMP
                         WHERE inventory_id = $3`,
                        [item.quantity, valueToDeduct, item.inventory_id]
                    );
                }

                // Update inventory status if quantity reaches zero
                await query(
                    `UPDATE Inventory 
                     SET status = CASE 
                         WHEN quantity_available <= 0 THEN 'No Stock'
                         WHEN quantity_available <= 10 THEN 'Low Stock'
                         ELSE status 
                     END
                     WHERE inventory_id = $1`,
                    [item.inventory_id]
                );
            }

            // Update plan status to completed
            await query(
                'UPDATE DistributionPlans SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE plan_id = $2',
                ['Completed', planId]
            );

            // Update beneficiary request status to fulfilled
            await query(
                'UPDATE BeneficiaryRequests SET status = $1 WHERE request_id = $2',
                ['Fulfilled', planDetails.request_id]
            );

            await query('COMMIT');

            // Get updated plan details
            const updatedPlan = await getDistributionPlanDetails(planId);

            res.json({
                success: true,
                data: updatedPlan,
                message: 'Distribution plan executed successfully'
            });

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error executing distribution plan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to execute distribution plan',
            error: error.message
        });
    }
};

/**
 * Get distribution logs with filtering
 */
export const getDistributionLogs = async (req, res) => {
    try {
        const {
            plan_id,
            beneficiary_id,
            itemtype_id,
            dateFrom,
            dateTo,
            limit = 20,
            offset = 0,
            sortBy = 'distribution_date',
            sortOrder = 'DESC'
        } = req.query;

        let whereConditions = [];
        let params = [];
        let paramCount = 1;

        if (plan_id) {
            whereConditions.push(`dl.plan_id = $${paramCount++}`);
            params.push(plan_id);
        }

        if (beneficiary_id) {
            whereConditions.push(`dl.beneficiary_id = $${paramCount++}`);
            params.push(beneficiary_id);
        }

        if (itemtype_id) {
            whereConditions.push(`dl.itemtype_id = $${paramCount++}`);
            params.push(itemtype_id);
        }

        if (dateFrom) {
            whereConditions.push(`DATE(dl.distribution_date) >= $${paramCount++}`);
            params.push(dateFrom);
        }

        if (dateTo) {
            whereConditions.push(`DATE(dl.distribution_date) <= $${paramCount++}`);
            params.push(dateTo);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const logsQuery = `
            SELECT dl.*,
                   b.name as beneficiary_name,
                   b.type as beneficiary_type,
                   it.itemtype_name,
                   ic.category_name,
                   u.full_name as distributed_by_name,
                   dp.planned_date,
                   br.purpose as request_purpose
            FROM DistributionLogs dl
            JOIN Beneficiaries b ON dl.beneficiary_id = b.beneficiary_id
            JOIN ItemType it ON dl.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            JOIN Users u ON dl.distributed_by = u.user_id
            LEFT JOIN DistributionPlans dp ON dl.plan_id = dp.plan_id
            LEFT JOIN BeneficiaryRequests br ON dp.request_id = br.request_id
            ${whereClause}
            ORDER BY dl.${sortBy || 'distribution_date'} ${sortOrder}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;

        params.push(limit, offset);

        const countQuery = `
            SELECT COUNT(*) as total
            FROM DistributionLogs dl
            ${whereClause}
        `;

        const [logsResult, countResult] = await Promise.all([
            query(logsQuery, params),
            query(countQuery, params.slice(0, -2))
        ]);

        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: logsResult.rows,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(total / limit),
                currentPage: Math.floor(offset / limit) + 1
            },
            message: 'Distribution logs retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting distribution logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve distribution logs',
            error: error.message
        });
    }
};

/**
 * Get distribution statistics
 */
export const getDistributionStatistics = async (req, res) => {
    try {
        const { period = '30' } = req.query; // days

        const plansStatsQuery = `
            SELECT 
                COUNT(*) as total_plans,
                COUNT(CASE WHEN status = 'Draft' THEN 1 END) as draft_count,
                COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'Ongoing' THEN 1 END) as ongoing_count,
                COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_count
            FROM DistributionPlans 
            WHERE created_at >= NOW() - INTERVAL '${parseInt(period)} days'
        `;

        const distributionStatsQuery = `
            SELECT 
                COUNT(*) as total_distributions,
                SUM(quantity_distributed) as total_quantity_distributed,
                COUNT(DISTINCT beneficiary_id) as unique_beneficiaries_served
            FROM DistributionLogs 
            WHERE distribution_date >= NOW() - INTERVAL '${parseInt(period)} days'
        `;

        const itemsDistributedQuery = `
            SELECT 
                ic.category_name,
                it.itemtype_name,
                SUM(dl.quantity_distributed) as total_distributed
            FROM DistributionLogs dl
            JOIN ItemType it ON dl.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE dl.distribution_date >= NOW() - INTERVAL '${parseInt(period)} days'
            GROUP BY ic.category_name, it.itemtype_name
            ORDER BY total_distributed DESC
            LIMIT 10
        `;

        const [plansStatsResult, distributionStatsResult, itemsDistributedResult] = await Promise.all([
            query(plansStatsQuery),
            query(distributionStatsQuery),
            query(itemsDistributedQuery)
        ]);

        res.json({
            success: true,
            data: {
                plans: plansStatsResult.rows[0],
                distributions: distributionStatsResult.rows[0],
                topDistributedItems: itemsDistributedResult.rows
            },
            message: 'Distribution statistics retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting distribution statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve distribution statistics',
            error: error.message
        });
    }
};

/**
 * Get distribution summary for report generation
 */
export const getDistributionSummary = async (req, res) => {
    try {
        const { year, month, status, search } = req.query;

        // Build WHERE conditions
        let whereConditions = [];
        let queryParams = [];
        let paramCounter = 1;

        if (year) {
            whereConditions.push(`EXTRACT(YEAR FROM dp.planned_date) = $${paramCounter}`);
            queryParams.push(year);
            paramCounter++;
        }

        if (month) {
            whereConditions.push(`EXTRACT(MONTH FROM dp.planned_date) = $${paramCounter}`);
            queryParams.push(month);
            paramCounter++;
        }

        if (status) {
            whereConditions.push(`dp.status = $${paramCounter}`);
            queryParams.push(status);
            paramCounter++;
        }

        if (search) {
            whereConditions.push(`(b.name ILIKE $${paramCounter} OR br.purpose ILIKE $${paramCounter})`);
            queryParams.push(`%${search}%`);
            paramCounter++;
        }

        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get summary statistics
        const summaryQuery = `
            SELECT 
                COUNT(DISTINCT dp.plan_id) as total_plans,
                COUNT(DISTINCT CASE WHEN dp.status = 'Draft' THEN dp.plan_id END) as draft_count,
                COUNT(DISTINCT CASE WHEN dp.status = 'Approved' THEN dp.plan_id END) as approved_count,
                COUNT(DISTINCT CASE WHEN dp.status = 'Completed' THEN dp.plan_id END) as completed_count,
                COUNT(DISTINCT CASE WHEN dp.status = 'Cancelled' THEN dp.plan_id END) as cancelled_count,
                COUNT(DISTINCT br.beneficiary_id) as unique_beneficiaries,
                COALESCE(SUM(COALESCE(br.individuals_served, 1)), 0) as total_individuals_served,
                COALESCE(SUM(
                    (SELECT COALESCE(SUM(dpi.quantity), 0) 
                     FROM DistributionPlanItems dpi 
                     WHERE dpi.plan_id = dp.plan_id)
                ), 0) as total_items,
                COALESCE(SUM(
                    (SELECT COALESCE(SUM(dpi.allocated_value), 0) 
                     FROM DistributionPlanItems dpi 
                     WHERE dpi.plan_id = dp.plan_id)
                ), 0) as total_value
            FROM DistributionPlans dp
            LEFT JOIN BeneficiaryRequests br ON dp.request_id = br.request_id
            LEFT JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
            ${whereClause}
        `;

        const result = await query(summaryQuery, queryParams);
        const summary = result.rows[0];

        res.json({
            success: true,
            data: {
                totalPlans: parseInt(summary.total_plans) || 0,
                draftCount: parseInt(summary.draft_count) || 0,
                approvedCount: parseInt(summary.approved_count) || 0,
                completedCount: parseInt(summary.completed_count) || 0,
                cancelledCount: parseInt(summary.cancelled_count) || 0,
                uniqueBeneficiaries: parseInt(summary.unique_beneficiaries) || 0,
                totalIndividualsServed: parseInt(summary.total_individuals_served) || 0,
                totalItems: parseInt(summary.total_items) || 0,
                totalValue: parseFloat(summary.total_value) || 0
            },
            message: 'Distribution summary retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting distribution summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve distribution summary',
            error: error.message
        });
    }
};