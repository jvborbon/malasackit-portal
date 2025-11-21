// Demonstration: How weighted averages change with new donations
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'malasackit_portal_db',
    user: 'postgres',
    password: 'password'
});

async function demonstrateWeightedAverageChanges() {
    try {
        await client.connect();
        console.log('📊 WEIGHTED AVERAGE DYNAMICS DEMONSTRATION\n');
        
        // Get current state of an item with non-uniform values (like Shorts)
        const currentStateQuery = `
            SELECT 
                i.inventory_id,
                i.itemtype_id,
                i.quantity_available,
                i.total_fmv_value,
                it.itemtype_name,
                it.avg_retail_price,
                CASE 
                    WHEN i.quantity_available > 0 THEN (i.total_fmv_value / i.quantity_available)
                    ELSE it.avg_retail_price 
                END as current_weighted_avg
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            WHERE it.itemtype_name ILIKE '%short%'
            ORDER BY i.inventory_id
            LIMIT 1
        `;
        
        const result = await client.query(currentStateQuery);
        
        if (result.rows.length === 0) {
            console.log('❌ No Shorts inventory found');
            return;
        }
        
        const item = result.rows[0];
        const currentQty = parseInt(item.quantity_available);
        const currentTotal = parseFloat(item.total_fmv_value);
        const currentAvg = parseFloat(item.current_weighted_avg);
        const retailPrice = parseFloat(item.avg_retail_price);
        
        console.log('=== CURRENT STATE ===');
        console.log(`📦 Item: ${item.itemtype_name}`);
        console.log(`📊 Current Inventory: ${currentQty} units`);
        console.log(`💰 Total Value: ₱${currentTotal.toFixed(2)}`);
        console.log(`🧮 Current Weighted Average: ₱${currentAvg.toFixed(2)}`);
        console.log(`🏷️  Retail Price: ₱${retailPrice.toFixed(2)}`);
        console.log(`📈 Current avg is ${((currentAvg - retailPrice) / retailPrice * 100).toFixed(1)}% ${currentAvg >= retailPrice ? 'above' : 'below'} retail\n`);
        
        // Simulate different donation scenarios
        console.log('=== DONATION SCENARIOS ===\n');
        
        const scenarios = [
            {
                name: 'HIGH-VALUE DONATION',
                description: '5 excellent condition shorts at ₱250 each',
                newQty: 5,
                newValue: 250,
                impact: 'Will INCREASE weighted average'
            },
            {
                name: 'LOW-VALUE DONATION', 
                description: '10 worn shorts at ₱100 each',
                newQty: 10,
                newValue: 100,
                impact: 'Will DECREASE weighted average'
            },
            {
                name: 'RETAIL-VALUE DONATION',
                description: '3 good condition shorts at retail ₱200 each',
                newQty: 3,
                newValue: 200,
                impact: 'Will move weighted average toward retail price'
            },
            {
                name: 'MIXED-VALUE DONATION',
                description: '8 shorts: 3@₱300, 3@₱150, 2@₱200',
                newQty: 8,
                newValue: (3*300 + 3*150 + 2*200) / 8, // ₱212.50 average
                impact: 'Will slightly increase weighted average'
            }
        ];
        
        for (const scenario of scenarios) {
            const newTotalValue = scenario.newQty * scenario.newValue;
            const combinedQty = currentQty + scenario.newQty;
            const combinedValue = currentTotal + newTotalValue;
            const newWeightedAvg = combinedValue / combinedQty;
            const change = newWeightedAvg - currentAvg;
            const changePercent = (change / currentAvg * 100);
            
            console.log(`🎯 ${scenario.name}:`);
            console.log(`   ${scenario.description}`);
            console.log(`   📊 ${scenario.impact}`);
            console.log(`   \n   CALCULATION:`);
            console.log(`   Current: ${currentQty} units × ₱${currentAvg.toFixed(2)} = ₱${currentTotal.toFixed(2)}`);
            console.log(`   New:     ${scenario.newQty} units × ₱${scenario.newValue.toFixed(2)} = ₱${newTotalValue.toFixed(2)}`);
            console.log(`   Total:   ${combinedQty} units = ₱${combinedValue.toFixed(2)}`);
            console.log(`   \n   NEW WEIGHTED AVERAGE: ₱${newWeightedAvg.toFixed(2)}`);
            console.log(`   📈 Change: ${change >= 0 ? '+' : ''}₱${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%)`);
            console.log(`   📊 New avg vs retail: ${((newWeightedAvg - retailPrice) / retailPrice * 100).toFixed(1)}% ${newWeightedAvg >= retailPrice ? 'above' : 'below'}\n`);
        }
        
        console.log('=== KEY INSIGHTS ===');
        console.log('✅ Weighted averages are DYNAMIC and change with every donation');
        console.log('✅ High-value donations INCREASE the weighted average');
        console.log('✅ Low-value donations DECREASE the weighted average');
        console.log('✅ Large quantity donations have MORE impact than small ones');
        console.log('✅ Each new donation shifts the average based on its value ratio');
        console.log('✅ Items without fixed conditions show the most variation');
        
        console.log('\n=== DISTRIBUTION IMPACT ===');
        console.log('📦 Each distribution uses the CURRENT weighted average at time of execution');
        console.log('📊 Same item type may have different values distributed at different times');
        console.log('🔄 This reflects the actual mixed-condition nature of donated items');
        console.log('💡 More accurate than using fixed retail prices for all distributions');
        
        // Show historical trend simulation
        console.log('\n=== TREND SIMULATION ===');
        console.log('If we had 10 consecutive donations with different values:');
        
        let simQty = currentQty;
        let simTotal = currentTotal;
        let simAvg = currentAvg;
        
        const donations = [280, 120, 200, 180, 250, 100, 220, 160, 240, 130]; // Random values
        
        for (let i = 0; i < donations.length; i++) {
            const donationValue = donations[i];
            const donationQty = 2; // 2 items each donation
            
            simQty += donationQty;
            simTotal += (donationValue * donationQty);
            const newSimAvg = simTotal / simQty;
            const change = newSimAvg - simAvg;
            
            console.log(`Donation ${i+1}: +${donationQty}@₱${donationValue} → Avg: ₱${newSimAvg.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`);
            simAvg = newSimAvg;
        }
        
        console.log(`\n🎯 Final weighted average after 10 donations: ₱${simAvg.toFixed(2)}`);
        console.log(`📈 Total change from current: ${simAvg >= currentAvg ? '+' : ''}₱${(simAvg - currentAvg).toFixed(2)}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

demonstrateWeightedAverageChanges();