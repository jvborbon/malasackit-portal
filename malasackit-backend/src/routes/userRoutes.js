import express from 'express';
import { 
    login, 
    logout, 
    getProfile,
    updateProfile,
    register, 
    getPendingUsersController, 
    approveUserController, 
    rejectUserController, 
    getAllUsersController,
    getActivityLogsController,
    forgotPasswordController,
    verifyResetTokenController,
    resetPasswordController,
    sendVerificationEmailController,
    verifyEmailController
} from '../controllers/userControllers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { 
    loginLimiter, 
    passwordResetLimiter, 
    accountCreationLimiter,
    writeOperationLimiter 
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply specific rate limiters to critical endpoints
router.post('/register', accountCreationLimiter, register); // Registration endpoint enabled but logic disabled
router.post('/login', loginLimiter, login);
router.post('/logout', authenticateToken, logout); // Require authentication to properly track logout
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, writeOperationLimiter, updateProfile);

// Password reset routes (public - no authentication required)
router.post('/forgot-password', passwordResetLimiter, forgotPasswordController);
router.get('/verify-reset-token/:token', verifyResetTokenController);
router.post('/reset-password/:token', passwordResetLimiter, resetPasswordController);

// Email verification routes
router.post('/send-verification-email', authenticateToken, writeOperationLimiter, sendVerificationEmailController);
router.get('/verify-email/:token', verifyEmailController);

// Admin user management routes
router.get('/pending', authenticateToken, requireRole(['Executive Admin']), getPendingUsersController);
router.get('/all', authenticateToken, requireRole(['Executive Admin', 'Resource Staff']), getAllUsersController);
router.get('/activity-logs', authenticateToken, requireRole(['Executive Admin', 'Resource Staff']), getActivityLogsController);
router.post('/approve/:userId', writeOperationLimiter, authenticateToken, requireRole(['Executive Admin']), approveUserController);
router.delete('/reject/:userId', writeOperationLimiter, authenticateToken, requireRole(['Executive Admin']), rejectUserController);

// Test email functionality (admin only)
router.post('/test-email', authenticateToken, requireRole(['Executive Admin']), async (req, res) => {
    try {
        const { notifyAdminOfNewRegistration } = await import('../services/emailService.js');
        
        const testUserData = {
            fullName: 'Test User',
            email: 'test@example.com',
            phoneNumber: '09123456789',
            donorType: 'INDIVIDUAL'
        };

        const result = await notifyAdminOfNewRegistration(testUserData);
        
        res.json({
            success: true,
            message: 'Test email sent',
            emailResult: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
});

// Example protected routes
router.get('/admin', authenticateToken, requireRole(['Executive Admin']), (req, res) => {
    res.json({ message: 'Admin only content' });
});

router.get('/staff', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), (req, res) => {
    res.json({ message: 'Staff content' });
});

export default router;