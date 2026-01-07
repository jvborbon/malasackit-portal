// Container types and estimation rules for bulk donations
// Simple approach: estimate quantity per container based on container size and item type

export const CONTAINER_TYPES = [
  { value: 'Small Box', label: 'Small Box (30×30×30 cm)' },
  { value: 'Medium Box', label: 'Medium Box (40×40×40 cm)' },
  { value: 'Large Box', label: 'Large Box (60×60×60 cm)' },
  { value: 'Small Bag', label: 'Small Bag (Shopping bag)' },
  { value: 'Medium Sack', label: 'Medium Sack (25kg)' },
  { value: 'Large Sack', label: 'Large Sack (50kg)' }
];

// Default estimates based on container size (multiplier approach)
const SIZE_MULTIPLIERS = {
  'Small Box': 1,
  'Medium Box': 2,
  'Large Box': 4,
  'Small Bag': 0.5,
  'Medium Sack': 2.5,
  'Large Sack': 5
};

// Base estimates for common items (for Medium Box as baseline)
const BASE_ESTIMATES = {
  // Clothing
  'T-shirts': 20,
  'Pants': 15,
  'Shorts': 18,
  'Dresses': 12,
  'Skirts': 15,
  'Baby Clothes': 30,
  'Underwear': 40,
  'Socks': 50,
  'Shoes': 8,
  'Slippers': 12,
  
  // Food
  'Rice': 10,
  'Canned Goods': 40,
  'Instant Noodles': 100,
  'Biscuits': 30,
  'Coffee': 20,
  'Sugar': 10,
  'Salt': 15,
  
  // Educational
  'Notebooks': 60,
  'Ballpens': 100,
  'Pencils': 100,
  'Crayons': 40,
  'Books': 20,
  'Backpacks': 6,
  
  // Household
  'Toothbrush': 40,
  'Toothpaste': 30,
  'Soap': 40,
  'Shampoo': 20,
  'Dish Washing Liquid': 12,
  'Laundry Detergent': 8,
  'Towels': 15
};

/**
 * Get estimated quantity for a specific container type and item
 * @param {string} containerType - e.g., 'Medium Box'
 * @param {string} itemTypeName - e.g., 'T-shirts'
 * @returns {number} - estimated quantity
 */
export const getEstimatedQuantity = (containerType, itemTypeName) => {
  const multiplier = SIZE_MULTIPLIERS[containerType] || 2;
  
  // Try to find base estimate for this item
  let baseEstimate = 10; // default fallback
  
  // Try exact match first
  if (BASE_ESTIMATES[itemTypeName]) {
    baseEstimate = BASE_ESTIMATES[itemTypeName];
  } else {
    // Try partial match (e.g., "T-shirts (Adult)" matches "T-shirts")
    const partialMatch = Object.keys(BASE_ESTIMATES).find(key => 
      itemTypeName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(itemTypeName.toLowerCase().split('(')[0].trim())
    );
    
    if (partialMatch) {
      baseEstimate = BASE_ESTIMATES[partialMatch];
    }
  }
  
  // Apply container size multiplier
  return Math.round(baseEstimate * multiplier);
};

/**
 * Get estimated quantity for items in an assorted container
 * Divides the container space among multiple items
 * @param {string} containerType - Type of container
 * @param {string} itemTypeName - Name of the item type
 * @param {number} totalItemsInContainer - Total number of different item types in the container
 * @returns {number} Estimated quantity for this item type
 */
export const getAssortedEstimatedQuantity = (containerType, itemTypeName, totalItemsInContainer) => {
  // Get the full container capacity
  const fullCapacity = getEstimatedQuantity(containerType, itemTypeName);
  
  // Divide by number of item types, with a reasonable minimum
  // Use a divisor slightly less than total items to account for packing efficiency
  const adjustedDivisor = Math.max(1, totalItemsInContainer * 0.9);
  const estimatedQty = Math.round(fullCapacity / adjustedDivisor);
  
  // Ensure at least 1 item
  return Math.max(1, estimatedQty);
};

