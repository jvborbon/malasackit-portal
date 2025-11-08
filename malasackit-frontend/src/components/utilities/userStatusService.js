// Real-time user status service
import { useState, useEffect, useRef } from 'react';

export const useUserStatusUpdater = (users, setUsers, intervalMs = 60000) => { // Update every minute
    const intervalRef = useRef(null);
    
    useEffect(() => {
        // Function to update user statuses based on last login
        const updateUserStatuses = () => {
            const now = new Date();
            
            const updatedUsers = users.map(user => {
                if (user.lastLogin === 'Never') {
                    return { ...user, status: 'inactive' };
                }
                
                try {
                    const lastLoginDate = new Date(user.lastLogin);
                    const minutesSinceLogin = (now - lastLoginDate) / (1000 * 60);
                    const daysSinceLogin = minutesSinceLogin / (60 * 24);
                    
                    let newStatus;
                    if (daysSinceLogin > 30) {
                        newStatus = 'inactive';
                    } else if (minutesSinceLogin <= 15) {
                        newStatus = 'online';
                    } else {
                        newStatus = 'offline';
                    }
                    
                    // Only update if status changed
                    if (user.status !== newStatus) {
                        return { ...user, status: newStatus };
                    }
                    return user;
                } catch (error) {
                    console.error('Error parsing last login date:', error);
                    return { ...user, status: 'inactive' };
                }
            });
            
            // Check if any status actually changed
            const hasChanges = updatedUsers.some((user, index) => user.status !== users[index]?.status);
            if (hasChanges) {
                setUsers(updatedUsers);
            }
        };
        
        // Set up interval for real-time updates
        if (users.length > 0) {
            intervalRef.current = setInterval(updateUserStatuses, intervalMs);
        }
        
        // Cleanup interval on unmount or users change
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
export const getTimeSinceActivity = (lastLogin) => {
    if (lastLogin === 'Never') {
        return 'Never logged in';
    }
    
    try {
        const lastLoginDate = new Date(lastLogin);
        const now = new Date();
        const diffMs = now - lastLoginDate;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`;
        } else {
            return `${diffDays} days ago`;
        }
    } catch (error) {
        return 'Unknown';
    }
};