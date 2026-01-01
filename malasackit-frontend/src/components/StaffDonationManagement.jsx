import React from "react";
import { HiX, HiRefresh } from "react-icons/hi";
import { useDonationManagement } from "../hooks/useDonationManagement";
import { getStatusColor, formatDate, formatCurrency } from "../utils/donationHelpers";
import SearchAndFilters from "./donation/staff-admin/SearchAndFilters";
import DonationStatistics from "./donation/staff-admin/DonationStatistics";
import DonationTable from "./donation/staff-admin/DonationTable";
import PaginationComponent from "./common/PaginationComponent";
import DonationDetailsModal from "./donation/staff-admin/DonationDetailsModal";
import StatusChangeModal from "./donation/staff-admin/StatusChangeModal";

function StaffDonationManagement({ onWalkInClick, userRole = 'staff' }) {
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
    <div className="h-full flex flex-col space-y-4">
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
        onWalkInClick={onWalkInClick}
        userRole={userRole}
        onRefresh={loadDonations}
        loading={loading}
      />

      {/* Statistics Cards */}
      <DonationStatistics 
        donations={donations}
        pagination={pagination}
        formatCurrency={formatCurrency}
      />

      {/* Table - Takes remaining space */}
      <div className="flex-1 min-h-0">
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
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <PaginationComponent 
          pagination={pagination} 
          onPageChange={handlePageChange} 
          itemName="requests"
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