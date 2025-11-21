import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HiBell, 
    HiX, 
    HiCheck, 
    HiCheckCircle, 
    HiRefresh,
    HiTrash,
    HiEye
} from 'react-icons/hi';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    formatNotificationTime,
    getNotificationIcon,
    getNotificationPriority
} from '../services/notificationService';

export default function Notifs() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [processing, setProcessing] = useState(new Set());
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Load notifications
    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchNotifications(filter);
            
            if (result.success) {
                setNotifications(result.data);
            } else {
                setError(result.error || 'Failed to load notifications');
            }
        } catch (err) {
            setError('Failed to load notifications');
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle notification click to show details
    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read first
            await handleMarkAsRead(notification.notification_id);
            
            // Show notification details in a modal or expanded view
            setSelectedNotification(notification);
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    // Load notifications on component mount and filter change
    useEffect(() => {
        loadNotifications();
    }, [filter]);

    // Mark single notification as read
    const handleMarkAsRead = async (notificationId) => {
        if (processing.has(notificationId)) return;
        
        try {
            setProcessing(prev => new Set([...prev, notificationId]));
            const result = await markNotificationAsRead(notificationId);
            
            if (result.success) {
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.notification_id === notificationId 
                            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                            : notif
                    )
                );
                }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        } finally {
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(notificationId);
                return newSet;
            });
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            const result = await markAllNotificationsAsRead();
            
            if (result.success) {
                setNotifications(prev => 
                    prev.map(notif => ({ 
                        ...notif, 
                        is_read: true, 
                        read_at: new Date().toISOString() 
                    }))
                );
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete notification
    const handleDelete = async (notificationId) => {
        if (processing.has(notificationId)) return;
        
        try {
            setProcessing(prev => new Set([...prev, notificationId]));
            const result = await deleteNotification(notificationId);
            
            if (result.success) {
                setNotifications(prev => 
                    prev.filter(notif => notif.notification_id !== notificationId)
                );
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        } finally {
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(notificationId);
                return newSet;
            });
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Notification Details Modal Component
    const NotificationModal = ({ notification, onClose }) => {
        if (!notification) return null;
        
        const priorityStyles = getNotificationPriority(notification.priority);
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${priorityStyles.dotColor}`} />
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {getNotificationIcon(notification.type)} {notification.title}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {formatNotificationTime(notification.created_at)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Message:</h3>
                            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                                {notification.message}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">Type:</h4>
                                <p className="text-gray-600 capitalize">{notification.type.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">Priority:</h4>
                                <p className={`capitalize font-medium ${
                                    notification.priority === 'high' ? 'text-red-600' :
                                    notification.priority === 'normal' ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                    {notification.priority}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">Status:</h4>
                                <p className={`font-medium ${
                                    notification.is_read ? 'text-gray-600' : 'text-blue-600'
                                }`}>
                                    {notification.is_read ? 'Read' : 'Unread'}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">ID:</h4>
                                <p className="text-gray-600 font-mono text-xs">
                                    {notification.notification_id}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                            {!notification.is_read && (
                                <button
                                    onClick={() => {
                                        handleMarkAsRead(notification.notification_id);
                                        setSelectedNotification(prev => ({ ...prev, is_read: true }));
                                    }}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Mark as Read
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    handleDelete(notification.notification_id);
                                    onClose();
                                }}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <HiBell className="w-6 h-6 text-red-600 mr-3" />
                        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={loadNotifications}
                            disabled={loading}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Refresh notifications"
                        >
                            <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={loading}
                                className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    {['all', 'unread', 'read'].map((filterType) => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                filter === filterType
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                            {filterType === 'unread' && unreadCount > 0 && (
                                <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-6 text-center">
                        <HiRefresh className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                        <p className="text-gray-500">Loading notifications...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center">
                        <HiX className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-red-600 mb-2">Error loading notifications</p>
                        <p className="text-sm text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={loadNotifications}
                            className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50"
                        >
                            Try again
                        </button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                        <HiBell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 text-lg">No notifications.</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {filter === 'unread' ? "You're all caught up!" : 'No notifications found.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => {
                            const priorityStyles = getNotificationPriority(notification.priority);
                            const isProcessing = processing.has(notification.notification_id);
                            
                            return (
                                <div
                                    key={notification.notification_id}
                                    className={`p-4 hover:bg-gray-50 transition-colors ${
                                        !notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${
                                                !notification.is_read ? priorityStyles.dotColor : 'bg-gray-300'
                                            }`} />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className={`text-sm font-medium ${
                                                        !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                        {getNotificationIcon(notification.type)} {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {formatNotificationTime(notification.created_at)}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center space-x-1 ml-4">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.notification_id)}
                                                            disabled={isProcessing}
                                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <HiEye className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleDelete(notification.notification_id)}
                                                        disabled={isProcessing}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete notification"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-2">
                                                <button
                                                    onClick={() => handleNotificationClick(notification)}
                                                    className="text-xs text-red-600 hover:text-red-700 hover:underline bg-transparent border-none cursor-pointer"
                                                >
                                                    View Details →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* Notification Details Modal */}
            <NotificationModal 
                notification={selectedNotification} 
                onClose={() => setSelectedNotification(null)} 
            />
        </div>
    );
}
