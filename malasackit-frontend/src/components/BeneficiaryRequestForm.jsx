import React, { useState } from 'react';
import { HiX, HiUser, HiLocationMarker, HiClipboardList, HiExclamationCircle } from 'react-icons/hi';

const BeneficiaryRequestForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    location: "",
    beneficiaryType: "",
    requestedItems: "",
    urgencyLevel: "normal",
    notes: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    onSubmit(formData);
    
    // Reset form
    setFormData({
      fullName: "",
      contactNumber: "",
      location: "",
      beneficiaryType: "",
      requestedItems: "",
      urgencyLevel: "normal",
      notes: ""
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <HiClipboardList className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Log Beneficiary Request</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Form - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
            {/* Beneficiary Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <HiUser className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Beneficiary Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Enter beneficiary full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiLocationMarker className="w-4 h-4 inline mr-1" />
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Barangay, Municipality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficiary Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.beneficiaryType}
                    onChange={(e) => handleInputChange('beneficiaryType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    <option value="">Select type</option>
                    <option value="Individual">Individual</option>
                    <option value="Family">Family</option>
                    <option value="Community">Community</option>
                    <option value="Institution">Institution (School, Hospital, etc.)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Request Details Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <HiClipboardList className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Items <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.requestedItems}
                  onChange={(e) => handleInputChange('requestedItems', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="e.g., Rice (25kg), Canned goods, Medical supplies, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiExclamationCircle className="w-4 h-4 inline mr-1" />
                  Urgency Level
                </label>
                <select
                  value={formData.urgencyLevel}
                  onChange={(e) => handleInputChange('urgencyLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                >
                  <option value="low">Low - Routine assistance</option>
                  <option value="normal">Normal - Standard need</option>
                  <option value="high">High - Urgent assistance required</option>
                  <option value="emergency">Emergency - Immediate action needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Any additional information about the request..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                Log Request
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryRequestForm;
