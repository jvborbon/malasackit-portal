import api from '../utilities/api';

// Category color themes for UI consistency
const categoryThemes = {
    'Food Items': {
        icon: '🍲',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
    },
    'Household Essentials/Personal Care': {
        icon: '🧴',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    'Clothing': {
        icon: '👕',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
    },
    'Shelter Materials': {
        icon: '🏠',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
    },
    'Educational Materials': {
        icon: '📚',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
    },
    'Kitchen Utensils': {
        icon: '🍴',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
    },
    // Default theme for new categories
    default: {
        icon: '📦',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
    }
};

/**
 * Fetch donation categories from the database
 * @returns {Promise} Promise that resolves to formatted donation categories
 */
export const fetchDonationCategories = async () => {
    try {
        const response = await api.get('/api/donations/categories');
        
        if (response.data.success) {
            // Transform database response to match the expected format
            const formattedCategories = {};
            
            response.data.data.forEach(category => {
                const theme = categoryThemes[category.category_name] || categoryThemes.default;
                
                formattedCategories[category.category_name] = {
                    id: category.category_id,
                    icon: theme.icon,
                    description: category.description || `Items for ${category.category_name.toLowerCase()}`,
                    color: theme.color,
                    bgColor: theme.bgColor,
                    borderColor: theme.borderColor,
                    items: category.item_types || [] // Array of item type names
                };
            });
            
            return {
                success: true,
                data: formattedCategories
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch donation categories');
        }
    } catch (error) {
        console.error('Error fetching donation categories:', error);
        
        // Return fallback categories if API fails
        return {
            success: false,
            error: error.message,
            fallback: getFallbackCategories()
        };
    }
};

/**
 * Fallback categories in case API is unavailable
 * @returns {Object} Fallback donation categories
 */
const getFallbackCategories = () => {
    return {
        'Food Items': {
            icon: '🍲',
            description: 'Canned goods, rice, noodles, etc.',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            items: ['Canned Goods', 'Rice', 'Noodles', 'Other Food Items']
        },
        'Clothing': {
            icon: '👕',
            description: 'New or gently used clothes',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            items: ['T-Shirts', 'Pants', 'Shoes', 'Other Clothing']
        },
        'Educational Materials': {
            icon: '📚',
            description: 'School supplies and learning materials',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            items: ['Notebooks', 'Pens', 'Books', 'Other Educational Items']
        }
    };
};

/**
 * Add a new item type to a category
 * @param {number} categoryId - The category ID
 * @param {string} itemTypeName - The name of the new item type
 * @returns {Promise} Promise that resolves to the result
 */
export const addItemType = async (categoryId, itemTypeName) => {
    try {
        const response = await api.post('/api/donations/item-types', {
            categoryId,
            itemTypeName
        });
        
        return response.data;
    } catch (error) {
        console.error('Error adding item type:', error);
        throw error;
    }
};

/**
 * Add a new donation category
 * @param {string} categoryName - The name of the new category
 * @param {string} description - The description of the category
 * @returns {Promise} Promise that resolves to the result
 */
export const addDonationCategory = async (categoryName, description) => {
    try {
        const response = await api.post('/api/donations/categories', {
            categoryName,
            description
        });
        
        return response.data;
    } catch (error) {
        console.error('Error adding donation category:', error);
        throw error;
    }
};