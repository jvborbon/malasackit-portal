import { useState } from 'react';
import { 
    HiSearch, 
    HiExclamation,
    HiCheckCircle,
    HiClipboardList,
    HiUserAdd as HiUserAddIcon
} from 'react-icons/hi';

// Activity Logs Tab Component
export function ActivityLogsTab({ activityLogs }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterUser, setFilterUser] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    // Filter activity logs
    const filteredLogs = activityLogs.filter(log => {
        const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'all' || log.action === filterAction;
        const matchesUser = filterUser === 'all' || log.userName === filterUser;
        
        return matchesSearch && matchesAction && matchesUser;
    });

    // Pagination
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

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
                        placeholder="Search activity logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                </div>
                <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
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
                >
                    <option value="all">All Users</option>
                    {uniqueUsers.map(user => (
                        <option key={user} value={user}>{user}</option>
                    ))}
                </select>
            </div>

            {/* Activity Logs List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-y-auto max-h-96">
                    <div className="divide-y divide-gray-200">
                        {currentLogs.map((log) => (
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
                                                <span>IP: {log.ipAddress}</span>
                                                <span>{log.userAgent}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {currentLogs.length === 0 && (
                            <div className="p-8 text-center text-sm text-gray-500">
                                No activity logs found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
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

export default ActivityLogsTab;