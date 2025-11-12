# Forgot Password System Documentation

## Overview
The Malasackit Portal now includes a comprehensive forgot password system that allows users to reset their passwords securely via email.

## Features
- **Flexible Input**: Users can request password reset using either their email address or full name
- **Secure Token System**: Uses cryptographically secure tokens with 1-hour expiration
- **Email Notifications**: Professional email templates for password reset requests and confirmations
- **User-Friendly UI**: Integrated with the existing authentication design
- **Security Measures**: Token validation, account status checks, and activity logging

## User Flow

### 1. Request Password Reset
1. User clicks "Forgot password?" on the login page
2. User enters their email address or full name
3. System validates the account and generates a secure reset token
4. Email with reset link is sent to the user's registered email
5. User receives confirmation that email has been sent

### 2. Reset Password
1. User clicks the reset link in their email
2. System verifies the token and displays the reset password form
3. User enters new password (minimum 6 characters)
4. Password is updated and all reset tokens are cleared
5. User receives email confirmation of successful password reset
6. User is redirected to login page

## API Endpoints

### POST `/api/auth/forgot-password`
Request a password reset token.

**Request Body:**
```json
{
  "emailOrName": "user@example.com" // or "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that information exists, a password reset email has been sent."
}
```

### GET `/api/auth/verify-reset-token/:token`
Verify if a reset token is valid.

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "full_name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### POST `/api/auth/reset-password/:token`
Reset password using a valid token.

**Request Body:**
```json
{
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## Database Schema

The system uses the existing `Login_Credentials` table with these fields:
- `password_reset_token`: Stores the secure reset token
- `password_reset_expires`: Token expiration timestamp (1 hour)

## Email Templates

### Password Reset Request Email
- Professional design matching portal branding
- Secure reset link with token
- Clear instructions and security warnings
- 1-hour expiration notice

### Password Reset Confirmation Email
- Confirmation of successful password reset
- Security reminders
- Login link for convenience

## Security Features

### Token Security
- Cryptographically secure tokens using `crypto.randomBytes(32)`
- 1-hour expiration time
- One-time use (cleared after successful reset)
- Tokens are cleared when expired

### Account Validation
- Only approved and active accounts can reset passwords
- Account status checks during token verification
- Activity logging for all password reset attempts

### Rate Limiting (Recommended)
Consider implementing rate limiting on the forgot password endpoint to prevent abuse.

## Frontend Components

### ForgotPasswordForm.jsx
- Integrated with existing login design
- Handles email/name input validation
- Shows success/error messages
- Smooth transitions back to login

### ResetPasswordForm.jsx
- Standalone password reset page
- Token verification on page load
- Password strength validation
- Password visibility toggles
- Auto-redirect after successful reset

## Environment Variables

Ensure these environment variables are set in your `.env` file:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourorganization.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

## Usage Instructions

### For Users
1. On the login page, click "Forgot password?"
2. Enter your registered email address or full name
3. Check your email for the reset link
4. Click the link and enter your new password
5. Return to login page and use your new password

### For Administrators
- Password reset activities are logged in the `UserActivityLogs` table
- Monitor for suspicious reset attempts
- Email notifications require proper SMTP configuration

## Error Handling

The system handles various error scenarios:
- Invalid or expired tokens
- Non-existent accounts
- Inactive or unapproved accounts
- Email delivery failures (logged but doesn't fail the request)
- Network connectivity issues

## Testing

To test the forgot password system:

1. **Test Valid Request:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"emailOrName":"test@example.com"}'
   ```

2. **Test Token Verification:**
   ```bash
   curl http://localhost:3000/api/auth/verify-reset-token/your-token-here
   ```

3. **Test Password Reset:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password/your-token-here \
     -H "Content-Type: application/json" \
     -d '{"password":"newpass123","confirmPassword":"newpass123"}'
   ```

## Maintenance

### Cleanup Expired Tokens
Run the cleanup function periodically to remove expired tokens:

```javascript
import { cleanupExpiredTokens } from './services/users/passwordReset.js';

// Run daily cleanup
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);
```

## Troubleshooting

### Common Issues

1. **Emails not being sent:**
   - Check EMAIL_USER and EMAIL_PASS environment variables
   - Verify Gmail app password configuration
   - Check server logs for SMTP errors

2. **Token verification fails:**
   - Ensure token hasn't expired (1 hour limit)
   - Check if token was already used
   - Verify database connection

3. **Frontend issues:**
   - Check FRONTEND_URL in environment variables
   - Verify React router configuration
   - Check browser console for JavaScript errors

### Log Monitoring

Monitor these log entries:
- `PASSWORD_RESET_REQUESTED`: User requested password reset
- `PASSWORD_RESET_COMPLETED`: User successfully reset password
- Email sending success/failure logs

## Security Best Practices

1. **Regular token cleanup** to prevent database bloat
2. **Monitor reset frequency** per user to detect abuse
3. **Implement rate limiting** on reset endpoints
4. **Use HTTPS** in production for secure token transmission
5. **Regular security audits** of the password reset flow

---

**Note:** This system integrates seamlessly with the existing authentication flow and maintains all current security standards of the Malasackit Portal.