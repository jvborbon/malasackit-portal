import React, { useState, useEffect } from "react";
import { 
  HiPlus, 
  HiSearch, 
  HiFilter, 
  HiEye, 
  HiCheck, 
  HiX,
  HiClock,
  HiExclamationCircle,
  HiClipboardList,
  HiUsers
} from "react-icons/hi";
import beneficiaryService from "../services/beneficiaryService";

function BeneficiaryRequestsManagement({ onNewRequest }) {
  const [beneficiaryRequests, setBeneficiaryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // Search and filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });

  useEffect(() => {
    loadBeneficiaryRequests();
  }, [search, statusFilter, urgencyFilter]);

  const loadBeneficiaryRequests = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit
      };
      
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;
      
      const response = await beneficiaryService.getAllBeneficiaryRequests(params);
      
      setBeneficiaryRequests(response.data);
      setPagination(prev => ({
        ...prev,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.pages,
        total: response.pagination.total
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleApproveRequest = async (requestId) => {
    try {
      await beneficiaryService.approveBeneficiaryRequest(requestId, 'Approved by staff');
      loadBeneficiaryRequests(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      await beneficiaryService.rejectBeneficiaryRequest(requestId, reason);
      loadBeneficiaryRequests(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    }
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
      'High': { bg: 'bg-red-100', text: 'text-red-800' }
    };
    
    const config = urgencyConfig[urgency] || urgencyConfig['Medium'];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        <HiExclamationCircle className="w-3 h-3 mr-1" />
        {urgency}
      </span>
    );
  };

  if (loading && beneficiaryRequests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <HiClipboardList className="w-8 h-8 text-red-600 mr-3" />
            Beneficiary Requests
          </h1>
          <p className="text-gray-600 mt-1">Manage requests from beneficiaries</p>
        </div>
        <button
          onClick={onNewRequest}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <HiPlus className="w-5 h-5 mr-2" />
          Add Request
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 mt-2 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}



      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="relative">
            <HiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div className="relative">
            <HiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
            >
              <option value="">All Urgency</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span>Total: {pagination.total} items</span>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {beneficiaryRequests.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <HiUsers className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.beneficiary_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.beneficiary_type} - {request.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.purpose}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUrgencyBadge(request.urgency)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.request_date).toLocaleDateString()}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <HiEye className="w-5 h-5" />
                        </button>
                        
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(request.request_id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <HiCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for rejection:');
                                if (reason) {
                                  handleRejectRequest(request.request_id, reason);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <HiX className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => loadBeneficiaryRequests(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => loadBeneficiaryRequests(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Beneficiary</label>
                      <p className="text-gray-900">{selectedRequest.beneficiary_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="text-gray-900">{selectedRequest.beneficiary_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Urgency</label>
                      {getUrgencyBadge(selectedRequest.urgency)}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Purpose</label>
                      <p className="text-gray-900">{selectedRequest.purpose}</p>
                    </div>
                    {selectedRequest.notes && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <p className="text-gray-900">{selectedRequest.notes}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Request Date</label>
                      <p className="text-gray-900">{new Date(selectedRequest.request_date).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BeneficiaryRequestsManagement;