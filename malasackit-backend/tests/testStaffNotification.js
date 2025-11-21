import { getStaffAndAdminUsers } from '../src/controllers/notificationControllers.js';

const testStaffNotification = async () => {
    try {
        console.log('🧪 Testing RBAC-based staff notification system...');
        
        const staffUsers = await getStaffAndAdminUsers();
        
        console.log(`✅ Staff/Admin users found: ${staffUsers.length}`);
        
        if (staffUsers.length === 0) {
            console.log('❌ Still no staff users found - RBAC fix may need adjustment');
        } else {
            console.log('\n👥 Staff/Admin users who will receive notifications:');
            staffUsers.forEach(user => {
                console.log(`   - ${user.full_name} (${user.role}) - ${user.email}`);
            });
            
            console.log('\n🎉 Notification system should now work!');
            console.log('When a donation request is created, these users will be notified.');
        }
        
    } catch (error) {
        console.error('❌ Error testing staff notification:', error);
    }
};

await testStaffNotification();
process.exit(0);