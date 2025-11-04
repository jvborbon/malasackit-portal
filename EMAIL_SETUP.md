# 📧 Email Notification Setup Guide

## Quick Setup (Gmail - Recommended)

### 1. Enable Gmail App Password
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Go to "App passwords" section
4. Generate a new app password for "Malasackit Portal"
5. Copy the 16-character app password

### 2. Configure Environment Variables
Add these to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
ADMIN_EMAIL=admin@your-domain.com
FRONTEND_URL=http://localhost:5173
```

### 3. Test the Setup
- Register a new user account
- Check your admin email for notification
- Check user's email for confirmation

## Features

### ✅ **Admin Notification Email**
- Sent to `ADMIN_EMAIL` when new user registers
- Contains user details and approval link
- Professional HTML template

### ✅ **User Confirmation Email**
- Sent to new user after registration
- Confirms successful registration
- Explains approval process

### ✅ **Graceful Fallback**
- If email credentials not configured, app works normally
- Email errors don't affect registration process
- Console logs for debugging

## Email Templates

Both emails feature:
- 🎨 Professional design with portal branding
- 📱 Mobile-friendly responsive layout
- 🔗 Direct links to portal
- ℹ️ Clear instructions for next steps

## Alternative Email Services

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Custom SMTP
```env
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587
EMAIL_USER=your-email@your-domain.com
EMAIL_PASS=your-password
```

## Troubleshooting

### No emails received?
1. Check spam/junk folder
2. Verify email credentials in `.env`
3. Check console for error messages
4. Ensure app password (not regular password) for Gmail

### Emails look broken?
- Email client may not support HTML
- Check if images are blocked
- Templates work best in modern email clients