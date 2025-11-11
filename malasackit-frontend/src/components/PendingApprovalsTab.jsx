import { useState, useEffect } from 'react';
import { 
    HiSearch, 
    HiCheckCircle, 
    HiMail,
    HiPhone,
    HiClock,
    HiCheck,
    HiX,
    HiRefresh
} from 'react-icons/hi';
import api from './utilities/api';

// Pending Approvals Tab Component
export function PendingApprovalsTab() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Fetch pending users
    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/auth/pending');
            if (response.data.success) {
                setPendingUsers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching pending users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Approve user
    const handleApproveUser = async (userId) => {
        try {
            setProcessingId(userId);
            const response = await api.post(`/api/auth/approve/${userId}`);
            
            if (response.data.success) {
                // Remove from pending list
                setPendingUsers(prev => prev.filter(user => user.user_id !== userId));
                
                // Show success message
                alert('User approved successfully! They will receive an email notification.');
            }
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Failed to approve user. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    // Reject user
    const handleRejectUser = async (userId, reason = '') => {
        if (!confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
            return;
        }

        try {
            setProcessingId(userId);
            const response = await api.delete(`/api/auth/reject/${userId}`, {
                data: { reason }
            });
            
            if (response.data.success) {
                // Remove from pending list
                setPendingUsers(prev => prev.filter(user => user.user_id !== userId));
                
                // Show success message
                alert('User registration rejected and removed.');
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert('Failed to reject user. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    // Filter users based on search
    const filteredUsers = pendingUsers.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.account_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch data on component mount
    useEffect(() => {
        fetchPendingUsers();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header with Search */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Pending Account Approvals ({pendingUsers.length})
                    </h2>
                    <button
                        onClick={fetchPendingUsers}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HiRefresh className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search pending users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <span className="ml-2 text-gray-600">Loading pending approvals...</span>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                    <HiCheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {pendingUsers.length === 0 
                            ? 'All registrations have been processed.' 
                            : 'No users match your search criteria.'
                        }
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Information
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registration Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                        <span className="text-red-600 font-medium text-sm">
                                                            {user.full_name?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.full_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <HiMail className="w-4 h-4 mr-1" />
                                                        {user.email}
                                                    </div>
                                                    {user.contact_num && (
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <HiPhone className="w-4 h-4 mr-1" />
                                                            {user.contact_num}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {user.account_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <HiClock className="w-4 h-4 mr-1" />
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(user.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>
                                                {user.municipality_name && (
                                                    <div>{user.municipality_name}</div>
                                                )}
                                                {user.province_name && (
                                                    <div className="text-xs text-gray-400">{user.province_name}</div>
                                                )}
                                                {user.region_name && (
                                                    <div className="text-xs text-gray-400">{user.region_name}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleApproveUser(user.user_id)}
                                                    disabled={processingId === user.user_id}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                >
                                                    {processingId === user.user_id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    ) : (
                                                        <>
                                                            <HiCheck className="w-4 h-4 mr-1" />
                                                            Approve
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleRejectUser(user.user_id)}
                                                    disabled={processingId === user.user_id}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                                >
                                                    <HiX className="w-4 h-4 mr-1" />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PendingApprovalsTab;