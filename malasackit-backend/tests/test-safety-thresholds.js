/**
 * Test script to verify safety thresholds configuration
 * 
 * Usage: node test-safety-thresholds.js
 */

import { getSafetyThreshold, validateSafetyThreshold, getAllSafetyThresholds } from '../src/config/safetyThresholds.js';

console.log('🧪 Testing Safety Thresholds Configuration\n');

// Test individual threshold lookups
console.log('📋 Individual Threshold Tests:');
const testItems = [
    'Canned Goods',
    'Rice (10kg)', 
    'Shorts',
    'Face Masks',
    'First Aid Kit',
    'Unknown Item'
];

testItems.forEach(item => {
    const threshold = getSafetyThreshold(item);
    console.log(`  ${item}: ${threshold} units`);
});

console.log('\n🔍 Validation Tests:');

// Test validation scenarios
const testScenarios = [
    { item: 'Canned Goods', stock: 250 }, // Below threshold (300)
    { item: 'Canned Goods', stock: 350 }, // Above threshold  
    { item: 'Rice (10kg)', stock: 15 },   // Below threshold (20)
    { item: 'Rice (10kg)', stock: 25 },   // Above threshold
    { item: 'Shorts', stock: 45 },        // Below threshold (50)
    { item: 'Face Masks', stock: 220 },   // Above threshold (200)
];

testScenarios.forEach(scenario => {
    const result = validateSafetyThreshold(scenario.item, scenario.stock);
    console.log(`  ${scenario.item} (${scenario.stock} units): ${result.status.toUpperCase()}`);
    console.log(`    → Safe to distribute: ${result.safeToDistribute}`);
    console.log(`    → Threshold: ${result.threshold}`);
});

console.log('\n📊 Category Overview:');

// Show thresholds by category
const allThresholds = getAllSafetyThresholds();
const categories = {
    'Food Items': ['Canned Goods', 'Rice (10kg)', 'Rice (25kg)', 'Noodles', 'Biscuits (Pack)'],
    'Hygiene Items': ['Soap', 'Toothpaste', 'Face Masks', 'Alcohol', 'Hand Sanitizer'],
    'Clothing': ['T-Shirts', 'Pants', 'Shorts', 'Underwear (New Only)', 'Socks'],
    'Shelter Materials': ['Blankets', 'Tents', 'Tarpaulins', 'Pillows', 'Sleeping Bags'],
    'Medical Supplies': ['First Aid Kit', 'Bandages', 'Face Masks', 'Basic Medicines']
};

Object.entries(categories).forEach(([category, items]) => {
    console.log(`\n  ${category}:`);
    items.forEach(item => {
        const threshold = allThresholds[item] || 'Not configured';
        console.log(`    ${item}: ${threshold}`);
    });
});

console.log('\n✅ Safety thresholds test completed!');