import api from '../utils/api';

/**
 * Submit a donation request
 * @param {Object} donationData - The donation request data
 * @returns {Promise} Promise that resolves to the API response
 */
export const submitDonationRequest = async (donationData) => {
    try {
        const response = await api.post('/api/donation-requests', donationData);
        return response.data;
    } catch (error) {
        console.error('Error submitting donation request:', error);
        throw error;
    }
};

/**
 * Get user's donation requests
 * @param {Object} params - Query parameters (status, limit, offset)
 * @returns {Promise} Promise that resolves to the API response
 */
export const getUserDonations = async (params = {}) => {
    try {
        const response = await api.get('/api/donation-requests', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching user donations:', error);
        throw error;
    }
};

/**
 * Get donation request details
 * @param {number} donationId - The donation request ID
 * @returns {Promise} Promise that resolves to the API response
 */
export const getDonationDetails = async (donationId) => {
    try {
        const response = await api.get(`/api/donation-requests/${donationId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching donation details:', error);
        throw error;
    }
};

/**
 * Cancel a donation request
 * @param {number} donationId - The donation request ID
 * @returns {Promise} Promise that resolves to the API response
 */
export const cancelDonationRequest = async (donationId) => {
    try {
        const response = await api.put(`/api/donation-requests/${donationId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Error cancelling donation request:', error);
        throw error;
    }
};

/**
 * Update a donation request
 * @param {number} donationId - The donation request ID
 * @param {Object} donationData - The updated donation request data
 * @returns {Promise} Promise that resolves to the API response
 */
export const updateDonationRequest = async (donationId, donationData) => {
    try {
        const response = await api.put(`/api/donation-requests/${donationId}`, donationData);
        return response.data;
    } catch (error) {
        console.error('Error updating donation request:', error);
        throw error;
    }
};



/**
 * Get available appointment slots for a date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} Promise that resolves to available slots
 */
export const getAvailableSlots = async (date) => {
    try {
        const response = await api.get(`/api/appointments/available-slots?date=${date}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching available slots:', error);
        throw error;
    }
};

/**
 * Create an appointment
 * @param {Object} appointmentData - The appointment data
 * @returns {Promise} Promise that resolves to the API response
 */
export const createAppointment = async (appointmentData) => {
    try {
        const response = await api.post('/api/appointments', appointmentData);
        return response.data;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};

/**
 * Get calendar appointments for approved donations
 * @param {string} startDate - Start date for filtering (YYYY-MM-DD)
 * @param {string} endDate - End date for filtering (YYYY-MM-DD)
 * @returns {Promise} Promise that resolves to the API response
 */
export const getCalendarAppointments = async (startDate = null, endDate = null) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const queryString = params.toString();
        const url = `/api/donations/calendar${queryString ? `?${queryString}` : ''}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching calendar appointments:', error);
        throw error;
    }
};

/**
 * Get donor-specific statistics for donor dashboard
 * @param {number} year - Year for filtering trends (optional)
 * @returns {Promise} Promise that resolves to the API response
 */
export const getDonorStatistics = async (year = null) => {
    try {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        
        const queryString = params.toString();
        const url = `/api/donations/donor-statistics${queryString ? `?${queryString}` : ''}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching donor statistics:', error);
        throw error;
    }
};

/**
 * Get item types by category ID
 * @param {number} categoryId - The category ID
 * @returns {Promise} Promise that resolves to the API response
 */
export const getItemTypesByCategory = async (categoryId) => {
    try {
        const response = await api.get(`/api/donations/categories/${categoryId}/item-types`);
        return response.data;
    } catch (error) {
        console.error('Error fetching item types by category:', error);
        throw error;
    }
};