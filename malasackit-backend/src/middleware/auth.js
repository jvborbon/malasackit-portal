// src/middleware/auth.js
import { verifyToken, COOKIE_NAME_EXPORT } from '../utilities/jwt.js';

export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from HTTP-only cookie instead of Authorization header
        const token = req.cookies[COOKIE_NAME_EXPORT];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
        
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};