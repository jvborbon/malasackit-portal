import { query } from '../db.js';

export const ensureNotificationsTable = async () => {
    try {
        // Check if the notifications table exists
        const tableExistsQuery = `
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'notifications'
            );
        `;
        
        const tableExists = await query(tableExistsQuery);
        
        if (!tableExists.rows[0].exists) {
            console.log('Creating notifications table...');
            
            const createTableQuery = `
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
            `;
            
            await query(createTableQuery);
            
            // Create indexes for better performance
            const indexQueries = [
                'CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);',
                'CREATE INDEX idx_notifications_created_at ON notifications(created_at);',
                'CREATE INDEX idx_notifications_unread ON notifications(recipient_user_id, is_read) WHERE is_read = FALSE;',
                'CREATE INDEX idx_notifications_type ON notifications(type);'
            ];
            
            for (const indexQuery of indexQueries) {
                await query(indexQuery);
            }
            
            console.log('Notifications table and indexes created successfully');
        }
        
        return true;
    } catch (error) {
        console.error('Error ensuring notifications table exists:', error);
        return false;
    }
};

export const dropNotificationsTable = async () => {
    try {
        const dropTableQuery = 'DROP TABLE IF EXISTS notifications CASCADE;';
        await query(dropTableQuery);
        console.log('Notifications table dropped successfully');
        return true;
    } catch (error) {
        console.error('Error dropping notifications table:', error);
        return false;
    }
};