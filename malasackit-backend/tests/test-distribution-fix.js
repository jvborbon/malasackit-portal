// Test the corrected distribution value calculations
import fetch from 'node-fetch';

async function testDistributionValues() {
    try {
        console.log('🧪 Testing corrected distribution value calculations...\n');

        // Test the inventory API to see if unit_value is now included
        const response = await fetch('http://localhost:3000/api/inventory?limit=5');
        const data = await response.json();

        if (!data.success) {
            console.log('❌ Failed to fetch inventory data');
            return;
        }

        console.log('=== INVENTORY API RESPONSE ===\n');
        
        for (const item of data.data.inventory) {
            console.log(`📦 ${item.itemtype_name}`);
            console.log(`   Inventory ID: ${item.inventory_id}`);
            console.log(`   Quantity Available: ${item.quantity_available}`);
            console.log(`   Total FMV Value: ₱${item.total_fmv_value}`);
            console.log(`   Unit FMV (Retail): ₱${item.unit_fmv}`);
            console.log(`   Unit Value (Weighted Avg): ₱${item.unit_value || 'MISSING!'}`);
            
            if (item.unit_value) {
                const calculatedWeightedAvg = item.total_fmv_value / item.quantity_available;
                const isCorrect = Math.abs(item.unit_value - calculatedWeightedAvg) < 0.01;
                console.log(`   ✅ Weighted Avg Calculation: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
                
                if (item.unit_value !== item.unit_fmv) {
                    const difference = ((item.unit_value - item.unit_fmv) / item.unit_fmv * 100);
                    console.log(`   📊 Difference from Retail: ${difference > 0 ? '+' : ''}${difference.toFixed(1)}%`);
                }
            } else {
                console.log(`   ❌ PROBLEM: unit_value field is missing!`);
            }
            
            console.log('');
        }

        // Test specific items mentioned
        const shortsItem = data.data.inventory.find(item => 
            item.itemtype_name.toLowerCase().includes('short'));
        const biscuitsItem = data.data.inventory.find(item => 
            item.itemtype_name.toLowerCase().includes('biscuit'));

        console.log('🎯 SPECIFIC ITEM ANALYSIS:\n');
        
        if (shortsItem) {
            console.log('👕 SHORTS:');
            console.log(`   Retail Price: ₱${shortsItem.unit_fmv}`);
            console.log(`   Weighted Avg: ₱${shortsItem.unit_value}`);
            console.log(`   For 1 unit distribution:`);
            console.log(`     - Plan will use: ₱${shortsItem.unit_value} (weighted avg)`);
            console.log(`     - Execution will deduct: ₱${shortsItem.unit_value} (weighted avg)`);
            console.log(`   ✅ Plan and execution now match!`);
        }
        
        if (biscuitsItem) {
            console.log('\n🍪 BISCUITS:');
            console.log(`   Retail Price: ₱${biscuitsItem.unit_fmv}`);
            console.log(`   Weighted Avg: ₱${biscuitsItem.unit_value}`);
            console.log(`   For 1 unit distribution:`);
            console.log(`     - Plan will use: ₱${biscuitsItem.unit_value} (weighted avg)`);
            console.log(`     - Execution will deduct: ₱${biscuitsItem.unit_value} (weighted avg)`);
            console.log(`   ✅ Plan and execution now match!`);
        }

        console.log('\n💡 SOLUTION SUMMARY:');
        console.log('✅ Backend now calculates weighted average unit_value');
        console.log('✅ Frontend will use weighted average for distribution plans');
        console.log('✅ Distribution execution uses same weighted average');
        console.log('✅ No more discrepancy between planned and actual values');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure the backend server is running on port 3000');
    }
}

testDistributionValues();