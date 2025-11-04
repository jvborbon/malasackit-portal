import express from 'express';
import { login, logout, getProfile, register } from '../controllers/userControllers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register); // Registration endpoint enabled but logic disabled
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authenticateToken, getProfile);

// Example protected routes
router.get('/admin', authenticateToken, requireRole(['Executive Admin']), (req, res) => {
    res.json({ message: 'Admin only content' });
});

router.get('/staff', authenticateToken, requireRole(['Resource Staff', 'Executive Admin']), (req, res) => {
    res.json({ message: 'Staff content' });
});

export default router;