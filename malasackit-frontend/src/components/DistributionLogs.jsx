import React, { useState, useEffect } from "react";
import { HiSearch, HiFilter, HiDownload, HiEye, HiCalendar } from "react-icons/hi";
import distributionService from "../services/distributionService";
import SuccessModal from "./common/SuccessModal";
import { useSuccessModal } from "../hooks/useSuccessModal";

function DistributionLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    beneficiaryId: "",
    itemTypeId: "",
    sortBy: "distribution_date",
    sortOrder: "DESC"
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Use the common success modal hook
  const { isOpen: isSuccessOpen, modalData: successData, showSuccess, hideSuccess } = useSuccessModal();

  // Load distribution plans (not just executed logs)
  const loadDistributionLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      };

      // Add search filter if provided
      if (search.trim()) {
        params.search = search.trim();
      }

      // Get distribution plans instead of just executed logs
      const response = await distributionService.getAllDistributionPlans(params);
      
      if (response.success) {
        setLogs(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.pages || 0
        }));
      } else {
        setError(response.message || "Failed to load distribution plans");
      }
    } catch (err) {
      console.error("Error loading distribution logs:", err);
      setError("Failed to load distribution logs");
    } finally {
      setLoading(false);
    }
  };

  // Load logs on component mount and when filters change
  useEffect(() => {
    loadDistributionLogs();
  }, [filters, pagination.page, search]);

  // Filter plans based on search
  const filteredLogs = logs.filter(plan =>
    plan.beneficiary_name?.toLowerCase().includes(search.toLowerCase()) ||
    plan.purpose?.toLowerCase().includes(search.toLowerCase()) ||
    plan.remarks?.toLowerCase().includes(search.toLowerCase()) ||
    plan.plan_id?.toString().includes(search) ||
    plan.status?.toLowerCase().includes(search.toLowerCase())
  );



  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportLogs = () => {
    // Implementation for exporting logs to CSV
    console.log("Export functionality to be implemented");
  };

  const approvePlan = async (planId) => {
    try {
      console.log('Attempting to approve plan:', planId);
      const response = await distributionService.approveDistributionPlan(planId, 'Approved by admin');
      console.log('Approval response:', response);
      if (response.success) {
        // Show success modal using the common component
        showSuccess({
          title: '✅ Plan Approved Successfully!',
          message: `Distribution Plan #${planId} has been approved and is now ready for execution.`,
          details: response.data ? {
            beneficiary: response.data.beneficiary_name,
            status: response.data.status,
            total_items: response.data.total_items,
            total_value: response.data.total_allocated_value
          } : null,
          icon: 'checkCircle'
        });
        loadDistributionLogs(); // Refresh the list
      } else {
        console.error('Approval failed with response:', response);
        alert('Failed to approve plan: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving plan:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to approve plan: ' + (error.response?.data?.message || error.message || 'Network error'));
    }
  };

  const executePlan = async (planId) => {
    try {
      const response = await distributionService.executeDistributionPlan(planId, {
        distribution_date: new Date().toISOString(),
        execution_notes: 'Executed by admin from Distribution Logs'
      });
      if (response.success) {
        // Show success modal using the common component
        showSuccess({
          title: '🎉 Distribution Completed Successfully!',
          message: `Distribution Plan #${planId} has been executed and completed. Items have been distributed to the beneficiary and inventory has been updated.`,
          details: response.data ? {
            beneficiary: response.data.beneficiary_name,
            status: response.data.status,
            total_items: response.data.total_items,
            total_value: response.data.total_allocated_value
          } : null,
          icon: 'trophy',
          buttonText: 'Great!'
        });
        loadDistributionLogs(); // Refresh the list
      } else {
        alert('Failed to execute plan: ' + response.message);
      }
    } catch (error) {
      console.error('Error executing plan:', error);
      alert('Failed to execute plan');
    }
  };

  const viewPlanDetails = async (planId) => {
    try {
      const response = await distributionService.getDistributionPlanById(planId);
      if (response.success) {
        setSelectedPlan(response.data);
        setShowDetailsModal(true);
      } else {
        alert('Failed to load plan details: ' + response.message);
      }
    } catch (error) {
      console.error('Error loading plan details:', error);
      alert('Failed to load plan details');
    }
  };



  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Distribution Logs</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportLogs}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <HiDownload className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={loadDistributionLogs}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiEye className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>

          {/* Date From */}
          <div className="relative">
            <HiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <HiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>

          {/* Sort Options */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange("sortBy", sortBy);
              handleFilterChange("sortOrder", sortOrder);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="distribution_date-DESC">Latest First</option>
            <option value="distribution_date-ASC">Oldest First</option>
            <option value="beneficiary_name-ASC">Beneficiary A-Z</option>
            <option value="itemtype_name-ASC">Item Type A-Z</option>
            <option value="quantity_distributed-DESC">Quantity High-Low</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Total: {pagination.total} logs
          </span>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <HiSearch className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by beneficiary, item type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading distribution logs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={loadDistributionLogs}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Logs Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No distribution plans found</h3>
                        <p className="text-gray-500">
                          {search ? "No plans match your search criteria." : "There are currently no distribution plans to display."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((plan) => (
                    <tr key={plan.plan_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900">#{plan.plan_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-800">
                                {plan.beneficiary_name?.charAt(0) || 'B'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{plan.beneficiary_name}</div>
                            <div className="text-sm text-gray-500">
                              {plan.beneficiary_type && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  {plan.beneficiary_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{plan.purpose}</div>
                        <div className="text-sm text-gray-500">{plan.urgency} urgency</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                          plan.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          plan.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                          plan.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {plan.planned_date ? formatDate(plan.planned_date) : 'Not set'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{plan.created_by_name || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View Details"
                            onClick={() => viewPlanDetails(plan.plan_id)}
                          >
                            <HiEye className="w-4 h-4" />
                          </button>
                          {plan.status === 'Draft' && (
                            <button 
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Approve Plan"
                              onClick={() => approvePlan(plan.plan_id)}
                            >
                              ✓
                            </button>
                          )}
                          {plan.status === 'Approved' && (
                            <button 
                              className="text-purple-600 hover:text-purple-900 p-1 rounded"
                              title="Execute Plan"
                              onClick={() => executePlan(plan.plan_id)}
                            >
                              ▶
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan Details Modal */}
      {showDetailsModal && selectedPlan && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Distribution Plan Details - #{selectedPlan.plan_id}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
              {/* Modal Header */}
              {/* Plan Info */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Beneficiary Information</h4>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm"><strong>Name:</strong> {selectedPlan.beneficiary_name}</p>
                    <p className="text-sm"><strong>Type:</strong> {selectedPlan.beneficiary_type}</p>
                    <p className="text-sm"><strong>Address:</strong> {selectedPlan.beneficiary_address}</p>
                    <p className="text-sm"><strong>Contact:</strong> {selectedPlan.contact_person}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Plan Information</h4>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm"><strong>Status:</strong> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedPlan.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                        selectedPlan.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        selectedPlan.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                        selectedPlan.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedPlan.status}
                      </span>
                    </p>
                    <p className="text-sm"><strong>Purpose:</strong> {selectedPlan.purpose}</p>
                    <p className="text-sm"><strong>Urgency:</strong> {selectedPlan.urgency}</p>
                    <p className="text-sm"><strong>Planned Date:</strong> {selectedPlan.planned_date ? formatDate(selectedPlan.planned_date) : 'Not set'}</p>
                    <p className="text-sm"><strong>Created By:</strong> {selectedPlan.created_by_name}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Items to Distribute</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedPlan.items && selectedPlan.items.length > 0 ? (
                        selectedPlan.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.itemtype_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.category_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₱{parseFloat(item.allocated_value || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.location}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {item.notes || '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            No items found for this plan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              {selectedPlan.items && selectedPlan.items.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Total Items:</span>
                      <span className="ml-2 text-blue-800">{selectedPlan.total_items || selectedPlan.items.length}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Value:</span>
                      <span className="ml-2 text-blue-800">₱{parseFloat(selectedPlan.total_allocated_value || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Request Notes:</span>
                      <span className="ml-2 text-blue-800">{selectedPlan.request_notes || selectedPlan.remarks || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                {selectedPlan.status === 'Draft' && (
                  <button
                    onClick={() => {
                      approvePlan(selectedPlan.plan_id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Plan
                  </button>
                )}
                {selectedPlan.status === 'Approved' && (
                  <button
                    onClick={() => {
                      executePlan(selectedPlan.plan_id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Execute Plan
                  </button>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Common Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={hideSuccess}
        title={successData.title}
        message={successData.message}
        details={successData.details}
        buttonText={successData.buttonText}
        icon={successData.icon}
      />

    </div>
  );
}

export default DistributionLogs;
