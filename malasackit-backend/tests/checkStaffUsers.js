import { query } from '../src/db.js';

const checkStaffUsers = async () => {
    try {
        console.log('🔍 Checking for staff and admin users...');
        
        const staffQuery = `
            SELECT user_id, full_name, email, account_type
            FROM Users 
            WHERE account_type IN ('Resource Staff', 'Executive Admin')
        `;
        
        const result = await query(staffQuery);
        
        console.log(`📋 Total staff/admin users found: ${result.rows.length}`);
        
        if (result.rows.length === 0) {
            console.log('❌ No staff or admin users found!');
            console.log('   This is why notifications are not being sent.');
            
            // Check all users to see what account types exist
            const allUsersQuery = 'SELECT DISTINCT account_type, COUNT(*) as count FROM Users GROUP BY account_type';
            const allUsersResult = await query(allUsersQuery);
            
            console.log('\n📊 Available account types:');
            allUsersResult.rows.forEach(row => {
                console.log(`   - ${row.account_type}: ${row.count} users`);
            });
        } else {
            console.log('\n👥 Staff/Admin users:');
            result.rows.forEach(user => {
                console.log(`   - ${user.full_name} (${user.account_type})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking staff users:', error);
    }
};

await checkStaffUsers();
process.exit(0);