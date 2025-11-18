import { query } from '../db.js';
import { ensureNotificationsTable } from './notificationsTableSetup.js';

const generateNotificationId = () => {
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `notif_${Date.now()}_${randomPart}`;
};

export const createNotification = async ({
    recipientUserId,
    title,
    message,
    type = 'general',
    priority = 'normal',
    link = null
}) => {
    await ensureNotificationsTable();

    const notificationId = generateNotificationId();
    const insertQuery = `
        INSERT INTO notifications (
            notification_id,
            recipient_user_id,
            title,
            message,
            type,
            priority,
            link,
            is_read
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
        RETURNING *
    `;

    const values = [
        notificationId,
        recipientUserId,
        title,
        message,
        type,
        priority,
        link
    ];

    const result = await query(insertQuery, values);
    return result.rows[0];
};

export const getNotificationsForUser = async (userId, filter = 'all') => {
    await ensureNotificationsTable();

    const clauses = ['recipient_user_id = $1'];
    if (filter === 'unread') {
        clauses.push('is_read = FALSE');
    } else if (filter === 'read') {
        clauses.push('is_read = TRUE');
    }

    const listQuery = `
        SELECT *
        FROM notifications
        WHERE ${clauses.join(' AND ')}
        ORDER BY created_at DESC
    `;

    const result = await query(listQuery, [userId]);
    return result.rows;
};

export const getUnreadCountForUser = async (userId) => {
    await ensureNotificationsTable();

    const countQuery = `
        SELECT COUNT(*) AS unread_count
        FROM notifications
        WHERE recipient_user_id = $1
          AND is_read = FALSE
    `;

    const result = await query(countQuery, [userId]);
    return parseInt(result.rows[0].unread_count, 10) || 0;
};

export const markNotificationAsRead = async (notificationId, userId) => {
    await ensureNotificationsTable();

    const updateQuery = `
        UPDATE notifications
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE notification_id = $1 AND recipient_user_id = $2
        RETURNING *
    `;

    const result = await query(updateQuery, [notificationId, userId]);
    return result.rows[0] || null;
};

export const markAllNotificationsAsRead = async (userId) => {
    await ensureNotificationsTable();

    const updateQuery = `
        UPDATE notifications
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE recipient_user_id = $1 AND is_read = FALSE
        RETURNING notification_id
    `;

    const result = await query(updateQuery, [userId]);
    return result.rowCount;
};

export const deleteNotification = async (notificationId, userId) => {
    await ensureNotificationsTable();

    const deleteQuery = `
        DELETE FROM notifications
        WHERE notification_id = $1 AND recipient_user_id = $2
        RETURNING notification_id
    `;

    const result = await query(deleteQuery, [notificationId, userId]);
    return result.rows[0] || null;
};
