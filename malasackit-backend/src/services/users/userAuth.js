import { hashPassword, comparePassword } from '../services_utils/passwordHashing.js';
import { query } from '../../db.js';

export const loginUser = async (emailOrName, password) => {
    try {
        // Check if the input is an email (contains @) or a full name
        const isEmail = emailOrName.includes('@');
        
        const userQuery = `
            SELECT 
                u.user_id, u.full_name, u.email, u.status, u.is_approved, u.email_verified,
                u.role_id, r.role_name, lc.password_hash
            FROM Users u
            LEFT JOIN Login_Credentials lc ON u.user_id = lc.user_id
            LEFT JOIN Roles r ON u.role_id = r.role_id
            WHERE ${isEmail ? 'u.email = $1' : 'LOWER(u.full_name) = LOWER($1)'}
        `;
        
        const result = await query(userQuery, [emailOrName]);
        
        if (result.rows.length === 0) {
            return { success: false, message: isEmail ? 'No account found with this email address' : 'No account found with this name' };
        }
        
        const user = result.rows[0];
        
        if (!user.is_approved) {
            return { success: false, message: 'Your account is pending approval. Please contact an administrator.' };
        }
        
        if (user.status !== 'active') {
            return { success: false, message: 'Your account has been deactivated. Please contact an administrator.' };
        }
        
        const isValidPassword = await comparePassword(password, user.password_hash);
        
        if (!isValidPassword) {
            // Log failed login attempt
            await query(
                'INSERT INTO UserActivityLogs (user_id, action, description) VALUES ($1, $2, $3)',
                [user.user_id, 'LOGIN_FAILED', `Failed login attempt for ${user.full_name} - incorrect password`]
            );
            return { success: false, message: 'Incorrect password. Please try again.' };
        }
        
        // Update last login and set user online
        await query('UPDATE Users SET last_login = CURRENT_TIMESTAMP, is_online = true WHERE user_id = $1', [user.user_id]);
        
        // Log login activity
        await query(
            'INSERT INTO UserActivityLogs (user_id, action, description) VALUES ($1, $2, $3)',
            [user.user_id, 'USER_LOGIN', `User ${user.full_name} logged into the system`]
        );
        
        const { password_hash, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed. Please try again later.' };
    }
};