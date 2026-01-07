import React, { useState } from "react";
import { HiX, HiRefresh } from "react-icons/hi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDonationManagement } from "../hooks/useDonationManagement";
import { getStatusColor, formatDate, formatCurrency } from "../utils/donationHelpers";
import SearchAndFilters from "./donation/staff-admin/SearchAndFilters";
import DonationStatistics from "./donation/staff-admin/DonationStatistics";
import DonationTable from "./donation/staff-admin/DonationTable";
import PaginationComponent from "./common/PaginationComponent";
import DonationDetailsModal from "./donation/staff-admin/DonationDetailsModal";
import StatusChangeModal from "./donation/staff-admin/StatusChangeModal";
import ReceiptGenerator from "./ReceiptGenerator";
import Modal from "./common/Modal";

function StaffDonationManagement({ onWalkInClick, userRole = 'staff' }) {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptDonation, setSelectedReceiptDonation] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  
  const {
    donations,
    loading,
    error,
    search,
    statusFilter,
    yearFilter,
    monthFilter,
    selectedDonation,
    showDetailsModal,
    showStatusModal,
    showSuccessModal,
    successMessage,
    processingId,
    isUpdating,
    pagination,
    filteredDonations,
    statistics,
    setSearch,
    setStatusFilter,
    setYearFilter,
    setMonthFilter,
    setError,
    loadDonations,
    handleViewDetails,
    handleStatusChange,
    confirmStatusChange,
    handlePageChange,
    closeDetailsModal,
    closeStatusModal,
    closeSuccessModal
  } = useDonationManagement();

  // Handle receipt generation
  const handleGenerateReceipt = (donation) => {
    setSelectedReceiptDonation(donation);
    setShowReceiptModal(true);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedReceiptDonation(null);
  };

  // Handle download report
  const handleDownloadReport = async () => {
    try {
      setReportLoading(true);
      
      // Fetch ALL donations without pagination for the report
      const params = {
        sortBy: 'appointment_date',
        sortOrder: 'DESC',
        limit: 10000 // Large limit to get all records
      };
      
      if (statusFilter) params.status = statusFilter;
      if (yearFilter) params.year = yearFilter;
      if (monthFilter) params.month = monthFilter;
      if (search) params.search = search;

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/donations/requests?${new URLSearchParams(params)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch donations for report');
      }

      const result = await response.json();
      const allDonations = result.data || [];
      
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Donation Requests Report', 14, 20);

      // Report metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${currentDate}`, 14, 28);
      
      // Filters applied
      let filterText = 'Filters: ';
      if (yearFilter) filterText += `Year: ${yearFilter} `;
      if (monthFilter) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        filterText += `Month: ${monthNames[parseInt(monthFilter) - 1]} `;
      }
      if (statusFilter) filterText += `Status: ${statusFilter} `;
      if (search) filterText += `Search: "${search}" `;
      if (filterText === 'Filters: ') filterText = 'Filters: None';
      
      doc.text(filterText, 14, 34);

      // Calculate statistics from all donations
      const reportStats = {
        totalCount: allDonations.length,
        pendingCount: allDonations.filter(d => d.status === 'Pending').length,
        approvedCount: allDonations.filter(d => d.status === 'Approved').length,
        completedCount: allDonations.filter(d => d.status === 'Completed').length,
        totalValue: allDonations.reduce((sum, d) => sum + parseFloat(d.total_value || 0), 0)
      };

      // Statistics Summary
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics:', 14, 44);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Total Requests: ${reportStats.totalCount}`, 14, 50);
      doc.text(`Pending: ${reportStats.pendingCount}`, 70, 50);
      doc.text(`Approved: ${reportStats.approvedCount}`, 120, 50);
      doc.text(`Completed: ${reportStats.completedCount}`, 170, 50);
      const totalValueFormatted = `P${parseFloat(reportStats.totalValue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(`Total Value: ${totalValueFormatted}`, 14, 56);

      // Table data - Format values as plain text strings
      const tableData = allDonations.map(donation => [
        String(donation.donation_id || ''),
        String(donation.donor_name || 'N/A'),
        donation.appointment_date ? formatDate(donation.appointment_date) : 'Walk-in',
        `${donation.total_quantity || 0} items (${donation.item_count || 0} types)`,
        'P' + parseFloat(donation.total_value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        String(donation.status || 'Unknown')
      ]);

      // Add table
      autoTable(doc, {
        startY: 62,
        head: [['ID', 'Donor', 'Date', 'Items', 'Value', 'Status']],
        body: tableData,
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [220, 38, 38],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25 }
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Generate filename
      let filename = 'donation-report';
      if (yearFilter && monthFilter) {
        filename = `donation-report-${yearFilter}-${monthFilter}`;
      } else if (yearFilter) {
        filename = `donation-report-${yearFilter}`;
      }
      filename += `.pdf`;

      // Save PDF
      doc.save(filename);
      
      setReportLoading(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report: ' + error.message);
      setReportLoading(false);
    }
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
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        onWalkInClick={onWalkInClick}
        userRole={userRole}
        onRefresh={loadDonations}
        loading={loading}
        onDownloadReport={handleDownloadReport}
      />

      {/* Statistics Cards */}
      <DonationStatistics 
        statistics={statistics}
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
          onGenerateReceipt={handleGenerateReceipt}
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
          isUpdating={isUpdating}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal isOpen={true} onClose={closeSuccessModal} maxWidth="max-w-md" showHeader={false}>
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
            <p className="text-sm text-gray-600">{successMessage}</p>
          </div>
        </Modal>
      )}

      {/* Receipt Generator Modal */}
      {showReceiptModal && selectedReceiptDonation && (
        <ReceiptGenerator
          donation={{
            donation_id: selectedReceiptDonation.donation_id,
            donor_name: selectedReceiptDonation.donor_name,
            status: selectedReceiptDonation.status,
            total_value: selectedReceiptDonation.total_value,
            item_count: selectedReceiptDonation.item_count
          }}
          onClose={closeReceiptModal}
        />
      )}
    </div>
  );
}

export default StaffDonationManagement;