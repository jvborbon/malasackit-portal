import { query } from './src/db.js';

(async () => {
    try {
        console.log('\n=== Fixing Face Masks Duplicate ===\n');
        
        // Check which one has inventory
        const check = await query(`
            SELECT 
                it.itemtype_id, 
                ic.category_name,
                i.inventory_id,
                i.quantity_available
            FROM ItemType it 
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id 
            LEFT JOIN Inventory i ON it.itemtype_id = i.itemtype_id 
            WHERE it.itemtype_name = 'Face Masks' 
            ORDER BY it.itemtype_id
        `);
        
        console.log('Current Face Masks records:');
        check.rows.forEach(row => {
            console.log(`- ID ${row.itemtype_id} (${row.category_name}): ${row.inventory_id ? `Has inventory (qty: ${row.quantity_available})` : 'No inventory'}`);
        });
        
        // Find the one without inventory
        const toDelete = check.rows.find(r => r.inventory_id === null);
        
        if (toDelete) {
            console.log(`\n✓ Deleting ItemType ID ${toDelete.itemtype_id} (${toDelete.category_name}) - no inventory impact`);
            
            await query('DELETE FROM ItemType WHERE itemtype_id = $1', [toDelete.itemtype_id]);
            
            console.log('✓ Duplicate removed successfully!');
            
            // Verify
            const final = await query(`SELECT COUNT(*) as count FROM ItemType WHERE itemtype_name = 'Face Masks'`);
            console.log(`\nFinal count: ${final.rows[0].count} Face Masks ItemType(s)`);
        } else {
            console.log('\n⚠ Both have inventory records - manual review needed');
        }
        
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
})();
