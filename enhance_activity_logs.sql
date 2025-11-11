-- ========================================
-- BASIC ACTIVITY LOGS OPTIMIZATION
-- Simple performance indexes only
-- ========================================

-- Add basic indexes for better performance on activity logs queries
CREATE INDEX IF NOT EXISTS idx_useractivitylogs_user_created 
ON UserActivityLogs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_useractivitylogs_action 
ON UserActivityLogs(action);

CREATE INDEX IF NOT EXISTS idx_useractivitylogs_created_at 
ON UserActivityLogs(created_at DESC);

-- The system uses the basic UserActivityLogs table with:
-- - log_id (Primary Key)
-- - user_id (Foreign Key to Users table)
-- - action (VARCHAR for action type)
-- - description (TEXT for human-readable description)
-- - created_at (TIMESTAMP for when the action occurred)
-- - updated_at (TIMESTAMP for record updates)