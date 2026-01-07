import { useState } from 'react';
import { 
    HiSearch, 
    HiEye,
    HiPlus,
    HiRefresh,
    HiCheck,
    HiX,
    HiClock,
    HiExclamationCircle
} from 'react-icons/hi';
import PaginationComponent from './common/PaginationComponent';

// Beneficiary Requests Tab Component
export function BeneficiaryRequestsTab({ 
    requests, 
    loading = false,
    searchTerm, 
    setSearchTerm, 
    filterStatus, 
    setFilterStatus, 
    filterUrgency,
    setFilterUrgency,
    setShowRequestModal,
    setShowViewModal, 
    setSelectedRequest, 
    pagination,
    onPageChange,
    onRefresh
}) {
    const handleAddRequest = () => {
        setSelectedRequest(null);
        setShowRequestModal(true);
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setShowViewModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: HiClock },
            'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: HiCheck },
            'Fulfilled': { bg: 'bg-blue-100', text: 'text-blue-800', icon: HiCheck },
            'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: HiX }
        };
        
        const config = statusConfig[status] || statusConfig['Pending'];
        const IconComponent = config.icon;
        
        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {status}
            </span>
        );
    };

    const getUrgencyBadge = (urgency) => {
        const urgencyConfig = {
            'Low': { bg: 'bg-gray-100', text: 'text-gray-800' },
            'Medium': { bg: 'bg-blue-100', text: 'text-blue-800' },
            'High': { bg: 'bg-orange-100', text: 'text-orange-800' }
        };
        
        const config = urgencyConfig[urgency] || urgencyConfig['Medium'];
        
        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                {urgency}
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
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Fulfilled">Fulfilled</option>
                    <option value="Rejected">Rejected</option>
                </select>
                <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">All Urgency</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
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
                    onClick={handleAddRequest}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                    <HiPlus className="w-4 h-4 mr-2" />
                    New Request
                </button>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full">
                        <thead className="bg-red-600 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Beneficiary
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Purpose
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Urgency
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((request) => (
                                <tr key={request.request_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {request.beneficiary_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {request.beneficiary_name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {request.beneficiary_type || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                                            {request.purpose || 'No purpose specified'}
                                        </div>
                                        {request.individuals_served && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                For {request.individuals_served} individual{request.individuals_served !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(request.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getUrgencyBadge(request.urgency)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {request.request_date ? new Date(request.request_date).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {request.request_date ? new Date(request.request_date).toLocaleTimeString() : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleViewRequest(request)}
                                            className="text-gray-600 hover:text-gray-900"
                                            title="View Details"
                                        >
                                            <HiEye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No requests found.
                                    </td>
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
                    itemName="requests"
                />
            )}
        </div>
    );
}

export default BeneficiaryRequestsTab;
