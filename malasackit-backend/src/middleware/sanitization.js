// src/middleware/sanitization.js
// Custom input sanitization middleware using only built-in JavaScript

/**
 * Sanitize a string input to prevent XSS and injection attacks
 * @param {string} str - Input string to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
        .trim()                           // Remove leading/trailing whitespace
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags completely
        .replace(/<[^>]+>/g, '')          // Remove all HTML tags
        .replace(/javascript:/gi, '')     // Remove javascript: protocol
        .replace(/on\w+\s*=\s*[^>\s]*/gi, '') // Remove event handlers
        .replace(/&/g, '&amp;')          // Escape ampersands
        .replace(/"/g, '&quot;')         // Escape double quotes
        .replace(/'/g, '&#x27;')         // Escape single quotes
        .replace(/\//g, '&#x2F;')        // Escape forward slashes
        .replace(/\\/g, '&#x5C;')        // Escape backslashes
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .substring(0, 2000);             // Limit maximum length
};

/**
 * Recursively sanitize an object's string properties
 * @param {any} obj - Object to sanitize
 * @returns {any} - Sanitized object
 */
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    
    return obj; // Return as-is for numbers, booleans, etc.
};

/**
 * Express middleware to sanitize request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const sanitizeMiddleware = (req, res, next) => {
    try {
        // Sanitize request body
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }
        
        // Sanitize query parameters (modify in place since req.query is a getter)
        if (req.query && typeof req.query === 'object') {
            const sanitized = sanitizeObject(req.query);
            Object.keys(req.query).forEach(key => delete req.query[key]);
            Object.assign(req.query, sanitized);
        }
        
        // Sanitize URL parameters (modify in place since req.params is a getter)
        if (req.params && typeof req.params === 'object') {
            const sanitized = sanitizeObject(req.params);
            Object.keys(req.params).forEach(key => delete req.params[key]);
            Object.assign(req.params, sanitized);
        }
        
        next();
    } catch (error) {
        console.error('Sanitization middleware error:', error);
        // Continue processing even if sanitization fails
        next();
    }
};

/**
 * Manual sanitization function for specific use cases
 * @param {any} input - Input to sanitize
 * @returns {any} - Sanitized input
 */
export const sanitize = (input) => {
    return sanitizeObject(input);
};

/**
 * Email-specific sanitization (less restrictive)
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return email;
    
    return email
        .trim()
        .toLowerCase()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .substring(0, 254); // RFC 5321 limit
};

/**
 * Phone number sanitization
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhone = (phone) => {
    if (typeof phone !== 'string') return phone;
    
    return phone
        .trim()
        .replace(/[^\d\s\-\+\(\)]/g, '') // Keep only numbers, spaces, dashes, plus, parentheses
        .substring(0, 20);
};