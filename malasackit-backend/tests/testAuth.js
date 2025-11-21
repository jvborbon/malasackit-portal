import { loginUser } from '../src/services/users/userAuth.js';
import { generateToken, verifyToken } from '../src/utilities/jwt.js';

const testAuth = async () => {
    try {
        console.log('🧪 Testing authentication with roleId...');
        
        // Test login for staff user
        const staffEmail = 'staff@test.com';
        const staffPassword = 'password123'; // You might need to adjust this
        
        console.log(`\n🔐 Testing login for: ${staffEmail}`);
        
        const loginResult = await loginUser(staffEmail, staffPassword);
        
        if (!loginResult.success) {
            console.log('❌ Login failed:', loginResult.message);
            return;
        }
        
        const user = loginResult.user;
        console.log(`✅ Login successful for: ${user.full_name}`);
        console.log(`   - Role ID: ${user.role_id}`);
        console.log(`   - Role Name: ${user.role_name}`);
        
        // Generate JWT token
        const token = generateToken({
            userId: user.user_id,
            email: user.email,
            role: user.role_name,
            roleId: user.role_id
        });
        
        console.log('\n🔓 JWT Token generated');
        
        // Verify JWT token
        const decoded = verifyToken(token);
        console.log('\n📋 JWT Token Contents:');
        console.log(`   - userId: ${decoded.userId}`);
        console.log(`   - email: ${decoded.email}`);
        console.log(`   - role: ${decoded.role}`);
        console.log(`   - roleId: ${decoded.roleId}`);
        
        // Test permission check
        const isStaffOrAdmin = decoded.roleId === 1 || decoded.roleId === 2;
        console.log(`\n✅ Permission check: ${isStaffOrAdmin ? 'AUTHORIZED' : 'NOT AUTHORIZED'} for donation access`);
        
        if (isStaffOrAdmin) {
            console.log('🎉 Staff user should now be able to access donation details!');
        }
        
    } catch (error) {
        console.error('❌ Error testing authentication:', error);
    }
};

await testAuth();
process.exit(0);