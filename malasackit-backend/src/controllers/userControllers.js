// src/controllers/userControllers.js
import { loginUser } from '../services/users/userAuth.js';
import { registerUser } from '../services/users/userRegistration.js'; // Re-enabled but logic disabled
import { getPendingUsers, approveUser, rejectUser, getAllUsers, getUserActivityLogs } from '../services/users/userManagement.js';
import { requestPasswordReset, verifyResetToken, resetPassword } from '../services/users/passwordReset.js';
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from '../services/emailService.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utilities/jwt.js';

// Enhanced password validation function
function validatePassword(password, userInfo = {}) {
    const errors = [];
    
    // Length requirements
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
        errors.push('Password must be less than 128 characters long');
    }
    
    // Complexity requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    
    if (!hasUppercase) {
        errors.push('Password must contain at least one uppercase letter (A-Z)');
    }
    
    if (!hasLowercase) {
        errors.push('Password must contain at least one lowercase letter (a-z)');
    }
    
    if (!hasNumbers) {
        errors.push('Password must contain at least one number (0-9)');
    }
    
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        strength: calculatePasswordStrength(password)
    };
}

// Password strength calculator
function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length scoring
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character variety scoring
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^\w\s]/.test(password)) score += 1;
    
    // Bonus for mixed character types
    const charTypes = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[^\w\s]/.test(password)
    ].filter(Boolean).length;
    
    if (charTypes >= 3) score += 1;
    if (charTypes === 4) score += 1;
    
    // Return strength level
    if (score >= 7) return 'Very Strong';
    if (score >= 5) return 'Strong';
    if (score >= 3) return 'Moderate';
    if (score >= 1) return 'Weak';
    return 'Very Weak';
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email or full name and password are required'
            });
        }
        
        const result = await loginUser(email, password);
        
        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message
            });
        }
        
        const token = generateToken({
            userId: result.user.user_id,
            email: result.user.email,
            role: result.user.role_name,
            roleId: result.user.role_id
        });
        
        // Set HTTP-only cookie instead of sending token in response
        setTokenCookie(res, token);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user
                // Note: No token in response - it's in HTTP-only cookie
            }
        });
        
    } catch (error) {
        console.error('Login controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Clear the HTTP-only cookie
        clearTokenCookie(res);
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
        
    } catch (error) {
        console.error('Logout controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        // User info is available from middleware (JWT payload)
        // Convert JWT structure to match what frontend expects
        const userProfile = {
            user_id: req.user.userId,
            email: req.user.email,
            role_name: req.user.role,
            // Add other fields if needed
        };
        
        res.json({
            success: true,
            data: { user: userProfile }
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const register = async (req, res) => {
    try {
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
            password,
            repeatPassword
        } = req.body;

        // Validation
        if (!fullName || !email || !password || !repeatPassword) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, and passwords are required'
            });
        }

        if (password !== repeatPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Enhanced password validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors,
                passwordStrength: passwordValidation.strength
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        const result = await registerUser({
            fullName,
            email,
            phoneNumber,
            donorType: donorType || 'INDIVIDUAL',
            streetAddress,
            regionId: regionId ? parseInt(regionId) : null,
            provinceId: provinceId ? parseInt(provinceId) : null,
            municipalityId: municipalityId ? parseInt(municipalityId) : null,
            barangayId: barangayId ? parseInt(barangayId) : null,
            vicariateId: vicariateId ? parseInt(vicariateId) : null,
            parishId: parishId ? parseInt(parishId) : null,
            customVicariate,
            customParish,
            password
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.status(201).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Registration controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Admin functions for user management
export const getPendingUsersController = async (req, res) => {
    try {
        const result = await getPendingUsers();
        
        if (!result.success) {
            console.error('getPendingUsers failed:', result.message);
            return res.status(500).json({
                success: false,
                message: result.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pending users retrieved successfully',
            data: result.data
        });

    } catch (error) {
        console.error('Get pending users controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const approveUserController = async (req, res) => {
    try {
        const { userId } = req.params;
        const approvedBy = req.user?.user_id; // From auth middleware

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await approveUser(userId, approvedBy);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Approve user controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const rejectUserController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const rejectedBy = req.user?.user_id; // From auth middleware

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await rejectUser(userId, rejectedBy, reason);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Reject user controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllUsersController = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        
        const result = await getAllUsers({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            role,
            status
        });
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Get all users controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getActivityLogsController = async (req, res) => {
    try {
        const { page = 1, limit = 10, action, userId, search } = req.query;
        
        const result = await getUserActivityLogs({
            page: parseInt(page),
            limit: parseInt(limit),
            action,
            userId,
            search
        });
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Activity logs retrieved successfully',
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Get activity logs controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Password Reset Controllers
export const forgotPasswordController = async (req, res) => {
    try {
        const { emailOrName } = req.body;
        
        if (!emailOrName) {
            return res.status(400).json({
                success: false,
                message: 'Email address or full name is required'
            });
        }

        const result = await requestPasswordReset(emailOrName);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        // Send password reset email
        try {
            await sendPasswordResetEmail(result.user, result.resetToken);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            // Still return success as the token was generated successfully
        }

        res.status(200).json({
            success: true,
            message: 'If an account with that information exists, a password reset email has been sent.'
        });

    } catch (error) {
        console.error('Forgot password controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const verifyResetTokenController = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        const result = await verifyResetToken(token);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: {
                user: {
                    full_name: result.user.full_name,
                    email: result.user.email
                }
            }
        });

    } catch (error) {
        console.error('Verify reset token controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const resetPasswordController = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token, password, and confirmation password are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Verify token and get user info first for password validation
        const tokenVerification = await verifyResetToken(token);
        
        if (!tokenVerification.success) {
            return res.status(400).json({
                success: false,
                message: tokenVerification.message
            });
        }

        // Enhanced password validation
        const passwordValidation = validatePassword(password);
        
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors,
                passwordStrength: passwordValidation.strength
            });
        }

        // Token verification already done aboven, password);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        // Send confirmation email
        try {
            await sendPasswordResetConfirmation(tokenVerification.user);
        } catch (emailError) {
            console.error('Failed to send password reset confirmation email:', emailError);
            // Still return success as the password was reset successfully
        }

        res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error('Reset password controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};