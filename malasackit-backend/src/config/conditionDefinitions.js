/**
 * Condition definitions for different item categories
 * This helps clarify what each condition means for different types of items
 */

export const CONDITION_DEFINITIONS = {
    // Food Items
    food: {
        new: "Fresh, far from expiration date (>6 months for non-perishables, >1 month for perishables)",
        good: "Moderate shelf life remaining (3-6 months for non-perishables)",
        fair: "Short shelf life remaining (1-3 months for non-perishables)", 
        poor: "Near expiration (less than 1 month remaining)"
    },
    
    // Hygiene/Personal Care Items
    hygiene: {
        new: "Unopened, sealed packaging",
        good: "Not applicable - hygiene items must be unopened",
        fair: "Not applicable - hygiene items must be unopened",
        poor: "Not applicable - hygiene items must be unopened"
    },
    
    // Medical Supplies
    medical: {
        new: "Unopened, sterile, far from expiration",
        good: "Not applicable - medical items must be sterile and unopened",
        fair: "Not applicable - medical items must be sterile and unopened", 
        poor: "Not applicable - medical items must be sterile and unopened"
    },
    
    // Clothing
    clothing: {
        new: "Brand new with tags, never worn",
        good: "Gently used, clean, no visible wear",
        fair: "Moderately used, clean, minor wear but functional",
        poor: "Heavily used, may have stains or minor damage"
    },
    
    // Educational Materials
    educational: {
        new: "Brand new, unused",
        good: "Lightly used, clean, all pages intact",
        fair: "Moderately used, some wear but fully functional",
        poor: "Heavily used, may have missing pages or damage"
    },
    
    // Kitchen Utensils
    kitchen: {
        new: "Brand new, unopened packaging (for hygiene-sensitive items like plates, utensils)",
        good: "Clean, sanitized, good condition (for metal pots, pans)",
        fair: "Clean, minor wear but functional (for metal pots, pans)",
        poor: "Clean but showing significant wear (for metal pots, pans)"
    },
    
    // Shelter Materials
    shelter: {
        new: "Brand new, unopened packaging",
        good: "Lightly used, clean, fully functional",
        fair: "Moderately used, minor wear but functional",
        poor: "Heavily used, may need minor repairs"
    }
};

/**
 * Get condition definition for a specific item category and condition
 * @param {string} category - Item category (food, hygiene, medical, etc.)
 * @param {string} condition - Condition (new, good, fair, poor)
 * @returns {string} Definition of what the condition means for that category
 */
export const getConditionDefinition = (category, condition) => {
    return CONDITION_DEFINITIONS[category]?.[condition] || 'Standard condition definition';
};

/**
 * Get item category based on item type name
 * This helps determine which condition definitions to use
 * @param {string} itemTypeName - Name of the item type
 * @returns {string} Category key for condition definitions
 */
export const getItemCategory = (itemTypeName) => {
    const foodItems = ['Rice', 'Noodles', 'Canned Goods', 'Cooking Oil', 'Sugar', 'Salt', 'Milk Powder', 'Coffee', 'Biscuits', 'Pasta', 'Bread', 'Cereals', 'Dried Fish'];
    const hygieneItems = ['Soap', 'Shampoo', 'Toothpaste', 'Toothbrush', 'Toilet Paper', 'Detergent', 'Sanitary Pads', 'Diapers', 'Face Masks', 'Alcohol', 'Hand Sanitizer', 'Tissues'];
    const medicalItems = ['Medicines', 'Bandages', 'Medical Gloves', 'Thermometers', 'First Aid Kits', 'Syringes', 'Ointments', 'Vitamins'];
    const clothingItems = ['T-Shirts', 'Pants', 'Dresses', 'Shorts', 'Jackets', 'Shoes', 'Socks', 'Baby Clothes', 'Uniforms'];
    const educationalItems = ['School Bags', 'Notebooks', 'Writing Pads', 'Pens', 'Pencils', 'Crayons', 'Rulers', 'Books', 'Reference Materials', 'Chalkboards'];
    const kitchenItems = ['Plastic Plates', 'Spoons', 'Forks', 'Tumblers', 'Food Containers', 'Pots', 'Pans', 'Metal Utensils', 'Cooking Tools'];
    const shelterItems = ['Jerry Cans', 'Plastic Containers', 'Emergency Kits', 'Blankets', 'Pillows', 'Tarpaulins', 'Tents', 'Sleeping Bags', 'Mats'];

    if (foodItems.includes(itemTypeName)) return 'food';
    if (hygieneItems.includes(itemTypeName)) return 'hygiene';
    if (medicalItems.includes(itemTypeName)) return 'medical';
    if (clothingItems.includes(itemTypeName)) return 'clothing';
    if (educationalItems.includes(itemTypeName)) return 'educational';
    if (kitchenItems.includes(itemTypeName)) return 'kitchen';
    if (shelterItems.includes(itemTypeName)) return 'shelter';
    
    return 'general';
};