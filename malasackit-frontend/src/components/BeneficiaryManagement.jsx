import React, { useState, useEffect } from 'react';
import { 
  HiUser, 
  HiLocationMarker, 
  HiPhone, 
  HiMail, 
  HiPlus, 
  HiPencil, 
  HiTrash,
  HiEye,
  HiSearch,
  HiFilter,
  HiUsers,
  HiClipboardList
} from 'react-icons/hi';
import beneficiaryService from '../services/beneficiaryService';
import BeneficiaryRequestForm from './BeneficiaryRequestForm';
import BeneficiaryRequestsManagement from './BeneficiaryRequestsManagement';
import SuccessModal from './common/SuccessModal';
import { useSuccessModal } from '../hooks/useSuccessModal';
import PaginationComponent from './common/PaginationComponent';

const BeneficiaryManagement = () => {
  const [activeTab, setActiveTab] = useState('beneficiaries'); // beneficiaries, requests
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pages: 1,
    total: 0,
    limit: 20
  });
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [beneficiaryRequests, setBeneficiaryRequests] = useState([]);
  
  // Success modal hook
  const { isOpen: isSuccessOpen, modalData: successData, showSuccess, hideSuccess } = useSuccessModal();
  
  // Requests tab state
  const [allRequests, setAllRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsFilter, setRequestsFilter] = useState(''); // '', 'Pending', 'Approved', etc.
  const [requestsSearch, setRequestsSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Load all requests for requests tab
  const loadAllRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await beneficiaryService.getAllBeneficiaryRequests();
      if (response.success) {
        setAllRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  // Load beneficiaries
  const loadBeneficiaries = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit
      };
      
      if (searchTerm) params.search = searchTerm;
      if (filterType) params.type = filterType;
      
      const response = await beneficiaryService.getAllBeneficiaries(params);
      
      setBeneficiaries(response.data);
      setPagination(prev => ({
        ...prev,
        currentPage: response.pagination.currentPage,
        pages: response.pagination.pages,
        total: response.pagination.total
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, [searchTerm, filterType]);

  useEffect(() => {
    if (activeTab === 'requests') {
      loadAllRequests();
    }
  }, [activeTab]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  // Modal handlers
  const openCreateModal = () => {
    setFormData({
      name: '',
      type: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (beneficiary) => {
    setFormData({
      name: beneficiary.name || '',
      type: beneficiary.type || '',
      contact_person: beneficiary.contact_person || '',
      email: beneficiary.email || '',
      phone: beneficiary.phone || '',
      address: beneficiary.address || '',
      notes: beneficiary.notes || ''
    });
    setSelectedBeneficiary(beneficiary);
    setModalMode('edit');
    setShowModal(true);
  };

  const openViewModal = async (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setModalMode('view');
    setShowModal(true);
    
    // Fetch beneficiary requests with items
    try {
      const response = await beneficiaryService.getBeneficiaryRequests(beneficiary.beneficiary_id);
      setBeneficiaryRequests(response.data || []);
    } catch (err) {
      console.error('Error fetching beneficiary requests:', err);
      setBeneficiaryRequests([]);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBeneficiary(null);
    setBeneficiaryRequests([]);
    setFormData({
      name: '',
      type: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (modalMode === 'create') {
        response = await beneficiaryService.createBeneficiary(formData);
        showSuccess({
          title: '✅ Beneficiary Added Successfully!',
          message: `${formData.name} has been added to the beneficiary database.`,
          details: {
            name: formData.name,
            type: formData.type,
            contact_person: formData.contact_person,
            address: formData.address
          },
          icon: 'checkCircle',
          buttonText: 'Great!'
        });
      } else if (modalMode === 'edit') {
        response = await beneficiaryService.updateBeneficiary(selectedBeneficiary.beneficiary_id, formData);
        showSuccess({
          title: '✅ Beneficiary Updated Successfully!',
          message: `${formData.name}'s information has been updated.`,
          details: {
            name: formData.name,
            type: formData.type,
            contact_person: formData.contact_person,
            address: formData.address
          },
          icon: 'checkCircle',
          buttonText: 'Perfect!'
        });
      }
      
      closeModal();
      loadBeneficiaries(pagination.currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (beneficiaryId) => {
    if (window.confirm('Are you sure you want to delete this beneficiary?')) {
      try {
        await beneficiaryService.deleteBeneficiary(beneficiaryId);
        loadBeneficiaries(pagination.currentPage);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    loadBeneficiaries(newPage);
  };

  // Request form handler
  const handleSubmitRequest = (data) => {
    // Show success modal for beneficiary request
    showSuccess({
      title: '📋 Beneficiary Request Submitted!',
      message: `Request for ${data.beneficiaryName || 'beneficiary'} has been successfully submitted and approved automatically.`,
      details: data.items ? [
        `${data.items.length} item types requested`,
        `Urgency level: ${data.urgency || 'Medium'}`,
        `Purpose: ${data.purpose || 'Not specified'}`
      ] : null,
      icon: 'star',
      buttonText: 'Excellent!'
    });
    
    // Reload beneficiaries after successful request submission
    loadBeneficiaries(pagination.currentPage);
    setShowRequestModal(false);
  };

  if (loading && beneficiaries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" draggable="false" onDragStart={(e) => e.preventDefault()}>


      {/* Tab Navigation */}
      <div className="border-b border-gray-200" draggable="false">
        <nav className="-mb-px flex space-x-8" draggable="false" onDragStart={(e) => e.preventDefault()}>
          <button
            onClick={() => setActiveTab('beneficiaries')}
            draggable="false"
            className={`py-2 px-1 border-b-2 font-medium text-sm select-none ${
              activeTab === 'beneficiaries'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center" draggable="false">
              <HiUsers className="w-5 h-5 mr-2" />
              Beneficiaries
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            draggable="false"
            className={`py-2 px-1 border-b-2 font-medium text-sm select-none ${
              activeTab === 'requests'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center" draggable="false">
              <HiClipboardList className="w-5 h-5 mr-2" />
              Requests
            </div>
          </button>
        </nav>
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

      {/* Beneficiaries Tab Content */}
      {activeTab === 'beneficiaries' && (
        <>
          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search beneficiaries..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div className="relative">
                  <HiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterType}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                  >
                    <option value="">All Types</option>
                    <option value="Individual">Individual</option>
                    <option value="Family">Family</option>
                    <option value="Community">Community</option>
                    <option value="Institution">Institution</option>
                    <option value="Parish/Religious Organization">Parish/Religious Organization</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between lg:justify-end gap-4">
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  Add Beneficiary
                </button>
              </div>
            </div>
          </div>

          {/* Beneficiaries Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-y-auto max-h-[600px]">
              <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {beneficiaries.map((beneficiary) => (
                <tr key={beneficiary.beneficiary_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <HiUser className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {beneficiary.name}
                        </div>
                        {beneficiary.contact_person && (
                          <div className="text-sm text-gray-500">
                            Contact: {beneficiary.contact_person}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      beneficiary.type === 'Individual' ? 'bg-blue-100 text-blue-800' :
                      beneficiary.type === 'Family' ? 'bg-green-100 text-green-800' :
                      beneficiary.type === 'Community' ? 'bg-purple-100 text-purple-800' :
                      beneficiary.type === 'Parish/Religious Organization' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {beneficiary.type}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      {beneficiary.phone && (
                        <div className="flex items-center">
                          <HiPhone className="w-4 h-4 text-gray-400 mr-2" />
                          {beneficiary.phone}
                        </div>
                      )}
                      {beneficiary.email && (
                        <div className="flex items-center">
                          <HiMail className="w-4 h-4 text-gray-400 mr-2" />
                          {beneficiary.email}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>Total: {beneficiary.total_requests || 0}</div>
                      <div className="text-xs text-gray-500">
                        Approved: {beneficiary.approved_requests || 0}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openViewModal(beneficiary)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <HiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(beneficiary)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <HiPencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(beneficiary.beneficiary_id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <PaginationComponent
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  itemName="beneficiaries"
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Requests Tab Content */}
      {activeTab === 'requests' && (
        <BeneficiaryRequestsManagement
          beneficiaries={beneficiaries}
          onRefresh={loadBeneficiaries}
          onNewRequest={() => setShowRequestModal(true)}
        />
      )}

      {/* Modal for Create/Edit/View */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' && 'Add New Beneficiary'}
                  {modalMode === 'edit' && 'Edit Beneficiary'}
                  {modalMode === 'view' && 'Beneficiary Details'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {modalMode === 'view' ? (
                  // View Mode
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <p className="text-gray-900">{selectedBeneficiary?.name}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedBeneficiary?.type === 'Individual' ? 'bg-blue-100 text-blue-800' :
                          selectedBeneficiary?.type === 'Family' ? 'bg-green-100 text-green-800' :
                          selectedBeneficiary?.type === 'Community' ? 'bg-purple-100 text-purple-800' :
                          selectedBeneficiary?.type === 'Parish/Religious Organization' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {selectedBeneficiary?.type}
                        </span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                        <p className="text-gray-900">{selectedBeneficiary?.contact_person || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <p className="text-gray-900">{selectedBeneficiary?.phone || 'N/A'}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <p className="text-gray-900">{selectedBeneficiary?.email || 'N/A'}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <p className="text-gray-900">{selectedBeneficiary?.address || 'N/A'}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <p className="text-gray-900">{selectedBeneficiary?.notes || 'No notes'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Create/Edit Mode
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter beneficiary name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Select type</option>
                          <option value="Individual">Individual</option>
                          <option value="Family">Family</option>
                          <option value="Community">Community</option>
                          <option value="Institution">Institution</option>
                          <option value="Parish/Religious Organization">Parish/Religious Organization</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          value={formData.contact_person}
                          onChange={(e) => handleInputChange('contact_person', e.target.value)}
                          className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter contact person name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter email address"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <textarea
                          rows="3"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter complete address"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          rows="3"
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Additional notes about the beneficiary"
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        {modalMode === 'create' ? 'Create Beneficiary' : 'Update Beneficiary'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary Request Form Modal */}
      <BeneficiaryRequestForm
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleSubmitRequest}
      />

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
};



export default BeneficiaryManagement;