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
    'Bandages': 'new',
    'Medical Gloves': 'new',
    'Thermometers': 'new',
    'First Aid Kits': 'new',
    'Syringes': 'new',
    'Ointments': 'new',
    'Vitamins': 'new',

    // Food Items (Must be fresh/far from expiration)
    // Note: "New" for food means fresh/far from expiration, not just unopened
    'Rice': 'new',
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

/**
 * Get the fixed condition for an item type
 * @param {string} itemTypeName - The name of the item type
 * @returns {string|null} Fixed condition or null if variable conditions allowed
 */
export const getFixedCondition = (itemTypeName) => {
    return FIXED_CONDITION_ITEMS[itemTypeName] || null;
};

/**
 * Check if an item type has a fixed condition
 * @param {string} itemTypeName - The name of the item type
 * @returns {boolean} True if item has fixed condition
 */
export const hasFixedCondition = (itemTypeName) => {
    return itemTypeName in FIXED_CONDITION_ITEMS;
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