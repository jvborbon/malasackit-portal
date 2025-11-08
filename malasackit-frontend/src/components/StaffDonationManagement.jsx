import React, { useState, useEffect } from "react";
import { HiEye, HiCheck, HiX, HiRefresh, HiFilter, HiSearch, HiClock, HiUser, HiCalendar } from "react-icons/hi";
import { getAllDonationRequests, updateDonationStatus, getDonationDetails } from "../services/staffDonationService";

function StaffDonationManagement() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
    currentPage: 1,
    pages: 0
  });

  useEffect(() => {
    loadDonations();
  }, [pagination.offset, statusFilter]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: pagination.limit,
        offset: pagination.offset,
        sortBy: 'appointment_date',
        sortOrder: 'DESC'
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await getAllDonationRequests(params);
      
      if (response.success) {
        setDonations(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          pages: response.pagination.pages,
          currentPage: response.pagination.currentPage
        }));
      }
    } catch (err) {
      console.error('Error loading donations:', err);
      setError('Failed to load donation requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation =>
    donation.donor_name?.toLowerCase().includes(search.toLowerCase()) ||
    donation.donation_id.toString().includes(search) ||
    donation.donor_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = async (donationId) => {
    try {
      setLoading(true);
      const response = await getDonationDetails(donationId);
      if (response.success) {
        setSelectedDonation(response.data);
        setShowDetailsModal(true);
      }
    } catch (err) {
      console.error('Error loading donation details:', err);
      setError('Failed to load donation details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (donation, newStatus) => {
    setSelectedDonation({ donation, newStatus });
    setShowStatusModal(true);
  };

  const confirmStatusChange = async (remarks = '') => {
    if (!selectedDonation || !selectedDonation.newStatus) return;

    try {
      setProcessingId(selectedDonation.donation.donation_id);
      const response = await updateDonationStatus(
        selectedDonation.donation.donation_id,
        selectedDonation.newStatus,
        remarks
      );

      if (response.success) {
        await loadDonations(); // Refresh the list
        setShowStatusModal(false);
        setSelectedDonation(null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update donation status');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return `₱${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handlePageChange = (newPage) => {
    const newOffset = (newPage - 1) * pagination.limit;
    setPagination(prev => ({
      ...prev,
      offset: newOffset,
      currentPage: newPage
    }));
  };

  if (loading && donations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donation requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donation Management</h1>
          <p className="text-gray-600">Review and manage donation requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={loadDonations}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 rounded-lg"
            title="Refresh"
          >
            <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <HiX className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by donor name, email, or donation ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Requests" 
          value={pagination.total} 
          icon={HiUser} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pending" 
          value={donations.filter(d => d.status === 'Pending').length} 
          icon={HiClock} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="Approved" 
          value={donations.filter(d => d.status === 'Approved').length} 
          icon={HiCheck} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Total Value" 
          value={formatCurrency(donations.reduce((sum, d) => sum + parseFloat(d.total_value || 0), 0))} 
          icon={HiCalendar} 
          color="bg-purple-500" 
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-red-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                  Donor Information
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                  Donation Details
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <tr key={donation.donation_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.donor_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {donation.donor_email}
                      </div>
                      {donation.donor_phone && (
                        <div className="text-sm text-gray-500">
                          {donation.donor_phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ID: {donation.donation_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {donation.item_count} items • {formatCurrency(donation.total_value)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {donation.delivery_method === 'pickup' ? '📦 Pickup' : '🚚 Drop-off'}
                      </div>
                      {donation.categories && (
                        <div className="text-xs text-gray-400 mt-1">
                          {donation.categories}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {donation.appointment_date ? (
                        <>
                          <div>{formatDate(donation.appointment_date)}</div>
                          {donation.appointment_time && (
                            <div className="text-xs text-gray-500">
                              {donation.appointment_time.slice(0, 5)}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">Not scheduled</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                      {donation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(donation.donation_id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      
                      {donation.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(donation, 'Approved')}
                            disabled={processingId === donation.donation_id}
                            className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                            title="Approve"
                          >
                            <HiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(donation, 'Rejected')}
                            disabled={processingId === donation.donation_id}
                            className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                            title="Reject"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {donation.status === 'Approved' && (
                        <button
                          onClick={() => handleStatusChange(donation, 'Completed')}
                          disabled={processingId === donation.donation_id}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded disabled:opacity-50"
                          title="Mark Complete"
                        >
                          <HiCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDonations.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No donation requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <PaginationComponent 
          pagination={pagination} 
          onPageChange={handlePageChange} 
        />
      )}

      {/* Modals */}
      {showDetailsModal && selectedDonation && (
        <DonationDetailsModal 
          donation={selectedDonation}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDonation(null);
          }}
        />
      )}

      {showStatusModal && selectedDonation && (
        <StatusChangeModal
          donation={selectedDonation.donation}
          newStatus={selectedDonation.newStatus}
          onConfirm={confirmStatusChange}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedDonation(null);
          }}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`${color} rounded-lg p-3 mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Pagination Component
function PaginationComponent({ pagination, onPageChange }) {
  const { currentPage, pages, total, limit } = pagination;
  
  const startItem = ((currentPage - 1) * limit) + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {total} requests
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-700">
          Page {currentPage} of {pages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pages}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Donation Details Modal Component
function DonationDetailsModal({ donation, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-red-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Donation Details</h2>
          <button onClick={onClose} className="text-white hover:text-red-200">
            <HiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Donor Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Name:</span> {donation.donation.donor_name}</p>
                <p><span className="font-medium">Email:</span> {donation.donation.donor_email}</p>
                <p><span className="font-medium">Delivery:</span> {donation.donation.delivery_method}</p>
                {donation.donation.appointment_date && (
                  <p><span className="font-medium">Scheduled:</span> {new Date(donation.donation.appointment_date).toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Donation Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Total Items:</span> {donation.summary.totalItems}</p>
                <p><span className="font-medium">Total Quantity:</span> {donation.summary.totalQuantity}</p>
                <p><span className="font-medium">Total Value:</span> ₱{donation.summary.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Items</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {donation.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.category_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.itemtype_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">₱{(item.declared_value * item.quantity).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Status Change Modal Component
function StatusChangeModal({ donation, newStatus, onConfirm, onClose }) {
  const [remarks, setRemarks] = useState('');

  const getStatusMessage = () => {
    switch (newStatus) {
      case 'Approved':
        return 'Are you sure you want to approve this donation request?';
      case 'Rejected':
        return 'Are you sure you want to reject this donation request?';
      case 'Completed':
        return 'Are you sure you want to mark this donation as completed?';
      default:
        return `Are you sure you want to change the status to ${newStatus}?`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Confirm Status Change
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {getStatusMessage()}
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks or notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(remarks)}
              className={`px-4 py-2 rounded-md text-white ${
                newStatus === 'Rejected' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDonationManagement;