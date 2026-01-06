/**
 * Safety Threshold Configuration for Inventory Management
 * 
 * Based on LASAC's 240 sq.m (2,583 sq.ft) warehouse with realistic capacity constraints:
 * - Total space must accommodate ALL categories (food, non-food, clothing, etc.)
 * - Considers typical donation volumes and emergency response needs
 * - Balances storage density with accessibility and safety
 * - Accounts for shelving efficiency (~60-70% of floor space)
 * 
 * Warehouse Space Allocation (Approximate):
 * - Food Items: ~35% of space (~1,100 kg rice capacity, 3,000 canned goods)
 * - Hygiene/Household: ~25% of space
 * - Clothing: ~20% of space
 * - Bedding/Shelter: ~10% of space
 * - Kitchen/Educational/Medical: ~10% of space
 * 
 * Threshold Structure:
 * - max: Maximum realistic storage capacity per item
 * - reorder: Request new donations (60% of max capacity)
 * - critical: Emergency minimum buffer (30% of max capacity)
 */

export const SAFETY_THRESHOLDS = {
  // ====================================
  // FOOD ITEMS (35% warehouse space - highest priority)
  // Rice: ~50kg bags on pallets, Canned: stackable boxes
  // ====================================
  'Rice (10kg)': { max: 500, reorder: 300, critical: 150 },        // ~5 tons total rice capacity
  'Rice (25kg)': { max: 200, reorder: 120, critical: 60 },         // ~5 tons total rice capacity
  'Canned Goods': { max: 3000, reorder: 1800, critical: 900 },     // General canned goods
  'Sardines': { max: 2000, reorder: 1200, critical: 600 },         // Specific canned item
  'Corned Beef': { max: 1500, reorder: 900, critical: 450 },       // Specific canned item
  'Noodles': { max: 2500, reorder: 1500, critical: 750 },          // Instant noodles (lightweight, high volume)
  'Instant Noodles': { max: 2500, reorder: 1500, critical: 750 },
  'Cooking Oil': { max: 400, reorder: 240, critical: 120 },        // Bottled oil (heavy, less space efficient)
  'Sugar': { max: 600, reorder: 360, critical: 180 },              // 1kg bags
  'Salt': { max: 500, reorder: 300, critical: 150 },               // 1kg bags
  'Coffee': { max: 1000, reorder: 600, critical: 300 },            // Sachets (compact)
  'Milk Powder': { max: 400, reorder: 240, critical: 120 },        // Cans/boxes (bulky)
  'Biscuits (Pack)': { max: 1200, reorder: 720, critical: 360 },   // Boxes of biscuits
  'Dried Fish': { max: 300, reorder: 180, critical: 90 },          // Limited due to smell/special storage
  'Bread': { max: 150, reorder: 90, critical: 45 },                // Perishable, short-term only
  'Pasta': { max: 800, reorder: 480, critical: 240 },              // Packaged pasta
  'Cereals': { max: 500, reorder: 300, critical: 150 },            // Breakfast cereals
  'Other Food Items': { max: 600, reorder: 360, critical: 180 },   // Miscellaneous food

  // ====================================
  // HYGIENE & HOUSEHOLD ITEMS (25% warehouse space)
  // Compact items, can be stored on shelves efficiently
  // ====================================
  'Bath Soap': { max: 2400, reorder: 1440, critical: 720 },        // Bars (compact, stackable)
  'Soap': { max: 2400, reorder: 1440, critical: 720 },
  'Laundry Soap': { max: 1200, reorder: 720, critical: 360 },      // Bars/powdered (bulkier)
  'Detergent': { max: 1200, reorder: 720, critical: 360 },
  'Shampoo': { max: 1500, reorder: 900, critical: 450 },           // Sachets/bottles
  'Toothpaste': { max: 800, reorder: 480, critical: 240 },         // Tubes (compact)
  'Toothbrush': { max: 1000, reorder: 600, critical: 300 },        // Individual items
  'Toilet Paper': { max: 600, reorder: 360, critical: 180 },       // Rolls (bulky)
  'Sanitary Pads': { max: 800, reorder: 480, critical: 240 },      // Packs
  'Hygiene Napkin': { max: 800, reorder: 480, critical: 240 },
  'Diapers': { max: 600, reorder: 360, critical: 180 },            // Bulky packs
  'Face Masks': { max: 2000, reorder: 1200, critical: 600 },       // Boxes (compact)
  'Alcohol': { max: 500, reorder: 300, critical: 150 },            // Bottles (liquid, heavy)
  'Hand Sanitizer': { max: 500, reorder: 300, critical: 150 },
  'Tissues': { max: 600, reorder: 360, critical: 180 },            // Boxes
  'Face Towel': { max: 800, reorder: 480, critical: 240 },         // Folded towels
  'Other Hygiene Items': { max: 500, reorder: 300, critical: 150 },

  // ====================================
  // BEDDING & SHELTER (10% warehouse space)
  // Bulky items requiring more vertical/floor space
  // ====================================
  'Blankets': { max: 600, reorder: 360, critical: 180 },           // Folded blankets (bulky)
  'Blanket': { max: 600, reorder: 360, critical: 180 },
  'Sleeping Mat': { max: 500, reorder: 300, critical: 150 },       // Rolled mats
  'Mats': { max: 500, reorder: 300, critical: 150 },
  'Tents': { max: 50, reorder: 30, critical: 15 },                 // Large boxes (very bulky)
  'Tarpaulins': { max: 300, reorder: 180, critical: 90 },          // Rolled tarps
  'Pillows': { max: 400, reorder: 240, critical: 120 },            // Compressed pillows
  'Bed Sheets': { max: 500, reorder: 300, critical: 150 },         // Folded sheets
  'Mosquito Nets': { max: 300, reorder: 180, critical: 90 },       // Packaged nets
  'Jerry Cans': { max: 400, reorder: 240, critical: 120 },         // Empty cans (nestable)
  'Jerry Can': { max: 400, reorder: 240, critical: 120 },
  'Plastic Containers': { max: 500, reorder: 300, critical: 150 }, // Various sizes
  'Emergency Kits': { max: 300, reorder: 180, critical: 90 },      // Pre-packed kits
  'Sleeping Bags': { max: 250, reorder: 150, critical: 75 },       // Compressed bags
  'Other Shelter Items': { max: 300, reorder: 180, critical: 90 },

  // ====================================
  // CLOTHING (20% warehouse space)
  // Can be hung or boxed, moderate density
  // ====================================
  'T-Shirts': { max: 1000, reorder: 600, critical: 300 },          // Folded/boxed shirts
  'Pants': { max: 600, reorder: 360, critical: 180 },              // Folded pants
  'Dresses': { max: 400, reorder: 240, critical: 120 },            // Hung or folded
  'Shorts': { max: 500, reorder: 300, critical: 150 },             // Folded shorts
  'Underwear (New Only)': { max: 800, reorder: 480, critical: 240 }, // Packaged (compact)
  'Socks': { max: 1000, reorder: 600, critical: 300 },             // Pairs (very compact)
  'Shoes': { max: 400, reorder: 240, critical: 120 },              // Boxed shoes (bulky)
  'Jackets': { max: 300, reorder: 180, critical: 90 },             // Bulky winter wear
  'School Uniforms': { max: 400, reorder: 240, critical: 120 },    // Seasonal demand
  'Baby Clothes': { max: 600, reorder: 360, critical: 180 },       // Small sizes (compact)
  'Sleepwear': { max: 500, reorder: 300, critical: 150 },          // Pajamas
  'Other Clothing': { max: 500, reorder: 300, critical: 150 },     // Miscellaneous

  // ====================================
  // EDUCATIONAL MATERIALS (5% warehouse space)
  // Compact items, shelf-friendly
  // ====================================
  'Notebooks': { max: 500, reorder: 300, critical: 150 },          // Stacked notebooks
  'Ballpens': { max: 600, reorder: 360, critical: 180 },           // Boxes of pens
  'Pencils': { max: 600, reorder: 360, critical: 180 },            // Boxes of pencils
  'Crayons (12 pcs)': { max: 300, reorder: 180, critical: 90 },    // Crayon boxes
  'Coloring Materials (Markers/Paints)': { max: 200, reorder: 120, critical: 60 },
  'Ruler/Compass/Protractor Set': { max: 300, reorder: 180, critical: 90 },
  'Backpacks/School Bags': { max: 200, reorder: 120, critical: 60 }, // Bulky when full
  'School Supplies': { max: 400, reorder: 240, critical: 120 },    // General supplies
  'Textbooks': { max: 300, reorder: 180, critical: 90 },           // Heavy books
  'Storybooks': { max: 300, reorder: 180, critical: 90 },          // Books
  'Paper Reams (Bond Paper)': { max: 150, reorder: 90, critical: 45 }, // Heavy reams
  'Folders/Binder Sets': { max: 250, reorder: 150, critical: 75 },
  'Chalk/Whiteboard Markers': { max: 300, reorder: 180, critical: 90 },
  'Educational Toys (Preschool)': { max: 150, reorder: 90, critical: 45 }, // Bulky toys
  'Tablet/Basic Laptop (for learning)': { max: 30, reorder: 18, critical: 9 }, // Valuable, limited space
  'Other Educational Materials': { max: 250, reorder: 150, critical: 75 },

  // ====================================
  // KITCHEN ITEMS (3% warehouse space)
  // Bulky items with odd shapes
  // ====================================
  'Cooking Pots (medium)': { max: 150, reorder: 90, critical: 45 },  // Bulky, nestable
  'Frying Pan': { max: 150, reorder: 90, critical: 45 },
  'Cooking Utensil Set (spoon, ladle, etc.)': { max: 200, reorder: 120, critical: 60 },
  'Cutlery Set (forks, spoons, knives)': { max: 250, reorder: 150, critical: 75 },
  'Plates (set of 6)': { max: 200, reorder: 120, critical: 60 },     // Stackable but fragile
  'Bowls (set of 6)': { max: 200, reorder: 120, critical: 60 },
  'Cups/Glasses (set)': { max: 250, reorder: 150, critical: 75 },
  'Cooking Knife': { max: 150, reorder: 90, critical: 45 },
  'Chopping Board': { max: 150, reorder: 90, critical: 45 },
  'Rice Cooker': { max: 80, reorder: 48, critical: 24 },             // Bulky appliances
  'Water Jug/Pitcher': { max: 200, reorder: 120, critical: 60 },
  'Thermos Flask': { max: 150, reorder: 90, critical: 45 },
  'Serving Tray': { max: 150, reorder: 90, critical: 45 },
  'Plastic Containers (food storage)': { max: 250, reorder: 150, critical: 75 },
  'Other Kitchen Items': { max: 200, reorder: 120, critical: 60 },

  // ====================================
  // MEDICAL SUPPLIES (2% warehouse space)
  // Small items, climate-controlled section
  // ====================================
  'Medicine': { max: 500, reorder: 300, critical: 150 },             // Various medicines
  'First Aid Kit': { max: 200, reorder: 120, critical: 60 },         // Pre-packed kits
  'Bandages': { max: 800, reorder: 480, critical: 240 },             // Rolls (compact)
  'Antiseptic Solution': { max: 300, reorder: 180, critical: 90 },   // Bottles
  'Basic Medicines': { max: 500, reorder: 300, critical: 150 },
  'Gloves (Disposable)': { max: 1000, reorder: 600, critical: 300 }, // Boxes (compact)
  'Thermometer': { max: 100, reorder: 60, critical: 30 },            // Small items
  'Stethoscope': { max: 25, reorder: 15, critical: 8 },              // Professional equipment
  'Other Medical Supplies': { max: 300, reorder: 180, critical: 90 }
};

/**
 * Get safety threshold for a specific item type
 * @param {string} itemTypeName - The name of the item type
 * @returns {Object} - Threshold object with max, reorder, critical values
 */
export const getSafetyThreshold = (itemTypeName) => {
  return SAFETY_THRESHOLDS[itemTypeName] || { max: 1000, reorder: 300, critical: 100 };
};

/**
 * Get critical threshold value (for backward compatibility)
 * @param {string} itemTypeName - The name of the item type
 * @returns {number} - The critical threshold value
 */
export const getCriticalThreshold = (itemTypeName) => {
  const threshold = getSafetyThreshold(itemTypeName);
  return threshold.critical;
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
  const safeToDistribute = Math.max(0, currentStock - threshold.critical);
  
  let status = 'optimal';
  let statusColor = 'green';
  
  if (currentStock > threshold.max) {
    status = 'overstocked';
    statusColor = 'orange';
  } else if (currentStock >= threshold.reorder) {
    status = 'optimal';
    statusColor = 'green';
  } else if (currentStock >= threshold.critical) {
    status = 'low';
    statusColor = 'yellow';
  } else {
    status = 'critical';
    statusColor = 'red';
  }
  
  return {
    status,
    statusColor,
    threshold,
    currentStock,
    safeToDistribute,
    isAboveThreshold: currentStock > threshold.critical,
    isBelowReorder: currentStock < threshold.reorder,
    isOverstocked: currentStock > threshold.max,
    percentOfMax: threshold.max > 0 ? Math.round((currentStock / threshold.max) * 100) : 0,
    message: `${itemTypeName}: ${currentStock} units (Critical: ${threshold.critical}, Reorder: ${threshold.reorder}, Max: ${threshold.max})`
  };
};