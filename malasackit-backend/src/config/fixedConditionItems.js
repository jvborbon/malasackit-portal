/**
 * Configuration for items that have fixed conditions
 * These items can only be donated in specific conditions for safety/hygiene reasons
 */

export const FIXED_CONDITION_ITEMS = {
    // Household Essentials / Personal Care (Hygiene-sensitive)
    'Soap': 'new',
    'Shampoo': 'new',
    'Toothpaste': 'new',
    'Toothbrush': 'new',
    'Toilet Paper': 'new',
    'Detergent': 'new',
    'Sanitary Pads': 'new',
    'Diapers': 'new',
    'Face Masks': 'new',
    'Alcohol': 'new',
    'Hand Sanitizer': 'new',
    'Tissues': 'new',

    // Medical Supplies (Must be sealed/new for safety)
    'Medicines': 'new',
    'Basic Medicines': 'new',
    'Bandages': 'new',
    'Medical Gloves': 'new',
    'Gloves (Disposable)': 'new',
    'Thermometers': 'new',
    'Thermometer': 'new',
    'First Aid Kits': 'new',
    'First Aid Kit': 'new',
    'Syringes': 'new',
    'Ointments': 'new',
    'Antiseptic Solution': 'new',
    'Vitamins': 'new',
    'Stethoscope': 'new',
    'Other Medical Supplies': 'new',

    // Food Items (Must be fresh/far from expiration)
    // Note: "New" for food means fresh/far from expiration, not just unopened
    'Rice': 'new',
    'Rice (10kg)': 'new',
    'Rice (25kg)': 'new',
    'Noodles': 'new', 
    'Canned Goods': 'new',
    'Cooking Oil': 'new',
    'Sugar': 'new',
    'Salt': 'new',
    'Milk Powder': 'new',
    'Coffee': 'new',
    'Biscuits': 'new',
    'Pasta': 'new',
    'Bread': 'new',
    'Cereals': 'new',
    'Dried Fish': 'new',

    // Kitchen Utensils (Hygiene-related)
    'Plastic Plates': 'new',
    'Spoons': 'new',
    'Forks': 'new',
    'Tumblers': 'new',
    'Food Containers': 'new',

    // Shelter Materials (Should be functional and safe)
    'Jerry Cans': 'new',
    'Plastic Containers': 'new',
    'Emergency Kits': 'new'
};

// Categories that require fixed conditions
export const FIXED_CONDITION_CATEGORIES = {
    'Food Items': 'new',
    'Medical Supplies': 'new'
};

/**
 * Get the fixed condition for an item type
 * @param {string} itemTypeName - The name of the item type
 * @param {string} categoryName - The category name (optional)
 * @returns {string|null} Fixed condition or null if variable conditions allowed
 */
export const getFixedCondition = (itemTypeName, categoryName = null) => {
    // First check specific item override
    const specificCondition = FIXED_CONDITION_ITEMS[itemTypeName];
    if (specificCondition) {
        return specificCondition;
    }
    
    // Then check category-based rules
    if (categoryName && FIXED_CONDITION_CATEGORIES[categoryName]) {
        return FIXED_CONDITION_CATEGORIES[categoryName];
    }
    
    return null;
};

/**
 * Check if an item type has a fixed condition
 * @param {string} itemTypeName - The name of the item type
 * @param {string} categoryName - The category name (optional)
 * @returns {boolean} True if item has fixed condition
 */
export const hasFixedCondition = (itemTypeName, categoryName = null) => {
    return getFixedCondition(itemTypeName, categoryName) !== null;
};

/**
 * Get available conditions for an item type
 * @param {string} itemTypeName - The name of the item type
 * @returns {string[]} Array of available conditions
 */
export const getAvailableConditions = (itemTypeName) => {
    const fixedCondition = getFixedCondition(itemTypeName);
    if (fixedCondition) {
        return [fixedCondition];
    }
    return ['new', 'good', 'fair', 'poor'];
};

/**
 * Validate if a condition is allowed for an item type
 * @param {string} itemTypeName - The name of the item type
 * @param {string} condition - The condition to validate
 * @returns {boolean} True if condition is allowed
 */
export const isConditionAllowed = (itemTypeName, condition) => {
    const availableConditions = getAvailableConditions(itemTypeName);
    return availableConditions.includes(condition);
};