import api from '../components/utilities/api';

export const registrationAPI = {
    // Register new user
    async registerUser(userData) {
        try {
            const response = await api.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Registration failed');
            }
            throw new Error('Network error. Please try again.');
        }
    }
};