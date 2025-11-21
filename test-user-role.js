// Test script to check user roles
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'malasackit_db',
    user: 'postgres',
    password: 'password'
});

async function checkUserRoles() {
    try {
        await client.connect();
        
        console.log('=== ALL USER ROLES ===');
        const rolesResult = await client.query('SELECT DISTINCT role FROM Users ORDER BY role');
        console.log('Available roles:', rolesResult.rows.map(r => r.role));
        
        console.log('\n=== CURRENT USERS ===');
        const usersResult = await client.query('SELECT user_id, full_name, role FROM Users ORDER BY user_id');
        console.table(usersResult.rows);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

checkUserRoles();