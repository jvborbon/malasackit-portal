import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../components/utilities/api';

const AuthContext = createContext();

function Authentication({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasAttemptedAuth = useRef(false);

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
                setUser(userData);
                return userData.role_name; // Return role for redirect logic
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
            hasAnyRole
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export default Authentication;
export const useAuth = () => useContext(AuthContext);
