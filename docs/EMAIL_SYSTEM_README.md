# Email Notification System for Admin Approval

## 🎯 **What's Implemented**

### **1. Registration Flow Changes:**
- Users now register with `is_approved = FALSE` (pending approval)
- Automatic email notifications sent to both admin and user
- Users cannot log in until approved by admin

### **2. Email Templates Added:**
- **Admin Notification**: Sent when new user registers
- **User Confirmation**: Sent to user after registration 
- **User Approval**: Sent when admin approves the account

### **3. New API Endpoints:**
```bash
# Get all pending users (Admin only)
GET /api/auth/pending

# Get all users (Admin and Staff)
GET /api/auth/all

# Approve a user (Admin only)
POST /api/auth/approve/:userId

# Reject a user (Admin only)  
DELETE /api/auth/reject/:userId

# Test email functionality (Admin only)
POST /api/auth/test-email
```

## 🔧 **Setup Required**

### **1. Environment Variables (.env file):**
```bash
# Required for email functionality
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password  # NOT your regular password
ADMIN_EMAIL=admin@your-domain.com  # Where admin notifications go
FRONTEND_URL=http://localhost:5173  # For email links
```

### **2. Gmail Setup Steps:**
1. Enable 2-factor authentication on your Google account
2. Go to Google Account → Security → App Passwords  
3. Generate an app password for "Mail"
4. Use this app password as `EMAIL_PASS`
5. Set your Gmail as `EMAIL_USER`
6. Set admin email as `ADMIN_EMAIL`

## 📧 **How It Works**

### **Registration Process:**
1. User fills out registration form
2. Account created with `is_approved = FALSE`
3. **Email sent to admin** with user details and approval link
4. **Email sent to user** confirming registration pending approval
5. User cannot log in until approved

### **Admin Approval Process:**
1. Admin receives email notification
2. Admin logs into admin panel
3. Admin sees pending users list
4. Admin clicks approve/reject
5. **Email sent to user** notifying of approval
6. User can now log in

### **Email Failure Handling:**
- If email credentials not configured: emails are skipped silently
- If email sending fails: registration still succeeds
- Emails are sent asynchronously (non-blocking)

## 🛡️ **Security Features**

### **Role-Based Access:**
- Only `Executive Admin` can approve/reject users
- Only `Executive Admin` and `Resource Staff` can view all users
- Email credentials stored securely in environment variables

### **Database Safety:**
- All approval operations use database transactions
- Rollback on any errors
- Foreign key constraints properly handled

## 🧪 **Testing the System**

### **1. Test Email Configuration:**
```bash
# Admin login required first
POST /api/auth/test-email
```

### **2. Test Registration Flow:**
1. Register a new user (sets pending status)
2. Check admin email for notification
3. Check user email for confirmation
4. Use admin panel to approve
5. Check user email for approval notification

### **3. Test API Endpoints:**
```bash
# Get pending users
GET /api/auth/pending
Authorization: Bearer <admin-token>

# Approve user
POST /api/auth/approve/USR12345678901
Authorization: Bearer <admin-token>
```

## 📱 **Frontend Integration Notes**

### **For Admin Panel:**
- Add "User Management" section
- Display pending users list
- Add approve/reject buttons
- Show user details from API

### **For Registration:**
- Update success message to mention approval requirement
- Update login error handling for pending approval

### **For User Experience:**
- Clear messaging about approval process
- Email notifications keep users informed
- Professional email templates with branding

## 🔍 **Monitoring & Logs**

### **Console Logs:**
- Email sending success/failure
- User approval/rejection events
- Email configuration status

### **Database Events:**
- User registration with approval status
- Admin approval tracking
- User status changes

## 🚀 **Benefits Achieved**

✅ **Admin Control**: Admins approve all new registrations
✅ **Email Notifications**: Automated emails keep everyone informed  
✅ **Professional Communication**: Branded email templates
✅ **Non-Breaking**: Existing functionality remains intact
✅ **Secure**: Role-based access and environment variable protection
✅ **Robust**: Handles email failures gracefully
✅ **Scalable**: Ready for production deployment

## 📝 **Next Steps**

1. **Configure email credentials** in `.env` file
2. **Test email functionality** with test endpoint
3. **Build admin UI** for user management
4. **Update registration success messaging**
5. **Deploy and monitor** email notifications

The system is now fully functional and ready for testing! 🎉