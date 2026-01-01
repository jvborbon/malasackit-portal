import api from '../utils/api';

/**
 * Get all donation requests for staff/admin management
 * @param {Object} params - Query parameters (status, deliveryMethod, dateFrom, dateTo, limit, offset, sortBy, sortOrder)
 * @returns {Promise} Promise that resolves to the API response
 */
export const getAllDonationRequests = async (params = {}) => {
    try {
        const response = await api.get('/api/donations/requests', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching all donation requests:', error);
        throw error;
    }
};

/**
 * Update donation request status
 * @param {number} donationId - The donation request ID
 * @param {string} status - The new status (Approved, Rejected, Completed, In Progress)
 * @param {string} remarks - Optional remarks for the status change
 * @returns {Promise} Promise that resolves to the API response
 */
export const updateDonationStatus = async (donationId, status, remarks = null) => {
    try {
        const response = await api.put(`/api/donations/requests/${donationId}/status`, {
            status,
            remarks
        });
        return response.data;
    } catch (error) {
        console.error('Error updating donation status:', error);
        throw error;
    }
};

/**
 * Get detailed donation request information
 * @param {number} donationId - The donation request ID
 * @returns {Promise} Promise that resolves to the API response
 */
export const getDonationDetails = async (donationId) => {
    try {
        const response = await api.get(`/api/donations/requests/${donationId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching donation details:', error);
        throw error;
    }
};

/**
 * Get donation statistics for dashboard
 * @param {number} period - Period in days (default: 30)
 * @returns {Promise} Promise that resolves to the API response
 */
export const getDonationStatistics = async (period = 30) => {
    try {
        const response = await api.get('/api/donations/statistics', {
            params: { period }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching donation statistics:', error);
        throw error;
    }
};