// Script to fix inventory values after quantity deductions
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'malasackit_db',
    user: 'postgres',
    password: 'password'
});

async function fixInventoryValues() {
    try {
        await client.connect();
        console.log('🔧 Fixing inventory values...');

        // Get all inventory items with their item type FMV
        const query = `
            SELECT i.inventory_id, i.quantity_available, i.total_fmv_value,
                   it.itemtype_name, it.avg_retail_price as unit_fmv
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            WHERE i.quantity_available > 0
        `;
        
        const result = await client.query(query);
        
        console.log('\n=== CURRENT INVENTORY VALUES ===');
        console.table(result.rows);

        for (const item of result.rows) {
            const correctValue = item.quantity_available * parseFloat(item.unit_fmv);
            const currentValue = parseFloat(item.total_fmv_value);
            
            if (Math.abs(correctValue - currentValue) > 0.01) { // If difference > 1 cent
                console.log(`\n📊 Fixing ${item.itemtype_name}:`);
                console.log(`   Current: ${item.quantity_available} units × ₱${item.unit_fmv} = ₱${correctValue}`);
                console.log(`   Database shows: ₱${currentValue}`);
                
                // Update the inventory value
                await client.query(
                    'UPDATE Inventory SET total_fmv_value = $1 WHERE inventory_id = $2',
                    [correctValue, item.inventory_id]
                );
                
                console.log(`   ✅ Updated to ₱${correctValue}`);
            }
        }

        console.log('\n✅ Inventory values fixed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixInventoryValues();