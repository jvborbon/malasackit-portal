import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/Authentication';
import { HiExclamationTriangle } from "react-icons/hi2";

function RouteProtection({ allowedRoles = [], children }) {
    const { user, loading, getDefaultDashboard } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Handle unauthorized access - redirect to appropriate dashboard
    useEffect(() => {
        if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role_name)) {
            console.warn(`🚫 Access Denied: User with role "${user.role_name}" attempted to access "${location.pathname}"`);
            console.warn(`📋 Required roles: [${allowedRoles.join(', ')}]`);
            console.info(`🔄 Redirecting to appropriate dashboard...`);
            
            const defaultDashboard = getDefaultDashboard(user.role_name);
            // Replace current history entry instead of adding new one
            navigate(defaultDashboard, { replace: true });
        }
    }, [user, allowedRoles, navigate, getDefaultDashboard, location.pathname]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <div className='flex flex-col justify-center items-center text-gray-500'>
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Always route to the login if there is no user
    if (!user) return <Navigate to="/login" replace />;

    // Check if user has required role - redirect instead of showing error
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_name)) {
        console.warn(`🚫 Access Denied: User with role "${user.role_name}" attempted to access "${location.pathname}"`);
        console.warn(`📋 Required roles: [${allowedRoles.join(', ')}]`);
        
        const defaultDashboard = getDefaultDashboard(user.role_name);
        console.info(`🔄 Redirecting to: ${defaultDashboard}`);
        
        return <Navigate to={defaultDashboard} replace />;
    }

    return children;
}

export default RouteProtection;