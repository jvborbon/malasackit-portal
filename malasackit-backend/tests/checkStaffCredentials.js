import { query } from '../src/db.js';

const checkStaffUsers = async () => {
    try {
        const staffQuery = `
            SELECT u.user_id, u.full_name, u.email, u.role_id, r.role_name 
            FROM Users u 
            JOIN roles r ON u.role_id = r.role_id 
            WHERE u.role_id IN (1, 2)
        `;
        
        const result = await query(staffQuery);
        
        console.log('Staff/Admin users:');
        result.rows.forEach(user => {
            console.log(`- ${user.full_name} (${user.email}) - Role ID: ${user.role_id} (${user.role_name})`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
};

await checkStaffUsers();
process.exit(0);