// Script to fix allocated values in existing distribution plans
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'malasackit_portal_db',
    user: 'postgres',
    password: 'password'
});

async function fixDistributionPlanValues() {
    try {
        await client.connect();
        console.log('🔧 Fixing distribution plan allocated values...');

        // Get all distribution plan items with their item details
        const query = `
            SELECT dpi.plan_item_id, dpi.plan_id, dpi.quantity, dpi.allocated_value,
                   it.itemtype_name, it.avg_retail_price,
                   -- Calculate actual weighted average unit value from inventory
                   CASE 
                       WHEN i.quantity_available > 0 THEN (i.total_fmv_value / i.quantity_available)
                       ELSE it.avg_retail_price 
                   END as actual_unit_value,
                   i.total_fmv_value, i.quantity_available
            FROM DistributionPlanItems dpi
            JOIN Inventory i ON dpi.inventory_id = i.inventory_id
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            WHERE dpi.allocated_value = 0 OR dpi.allocated_value IS NULL
        `;
        
        const result = await client.query(query);
        
        if (result.rows.length === 0) {
            console.log('✅ No distribution plan items need fixing.');
            return;
        }

        console.log('\n=== DISTRIBUTION PLAN ITEMS TO FIX ===');
        console.table(result.rows);

        for (const item of result.rows) {
            // Use the actual weighted average unit value from inventory
            const actualUnitValue = parseFloat(item.actual_unit_value);
            const correctValue = item.quantity * actualUnitValue;
            const retailValue = item.quantity * parseFloat(item.avg_retail_price);
            
            console.log(`\n📊 Fixing Plan #${item.plan_id} - ${item.itemtype_name}:`);
            console.log(`   Inventory: ${item.quantity_available} units, Total Value: ₱${item.total_fmv_value}`);
            console.log(`   Weighted Avg Unit Value: ₱${actualUnitValue.toFixed(2)} (${item.total_fmv_value}/${item.quantity_available})`);
            console.log(`   Retail Unit Value: ₱${item.avg_retail_price}`);
            console.log(`   Quantity: ${item.quantity} × ₱${actualUnitValue.toFixed(2)} = ₱${correctValue.toFixed(2)} (weighted avg)`);
            console.log(`   vs Retail: ${item.quantity} × ₱${item.avg_retail_price} = ₱${retailValue.toFixed(2)} (retail price)`);
            console.log(`   Current allocated_value: ₱${item.allocated_value}`);
            
            // Update the allocated value using weighted average
            await client.query(
                'UPDATE DistributionPlanItems SET allocated_value = $1 WHERE plan_item_id = $2',
                [correctValue, item.plan_item_id]
            );
            
            console.log(`   ✅ Updated to ₱${correctValue.toFixed(2)} (using weighted average)`);
        }

        console.log('\n✅ Distribution plan allocated values fixed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixDistributionPlanValues();