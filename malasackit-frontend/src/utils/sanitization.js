// src/utils/sanitization.js
// Frontend input sanitization utilities using only built-in JavaScript

import { useState } from 'react';

/**
 * Sanitize user input for frontend forms
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()                           // Remove whitespace
        .replace(/[<>]/g, '')            // Remove angle brackets
        .replace(/javascript:/gi, '')     // Remove javascript protocol
        .replace(/on\w+=/gi, '')         // Remove event handlers
        .replace(/&/g, '&amp;')          // HTML escape ampersands
        .replace(/"/g, '&quot;')         // Escape double quotes
        .replace(/'/g, '&#x27;')         // Escape single quotes
        .replace(/\//g, '&#x2F;')        // Escape forward slashes
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .substring(0, 1000);             // Length limit for frontend
};

/**
 * Sanitize email input (less restrictive)
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
        .substring(0, 254);
};

/**
 * Sanitize phone number input
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone
 */
export const sanitizePhone = (phone) => {
    if (typeof phone !== 'string') return phone;
    
    return phone
        .trim()
        .replace(/[^\d\s\-\+\(\)]/g, '') // Keep only valid phone characters
        .substring(0, 20);
};

/**
 * Sanitize textarea/long text input
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
    if (typeof text !== 'string') return text;
    
    return text
        .trim()
        .replace(/[<>]/g, '')            // Remove HTML tags
        .replace(/javascript:/gi, '')     // Remove javascript protocol
        .replace(/on\w+=/gi, '')         // Remove event handlers
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .substring(0, 2000);             // Longer limit for text areas
};

/**
 * Sanitize search query input
 * @param {string} query - Search query to sanitize
 * @returns {string} - Sanitized query
 */
export const sanitizeSearchQuery = (query) => {
    if (typeof query !== 'string') return query;
    
    return query
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/['"]/g, '')            // Remove quotes for search safety
        .substring(0, 100);              // Shorter limit for searches
};

/**
 * Custom React hook for sanitized form state
 * @param {Object} initialState - Initial form state
 * @returns {Array} - [formData, updateField, resetForm]
 */
export const useSanitizedForm = (initialState) => {
    const [formData, setFormData] = useState(initialState);
    
    const updateField = (field, value, sanitizer = sanitizeInput) => {
        setFormData(prev => ({
            ...prev,
            [field]: sanitizer(value)
        }));
    };
    
    const resetForm = () => {
        setFormData(initialState);
    };
    
    return [formData, updateField, resetForm];
};

/**
 * Sanitize entire form object
 * @param {Object} formData - Form data object
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
    const sanitized = {};
    
    for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
            const value = formData[key];
            
            // Apply specific sanitization based on field name
            if (key.toLowerCase().includes('email')) {
                sanitized[key] = sanitizeEmail(value);
            } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('contact')) {
                sanitized[key] = sanitizePhone(value);
            } else if (key.toLowerCase().includes('description') || key.toLowerCase().includes('notes') || key.toLowerCase().includes('purpose')) {
                sanitized[key] = sanitizeText(value);
            } else if (key.toLowerCase().includes('search') || key.toLowerCase().includes('query')) {
                sanitized[key] = sanitizeSearchQuery(value);
            } else if (typeof value === 'string') {
                sanitized[key] = sanitizeInput(value);
            } else {
                sanitized[key] = value; // Keep non-string values as-is
            }
        }
    }
    
    return sanitized;
};