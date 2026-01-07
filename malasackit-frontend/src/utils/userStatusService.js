// Real-time user status service
import { useState, useEffect, useRef } from 'react';

export const useUserStatusUpdater = (users, setUsers, intervalMs = 60000) => { // Update every minute
    const intervalRef = useRef(null);
    
    useEffect(() => {
        // Status is now managed by backend based on actual login/logout
        // No need to recalculate on frontend
        // This hook is kept for compatibility but does nothing
        
        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [users, setUsers, intervalMs]);
    
    // Return manual update function
    return {
        updateNow: () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            // Trigger immediate update by calling the effect again
        }
    };
};

// Helper function to get status priority for sorting
export const getStatusPriority = (status) => {
    const priorities = {
        online: 1,
        offline: 2, 
        inactive: 3
    };
    return priorities[status] || 4;
};

// Helper function to format time since last activity
export const getTimeSinceActivity = (lastLogin, status, lastLogout = null) => {
    if (lastLogin === 'Never') {
        return 'Never logged in';
    }
    
    try {
        // For offline users, use last_logout time; otherwise use last_login
        const activityTime = (status === 'offline' && lastLogout) ? lastLogout : lastLogin;
        const activityDate = new Date(activityTime);
        const now = new Date();
        const diffMs = now - activityDate;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }
    } catch (error) {
        return 'Unknown';
    }
};