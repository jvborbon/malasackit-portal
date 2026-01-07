import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Distribution Service
 * Handles all API calls related to distribution management
 */
class DistributionService {

    // === DISTRIBUTION PLAN MANAGEMENT ===

    /**
     * Get all distribution plans with filtering
     */
    async getAllDistributionPlans(params = {}) {
        try {
            const response = await api.get('/distribution/plans', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching distribution plans:', error);
            throw error;
        }
    }

    /**
     * Get distribution plan by ID
     */
    async getDistributionPlanById(planId) {
        try {
            const response = await api.get(`/distribution/plans/${planId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching distribution plan:', error);
            throw error;
        }
    }

    /**
     * Create new distribution plan
     */
    async createDistributionPlan(planData) {
        try {
            const response = await api.post('/distribution/plans', planData);
            return response.data;
        } catch (error) {
            console.error('Error creating distribution plan:', error);
            throw error;
        }
    }

    /**
     * Execute distribution plan
     */
    async executeDistributionPlan(planId, executionData = {}) {
        try {
            const response = await api.post(`/distribution/plans/${planId}/execute`, executionData);
            return response.data;
        } catch (error) {
            console.error('Error executing distribution plan:', error);
            throw error;
        }
    }

    /**
     * Update distribution plan status
     */
    async updateDistributionPlanStatus(planId, statusData) {
        try {
            const response = await api.put(`/distribution/plans/${planId}/status`, statusData);
            return response.data;
        } catch (error) {
            console.error('Error updating distribution plan status:', error);
            throw error;
        }
    }







    // === DISTRIBUTION PLANNING SERVICES ===

    /**
     * Generate smart distribution recommendations using algorithmic optimization
     */
    async generateDistributionRecommendations(requestIds) {
        const response = await fetch(`${API_BASE_URL}/distribution/recommendations`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ requestIds }),
        });
        
        return this.handleResponse(response);
    }

    /**
     * Validate distribution plan
     */
    async validateDistributionPlan(planItems) {
        const response = await fetch(`${API_BASE_URL}/distribution/validate-plan`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ planItems }),
        });
        
        return this.handleResponse(response);
    }

    /**
     * Optimize inventory allocation
     */
    async optimizeInventoryAllocation(planItems) {
        const response = await fetch(`${API_BASE_URL}/distribution/optimize-allocation`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ planItems }),
        });
        
        return this.handleResponse(response);
    }

    /**
     * Get distribution metrics
     */
    async getDistributionMetrics(timeframe = 30) {
        const response = await fetch(`${API_BASE_URL}/distribution/metrics?timeframe=${timeframe}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        
        return this.handleResponse(response);
    }

    // === DISTRIBUTION LOGS ===

    /**
     * Get distribution logs with filtering
     */
    async getDistributionLogs(params = {}) {
        try {
            const response = await api.get('/distribution/logs', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching distribution logs:', error);
            throw error;
        }
    }

    /**
     * Get distribution statistics
     */
    async getDistributionStatistics(period = 30) {
        const response = await fetch(`${API_BASE_URL}/distribution/plans/statistics?period=${period}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        
        return this.handleResponse(response);
    }

    // === HELPER METHODS ===

    /**
     * Get plans by status
     */
    async getPlansByStatus(status) {
        return this.getAllDistributionPlans({ status });
    }

    /**
     * Get draft plans
     */
    async getDraftPlans() {
        return this.getPlansByStatus('Draft');
    }

    /**
     * Get approved plans ready for execution
     */
    async getApprovedPlans() {
        return this.getPlansByStatus('Approved');
    }

    /**
     * Get ongoing plans
     */
    async getOngoingPlans() {
        return this.getPlansByStatus('Ongoing');
    }

    /**
     * Get completed plans
     */
    async getCompletedPlans() {
        return this.getPlansByStatus('Completed');
    }

    /**
     * Approve distribution plan
     */
    async approveDistributionPlan(planId, remarks = '') {
        return this.updateDistributionPlanStatus(planId, {
            status: 'Approved',
            remarks
        });
    }

    /**
     * Reject distribution plan
     */
    async rejectDistributionPlan(planId, remarks) {
        return this.updateDistributionPlanStatus(planId, {
            status: 'Cancelled',
            remarks
        });
    }

    /**
     * Cancel distribution plan
     */
    async cancelDistributionPlan(planId, remarks) {
        return this.updateDistributionPlanStatus(planId, {
            status: 'Cancelled',
            remarks
        });
    }

    /**
     * Create distribution plan from smart algorithmic recommendations
     */
    async createPlanFromRecommendations(requestIds, selectedRecommendations, plannedDate) {
        try {
            // Generate smart recommendations first
            const recommendations = await this.generateDistributionRecommendations(requestIds);
            
            // Filter selected recommendations and format as plan items
            const planItems = [];
            
            selectedRecommendations.forEach(selectedRec => {
                const recommendation = recommendations.data.find(r => r.requestId === selectedRec.requestId);
                if (recommendation) {
                    recommendation.recommendedItems.forEach(item => {
                        planItems.push({
                            inventory_id: item.inventoryId,
                            quantity: item.quantity,
                            allocated_value: item.allocatedValue,
                            notes: item.notes
                        });
                    });
                }
            });

            // Create the distribution plan
            return this.createDistributionPlan({
                request_id: selectedRecommendations[0].requestId, // Primary request
                planned_date: plannedDate,
                items: planItems,
                remarks: 'Generated from smart distribution recommendations'
            });

        } catch (error) {
            console.error('Error creating plan from recommendations:', error);
            throw error;
        }
    }

    /**
     * Get distribution analytics data for dashboard
     */
    async getDistributionAnalytics(timeframe = 30) {
        try {
            const [metrics, statistics, logs] = await Promise.all([
                this.getDistributionMetrics(timeframe),
                this.getDistributionStatistics(timeframe),
                this.getDistributionLogs({ limit: 10, sortBy: 'distribution_date', sortOrder: 'DESC' })
            ]);

            return {
                metrics: metrics.data,
                statistics: statistics.data,
                recentDistributions: logs.data
            };
        } catch (error) {
            console.error('Error getting distribution analytics:', error);
            throw error;
        }
    }

    /**
     * Validate and create optimized distribution plan
     */
    async createOptimizedDistributionPlan(requestId, items, plannedDate, remarks) {
        try {
            // First validate the plan
            const validation = await this.validateDistributionPlan(items);
            
            if (!validation.data.isValid) {
                throw new Error('Plan validation failed: ' + validation.data.errors.join(', '));
            }

            // Optimize allocation if needed
            const optimization = await this.optimizeInventoryAllocation(items);
            
            let finalItems = items;
            if (!optimization.data.feasible) {
                // Use optimized allocations
                finalItems = optimization.data.adjustments.flatMap(adj => 
                    adj.adjustedAllocations.map(item => ({
                        inventory_id: adj.inventoryId,
                        quantity: item.adjustedQuantity,
                        allocated_value: item.allocatedValue * (item.adjustedQuantity / item.originalQuantity),
                        notes: `Optimized allocation: ${item.notes}`
                    }))
                );
            }

            // Create the plan
            const planData = {
                request_id: requestId,
                planned_date: plannedDate,
                items: finalItems,
                remarks: remarks + (optimization.data.feasible ? '' : ' (Auto-optimized for inventory availability)')
            };

            return this.createDistributionPlan(planData);

        } catch (error) {
            console.error('Error creating optimized plan:', error);
            throw error;
        }
    }
}

// Export singleton instance
export default new DistributionService();