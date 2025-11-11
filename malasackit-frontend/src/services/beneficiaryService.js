import api from '../components/utilities/api';

/**
 * Beneficiary Service
 * Handles all API calls related to beneficiary management
 */

class BeneficiaryService {

    // === BENEFICIARY MANAGEMENT ===

    /**
     * Get all beneficiaries with optional filtering
     */
    async getAllBeneficiaries(params = {}) {
        try {
            const response = await api.get('/api/beneficiaries', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching beneficiaries:', error);
            throw error;
        }
    }

    /**
     * Get beneficiary by ID
     */
    async getBeneficiaryById(beneficiaryId) {
        try {
            const response = await api.get(`/api/beneficiaries/${beneficiaryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching beneficiary:', error);
            throw error;
        }
    }

    /**
     * Create new beneficiary
     */
    async createBeneficiary(beneficiaryData) {
        try {
            const response = await api.post('/api/beneficiaries', beneficiaryData);
            return response.data;
        } catch (error) {
            console.error('Error creating beneficiary:', error);
            throw error;
        }
    }

    /**
     * Update beneficiary
     */
    async updateBeneficiary(beneficiaryId, beneficiaryData) {
        try {
            const response = await api.put(`/api/beneficiaries/${beneficiaryId}`, beneficiaryData);
            return response.data;
        } catch (error) {
            console.error('Error updating beneficiary:', error);
            throw error;
        }
    }

    /**
     * Delete beneficiary
     */
    async deleteBeneficiary(beneficiaryId) {
        try {
            const response = await api.delete(`/api/beneficiaries/${beneficiaryId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting beneficiary:', error);
            throw error;
        }
    }

    // === BENEFICIARY REQUESTS ===

    /**
     * Get all beneficiary requests with filtering
     */
    async getAllBeneficiaryRequests(params = {}) {
        try {
            const response = await api.get('/api/beneficiaries/requests/all', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching beneficiary requests:', error);
            throw error;
        }
    }

    /**
     * Create new beneficiary request
     */
    async createBeneficiaryRequest(requestData) {
        try {
            const response = await api.post('/api/beneficiaries/requests', requestData);
            return response.data;
        } catch (error) {
            console.error('Error creating beneficiary request:', error);
            throw error;
        }
    }

    /**
     * Update beneficiary request status
     */
    async updateBeneficiaryRequestStatus(requestId, statusData) {
        try {
            const response = await api.put(`/api/beneficiaries/requests/${requestId}/status`, statusData);
            return response.data;
        } catch (error) {
            console.error('Error updating beneficiary request status:', error);
            throw error;
        }
    }

    /**
     * Get beneficiary statistics
     */
    async getBeneficiaryStatistics(period = 30) {
        try {
            const response = await api.get(`/api/beneficiaries/statistics`, { 
                params: { period } 
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching beneficiary statistics:', error);
            throw error;
        }
    }

    // === HELPER METHODS ===

    /**
     * Search beneficiaries by name or type
     */
    async searchBeneficiaries(searchTerm, type = null) {
        const params = { search: searchTerm };
        if (type) params.type = type;
        
        return this.getAllBeneficiaries(params);
    }

    /**
     * Get pending beneficiary requests
     */
    async getPendingRequests() {
        return this.getAllBeneficiaryRequests({ status: 'Pending' });
    }

    /**
     * Get approved beneficiary requests (ready for distribution planning)
     */
    async getApprovedRequests() {
        return this.getAllBeneficiaryRequests({ status: 'Approved' });
    }

    /**
     * Get high urgency requests
     */
    async getHighUrgencyRequests() {
        return this.getAllBeneficiaryRequests({ urgency: 'High' });
    }

    /**
     * Approve beneficiary request
     */
    async approveBeneficiaryRequest(requestId, notes = '') {
        return this.updateBeneficiaryRequestStatus(requestId, {
            status: 'Approved',
            notes
        });
    }

    /**
     * Reject beneficiary request
     */
    async rejectBeneficiaryRequest(requestId, notes) {
        return this.updateBeneficiaryRequestStatus(requestId, {
            status: 'Rejected',
            notes
        });
    }
}

// Export singleton instance
export default new BeneficiaryService();