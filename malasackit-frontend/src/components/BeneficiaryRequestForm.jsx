import React, { useState, useEffect } from 'react';
import { HiX, HiUser, HiLocationMarker, HiClipboardList, HiExclamationCircle } from 'react-icons/hi';
import beneficiaryService from '../services/beneficiaryService';

const BeneficiaryRequestForm = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1); // 1: Select/Create Beneficiary, 2: Request Details
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showCreateBeneficiary, setShowCreateBeneficiary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    notes: ""
  });

  // Load beneficiaries when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBeneficiaries();
    }
  }, [isOpen]);

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

    try {
      setLoading(true);
      const requestData = {
        beneficiary_id: selectedBeneficiary.beneficiary_id,
        purpose: requestForm.purpose,
        urgency: requestForm.urgency,
        notes: requestForm.notes
      };

      const response = await beneficiaryService.createBeneficiaryRequest(requestData);
      
      // Call parent callback
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      // Reset and close
      handleClose();
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
      notes: ""
    });
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
                <HiClipboardList className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {step === 1 ? 'Select Beneficiary' : 'Request Details'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {step === 1 ? 'Choose an existing beneficiary or create a new one' : 'Enter request details'}
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
                  className="ml-auto text-red-400 hover:text-red-600"
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
                step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-3 ${step >= 2 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
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
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Create New
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                        {beneficiaries.map((beneficiary) => (
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
                        ))}
                      </div>
                    )}

                    {selectedBeneficiary && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setStep(2)}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter contact person"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={beneficiaryForm.phone}
                          onChange={(e) => handleBeneficiaryChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                          rows="2"
                          value={beneficiaryForm.address}
                          onChange={(e) => handleBeneficiaryChange('address', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create & Continue'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              // Step 2: Request Details
              <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Selected Beneficiary:</h4>
                  <p className="text-gray-600">{selectedBeneficiary?.name} ({selectedBeneficiary?.type})</p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-red-600 hover:text-red-800 mt-1"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Low">Low - Routine assistance</option>
                    <option value="Medium">Medium - Standard need</option>
                    <option value="High">High - Urgent assistance required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    rows="3"
                    value={requestForm.notes}
                    onChange={(e) => handleRequestChange('notes', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
    </div>
  );
};

export default BeneficiaryRequestForm;