# Malasackit Portal - Notification System Implementation

## 📋 Overview

The notification system has been successfully implemented to handle donation workflow notifications. This system provides both in-app notifications and email notifications for key donation events.

## 🔔 Notification Features Implemented

### **1. New Donation Request Notifications**
- **Trigger**: When a donor submits a new donation request
- **Recipients**: All Resource Staff and Executive Admin users
- **Content**: Donor name, item count, total value, and call-to-action
- **Priority**: Normal

### **2. Donation Request Update Notifications**
- **Trigger**: When a donor edits their pending donation request
- **Recipients**: All Resource Staff and Executive Admin users
- **Content**: Donor name, changes made, and request details
- **Priority**: Normal

### **3. Donation Request Cancellation Notifications**
- **Trigger**: When a donor cancels their pending donation request
- **Recipients**: All Resource Staff and Executive Admin users
- **Content**: Donor name, cancelled request ID
- **Priority**: Low

### **4. Donation Approval Notifications**
- **Trigger**: When staff/admin approves a donation request
- **Recipients**: The donor who submitted the request
- **Content**: Approval confirmation, appointment details (if scheduled)
- **Priority**: High
- **Email**: Professional approval email with appointment details

### **5. Donation Rejection Notifications**
- **Trigger**: When staff/admin rejects a donation request
- **Recipients**: The donor who submitted the request
- **Content**: Rejection notice, reason (if provided), next steps
- **Priority**: Normal
- **Email**: Professional rejection email with alternative actions

### **6. Donation Completion Notifications**
- **Trigger**: When staff marks a donation as completed
- **Recipients**: The donor who made the donation
- **Content**: Completion confirmation, impact summary, gratitude message
- **Priority**: High
- **Email**: Thank you email with donation impact details

## 🏗️ Technical Implementation

### **Database Schema**
```sql
CREATE TABLE notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    recipient_user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'normal',
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recipient_user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
```

### **API Endpoints**
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/read-all` - Mark all as read
- `PATCH /api/notifications/:id/read` - Mark single as read
- `DELETE /api/notifications/:id` - Delete notification

### **Integration Points**
- **Submit Donation**: `submitDonationRequest()` → `notifyNewDonationRequest()`
- **Update Donation**: `updateDonationRequest()` → `notifyDonationRequestUpdate()`
- **Cancel Donation**: `cancelDonationRequest()` → `notifyDonationRequestCancellation()`
- **Approve Donation**: `updateDonationStatus('Approved')` → `notifyDonationApproval()`
- **Reject Donation**: `updateDonationStatus('Rejected')` → `notifyDonationRejection()`
- **Complete Donation**: `updateDonationStatus('Completed')` → `notifyDonationCompletion()`

## 📧 Email Integration

### **Email Templates**
- Professional HTML email templates with Malasackit branding
- Responsive design for all devices
- Clear call-to-action buttons
- Security and privacy information

### **Email Configuration**
Required environment variables:
```bash
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@malasackit.org
```

### **Email Functions**
- `sendDonationApprovalEmail()` - Approval confirmation with appointment details
- `sendDonationRejectionEmail()` - Professional rejection notice
- `sendDonationCompletionEmail()` - Thank you message with impact summary

## 🚀 How to Initialize

### **1. Database Setup**
```bash
cd malasackit-backend
node initializeNotifications.js
```

### **2. Start Backend Server**
```bash
cd malasackit-backend
npx nodemon src/index.js
```

### **3. Test Notification System**
1. Submit a new donation request → Staff gets notified
2. Approve the request → Donor gets notification + email
3. Complete the donation → Donor gets completion notification + email

## 📱 Frontend Integration

The notification system is ready for frontend integration with:

### **Notification Service** (`src/services/notificationService.js`)
```javascript
// Get notifications
const notifications = await fetchNotifications();

// Get unread count
const unreadCount = await getUnreadCount();

// Mark as read
await markNotificationAsRead(notificationId);

// Mark all as read
await markAllNotificationsRead();
```

### **Real-time Updates** (Future Enhancement)
- WebSocket integration for real-time notifications
- Push notifications for browser/mobile apps
- Desktop notifications for staff users

## 🔐 Security Features

### **Access Control**
- Notifications are user-specific and secure
- Role-based notification routing (staff vs donors)
- Email authentication required for sending

### **Data Privacy**
- Secure database storage with foreign key constraints
- Email templates don't expose sensitive data
- Proper error handling prevents information leakage

## 📊 Monitoring & Analytics

### **Notification Metrics** (Available for implementation)
- Delivery success rates
- Read/unread ratios
- Response times for staff notifications
- Email bounce rates and engagement

### **Logging**
- All notification activities are logged
- Email sending status tracked
- Error handling with fallback mechanisms

## 🎯 Future Enhancements

### **Planned Features**
- SMS notifications for urgent requests
- Push notifications for mobile apps
- Notification preferences per user
- Scheduled notification summaries
- Multi-language email templates

### **Performance Optimizations**
- Notification batching for bulk operations
- Email queue system for reliability
- Notification archiving and cleanup
- Database indexing optimization

## ✅ Testing Checklist

- [x] Database table creation
- [x] In-app notification creation
- [x] Email template rendering
- [x] Staff notification routing
- [x] Donor notification delivery
- [x] Appointment detail inclusion
- [x] Error handling and fallbacks
- [x] Security and access control

## 🆘 Troubleshooting

### **Common Issues**
1. **Notifications not sending**: Check database connection and user roles
2. **Emails not sending**: Verify EMAIL_USER and EMAIL_PASS environment variables
3. **Missing notifications**: Ensure notification triggers are properly integrated
4. **Database errors**: Run notification table initialization script

### **Debug Commands**
```bash
# Check notification table
psql -d malasackit_db -c "SELECT * FROM notifications LIMIT 5;"

# Test email configuration
node -e "console.log('EMAIL_USER:', process.env.EMAIL_USER)"

# Check user roles
psql -d malasackit_db -c "SELECT user_id, full_name, role FROM users WHERE role IN ('Resource Staff', 'Executive Admin');"
```

---

**Status**: ✅ **FULLY IMPLEMENTED AND READY FOR USE**

The notification system is now integrated into the donation workflow and ready to handle all specified notification requirements. Staff and admins will be notified of donation activities, and donors will receive professional email notifications for status updates.