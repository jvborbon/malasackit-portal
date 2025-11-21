import { query } from './src/db.js';

const createStaffUser = async () => {
    try {
        console.log('🔧 Creating a staff user for testing notifications...');
        
        // First, let's see if we can find an existing user to promote
        const usersQuery = 'SELECT user_id, full_name, email, account_type FROM Users LIMIT 5';
        const usersResult = await query(usersQuery);
        
        console.log('\n📋 Existing users:');
        usersResult.rows.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - ${user.account_type}`);
        });
        
        if (usersResult.rows.length === 0) {
            console.log('❌ No users found in database');
            return;
        }
        
        // Let's promote the first user to Resource Staff for testing
        const userToPromote = usersResult.rows[0];
        
        console.log(`\n🔄 Promoting ${userToPromote.full_name} to Resource Staff...`);
        
        const updateQuery = `
            UPDATE Users 
            SET account_type = 'Resource Staff' 
            WHERE user_id = $1
            RETURNING user_id, full_name, account_type
        `;
        
        const updateResult = await query(updateQuery, [userToPromote.user_id]);
        
        if (updateResult.rows.length > 0) {
            const updatedUser = updateResult.rows[0];
            console.log(`✅ Successfully promoted ${updatedUser.full_name} to ${updatedUser.account_type}`);
            
            // Now let's verify staff users exist
            const staffCheckQuery = `
                SELECT user_id, full_name, email, account_type
                FROM Users 
                WHERE account_type IN ('Resource Staff', 'Executive Admin')
            `;
            
            const staffResult = await query(staffCheckQuery);
            console.log(`\n👥 Staff/Admin users found: ${staffResult.rows.length}`);
            staffResult.rows.forEach(staff => {
                console.log(`   - ${staff.full_name} (${staff.account_type})`);
            });
            
        } else {
            console.log('❌ Failed to promote user');
        }
        
    } catch (error) {
        console.error('❌ Error creating staff user:', error);
    }
};

await createStaffUser();
process.exit(0);