import { useState } from 'react';
import { 
    HiSearch, 
    HiPencil, 
    HiTrash, 
    HiEye,
    HiUserAdd
} from 'react-icons/hi';
import { getTimeSinceActivity } from './utilities/userStatusService';

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
    currentPage, 
    setCurrentPage, 
    usersPerPage 
}) {
    // Filter and search logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
        const colors = {
            admin: 'bg-purple-100 text-purple-800',
            staff: 'bg-blue-100 text-blue-800',
            donor: 'bg-green-100 text-green-800'
        };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role]}`}>
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
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
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
                            {currentUsers.map((user) => (
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
                            {currentUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">Page {currentPage} of {Math.max(1, totalPages)}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages <= 1}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UsersTab;