import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

async function cleanupDuplicates() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for duplicate categories...\n');

    await client.query('BEGIN');

    // Map duplicate categories to their correct originals
    const categoryMapping = {
      'Food': 'Food Items',
      'Hygiene': 'Household Essentials/Personal Care',
      'Bedding': 'Shelter Materials',
      'Educational': 'Educational Materials',
      'Kitchen': 'Kitchen Utensils',
      'Medical': 'Medical Supplies'
    };

    for (const [duplicateName, correctName] of Object.entries(categoryMapping)) {
      // Find the duplicate category
      const duplicateResult = await client.query(
        'SELECT itemcategory_id FROM ItemCategory WHERE category_name = $1',
        [duplicateName]
      );

      if (duplicateResult.rows.length === 0) {
        console.log(`✓ No duplicate found for '${duplicateName}'`);
        continue;
      }

      const duplicateId = duplicateResult.rows[0].itemcategory_id;

      // Find the correct category
      const correctResult = await client.query(
        'SELECT itemcategory_id FROM ItemCategory WHERE category_name = $1',
        [correctName]
      );

      if (correctResult.rows.length === 0) {
        console.log(`⚠️  Correct category '${correctName}' not found, skipping...`);
        continue;
      }

      const correctId = correctResult.rows[0].itemcategory_id;

      // Count items that will be moved
      const itemCount = await client.query(
        'SELECT COUNT(*) as total FROM ItemType WHERE itemcategory_id = $1',
        [duplicateId]
      );

      const total = itemCount.rows[0].total;

      if (total > 0) {
        console.log(`\n📦 Moving ${total} item types from '${duplicateName}' (ID: ${duplicateId}) to '${correctName}' (ID: ${correctId})`);
        
        // Update ItemType records to use correct category
        await client.query(
          'UPDATE ItemType SET itemcategory_id = $1 WHERE itemcategory_id = $2',
          [correctId, duplicateId]
        );
        
        console.log(`✅ Moved ${total} item types`);
      }

      // Now delete the duplicate category
      console.log(`🗑️  Deleting duplicate category '${duplicateName}' (ID: ${duplicateId})`);
      await client.query('DELETE FROM ItemCategory WHERE itemcategory_id = $1', [duplicateId]);
      console.log(`✅ Deleted duplicate category`);
    }

    await client.query('COMMIT');

    console.log('\n✅ Cleanup completed successfully!');
    console.log('\n📊 Final category list:');
    
    const finalCategories = await client.query(
      `SELECT ic.itemcategory_id, ic.category_name, COUNT(it.itemtype_id) as item_count 
       FROM ItemCategory ic 
       LEFT JOIN ItemType it ON ic.itemcategory_id = it.itemcategory_id 
       GROUP BY ic.itemcategory_id, ic.category_name 
       ORDER BY ic.itemcategory_id`
    );
    
    finalCategories.rows.forEach(cat => {
      console.log(`  ${cat.itemcategory_id}. ${cat.category_name} (${cat.item_count} items)`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during cleanup:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupDuplicates();
