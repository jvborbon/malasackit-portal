import { query } from './src/db.js';

(async () => {
    try {
        const all = await query('SELECT COUNT(*) FROM Inventory');
        const withStock = await query('SELECT COUNT(*) FROM Inventory WHERE quantity_available > 0');
        const zeroStock = await query('SELECT COUNT(*) FROM Inventory WHERE quantity_available = 0');
        
        // Check the getAllInventory query (what distribution form uses)
        const getAllQuery = `
            SELECT COUNT(*) as total
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
        `;
        const getAllResult = await query(getAllQuery);
        
        console.log('\n=== INVENTORY COUNT ANALYSIS ===');
        console.log('Total Inventory records:', all.rows[0].count);
        console.log('With stock (qty > 0):', withStock.rows[0].count);
        console.log('Zero stock (qty = 0):', zeroStock.rows[0].count);
        console.log('---');
        console.log('getAllInventory query (with JOINs):', getAllResult.rows[0].total);
        console.log('Missing records:', parseInt(all.rows[0].count) - parseInt(getAllResult.rows[0].total));
        console.log('================================\n');
        
        // Check for orphaned records
        const orphaned = await query(`
            SELECT i.inventory_id, i.itemtype_id, i.quantity_available
            FROM Inventory i
            LEFT JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            WHERE it.itemtype_id IS NULL
        `);
        
        if (orphaned.rows.length > 0) {
            console.log('⚠️  Found orphaned inventory records (no matching ItemType):');
            console.log(orphaned.rows);
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
