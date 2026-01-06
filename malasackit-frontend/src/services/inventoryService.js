import api from '../utils/api';

/**
 * Get all inventory items with filtering and pagination
 * @param {Object} params - Query parameters (category, status, search, page, limit)
 * @returns {Promise} Promise that resolves to the API response
 */
export const getInventory = async (params = {}) => {
    try {
        const response = await api.get('/api/inventory', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
};

/**
 * Get ALL item categories from database (regardless of inventory status)
 * @returns {Promise} Promise that resolves to the API response
 */
export const getAllCategories = async () => {
    try {
        const response = await api.get('/api/inventory/all-categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching all categories:', error);
        throw error;
    }
};

/**
 * Get item categories for walk-in form
 * @returns {Promise} Promise that resolves to the API response
 */
export const getCategories = async () => {
    try {
        const response = await api.get('/api/inventory/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Get item types for walk-in form
 * @returns {Promise} Promise that resolves to the API response
 */
export const getItemTypes = async () => {
    try {
        const response = await api.get('/api/inventory/item-types');
        return response.data;
    } catch (error) {
        console.error('Error fetching item types:', error);
        throw error;
    }
};

/**
 * Get item types by category for walk-in form
 * @param {string} categoryName - The category name
 * @returns {Promise} Promise that resolves to the API response
 */
export const getItemTypesByCategory = async (categoryName) => {
    try {
        // First get all categories to find the category ID
        const categoriesResponse = await getCategories();
        const categories = categoriesResponse.data || [];
        
        console.log('Categories response:', categories);
        console.log('Looking for category:', categoryName);
        
        // Find the category ID by name
        const category = categories.find(cat => cat.category_name === categoryName);
        console.log('Found category:', category);
        
        if (!category) {
            throw new Error(`Category "${categoryName}" not found`);
        }
        
        // Use the donations API endpoint to get item types by category ID
        const response = await api.get(`/api/donations/categories/${category.itemcategory_id}/item-types`);
        console.log('API response for item types:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching item types by category:', error);
        throw error;
    }
};

/**
 * Get inventory statistics for dashboard
 * @returns {Promise} Promise that resolves to the API response
 */
export const getInventoryStats = async () => {
    try {
        const response = await api.get('/api/inventory/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory statistics:', error);
        throw error;
    }
};

/**
 * Get specific inventory item details
 * @param {number} inventoryId - The inventory item ID
 * @returns {Promise} Promise that resolves to the API response
 */
export const getInventoryItem = async (inventoryId) => {
    try {
        const response = await api.get(`/api/inventory/${inventoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        throw error;
    }
};

/**
 * Update inventory item
 * @param {number} inventoryId - The inventory item ID
 * @param {Object} updateData - The update data (quantity_available, location, status, notes)
 * @returns {Promise} Promise that resolves to the API response
 */
export const updateInventoryItem = async (inventoryId, updateData) => {
    try {
        const response = await api.put(`/api/inventory/${inventoryId}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Error updating inventory item:', error);
        throw error;
    }
};

/**
 * Distribute items (remove from inventory)
 * @param {Array} items - Array of {itemtype_id, quantity} objects
 * @returns {Promise} Promise that resolves to the API response
 */
export const distributeItems = async (items) => {
    try {
        const response = await api.post('/api/inventory/distribute', { items });
        return response.data;
    } catch (error) {
        console.error('Error distributing items:', error);
        throw error;
    }
};

/**
 * Get items with low stock
 * @param {number} threshold - Stock threshold (default: 10)
 * @returns {Promise} Promise that resolves to the API response
 */
export const getLowStockItems = async (threshold = 10) => {
    try {
        const response = await api.get('/api/inventory/low-stock', {
            params: { threshold }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        throw error;
    }
};

// Alias for compatibility
export const getAllInventory = getInventory;

// Default export
const inventoryService = {
    getInventory,
    getAllInventory: getInventory,
    getCategories,
    getItemTypes,
    getItemTypesByCategory,
    getInventoryStats,
    getInventoryItem,
    updateInventoryItem,
    distributeItems,
    getLowStockItems
};

export default inventoryService;

