/**
 * Safety Threshold Configuration for Inventory Management
 * 
 * These thresholds are based on operational requirements and criticality levels:
 * - HIGH CRITICALITY: Food items (20-30% monthly usage standard)
 * - CRITICAL & HIGH IMPORTANCE: Household/Hygiene items  
 * - LOWER CRITICALITY: Clothing (abundant, high donation rate)
 * - VERY CRITICAL: Shelter materials (disaster response)
 * - MODERATE: Kitchen items
 * - CRITICAL: Medical supplies (emergency buffer required)
 */

export const SAFETY_THRESHOLDS = {
  // ====================================
  // CATEGORY 1 - Food Items (HIGH CRITICALITY)
  // Food is essential for relief operations → 20-30% of monthly usage is standard
  // ====================================
  'Canned Goods': 300,
  'Rice (10kg)': 20,
  'Rice (25kg)': 10,
  'Noodles': 200,
  'Cooking Oil': 40,
  'Sugar': 30,
  'Salt': 20,
  'Coffee': 50,
  'Milk Powder': 40,
  'Biscuits (Pack)': 150,
  'Dried Fish': 40,
  'Bread': 20,
  'Pasta': 80,
  'Cereals': 40,
  'Other Food Items': 15, // Custom ~10-15% of mixed stock

  // ====================================
  // CATEGORY 2 - Household Essentials/Hygiene (CRITICAL & HIGH IMPORTANCE)
  // ====================================
  'Soap': 150,
  'Shampoo': 80,
  'Toothpaste': 100,
  'Toothbrush': 100,
  'Toilet Paper': 50,
  'Detergent': 60,
  'Sanitary Pads': 100,
  'Diapers': 60,
  'Face Masks': 200,
  'Alcohol': 80,
  'Hand Sanitizer': 60,
  'Tissues': 80,
  'Other Hygiene Items': 15, // 10-20% buffer

  // ====================================
  // CATEGORY 3 - Clothing (LOWER CRITICALITY, HIGH DONATION RATE)
  // Clothes are abundant and rarely urgent (except disaster relief)
  // ====================================
  'T-Shirts': 100,
  'Pants': 60,
  'Dresses': 40,
  'Shorts': 50,
  'Underwear (New Only)': 80,
  'Socks': 100,
  'Shoes': 40,
  'Jackets': 40,
  'School Uniforms': 30,
  'Baby Clothes': 80,
  'Sleepwear': 50,
  'Other Clothing': 10, // ~10% of total

  // ====================================
  // CATEGORY 4 - Shelter Materials (VERY CRITICAL IN DISASTER RESPONSE)
  // ====================================
  'Blankets': 80,
  'Tents': 10,
  'Tarpaulins': 20,
  'Pillows': 40,
  'Bed Sheets': 40,
  'Mosquito Nets': 40,
  'Jerry Cans': 20,
  'Plastic Containers': 30,
  'Emergency Kits': 20,
  'Sleeping Bags': 20,
  'Mats': 30,
  'Other Shelter Items': 15, // 10-20%

  // ====================================
  // CATEGORY 5 - Educational Materials (MODERATE)
  // Less critical but important for continuity
  // ====================================
  'Notebooks': 50,
  'Ballpens': 100,
  'Pencils': 100,
  'Crayons (12 pcs)': 30,
  'Coloring Materials (Markers/Paints)': 20,
  'Ruler/Compass/Protractor Set': 30,
  'Backpacks/School Bags': 20,
  'Textbooks': 10,
  'Storybooks': 15,
  'Paper Reams (Bond Paper)': 10,
  'Folders/Binder Sets': 20,
  'Chalk/Whiteboard Markers': 15,
  'Educational Toys (Preschool)': 10,
  'Tablet/Basic Laptop (for learning)': 3,
  'Other Educational Materials': 10,

  // ====================================
  // CATEGORY 6 - Kitchen Items (MODERATE)
  // ====================================
  'Cooking Pots (medium)': 20,
  'Frying Pan': 20,
  'Cooking Utensil Set (spoon, ladle, etc.)': 30,
  'Cutlery Set (forks, spoons, knives)': 40,
  'Plates (set of 6)': 40,
  'Bowls (set of 6)': 40,
  'Cups/Glasses (set)': 40,
  'Cooking Knife': 40,
  'Chopping Board': 30,
  'Rice Cooker': 10,
  'Water Jug/Pitcher': 30,
  'Thermos Flask': 20,
  'Serving Tray': 30,
  'Plastic Containers (food storage)': 40,
  'Other Kitchen Items': 10, // 10% buffer

  // ====================================
  // CATEGORY 7 - Medical Supplies (CRITICAL)
  // Ensure sufficient buffer for emergencies
  // ====================================
  'First Aid Kit': 20,
  'Bandages': 200,
  'Antiseptic Solution': 40,
  'Basic Medicines': 50,
  'Gloves (Disposable)': 200,
  'Thermometer': 20,
  'Stethoscope': 5,
  'Other Medical Supplies': 15 // 10-20% buffer
};

/**
 * Get safety threshold for a specific item type
 * @param {string} itemTypeName - The name of the item type
 * @returns {number} - The safety threshold (defaults to 10 if not found)
 */
export const getSafetyThreshold = (itemTypeName) => {
  return SAFETY_THRESHOLDS[itemTypeName] || 10;
};

/**
 * Get all safety thresholds
 * @returns {Object} - All safety thresholds
 */
export const getAllSafetyThresholds = () => {
  return SAFETY_THRESHOLDS;
};

/**
 * Validate if current stock is above safety threshold
 * @param {string} itemTypeName - The name of the item type
 * @param {number} currentStock - Current available quantity
 * @returns {Object} - Validation result with status and details
 */
export const validateSafetyThreshold = (itemTypeName, currentStock) => {
  const threshold = getSafetyThreshold(itemTypeName);
  const safeToDistribute = Math.max(0, currentStock - threshold);
  
  let status = 'safe';
  if (currentStock <= threshold) {
    status = 'critical';
  } else if (currentStock <= threshold * 2) {
    status = 'low';
  }
  
  return {
    status,
    threshold,
    currentStock,
    safeToDistribute,
    isAboveThreshold: currentStock > threshold,
    message: `${itemTypeName}: ${currentStock} units (threshold: ${threshold})`
  };
};