import { query } from '../src/db.js';

const testDatabaseConnection = async () => {
    try {
        console.log('Testing database connection...');
        
        // Test basic connection
        const result = await query('SELECT NOW() as current_time');
        console.log('✅ Database connection successful!');
        console.log('Current time from database:', result.rows[0].current_time);
        
        // Test if Users table exists
        const tableCheck = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
        `);
        
        if (tableCheck.rows.length > 0) {
            console.log('✅ Users table exists');
        } else {
            console.log('❌ Users table not found');
        }
        
        // Test if Roles table exists and has Donor role
        const roleCheck = await query(`
            SELECT role_id, role_name 
            FROM Roles 
            WHERE role_name = 'Donor'
        `);
        
        if (roleCheck.rows.length > 0) {
            console.log('✅ Donor role found:', roleCheck.rows[0]);
        } else {
            console.log('❌ Donor role not found');
        }
        
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
    }
};

testDatabaseConnection();