import { useState, useEffect } from 'react';
import { getAllDonationRequests, updateDonationStatus, getDonationDetails } from '../services/staffDonationService';

export const useDonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
    currentPage: 1,
    pages: 0
  });

  // Statistics state (aggregated from all filtered data, not just current page)
  const [statistics, setStatistics] = useState({
    completed: 0,
    pending: 0,
    approved: 0,
    totalValue: 0
  });

  useEffect(() => {
    loadDonations();
  }, [pagination.offset, statusFilter, yearFilter, monthFilter]);

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

      if (yearFilter) {
        params.year = yearFilter;
      }

      if (monthFilter) {
        params.month = monthFilter;
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
        
        // Update statistics from API response (aggregated across all filtered data)
        if (response.statistics) {
          setStatistics({
            completed: response.statistics.completed || 0,
            pending: response.statistics.pending || 0,
            approved: response.statistics.approved || 0,
            totalValue: parseFloat(response.statistics.totalValue || 0)
          });
        }
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
      setIsUpdating(true);
      setProcessingId(selectedDonation.donation.donation_id);
      const response = await updateDonationStatus(
        selectedDonation.donation.donation_id,
        selectedDonation.newStatus,
        remarks
      );

      if (response.success) {
        // Close status modal immediately
        setShowStatusModal(false);
        
        // Show success message
        const statusText = selectedDonation.newStatus === 'Completed' ? 'marked as completed' : 
                          selectedDonation.newStatus === 'Approved' ? 'approved' : 
                          selectedDonation.newStatus === 'Rejected' ? 'rejected' : 'updated';
        setSuccessMessage(`Donation request has been successfully ${statusText}!`);
        setShowSuccessModal(true);
        
        // Refresh the list
        await loadDonations();
        
        // Auto-hide success modal after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          setSuccessMessage('');
        }, 3000);
        
        setSelectedDonation(null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update donation status');
    } finally {
      setProcessingId(null);
      setIsUpdating(false);
    }
  };

  const handlePageChange = (newPage) => {
    const newOffset = (newPage - 1) * pagination.limit;
    setPagination(prev => ({
      ...prev,
      offset: newOffset,
      currentPage: newPage
    }));
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDonation(null);
  };

  const closeStatusModal = () => {
    if (!isUpdating) {
      setShowStatusModal(false);
      setSelectedDonation(null);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
  };

  return {
    // State
    donations,
    loading,
    error,
    search,
    statusFilter,
    yearFilter,
    monthFilter,
    selectedItems,
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
    
    // Actions
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
  };
};