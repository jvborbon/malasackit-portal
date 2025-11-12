import { query } from '../../db.js';
import { hashPassword } from '../services_utils/passwordHashing.js';
import crypto from 'crypto';

/**
 * Generate a secure password reset token
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Request password reset - generates token and stores it
 */
export const requestPasswordReset = async (emailOrName) => {
    try {
        // Check if input is email or full name
        const isEmail = emailOrName.includes('@');
        
        // Find user by email or full name
        const userQuery = `
            SELECT 
                u.user_id, u.full_name, u.email, u.status, u.is_approved
            FROM Users u
            WHERE ${isEmail ? 'u.email = $1' : 'LOWER(u.full_name) = LOWER($1)'}
        `;
        
        const userResult = await query(userQuery, [emailOrName]);
        
        if (userResult.rows.length === 0) {
            return { 
                success: false, 
                message: isEmail ? 'No account found with this email address' : 'No account found with this name' 
            };
        }
        
        const user = userResult.rows[0];
        
        // Check if user is approved and active
        if (!user.is_approved) {
            return { 
                success: false, 
                message: 'Your account is not yet approved. Please contact an administrator.' 
            };
        }
        
        if (user.status !== 'active') {
            return { 
                success: false, 
                message: 'Your account is not active. Please contact an administrator.' 
            };
        }
        
        // Generate reset token
        const resetToken = generateResetToken();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        
        // Store reset token in database
        await query(
            `UPDATE Login_Credentials 
             SET password_reset_token = $1, password_reset_expires = $2 
             WHERE user_id = $3`,
            [resetToken, resetExpires, user.user_id]
        );
        
        // Log password reset request
        await query(
            'INSERT INTO UserActivityLogs (user_id, action, description) VALUES ($1, $2, $3)',
            [user.user_id, 'PASSWORD_RESET_REQUESTED', `Password reset requested for ${user.full_name}`]
        );
        
        return { 
            success: true, 
            user: user,
            resetToken: resetToken,
            message: 'Password reset email sent successfully' 
        };
        
    } catch (error) {
        console.error('Password reset request error:', error);
        return { 
            success: false, 
            message: 'Failed to process password reset request. Please try again later.' 
        };
    }
};

/**
 * Verify reset token validity
 */
export const verifyResetToken = async (token) => {
    try {
        const tokenQuery = `
            SELECT 
                lc.user_id, lc.password_reset_expires,
                u.full_name, u.email, u.status, u.is_approved
            FROM Login_Credentials lc
            JOIN Users u ON lc.user_id = u.user_id
            WHERE lc.password_reset_token = $1
        `;
        
        const result = await query(tokenQuery, [token]);
        
        if (result.rows.length === 0) {
            return { 
                success: false, 
                message: 'Invalid or expired reset token' 
            };
        }
        
        const tokenData = result.rows[0];
        
        // Check if token is expired
        if (new Date() > new Date(tokenData.password_reset_expires)) {
            return { 
                success: false, 
                message: 'Reset token has expired. Please request a new password reset.' 
            };
        }
        
        // Check if user is still approved and active
        if (!tokenData.is_approved || tokenData.status !== 'active') {
            return { 
                success: false, 
                message: 'Your account is not accessible. Please contact an administrator.' 
            };
        }
        
        return { 
            success: true, 
            user: {
                user_id: tokenData.user_id,
                full_name: tokenData.full_name,
                email: tokenData.email
            }
        };
        
    } catch (error) {
        console.error('Token verification error:', error);
        return { 
            success: false, 
            message: 'Failed to verify reset token. Please try again.' 
        };
    }
};

/**
 * Reset password using valid token
 */
export const resetPassword = async (token, newPassword) => {
    try {
        // Verify token first
        const tokenVerification = await verifyResetToken(token);
        
        if (!tokenVerification.success) {
            return tokenVerification;
        }
        
        const user = tokenVerification.user;
        
        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);
        
        // Update password and clear reset token
        await query(
            `UPDATE Login_Credentials 
             SET password_hash = $1, 
                 password_reset_token = NULL, 
                 password_reset_expires = NULL,
                 login_attempts = 0,
                 locked_until = NULL
             WHERE user_id = $2`,
            [hashedPassword, user.user_id]
        );
        
        // Log successful password reset
        await query(
            'INSERT INTO UserActivityLogs (user_id, action, description) VALUES ($1, $2, $3)',
            [user.user_id, 'PASSWORD_RESET_COMPLETED', `Password successfully reset for ${user.full_name}`]
        );
        
        return { 
            success: true, 
            message: 'Password has been reset successfully. You can now log in with your new password.' 
        };
        
    } catch (error) {
        console.error('Password reset error:', error);
        return { 
            success: false, 
            message: 'Failed to reset password. Please try again.' 
        };
    }
};

/**
 * Clean up expired reset tokens (can be run periodically)
 */
export const cleanupExpiredTokens = async () => {
    try {
        const result = await query(
            `UPDATE Login_Credentials 
             SET password_reset_token = NULL, password_reset_expires = NULL 
             WHERE password_reset_expires < NOW()`
        );
        
        console.log(`Cleaned up ${result.rowCount} expired reset tokens`);
        return { success: true, cleaned: result.rowCount };
        
    } catch (error) {
        console.error('Token cleanup error:', error);
        return { success: false, error: error.message };
    }
};