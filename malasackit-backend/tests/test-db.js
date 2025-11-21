// Test database connection
import { query } from '../src/db.js';

const testDB = async () => {
    try {
        const result = await query('SELECT NOW() as current_time');
        console.log('Database connection successful:', result.rows[0]);
        
        // Test if DonationRequests table exists
        const tableTest = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'donationrequests'
        `);
        console.log('DonationRequests table exists:', tableTest.rows.length > 0);
        
    } catch (error) {
        console.error('Database connection error:', error);
    }
    process.exit();
};

testDB();