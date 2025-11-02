// src/utilities/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'malasackit-secret-key';
const COOKIE_NAME = 'auth_token';
const COOKIE_OPTIONS = {
    httpOnly: true,          // Not accessible via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',      // CSRF protection
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
};

export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

// Set token as HTTP-only cookie
export const setTokenCookie = (res, token) => {
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

// Clear token cookie
export const clearTokenCookie = (res) => {
    res.clearCookie(COOKIE_NAME);
};

export const COOKIE_NAME_EXPORT = COOKIE_NAME;