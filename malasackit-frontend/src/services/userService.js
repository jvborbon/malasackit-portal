import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Get user profile
 * @returns {Promise} User profile data
 */
export const getUserProfile = async () => {
    try {
        const response = await api.get('/auth/profile');
        return response.data;
    } catch (error) {
        console.error('Get profile error:', error);
        throw error;
    }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.fullName - User's full name
 * @param {string} profileData.email - User's email
 * @param {string} profileData.phone - User's phone number
 * @returns {Promise} Updated profile data
 */
export const updateUserProfile = async (profileData) => {
    try {
        const response = await api.put('/auth/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};

/**
 * Send email verification link
 * @returns {Promise} Success response
 */
export const sendVerificationEmail = async () => {
    try {
        const response = await api.post('/auth/send-verification-email');
        return response.data;
    } catch (error) {
        console.error('Send verification email error:', error);
        throw error;
    }
};

/**
 * Verify email with token
 * @param {string} token - Verification token from email
 * @returns {Promise} Verification result
 */
export const verifyEmail = async (token) => {
    try {
        const response = await api.get(`/auth/verify-email/${token}`);
        return response.data;
    } catch (error) {
        console.error('Verify email error:', error);
        throw error;
    }
};

