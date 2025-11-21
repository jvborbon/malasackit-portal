import { ensureNotificationsTable } from './src/services/notificationsTableSetup.js';
import { createNotification } from './src/services/notificationService.js';
import { query } from './src/db.js';

const initializeNotificationSystem = async () => {
    try {
        console.log('🔔 Initializing Notification System...');
        
        // Ensure notifications table exists
        const tableCreated = await ensureNotificationsTable();
        
        if (!tableCreated) {
            console.error('❌ Failed to create notifications table');
            return false;
        }
        
        console.log('✅ Notifications table ready');
        
        // Get a sample staff user to test notification creation
        const staffQuery = `
            SELECT user_id, full_name, account_type as role 
            FROM Users 
            WHERE account_type IN ('Resource Staff', 'Executive Admin') 
            LIMIT 1
        `;
        
        const staffResult = await query(staffQuery);
        
        if (staffResult.rows.length > 0) {
            const staffUser = staffResult.rows[0];
            
            // Create a test notification
            const testNotification = await createNotification({
                recipientUserId: staffUser.user_id,
                title: 'Notification System Initialized',
                message: 'The notification system has been successfully set up and is ready to handle donation workflow notifications.',
                type: 'system',
                priority: 'low',
                link: null
            });
            
            console.log('✅ Test notification created:', testNotification.notification_id);
        }
        
        console.log('🎉 Notification system initialization complete!');
        console.log('');
        console.log('📋 Notification Features Enabled:');
        console.log('   • New donation request alerts for staff/admin');
        console.log('   • Donation request update notifications');
        console.log('   • Donation cancellation alerts');
        console.log('   • Approval/rejection notifications for donors');
        console.log('   • Completion notifications for donors');
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error initializing notification system:', error);
        return false;
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    await initializeNotificationSystem();
    process.exit(0);
}

export { initializeNotificationSystem };