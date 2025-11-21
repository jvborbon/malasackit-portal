// Real-world scenarios: How different donation patterns affect weighted averages
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'malasackit_portal_db',
    user: 'postgres',
    password: 'password'
});

async function realWorldScenarios() {
    try {
        await client.connect();
        console.log('🌍 REAL-WORLD WEIGHTED AVERAGE SCENARIOS\n');
        
        // Get current inventory items
        const inventoryQuery = `
            SELECT 
                i.inventory_id,
                i.itemtype_id,
                i.quantity_available,
                i.total_fmv_value,
                it.itemtype_name,
                it.avg_retail_price,
                ic.category_name,
                CASE 
                    WHEN i.quantity_available > 0 THEN (i.total_fmv_value / i.quantity_available)
                    ELSE it.avg_retail_price 
                END as current_weighted_avg
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE i.quantity_available > 0
            ORDER BY 
                CASE 
                    WHEN i.quantity_available > 0 THEN ABS((i.total_fmv_value / i.quantity_available) - it.avg_retail_price)
                    ELSE 0 
                END DESC
            LIMIT 5
        `;
        
        const result = await client.query(inventoryQuery);
        
        console.log('=== CURRENT INVENTORY ANALYSIS ===\n');
        
        for (const item of result.rows) {
            const currentQty = parseInt(item.quantity_available);
            const currentTotal = parseFloat(item.total_fmv_value);
            const currentAvg = parseFloat(item.current_weighted_avg);
            const retailPrice = parseFloat(item.avg_retail_price);
            const variance = ((currentAvg - retailPrice) / retailPrice * 100);
            
            console.log(`📦 ${item.itemtype_name} (${item.category_name})`);
            console.log(`   Current: ${currentQty} units @ ₱${currentAvg.toFixed(2)} avg (₱${currentTotal.toFixed(2)} total)`);
            console.log(`   Retail: ₱${retailPrice.toFixed(2)}`);
            console.log(`   📊 Variance: ${variance >= 0 ? '+' : ''}${variance.toFixed(1)}% from retail`);
            console.log('');
        }
        
        console.log('=== DONATION IMPACT SCENARIOS ===\n');
        
        // Focus on an item with significant variance
        const focusItem = result.rows.find(item => 
            Math.abs(parseFloat(item.current_weighted_avg) - parseFloat(item.avg_retail_price)) > 10
        ) || result.rows[0];
        
        console.log(`🎯 FOCUS ITEM: ${focusItem.itemtype_name}`);
        console.log(`Current State: ${focusItem.quantity_available} units @ ₱${parseFloat(focusItem.current_weighted_avg).toFixed(2)} avg\n`);
        
        // Realistic scenarios
        const scenarios = [
            {
                title: 'CHURCH DRIVE DONATION',
                description: 'Middle-class families donating gently used items',
                donations: [
                    { qty: 8, value: parseFloat(focusItem.avg_retail_price) * 0.75 }, // 75% of retail
                    { qty: 5, value: parseFloat(focusItem.avg_retail_price) * 0.85 }, // 85% of retail
                    { qty: 3, value: parseFloat(focusItem.avg_retail_price) * 0.60 }, // 60% of retail
                ],
                pattern: 'Mixed quality, mostly good condition'
            },
            {
                title: 'CORPORATE DONATION',
                description: 'Company donating bulk new/excellent items',
                donations: [
                    { qty: 20, value: parseFloat(focusItem.avg_retail_price) * 0.95 }, // 95% of retail
                    { qty: 15, value: parseFloat(focusItem.avg_retail_price) * 1.0 },  // 100% of retail
                ],
                pattern: 'High quality, consistent values'
            },
            {
                title: 'COMMUNITY CLEAN-OUT',
                description: 'Neighbors donating mixed quality items',
                donations: [
                    { qty: 12, value: parseFloat(focusItem.avg_retail_price) * 0.40 }, // 40% of retail
                    { qty: 8, value: parseFloat(focusItem.avg_retail_price) * 0.55 },  // 55% of retail
                    { qty: 6, value: parseFloat(focusItem.avg_retail_price) * 0.30 },  // 30% of retail
                    { qty: 4, value: parseFloat(focusItem.avg_retail_price) * 0.70 },  // 70% of retail
                ],
                pattern: 'Lower quality, wide variation'
            }
        ];
        
        for (const scenario of scenarios) {
            console.log(`📋 ${scenario.title}:`);
            console.log(`   ${scenario.description}`);
            console.log(`   Pattern: ${scenario.pattern}\n`);
            
            let runningQty = parseInt(focusItem.quantity_available);
            let runningTotal = parseFloat(focusItem.total_fmv_value);
            let runningAvg = parseFloat(focusItem.current_weighted_avg);
            
            console.log(`   Starting: ${runningQty} units @ ₱${runningAvg.toFixed(2)} = ₱${runningTotal.toFixed(2)}`);
            
            for (let i = 0; i < scenario.donations.length; i++) {
                const donation = scenario.donations[i];
                const donationTotal = donation.qty * donation.value;
                
                const newQty = runningQty + donation.qty;
                const newTotal = runningTotal + donationTotal;
                const newAvg = newTotal / newQty;
                const change = newAvg - runningAvg;
                
                console.log(`   + Batch ${i+1}: ${donation.qty} units @ ₱${donation.value.toFixed(2)} = +₱${donationTotal.toFixed(2)}`);
                console.log(`     New Avg: ₱${newAvg.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`);
                
                runningQty = newQty;
                runningTotal = newTotal;
                runningAvg = newAvg;
            }
            
            const totalChange = runningAvg - parseFloat(focusItem.current_weighted_avg);
            const totalChangePercent = (totalChange / parseFloat(focusItem.current_weighted_avg)) * 100;
            
            console.log(`   \n   📊 FINAL RESULT:`);
            console.log(`   Total: ${runningQty} units @ ₱${runningAvg.toFixed(2)} = ₱${runningTotal.toFixed(2)}`);
            console.log(`   📈 Net Change: ${totalChange >= 0 ? '+' : ''}₱${totalChange.toFixed(2)} (${totalChangePercent >= 0 ? '+' : ''}${totalChangePercent.toFixed(1)}%)`);
            console.log(`   📊 New vs Retail: ${((runningAvg - parseFloat(focusItem.avg_retail_price)) / parseFloat(focusItem.avg_retail_price) * 100).toFixed(1)}%\n`);
        }
        
        console.log('=== PRACTICAL IMPLICATIONS ===');
        console.log('🎯 Distribution Planning:');
        console.log('   • Same item distributed at different times = different values');
        console.log('   • Recent high-value donations increase distribution costs');
        console.log('   • Recent low-value donations decrease distribution costs\n');
        
        console.log('📊 Financial Tracking:');
        console.log('   • Inventory value fluctuates with donation patterns');
        console.log('   • More accurate than fixed pricing');
        console.log('   • Reflects actual donated item conditions\n');
        
        console.log('🔄 System Behavior:');
        console.log('   • Each approved donation recalculates weighted averages');
        console.log('   • Distribution plans use current-time weighted averages');
        console.log('   • Historical distributions may show different unit values');
        console.log('   • Seasonal donation patterns create predictable trends\n');
        
        console.log('💡 Management Insights:');
        console.log('   • High-value donation campaigns improve average asset values');
        console.log('   • Quality control at intake affects financial metrics');
        console.log('   • Distribution timing impacts reported distribution costs');
        console.log('   • Donor value assessment directly affects inventory worth');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

realWorldScenarios();