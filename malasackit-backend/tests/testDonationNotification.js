import { notifyNewDonationRequest } from '../src/controllers/notificationControllers.js';
import { query } from '../src/db.js';

const testDonationNotification = async () => {
    try {
        console.log('🧪 Testing complete donation notification flow...');
        
        // Get a donor user for testing
        const donorQuery = 'SELECT user_id, full_name FROM Users WHERE role_id = 3 LIMIT 1';
        const donorResult = await query(donorQuery);
        
        if (donorResult.rows.length === 0) {
            console.log('❌ No donor users found');
            return;
        }
        
        const donor = donorResult.rows[0];
        console.log(`👤 Testing with donor: ${donor.full_name}`);
        
        // Simulate a donation request
        const testDonationId = 'TEST_' + Date.now();
        const itemCount = 3;
        const totalValue = 1500.00;
        
        console.log(`\n📋 Simulating donation request:
   - Donation ID: ${testDonationId}
   - Donor: ${donor.full_name}
   - Items: ${itemCount}
   - Total Value: ₱${totalValue.toLocaleString()}`);
        
        // Call the notification function
        console.log('\n📨 Sending notifications to staff and admin...');
        const notifications = await notifyNewDonationRequest(
            testDonationId,
            donor.full_name,
            donor.user_id,
            itemCount,
            totalValue
        );
        
        console.log(`✅ Notifications created: ${notifications.length}`);
        
        if (notifications.length > 0) {
            console.log('\n📬 Notification details:');
            for (const notif of notifications) {
                // Get recipient info
                const recipientQuery = `
                    SELECT u.full_name, r.role_name 
                    FROM Users u 
                    JOIN roles r ON u.role_id = r.role_id 
                    WHERE u.user_id = $1
                `;
                const recipientResult = await query(recipientQuery, [notif.recipient_user_id]);
                const recipient = recipientResult.rows[0];
                
                console.log(`   - To: ${recipient.full_name} (${recipient.role_name})`);
                console.log(`   - Title: ${notif.title}`);
                console.log(`   - Message: ${notif.message}`);
                console.log(`   - Priority: ${notif.priority}`);
                console.log('');
            }
            
            console.log('🎉 SUCCESS! Staff and admin will now receive notifications when donation requests are created.');
        } else {
            console.log('❌ No notifications were created - there may still be an issue');
        }
        
    } catch (error) {
        console.error('❌ Error testing donation notification:', error);
    }
};

await testDonationNotification();
process.exit(0);