// Test script to verify inventory unit_value calculations
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'malasackit_portal_db',
    user: 'postgres',
    password: 'password'
});

async function testInventoryUnitValues() {
    try {
        await client.connect();
        console.log('🔍 Testing inventory unit_value calculations...\n');

        // Test the updated inventory query
        const query = `
            SELECT 
                i.inventory_id,
                i.itemtype_id,
                i.quantity_available,
                i.total_fmv_value,
                it.itemtype_name,
                it.avg_retail_price as unit_fmv,
                -- Calculate weighted average unit value (actual value per unit in inventory)
                CASE 
                    WHEN i.quantity_available > 0 THEN (i.total_fmv_value / i.quantity_available)
                    ELSE it.avg_retail_price 
                END as unit_value,
                ic.category_name
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE i.quantity_available > 0
            ORDER BY it.itemtype_name
            LIMIT 10
        `;
        
        const result = await client.query(query);
        
        if (result.rows.length === 0) {
            console.log('❌ No inventory items found.');
            return;
        }

        console.log('=== INVENTORY UNIT VALUE CALCULATIONS ===\n');
        
        for (const item of result.rows) {
            const unitValue = parseFloat(item.unit_value);
            const retailPrice = parseFloat(item.unit_fmv);
            const totalValue = parseFloat(item.total_fmv_value);
            const quantity = parseInt(item.quantity_available);
            
            console.log(`📦 ${item.itemtype_name} (${item.category_name})`);
            console.log(`   Inventory ID: ${item.inventory_id}`);
            console.log(`   Quantity Available: ${quantity} units`);
            console.log(`   Total FMV Value: ₱${totalValue.toFixed(2)}`);
            console.log(`   Retail Price (Unit FMV): ₱${retailPrice.toFixed(2)}`);
            console.log(`   📊 Weighted Avg Unit Value: ₱${unitValue.toFixed(2)} (${totalValue}/${quantity})`);
            
            // Verify calculation
            const calculatedUnitValue = totalValue / quantity;
            const isCorrect = Math.abs(unitValue - calculatedUnitValue) < 0.01;
            
            console.log(`   ✅ Calculation Check: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
            
            if (unitValue !== retailPrice) {
                const difference = ((unitValue - retailPrice) / retailPrice * 100);
                console.log(`   📈 Difference from Retail: ${difference > 0 ? '+' : ''}${difference.toFixed(1)}%`);
            } else {
                console.log(`   📊 Same as Retail Price`);
            }
            
            console.log('');
        }

        console.log('\n=== SUMMARY ===');
        console.log(`✅ Found ${result.rows.length} inventory items with calculated unit values`);
        console.log('💡 unit_value field now contains weighted average values based on actual inventory');
        console.log('💡 This will be used for accurate distribution value calculations');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

testInventoryUnitValues();