import React from "react";
import { HiX, HiRefresh } from "react-icons/hi";
import { useDonationManagement } from "../hooks/useDonationManagement";
import { getStatusColor, formatDate, formatCurrency } from "./utilities/donationHelpers";
import SearchAndFilters from "./staff/SearchAndFilters";
import DonationStatistics from "./staff/DonationStatistics";
import DonationTable from "./staff/DonationTable";
import PaginationComponent from "./staff/PaginationComponent";
import DonationDetailsModal from "./staff/DonationDetailsModal";
import StatusChangeModal from "./staff/StatusChangeModal";

function StaffDonationManagement() {
  const {
    donations,
    loading,
    error,
    search,
    statusFilter,
    selectedDonation,
    showDetailsModal,
    showStatusModal,
    processingId,
    pagination,
    filteredDonations,
    setSearch,
    setStatusFilter,
    setError,
    loadDonations,
    handleViewDetails,
    handleStatusChange,
    confirmStatusChange,
    handlePageChange,
    closeDetailsModal,
    closeStatusModal
  } = useDonationManagement();

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
      <SearchAndFilters 
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Statistics Cards */}
      <DonationStatistics 
        donations={donations}
        pagination={pagination}
        formatCurrency={formatCurrency}
      />

      {/* Table */}
      <DonationTable 
        donations={filteredDonations}
        loading={loading}
        processingId={processingId}
        onViewDetails={handleViewDetails}
        onStatusChange={handleStatusChange}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />

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
          onClose={closeDetailsModal}
        />
      )}

      {showStatusModal && selectedDonation && (
        <StatusChangeModal
          donation={selectedDonation.donation}
          newStatus={selectedDonation.newStatus}
          onConfirm={confirmStatusChange}
          onClose={closeStatusModal}
        />
      )}
    </div>
  );
}

export default StaffDonationManagement;