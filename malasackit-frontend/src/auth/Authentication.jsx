import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../components/utilities/api';

const AuthContext = createContext();

function Authentication({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasAttemptedAuth = useRef(false);

    // Function to get the appropriate dashboard based on user role
    const getDefaultDashboard = (userRole) => {
        switch (userRole) {
            case 'Executive Admin':
                return '/admin-dashboard';
            case 'Resource Staff':
                return '/staff-dashboard';
            case 'Donor':
                return '/donor-dashboard';
            default:
                return '/login';
        }
    };

    // Prevent back navigation to unauthorized pages
    useEffect(() => {
        if (!user?.role_name) return;

        const handlePopstate = (event) => {
            // Use requestAnimationFrame for better performance than setTimeout
            requestAnimationFrame(() => {
                const currentPath = window.location.pathname;
                const allowedPaths = {
                    'Executive Admin': ['/admin-dashboard'],
                    'Resource Staff': ['/staff-dashboard', '/admin-dashboard'], 
                    'Donor': ['/donor-dashboard']
                };
                
                const userAllowedPaths = allowedPaths[user.role_name] || [];
                
                // Only redirect if truly unauthorized (avoid unnecessary redirects)
                if (currentPath !== '/login' && !userAllowedPaths.includes(currentPath)) {
                    const defaultDashboard = getDefaultDashboard(user.role_name);
                    // Use history.pushState instead of location.replace for smoother transitions
                    window.history.pushState(null, '', defaultDashboard);
                    // Dispatch a custom event to trigger React Router navigation
                    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
                }
            });
        };

        window.addEventListener('popstate', handlePopstate, { passive: true });
        return () => window.removeEventListener('popstate', handlePopstate);
    }, [user?.role_name]);

    // Fetch current user from backend on mount (using JWT cookie)
    useEffect(() => {
        // Only attempt once per app load
        if (hasAttemptedAuth.current) return;
        hasAttemptedAuth.current = true;

        const fetchCurrentUser = async () => {
            try {
                const response = await api.get('/api/auth/profile');
                if (response.data.success) {
                    setUser(response.data.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                // No valid session - user needs to login
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const loginAuthentication = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { 
                email, 
                password 
            });
            
            if (response.data.success) {
                const userData = response.data.data.user;
                
                // Update user state first
                setUser(userData);
                
                // Use React Router navigation instead of direct history manipulation
                // This is more React-friendly and causes fewer layout shifts
                const defaultDashboard = getDefaultDashboard(userData.role_name);
                
                // Use a more gentle navigation approach
                // Instead of immediate history replacement, let React Router handle it
                return {
                    success: true,
                    role: userData.role_name,
                    redirectTo: defaultDashboard
                };
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            // Handle specific authentication errors
            if (error.response && error.response.status === 401) {
                const errorMessage = error.response.data.message || 'Invalid credentials';
                throw new Error(errorMessage);
            }
            // Handle other errors
            throw new Error('Something went wrong. Please try again.');
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setUser(null);
            // Let React Router handle navigation instead of direct history manipulation
        }
    };

    // Helper function to check if user has any of the required roles
    const hasAnyRole = (allowedRoles) => {
        if (!user || !user.role_name) return false;
        if (!allowedRoles || allowedRoles.length === 0) return true;
        
        // For your backend structure, role_name is a string
        return allowedRoles.includes(user.role_name);
    };

    return (
        <AuthContext.Provider value={{
            user, 
            loginAuthentication, 
            logout, 
            loading,
            hasAnyRole,
            getDefaultDashboard
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export default Authentication;
export const useAuth = () => useContext(AuthContext);
