// src/utilities/jwt.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate a secure secret if none provided (development only)
const generateSecret = () => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable must be set in production!');
    }
    console.warn('No JWT_SECRET found, generating temporary secret for development');
    return crypto.randomBytes(64).toString('hex');
};

const JWT_SECRET = process.env.JWT_SECRET || generateSecret();
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