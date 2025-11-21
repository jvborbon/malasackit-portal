import {
    createNotification,
    getNotificationsForUser,
    getUnreadCountForUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from '../services/notificationService.js';
import { query } from '../db.js';
import {
    sendDonationApprovalEmail,
    sendDonationRejectionEmail,
    sendDonationCompletionEmail
} from '../services/emailService.js';

/**
 * Get notifications for the authenticated user
 */
export const listNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { filter = 'all', limit = 50 } = req.query;
        
        const notifications = await getNotificationsForUser(userId, filter);
        
        // Limit results if specified
        const limitedNotifications = limit ? notifications.slice(0, parseInt(limit)) : notifications;
        
        res.json({
            success: true,
            data: limitedNotifications,
            count: limitedNotifications.length,
            message: 'Notifications retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

/**
 * Get unread notification count for the authenticated user
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const count = await getUnreadCountForUser(userId);
        
        res.json({
            success: true,
            data: { unread_count: count },
            message: 'Unread count retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: error.message
        });
    }
};

/**
 * Mark a specific notification as read
 */
export const markSingleNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userId;
        
        const notification = await markNotificationAsRead(notificationId, userId);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found or does not belong to you'
            });
        }
        
        res.json({
            success: true,
            data: notification,
            message: 'Notification marked as read'
        });
        
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

/**
 * Mark all notifications as read for the authenticated user
 */
export const markAllUserNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updatedCount = await markAllNotificationsAsRead(userId);
        
        res.json({
            success: true,
            data: { updated_count: updatedCount },
            message: `${updatedCount} notifications marked as read`
        });
        
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

/**
 * Delete a specific notification
 */
export const removeNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userId;
        
        const deletedNotification = await deleteNotification(notificationId, userId);
        
        if (!deletedNotification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found or does not belong to you'
            });
        }
        
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

/**
 * Helper function to get staff and admin user IDs for notifications
 */
export const getStaffAndAdminUsers = async () => {
    try {
        const staffQuery = `
            SELECT u.user_id, u.full_name, u.email, r.role_name as role
            FROM Users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.role_id IN (1, 2)
              AND u.status = 'active'
        `;
        
        const result = await query(staffQuery);
        return result.rows;
        
    } catch (error) {
        console.error('Error fetching staff and admin users:', error);
        return [];
    }
};

/**
 * Helper function to create donation-related notifications
 */
export const createDonationNotifications = async ({
    donationId,
    donorName,
    donorUserId,
    eventType,
    staffMessage,
    donorMessage = null,
    priority = 'normal',
    itemCount = 0,
    totalValue = 0
}) => {
    try {
        const notifications = [];
        
        // Notify staff and admins
        if (staffMessage) {
            const staffUsers = await getStaffAndAdminUsers();
            
            for (const staffUser of staffUsers) {
                const notification = await createNotification({
                    recipientUserId: staffUser.user_id,
                    title: `Donation ${eventType} - ${donorName}`,
                    message: staffMessage,
                    type: 'donation',
                    priority,
                    link: '/staff-dashboard'
                });
                notifications.push(notification);
            }
        }
        
        // Notify donor if message provided
        if (donorMessage && donorUserId) {
            const donorNotification = await createNotification({
                recipientUserId: donorUserId,
                title: `Your Donation Request Update`,
                message: donorMessage,
                type: 'donation_status',
                priority,
                link: '/donor-dashboard'
            });
            notifications.push(donorNotification);
        }
        
        return notifications;
        
    } catch (error) {
        console.error('Error creating donation notifications:', error);
        return [];
    }
};

/**
 * Create notification for new donation request
 */
export const notifyNewDonationRequest = async (donationId, donorName, donorUserId, itemCount, totalValue) => {
    const staffMessage = `New donation request submitted by ${donorName}. ` +
        `${itemCount} item types with total declared value of ₱${totalValue.toLocaleString()}. ` +
        `Please review and schedule for pickup/dropoff.`;
    
    return createDonationNotifications({
        donationId,
        donorName,
        donorUserId,
        eventType: 'Request Submitted',
        staffMessage,
        priority: 'normal',
        itemCount,
        totalValue
    });
};

/**
 * Create notification for donation request update
 */
export const notifyDonationRequestUpdate = async (donationId, donorName, donorUserId, changes) => {
    const staffMessage = `${donorName} updated their donation request. ` +
        `Changes: ${changes}. Please review the updated request.`;
    
    return createDonationNotifications({
        donationId,
        donorName,
        donorUserId,
        eventType: 'Request Updated',
        staffMessage,
        priority: 'normal'
    });
};

/**
 * Create notification for donation request cancellation
 */
export const notifyDonationRequestCancellation = async (donationId, donorName, donorUserId) => {
    const staffMessage = `${donorName} cancelled their donation request #${donationId}. ` +
        `The request has been removed from the pending queue.`;
    
    return createDonationNotifications({
        donationId,
        donorName,
        donorUserId,
        eventType: 'Request Cancelled',
        staffMessage,
        priority: 'low'
    });
};

/**
 * Create notification for donation approval
 */
export const notifyDonationApproval = async (donationId, donorName, donorUserId, appointmentDate, appointmentTime) => {
    const donorMessage = `Great news! Your donation request has been approved. ` +
        `${appointmentDate && appointmentTime ? 
            `Your appointment is scheduled for ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}.` :
            'We will contact you soon to schedule the pickup/dropoff.'} ` +
        `Thank you for your generosity!`;
    
    // Send in-app notification
    const notifications = await createDonationNotifications({
        donationId,
        donorName,
        donorUserId,
        eventType: 'Approved',
        donorMessage,
        priority: 'high'
    });
    
    // Send email notification to donor
    try {
        const donorQuery = 'SELECT full_name, email FROM Users WHERE user_id = $1';
        const donorResult = await query(donorQuery, [donorUserId]);
        
        if (donorResult.rows.length > 0) {
            const donorData = donorResult.rows[0];
            const donationData = { donation_id: donationId, delivery_method: 'pickup' }; // You might want to fetch actual data
            const appointmentData = appointmentDate && appointmentTime ? { appointment_date: appointmentDate, appointment_time: appointmentTime } : null;
            
            await sendDonationApprovalEmail(donorData, donationData, appointmentData);
        }
    } catch (emailError) {
        console.error('Error sending approval email:', emailError);
        // Don't fail the notification if email fails
    }
    
    return notifications;
};

/**
 * Create notification for donation rejection
 */
export const notifyDonationRejection = async (donationId, donorName, donorUserId, reason) => {
    const donorMessage = `We regret to inform you that your donation request has been declined. ` +
        `${reason ? `Reason: ${reason}. ` : ''}` +
        `Please feel free to submit another request or contact us for more information.`;
    
    // Send in-app notification
    const notifications = await createDonationNotifications({
        donationId,
        donorName,
        donorUserId,
        eventType: 'Declined',
        donorMessage,
        priority: 'normal'
    });
    
    // Send email notification to donor
    try {
        const donorQuery = 'SELECT full_name, email FROM Users WHERE user_id = $1';
        const donorResult = await query(donorQuery, [donorUserId]);
        
        if (donorResult.rows.length > 0) {
            const donorData = donorResult.rows[0];
            const donationData = { donation_id: donationId };
            
            await sendDonationRejectionEmail(donorData, donationData, reason);
        }
    } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
        // Don't fail the notification if email fails
    }
    
    return notifications;
};

/**
 * Create notification for donation completion
 */
export const notifyDonationCompletion = async (donationId, donorName, donorUserId, itemCount, totalValue) => {
    const donorMessage = `Your donation has been successfully received and processed! ` +
        `We received ${itemCount} item types with a total value of ₱${totalValue.toLocaleString()}. ` +
        `Your contribution will help many people in need. Thank you for your kindness!`;
    
    // Send in-app notification
    const notifications = await createDonationNotifications({
        donationId,
        donorName,
        donorUserId,
        eventType: 'Completed',
        donorMessage,
        priority: 'high',
        itemCount,
        totalValue
    });
    
    // Send email notification to donor
    try {
        const donorQuery = 'SELECT full_name, email FROM Users WHERE user_id = $1';
        const donorResult = await query(donorQuery, [donorUserId]);
        
        if (donorResult.rows.length > 0) {
            const donorData = donorResult.rows[0];
            const donationData = { donation_id: donationId };
            
            await sendDonationCompletionEmail(donorData, donationData, itemCount, totalValue);
        }
    } catch (emailError) {
        console.error('Error sending completion email:', emailError);
        // Don't fail the notification if email fails
    }
    
    return notifications;
};