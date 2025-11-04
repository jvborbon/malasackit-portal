import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/Authentication';
import { HiExclamationTriangle } from "react-icons/hi2";

function RouteProtection({ allowedRoles = [], children }) {
    const { user, loading } = useAuth();

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

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_name)) {
        return (
            <div className='flex justify-center items-center h-screen bg-gray-50'>
                {/* Access Denied Container */}
                <div className='flex flex-col justify-center items-center text-gray-500 bg-white p-8 rounded-lg shadow-lg'>
                    <HiExclamationTriangle className='w-24 h-24 mb-4 text-red-500' />
                    <h1 className='font-bold text-3xl mb-3 text-gray-800'>Access Denied</h1>
                    <p className='text-gray-600 text-center mb-4'>
                        You do not have permission to view this page.
                    </p>
                    <p className='text-sm text-gray-500'>
                        Your role: <span className='font-semibold'>{user.role_name}</span>
                    </p>
                    <p className='text-sm text-gray-500'>
                        Required roles: <span className='font-semibold'>{allowedRoles.join(', ')}</span>
                    </p>
                </div>
            </div>
        );
    }

    return children;
}

export default RouteProtection;