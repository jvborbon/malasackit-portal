import React, { useState, useEffect } from 'react';
import { 
  HiX, 
  HiPlus, 
  HiTrash, 
  HiUser, 
  HiCheck, 
  HiChevronLeft, 
  HiChevronRight,
  HiInformationCircle
} from 'react-icons/hi';
import { createWalkInDonation } from '../services/walkInService';
import { getCategories, getItemTypesByCategory } from '../services/inventoryService';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '../utils/sanitization';

const WalkInDonationForm = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donorCredentials, setDonorCredentials] = useState(null);
  
  // Form data
  const [donorName, setDonorName] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Categories and item types
  const [categories, setCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Loading categories...');
        const response = await getCategories();
        console.log('Categories response:', response);
        console.log('Categories data:', response.data);
        console.log('Categories array:', response.data);
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        // Fallback categories for testing
        const fallbackCategories = [
          { itemcategory_id: 1, category_name: 'Food Items' },
          { itemcategory_id: 2, category_name: 'Clothing' },
          { itemcategory_id: 3, category_name: 'Educational Materials' },
          { itemcategory_id: 4, category_name: 'Household Essentials/Personal Care' }
        ];
        console.log('Using fallback categories:', fallbackCategories);
        setCategories(fallbackCategories);
      }
    };
    
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);
  
  // Load item types when category changes
  useEffect(() => {
    const loadItemTypes = async () => {
      if (selectedCategory) {
        try {
          const response = await getItemTypesByCategory(selectedCategory);
          console.log('Item types full response:', response);
          console.log('Item types response data:', response.data);
          console.log('Item types array:', response.data?.data);
          setItemTypes(response.data?.data || response.data || []);
        } catch (error) {
          console.error('Error loading item types:', error);
        }
      } else {
        setItemTypes([]);
      }
    };
    
    loadItemTypes();
  }, [selectedCategory]);
  
  const handleClose = () => {
    setCurrentStep(1);
    setDonorName('');
    setDonorAddress('');
    setDonorPhone('');
    setDonorEmail('');
    setSelectedItems([]);
    setSelectedCategory('');
    setSearchTerm('');
    onClose();
  };
  
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleAddItem = (itemType) => {
    const baseValue = itemType.default_value || 0;
    const initialCondition = itemType.fixed_condition || 'Good';
    const conditionAdjustedValue = baseValue ? calculateValueByCondition(baseValue, initialCondition) : '';
    
    const newItem = {
      id: Date.now(),
      category: selectedCategory,
      itemType: itemType.item_type_name,
      itemTypeId: itemType.item_type_id,
      quantity: 1,
      condition: initialCondition,
      baseValue: baseValue, // Store the original base value
      value: conditionAdjustedValue,
      description: '',
      fixedCondition: itemType.fixed_condition,
      hasFixedCondition: itemType.has_fixed_condition
    };
    setSelectedItems([...selectedItems, newItem]);
  };
  
  const handleUpdateItem = (id, field, value) => {
    setSelectedItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate value when condition changes (only if there's a base value)
          if (field === 'condition' && item.baseValue) {
            updatedItem.value = calculateValueByCondition(item.baseValue, value);
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };
  
  const handleRemoveItem = (id) => {
    setSelectedItems(items => items.filter(item => item.id !== id));
  };
  
  const filteredItemTypes = itemTypes.filter(itemType =>
    itemType.item_type_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate value based on condition
  const calculateValueByCondition = (baseValue, condition) => {
    const conditionMultipliers = {
      'new': 1.0,         // 100% of base value (for fixed conditions)
      'New': 1.0,         // 100% of base value (for fixed conditions)
      'Excellent': 1.0,   // 100% of base value
      'Good': 0.8,        // 80% of base value
      'Fair': 0.6,        // 60% of base value
      'Poor': 0.4         // 40% of base value
    };
    
    const multiplier = conditionMultipliers[condition] || 0.8;
    return (parseFloat(baseValue) * multiplier).toFixed(2);
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const donationData = {
        donor: {
          name: donorName,
          contact: donorPhone,
          address: donorAddress,
          email: donorEmail
        },
        items: selectedItems.map(item => ({
          itemtype_id: item.itemTypeId,
          quantity: parseInt(item.quantity),
          declared_value: parseFloat(item.value) || 0,
          condition: item.condition,
          description: item.description
        })),
        notes: 'Walk-in donation'
      };
      
      console.log('Sending donation data:', donationData);
      const response = await createWalkInDonation(donationData);
      console.log('Full API response:', response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response.donor:', response.donor);
      console.log('Response.donation:', response.donation);
      console.log('Response.data:', response.data);
      
      // Handle response structure - check if data is nested in response.data
      const responseData = response.data || response;
      console.log('Using response data:', responseData);
      console.log('ResponseData.donor:', responseData.donor);
      console.log('ResponseData.donation:', responseData.donation);
      
      // Store donor credentials for success modal with multiple fallback approaches
      const credentials = {
        userId: responseData.donor?.user_id || response.donor?.user_id || responseData.data?.donor_user_id,
        email: responseData.donor?.email || response.donor?.email || responseData.data?.login_credentials?.email,
        tempPassword: responseData.donor?.temp_password || response.donor?.temp_password || responseData.data?.login_credentials?.password,
        donationId: responseData.donation?.donation_id || response.donation?.donation_id || responseData.data?.donation_id,
        totalValue: selectedItems.reduce((sum, item) => sum + (parseFloat(item.value) * parseInt(item.quantity)), 0),
        donorName: donorName,
        itemCount: selectedItems.length
      };
      
      console.log('Final credentials object:', credentials);
      setDonorCredentials(credentials);
      
      setShowSuccessModal(true);
      onSuccess();
    } catch (error) {
      console.error('Error creating walk-in donation:', error);
      console.error('Error details:', error.message);
      alert(`Error creating donation: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const isStep1Valid = donorName.trim() && donorAddress.trim() && donorPhone.trim();
  const isStep2Valid = selectedItems.length > 0;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <HiUser className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Record Walk-In Donation</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>
        
        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Donor Info</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Items</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Review</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Donor Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(sanitizeInput(e.target.value))}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter donor's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(sanitizeInput(e.target.value))}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter donor's address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(sanitizePhone(e.target.value))}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(sanitizeEmail(e.target.value))}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Donation Items</h3>
              
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.itemcategory_id} value={category.category_name}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Search Bar */}
              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Items
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search for items..."
                  />
                </div>
              )}
              
              {/* Available Items */}
              {selectedCategory && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available Items</h4>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                    {filteredItemTypes.map((itemType) => (
                      <div
                        key={itemType.item_type_id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">{itemType.item_type_name}</span>
                          {itemType.has_fixed_condition && (
                            <span className="text-xs text-orange-600 mt-1">
                              Condition fixed: {itemType.fixed_condition.charAt(0).toUpperCase() + itemType.fixed_condition.slice(1)}
                            </span>
                          )}
                          {itemType.avg_retail_price && (
                            <span className="text-xs text-green-600 mt-1">
                              Est. value: ₱{itemType.avg_retail_price}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddItem(itemType)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <HiPlus className="h-3 w-3 mr-1" />
                          Add
                        </button>
                      </div>
                    ))}
                    {filteredItemTypes.length === 0 && selectedCategory && (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No items found
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Added Items List (Read-only) */}
              {selectedItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Items ({selectedItems.length})</h4>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-900">{item.itemType}</span>
                            <span className="text-xs text-gray-500 ml-2">({item.category})</span>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Donation</h3>
              
              {/* Donor Information Review */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Donor Information</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">Name:</span> {donorName}</p>
                  <p><span className="font-medium">Address:</span> {donorAddress}</p>
                  <p><span className="font-medium">Phone:</span> {donorPhone}</p>
                  {donorEmail && <p><span className="font-medium">Email:</span> {donorEmail}</p>}
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit Donor Info
                </button>
              </div>
              
              {/* Items Review */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">Donation Items</h4>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Add More Items
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="bg-white rounded border p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{item.itemType}</h5>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-3 mb-3">
                        {/* First Row: Quantity and Condition */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Condition
                              {item.hasFixedCondition && (
                                <span className="text-xs text-orange-600 ml-1">(Fixed)</span>
                              )}
                            </label>
                            <select
                              value={item.condition}
                              onChange={(e) => handleUpdateItem(item.id, 'condition', e.target.value)}
                              disabled={item.hasFixedCondition}
                              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                item.hasFixedCondition 
                                  ? 'bg-gray-100 text-gray-700 cursor-not-allowed' 
                                  : 'bg-white text-gray-900'
                              }`}
                            >
                              {item.hasFixedCondition ? (
                                <option value={item.fixedCondition}>
                                  {item.fixedCondition.charAt(0).toUpperCase() + item.fixedCondition.slice(1)} (Required)
                                </option>
                              ) : (
                                <>
                                  <option value="New">New</option>
                                  <option value="Excellent">Excellent</option>
                                  <option value="Good">Good</option>
                                  <option value="Fair">Fair</option>
                                  <option value="Poor">Poor</option>
                                </>
                              )}
                            </select>
                            {item.hasFixedCondition && (
                              <div className="text-xs text-orange-600 mt-1">
                                This item can only be donated in "{item.fixedCondition}" condition for safety/hygiene reasons.
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Second Row: Value */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-gray-700">
                              Value (₱) <span className="text-gray-500">- Condition-adjusted</span>
                            </label>
                            {item.baseValue && (
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(item.id, 'value', calculateValueByCondition(item.baseValue, item.condition))}
                                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                                title="Reset to condition-adjusted value"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.value || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'value', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Condition-adjusted value"
                          />
                          {item.baseValue && (
                            <div className="text-xs text-gray-500 mt-1">
                              Base: ₱{item.baseValue} × {item.condition === 'new' || item.condition === 'New' ? '100%' : item.condition === 'Excellent' ? '100%' : item.condition === 'Good' ? '80%' : item.condition === 'Fair' ? '60%' : '40%'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          rows={2}
                          placeholder="Additional details..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              >
                <HiChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <HiChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <HiCheck className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Submitting...' : 'Complete Donation'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6">
              {/* Success Header */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <HiCheck className="h-10 w-10 text-green-500 bg-green-100 rounded-full p-2" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Walk-In Donation Successful!
                  </h3>
                  <p className="text-sm text-gray-500">
                    Thank you for your generous donation.
                  </p>
                </div>
              </div>
              
              {/* Donation Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Donation Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donation ID:</span>
                    <span className="font-medium">#{donorCredentials?.donationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{donorCredentials?.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium text-green-600">₱{donorCredentials?.totalValue?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Temporary Credentials */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <HiInformationCircle className="h-4 w-4 mr-1" />
                  Temporary Account Created
                </h4>
                <p className="text-xs text-blue-700 mb-3">
                  A temporary account has been created for the donor. Please provide these credentials:
                </p>
                <div className="space-y-2">
                  <div className="bg-blue-100 rounded p-2">
                    <div className="text-xs text-blue-600 font-medium">Email Address:</div>
                    <div className="text-sm font-mono text-blue-900 break-all">{donorCredentials?.email}</div>
                  </div>
                  <div className="bg-blue-100 rounded p-2">
                    <div className="text-xs text-blue-600 font-medium">Temporary Password:</div>
                    <div className="text-sm font-mono text-blue-900">{donorCredentials?.tempPassword}</div>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ⚠️ The donor should change this password after first login.
                </p>
              </div>
              
              {/* Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    handleClose();
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <HiCheck className="h-4 w-4 mr-2" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkInDonationForm;