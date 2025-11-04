import { hashPassword } from '../services_utils/passwordHashing.js';
import { query } from '../../db.js';

// Generate unique user ID
const generateUserId = () => {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `USR${timestamp.slice(-8)}${randomNum}`;
};

export const registerUser = async (userData) => {
    const {
        fullName,
        email,
        phoneNumber,
        donorType,
        streetAddress,
        regionId,
        provinceId,
        municipalityId,
        barangayId,
        vicariateId,
        parishId,
        customVicariate,
        customParish,
        password
    } = userData;

    try {
        // Check if email already exists
        const emailCheck = await query(
            'SELECT email FROM Users WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return { 
                success: false, 
                message: 'An account with this email already exists' 
            };
        }

        // Generate unique user ID
        const userId = generateUserId();

        // Hash password
        const passwordHash = await hashPassword(password);

        // Get Donor role ID
        const roleQuery = await query(
            "SELECT role_id FROM Roles WHERE role_name = 'Donor'",
            []
        );
        
        if (roleQuery.rows.length === 0) {
            return { 
                success: false, 
                message: 'Registration system error. Please contact support.' 
            };
        }

        const donorRoleId = roleQuery.rows[0].role_id;

        // Begin transaction
        await query('BEGIN');

        try {
            // Insert user record with automatic approval (is_approved = TRUE)
            const userInsertQuery = `
                INSERT INTO Users (
                    user_id, full_name, email, contact_num, account_type, role_id,
                    region_id, province_id, municipality_id, barangay_id,
                    parish_id, vicariate_id, status, is_approved, email_verified
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', TRUE, TRUE)
                RETURNING user_id, full_name, email, created_at
            `;

            // Handle parish/vicariate IDs - use custom values if provided, otherwise use dropdown IDs
            const finalParishId = customParish || (parishId || null);
            const finalVicariateId = customVicariate || (vicariateId || null);

            const userResult = await query(userInsertQuery, [
                userId,
                fullName,
                email,
                phoneNumber || null,
                donorType,
                donorRoleId,
                regionId || null,
                provinceId || null,
                municipalityId || null,
                barangayId || null,
                finalParishId,
                finalVicariateId
            ]);

            // Insert login credentials
            const credentialsInsertQuery = `
                INSERT INTO Login_Credentials (user_id, password_hash)
                VALUES ($1, $2)
            `;

            await query(credentialsInsertQuery, [userId, passwordHash]);

            // Activity logging removed - UserActivityLogs table doesn't exist
            // TODO: Create UserActivityLogs table if needed for future logging

            // Commit transaction
            await query('COMMIT');

            return {
                success: true,
                message: 'Registration successful! Your account has been activated and you can now log in.',
                data: {
                    user: userResult.rows[0]
                }
            };

        } catch (transactionError) {
            // Rollback transaction on error
            await query('ROLLBACK');
            throw transactionError;
        }

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific database errors
        if (error.code === '23505' && error.constraint === 'users_email_key') {
            return {
                success: false,
                message: 'An account with this email already exists'
            };
        }

        // Handle database connection errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return {
                success: false,
                message: 'Database connection failed. Please contact support.'
            };
        }

        return {
            success: false,
            message: 'Registration failed. Please try again later.'
        };
    }
};