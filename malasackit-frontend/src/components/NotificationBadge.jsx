import { useState, useEffect } from 'react';
import { HiBell } from 'react-icons/hi';
import { getUnreadCount } from '../services/notificationService';

export default function NotificationBadge({ className = "" }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = async () => {
        try {
            setLoading(true);
            const result = await getUnreadCount();
            
            if (result.success) {
                setUnreadCount(result.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        
        // Set up polling for real-time updates (every 30 seconds)
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`relative ${className}`}>
            <HiBell className="w-6 h-6" />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
            {loading && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            )}
        </div>
    );
}