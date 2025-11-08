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
export const getAllUsers = async () => {
    try {
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
            WHERE u.is_approved = TRUE
            ORDER BY 
                CASE 
                    WHEN u.last_login > NOW() - INTERVAL '15 minutes' THEN 1  -- Online first
                    WHEN u.last_login > NOW() - INTERVAL '30 days' THEN 2     -- Offline second  
                    ELSE 3                                                    -- Inactive last
                END,
                u.last_login DESC NULLS LAST
        `;

        const result = await query(allUsersQuery);
        
        return {
            success: true,
            data: result.rows
        };
    } catch (error) {
        console.error('Error fetching all users:', error);
        return {
            success: false,
            message: 'Failed to fetch users'
        };
    }
};