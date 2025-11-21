/**
 * Debug script to check what item names are in the inventory vs. our configuration
 * Run this in the browser console after the inventory loads
 */

console.log('🔍 Debugging Safety Threshold Lookup');

// Check what inventory items we have
const checkInventoryItems = () => {
  // Find the inventory data from React component
  const inventoryElements = document.querySelectorAll('[data-item]');
  if (inventoryElements.length > 0) {
    console.log('📦 Found inventory elements:', inventoryElements.length);
  }

  // Check what's in localStorage or sessionStorage
  const checkStorage = () => {
    const keys = Object.keys(localStorage);
    console.log('🗄️ Local storage keys:', keys);
  };
  
  checkStorage();
  
  // Test specific threshold lookups
  const testThresholds = async () => {
    try {
      // Try to import the safety thresholds utility
      const { getSafetyThreshold, getSafetyThresholdSync, getAllSafetyThresholds } = 
        await import('./src/utils/safetyThresholds.js');
      
      console.log('🧪 Testing threshold lookups:');
      
      const testItems = [
        'Biscuits',
        'Biscuits (Pack)', 
        'biscuits',
        'BISCUITS'
      ];
      
      const allThresholds = await getAllSafetyThresholds();
      
      testItems.forEach(async (item) => {
        const threshold = await getSafetyThreshold(item);
        const syncThreshold = getSafetyThresholdSync(allThresholds, item);
        console.log(`  "${item}": async=${threshold}, sync=${syncThreshold}`);
      });
      
      console.log('\n📋 All Biscuit-related entries in config:');
      Object.keys(allThresholds).filter(key => 
        key.toLowerCase().includes('biscuit')
      ).forEach(key => {
        console.log(`  "${key}": ${allThresholds[key]}`);
      });
      
    } catch (error) {
      console.error('❌ Error testing thresholds:', error);
    }
  };
  
  testThresholds();
};

// Run the check
checkInventoryItems();

// Also make it available globally
window.debugThresholds = checkInventoryItems;