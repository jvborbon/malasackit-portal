import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Verifying authentication...</p>
        </div>
    </div>
);

const ProtectedRoute = ({ 
    children, 
    requiredRoles = [], 
    fallbackPath = '/login',
    requireAuth = true 
}) => {
    const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <AuthLoading />;
    }

    if (requireAuth && !isAuthenticated) {
        return <Navigate 
            to={fallbackPath} 
            state={{ from: location.pathname }} 
            replace 
        />;
    }

    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        const userRole = user?.role_name;
        let redirectPath = '/login';
        
        if (userRole === 'Donor') {
            redirectPath = '/donor-dashboard';
        } else if (userRole === 'Resource Staff') {
            redirectPath = '/staff-dashboard';
        } else if (userRole === 'Executive Admin') {
            redirectPath = '/admin-dashboard';
        }
        
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export const AdminRoute = ({ children }) => (
    <ProtectedRoute requiredRoles={['Executive Admin']}>
        {children}
    </ProtectedRoute>
);

export const StaffRoute = ({ children }) => (
    <ProtectedRoute requiredRoles={['Resource Staff', 'Executive Admin']}>
        {children}
    </ProtectedRoute>
);

export const DonorRoute = ({ children }) => (
    <ProtectedRoute requiredRoles={['Donor']}>
        {children}
    </ProtectedRoute>
);

export const PublicRoute = ({ children, redirectPath = null }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <AuthLoading />;
    }

    if (isAuthenticated) {
        let defaultRedirect = '/';
        
        if (redirectPath) {
            defaultRedirect = redirectPath;
        } else {
            const userRole = user?.role_name;
            if (userRole === 'Donor') {
                defaultRedirect = '/donor-dashboard';
            } else if (userRole === 'Resource Staff') {
                defaultRedirect = '/staff-dashboard';
            } else if (userRole === 'Executive Admin') {
                defaultRedirect = '/admin-dashboard';
            }
        }
        
        return <Navigate to={defaultRedirect} replace />;
    }

    return children;
};

export default ProtectedRoute;