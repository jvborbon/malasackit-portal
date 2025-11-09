import React, { useState, useEffect } from 'react';
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
    selectedRequests: [],
    distributionDate: '',
    notes: '',
    distributionPlan: {},
    selectedDistribution: {}
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData({
        selectedRequests: [],
        distributionDate: '',
        notes: '',
        distributionPlan: {},
        selectedDistribution: {}
      });
    }
  }, [isOpen]);

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

  // Inventory with thresholds and recommendations
  const inventoryData = [];

  // Ensure data is valid for charts
  const safeInventoryData = inventoryData.filter(item => 
    item && typeof item.current === 'number' && typeof item.threshold === 'number'
  );

  const currentInventory = {
    labels: safeInventoryData.map(item => item.name || 'Unknown'),
    datasets: [
      {
        label: 'Current Stock',
        data: safeInventoryData.map(item => item.current || 0),
        backgroundColor: safeInventoryData.map(item => 
          item.status === 'safe' ? 'rgba(34, 197, 94, 0.8)' :
          item.status === 'low' ? 'rgba(251, 191, 36, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: safeInventoryData.map(item => 
          item.status === 'safe' ? 'rgba(34, 197, 94, 1)' :
          item.status === 'low' ? 'rgba(251, 191, 36, 1)' :
          'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 2
      },
      {
        label: 'Minimum Threshold',
        data: safeInventoryData.map(item => item.threshold || 0),
        backgroundColor: 'rgba(107, 114, 128, 0.5)',
        borderColor: 'rgba(107, 114, 128, 1)',
        borderWidth: 2
      }
    ]
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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} units`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity (units)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Item Categories'
        }
      }
    }
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

  const handleRequestChange = (itemName, value) => {
    setFormData(prev => ({
      ...prev,
      requests: {
        ...prev.requests,
        [itemName]: parseInt(value) || 0
      }
    }));
  };

  const handleRequestSelection = (requestId) => {
    setFormData(prev => ({
      ...prev,
      selectedRequests: prev.selectedRequests?.includes(requestId)
        ? prev.selectedRequests.filter(id => id !== requestId)
        : [...(prev.selectedRequests || []), requestId]
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
              Create Distribution Plan
            </h3>
            <p className="text-gray-600 mt-1">Plan distribution for approved beneficiary requests.</p>
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
                    Select Requests
                  </span>
                  <span className={`font-medium transition-colors text-center ${step >= 2 ? 'text-red-600' : 'text-gray-500'}`}>
                    Plan Distribution
                  </span>
                  <span className={`font-medium transition-colors text-center ${step >= 3 ? 'text-red-600' : 'text-gray-500'}`}>
                    Execute Plan
                  </span>
                </div>
              </div>

              {/* Inventory Status Overview */}
              <div className="mb-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HiChartBar className="w-5 h-5 text-blue-600 mr-2" />
                  Current Inventory Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {safeInventoryData.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-700 truncate">{item.name}</h5>
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'safe' ? 'bg-green-500' :
                          item.status === 'low' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-gray-900">{item.current}</div>
                        <div className="text-xs text-gray-500">Threshold: {item.threshold}</div>
                        {item.status === 'safe' ? (
                          <div className="text-xs text-green-600 font-medium">
                            ✓ Safe to distribute: {item.safeToDistribute}
                          </div>
                        ) : item.status === 'low' ? (
                          <div className="text-xs text-yellow-600 font-medium">
                            ⚠ Restock recommended
                          </div>
                        ) : (
                          <div className="text-xs text-red-600 font-medium">
                            🚨 Critical - Hold distribution
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Select Pending Requests */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    {/* Pending Requests Selection */}
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                          <HiExclamation className="w-5 h-5 text-yellow-600 mr-2" />
                          Pending Beneficiary Requests
                        </h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                          <p className="text-sm text-blue-800 flex items-center">
                            <HiExclamation className="w-4 h-4 mr-2 flex-shrink-0" />
                            Select beneficiary requests that are ready for distribution planning.
                          </p>
                        </div>
                        
                        {/* Sample pending requests */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {[
                            { id: 'BID003', name: 'Ana Rodriguez', location: 'Brgy. Poblacion, Lipa City', items: 'School Supplies', count: '30 students', date: '2024-10-20' },
                            { id: 'BID006', name: 'Miguel Torres', location: 'Brgy. Marawoy, Lipa City', items: 'Emergency Blankets', count: '25 families', date: '2024-10-22' },
                            { id: 'BID007', name: 'Barangay Captain Santos', location: 'Brgy. Tibig, Lipa City', items: 'Food Package', count: '100 families', date: '2024-10-25' },
                            { id: 'BID008', name: 'Parish Social Services', location: 'Multiple Barangays', items: 'Medical Supplies', count: '50 individuals', date: '2024-10-23' }
                          ].map((request, index) => (
                            <div 
                              key={request.id} 
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                formData.selectedRequests?.includes(request.id) 
                                  ? 'border-red-500 bg-red-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleRequestSelection(request.id)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.selectedRequests?.includes(request.id) || false}
                                    onChange={() => handleRequestSelection(request.id)}
                                    className="mr-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                  <div>
                                    <h5 className="font-semibold text-gray-900">{request.name}</h5>
                                    <p className="text-sm text-gray-600">{request.id}</p>
                                  </div>
                                </div>
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                  Pending
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div><strong>Location:</strong> {request.location}</div>
                                <div><strong>Items:</strong> {request.items}</div>
                                <div><strong>Beneficiaries:</strong> {request.count}</div>
                                <div><strong>Requested Date:</strong> {request.date}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Needs Assessment Form */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <HiExclamation className="w-5 h-5 text-yellow-600 mr-2" />
                        Assessed Needs
                      </h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800">
                          Record the specific quantities needed based on survey findings, community assessment, or direct requests.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {safeInventoryData.map((item, index) => (
                          <div key={index} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">{item.name}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.status === 'safe' ? 'bg-green-100 text-green-800' :
                                item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Current Stock: {item.current}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <label className="text-sm text-gray-600 w-24">Requested:</label>
                              <input
                                type="number"
                                placeholder="0"
                                min="0"
                                value={formData.requests?.[item.name] || ''}
                                onChange={(e) => handleRequestChange(item.name, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              />
                              <span className="text-sm text-gray-500 w-16">units</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Priority: {item.status === 'safe' ? 'Available for distribution' : 
                                        item.status === 'low' ? 'Limited availability' : 'Not recommended - low stock'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

        {/* Step 2: Create Distribution Plan */}
        {step === 2 && formData.selectedRequests && formData.selectedRequests.length > 0 && (
          <div className="space-y-8">
            {/* Distribution Plan Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <HiLightBulb className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-blue-900">Distribution Planning</h4>
                  <p className="text-blue-700 text-sm mt-1">Create distribution plan for {formData.selectedRequests?.length || 0} selected beneficiary requests</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Request vs Inventory Matching */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <HiLightBulb className="w-5 h-5 text-green-600 mr-2" />
                  Recommended Distribution Plan
                </h4>
                <div className="space-y-4">
                  {safeInventoryData.map((item, index) => {
                    const requested = formData.requests[item.name] || 0;
                    const available = item.current;
                    const recommended = Math.min(requested, item.safeToDistribute, available);
                    const canFulfill = recommended === requested;
                    
                    return (
                      <div key={index} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            canFulfill ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {canFulfill ? 'FULL MATCH' : 'PARTIAL'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Requested:</span>
                            <span className="font-medium">{requested} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Available:</span>
                            <span className="font-medium">{available} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recommended:</span>
                            <span className={`font-bold ${
                              recommended > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {recommended} units
                            </span>
                          </div>
                          {requested > 0 && recommended < requested && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                              ⚠ Shortfall: {requested - recommended} units - {
                                available < requested ? 'Insufficient stock' : 'Below safety threshold'
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">Stock vs Distribution Plan</h4>
                <div className="h-64 flex items-center justify-center">
                  <Bar 
                    data={currentInventory} 
                    options={barChartOptions}
                    key="inventory-bar-chart"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Execute Distribution Plan */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-900 mb-6">Execute Distribution Plan</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Requests</label>
                  <p className="text-gray-900 font-medium">{formData.selectedRequests?.length || 0} requests</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distribution Date</label>
                  <input
                    type="date"
                    value={formData.distributionDate}
                    onChange={(e) => handleInputChange('distributionDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <p className="text-gray-900 font-medium">Ready for Execution</p>
                </div>
              </div>
            </div>

            {/* Selected Requests Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Selected Requests Summary</h5>
              <div className="space-y-4">
                {formData.selectedRequests?.map((requestId) => {
                  const request = mockPendingRequests.find(r => r.id === requestId);
                  return (
                    <div key={requestId} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="text-sm font-medium text-gray-900">Request #{request?.id}</h6>
                        <span className="text-xs text-gray-500">{request?.date}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div><strong>Location:</strong> {request?.location}</div>
                        <div><strong>Beneficiaries:</strong> {request?.count}</div>
                        <div className="col-span-2"><strong>Items:</strong> {request?.items}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Execution Checklist */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Pre-Distribution Checklist</h5>
              <div className="space-y-3">
                <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" className="rounded text-red-600 mr-3" />
                  <span className="text-sm font-medium">Transport vehicle arranged and fueled</span>
                </label>
                <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" className="rounded text-red-600 mr-3" />
                  <span className="text-sm font-medium">Distribution staff assigned and briefed</span>
                </label>
                <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" className="rounded text-red-600 mr-3" />
                  <span className="text-sm font-medium">Beneficiaries notified of distribution schedule</span>
                </label>
                <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" className="rounded text-red-600 mr-3" />
                  <span className="text-sm font-medium">Distribution site prepared and secured</span>
                </label>
                <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" className="rounded text-red-600 mr-3" />
                  <span className="text-sm font-medium">Distribution forms and documentation ready</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Staff Notes & Justification
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
                      {step === 1 ? 'Generate Plan' : 'Review & Submit'}
                      <HiTrendingUp className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleDistribute}
                      className="flex-1 sm:flex-none px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      <HiCheckCircle className="w-4 h-4 mr-2" />
                      Execute Distribution Plan
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
