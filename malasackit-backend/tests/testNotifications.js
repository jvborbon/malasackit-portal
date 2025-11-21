import { createNotification } from '../src/services/notificationService.js';
import { query } from '../src/db.js';

const testNotifications = async () => {
    try {
        console.log('🧪 Testing notification system...');
        
        // Get a test user (any user will do for testing)
        const userQuery = 'SELECT user_id, full_name FROM Users LIMIT 1';
        const userResult = await query(userQuery);
        
        if (userResult.rows.length === 0) {
            console.log('❌ No users found in database');
            return;
        }
        
        const testUser = userResult.rows[0];
        console.log('👤 Found test user:', testUser.full_name);
        
        // Create a test notification
        const testNotification = await createNotification({
            recipientUserId: testUser.user_id,
            title: 'Test Notification',
            message: 'This is a test notification to verify the system is working correctly.',
            type: 'system',
            priority: 'normal',
            link: null
        });
        
        console.log('✅ Test notification created:', testNotification.notification_id);
        
        // Test fetching notifications
        const fetchQuery = 'SELECT * FROM notifications WHERE recipient_user_id = $1';
        const fetchResult = await query(fetchQuery, [testUser.user_id]);
        
        console.log('📋 Notifications in database:', fetchResult.rows.length);
        fetchResult.rows.forEach(notif => {
            console.log(`   - ${notif.title} (${notif.is_read ? 'Read' : 'Unread'})`);
        });
        
        console.log('🎉 Notification system test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error testing notifications:', error);
    }
};

// Run the test
await testNotifications();
process.exit(0);