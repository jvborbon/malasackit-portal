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
    setShowStatusModal(false);
    setSelectedDonation(null);
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
    processingId,
    pagination,
    filteredDonations,
    
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
    closeStatusModal
  };
};