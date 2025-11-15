import React, { useState, useEffect } from 'react';
import { 
    HiCalendar, 
    HiClock, 
    HiLocationMarker,
    HiCheck,
    HiX,
    HiRefresh,
    HiEye,
    HiSearch,
    HiFilter,
    HiPencil,
    HiTrash,
    HiExclamation,
    HiTruck,
    HiHome
} from 'react-icons/hi';
import { getUserDonations, getDonationDetails, cancelDonationRequest } from '../services/donationService';
import PaginationComponent from './common/PaginationComponent';

export default function DonorDonationHistory() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pages: 1,
        total: 0,
        limit: 10
    });

    // Load donations
    const loadDonations = async (page = 1, status = 'all', search = '') => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page,
                limit: pagination.limit,
            };
            
            if (status !== 'all') params.status = status;
            if (search) params.search = search;
            
            const response = await getUserDonations(params);
            
            if (response.success) {
                const donations = response.data || [];
                
                setDonations(donations);
                setPagination(response.pagination || pagination);
            } else {
                setError(response.message || 'Failed to load donations');
            }
        } catch (err) {
            setError('Failed to load donation history');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadDonations();
    }, []);

    // Handle search and filter changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadDonations(1, statusFilter, searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    // Handle page change
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
        loadDonations(page, statusFilter, searchTerm);
    };

    // Handle refresh
    const handleRefresh = () => {
        loadDonations(pagination.currentPage, statusFilter, searchTerm);
    };

    // View donation details
    const handleViewDetails = async (donation) => {
        
        // Try different ID field names
        const donationId = donation?.id || donation?.request_id || donation?.donation_id || donation?.donation_request_id;
        
        if (!donation || !donationId) {
            return;
        }
        
        try {
            const response = await getDonationDetails(donationId);
            
            if (response.success) {
                
                // Merge the donation data with items and summary for easier access
                const completeData = {
                    ...response.data.donation,
                    items: response.data.items || [],
                    summary: response.data.summary || {},
                    item_count: response.data.items?.length || 0,
                    total_quantity: response.data.summary?.totalQuantity || 0,
                    total_value: response.data.summary?.totalValue || 0
                };
                
                setSelectedDonation(completeData);
                setShowDetailsModal(true);
            } else {
            }
        } catch (err) {
        }
    };

    // Handle edit donation request
    const handleEditRequest = (donation) => {
        const donationId = donation?.id || donation?.request_id || donation?.donation_id || donation?.donation_request_id;
        
        if (!donation || !donationId) {
            return;
        }
        setSelectedDonation(donation);
        setShowEditModal(true);
    };

    // Handle cancel donation request
    const handleCancelRequest = (donation) => {
        const donationId = donation?.id || donation?.request_id || donation?.donation_id || donation?.donation_request_id;
        
        if (!donation || !donationId) {
            return;
        }
        setSelectedDonation(donation);
        setShowCancelModal(true);
    };

    // Confirm cancellation
    const confirmCancellation = async () => {
        if (!selectedDonation) return;

        // Get the correct ID field
        const donationId = selectedDonation?.id || selectedDonation?.request_id || selectedDonation?.donation_id || selectedDonation?.donation_request_id;
        
        if (!donationId) {
            alert('Error: Unable to identify donation to cancel');
            return;
        }

        try {
            setActionLoading(true);
            const response = await cancelDonationRequest(donationId);
            if (response.success) {
                setShowCancelModal(false);
                setSelectedDonation(null);
                setCancelReason('');
                // Refresh the list
                loadDonations(pagination.currentPage, statusFilter, searchTerm);
            } else {
                alert(response.message || 'Failed to cancel donation request');
            }
        } catch (err) {
            alert('Failed to cancel donation request');
        } finally {
            setActionLoading(false);
        }
    };

    // Close modals
    const closeAllModals = () => {
        setShowDetailsModal(false);
        setShowEditModal(false);
        setShowCancelModal(false);
        setSelectedDonation(null);
        setCancelReason('');
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', icon: '⏳' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: '✅' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed', icon: '🎉' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled', icon: '❌' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: '❌' }
        };

        // Add null check for status
        if (!status) {
            return (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    <span className="mr-1">❓</span>
                    Unknown
                </span>
            );
        }

        const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                <span className="mr-1">{config.icon}</span>
                {config.label}
            </span>
        );
    };

    // Get status message
    const getStatusMessage = (donation) => {
        if (!donation || !donation.status) {
            return 'Status information unavailable.';
        }
        const status = donation.status.toLowerCase();
        switch (status) {
            case 'pending':
                return 'Your request is being reviewed by our team.';
            case 'approved':
                return donation.appointment_date 
                    ? `Pickup scheduled for ${formatDate(donation.appointment_date)}`
                    : 'Your donation has been approved! Waiting for pickup scheduling.';
            case 'completed':
                return 'Thank you! Your donation has been successfully received.';
            case 'cancelled':
                return 'This request was cancelled.';
            case 'rejected':
                return 'This request was not approved.';
            default:
                return '';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) {
            return 'N/A';
        }
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Render loading state within table area instead of separate container

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Donation History</h2>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    <HiRefresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search donations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-theme-primary focus:border-theme-primary"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-theme-primary focus:border-theme-primary"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {error && (
                <div className="mb-4 p-4 border border-red-200 rounded-md bg-red-50">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Donations Table */}
            {loading && donations.length === 0 ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading donation history...</p>
                </div>
            ) : donations.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                        <HiCalendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No donation requests found</h3>
                    <p className="text-sm text-gray-500">
                        {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria.' 
                            : "You haven't made any donation requests yet."
                        }
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Request ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {donations.map((donation) => {
                                    
                                    return (
                                        <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Request ID */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900">#{donation.id}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                {getStatusBadge(donation?.status)}
                                            </td>

                                            {/* Items */}
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900">
                                                    <div className="font-medium">{donation.item_count} type{donation.item_count !== 1 ? 's' : ''}</div>
                                                    {donation.total_quantity && (
                                                        <div className="text-xs text-gray-500">({donation.total_quantity} total)</div>
                                                    )}
                                                </div>
                                                {donation.items_summary && (
                                                    <div className="text-xs text-gray-600 truncate max-w-48" title={donation.items_summary}>
                                                        {donation.items_summary}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Delivery Method */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center text-sm">
                                                    {donation.delivery_method === 'pickup' ? (
                                                        <>
                                                            <HiTruck className="w-4 h-4 text-gray-400 mr-2" />
                                                            <span className="text-gray-900">Pickup</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiHome className="w-4 h-4 text-gray-400 mr-2" />
                                                            <span className="text-gray-900">Drop-off</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <HiCalendar className="w-4 h-4 text-gray-400 mr-1" />
                                                        {formatDate(donation.created_at)}
                                                    </div>
                                                    {donation.appointment_date && (
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                            <HiClock className="w-3 h-3 text-gray-400 mr-1" />
                                                            {formatDate(donation.appointment_date)}
                                                            {donation.appointment_time && ` ${donation.appointment_time}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Value */}
                                            <td className="px-4 py-3">
                                                {donation.total_value && (
                                                    <span className="text-sm font-medium text-green-600">
                                                        ₱{parseFloat(donation.total_value).toLocaleString()}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    {/* View Details Button */}
                                                    <button
                                                        onClick={() => handleViewDetails(donation)}
                                                        className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <HiEye className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {/* Edit Button - Only for pending donations */}
                                                    {donation.status && donation.status.toLowerCase() === 'pending' && (
                                                        <button
                                                            onClick={() => handleEditRequest(donation)}
                                                            className="p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                            title="Edit Request"
                                                        >
                                                            <HiPencil className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    {/* Cancel Button - Only for pending donations */}
                                                    {donation.status && donation.status.toLowerCase() === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancelRequest(donation)}
                                                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Cancel Request"
                                                        >
                                                            <HiX className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="mt-6">
                            <PaginationComponent 
                                pagination={pagination}
                                onPageChange={handlePageChange}
                                itemName="donations"
                            />
                        </div>
                    )}
                </>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedDonation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Donation Request Details</h3>
                                <p className="text-sm text-gray-500">Request #{selectedDonation.donation_id || selectedDonation.id}</p>
                            </div>
                            <button
                                onClick={closeAllModals}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Status and Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    {getStatusBadge(selectedDonation?.status)}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                                    <p className="text-sm text-gray-900 capitalize">{selectedDonation.delivery_method}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label>
                                    <p className="text-sm text-gray-900">{formatDate(selectedDonation.request_created_at || selectedDonation.created_at)}</p>
                                </div>
                                {selectedDonation.appointment_date && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                                        <p className="text-sm text-gray-900">{formatDate(selectedDonation.appointment_date)} at {selectedDonation.appointment_time}</p>
                                    </div>
                                )}
                            </div>

                            {/* Items Summary */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Items Summary</label>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                        <div>
                                            <span className="font-medium text-gray-700">Item Types:</span>
                                            <p className="text-gray-900">{selectedDonation.item_count || selectedDonation.items?.length || 0}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Total Quantity:</span>
                                            <p className="text-gray-900">{selectedDonation.total_quantity || selectedDonation.summary?.totalQuantity || 0}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Declared Value:</span>
                                            <p className="text-gray-900">₱{parseFloat(selectedDonation.total_value || selectedDonation.summary?.totalValue || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Individual Items List */}
                                    {selectedDonation.items && selectedDonation.items.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">Individual Items:</h4>
                                            <div className="space-y-2">
                                                {selectedDonation.items.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded border">
                                                        <div className="flex-1">
                                                            <span className="font-medium text-gray-800">{item.itemtype_name}</span>
                                                            {item.category_name && (
                                                                <span className="text-xs text-gray-500 ml-2">({item.category_name})</span>
                                                            )}
                                                            {item.description && (
                                                                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-medium text-gray-800">Qty: {item.quantity}</div>
                                                            <div className="text-xs text-gray-600">₱{parseFloat(item.declared_value).toLocaleString()} each</div>
                                                            <div className="text-sm font-medium text-green-600">₱{(parseFloat(item.declared_value) * parseInt(item.quantity)).toLocaleString()} total</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Fallback to items summary if no individual items */}
                                    {(!selectedDonation.items || selectedDonation.items.length === 0) && selectedDonation.items_summary && (
                                        <div>
                                            <span className="font-medium text-gray-700">Items:</span>
                                            <p className="text-gray-900">{selectedDonation.items_summary}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedDonation.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-sm text-gray-900">{selectedDonation.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Pickup Location */}
                            {selectedDonation.pickup_location && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                                    <div className="flex items-center text-sm text-gray-900">
                                        <HiLocationMarker className="w-4 h-4 mr-2 text-gray-400" />
                                        {selectedDonation.pickup_location}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Close
                            </button>
                            {selectedDonation?.status && selectedDonation.status.toLowerCase() === 'pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleEditRequest(selectedDonation);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                                    >
                                        Edit Request
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleCancelRequest(selectedDonation);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-dark rounded-md transition-colors"
                                    >
                                        Cancel Request
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Placeholder) */}
            {showEditModal && selectedDonation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Donation Request</h3>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start">
                                    <HiExclamation className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-800">Edit Feature Coming Soon</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            The edit functionality is currently being developed. For now, you can only view details or cancel pending requests.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p><strong>Request ID:</strong> #{selectedDonation.id}</p>
                                <p><strong>Current Status:</strong> {selectedDonation.status}</p>
                                <p><strong>Items:</strong> {selectedDonation.items_summary || 'Multiple items'}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && selectedDonation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Cancel Donation Request</h3>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start">
                                    <HiExclamation className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                                    <div>
                                        <h4 className="text-sm font-medium text-red-800">Confirm Cancellation</h4>
                                        <p className="text-sm text-red-700 mt-1">
                                            Are you sure you want to cancel this donation request? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-4">
                                <p><strong>Request ID:</strong> #{selectedDonation.id}</p>
                                <p><strong>Items:</strong> {selectedDonation.items_summary || 'Multiple items'}</p>
                                <p><strong>Submitted:</strong> {formatDate(selectedDonation.created_at)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for cancellation (optional)
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Please provide a reason for cancelling this request..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeAllModals}
                                disabled={actionLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
                            >
                                Keep Request
                            </button>
                            <button
                                onClick={confirmCancellation}
                                disabled={actionLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 flex items-center"
                            >
                                {actionLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                )}
                                Cancel Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}