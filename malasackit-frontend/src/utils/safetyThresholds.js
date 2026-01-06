/**
 * Safety Threshold Utilities for Frontend
 * Uses local configuration as primary source with API as backup
 */

import { FRONTEND_SAFETY_THRESHOLDS } from '../config/safetyThresholds.js';

let thresholdsCache = null;
let lastFetch = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get safety thresholds (uses local config as primary source)
 * @returns {Promise<Object>} Safety thresholds object
 */
export const fetchSafetyThresholds = async () => {
  try {
    // Use local configuration as primary source
    thresholdsCache = FRONTEND_SAFETY_THRESHOLDS;
    lastFetch = Date.now();
    console.log('✅ Using local safety thresholds configuration');
    return FRONTEND_SAFETY_THRESHOLDS;
    
    // Optional: Try to fetch from API to override/supplement local config
    // This is commented out to avoid the current API issues
    /*
    const token = localStorage.getItem('token');
    const response = await fetch('/api/inventory/safety-thresholds', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Merge API data with local config (API takes precedence)
        thresholdsCache = { ...FRONTEND_SAFETY_THRESHOLDS, ...data.data };
        lastFetch = Date.now();
        console.log('✅ Updated safety thresholds from API');
        return thresholdsCache;
      }
    }
    */
    
  } catch (error) {
    console.error('Error with safety thresholds:', error);
    // Always fall back to local configuration
    thresholdsCache = FRONTEND_SAFETY_THRESHOLDS;
    lastFetch = Date.now();
    return FRONTEND_SAFETY_THRESHOLDS;
  }
};

/**
 * Get safety threshold for a specific item type (with caching)
 * @param {string} itemTypeName - The name of the item type
 * @returns {Promise<Object>} The safety threshold object { max, reorder, critical }
 */
export const getSafetyThreshold = async (itemTypeName) => {
  // Check if cache is valid
  if (!thresholdsCache || !lastFetch || (Date.now() - lastFetch) > CACHE_DURATION) {
    await fetchSafetyThresholds();
  }

  return thresholdsCache?.[itemTypeName] || FRONTEND_SAFETY_THRESHOLDS[itemTypeName] || { max: 1000, reorder: 300, critical: 100 };
};

/**
 * Get critical threshold value for backward compatibility
 * @param {string} itemTypeName - The name of the item type
 * @returns {Promise<number>} The critical threshold value
 */
export const getCriticalThreshold = async (itemTypeName) => {
  const threshold = await getSafetyThreshold(itemTypeName);
  return typeof threshold === 'object' ? threshold.critical : threshold;
};

/**
 * Get all safety thresholds (with caching)
 * @returns {Promise<Object>} All safety thresholds
 */
export const getAllSafetyThresholds = async () => {
  // Check if cache is valid
  if (!thresholdsCache || !lastFetch || (Date.now() - lastFetch) > CACHE_DURATION) {
    await fetchSafetyThresholds();
  }

  return thresholdsCache || FRONTEND_SAFETY_THRESHOLDS;
};

/**
 * Validate if current stock is above safety threshold
 * @param {string} itemTypeName - The name of the item type
 * @param {number} currentStock - Current available quantity
 * @returns {Promise<Object>} Validation result with status and details
 */
export const validateSafetyThreshold = async (itemTypeName, currentStock) => {
  const threshold = await getSafetyThreshold(itemTypeName);
  
  // Handle both old (number) and new (object) threshold formats
  const thresholds = typeof threshold === 'object' 
    ? threshold 
    : { max: threshold * 10, reorder: threshold * 2, critical: threshold };
  
  const safeToDistribute = Math.max(0, currentStock - thresholds.critical);
  
  let status = 'optimal';
  let statusColor = 'green';
  
  if (currentStock > thresholds.max) {
    status = 'overstocked';
    statusColor = 'orange';
  } else if (currentStock >= thresholds.reorder) {
    status = 'optimal';
    statusColor = 'green';
  } else if (currentStock >= thresholds.critical) {
    status = 'low';
    statusColor = 'yellow';
  } else {
    status = 'critical';
    statusColor = 'red';
  }
  
  return {
    status,
    statusColor,
    thresholds,
    threshold: thresholds.critical, // For backward compatibility
    currentStock,
    safeToDistribute,
    isAboveThreshold: currentStock > thresholds.critical,
    isBelowReorder: currentStock < thresholds.reorder,
    isOverstocked: currentStock > thresholds.max,
    percentOfMax: thresholds.max > 0 ? Math.round((currentStock / thresholds.max) * 100) : 0,
    message: `${itemTypeName}: ${currentStock} units (Critical: ${thresholds.critical}, Reorder: ${thresholds.reorder}, Max: ${thresholds.max})`
  };
};

/**
 * Synchronous version for when you already have thresholds loaded
 * @param {Object} thresholds - Pre-loaded thresholds object
 * @param {string} itemTypeName - The name of the item type
 * @returns {number} The critical safety threshold
 */
export const getSafetyThresholdSync = (thresholds, itemTypeName) => {
  const threshold = thresholds?.[itemTypeName] || FRONTEND_SAFETY_THRESHOLDS[itemTypeName] || { max: 1000, reorder: 300, critical: 100 };
  // Return critical value for backward compatibility
  return typeof threshold === 'object' ? threshold.critical : threshold;
};

/**
 * Synchronous version that returns full threshold object
 * @param {Object} thresholds - Pre-loaded thresholds object
 * @param {string} itemTypeName - The name of the item type
 * @returns {Object} The threshold object { max, reorder, critical }
 */
export const getFullThresholdSync = (thresholds, itemTypeName) => {
  const threshold = thresholds?.[itemTypeName] || FRONTEND_SAFETY_THRESHOLDS[itemTypeName] || { max: 1000, reorder: 300, critical: 100 };
  // Handle both old (number) and new (object) formats
  return typeof threshold === 'object' 
    ? threshold 
    : { max: threshold * 10, reorder: threshold * 2, critical: threshold };
};



/**
 * Clear the thresholds cache (useful for testing or forced refresh)
 */
export const clearThresholdsCache = () => {
  thresholdsCache = null;
  lastFetch = null;
};

/**
 * Debug function to test safety thresholds in browser console
 * Usage: window.testSafetyThresholds()
 */
export const debugSafetyThresholds = async () => {
  const testItems = ['Canned Goods', 'Rice (10kg)', 'Shorts', 'Face Masks', 'First Aid Kit'];
  console.log('🧪 Testing Safety Thresholds:');
  
  for (const item of testItems) {
    const threshold = await getSafetyThreshold(item);
    console.log(`  ${item}: ${threshold} units`);
  }
  
  const all = await getAllSafetyThresholds();
  console.log(`\nTotal configured items: ${Object.keys(all).length}`);
  
  return all;
};

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  window.testSafetyThresholds = debugSafetyThresholds;
}