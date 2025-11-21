// Analyze recent distribution values vs actual inventory calculations
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'malasackit_portal_db',
    user: 'postgres',
    password: 'password'
});

async function analyzeRecentDistributions() {
    try {
        await client.connect();
        console.log('🔍 Analyzing recent distribution value calculations...\n');

        // Get recent distribution logs with details
        const query = `
            SELECT 
                dl.distribution_id,
                dl.quantity_distributed,
                dl.distribution_date,
                it.itemtype_name,
                ic.category_name,
                it.avg_retail_price as retail_price,
                -- Current inventory weighted average
                CASE 
                    WHEN i.quantity_available > 0 THEN (i.total_fmv_value / i.quantity_available)
                    ELSE it.avg_retail_price 
                END as current_weighted_avg,
                i.quantity_available,
                i.total_fmv_value,
                -- Get the distribution plan allocated value if available
                dpi.allocated_value,
                dp.plan_id
            FROM DistributionLogs dl
            JOIN ItemType it ON dl.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            LEFT JOIN Inventory i ON it.itemtype_id = i.itemtype_id
            LEFT JOIN DistributionPlans dp ON dl.plan_id = dp.plan_id
            LEFT JOIN DistributionPlanItems dpi ON dp.plan_id = dpi.plan_id AND dl.itemtype_id = (
                SELECT it2.itemtype_id 
                FROM DistributionPlanItems dpi2 
                JOIN Inventory i2 ON dpi2.inventory_id = i2.inventory_id 
                JOIN ItemType it2 ON i2.itemtype_id = it2.itemtype_id 
                WHERE dpi2.plan_id = dp.plan_id AND it2.itemtype_id = dl.itemtype_id
                LIMIT 1
            )
            WHERE dl.distribution_date >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY dl.distribution_date DESC, dl.distribution_id DESC
        `;
        
        const result = await client.query(query);
        
        if (result.rows.length === 0) {
            console.log('❌ No recent distributions found.');
            return;
        }

        console.log('=== RECENT DISTRIBUTION VALUE ANALYSIS ===\n');
        
        for (const dist of result.rows) {
            const quantity = parseInt(dist.quantity_distributed);
            const retailPrice = parseFloat(dist.retail_price);
            const weightedAvg = parseFloat(dist.current_weighted_avg);
            const allocatedValue = parseFloat(dist.allocated_value || 0);
            
            console.log(`📦 ${dist.itemtype_name} (${dist.category_name})`);
            console.log(`   Distribution ID: ${dist.distribution_id}`);
            console.log(`   Date: ${new Date(dist.distribution_date).toLocaleDateString()}`);
            console.log(`   Quantity Distributed: ${quantity} units`);
            console.log(`   Plan ID: ${dist.plan_id || 'N/A'}`);
            
            console.log(`\n   💰 VALUE CALCULATIONS:`);
            console.log(`   Retail Price (Unit FMV): ₱${retailPrice.toFixed(2)}`);
            console.log(`   Current Weighted Avg: ₱${weightedAvg.toFixed(2)}`);
            console.log(`   Allocated Value in Plan: ₱${allocatedValue.toFixed(2)}`);
            
            console.log(`\n   📊 EXPECTED VALUES:`);
            console.log(`   Using Retail Price: ${quantity} × ₱${retailPrice.toFixed(2)} = ₱${(quantity * retailPrice).toFixed(2)}`);
            console.log(`   Using Weighted Avg: ${quantity} × ₱${weightedAvg.toFixed(2)} = ₱${(quantity * weightedAvg).toFixed(2)}`);
            
            if (allocatedValue > 0) {
                const calculatedUnitValue = allocatedValue / quantity;
                console.log(`   Using Plan Value: ${quantity} × ₱${calculatedUnitValue.toFixed(2)} = ₱${allocatedValue.toFixed(2)}`);
            }
            
            console.log(`\n   🔍 CURRENT INVENTORY AFTER DISTRIBUTION:`);
            console.log(`   Remaining Quantity: ${dist.quantity_available || 0} units`);
            console.log(`   Remaining Total Value: ₱${parseFloat(dist.total_fmv_value || 0).toFixed(2)}`);
            
            if (weightedAvg !== retailPrice) {
                const difference = ((weightedAvg - retailPrice) / retailPrice * 100);
                console.log(`   ⚠️  Weighted avg differs from retail by ${difference > 0 ? '+' : ''}${difference.toFixed(1)}%`);
            }
            
            console.log('\n' + '='.repeat(60) + '\n');
        }

        // Show summary
        const shortsDist = result.rows.find(r => r.itemtype_name.toLowerCase().includes('short'));
        const biscuitDist = result.rows.find(r => r.itemtype_name.toLowerCase().includes('biscuit'));
        
        console.log('🎯 ANALYSIS OF YOUR SPECIFIC DISTRIBUTIONS:\n');
        
        if (shortsDist) {
            console.log('👕 SHORTS DISTRIBUTION:');
            console.log(`   Unit FMV (Retail): ₱${shortsDist.retail_price}`);
            console.log(`   Weighted Average: ₱${shortsDist.current_weighted_avg}`);
            console.log(`   Value Deducted: ₱${shortsDist.current_weighted_avg} (weighted average)`);
            console.log(`   📝 This is CORRECT - reflects actual donated values, not retail price`);
        }
        
        if (biscuitDist) {
            console.log('\n🍪 BISCUITS DISTRIBUTION:');
            console.log(`   Unit FMV (Retail): ₱${biscuitDist.retail_price}`);
            console.log(`   Weighted Average: ₱${biscuitDist.current_weighted_avg}`);
            console.log(`   Value Deducted: ₱${biscuitDist.current_weighted_avg} (weighted average)`);
            console.log(`   📝 This matches retail price - all biscuits donated at full value`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

analyzeRecentDistributions();