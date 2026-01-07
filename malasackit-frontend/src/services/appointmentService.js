import api from '../utils/api';

/**
 * Create a standalone event (Admin/Staff only)
 */
export const createEvent = async (eventData) => {
    try {
        const response = await api.post('/api/appointments/events', eventData);
        return response.data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

/**
 * Get all appointments (Admin/Staff only)
 */
export const getAllAppointments = async (params = {}) => {
    try {
        const response = await api.get('/api/appointments/all', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }
};

/**
 * Get available slots for a date
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
 * Cancel an appointment
 */
export const cancelAppointment = async (appointmentId) => {
    try {
        const response = await api.delete(`/api/appointments/${appointmentId}`);
        return response.data;
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        throw error;
    }
};

const appointmentService = {
    createEvent,
    getAllAppointments,
    getAvailableSlots,
    cancelAppointment
};

export default appointmentService;
