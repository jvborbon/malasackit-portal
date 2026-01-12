import { useState, useEffect } from 'react';
import { 
    HiUsers,
    HiClipboardList,
    HiTrash
} from 'react-icons/hi';
import beneficiaryService from '../services/beneficiaryService';
import { BeneficiariesTab } from './BeneficiariesTab';
import { BeneficiaryRequestsTab } from './BeneficiaryRequestsTab';
import BeneficiaryModalForm from './BeneficiaryModalForm';
import BeneficiaryDetails from './BeneficiaryDetails';
import BeneficiaryRequestForm from './BeneficiaryRequestForm';

export default function BeneficiaryManagement() {
    const [activeTab, setActiveTab] = useState('beneficiaries');
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestsLoading, setRequestsLoading] = useState(false);
    
    // Search and filter states for beneficiaries
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    
    // Search and filter states for requests
    const [requestsSearchTerm, setRequestsSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterUrgency, setFilterUrgency] = useState('');
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    
    // Pagination
    const [beneficiariesPagination, setBeneficiariesPagination] = useState({
        currentPage: 1,
        pages: 1,
        total: 0,
        limit: 20
    });
    const [requestsPagination, setRequestsPagination] = useState({
        currentPage: 1,
        pages: 1,
        total: 0,
        limit: 20
    });

    // Fetch beneficiaries with pagination
    const fetchBeneficiaries = async (page = 1, search = '', type = '') => {
        try {
            setLoading(true);
            const params = {
                limit: beneficiariesPagination.limit,
                offset: (page - 1) * beneficiariesPagination.limit
            };
            
            if (search) params.search = search;
            if (type) params.type = type;
            
            const response = await beneficiaryService.getAllBeneficiaries(params);
            
            setBeneficiaries(response.data || []);
            setBeneficiariesPagination(response.pagination);
        } catch (error) {
            console.error('Error fetching beneficiaries:', error);
            setBeneficiaries([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch requests with pagination
    const fetchRequests = async (page = 1, search = '', status = '', urgency = '') => {
        try {
            setRequestsLoading(true);
            const params = {
                limit: requestsPagination.limit,
                offset: (page - 1) * requestsPagination.limit
            };
            
            if (search) params.search = search;
            if (status) params.status = status;
            if (urgency) params.urgency = urgency;
            
            const response = await beneficiaryService.getAllBeneficiaryRequests(params);
            
            setRequests(response.data || []);
            setRequestsPagination(response.pagination);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setRequests([]);
        } finally {
            setRequestsLoading(false);
        }
    };

    // Initial data loading
    useEffect(() => {
        fetchBeneficiaries(1, searchTerm, filterType);
    }, [searchTerm, filterType]);

    // Fetch requests when tab is switched
    useEffect(() => {
        if (activeTab === 'requests') {
            fetchRequests(1, requestsSearchTerm, filterStatus, filterUrgency);
        }
    }, [activeTab, requestsSearchTerm, filterStatus, filterUrgency]);

    // Refresh functions
    const refreshBeneficiaries = () => {
        fetchBeneficiaries(beneficiariesPagination.currentPage, searchTerm, filterType);
    };

    const refreshRequests = () => {
        fetchRequests(requestsPagination.currentPage, requestsSearchTerm, filterStatus, filterUrgency);
    };

    // Pagination handlers
    const handleBeneficiariesPageChange = (page) => {
        setBeneficiariesPagination(prev => ({ ...prev, currentPage: page }));
        fetchBeneficiaries(page, searchTerm, filterType);
    };

    const handleRequestsPageChange = (page) => {
        setRequestsPagination(prev => ({ ...prev, currentPage: page }));
        fetchRequests(page, requestsSearchTerm, filterStatus, filterUrgency);
    };

    if (loading && beneficiaries.length === 0) {
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
                <p className="text-sm text-gray-600 mt-1">Manage beneficiaries and their requests</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('beneficiaries')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                activeTab === 'beneficiaries'
                                    ? 'border-red-900 text-red-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <HiUsers className="w-5 h-5" />
                            <span>Beneficiaries ({beneficiariesPagination.total || 0})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                activeTab === 'requests'
                                    ? 'border-red-900 text-red-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <HiClipboardList className="w-5 h-5" />
                            <span>Requests ({requestsPagination.total || 0})</span>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'beneficiaries' && (
                        <BeneficiariesTab 
                            beneficiaries={beneficiaries}
                            loading={loading}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterType={filterType}
                            setFilterType={setFilterType}
                            setShowAddModal={setShowAddModal}
                            setShowEditModal={setShowEditModal}
                            setShowDeleteModal={setShowDeleteModal}
                            setShowViewModal={setShowViewModal}
                            setSelectedBeneficiary={setSelectedBeneficiary}
                            pagination={beneficiariesPagination}
                            onPageChange={handleBeneficiariesPageChange}
                            onRefresh={refreshBeneficiaries}
                        />
                    )}

                    {activeTab === 'requests' && (
                        <BeneficiaryRequestsTab 
                            requests={requests}
                            loading={requestsLoading}
                            searchTerm={requestsSearchTerm}
                            setSearchTerm={setRequestsSearchTerm}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            filterUrgency={filterUrgency}
                            setFilterUrgency={setFilterUrgency}
                            setShowRequestModal={setShowRequestModal}
                            setShowViewModal={setShowRequestDetailsModal}
                            setSelectedRequest={setSelectedRequest}
                            pagination={requestsPagination}
                            onPageChange={handleRequestsPageChange}
                            onRefresh={refreshRequests}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <BeneficiaryModalForm
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    mode="create"
                    onSubmit={async (data) => {
                        await beneficiaryService.createBeneficiary(data);
                        setShowAddModal(false);
                        refreshBeneficiaries();
                    }}
                />
            )}

            {showEditModal && selectedBeneficiary && (
                <BeneficiaryModalForm
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    mode="edit"
                    beneficiary={selectedBeneficiary}
                    onSubmit={async (data) => {
                        await beneficiaryService.updateBeneficiary(selectedBeneficiary.beneficiary_id, data);
                        setShowEditModal(false);
                        refreshBeneficiaries();
                    }}
                />
            )}

            {showViewModal && selectedBeneficiary && (
                <BeneficiaryDetails
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    beneficiary={selectedBeneficiary}
                    onEdit={(beneficiary) => {
                        setShowViewModal(false);
                        setSelectedBeneficiary(beneficiary);
                        setShowEditModal(true);
                    }}
                    onDelete={(beneficiary) => {
                        setShowViewModal(false);
                        setSelectedBeneficiary(beneficiary);
                        setShowDeleteModal(true);
                    }}
                />
            )}

            {showDeleteModal && selectedBeneficiary && (
                <DeleteConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    beneficiary={selectedBeneficiary}
                    onConfirm={async () => {
                        await beneficiaryService.deleteBeneficiary(selectedBeneficiary.beneficiary_id);
                        setShowDeleteModal(false);
                        refreshBeneficiaries();
                    }}
                />
            )}

            {showRequestModal && (
                <BeneficiaryRequestForm
                    isOpen={showRequestModal}
                    onClose={() => setShowRequestModal(false)}
                    onSubmit={async (data) => {
                        // Handle request submission
                        setShowRequestModal(false);
                        refreshRequests();
                    }}
                />
            )}

            {showRequestDetailsModal && selectedRequest && (
                <RequestDetailsModal
                    isOpen={showRequestDetailsModal}
                    onClose={() => setShowRequestDetailsModal(false)}
                    request={selectedRequest}
                />
            )}
        </div>
    );
}

// Request Details Modal Component
function RequestDetailsModal({ isOpen, onClose, request }) {
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            'Approved': { bg: 'bg-green-100', text: 'text-green-800' },
            'Fulfilled': { bg: 'bg-blue-100', text: 'text-blue-800' },
            'Rejected': { bg: 'bg-red-100', text: 'text-red-800' }
        };
        
        const config = statusConfig[status] || statusConfig['Pending'];
        
        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <HiClipboardList className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary</label>
                                    <p className="text-gray-900 font-medium">{request.beneficiary_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <p className="text-gray-900">{request.beneficiary_type || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    {getStatusBadge(request.status)}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                                    {getUrgencyBadge(request.urgency)}
                                </div>
                                {request.individuals_served && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Individuals Served</label>
                                        <p className="text-gray-900">{request.individuals_served}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Request Date</label>
                                    <p className="text-gray-900">
                                        {request.request_date ? new Date(request.request_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                                    <p className="text-gray-900">{request.purpose || 'No purpose specified'}</p>
                                </div>
                                {request.notes && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <p className="text-gray-900">{request.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Request Items Section - Always show */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Requested Items</label>
                                {request.items && request.items.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="space-y-2">
                                            {request.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{item.itemtype_name}</p>
                                                        {item.category_name && (
                                                            <p className="text-xs text-gray-500">{item.category_name}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-semibold text-red-900 ml-4">
                                                        Qty: {item.quantity_requested}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                                        <p className="text-sm text-gray-500">No specific items requested</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, onClose, beneficiary, onConfirm }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error('Error deleting beneficiary:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            {/* Icon */}
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                <HiTrash className="h-8 w-8 text-red-900" />
                            </div>
                            
                            {/* Content */}
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Beneficiary</h3>
                                <p className="text-gray-600 mb-2">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-gray-900">{beneficiary?.name}</span>?
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    This action cannot be undone. All data associated with this beneficiary will be permanently removed.
                                </p>
                            </div>
                            
                            {/* Beneficiary Info Card */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            {beneficiary?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{beneficiary?.name}</p>
                                        <p className="text-sm text-gray-500">{beneficiary?.type}</p>
                                        <p className="text-xs text-gray-400">{beneficiary?.phone || 'No phone'}</p>
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
                                    className="flex-1 px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Beneficiary'
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
