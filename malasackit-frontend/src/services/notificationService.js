import api from '../components/utilities/api';

// Fetch all notifications for the current user
export const fetchNotifications = async (filter = 'all', limit = 50) => {
    try {
        const response = await api.get('/api/notifications', {
            params: { filter, limit }
        });
        
        return {
            success: true,
            data: response.data.data || [],
            count: response.data.count || 0
        };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            data: []
        };
    }
};

// Get unread notification count
export const getUnreadCount = async () => {
    try {
        const response = await api.get('/api/notifications/unread-count');
        
        return {
            success: true,
            count: response.data.data?.unread_count || 0
        };
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            count: 0
        };
    }
};

// Mark a single notification as read
export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await api.patch(`/api/notifications/${notificationId}/read`);
        
        return {
            success: true,
            data: response.data.data
        };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
    try {
        const response = await api.patch('/api/notifications/read-all');
        
        return {
            success: true,
            updatedCount: response.data.data?.updated_count || 0
        };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
    try {
        const response = await api.delete(`/api/notifications/${notificationId}`);
        
        return {
            success: true
        };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// Helper function to format notification time
export const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diffInMinutes / 1440);
        if (days < 7) {
            return `${days}d ago`;
        } else {
            return notificationTime.toLocaleDateString();
        }
    }
};

// Helper function to get notification icon based on type
export const getNotificationIcon = (type) => {
    switch (type) {
        case 'donation':
            return '🎁';
        case 'donation_status':
            return '📋';
        case 'system':
            return '⚙️';
        case 'reminder':
            return '⏰';
        case 'alert':
            return '⚠️';
        default:
            return '📢';
    }
};

// Helper function to get notification color based on priority
export const getNotificationPriority = (priority) => {
    switch (priority) {
        case 'high':
            return {
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                dotColor: 'bg-red-500'
            };
        case 'normal':
            return {
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-800',
                dotColor: 'bg-blue-500'
            };
        case 'low':
            return {
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                textColor: 'text-gray-800',
                dotColor: 'bg-gray-500'
            };
        default:
            return {
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                textColor: 'text-gray-800',
                dotColor: 'bg-gray-500'
            };
    }
};