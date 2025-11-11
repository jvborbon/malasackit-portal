-- Test Activity Logs Data
-- Insert some sample activity logs to test the system

-- Sample login activities (using existing user IDs from your system)
INSERT INTO UserActivityLogs (user_id, action, description) VALUES
('ADMIN001', 'USER_LOGIN', 'Administrator logged into the system'),
('STAFF001', 'USER_LOGIN', 'Staff member logged into the system'),
('DONOR001', 'USER_LOGIN', 'Donor logged into the system'),
('ADMIN001', 'USER_MANAGEMENT', 'Admin approved a new user registration'),
('STAFF001', 'INVENTORY_UPDATED', 'Staff updated inventory quantities'),
('DONOR001', 'DONATION_SUBMITTED', 'Donor submitted a new donation request'),
('STAFF001', 'DONATION_APPROVED', 'Staff approved donation request #123'),
('ADMIN001', 'USER_MANAGEMENT', 'Admin updated user permissions'),
('DONOR002', 'USER_LOGIN', 'Donor logged into the system'),
('STAFF001', 'DISTRIBUTION_CREATED', 'Staff created new distribution plan');

-- You can run this to add sample data for testing
-- DELETE FROM UserActivityLogs; -- Uncomment to clear existing logs first