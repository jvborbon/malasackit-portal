import { useState, useEffect } from 'react';
import { 
    HiSearch, 
    HiFilter, 
    HiPlus, 
    HiPencil, 
    HiTrash, 
    HiEye,
    HiUserAdd,
    HiChevronDown,
    HiX,
    HiCheck,
    HiBan
} from 'react-icons/hi';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    // Mock data - replace with API calls
    useEffect(() => {
        const mockUsers = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: 'admin',
                status: 'active',
                lastLogin: '2024-01-15 10:30 AM',
                dateCreated: '2024-01-01',
                permissions: ['user_management', 'system_settings', 'reports']
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                role: 'staff',
                status: 'active',
                lastLogin: '2024-01-14 02:15 PM',
                dateCreated: '2024-01-05',
                permissions: ['inventory_management', 'beneficiary_logs', 'donation_requests']
            },
            {
                id: 3,
                name: 'Mike Johnson',
                email: 'mike.johnson@example.com',
                role: 'donor',
                status: 'inactive',
                lastLogin: '2024-01-10 09:45 AM',
                dateCreated: '2024-01-03',
                permissions: ['donate', 'view_history']
            },
            {
                id: 4,
                name: 'Sarah Wilson',
                email: 'sarah.wilson@example.com',
                role: 'staff',
                status: 'active',
                lastLogin: '2024-01-15 08:20 AM',
                dateCreated: '2024-01-08',
                permissions: ['inventory_management', 'beneficiary_logs']
            },
            {
                id: 5,
                name: 'David Brown',
                email: 'david.brown@example.com',
                role: 'donor',
                status: 'active',
                lastLogin: '2024-01-13 11:00 AM',
                dateCreated: '2024-01-12',
                permissions: ['donate', 'view_history']
            }
        ];
        
        // Load data immediately instead of using setTimeout
        setUsers(mockUsers);
        setLoading(false);
    }, []);

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

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleToggleStatus = (userId) => {
        setUsers(users.map(user => 
            user.id === userId 
                ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
                : user
        ));
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

    const getStatusBadge = (status) => {
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
            }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Search and Actions */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
            </div>

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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
                                        {getStatusBadge(user.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.lastLogin}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Edit User"
                                        >
                                            <HiPencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(user.id)}
                                            className={`${
                                                user.status === 'active'
                                                    ? 'text-red-600 hover:text-red-900'
                                                    : 'text-green-600 hover:text-green-900'
                                            }`}
                                            title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                        >
                                            {user.status === 'active' ? <HiBan className="w-4 h-4" /> : <HiCheck className="w-4 h-4" />}
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
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {currentUsers.length} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <UserModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    user={null}
                    onSave={(userData) => {
                        // Add new user logic
                        const newUser = {
                            ...userData,
                            id: users.length + 1,
                            dateCreated: new Date().toISOString().split('T')[0],
                            lastLogin: 'Never'
                        };
                        setUsers([...users, newUser]);
                        setShowAddModal(false);
                    }}
                />
            )}

            {showEditModal && selectedUser && (
                <UserModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    user={selectedUser}
                    onSave={(userData) => {
                        // Update user logic
                        setUsers(users.map(user => 
                            user.id === selectedUser.id ? { ...user, ...userData } : user
                        ));
                        setShowEditModal(false);
                    }}
                />
            )}

            {showDeleteModal && selectedUser && (
                <DeleteConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    user={selectedUser}
                    onConfirm={() => {
                        setUsers(users.filter(user => user.id !== selectedUser.id));
                        setShowDeleteModal(false);
                    }}
                />
            )}
        </div>
    );
}

// User Modal Component
function UserModal({ isOpen, onClose, user, onSave }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'donor',
        status: user?.status || 'active',
        permissions: user?.permissions || []
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const rolePermissions = {
        admin: ['user_management', 'system_settings', 'reports', 'beneficiary_logs', 'donation_requests'],
        staff: ['inventory_management', 'beneficiary_logs', 'donation_requests'],
        donor: ['donate', 'view_history']
    };

    const handleRoleChange = (newRole) => {
        setFormData({
            ...formData,
            role: newRole,
            permissions: rolePermissions[newRole] || []
        });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSave(formData);
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            {user ? 'Edit User' : 'Add New User'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {user ? 'Update user information and permissions' : 'Create a new user account'}
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
                        disabled={isSubmitting}
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 transition-colors duration-200 ${
                                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-red-500'
                            }`}
                            placeholder="Enter full name"
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 transition-colors duration-200 ${
                                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-red-500'
                            }`}
                            placeholder="Enter email address"
                            disabled={isSubmitting}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Role and Status Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Role Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-colors duration-200"
                                disabled={isSubmitting}
                            >
                                <option value="donor">Donor</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Status Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-colors duration-200"
                                disabled={isSubmitting}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Permissions
                            <span className="text-xs text-gray-500 ml-1">(Auto-assigned based on role)</span>
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                {formData.permissions.map((permission) => (
                                    <div key={permission} className="flex items-center">
                                        <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full mr-3 flex-shrink-0">
                                            <HiCheck className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-sm text-gray-700">
                                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {formData.permissions.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No permissions assigned</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {user ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                user ? 'Update User' : 'Create User'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, onClose, user, onConfirm }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            onConfirm();
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                    {/* Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <HiTrash className="h-8 w-8 text-red-600" />
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete User</h3>
                        <p className="text-gray-600 mb-2">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-gray-900">{user?.name}</span>?
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            This action cannot be undone. All data associated with this user will be permanently removed.
                        </p>
                    </div>
                    
                    {/* User Info Card */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-gray-700">
                                    {user?.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{user?.name}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                </>
                            ) : (
                                'Delete User'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
