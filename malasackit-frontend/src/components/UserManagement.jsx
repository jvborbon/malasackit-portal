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
    HiUsers
} from 'react-icons/hi';
import UserModalForm from './UserModalForm';
import UserDetails from './UserDetails';
import { UsersTab, ActivityLogsTab } from './UserManagementTabs';

export default function UserManagement() {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUserDetails, setShowUserDetails] = useState(false);
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
                permissions: ['user_management', 'system_settings', 'reports'],
                phone: '+63 912 345 6789',
                streetAddress: '123 Main Street',
                brgysubdivision: 'Barangay San Antonio',
                city: 'Manila',
                state: 'Metro Manila',
                zipCode: '1000',
                parish: 'St. John the Baptist Parish',
                vicariate: 'Manila Vicariate'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                role: 'staff',
                status: 'active',
                lastLogin: '2024-01-14 02:15 PM',
                dateCreated: '2024-01-05',
                permissions: ['inventory_management', 'beneficiary_logs', 'donation_requests'],
                phone: '+63 917 234 5678',
                streetAddress: '456 Oak Avenue',
                brgysubdivision: 'Barangay Santa Maria',
                city: 'Quezon City',
                state: 'Metro Manila',
                zipCode: '1100'
            },
            {
                id: 3,
                name: 'Mike Johnson',
                email: 'mike.johnson@example.com',
                role: 'donor',
                status: 'inactive',
                lastLogin: '2024-01-10 09:45 AM',
                dateCreated: '2024-01-03',
                permissions: ['donate', 'view_history'],
                phone: '+63 905 123 4567',
                streetAddress: '789 Pine Road',
                brgysubdivision: 'Barangay San Jose',
                city: 'Makati',
                state: 'Metro Manila',
                zipCode: '1200',
                parish: 'Our Lady of Perpetual Help Parish'
            },
            {
                id: 4,
                name: 'Sarah Wilson',
                email: 'sarah.wilson@example.com',
                role: 'staff',
                status: 'active',
                lastLogin: '2024-01-15 08:20 AM',
                dateCreated: '2024-01-08',
                permissions: ['inventory_management', 'beneficiary_logs'],
                phone: '+63 922 987 6543',
                streetAddress: '321 Elm Street',
                city: 'Pasig',
                state: 'Metro Manila',
                zipCode: '1600'
            },
            {
                id: 5,
                name: 'David Brown',
                email: 'david.brown@example.com',
                role: 'donor',
                status: 'active',
                lastLogin: '2024-01-13 11:00 AM',
                dateCreated: '2024-01-12',
                permissions: ['donate', 'view_history'],
                phone: '+63 918 567 8901',
                streetAddress: '654 Maple Drive',
                brgysubdivision: 'Barangay San Miguel',
                city: 'Taguig',
                state: 'Metro Manila',
                zipCode: '1630',
                vicariate: 'South Manila Vicariate'
            }
        ];

        const mockActivityLogs = [
            {
                id: 1,
                userId: 1,
                userName: 'John Doe',
                userEmail: 'john.doe@example.com',
                action: 'login',
                description: 'User logged into the system',
                timestamp: '2024-01-15 10:30:15',
                ipAddress: '192.168.1.100',
                userAgent: 'Chrome 120.0.0.0',
                status: 'success'
            },
            {
                id: 2,
                userId: 2,
                userName: 'Jane Smith',
                userEmail: 'jane.smith@example.com',
                action: 'donation_request',
                description: 'Created new donation request for food items',
                timestamp: '2024-01-14 14:45:22',
                ipAddress: '192.168.1.101',
                userAgent: 'Firefox 121.0.0.0',
                status: 'success'
            },
            {
                id: 3,
                userId: 5,
                userName: 'David Brown',
                userEmail: 'david.brown@example.com',
                action: 'registration',
                description: 'New user account created',
                timestamp: '2024-01-12 11:15:30',
                ipAddress: '192.168.1.102',
                userAgent: 'Safari 17.2.1',
                status: 'success'
            },
            {
                id: 4,
                userId: 3,
                userName: 'Mike Johnson',
                userEmail: 'mike.johnson@example.com',
                action: 'login_failed',
                description: 'Failed login attempt - incorrect password',
                timestamp: '2024-01-10 09:45:12',
                ipAddress: '192.168.1.103',
                userAgent: 'Chrome 120.0.0.0',
                status: 'failed'
            },
            {
                id: 5,
                userId: 1,
                userName: 'John Doe',
                userEmail: 'john.doe@example.com',
                action: 'user_management',
                description: 'Updated user permissions for Sarah Wilson',
                timestamp: '2024-01-08 16:20:45',
                ipAddress: '192.168.1.100',
                userAgent: 'Chrome 120.0.0.0',
                status: 'success'
            },
            {
                id: 6,
                userId: 2,
                userName: 'Jane Smith',
                userEmail: 'jane.smith@example.com',
                action: 'inventory_update',
                description: 'Updated inventory quantities for rice and canned goods',
                timestamp: '2024-01-07 13:30:18',
                ipAddress: '192.168.1.101',
                userAgent: 'Firefox 121.0.0.0',
                status: 'success'
            },
            {
                id: 7,
                userId: 4,
                userName: 'Sarah Wilson',
                userEmail: 'sarah.wilson@example.com',
                action: 'distribution',
                description: 'Distributed food packages to 25 beneficiaries',
                timestamp: '2024-01-06 10:15:33',
                ipAddress: '192.168.1.104',
                userAgent: 'Edge 120.0.0.0',
                status: 'success'
            },
            {
                id: 8,
                userId: 5,
                userName: 'David Brown',
                userEmail: 'david.brown@example.com',
                action: 'donation',
                description: 'Made donation of ₱5,000',
                timestamp: '2024-01-05 15:22:41',
                ipAddress: '192.168.1.102',
                userAgent: 'Safari 17.2.1',
                status: 'success'
            }
        ];
        
        // Load data immediately instead of using setTimeout
        setUsers(mockUsers);
        setActivityLogs(mockActivityLogs);
        setLoading(false);
    }, []);

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">User Management & Activity</h1>
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
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'users' && (
                        <UsersTab 
                            users={users}
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
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            usersPerPage={usersPerPage}
                        />
                    )}
                    {activeTab === 'activity' && (
                        <ActivityLogsTab activityLogs={activityLogs} />
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
