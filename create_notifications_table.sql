-- Create Notifications Table
-- Run this SQL script in your PostgreSQL database to enable system notifications

CREATE TABLE IF NOT EXISTS Notifications (
    notification_id VARCHAR(20) PRIMARY KEY,
    recipient_user_id VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'general',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (recipient_user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read 
ON Notifications(recipient_user_id, is_read);

-- Sample notification (optional - for testing)
-- INSERT INTO Notifications (
--     notification_id, 
--     recipient_user_id, 
--     title, 
--     message, 
--     type, 
--     priority
-- ) VALUES (
--     'NOTIF' || EXTRACT(EPOCH FROM NOW())::bigint || '001',
--     'your-admin-user-id-here',
--     'System Notification Enabled',
--     'The notification system has been successfully set up. You will now receive in-app notifications for new user registrations and other important events.',
--     'system',
--     'normal'
-- );