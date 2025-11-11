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
    HiClipboardList,
    HiUsers,
    HiClock
} from 'react-icons/hi';
import UserModalForm from './UserModalForm';
import UserDetails from './UserDetails';
import { UsersTab } from './UsersTab';
import { ActivityLogsTab } from './ActivityLogsTab';
import { PendingApprovalsTab } from './PendingApprovalsTab';
import api from './utilities/api';
import { useUserStatusUpdater } from './utilities/userStatusService';

export default function UserManagement() {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [usersPagination, setUsersPagination] = useState({
        currentPage: 1,
        pages: 1,
        total: 0,
        limit: 20
    });
    const [logsPagination, setLogsPagination] = useState({
        currentPage: 1,
        pages: 1,
        total: 0,
        limit: 20
    });

    // Set up real-time status updates
    const { updateNow } = useUserStatusUpdater(users, setUsers, 60000); // Update every minute

    // Fetch users with pagination
    const fetchUsers = async (page = 1, search = '', role = '', status = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: usersPagination.limit.toString()
            });
            
            if (search) params.append('search', search);
            if (role && role !== 'all') params.append('role', role);
            if (status && status !== 'all') params.append('status', status);
            
            const response = await api.get(`/api/auth/all?${params}`);
            
            if (response.data.success) {
                // Transform API data to match expected format
                const transformedUsers = response.data.data.map(user => ({
                    id: user.user_id,
                    name: user.full_name,
                    email: user.email,
                    role: user.role_name?.toLowerCase() || 'donor',
                    status: user.activity_status || 'inactive',
                    lastLogin: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
                    dateCreated: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown',
                    permissions: getUserPermissions(user.role_name),
                    phone: user.contact_num || 'Not provided',
                    streetAddress: 'Not provided',
                    brgysubdivision: user.barangay_name || 'Not provided',
                    city: user.municipality_name || 'Not provided',
                    state: user.province_name || 'Not provided',
                    zipCode: 'Not provided',
                    parish: user.parish_id || 'Not provided',
                    vicariate: user.vicariate_id || 'Not provided',
                    region: user.region_name || 'Not provided'
                }));
                
                setUsers(transformedUsers);
                setUsersPagination(response.data.pagination);
            } else {
                console.error('Failed to fetch users:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch activity logs with pagination
    const fetchActivityLogs = async (page = 1, search = '', action = '', userId = '') => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: logsPagination.limit.toString()
            });
            
            if (search) params.append('search', search);
            if (action && action !== 'all') params.append('action', action);
            if (userId && userId !== 'all') params.append('userId', userId);
            
            const response = await api.get(`/api/auth/activity-logs?${params}`);
            
            if (response.data.success) {
                setActivityLogs(response.data.data);
                setLogsPagination(response.data.pagination);
            } else {
                console.error('Failed to fetch activity logs:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            setActivityLogs([]);
        }
    };
    
    // Initial data loading
    useEffect(() => {
        fetchUsers();
        fetchActivityLogs();
    }, []);

    // Refresh functions
    const refreshUsers = () => {
        fetchUsers(usersPagination.currentPage, searchTerm, filterRole, filterStatus);
    };

    const refreshActivityLogs = () => {
        fetchActivityLogs(logsPagination.currentPage);
    };
    
    // Pagination handlers
    const handleUsersPageChange = (page) => {
        setUsersPagination(prev => ({ ...prev, currentPage: page }));
        fetchUsers(page, searchTerm, filterRole, filterStatus);
    };
    
    const handleLogsPageChange = (page) => {
        setLogsPagination(prev => ({ ...prev, currentPage: page }));
        fetchActivityLogs(page);
    };

    // Fetch activity logs when activity tab is opened
    useEffect(() => {
        if (activeTab === 'activity') {
            refreshActivityLogs();
        }
    }, [activeTab]);

    // Helper function to get user permissions based on role
    const getUserPermissions = (roleName) => {
        const rolePermissions = {
            'Executive Admin': ['user_management', 'system_settings', 'reports', 'approval_management'],
            'Resource Staff': ['inventory_management', 'beneficiary_logs', 'donation_requests', 'distribution'],
            'Donor': ['donate', 'view_history', 'profile_management']
        };
        
        return rolePermissions[roleName] || ['basic_access'];
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
            {/* Action Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 mt-1">Real-time user status monitoring</p>
                <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    Live Status Updates
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                activeTab === 'users'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <HiUsers className="w-5 h-5" />
                            <span>Users ({users.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                activeTab === 'activity'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <HiClipboardList className="w-5 h-5" />
                            <span>Activity Logs ({activityLogs.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                activeTab === 'pending'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <HiClock className="w-5 h-5" />
                            <span>Pending Approvals</span>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'users' && (
                        <UsersTab 
                            users={users}
                            loading={loading}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterRole={filterRole}
                            setFilterRole={setFilterRole}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            setShowAddModal={setShowAddModal}
                            setShowEditModal={setShowEditModal}
                            setShowDeleteModal={setShowDeleteModal}
                            setShowUserDetails={setShowUserDetails}
                            setSelectedUser={setSelectedUser}
                            pagination={usersPagination}
                            onPageChange={handleUsersPageChange}
                            onRefresh={refreshUsers}
                        />
                    )}
                    {activeTab === 'activity' && (
                        <ActivityLogsTab 
                            activityLogs={activityLogs} 
                            loading={logsLoading}
                            pagination={logsPagination}
                            onPageChange={handleLogsPageChange}
                            onRefresh={refreshActivityLogs}
                        />
                    )}
                    {activeTab === 'pending' && (
                        <PendingApprovalsTab />
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <UserModalForm
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    user={null}
                    onSave={(userData) => {
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
                <UserModalForm
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    user={selectedUser}
                    onSave={(userData) => {
                        setUsers(users.map(user => 
                            user.id === selectedUser.id ? { ...user, ...userData } : user
                        ));
                        setShowEditModal(false);
                    }}
                />
            )}

            {showUserDetails && selectedUser && (
                <UserDetails
                    isOpen={showUserDetails}
                    onClose={() => setShowUserDetails(false)}
                    user={selectedUser}
                    onEdit={(user) => {
                        setShowUserDetails(false);
                        setSelectedUser(user);
                        setShowEditModal(true);
                    }}
                    onDelete={(user) => {
                        setShowUserDetails(false);
                        setSelectedUser(user);
                        setShowDeleteModal(true);
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
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
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
            </div>
        </div>
    );
}
