import express from 'express';
import {
    listNotifications,
    getUnreadCount,
    markSingleNotificationRead,
    markAllUserNotificationsRead,
    removeNotification
} from '../controllers/notificationControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllUserNotificationsRead);
router.patch('/:notificationId/read', markSingleNotificationRead);
router.delete('/:notificationId', removeNotification);

export default router;