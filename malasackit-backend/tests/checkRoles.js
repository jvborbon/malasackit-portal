import { query } from '../src/db.js';

const checkRoles = async () => {
    try {
        console.log('🔍 Checking roles table...');
        
        const rolesQuery = 'SELECT * FROM roles ORDER BY role_id';
        const result = await query(rolesQuery);
        
        console.log('\n📋 Available roles:');
        result.rows.forEach(role => {
            console.log(`- ID: ${role.role_id}, Name: ${role.role_name}, Description: ${role.description || 'N/A'}`);
        });
        
        // Now let's check which users have which roles
        console.log('\n👥 Users and their roles:');
        const usersRolesQuery = `
            SELECT u.user_id, u.full_name, u.role_id, r.role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.role_id
        `;
        const usersResult = await query(usersRolesQuery);
        
        // Group by role
        const roleGroups = {};
        usersResult.rows.forEach(user => {
            const roleName = user.role_name || 'No Role';
            if (!roleGroups[roleName]) {
                roleGroups[roleName] = [];
            }
            roleGroups[roleName].push(user);
        });
        
        Object.keys(roleGroups).forEach(roleName => {
            console.log(`\n${roleName} (${roleGroups[roleName].length} users):`);
            roleGroups[roleName].slice(0, 3).forEach(user => {
                console.log(`  - ${user.full_name} (ID: ${user.role_id})`);
            });
            if (roleGroups[roleName].length > 3) {
                console.log(`  ... and ${roleGroups[roleName].length - 3} more`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error checking roles:', error);
    }
};

await checkRoles();
process.exit(0);