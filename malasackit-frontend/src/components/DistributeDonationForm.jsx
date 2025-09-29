import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  HiX, 
  HiLocationMarker, 
  HiUsers, 
  HiTrendingUp, 
  HiLightBulb,
  HiExclamation,
  HiCheckCircle,
  HiRefresh,
  HiChartBar
} from 'react-icons/hi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DistributeDonationForm = ({ isOpen, onClose, selectedItems = [] }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    location: '',
    beneficiaryType: '',
    distributionDate: '',
    notes: '',
    selectedDistribution: {}
  });

  // Sample prescriptive analytics data
  const locations = [
    { id: 1, name: 'Quezon City', population: 2936116, priority: 'high', demand: 85 },
    { id: 2, name: 'Manila City', population: 1780148, priority: 'high', demand: 78 },
    { id: 3, name: 'Makati City', population: 629616, priority: 'medium', demand: 65 },
    { id: 4, name: 'Pasig City', population: 755300, priority: 'medium', demand: 58 },
    { id: 5, name: 'Taguig City', population: 886722, priority: 'low', demand: 42 }
  ];

  // AI-generated optimal distribution recommendations
  const distributionRecommendations = {
    'Quezon City': { food: 40, medical: 30, clothing: 15, education: 10, others: 5 },
    'Manila City': { food: 35, medical: 35, clothing: 15, education: 10, others: 5 },
    'Makati City': { food: 25, medical: 25, clothing: 25, education: 20, others: 5 },
    'Pasig City': { food: 30, medical: 25, clothing: 20, education: 20, others: 5 },
    'Taguig City': { food: 20, medical: 30, clothing: 20, education: 25, others: 5 }
  };

  const currentInventory = {
    labels: ['Food Items', 'Medical Supplies', 'Clothing', 'Educational Materials', 'Others'],
    datasets: [{
      label: 'Available Stock',
      data: [450, 280, 320, 180, 90],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(107, 114, 128, 0.8)'
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(107, 114, 128, 1)'
      ],
      borderWidth: 2
    }]
  };

  const getOptimalDistribution = (location) => {
    const recommendation = distributionRecommendations[location] || {};
    return {
      labels: ['Food Items', 'Medical Supplies', 'Clothing', 'Educational Materials', 'Others'],
      datasets: [{
        label: 'Recommended Distribution (%)',
        data: [
          recommendation.food || 30,
          recommendation.medical || 25,
          recommendation.clothing || 20,
          recommendation.education || 15,
          recommendation.others || 10
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(107, 114, 128, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDistribute = () => {
    // Handle distribution logic here
    console.log('Distribution data:', formData);
    alert('Distribution plan created successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Darkened Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-6xl max-h-[90vh] transform transition-all duration-300 scale-100 z-10 flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <HiLightBulb className="w-6 h-6 text-red-600 mr-3" />
              Distribution Planning
            </h3>
            <p className="text-gray-600 mt-1">AI-optimized donation distribution system</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 pt-6">

              {/* Enhanced Step Indicator */}
              <div className="mb-8 bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-center">
                  {[1, 2, 3].map((stepNum) => (
                    <div key={stepNum} className="flex items-center">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                            step >= stepNum
                              ? 'bg-red-600 text-white shadow-lg transform scale-110'
                              : 'bg-white text-gray-400 border-2 border-gray-300'
                          }`}
                        >
                          {step > stepNum ? (
                            <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            stepNum
                          )}
                        </div>
                        {step === stepNum && (
                          <div className="absolute -inset-1 bg-red-600 rounded-full opacity-20 animate-pulse"></div>
                        )}
                      </div>
                      {stepNum < 3 && (
                        <div
                          className={`w-16 sm:w-24 lg:w-32 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-300 ${
                            step > stepNum ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs sm:text-sm px-2">
                  <span className={`font-medium transition-colors text-center ${step >= 1 ? 'text-red-600' : 'text-gray-500'}`}>
                    Location Selection
                  </span>
                  <span className={`font-medium transition-colors text-center ${step >= 2 ? 'text-red-600' : 'text-gray-500'}`}>
                    AI Analytics
                  </span>
                  <span className={`font-medium transition-colors text-center ${step >= 3 ? 'text-red-600' : 'text-gray-500'}`}>
                    Distribution Plan
                  </span>
                </div>
              </div>

              {/* Step 1: Location Selection */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    {/* Enhanced Form Fields */}
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                          <HiLocationMarker className="w-5 h-5 text-red-600 mr-2" />
                          Distribution Details
                        </h4>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Target Location
                            </label>
                            <select
                              value={formData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                            >
                              <option value="">Select a location</option>
                              {locations.map((location) => (
                                <option key={location.id} value={location.name}>
                                  {location.name} (Population: {location.population.toLocaleString()})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Beneficiary Type
                            </label>
                            <select
                              value={formData.beneficiaryType}
                              onChange={(e) => handleInputChange('beneficiaryType', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                            >
                              <option value="">Select beneficiary type</option>
                              <option value="families">Low-income Families</option>
                              <option value="elderly">Senior Citizens</option>
                              <option value="children">Children & Students</option>
                              <option value="disabled">Persons with Disabilities</option>
                              <option value="medical">Medical Patients</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Distribution Date
                            </label>
                            <input
                              type="date"
                              value={formData.distributionDate}
                              onChange={(e) => handleInputChange('distributionDate', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Current Inventory Chart */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <HiChartBar className="w-5 h-5 text-blue-600 mr-2" />
                        Current Inventory
                      </h4>
                      <div className="h-64 bg-white rounded-lg p-4 shadow-sm flex items-center justify-center">
                        <Doughnut data={currentInventory} options={chartOptions} />
                      </div>
                      <div className="mt-6 p-4 bg-white/70 rounded-lg">
                        <p className="text-sm text-gray-600 text-center">
                          Total items available: <span className="font-bold text-gray-900">1,320</span>
                        </p>
                      </div>
                    </div>
                  </div>

            {/* Location Priority Cards */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Priority Locations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      formData.location === location.name
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : `border-gray-200 hover:border-gray-300 ${getPriorityColor(location.priority)}`
                    }`}
                    onClick={() => handleInputChange('location', location.name)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">{location.name}</h5>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${getPriorityColor(location.priority)}`}>
                        {location.priority}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <HiUsers className="w-4 h-4 mr-2 text-gray-400" />
                        {location.population.toLocaleString()} people
                      </div>
                      <div className="flex items-center">
                        <HiTrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                        Demand: {location.demand}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: AI Analytics */}
        {step === 2 && formData.location && (
          <div className="space-y-8">
            {/* AI Recommendations Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <HiLightBulb className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-blue-900">AI-Powered Distribution Analysis</h4>
                  <p className="text-blue-700 text-sm mt-1">Based on historical data, current needs, and demographic analysis for {formData.location}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Recommended Distribution Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">Recommended Distribution</h4>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut data={getOptimalDistribution(formData.location)} options={chartOptions} />
                </div>
              </div>

              {/* Analytics Insights */}
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <HiCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Optimal Match Found</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Your inventory aligns well with {formData.location}'s current needs. Expected efficiency: 92%
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <HiExclamation className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-900">High Demand Items</span>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    Food items and medical supplies are in high demand in this area. Consider prioritizing these categories.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="font-medium text-gray-900 mb-4">Key Insights</h5>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                      Food shortage reported in 3 barangays
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      Medical facility within 5km radius
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      3 schools actively requesting supplies
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                      Best distribution time: 9AM - 3PM
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Distribution Plan */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-900 mb-6">Distribution Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <p className="text-gray-900 font-medium">{formData.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiaries</label>
                  <p className="text-gray-900 font-medium">{formData.beneficiaryType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <p className="text-gray-900 font-medium">{formData.distributionDate}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Additional Notes
              </label>
              <textarea
                rows="4"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any special instructions or notes for the distribution..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h5 className="font-medium text-blue-900 mb-4">Final Recommendations</h5>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Prioritize food items and medical supplies based on high demand</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Schedule distribution between 9AM - 3PM for optimal reach</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Coordinate with local barangay officials for smooth execution</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Prepare backup supplies for emergency cases</span>
                </li>
              </ul>
            </div>
          </div>
        )}

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 bg-gray-50 -mx-6 sm:-mx-8 px-6 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-0">
                <button
                  onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 font-medium flex items-center justify-center"
                >
                  <HiX className="w-4 h-4 mr-2" />
                  {step === 1 ? 'Cancel' : 'Previous'}
                </button>
                
                <div className="flex space-x-3 w-full sm:w-auto">
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={step === 1 && (!formData.location || !formData.beneficiaryType || !formData.distributionDate)}
                      className="flex-1 sm:flex-none px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      {step === 1 ? 'Analyze Location' : 'Create Plan'}
                      <HiTrendingUp className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleDistribute}
                      className="flex-1 sm:flex-none px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      <HiCheckCircle className="w-4 h-4 mr-2" />
                      Create Distribution Plan
                    </button>
                  )}
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributeDonationForm;
