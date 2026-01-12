import React, { useState, useEffect } from 'react';
import { HiX, HiUser, HiLocationMarker, HiClipboardList, HiExclamationCircle, HiPlus, HiTrash, HiSearch } from 'react-icons/hi';
import beneficiaryService from '../services/beneficiaryService';
import { getCategories } from '../services/inventoryService';
import { getItemTypesByCategory } from '../services/donationService';
import SuccessModal from './common/SuccessModal';
import { useSuccessModal } from '../hooks/useSuccessModal';
import { sanitizeInput, sanitizeEmail, sanitizePhone, sanitizeText } from '../utils/sanitization';

const BeneficiaryRequestForm = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1); // 1: Select/Create Beneficiary, 2: Request Details, 3: Select Items
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showCreateBeneficiary, setShowCreateBeneficiary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Item selection state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: "",
    type: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });

  const [requestForm, setRequestForm] = useState({
    purpose: "",
    urgency: "Medium",
    notes: "",
    individuals_served: ""
  });

  // Success modal hook
  const { isOpen: isSuccessOpen, modalData: successData, showSuccess, hideSuccess } = useSuccessModal();

  // Load beneficiaries and categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBeneficiaries();
      loadCategories();
    }
  }, [isOpen]);

  // Load item types when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadItemTypes();
    }
  }, [selectedCategory]);

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      const response = await beneficiaryService.getAllBeneficiaries({ limit: 100 });
      setBeneficiaries(response.data);
    } catch (err) {
      setError('Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadItemTypes = async () => {
    try {
      const response = await getItemTypesByCategory(selectedCategory);
      setItemTypes(response.data || []);
    } catch (err) {
      console.error('Failed to load item types:', err);
      setItemTypes([]);
    }
  };

  const addSelectedItem = () => {
    const newItem = {
      id: Date.now(),
      itemtype_id: '',
      itemtype_name: '',
      requested_quantity: 1
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const updateSelectedItem = (id, field, value) => {
    setSelectedItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Update item name when itemtype_id changes
        if (field === 'itemtype_id') {
          const itemType = itemTypes.find(it => it.item_type_id === parseInt(value));
          updated.itemtype_name = itemType ? itemType.item_type_name : '';
          updated.itemtype_id = parseInt(value);
        }
        return updated;
      }
      return item;
    }));
  };

  const removeSelectedItem = (id) => {
    setSelectedItems(items => items.filter(item => item.id !== id));
  };

  const handleBeneficiaryChange = (field, value) => {
    setBeneficiaryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRequestChange = (field, value) => {
    setRequestForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateBeneficiary = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await beneficiaryService.createBeneficiary(beneficiaryForm);
      setSelectedBeneficiary(response.data);
      setShowCreateBeneficiary(false);
      setStep(2);
      // Add to list
      setBeneficiaries(prev => [response.data, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!selectedBeneficiary) {
      setError('Please select a beneficiary');
      return;
    }

    // Validate items if any are selected
    const validItems = selectedItems.filter(item => item.itemtype_id && item.requested_quantity > 0);

    try {
      setLoading(true);
      const requestData = {
        beneficiary_id: selectedBeneficiary.beneficiary_id,
        purpose: requestForm.purpose,
        urgency: requestForm.urgency,
        notes: requestForm.notes,
        individuals_served: parseInt(requestForm.individuals_served) || 1,
        items: validItems.map(item => ({
          itemtype_id: item.itemtype_id,
          quantity_requested: item.requested_quantity
        }))
      };

      const response = await beneficiaryService.createBeneficiaryRequest(requestData);
      
      // Show success modal instead of calling onSubmit immediately
      showSuccess({
        title: '🎉 Request Created Successfully!',
        message: `Beneficiary request for ${selectedBeneficiary.name} has been submitted and automatically approved.`,
        details: {
          beneficiary: selectedBeneficiary.name,
          purpose: requestForm.purpose,
          urgency: requestForm.urgency,
          individuals_served: requestForm.individuals_served,
          items_requested: validItems.length,
          status: 'Approved'
        },
        icon: 'star',
        buttonText: 'Perfect!'
      });
      
      // Call parent callback after showing success
      if (onSubmit) {
        onSubmit({
          ...response.data,
          beneficiaryName: selectedBeneficiary.name,
          items: validItems,
          purpose: requestForm.purpose,
          urgency: requestForm.urgency
        });
      }
      
      // Don't close immediately - let user see the success modal
      // handleClose will be called when they click the modal button
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedBeneficiary(null);
    setShowCreateBeneficiary(false);
    setBeneficiaryForm({
      name: "",
      type: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      notes: ""
    });
    setRequestForm({
      purpose: "",
      urgency: "Medium",
      notes: "",
      individuals_served: ""
    });
    // Reset item selection state
    setSelectedCategory('');
    setItemTypes([]);
    setSelectedItems([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"></div>
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <HiClipboardList className="w-6 h-6 text-red-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {step === 1 ? 'Select Beneficiary' : step === 2 ? 'Request Details' : 'Select Items'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {step === 1 ? 'Choose an existing beneficiary or create a new one' : 
                   step === 2 ? 'Enter request details' : 'Specify items needed (optional)'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <HiExclamationCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-900"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step Indicator */}
          <div className="px-6 pt-4">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-red-900 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-3 ${step >= 2 ? 'bg-red-900' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-red-900 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-3 ${step >= 3 ? 'bg-red-900' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-red-900 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {step === 1 ? (
              // Step 1: Select/Create Beneficiary
              <div className="p-6 space-y-6">
                {!showCreateBeneficiary ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Select Existing Beneficiary</h3>
                      <button
                        onClick={() => setShowCreateBeneficiary(true)}
                        className="px-4 py-2 text-sm bg-red-900 text-white rounded-lg hover:bg-red-950"
                      >
                        Create New
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiSearch className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, type, or address..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 bg-white text-gray-900"
                      />
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                        {(() => {
                          const filteredBeneficiaries = beneficiaries.filter(beneficiary => 
                            beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            beneficiary.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (beneficiary.address && beneficiary.address.toLowerCase().includes(searchTerm.toLowerCase()))
                          );
                          
                          if (filteredBeneficiaries.length === 0) {
                            return (
                              <div className="p-8 text-center text-gray-500">
                                <HiSearch className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>No beneficiaries found</p>
                                {searchTerm && (
                                  <p className="text-sm mt-1">Try a different search term</p>
                                )}
                              </div>
                            );
                          }
                          
                          return filteredBeneficiaries.map((beneficiary) => (
                          <div
                            key={beneficiary.beneficiary_id}
                            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                              selectedBeneficiary?.beneficiary_id === beneficiary.beneficiary_id ? 'bg-red-50 border-red-200' : ''
                            }`}
                            onClick={() => setSelectedBeneficiary(beneficiary)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{beneficiary.name}</h4>
                                <p className="text-sm text-gray-600">{beneficiary.type}</p>
                                {beneficiary.address && (
                                  <p className="text-sm text-gray-500 flex items-center">
                                    <HiLocationMarker className="w-4 h-4 mr-1" />
                                    {beneficiary.address}
                                  </p>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                <div>Requests: {beneficiary.total_requests || 0}</div>
                                <div>Pending: {beneficiary.pending_requests || 0}</div>
                              </div>
                            </div>
                          </div>
                        ));
                        })()}
                      </div>
                    )}

                    {selectedBeneficiary && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setStep(2)}
                          className="px-6 py-2 bg-red-900 text-white rounded-lg hover:bg-red-950"
                        >
                          Continue
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Create New Beneficiary Form
                  <form onSubmit={handleCreateBeneficiary} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Create New Beneficiary</h3>
                      <button
                        type="button"
                        onClick={() => setShowCreateBeneficiary(false)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Back to List
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={beneficiaryForm.name}
                          onChange={(e) => handleBeneficiaryChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 bg-white text-gray-900"
                          placeholder="Enter beneficiary name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={beneficiaryForm.type}
                          onChange={(e) => handleBeneficiaryChange('type', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 bg-white text-gray-900"
                        >
                          <option value="">Select type</option>
                          <option value="Individual">Individual</option>
                          <option value="Family">Family</option>
                          <option value="Community">Community</option>
                          <option value="Institution">Institution</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                        <input
                          type="text"
                          value={beneficiaryForm.contact_person}
                          onChange={(e) => handleBeneficiaryChange('contact_person', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 bg-white text-gray-900"
                          placeholder="Enter contact person"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={beneficiaryForm.phone}
                          onChange={(e) => handleBeneficiaryChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 bg-white text-gray-900"
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                          rows="2"
                          value={beneficiaryForm.address}
                          onChange={(e) => handleBeneficiaryChange('address', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 bg-white text-gray-900"
                          placeholder="Enter address"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCreateBeneficiary(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-950 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create & Continue'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : step === 2 ? (
              // Step 2: Request Details
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Selected Beneficiary:</h4>
                  <p className="text-gray-600">{selectedBeneficiary?.name} ({selectedBeneficiary?.type})</p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-red-900 hover:text-red-800 mt-1"
                  >
                    Change Beneficiary
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose/Reason for Request <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={requestForm.purpose}
                    onChange={(e) => handleRequestChange('purpose', e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900"
                    placeholder="Describe the purpose or reason for this request in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={requestForm.urgency}
                    onChange={(e) => handleRequestChange('urgency', e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900"
                  >
                    <option value="Low">Low - Routine assistance</option>
                    <option value="Medium">Medium - Standard need</option>
                    <option value="High">High - Urgent assistance required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Individuals/Families to be Served <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={requestForm.individuals_served}
                    onChange={(e) => handleRequestChange('individuals_served', e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900"
                    placeholder="e.g., 50 families, 100 individuals"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the total number of people/families who will benefit from this assistance
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    rows="3"
                    value={requestForm.notes}
                    onChange={(e) => handleRequestChange('notes', e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900"
                    placeholder="Any additional information about the request..."
                  />
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-950"
                    >
                      Continue to Items
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Step 3: Select Items
              <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Request Summary:</h4>
                  <p className="text-gray-600">{selectedBeneficiary?.name} ({selectedBeneficiary?.type})</p>
                  <p className="text-sm text-gray-600 mt-1">{requestForm.purpose}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Specify Items Needed</h4>
                    <p className="text-sm text-gray-600">(Optional - leave empty for general assistance)</p>
                  </div>

                  {/* Category Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900"
                    >
                      <option value="">Select a category to add items</option>
                      {categories.map((category) => (
                        <option key={category.itemcategory_id} value={category.itemcategory_id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Add Item Button */}
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={addSelectedItem}
                      className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <HiPlus className="w-4 h-4 mr-2" />
                      Add Item
                    </button>
                  )}

                  {/* Selected Items List */}
                  {selectedItems.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Requested Items:</h5>
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <select
                              value={item.itemtype_id}
                              onChange={(e) => updateSelectedItem(item.id, 'itemtype_id', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 focus:border-red-900 bg-white text-gray-900"
                              required
                            >
                              <option value="">Select item type</option>
                              {itemTypes.map((itemType) => (
                                <option key={itemType.item_type_id} value={itemType.item_type_id}>
                                  {itemType.item_type_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-20">
                            <input
                              type="number"
                              min="1"
                              value={item.requested_quantity}
                              onChange={(e) => updateSelectedItem(item.id, 'requested_quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 focus:border-red-900 bg-white text-gray-900"
                              placeholder="Qty"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedItem(item.id)}
                            className="text-red-900 hover:text-red-800 p-1"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <HiClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No specific items selected</p>
                      <p className="text-sm">Request will be processed for general assistance</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-950 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Common Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          hideSuccess();
          handleClose();
        }}
        title={successData.title}
        message={successData.message}
        details={successData.details}
        buttonText={successData.buttonText}
        icon={successData.icon}
      />
    </div>
  );
};

export default BeneficiaryRequestForm;