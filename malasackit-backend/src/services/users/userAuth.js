import { hashPassword, comparePassword } from '../services_utils/passwordHashing.js';
import { query } from '../../db.js';

export const loginUser = async (email, password) => {
    try {
        const userQuery = `
            SELECT 
                u.user_id, u.full_name, u.email, u.status, u.is_approved,
                r.role_name, lc.password_hash
            FROM Users u
            LEFT JOIN Login_Credentials lc ON u.user_id = lc.user_id
            LEFT JOIN Roles r ON u.role_id = r.role_id
            WHERE u.email = $1
        `;
        
        const result = await query(userQuery, [email]);
        
        if (result.rows.length === 0) {
            return { success: false, message: 'No account found with this email address' };
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
            return { success: false, message: 'Incorrect password. Please try again.' };
        }
        
        // Update last login
        await query('UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);
        
        const { password_hash, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed. Please try again later.' };
    }
};