import { query } from '../../db.js';
import { sendUserApprovalNotification } from '../emailService.js';

// Get all pending users (for admin approval)
export const getPendingUsers = async () => {
    try {
        const pendingUsersQuery = `
            SELECT 
                u.user_id, u.full_name, u.email, u.contact_num, u.account_type,
                u.created_at, u.status, u.is_approved,
                r.role_name,
                reg.region_name,
                p.province_name,
                m.municipality_name,
                b.barangay_name
            FROM Users u
            LEFT JOIN Roles r ON u.role_id = r.role_id
            LEFT JOIN table_region reg ON u.region_id = reg.region_id
            LEFT JOIN table_province p ON u.province_id = p.province_id
            LEFT JOIN table_municipality m ON u.municipality_id = m.municipality_id
            LEFT JOIN table_barangay b ON u.barangay_id = b.barangay_id
            WHERE u.is_approved = FALSE AND u.status = 'active'
            ORDER BY u.created_at DESC
        `;

        const result = await query(pendingUsersQuery);
        
        return {
            success: true,
            data: result.rows
        };
    } catch (error) {
        console.error('Error fetching pending users:', error);
        return {
            success: false,
            message: 'Failed to fetch pending users'
        };
    }
};

// Approve a user
export const approveUser = async (userId, approvedBy) => {
    try {
        // Begin transaction
        await query('BEGIN');

        // Get user details before approval
        const userQuery = `
            SELECT full_name, email, account_type
            FROM Users 
            WHERE user_id = $1 AND is_approved = FALSE
        `;
        const userResult = await query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            await query('ROLLBACK');
            return {
                success: false,
                message: 'User not found or already approved'
            };
        }

        const userData = userResult.rows[0];

        // Update user approval status
        const approveQuery = `
            UPDATE Users 
            SET is_approved = TRUE, email_verified = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1
        `;
        await query(approveQuery, [userId]);

        // Log the approval (if you want to track who approved)
        // You can add this later if needed
        
        // Commit transaction
        await query('COMMIT');

        // Send approval notification email (don't wait for it)
        const emailData = {
            fullName: userData.full_name,
            email: userData.email,
            donorType: userData.account_type
        };

        console.log('Attempting to send approval email to:', userData.email);
        console.log('Email data:', emailData);

        sendUserApprovalNotification(emailData)
            .then(result => {
                console.log('Approval email sent successfully:', result);
            })
            .catch(error => {
                console.error('Failed to send approval notification email:', error);
            });

        return {
            success: true,
            message: 'User approved successfully',
            data: { userId, approvedUser: userData }
        };

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error approving user:', error);
        return {
            success: false,
            message: 'Failed to approve user'
        };
    }
};

// Reject/Delete a pending user
export const rejectUser = async (userId, rejectedBy, reason = null) => {
    try {
        // Begin transaction
        await query('BEGIN');

        // Get user details before rejection
        const userQuery = `
            SELECT full_name, email
            FROM Users 
            WHERE user_id = $1 AND is_approved = FALSE
        `;
        const userResult = await query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            await query('ROLLBACK');
            return {
                success: false,
                message: 'User not found or already processed'
            };
        }

        // Delete login credentials first (foreign key constraint)
        await query('DELETE FROM Login_Credentials WHERE user_id = $1', [userId]);

        // Delete user record
        await query('DELETE FROM Users WHERE user_id = $1', [userId]);

        // Commit transaction
        await query('COMMIT');

        return {
            success: true,
            message: 'User registration rejected and removed',
            data: { userId, rejectedUser: userResult.rows[0] }
        };

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error rejecting user:', error);
        return {
            success: false,
            message: 'Failed to reject user'
        };
    }
};

// Get all users (approved and pending) for admin management
export const getAllUsers = async (options = {}) => {
    try {
        const { page = 1, limit = 20, search, role, status } = options;
        const offset = (page - 1) * limit;
        
        // Build dynamic WHERE conditions
        let whereConditions = ['u.is_approved = TRUE'];
        let queryParams = [];
        let paramCount = 0;

        // Filter by role
        if (role && role !== 'all') {
            paramCount++;
            whereConditions.push(`r.role_name = $${paramCount}`);
            queryParams.push(role);
        }

        // Filter by status
        if (status && status !== 'all') {
            paramCount++;
            whereConditions.push(`u.status = $${paramCount}`);
            queryParams.push(status);
        }

        // Search in user name or email
        if (search && search.trim() !== '') {
            paramCount++;
            whereConditions.push(`(LOWER(u.full_name) LIKE LOWER($${paramCount}) OR LOWER(u.email) LIKE LOWER($${paramCount + 1}))`);
            queryParams.push(`%${search}%`, `%${search}%`);
            paramCount++; // Account for the second parameter
        }

        const whereClause = 'WHERE ' + whereConditions.join(' AND ');

        const allUsersQuery = `
            SELECT 
                u.user_id, u.full_name, u.email, u.contact_num, u.account_type,
                u.created_at, u.updated_at, u.last_login, u.status, u.is_approved, u.email_verified,
                r.role_name,
                reg.region_name,
                p.province_name,
                m.municipality_name,
                b.barangay_name,
                -- Calculate comprehensive user status (Online, Offline, Inactive)
                CASE 
                    -- Inactive: Never logged in OR not logged in for more than 30 days
                    WHEN u.last_login IS NULL THEN 'inactive'
                    WHEN u.last_login < NOW() - INTERVAL '30 days' THEN 'inactive'
                    -- Online: Logged in within the last 15 minutes (active session)
                    WHEN u.last_login > NOW() - INTERVAL '15 minutes' THEN 'online'
                    -- Offline: Logged in within 30 days but not in the last 15 minutes
                    ELSE 'offline'
                END as activity_status,
                -- Additional info for status calculation
                EXTRACT(EPOCH FROM (NOW() - u.last_login))/60 as minutes_since_login
            FROM Users u
            LEFT JOIN Roles r ON u.role_id = r.role_id
            LEFT JOIN table_region reg ON u.region_id = reg.region_id
            LEFT JOIN table_province p ON u.province_id = p.province_id
            LEFT JOIN table_municipality m ON u.municipality_id = m.municipality_id
            LEFT JOIN table_barangay b ON u.barangay_id = b.barangay_id
            ${whereClause}
            ORDER BY 
                CASE 
                    WHEN u.last_login > NOW() - INTERVAL '15 minutes' THEN 1  -- Online first
                    WHEN u.last_login > NOW() - INTERVAL '30 days' THEN 2     -- Offline second  
                    ELSE 3                                                    -- Inactive last
                END,
                u.last_login DESC NULLS LAST
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        queryParams.push(limit, offset);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM Users u
            LEFT JOIN Roles r ON u.role_id = r.role_id
            ${whereClause}
        `;

        const countParams = queryParams.slice(0, -2); // Remove limit and offset for count query

        const [usersResult, countResult] = await Promise.all([
            query(allUsersQuery, queryParams),
            query(countQuery, countParams)
        ]);

        const totalCount = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            success: true,
            data: usersResult.rows,
            pagination: {
                currentPage: page,
                pages: totalPages,
                total: totalCount,
                limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        console.error('Error fetching all users:', error);
        return {
            success: false,
            message: 'Failed to fetch users'
        };
    }
};

// Get activity logs with filtering and pagination
export const getUserActivityLogs = async (options = {}) => {
    try {
        const { page = 1, limit = 10, action, userId, search } = options;
        const offset = (page - 1) * limit;
        
        // Build dynamic WHERE conditions
        let whereConditions = [];
        let queryParams = [];
        let paramCount = 0;

        // Filter by action type
        if (action && action !== 'all') {
            paramCount++;
            whereConditions.push(`ual.action = $${paramCount}`);
            queryParams.push(action);
        }

        // Filter by user ID
        if (userId && userId !== 'all') {
            paramCount++;
            whereConditions.push(`ual.user_id = $${paramCount}`);
            queryParams.push(userId);
        }

        // Search in user name or description
        if (search && search.trim() !== '') {
            paramCount++;
            whereConditions.push(`(LOWER(u.full_name) LIKE LOWER($${paramCount}) OR LOWER(ual.description) LIKE LOWER($${paramCount + 1}))`);
            queryParams.push(`%${search}%`, `%${search}%`);
            paramCount++; // Account for the second parameter
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Query for activity logs with user information
        const activityLogsQuery = `
            SELECT 
                ual.log_id,
                ual.user_id,
                ual.action,
                ual.description,
                ual.created_at as timestamp,
                u.full_name as user_name,
                u.email as user_email,
                -- Map action types to more readable formats
                CASE ual.action
                    WHEN 'USER_LOGIN' THEN 'login'
                    WHEN 'USER_LOGOUT' THEN 'logout'
                    WHEN 'USER_REGISTRATION' THEN 'registration'
                    WHEN 'DONATION_SUBMITTED' THEN 'donation_request'
                    WHEN 'DONATION_UPDATED' THEN 'donation_request'
                    WHEN 'DONATION_CANCELLED' THEN 'donation_request'
                    WHEN 'APPOINTMENT_CREATED' THEN 'appointment'
                    WHEN 'APPOINTMENT_UPDATED' THEN 'appointment'
                    WHEN 'APPOINTMENT_CANCELLED' THEN 'appointment'
                    WHEN 'INVENTORY_UPDATED' THEN 'inventory_update'
                    WHEN 'DISTRIBUTION_CREATED' THEN 'distribution'
                    WHEN 'USER_APPROVED' THEN 'user_management'
                    WHEN 'USER_REJECTED' THEN 'user_management'
                    ELSE LOWER(ual.action)
                END as action_type,
                -- Determine status (most logs are successful, failed ones would be explicitly marked)
                CASE 
                    WHEN ual.action LIKE '%FAILED%' OR ual.description LIKE '%failed%' OR ual.description LIKE '%error%' THEN 'failed'
                    ELSE 'success'
                END as status
            FROM UserActivityLogs ual
            LEFT JOIN Users u ON ual.user_id = u.user_id
            ${whereClause}
            ORDER BY ual.created_at DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        queryParams.push(limit, offset);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM UserActivityLogs ual
            LEFT JOIN Users u ON ual.user_id = u.user_id
            ${whereClause}
        `;

        const countParams = queryParams.slice(0, -2); // Remove limit and offset for count query

        const [logsResult, countResult] = await Promise.all([
            query(activityLogsQuery, queryParams),
            query(countQuery, countParams)
        ]);

        const totalCount = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalCount / limit);

        // Transform data to match frontend expectations
        const transformedLogs = logsResult.rows.map((log) => ({
            id: log.log_id,
            userId: log.user_id,
            userName: log.user_name || 'Unknown User',
            userEmail: log.user_email || 'No Email',
            action: log.action_type,
            description: log.description,
            timestamp: log.timestamp,
            status: log.status
        }));

        return {
            success: true,
            data: transformedLogs,
            pagination: {
                currentPage: page,
                pages: totalPages,
                total: totalCount,
                limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };

    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return {
            success: false,
            message: 'Failed to fetch activity logs'
        };
    }
};