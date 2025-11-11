import { useState } from 'react';
import { 
    HiSearch, 
    HiExclamation,
    HiCheckCircle,
    HiClipboardList,
    HiUserAdd as HiUserAddIcon,
    HiRefresh
} from 'react-icons/hi';
import PaginationComponent from './common/PaginationComponent';

// Activity Logs Tab Component
export function ActivityLogsTab({ activityLogs, loading = false, pagination, onPageChange, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterUser, setFilterUser] = useState('all');

    // Note: Filtering is now handled server-side, activityLogs array contains current page data

    // Get unique users for filter
    const uniqueUsers = [...new Set(activityLogs.map(log => log.userName))];

    const getActionIcon = (action, status) => {
        if (status === 'failed') {
            return <HiExclamation className="w-4 h-4 text-red-500" />;
        }

        switch (action) {
            case 'login':
                return <HiCheckCircle className="w-4 h-4 text-green-500" />;
            case 'registration':
                return <HiUserAddIcon className="w-4 h-4 text-blue-500" />;
            case 'login_failed':
                return <HiExclamation className="w-4 h-4 text-red-500" />;
            default:
                return <HiClipboardList className="w-4 h-4 text-gray-500" />;
        }
    };

    const getActionBadge = (action, status) => {
        if (status === 'failed') {
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Failed
                </span>
            );
        }

        const badgeColors = {
            login: 'bg-green-100 text-green-800',
            registration: 'bg-blue-100 text-blue-800',
            donation_request: 'bg-purple-100 text-purple-800',
            distribution: 'bg-orange-100 text-orange-800',
            user_management: 'bg-indigo-100 text-indigo-800',
            inventory_update: 'bg-yellow-100 text-yellow-800',
            donation: 'bg-emerald-100 text-emerald-800'
        };

        const actionNames = {
            login: 'Login',
            registration: 'Registration',
            donation_request: 'Donation Request',
            distribution: 'Distribution',
            user_management: 'User Management',
            inventory_update: 'Inventory',
            donation: 'Donation'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColors[action] || 'bg-gray-100 text-gray-800'}`}>
                {actionNames[action] || action.replace('_', ' ')}
            </span>
        );
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        }
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search activity logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                            disabled={loading}
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        disabled={loading}
                    >
                        <option value="all">All Actions</option>
                        <option value="login">Login</option>
                        <option value="registration">Registration</option>
                        <option value="donation_request">Donation Request</option>
                        <option value="distribution">Distribution</option>
                        <option value="user_management">User Management</option>
                        <option value="inventory_update">Inventory Update</option>
                        <option value="donation">Donation</option>
                    </select>
                    <select
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        disabled={loading}
                    >
                        <option value="all">All Users</option>
                        {uniqueUsers.map(user => (
                            <option key={user} value={user}>{user}</option>
                        ))}
                    </select>
                </div>
                {/* Refresh Button */}
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <HiRefresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Activity Logs List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-y-auto max-h-96">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-gray-600">
                                <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-500">
                                    <div className="h-5 w-5 border-4 border-red-200 border-t-red-500 rounded-full"></div>
                                </div>
                                Loading activity logs...
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {activityLogs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="flex-shrink-0 mt-1">
                                                {getActionIcon(log.action, log.status)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {log.userName}
                                                    </p>
                                                    {getActionBadge(log.action, log.status)}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {log.description}
                                                </p>
                                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                <span>{formatTimestamp(log.timestamp)}</span>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {activityLogs.length === 0 && !loading && (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    No activity logs found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <PaginationComponent 
                    pagination={pagination} 
                    onPageChange={onPageChange}
                    itemName="logs"
                />
            )}
        </div>
    );
}

export default ActivityLogsTab;