// Test script to run in browser console to verify safety thresholds
// After the DistributeDonationForm loads, run this in the console:

console.log('🧪 Testing Safety Thresholds in Browser');

// Import and test the safety threshold functions
import('./src/utils/safetyThresholds.js').then(async (module) => {
  const { getSafetyThreshold, getAllSafetyThresholds, debugSafetyThresholds } = module;
  
  console.log('📋 Testing individual thresholds:');
  const testItems = ['Canned Goods', 'Rice (10kg)', 'Shorts', 'Face Masks', 'First Aid Kit'];
  
  for (const item of testItems) {
    const threshold = await getSafetyThreshold(item);
    console.log(`  ${item}: ${threshold} units`);
  }
  
  console.log('\n📊 All thresholds loaded:');
  const all = await getAllSafetyThresholds();
  console.log(`Total configured items: ${Object.keys(all).length}`);
  
  // Test the debug function
  await debugSafetyThresholds();
}).catch(console.error);

// Alternative simple test (if imports don't work):
/*
console.log('🔍 Testing from component state:');
// Look for the DistributeDonationForm component data
const inventoryData = window.React?.findDOMNode?.('inventory-data') || 'Not found';
console.log('Inventory data:', inventoryData);
*/