import { query } from '../db.js';

/**
 * Helper function to get beneficiary request with items
 */
async function getBeneficiaryRequestDetails(requestId) {
    const requestQuery = `
        SELECT br.*, b.name as beneficiary_name, b.type as beneficiary_type,
               b.contact_person, b.phone, b.address
        FROM BeneficiaryRequests br
        JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
        WHERE br.request_id = $1
    `;

    const itemsQuery = `
        SELECT bri.*, it.itemtype_name, ic.category_name
        FROM BeneficiaryRequestItems bri
        JOIN ItemType it ON bri.itemtype_id = it.itemtype_id
        JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
        WHERE bri.request_id = $1
        ORDER BY ic.category_name, it.itemtype_name
    `;

    const [requestResult, itemsResult] = await Promise.all([
        query(requestQuery, [requestId]),
        query(itemsQuery, [requestId])
    ]);

    if (requestResult.rows.length === 0) {
        return null;
    }

    const request = requestResult.rows[0];
    request.items = itemsResult.rows;
    return request;
}

/**
 * Create a new beneficiary
 */
export const createBeneficiary = async (req, res) => {
    try {
        const {
            name,
            type,
            contact_person,
            email,
            phone,
            address,
            notes
        } = req.body;

        // Validate required fields
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: 'Name and type are required'
            });
        }

        const result = await query(
            `INSERT INTO Beneficiaries (name, type, contact_person, email, phone, address, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [name, type, contact_person, email, phone, address, notes]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Beneficiary created successfully'
        });

    } catch (error) {
        console.error('Error creating beneficiary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create beneficiary',
            error: error.message
        });
    }
};

/**
 * Get all beneficiaries with pagination and filtering
 */
export const getAllBeneficiaries = async (req, res) => {
    try {
        const {
            type,
            search,
            limit = 20,
            offset = 0,
            sortBy = 'name',
            sortOrder = 'ASC'
        } = req.query;

        let whereConditions = [];
        let params = [];
        let paramCount = 1;

        if (type) {
            whereConditions.push(`type = $${paramCount++}`);
            params.push(type);
        }

        if (search) {
            whereConditions.push(`(name ILIKE $${paramCount} OR contact_person ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
            params.push(`%${search}%`);
            paramCount++;
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Validate sort column to prevent SQL injection
        const allowedSortColumns = ['name', 'type', 'contact_person', 'email'];
        const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

        const beneficiariesQuery = `
            SELECT b.*, 
                   COUNT(br.request_id) as total_requests,
                   COUNT(CASE WHEN br.status = 'Pending' THEN 1 END) as pending_requests,
                   COUNT(CASE WHEN br.status = 'Approved' THEN 1 END) as approved_requests
            FROM Beneficiaries b
            LEFT JOIN BeneficiaryRequests br ON b.beneficiary_id = br.beneficiary_id
            ${whereClause}
            GROUP BY b.beneficiary_id
            ORDER BY ${validSortBy} ${validSortOrder}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;

        params.push(limit, offset);

        const countQuery = `
            SELECT COUNT(DISTINCT b.beneficiary_id) as total
            FROM Beneficiaries b
            ${whereClause}
        `;

        const [beneficiariesResult, countResult] = await Promise.all([
            query(beneficiariesQuery, params),
            query(countQuery, params.slice(0, -2)) // Remove limit and offset for count
        ]);

        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: beneficiariesResult.rows,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(total / limit),
                currentPage: Math.floor(offset / limit) + 1
            },
            message: 'Beneficiaries retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting beneficiaries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve beneficiaries',
            error: error.message
        });
    }
};

/**
 * Get beneficiary by ID with their requests
 */
export const getBeneficiaryById = async (req, res) => {
    try {
        const { beneficiaryId } = req.params;

        const beneficiaryQuery = `
            SELECT b.*,
                   COUNT(br.request_id) as total_requests,
                   COUNT(CASE WHEN br.status = 'Pending' THEN 1 END) as pending_requests,
                   COUNT(CASE WHEN br.status = 'Approved' THEN 1 END) as approved_requests,
                   COUNT(CASE WHEN br.status = 'Fulfilled' THEN 1 END) as fulfilled_requests
            FROM Beneficiaries b
            LEFT JOIN BeneficiaryRequests br ON b.beneficiary_id = br.beneficiary_id
            WHERE b.beneficiary_id = $1
            GROUP BY b.beneficiary_id
        `;

        const requestsQuery = `
            SELECT br.*, 
                   dp.plan_id,
                   dp.status as plan_status,
                   dp.planned_date
            FROM BeneficiaryRequests br
            LEFT JOIN DistributionPlans dp ON br.request_id = dp.request_id
            WHERE br.beneficiary_id = $1
            ORDER BY br.request_date DESC
        `;

        const [beneficiaryResult, requestsResult] = await Promise.all([
            query(beneficiaryQuery, [beneficiaryId]),
            query(requestsQuery, [beneficiaryId])
        ]);

        if (beneficiaryResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Beneficiary not found'
            });
        }

        const beneficiary = beneficiaryResult.rows[0];
        beneficiary.requests = requestsResult.rows;

        res.json({
            success: true,
            data: beneficiary,
            message: 'Beneficiary retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting beneficiary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve beneficiary',
            error: error.message
        });
    }
};

/**
 * Update beneficiary
 */
export const updateBeneficiary = async (req, res) => {
    try {
        const { beneficiaryId } = req.params;
        const {
            name,
            type,
            contact_person,
            email,
            phone,
            address,
            notes
        } = req.body;

        const result = await query(
            `UPDATE Beneficiaries 
             SET name = $1, type = $2, contact_person = $3, email = $4, 
                 phone = $5, address = $6, notes = $7
             WHERE beneficiary_id = $8
             RETURNING *`,
            [name, type, contact_person, email, phone, address, notes, beneficiaryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Beneficiary not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Beneficiary updated successfully'
        });

    } catch (error) {
        console.error('Error updating beneficiary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update beneficiary',
            error: error.message
        });
    }
};

/**
 * Delete beneficiary
 */
export const deleteBeneficiary = async (req, res) => {
    try {
        const { beneficiaryId } = req.params;

        // Check if beneficiary has any requests
        const requestsCheck = await query(
            'SELECT COUNT(*) as count FROM BeneficiaryRequests WHERE beneficiary_id = $1',
            [beneficiaryId]
        );

        if (parseInt(requestsCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete beneficiary with existing requests'
            });
        }

        const result = await query(
            'DELETE FROM Beneficiaries WHERE beneficiary_id = $1 RETURNING *',
            [beneficiaryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Beneficiary not found'
            });
        }

        res.json({
            success: true,
            message: 'Beneficiary deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting beneficiary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete beneficiary',
            error: error.message
        });
    }
};

/**
 * Create a new beneficiary request with items
 */
export const createBeneficiaryRequest = async (req, res) => {
    try {
        const {
            beneficiary_id,
            urgency,
            purpose,
            notes,
            items = [] // Array of {itemtype_id, quantity_requested, notes}
        } = req.body;

        // Validate required fields
        if (!beneficiary_id || !purpose) {
            return res.status(400).json({
                success: false,
                message: 'Beneficiary ID and purpose are required'
            });
        }

        // Check if beneficiary exists
        const beneficiaryCheck = await query(
            'SELECT beneficiary_id FROM Beneficiaries WHERE beneficiary_id = $1',
            [beneficiary_id]
        );

        if (beneficiaryCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Beneficiary not found'
            });
        }

        // Start transaction
        await query('BEGIN');

        try {
            // Create the request with automatic approval (beneficiaries are pre-verified)
            const result = await query(
                `INSERT INTO BeneficiaryRequests (beneficiary_id, urgency, purpose, notes, status)
                 VALUES ($1, $2, $3, $4, 'Approved')
                 RETURNING *`,
                [beneficiary_id, urgency || 'Medium', purpose, notes]
            );

            const requestId = result.rows[0].request_id;

            // Add items if provided
            if (items && items.length > 0) {
                for (const item of items) {
                    await query(
                        `INSERT INTO BeneficiaryRequestItems (request_id, itemtype_id, quantity_requested, notes)
                         VALUES ($1, $2, $3, $4)`,
                        [requestId, item.itemtype_id, item.quantity_requested, item.notes || null]
                    );
                }
            }

            await query('COMMIT');

            // Get the complete request with beneficiary info and items
            const requestWithDetails = await getBeneficiaryRequestDetails(requestId);

            res.status(201).json({
                success: true,
                data: requestWithDetails,
                message: 'Beneficiary request created and automatically approved'
            });

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error creating beneficiary request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create beneficiary request',
            error: error.message
        });
    }
};

/**
 * Get all beneficiary requests with filtering and pagination
 */
export const getAllBeneficiaryRequests = async (req, res) => {
    try {
    const {
        status,
        exclude_status,
        urgency,
        beneficiary_id,
        dateFrom,
        dateTo,
        limit = 20,
        offset = 0,
        sortBy = 'request_date',
        sortOrder = 'DESC'
    } = req.query;        let whereConditions = [];
        let params = [];
        let paramCount = 1;

        if (status) {
            whereConditions.push(`br.status = $${paramCount++}`);
            params.push(status);
        }

        if (exclude_status) {
            whereConditions.push(`br.status != $${paramCount++}`);
            params.push(exclude_status);
        }

        if (urgency) {
            whereConditions.push(`br.urgency = $${paramCount++}`);
            params.push(urgency);
        }

        if (beneficiary_id) {
            whereConditions.push(`br.beneficiary_id = $${paramCount++}`);
            params.push(beneficiary_id);
        }

        if (dateFrom) {
            whereConditions.push(`DATE(br.request_date) >= $${paramCount++}`);
            params.push(dateFrom);
        }

        if (dateTo) {
            whereConditions.push(`DATE(br.request_date) <= $${paramCount++}`);
            params.push(dateTo);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Validate sort column
        const allowedSortColumns = ['request_date', 'status', 'urgency'];
        const validSortBy = allowedSortColumns.includes(sortBy) ? `br.${sortBy}` : 'br.request_date';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        const requestsQuery = `
            SELECT br.*,
                   b.name as beneficiary_name,
                   b.type as beneficiary_type,
                   b.contact_person,
                   b.phone,
                   b.address,
                   dp.plan_id,
                   dp.status as plan_status,
                   dp.planned_date
            FROM BeneficiaryRequests br
            JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
            LEFT JOIN DistributionPlans dp ON br.request_id = dp.request_id
            ${whereClause}
            ORDER BY ${validSortBy} ${validSortOrder}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;

        params.push(limit, offset);

        const countQuery = `
            SELECT COUNT(*) as total
            FROM BeneficiaryRequests br
            JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
            ${whereClause}
        `;

        const [requestsResult, countResult] = await Promise.all([
            query(requestsQuery, params),
            query(countQuery, params.slice(0, -2))
        ]);

        const total = parseInt(countResult.rows[0].total);

        // Get items for each request
        const requestsWithItems = await Promise.all(
            requestsResult.rows.map(async (request) => {
                const itemsQuery = `
                    SELECT bri.*, it.itemtype_name, ic.category_name
                    FROM BeneficiaryRequestItems bri
                    JOIN ItemType it ON bri.itemtype_id = it.itemtype_id
                    JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
                    WHERE bri.request_id = $1
                    ORDER BY it.itemtype_name
                `;
                
                const itemsResult = await query(itemsQuery, [request.request_id]);
                
                return {
                    ...request,
                    items: itemsResult.rows
                };
            })
        );

        res.json({
            success: true,
            data: requestsWithItems,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(total / limit),
                currentPage: Math.floor(offset / limit) + 1
            },
            message: 'Beneficiary requests retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting beneficiary requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve beneficiary requests',
            error: error.message
        });
    }
};

/**
 * Update beneficiary request status
 */
export const updateBeneficiaryRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, notes } = req.body;

        // Validate status
        const allowedStatuses = ['Pending', 'Approved', 'Fulfilled', 'Rejected'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Allowed values: ' + allowedStatuses.join(', ')
            });
        }

        const result = await query(
            `UPDATE BeneficiaryRequests 
             SET status = $1, notes = COALESCE($2, notes)
             WHERE request_id = $3
             RETURNING *`,
            [status, notes, requestId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Beneficiary request not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Beneficiary request status updated successfully'
        });

    } catch (error) {
        console.error('Error updating beneficiary request status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update beneficiary request status',
            error: error.message
        });
    }
};

/**
 * Get beneficiary request by ID with items
 */
export const getBeneficiaryRequestById = async (req, res) => {
    try {
        const { requestId } = req.params;

        const requestDetails = await getBeneficiaryRequestDetails(requestId);

        if (!requestDetails) {
            return res.status(404).json({
                success: false,
                message: 'Beneficiary request not found'
            });
        }

        res.json({
            success: true,
            data: requestDetails,
            message: 'Beneficiary request retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting beneficiary request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve beneficiary request',
            error: error.message
        });
    }
};

/**
 * Update beneficiary request items
 */
export const updateBeneficiaryRequestItems = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { items } = req.body; // Array of items to update/add

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: 'Items array is required'
            });
        }

        // Start transaction
        await query('BEGIN');

        try {
            // Delete existing items
            await query('DELETE FROM BeneficiaryRequestItems WHERE request_id = $1', [requestId]);

            // Add new items
            for (const item of items) {
                await query(
                    `INSERT INTO BeneficiaryRequestItems (request_id, itemtype_id, quantity_requested, quantity_approved, notes)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [requestId, item.itemtype_id, item.quantity_requested, item.quantity_approved || 0, item.notes]
                );
            }

            await query('COMMIT');

            // Get updated request details
            const updatedRequest = await getBeneficiaryRequestDetails(requestId);

            res.json({
                success: true,
                data: updatedRequest,
                message: 'Beneficiary request items updated successfully'
            });

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error updating beneficiary request items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update beneficiary request items',
            error: error.message
        });
    }
};

/**
 * Get beneficiary request statistics
 */
export const getBeneficiaryRequestStatistics = async (req, res) => {
    try {
        const { period = '30' } = req.query; // days

        const statsQuery = `
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'Fulfilled' THEN 1 END) as fulfilled_count,
                COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count,
                COUNT(CASE WHEN urgency = 'High' THEN 1 END) as high_urgency_count
            FROM BeneficiaryRequests 
            WHERE request_date >= NOW() - INTERVAL '${parseInt(period)} days'
        `;

        const urgencyBreakdownQuery = `
            SELECT urgency, COUNT(*) as count
            FROM BeneficiaryRequests 
            WHERE request_date >= NOW() - INTERVAL '${parseInt(period)} days'
            GROUP BY urgency
        `;

        const typeBreakdownQuery = `
            SELECT b.type, COUNT(br.request_id) as count
            FROM BeneficiaryRequests br
            JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
            WHERE br.request_date >= NOW() - INTERVAL '${parseInt(period)} days'
            GROUP BY b.type
        `;

        const [statsResult, urgencyResult, typeResult] = await Promise.all([
            query(statsQuery),
            query(urgencyBreakdownQuery),
            query(typeBreakdownQuery)
        ]);

        res.json({
            success: true,
            data: {
                overview: statsResult.rows[0],
                urgencyBreakdown: urgencyResult.rows,
                typeBreakdown: typeResult.rows
            },
            message: 'Beneficiary request statistics retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting beneficiary request statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve statistics',
            error: error.message
        });
    }
};