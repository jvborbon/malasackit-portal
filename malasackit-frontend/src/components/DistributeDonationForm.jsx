import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  HiX,
  HiLocationMarker,
  HiUsers,
  HiTrendingUp,
  HiLightBulb,
  HiExclamation,
  HiCheckCircle,
  HiRefresh,
  HiChartBar,
} from "react-icons/hi";
import beneficiaryService from "../services/beneficiaryService";
import { getAllInventory } from "../services/inventoryService";
import { HiSparkles } from "react-icons/hi";

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
  const [pendingRequests, setPendingRequests] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [formData, setFormData] = useState({
    selectedRequests: [],
    distributionDate: "",
    notes: "",
    distributionPlan: {},
    selectedDistribution: {},
    requests: {},
  });
  const [inventoryInsights, setInventoryInsights] = useState(null);
  const [loadingInventoryInsights, setLoadingInventoryInsights] =
    useState(false);

  const [aggregatedRequestItems, setAggregatedRequestItems] = useState([]);

  // Filter inventory data by selected category
  const safeInventoryData = inventoryData || [];
  const filteredInventoryData =
    selectedCategory === "all"
      ? safeInventoryData
      : safeInventoryData.filter((item) => item.category === selectedCategory);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPendingRequests();
      loadInventoryData();
    } else {
      setStep(1);
      setFormData({
        selectedRequests: [],
        distributionDate: "",
        notes: "",
        distributionPlan: {},
        selectedDistribution: {},
        requests: {},
      });
      setPendingRequests([]);
      setInventoryData([]);
    }
  }, [isOpen]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await beneficiaryService.getAllBeneficiaryRequests({
        status: "Pending",
      });
      if (response.success) {
        setPendingRequests(response.data || []);
      }
    } catch (error) {
      console.error("Error loading pending requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryData = async () => {
    try {
      setInventoryLoading(true);
      const response = await getAllInventory();
      console.log("Inventory API response:", response); // Debug log

      if (response.success && response.data && response.data.inventory) {
        // Transform inventory data to include status and safe distribution amounts
        const transformedData = response.data.inventory.map((item) => {
          const current = parseInt(item.quantity_available) || 0;
          const threshold = 10; // Default minimum threshold
          const safeToDistribute = Math.max(0, current - threshold);

          let status = "safe";
          if (current <= threshold) {
            status = "critical";
          } else if (current <= threshold * 2) {
            status = "low";
          }

          return {
            name: item.itemtype_name || item.name,
            current: current,
            threshold: threshold,
            safeToDistribute: safeToDistribute,
            status: status,
            category: item.category_name,
            location: item.location,
          };
        });
        setInventoryData(transformedData);

        // Extract unique categories for filter
        const categories = [
          ...new Set(
            transformedData.map((item) => item.category).filter(Boolean)
          ),
        ];
        setAvailableCategories(categories);

        console.log("Transformed inventory data:", transformedData); // Debug log
        console.log("Available categories:", categories); // Debug log
      } else {
        console.log("No inventory data found in response:", response);
        setInventoryData([]);
      }
    } catch (error) {
      console.error("Error loading inventory data:", error);
      // Fallback to empty array if service doesn't exist
      setInventoryData([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Sample prescriptive analytics data
  const locations = [
    {
      id: 1,
      name: "Quezon City",
      population: 2936116,
      priority: "high",
      demand: 85,
    },
    {
      id: 2,
      name: "Manila City",
      population: 1780148,
      priority: "high",
      demand: 78,
    },
    {
      id: 3,
      name: "Makati City",
      population: 629616,
      priority: "medium",
      demand: 65,
    },
    {
      id: 4,
      name: "Pasig City",
      population: 755300,
      priority: "medium",
      demand: 58,
    },
    {
      id: 5,
      name: "Taguig City",
      population: 886722,
      priority: "low",
      demand: 42,
    },
  ];

  // Smart algorithm-generated optimal distribution recommendations
  const distributionRecommendations = {
    "Quezon City": {
      food: 40,
      medical: 30,
      clothing: 15,
      education: 10,
      others: 5,
    },
    "Manila City": {
      food: 35,
      medical: 35,
      clothing: 15,
      education: 10,
      others: 5,
    },
    "Makati City": {
      food: 25,
      medical: 25,
      clothing: 25,
      education: 20,
      others: 5,
    },
    "Pasig City": {
      food: 30,
      medical: 25,
      clothing: 20,
      education: 20,
      others: 5,
    },
    "Taguig City": {
      food: 20,
      medical: 30,
      clothing: 20,
      education: 25,
      others: 5,
    },
  };

  // Inventory data is now loaded from state

  // Ensure data is valid for charts
  // Ensure data is valid for charts - Use filteredInventoryData instead of inventoryData
  const chartInventoryData = filteredInventoryData.filter(
    (item) =>
      item &&
      typeof item.current === "number" &&
      typeof item.threshold === "number"
  );

  const currentInventory = {
    labels: chartInventoryData.map((item) => item.name || "Unknown"),
    datasets: [
      {
        label: "Current Stock",
        data: chartInventoryData.map((item) => item.current || 0),
        backgroundColor: chartInventoryData.map((item) =>
          item.status === "safe"
            ? "rgba(34, 197, 94, 0.8)"
            : item.status === "low"
            ? "rgba(251, 191, 36, 0.8)"
            : "rgba(239, 68, 68, 0.8)"
        ),
        borderColor: chartInventoryData.map((item) =>
          item.status === "safe"
            ? "rgba(34, 197, 94, 1)"
            : item.status === "low"
            ? "rgba(251, 191, 36, 1)"
            : "rgba(239, 68, 68, 1)"
        ),
        borderWidth: 2,
      },
      {
        label: "Minimum Threshold",
        data: chartInventoryData.map((item) => item.threshold || 0),
        backgroundColor: "rgba(107, 114, 128, 0.5)",
        borderColor: "rgba(107, 114, 128, 1)",
        borderWidth: 2,
      },
    ],
  };

  const getOptimalDistribution = (location) => {
    const recommendation = distributionRecommendations[location] || {};
    return {
      labels: [
        "Food Items",
        "Medical Supplies",
        "Clothing",
        "Educational Materials",
        "Others",
      ],
      datasets: [
        {
          label: "Recommended Distribution (%)",
          data: [
            recommendation.food || 30,
            recommendation.medical || 25,
            recommendation.clothing || 20,
            recommendation.education || 15,
            recommendation.others || 10,
          ],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(168, 85, 247, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(107, 114, 128, 0.8)",
          ],
          borderColor: [
            "rgba(34, 197, 94, 1)",
            "rgba(59, 130, 246, 1)",
            "rgba(168, 85, 247, 1)",
            "rgba(251, 191, 36, 1)",
            "rgba(107, 114, 128, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y} units`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantity (units)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Item Categories",
        },
      },
    },
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRequestChange = (itemName, value) => {
    setFormData((prev) => ({
      ...prev,
      requests: {
        ...prev.requests,
        [itemName]: parseInt(value) || 0,
      },
    }));
  };

  const handleRequestSelection = (requestId) => {
    const newSelectedRequests = formData.selectedRequests?.includes(requestId)
      ? formData.selectedRequests.filter((id) => id !== requestId)
      : [...(formData.selectedRequests || []), requestId];

    setFormData((prev) => ({ ...prev, selectedRequests: newSelectedRequests }));

    // Aggregate requested items from selected requests
    aggregateRequestedItems(newSelectedRequests);
  };

  // Add this function to generate insights
  const generateInventoryInsights = async () => {
    setLoadingInventoryInsights(true);

    try {
      // Prepare inventory data for analysis
      const inventoryAnalysisData = filteredInventoryData.map((item) => ({
        name: item.name,
        current: item.current,
        threshold: item.threshold,
        safeToDistribute: item.safeToDistribute,
        status: item.status,
        category: item.category,
      }));

      const context = `Analyzing inventory levels for ${
        filteredInventoryData.length
      } items. 
      ${
        selectedCategory === "all"
          ? "All categories included"
          : `Filtering by ${selectedCategory} category`
      }.
      Total items with safe distribution levels: ${
        filteredInventoryData.filter((i) => i.status === "safe").length
      }.
      Critical/low stock items: ${
        filteredInventoryData.filter((i) => i.status !== "safe").length
      }.`;

      const response = await fetch(
        "http://localhost:3000/api/generate-insights",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chartType: "Current Inventory Overview",
            data: inventoryAnalysisData,
            context: context,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate insights");

      const result = await response.json();
      setInventoryInsights(result.insights);
    } catch (error) {
      console.error("Error generating inventory insights:", error);
      setInventoryInsights("Failed to generate insights. Please try again.");
    } finally {
      setLoadingInventoryInsights(false);
    }
  };

  const aggregateRequestedItems = (selectedRequestIds) => {
    if (!selectedRequestIds.length) {
      setAggregatedRequestItems([]);
      setFormData((prev) => ({ ...prev, requests: {} }));
      return;
    }

    // Get selected requests with their items
    const selectedRequests = pendingRequests.filter((req) =>
      selectedRequestIds.includes(req.request_id)
    );

    // Aggregate items by itemtype_name
    const itemAggregation = {};
    const requestContext = {}; // Track which beneficiaries requested which items

    selectedRequests.forEach((request) => {
      if (request.items && request.items.length > 0) {
        request.items.forEach((item) => {
          const itemName = item.itemtype_name;
          const quantity = parseInt(item.quantity_requested) || 0;

          if (!itemAggregation[itemName]) {
            itemAggregation[itemName] = {
              itemtype_name: itemName,
              total_requested: 0,
              urgency_levels: [],
              beneficiaries: [],
              item_details: item,
            };
            requestContext[itemName] = [];
          }

          itemAggregation[itemName].total_requested += quantity;
          itemAggregation[itemName].urgency_levels.push(request.urgency);
          itemAggregation[itemName].beneficiaries.push(
            request.beneficiary_name
          );
          requestContext[itemName].push({
            beneficiary: request.beneficiary_name,
            quantity: quantity,
            urgency: request.urgency,
            request_id: request.request_id,
          });
        });
      }
    });

    // Convert to array and sort by urgency priority
    const aggregatedItems = Object.values(itemAggregation)
      .map((item) => {
        const urgencyPriority = {
          Critical: 3,
          High: 2,
          Medium: 1,
          Low: 0,
        };

        const maxUrgency = item.urgency_levels.reduce(
          (max, current) =>
            urgencyPriority[current] > urgencyPriority[max] ? current : max,
          "Low"
        );

        return {
          ...item,
          max_urgency: maxUrgency,
          unique_beneficiaries: [...new Set(item.beneficiaries)],
          context: requestContext[item.itemtype_name],
        };
      })
      .sort((a, b) => {
        const urgencyPriority = { Critical: 3, High: 2, Medium: 1, Low: 0 };
        return urgencyPriority[b.max_urgency] - urgencyPriority[a.max_urgency];
      });

    setAggregatedRequestItems(aggregatedItems);

    // Pre-populate the requests form data with aggregated quantities
    const newRequests = {};
    aggregatedItems.forEach((item) => {
      newRequests[item.itemtype_name] = item.total_requested;
    });

    setFormData((prev) => ({ ...prev, requests: newRequests }));
  };

  const handleDistribute = () => {
    // Handle distribution logic here
    console.log("Distribution data:", formData);
    alert("Distribution plan created successfully!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Darkened Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-6xl max-h-[90vh] transform transition-all duration-300 scale-100 z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <HiLightBulb className="w-6 h-6 text-red-600 mr-3" />
              Create Distribution Plan
            </h3>
            <p className="text-gray-600 mt-1">
              Plan distribution for approved beneficiary requests.
            </p>
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
                            ? "bg-red-600 text-white shadow-lg transform scale-110"
                            : "bg-white text-gray-400 border-2 border-gray-300"
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
                          step > stepNum ? "bg-red-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs sm:text-sm px-2">
                <span
                  className={`font-medium transition-colors text-center ${
                    step >= 1 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  Select Requests
                </span>
                <span
                  className={`font-medium transition-colors text-center ${
                    step >= 2 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  Plan Distribution
                </span>
                <span
                  className={`font-medium transition-colors text-center ${
                    step >= 3 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  Execute Plan
                </span>
              </div>
            </div>

            {/* Step 1: Select Pending Requests */}

            {/* Inventory Overview Chart - Added before Step 1 */}
            {step === 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <HiChartBar className="w-5 h-5 text-blue-600 mr-2" />
                      Current Inventory Overview
                    </h4>
                    <p className="text-sm text-gray-600">
                      Real-time stock levels across all item categories
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Filter:</span>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        <option value="all">All Categories</option>
                        {availableCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Generate AI Insights Button */}
                    <button
                      onClick={generateInventoryInsights}
                      disabled={
                        loadingInventoryInsights ||
                        filteredInventoryData.length === 0
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-lg"
                    >
                      {loadingInventoryInsights ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <HiSparkles className="w-4 h-4" />
                          <span>Generate Insights</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-64 flex items-center justify-center">
                  {inventoryLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <span className="ml-2 text-gray-600">
                        Loading inventory...
                      </span>
                    </div>
                  ) : filteredInventoryData.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <HiChartBar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="font-medium">No inventory data available</p>
                      <p className="text-sm">
                        {selectedCategory === "all"
                          ? "Start by adding donations to build inventory"
                          : `No items found in ${selectedCategory} category`}
                      </p>
                    </div>
                  ) : (
                    <Bar data={currentInventory} options={barChartOptions} />
                  )}
                </div>

                {/* AI Insights Display */}
                {inventoryInsights && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-start space-x-3">
                      <HiLightBulb className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-900 mb-2 text-lg">
                          AI-Powered Inventory Insights
                        </h4>
                        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {inventoryInsights}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory Legend */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span className="text-gray-600">
                        Safe Stock (Available for distribution)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                      <span className="text-gray-600">
                        Low Stock (Limited availability)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                      <span className="text-gray-600">
                        Critical Stock (Below threshold)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
                      <span className="text-gray-600">Minimum Threshold</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                          Select beneficiary requests that are ready for
                          distribution planning.
                        </p>
                      </div>

                      {/* Pending requests from database */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            <span className="ml-2 text-gray-600">
                              Loading requests...
                            </span>
                          </div>
                        ) : pendingRequests.length === 0 ? (
                          <div className="text-center py-8">
                            <HiExclamation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                              No pending beneficiary requests found
                            </p>
                            <button
                              onClick={loadPendingRequests}
                              className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium flex items-center mx-auto"
                            >
                              <HiRefresh className="w-4 h-4 mr-1" />
                              Refresh
                            </button>
                          </div>
                        ) : (
                          pendingRequests.map((request) => (
                            <div
                              key={request.request_id}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                formData.selectedRequests?.includes(
                                  request.request_id
                                )
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() =>
                                handleRequestSelection(request.request_id)
                              }
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      formData.selectedRequests?.includes(
                                        request.request_id
                                      ) || false
                                    }
                                    onChange={() =>
                                      handleRequestSelection(request.request_id)
                                    }
                                    className="mr-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                  <div>
                                    <h5 className="font-semibold text-gray-900">
                                      {request.beneficiary_name}
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                      Request #{request.request_id}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      request.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : request.status === "Approved"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {request.status}
                                  </span>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      request.urgency === "Critical"
                                        ? "bg-red-100 text-red-800"
                                        : request.urgency === "High"
                                        ? "bg-orange-100 text-orange-800"
                                        : request.urgency === "Medium"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {request.urgency} Priority
                                  </span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>
                                  <strong>Purpose:</strong> {request.purpose}
                                </div>
                                <div>
                                  <strong>Beneficiary Type:</strong>{" "}
                                  {request.beneficiary_type || "N/A"}
                                </div>
                                {request.items && request.items.length > 0 ? (
                                  <div>
                                    <strong>Requested Items:</strong>
                                    <div className="mt-1 space-y-1">
                                      {request.items
                                        .slice(0, 3)
                                        .map((item, index) => (
                                          <div
                                            key={index}
                                            className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded"
                                          >
                                            <span>{item.itemtype_name}</span>
                                            <span className="font-medium">
                                              Qty: {item.quantity_requested}
                                            </span>
                                          </div>
                                        ))}
                                      {request.items.length > 3 && (
                                        <div className="text-xs text-gray-500 italic">
                                          ...and {request.items.length - 3} more
                                          items
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <strong>Type:</strong> General assistance
                                    request
                                  </div>
                                )}
                                <div>
                                  <strong>Requested Date:</strong>{" "}
                                  {new Date(
                                    request.request_date
                                  ).toLocaleDateString()}
                                </div>
                                {request.address && (
                                  <div>
                                    <strong>Address:</strong> {request.address}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Needs Assessment Form */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <HiExclamation className="w-5 h-5 text-yellow-600 mr-2" />
                      Assessed Needs
                      {formData.selectedRequests?.length > 0 && (
                        <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Based on {formData.selectedRequests.length} selected
                          request
                          {formData.selectedRequests.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </h4>

                    {formData.selectedRequests?.length === 0 ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800 flex items-center">
                          <HiExclamation className="w-4 h-4 mr-2 flex-shrink-0" />
                          Select beneficiary requests above to automatically
                          populate assessed needs based on actual requests.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-green-800 flex items-center">
                          <HiCheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          Showing aggregated needs from selected beneficiary
                          requests. You can adjust quantities based on your
                          assessment.
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {aggregatedRequestItems.length > 0 ? (
                        aggregatedRequestItems.map((requestItem, index) => {
                          // Find matching inventory item for current stock info
                          const inventoryItem = safeInventoryData.find(
                            (inv) => inv.name === requestItem.itemtype_name
                          );
                          const currentStock = inventoryItem
                            ? inventoryItem.current
                            : 0;
                          const stockStatus = inventoryItem
                            ? inventoryItem.status
                            : "unknown";

                          return (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-4 bg-white"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900">
                                      {requestItem.itemtype_name}
                                    </span>
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        requestItem.max_urgency === "Critical"
                                          ? "bg-red-100 text-red-800"
                                          : requestItem.max_urgency === "High"
                                          ? "bg-orange-100 text-orange-800"
                                          : requestItem.max_urgency === "Medium"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {requestItem.max_urgency} Priority
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Requested by:{" "}
                                    {requestItem.unique_beneficiaries
                                      .slice(0, 3)
                                      .join(", ")}
                                    {requestItem.unique_beneficiaries.length >
                                      3 && (
                                      <span>
                                        {" "}
                                        and{" "}
                                        {requestItem.unique_beneficiaries
                                          .length - 3}{" "}
                                        more
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    stockStatus === "safe"
                                      ? "bg-green-100 text-green-800"
                                      : stockStatus === "low"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : stockStatus === "critical"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  Current Stock: {currentStock}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3">
                                <label className="text-sm text-gray-600 w-24">
                                  Assessed:
                                </label>
                                <input
                                  type="number"
                                  placeholder={requestItem.total_requested.toString()}
                                  min="0"
                                  value={
                                    formData.requests?.[
                                      requestItem.itemtype_name
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleRequestChange(
                                      requestItem.itemtype_name,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                <span className="text-sm text-gray-500 w-16">
                                  units
                                </span>
                              </div>

                              {/* Request Details */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="text-xs text-gray-600">
                                  <div className="font-medium mb-1">
                                    Request Breakdown:
                                  </div>
                                  <div className="space-y-1">
                                    {requestItem.context
                                      .slice(0, 2)
                                      .map((ctx, ctxIndex) => (
                                        <div
                                          key={ctxIndex}
                                          className="flex justify-between"
                                        >
                                          <span>
                                            {ctx.beneficiary} (#{ctx.request_id}
                                            )
                                          </span>
                                          <span className="font-medium">
                                            {ctx.quantity} units
                                          </span>
                                        </div>
                                      ))}
                                    {requestItem.context.length > 2 && (
                                      <div className="text-gray-500 italic">
                                        ...and {requestItem.context.length - 2}{" "}
                                        more requests
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-50 font-medium">
                                    Total Requested:{" "}
                                    {requestItem.total_requested} units
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 text-xs">
                                {currentStock >= requestItem.total_requested ? (
                                  <span className="text-green-600 font-medium">
                                    ✓ Sufficient stock available
                                  </span>
                                ) : currentStock > 0 ? (
                                  <span className="text-yellow-600 font-medium">
                                    ⚠ Partial fulfillment possible (
                                    {currentStock} available)
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-medium">
                                    ❌ Out of stock - requires procurement
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : formData.selectedRequests?.length > 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <HiExclamation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p>
                            Selected requests don't have specific item
                            requirements.
                          </p>
                          <p className="text-sm">
                            These may be general assistance requests.
                          </p>
                        </div>
                      ) : (
                        filteredInventoryData.map((item, index) => (
                          <div
                            key={index}
                            className="border border-gray-100 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">
                                {item.name}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === "safe"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "low"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                Current Stock: {item.current}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <label className="text-sm text-gray-600 w-24">
                                Requested:
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                min="0"
                                value={formData.requests?.[item.name] || ""}
                                onChange={(e) =>
                                  handleRequestChange(item.name, e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              />
                              <span className="text-sm text-gray-500 w-16">
                                units
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Priority:{" "}
                              {item.status === "safe"
                                ? "Available for distribution"
                                : item.status === "low"
                                ? "Limited availability"
                                : "Not recommended - low stock"}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Create Distribution Plan */}
            {step === 2 &&
              formData.selectedRequests &&
              formData.selectedRequests.length > 0 && (
                <div className="space-y-8">
                  {/* Distribution Plan Header */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <HiLightBulb className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-blue-900">
                          Distribution Planning
                        </h4>
                        <p className="text-blue-700 text-sm mt-1">
                          Create distribution plan for{" "}
                          {formData.selectedRequests?.length || 0} selected
                          beneficiary requests
                        </p>
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
                        {/* Show items based on requests or inventory */}
                        {(aggregatedRequestItems.length > 0
                          ? aggregatedRequestItems
                          : filteredInventoryData
                        ).map((item, index) => {
                          const itemName = item.itemtype_name || item.name;
                          const requested = formData.requests[itemName] || 0;

                          // Find corresponding inventory item for stock info
                          const inventoryItem =
                            aggregatedRequestItems.length > 0
                              ? safeInventoryData.find(
                                  (inv) => inv.name === itemName
                                )
                              : item;

                          const available = inventoryItem
                            ? inventoryItem.current
                            : 0;
                          const safeToDistribute = inventoryItem
                            ? inventoryItem.safeToDistribute
                            : 0;
                          const recommended = Math.min(
                            requested,
                            safeToDistribute,
                            available
                          );
                          const canFulfill = recommended === requested;

                          return (
                            <div
                              key={index}
                              className="border border-gray-100 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-900">
                                    {itemName}
                                  </span>
                                  {item.max_urgency && (
                                    <span
                                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                        item.max_urgency === "Critical"
                                          ? "bg-red-100 text-red-800"
                                          : item.max_urgency === "High"
                                          ? "bg-orange-100 text-orange-800"
                                          : item.max_urgency === "Medium"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {item.max_urgency} Priority
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    canFulfill
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {canFulfill ? "FULL MATCH" : "PARTIAL"}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Requested:
                                  </span>
                                  <span className="font-medium">
                                    {requested} units
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Available:
                                  </span>
                                  <span className="font-medium">
                                    {available} units
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Recommended:
                                  </span>
                                  <span
                                    className={`font-bold ${
                                      recommended > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {recommended} units
                                  </span>
                                </div>
                                {requested > 0 && recommended < requested && (
                                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                                    ⚠ Shortfall: {requested - recommended} units
                                    -{" "}
                                    {available < requested
                                      ? "Insufficient stock"
                                      : "Below safety threshold"}
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
                      <h4 className="text-lg font-semibold text-gray-900 mb-6">
                        Stock vs Distribution Plan
                      </h4>
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
                  <h4 className="text-lg font-semibold text-green-900 mb-6">
                    Execute Distribution Plan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Requests
                      </label>
                      <p className="text-gray-900 font-medium">
                        {formData.selectedRequests?.length || 0} requests
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distribution Date
                      </label>
                      <input
                        type="date"
                        value={formData.distributionDate}
                        onChange={(e) =>
                          handleInputChange("distributionDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <p className="text-gray-900 font-medium">
                        Ready for Execution
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Requests Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-4">
                    Selected Requests Summary
                  </h5>
                  <div className="space-y-4">
                    {formData.selectedRequests?.map((requestId) => {
                      const request = pendingRequests.find(
                        (r) => r.request_id === requestId
                      );
                      return (
                        <div
                          key={requestId}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="text-sm font-medium text-gray-900">
                              Request #{request?.request_id}
                            </h6>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                request?.request_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Beneficiary:</strong>{" "}
                              {request?.beneficiary_name}
                            </div>
                            <div>
                              <strong>Priority:</strong> {request?.urgency}
                            </div>
                            <div className="col-span-2">
                              <strong>Purpose:</strong> {request?.purpose}
                            </div>
                            {request?.items && request.items.length > 0 && (
                              <div className="col-span-2">
                                <strong>Items:</strong>{" "}
                                {request.items
                                  .map(
                                    (item) =>
                                      `${item.itemtype_name} (${item.quantity_requested})`
                                  )
                                  .join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Execution Checklist */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-4">
                    Pre-Distribution Checklist
                  </h5>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        className="rounded text-red-600 mr-3"
                      />
                      <span className="text-sm font-medium">
                        Transport vehicle arranged and fueled
                      </span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        className="rounded text-red-600 mr-3"
                      />
                      <span className="text-sm font-medium">
                        Distribution staff assigned and briefed
                      </span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        className="rounded text-red-600 mr-3"
                      />
                      <span className="text-sm font-medium">
                        Beneficiaries notified of distribution schedule
                      </span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        className="rounded text-red-600 mr-3"
                      />
                      <span className="text-sm font-medium">
                        Distribution site prepared and secured
                      </span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        className="rounded text-red-600 mr-3"
                      />
                      <span className="text-sm font-medium">
                        Distribution forms and documentation ready
                      </span>
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
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add any special instructions or notes for the distribution..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h5 className="font-medium text-blue-900 mb-4">
                    Final Recommendations
                  </h5>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Prioritize food items and medical supplies based on high
                        demand
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Schedule distribution between 9AM - 3PM for optimal
                        reach
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Coordinate with local barangay officials for smooth
                        execution
                      </span>
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
                onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 font-medium flex items-center justify-center"
              >
                <HiX className="w-4 h-4 mr-2" />
                {step === 1 ? "Cancel" : "Previous"}
              </button>

              <div className="flex space-x-3 w-full sm:w-auto">
                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={
                      step === 1 &&
                      (!formData.selectedRequests?.length || formData.selectedRequests.length === 0)
                    }
                    className="flex-1 sm:flex-none px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                  >
                    {step === 1 ? "Generate Plan" : "Review & Submit"}
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
