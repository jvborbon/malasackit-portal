import { useState } from 'react';
import { 
    HiSearch, 
    HiPencil, 
    HiTrash, 
    HiEye,
    HiUserAdd,
    HiRefresh
} from 'react-icons/hi';
import { getTimeSinceActivity } from '../utils/userStatusService';
import PaginationComponent from './common/PaginationComponent';

// Helper function to calculate days since last login
const getDaysSinceLogin = (lastLogin) => {
    if (lastLogin === 'Never') return null;
    
    try {
        const lastLoginDate = new Date(lastLogin);
        const now = new Date();
        const diffTime = Math.abs(now - lastLoginDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    } catch (error) {
        return null;
    }
};

// Users Tab Component
export function UsersTab({ 
    users, 
    loading = false,
    searchTerm, 
    setSearchTerm, 
    filterRole, 
    setFilterRole, 
    filterStatus, 
    setFilterStatus, 
    setShowAddModal, 
    setShowEditModal, 
    setShowDeleteModal, 
    setShowUserDetails, 
    setSelectedUser, 
    pagination,
    onPageChange,
    onRefresh
}) {
    // Note: Filtering is now handled server-side, users array contains current page data

    const handleAddUser = () => {
        setSelectedUser(null);
        setShowAddModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowUserDetails(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const getRoleBadge = (role) => {
        const getRoleColor = (roleKey) => {
            switch (roleKey.toLowerCase()) {
                case 'executive admin':
                case 'admin':
                    return 'bg-purple-100 text-purple-800';
                case 'resource staff':
                case 'staff':
                    return 'bg-blue-100 text-blue-800';
                case 'donor':
                    return 'bg-green-100 text-green-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role)}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
        );
    };

    const getStatusBadge = (status, lastLogin) => {
        const daysSinceLogin = getDaysSinceLogin(lastLogin);
        
        // Define status configurations
        const statusConfig = {
            online: {
                text: 'Online',
                bgColor: 'bg-green-100',
                textColor: 'text-green-800',
                icon: '●',
                tooltip: 'User is currently active (logged in within 15 minutes)'
            },
            offline: {
                text: 'Offline',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800',
                icon: '●',
                tooltip: lastLogin === 'Never' ? 'User has never logged in' : `User was last active ${daysSinceLogin ? daysSinceLogin + ' days ago' : 'recently'}`
            },
            inactive: {
                text: 'Inactive',
                bgColor: 'bg-red-100',
                textColor: 'text-red-800',
                icon: '●',
                tooltip: lastLogin === 'Never' 
                    ? 'User has never logged in' 
                    : `User has been inactive for ${daysSinceLogin ? daysSinceLogin + ' days' : 'more than 30 days'}`
            }
        };
        
        const config = statusConfig[status] || statusConfig.inactive;
        
        return (
            <span 
                className={`px-2 py-1 text-xs font-medium rounded-full cursor-help flex items-center gap-1 ${config.bgColor} ${config.textColor}`}
                title={config.tooltip}
            >
                <span className="text-xs">{config.icon}</span>
                {config.text}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="all">All Roles</option>
                    <option value="executive admin">Executive Admin</option>
                    <option value="resource staff">Resource Staff</option>
                    <option value="donor">Donor</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="all">All Status</option>
                    <option value="online">● Online</option>
                    <option value="offline">● Offline</option>
                    <option value="inactive">● Inactive</option>
                </select>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <HiRefresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
                <button
                    onClick={handleAddUser}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                    <HiUserAdd className="w-4 h-4 mr-2" />
                    Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full">
                        <thead className="bg-red-600 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(user.status, user.lastLogin)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className={`${
                                            user.lastLogin === 'Never' 
                                                ? 'text-red-500 font-medium' 
                                                : user.status === 'online'
                                                ? 'text-green-600 font-medium'
                                                : 'text-gray-500'
                                        }`}>
                                            <div>{getTimeSinceActivity(user.lastLogin)}</div>
                                            {user.lastLogin !== 'Never' && (
                                                <div className="text-xs text-gray-400">
                                                    {new Date(user.lastLogin).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button
                                            onClick={() => handleViewUser(user)}
                                            className="text-gray-600 hover:text-gray-900"
                                            title="View Details"
                                        >
                                            <HiEye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Edit User"
                                        >
                                            <HiPencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete User"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <PaginationComponent 
                    pagination={pagination} 
                    onPageChange={onPageChange}
                    itemName="users"
                />
            )}
        </div>
    );
}

export default UsersTab;