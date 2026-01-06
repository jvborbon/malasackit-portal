import { query } from './src/db.js';

(async () => {
    try {
        const faceMasks = await query(`
            SELECT 
                it.itemtype_id, 
                it.itemtype_name, 
                it.itemcategory_id, 
                ic.category_name, 
                i.inventory_id, 
                i.quantity_available 
            FROM ItemType it 
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id 
            LEFT JOIN Inventory i ON it.itemtype_id = i.itemtype_id 
            WHERE it.itemtype_name = 'Face Masks' 
            ORDER BY it.itemtype_id
        `);
        
        console.log('\n=== Face Masks Duplicate Analysis ===');
        console.table(faceMasks.rows);
        
        const withInventory = faceMasks.rows.filter(r => r.inventory_id !== null);
        const withoutInventory = faceMasks.rows.filter(r => r.inventory_id === null);
        
        console.log('\nWith Inventory:', withInventory.length);
        console.log('Without Inventory:', withoutInventory.length);
        
        if (withoutInventory.length > 0) {
            console.log('\nRecommendation: Delete ItemType ID', withoutInventory[0].itemtype_id, 
                        '(', withoutInventory[0].category_name, ') as it has no inventory.');
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
