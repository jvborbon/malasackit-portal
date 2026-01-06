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

async function clearInventory() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Starting inventory cleanup...\n');

    await client.query('BEGIN');

    // Get count before deletion
    const inventoryCount = await client.query('SELECT COUNT(*) as total FROM Inventory');
    const totalInventory = inventoryCount.rows[0].total;

    console.log(`Found ${totalInventory} inventory records to delete`);

    // Delete all inventory records only
    console.log('\n🗑️  Deleting inventory records...');
    await client.query('DELETE FROM Inventory');

    await client.query('COMMIT');

    console.log('\n✅ Successfully cleared inventory data');
    console.log(`📊 Deleted ${totalInventory} inventory records`);
    console.log('\n💡 Note: Item types and categories preserved. Ready for fresh seeding.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during cleanup:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\n✅ Cleanup completed');
  }
}

clearInventory();
