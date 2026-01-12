import React, { useState, useEffect, useCallback } from "react";
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
import { getAllInventory, getAllCategories } from "../services/inventoryService";
import distributionService from "../services/distributionService";
import { HiSparkles } from "react-icons/hi";
import SuccessModal from "./common/SuccessModal";
import { useSuccessModal } from "../hooks/useSuccessModal";
import { getAllSafetyThresholds, getSafetyThresholdSync, getFullThresholdSync } from "../utils/safetyThresholds";

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
  const [chartPage, setChartPage] = useState(1);
  const [itemsPerPage] = useState(20);
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
  const [safetyThresholds, setSafetyThresholds] = useState({});
  
  // Success modal hook
  const { isOpen: isSuccessOpen, modalData: successData, showSuccess, hideSuccess } = useSuccessModal();
  
  // Custom success modal close handler that also closes the parent modal
  const handleSuccessModalClose = useCallback(() => {
    console.log('🔴 Success modal closing...');
    hideSuccess();
    onClose(); // Close the parent DistributeDonationForm modal
  }, [hideSuccess, onClose]);

  const [aggregatedRequestItems, setAggregatedRequestItems] = useState([]);

  // Load safety thresholds from backend
  const loadSafetyThresholds = async () => {
    try {
      const thresholds = await getAllSafetyThresholds();
      setSafetyThresholds(thresholds);
      console.log("Loaded safety thresholds:", thresholds);
    } catch (error) {
      console.error("Error loading safety thresholds:", error);
      // Set empty object, will fall back to defaults
      setSafetyThresholds({});
    }
  };

  // Filter inventory data by selected category
  const safeInventoryData = inventoryData || [];
  const filteredInventoryData =
    selectedCategory === "all"
      ? safeInventoryData
      : safeInventoryData.filter((item) => item.category === selectedCategory);
  
  // Calculate pagination for chart
  const totalPages = Math.ceil(filteredInventoryData.length / itemsPerPage);
  const startIndex = (chartPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInventoryData = filteredInventoryData.slice(startIndex, endIndex);
  
  // Reset to page 1 when category changes
  useEffect(() => {
    setChartPage(1);
  }, [selectedCategory]);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load safety thresholds first, then other data
      loadSafetyThresholds().then(() => {
        loadPendingRequests();
        loadInventoryData();
        loadCategories(); // Load all categories from database
      });
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
      
      // Fetch both beneficiary requests and distribution plans in parallel
      const [requestsResponse, draftPlansResponse] = await Promise.all([
        beneficiaryService.getAllBeneficiaryRequests({
          // Load only approved requests that haven't been fulfilled yet
          exclude_status: 'Fulfilled'
        }),
        distributionService.getDraftPlans()
      ]);
      
      if (requestsResponse.success) {
        // Additional client-side filtering to ensure we only show approved, non-fulfilled requests
        const approvedRequests = (requestsResponse.data || []).filter(request => 
          request.status === 'Approved' && request.status !== 'Fulfilled'
        );
        
        // Get request IDs that already have draft distribution plans
        const requestsWithDraftPlans = new Set();
        if (draftPlansResponse.success && draftPlansResponse.data) {
          draftPlansResponse.data.forEach(plan => {
            if (plan.request_id) {
              requestsWithDraftPlans.add(plan.request_id);
            }
          });
        }
        
        // Filter out requests that already have draft distribution plans
        const availableRequests = approvedRequests.filter(request => 
          !requestsWithDraftPlans.has(request.request_id)
        );
        
        console.log('Filtered requests:', {
          total_approved: approvedRequests.length,
          with_draft_plans: requestsWithDraftPlans.size,
          available_for_distribution: availableRequests.length
        });
        
        setPendingRequests(availableRequests);
      }
    } catch (error) {
      console.error("Error loading beneficiary requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryData = async () => {
    try {
      setInventoryLoading(true);
      // Request ALL inventory items (no pagination) for distribution planning
      const response = await getAllInventory({ limit: 1000 });
      console.log("Inventory API response:", response); // Debug log
      console.log("Raw inventory items:", response.data?.inventory); // Debug raw data

      if (response.success && response.data && response.data.inventory) {
        // Transform inventory data to include status and safe distribution amounts
        const transformedData = response.data.inventory.map((item) => {
          const current = parseInt(item.quantity_available) || 0;
          const thresholds = getFullThresholdSync(safetyThresholds, item.itemtype_name);
          const safeToDistribute = Math.max(0, current - thresholds.critical);

          let status = "optimal";
          let statusColor = "green";
          
          if (current > thresholds.max) {
            status = "overstocked";
            statusColor = "orange";
          } else if (current >= thresholds.reorder && current <= thresholds.max) {
            status = "optimal";
            statusColor = "green";
          } else if (current >= thresholds.critical && current < thresholds.reorder) {
            status = "low";
            statusColor = "yellow";
          } else {
            status = "critical";
            statusColor = "red";
          }

          return {
            // Keep original inventory fields for distribution matching  
            inventory_id: item.inventory_id,
            itemtype_id: item.itemtype_id,
            itemtype_name: item.itemtype_name || item.name,
            quantity_available: current,
            unit_value: item.unit_value,
            category_name: item.category_name,
            location: item.location,
            
            // Add display fields for UI
            name: item.itemtype_name || item.name,
            current: current,
            threshold: thresholds.critical,
            thresholds: thresholds,
            safeToDistribute: safeToDistribute,
            status: status,
            statusColor: statusColor,
            percentOfMax: thresholds.max > 0 ? Math.round((current / thresholds.max) * 100) : 0,
            category: item.category_name,
          };
        });
        setInventoryData(transformedData);

        console.log("Transformed inventory data:", transformedData); // Debug log
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

  // Load all categories from database (including categories with items that have 0 quantity)
  const loadCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.success && response.data && response.data.categories) {
        // Extract category names from the categories array
        const categories = response.data.categories.map(cat => cat.category_name);
        setAvailableCategories(categories.sort());
        console.log("Available categories:", categories); // Debug log
      }
    } catch (error) {
      console.error("Error loading categories:", error);
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
  // Use paginated data for chart display
  const chartInventoryData = paginatedInventoryData.filter(
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
        backgroundColor: chartInventoryData.map((item) => {
          if (item.status === "overstocked") {
            return "rgba(249, 115, 22, 0.8)"; // Orange for overstocked
          } else if (item.status === "optimal") {
            return "rgba(34, 197, 94, 0.85)"; // Green for optimal
          } else if (item.status === "low") {
            return "rgba(251, 191, 36, 0.8)"; // Yellow for low
          } else {
            return "rgba(239, 68, 68, 0.8)"; // Red for critical
          }
        }),
        borderColor: chartInventoryData.map((item) => {
          if (item.status === "overstocked") {
            return "rgba(249, 115, 22, 1)";
          } else if (item.status === "optimal") {
            return "rgba(34, 197, 94, 1)";
          } else if (item.status === "low") {
            return "rgba(251, 191, 36, 1)";
          } else {
            return "rgba(239, 68, 68, 1)";
          }
        }),
        borderWidth: 2,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 40
      },
      {
        label: "Critical Threshold",
        data: chartInventoryData.map((item) => item.threshold || 0),
        backgroundColor: "rgba(107, 114, 128, 0.3)",
        borderColor: "rgba(107, 114, 128, 0.8)",
        borderWidth: 2,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 40
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
        position: 'top',
        labels: {
          font: {
            size: 13,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()} units`;
          },
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex;
            const item = chartInventoryData[dataIndex];
            
            if (!item) return '';
            
            const thresholds = item.thresholds || {};
            const currentStock = item.current || 0;
            
            let statusText = '';
            if (item.status === 'overstocked') {
              statusText = '\n⚠️ Overstocked - Exceeds warehouse capacity';
            } else if (item.status === 'optimal') {
              statusText = '\n✓ Optimal Stock Level';
            } else if (item.status === 'low') {
              statusText = '\n⚠ Low Stock - Below reorder point';
            } else if (item.status === 'critical') {
              statusText = '\n🔴 Critical - Below safety buffer';
            }
            
            if (thresholds.max) {
              statusText += `\nCapacity: ${item.percentOfMax || 0}% of max (${thresholds.max})`;
            }
            
            return statusText;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#374151',
          stepSize: 200,
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Quantity (units)',
          font: {
            size: 13,
            weight: '600'
          },
          color: '#111827',
          padding: { top: 10, bottom: 10 }
        }
      },
      x: {
        ticks: {
          font: {
            size: 10,
            weight: '500'
          },
          color: '#374151',
          maxRotation: 90,
          minRotation: 90,
          autoSkip: true,
          maxTicksLimit: 50,
          padding: 5
        },
        grid: {
          display: false,
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Item Categories',
          font: {
            size: 13,
            weight: '600'
          },
          color: '#111827',
          padding: { top: 10 }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
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

  // Enhanced function to generate contextual insights based on assessed needs
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

      // Include assessed needs context if available
      const assessedNeedsContext = aggregatedRequestItems.length > 0 
        ? `\n\nASSESSED NEEDS ANALYSIS:
        Selected ${formData.selectedRequests?.length || 0} beneficiary requests.
        Total assessed needs: ${aggregatedRequestItems.map(item => 
          `${item.itemtype_name}: ${item.total_requested} units (${item.max_urgency} priority)`
        ).join(', ')}.
        
        FULFILLMENT ANALYSIS:
        ${aggregatedRequestItems.map(item => {
          const inventoryItem = inventoryAnalysisData.find(inv => inv.name === item.itemtype_name);
          const currentStock = inventoryItem?.current || 0;
          const canFulfill = currentStock >= item.total_requested;
          // Calculate flexible threshold based on urgency
          const baseThreshold = inventoryItem?.threshold || 10;
          const urgencyMultiplier = item.max_urgency === 'Critical' ? 0.5 : 
                                   item.max_urgency === 'High' ? 0.7 : 
                                   item.max_urgency === 'Medium' ? 0.8 : 1.0;
          const flexibleThreshold = Math.floor(baseThreshold * urgencyMultiplier);
          const safeToDistribute = Math.max(0, currentStock - flexibleThreshold);
          const canFulfillWithFlexibility = safeToDistribute >= item.total_requested;
          
          return `${item.itemtype_name}: ${canFulfill ? '✓ Can fulfill' : canFulfillWithFlexibility ? '⚡ Can fulfill with urgency override' : '⚠ Shortage'} (${currentStock} available vs ${item.total_requested} requested, flexible threshold: ${flexibleThreshold})`;
        }).join(', ')}.`
        : '';

      const context = `INVENTORY DISTRIBUTION ASSESSMENT:
      Analyzing inventory levels for ${filteredInventoryData.length} items. 
      ${selectedCategory === "all" ? "All categories included" : `Filtering by ${selectedCategory} category`}.
      
      STOCK STATUS:
      Optimal stock levels: ${filteredInventoryData.filter((i) => i.status === "optimal").length} items.
      Caution levels (approaching threshold): ${filteredInventoryData.filter((i) => i.status === "caution").length} items.
      Advisory levels (below threshold but available): ${filteredInventoryData.filter((i) => i.status === "advisory").length} items.
      ${assessedNeedsContext}
      
      
      SAFETY THRESHOLD CONTEXT:
      Safety thresholds serve as advisory guidelines to maintain emergency reserves. The system uses an advisory-only approach:
      - Thresholds provide warnings but do not block distributions
      - Staff can proceed with distributions based on professional judgment
      - Warnings help maintain awareness of emergency reserve levels
      - Critical situations can be addressed immediately without system restrictions
      
      Please provide practical distribution recommendations focusing on optimization and alternatives rather than threshold adjustments. Assume distributions can proceed and focus on suggesting the most effective allocation strategies.`;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('🔵 Generating insights - API URL:', apiUrl);
      
      const response = await fetch(
        `${apiUrl}/api/generate-insights`,
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

      console.log('🔵 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || errorData.details || "Failed to generate insights");
      }

      const result = await response.json();
      console.log('✅ Insights generated successfully');
      setInventoryInsights(result.insights);
    } catch (error) {
      console.error("❌ Error generating inventory insights:", error);
      const errorMessage = error.message || "Failed to generate insights. Please try again.";
      setInventoryInsights(`Failed to generate insights: ${errorMessage}`);
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
              total_individuals_served: 0,
              urgency_levels: [],
              beneficiaries: [],
              item_details: item,
            };
            requestContext[itemName] = [];
          }

          itemAggregation[itemName].total_requested += quantity;
          itemAggregation[itemName].total_individuals_served += (parseInt(request.individuals_served) || 1);
          itemAggregation[itemName].urgency_levels.push(request.urgency);
          itemAggregation[itemName].beneficiaries.push(
            request.beneficiary_name
          );
          requestContext[itemName].push({
            beneficiary: request.beneficiary_name,
            quantity: quantity,
            urgency: request.urgency,
            request_id: request.request_id,
            individuals_served: parseInt(request.individuals_served) || 1,
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

    // Smart optimization: Calculate optimal distribution based on stock and individuals served
    const newRequests = {};
    aggregatedItems.forEach((item) => {
      // Find current stock for this item
      const inventoryItem = inventoryData?.find(
        (inv) => inv.itemtype_name === item.itemtype_name
      );
      const currentStock = inventoryItem?.quantity_available || 0;
      const criticalThreshold = inventoryItem?.critical_threshold || 10;
      const safeStock = Math.max(0, currentStock - criticalThreshold); // Keep some safety stock
      
      // Calculate optimal distribution
      let optimizedQuantity = item.total_requested;
      let optimizationReason = 'as_requested';
      
      if (item.total_individuals_served > 0) {
        const requestedPerPerson = item.total_requested / item.total_individuals_served;
        
        if (currentStock < item.total_requested) {
          // SCENARIO 1: Not enough stock - distribute fairly with what's available
          const availablePerPerson = safeStock / item.total_individuals_served;
          const fairPerPerson = Math.floor(Math.min(requestedPerPerson, availablePerPerson));
          optimizedQuantity = fairPerPerson * item.total_individuals_served;
          optimizationReason = 'limited_stock';
          
        } else {
          // SCENARIO 2: Enough stock - optimize for better distribution
          
          // Round to whole units per person if fractional
          const ceiledPerPerson = Math.ceil(requestedPerPerson);
          const flooredPerPerson = Math.floor(requestedPerPerson);
          
          // Check if we can give more for better distribution
          const ceiledTotal = ceiledPerPerson * item.total_individuals_served;
          const flooredTotal = flooredPerPerson * item.total_individuals_served;
          
          if (flooredPerPerson > 0 && requestedPerPerson !== flooredPerPerson) {
            // Fractional request - decide whether to round up or down
            
            if (ceiledTotal <= safeStock && ceiledPerPerson <= requestedPerPerson * 1.5) {
              // Can afford to round UP (give more) - within 150% of request and have stock
              optimizedQuantity = ceiledTotal;
              optimizationReason = 'rounded_up';
            } else {
              // Round DOWN to whole units
              optimizedQuantity = flooredTotal;
              optimizationReason = 'rounded_down';
            }
          } else if (flooredPerPerson === 0 && safeStock >= item.total_individuals_served) {
            // Very small request per person - give at least 1 per person if possible
            optimizedQuantity = item.total_individuals_served;
            optimizationReason = 'minimum_one_per_person';
          }
          
          // BONUS: If stock is abundant and request is very low, suggest more
          if (currentStock > item.total_requested * 3 && requestedPerPerson < 2) {
            const suggestedPerPerson = Math.min(
              Math.floor(safeStock / item.total_individuals_served),
              Math.ceil(requestedPerPerson * 2) // Max 2x the original request
            );
            if (suggestedPerPerson > ceiledPerPerson) {
              optimizedQuantity = suggestedPerPerson * item.total_individuals_served;
              optimizationReason = 'abundant_stock';
            }
          }
        }
      } else {
        // Fallback for no individuals_served data
        optimizedQuantity = Math.min(item.total_requested, safeStock);
        optimizationReason = 'no_individuals_data';
      }
      
      newRequests[item.itemtype_name] = Math.max(0, optimizedQuantity);
    });

    setFormData((prev) => ({ ...prev, requests: newRequests }));
  };

  const handleDistribute = useCallback(async () => {
    try {
      setLoading(true);
      
      // Ensure inventory data is loaded
      if (!inventoryData || inventoryData.length === 0) {
        alert('Inventory data not available. Please wait for data to load and try again.');
        return;
      }
      
      // Create distribution plans for each selected request
      const distributionResults = [];
      
      for (const requestId of formData.selectedRequests) {
        const request = pendingRequests.find(r => r.request_id === requestId);
        if (!request || !request.items || request.items.length === 0) {
          console.warn(`No items found for request ${requestId}`);
          continue;
        }
        
        // Map request items to available inventory
        const planItems = [];
        for (const item of request.items) {
          console.log('Request item:', item);
          console.log('Looking for itemtype_id:', item.itemtype_id, 'needed quantity:', item.quantity_requested);
          
          // Debug: Show all inventory itemtype_ids
          console.log('All inventory itemtype_ids:', inventoryData.map(inv => ({ 
            itemtype_id: inv.itemtype_id, 
            itemtype_name: inv.itemtype_name,
            quantity_available: inv.quantity_available 
          })));
          
          // Find matching inventory for this item type
          const matchingInventory = inventoryData.filter(inv => inv.itemtype_id == item.itemtype_id);
          console.log('Matching inventory items by itemtype_id:', matchingInventory);
          
          let availableInventory = inventoryData.find(inv => 
            inv.itemtype_id == item.itemtype_id && 
            inv.quantity_available >= item.quantity_requested
          );
          
          // Fallback: try to match by item name if itemtype_id doesn't match
          if (!availableInventory) {
            console.log(`No match by itemtype_id, trying name match for: ${item.itemtype_name}`);
            availableInventory = inventoryData.find(inv => 
              inv.itemtype_name === item.itemtype_name && 
              inv.quantity_available >= item.quantity_requested
            );
            if (availableInventory) {
              console.log(`Found match by name: ${availableInventory.itemtype_name} (id: ${availableInventory.itemtype_id})`);
            }
          }
          
          if (availableInventory) {
            console.log('Found available inventory:', availableInventory);
            
            // Safety checks before creating distribution plan
            const requestedQty = item.quantity_requested;
            const currentStock = availableInventory.quantity_available;
            const threshold = availableInventory.threshold || getSafetyThresholdSync(safetyThresholds, item.itemtype_name);
            const safeToDistribute = availableInventory.safeToDistribute || Math.max(0, currentStock - threshold);
            const status = availableInventory.status;
            
            // Advisory safety threshold checks (warnings only - do not block)
            let safetyWarnings = [];
            
            if (status === 'critical' || currentStock <= threshold) {
              safetyWarnings.push(`⚠️ Below safety threshold (${currentStock} ≤ ${threshold}) - emergency reserves will be used`);
              console.warn(`⚠️ Advisory warning: ${item.itemtype_name} is below safety threshold (${currentStock} ≤ ${threshold})`);
            }
            
            if (requestedQty > safeToDistribute && safeToDistribute > 0) {
              safetyWarnings.push(`⚠️ Exceeds recommended amount (requested: ${requestedQty}, recommended: ${safeToDistribute})`);
              console.warn(`⚠️ Advisory warning: ${item.itemtype_name} request exceeds recommended amount`);
            }
            
            if ((currentStock - requestedQty) < threshold) {
              safetyWarnings.push(`⚠️ Will reduce stock below threshold (remaining: ${currentStock - requestedQty})`);
              console.warn(`⚠️ Advisory warning: ${item.itemtype_name} distribution will reduce stock below threshold`);
            }
            
            // Log status - advisory approach allows all distributions
            if (safetyWarnings.length > 0) {
              console.log(`⚡ Proceeding with advisory warnings for ${item.itemtype_name}: ${safetyWarnings.join(', ')}`);
            } else {
              console.log(`✅ Optimal distribution for ${item.itemtype_name}: Current(${currentStock}) - Requested(${requestedQty}) = ${currentStock - requestedQty} (above threshold: ${threshold})`);
            }
            
            planItems.push({
              inventory_id: availableInventory.inventory_id,
              quantity: item.quantity_requested,
              allocated_value: item.quantity_requested * (availableInventory.unit_value || 0),
              notes: `Distribution for ${request.beneficiary_name} - ${item.itemtype_name}`
            });
          } else {
            console.warn(`No available inventory for ${item.itemtype_name} (needed: ${item.quantity_requested})`);
            console.warn('Available inventory data:', inventoryData.map(inv => ({
              itemtype_id: inv.itemtype_id,
              itemtype_name: inv.itemtype_name,
              quantity_available: inv.quantity_available,
              status: inv.status,
              threshold: inv.threshold
            })));
          }
        }
        
        // Skip if no items can be fulfilled
        if (planItems.length === 0) {
          console.warn(`Cannot create distribution plan for request ${requestId} - no available inventory`);
          continue;
        }
        
        // Try to create distribution plan
        let planId = null;
        let planResult = null;
        
        try {
          planResult = await distributionService.createDistributionPlan({
            request_id: requestId,
            planned_date: formData.distributionDate,
            items: planItems,
            remarks: formData.notes || `Distribution plan for ${request.beneficiary_name}`
          });
          
          if (planResult.success) {
            planId = planResult.data.plan_id;
            if (planResult.isExisting) {
              console.log(`Using existing distribution plan ${planId} for request ${requestId} (Status: ${planResult.data.status})`);
            } else {
              console.log(`Created new distribution plan ${planId} for request ${requestId}`);
            }
          }
        } catch (error) {
          // Check if error is due to existing plan
          if (error.response?.status === 400 && error.response?.data?.existingPlanId) {
            planId = error.response.data.existingPlanId;
            const existingStatus = error.response.data.existingPlanStatus;
            console.log(`Using existing distribution plan ${planId} (status: ${existingStatus}) for request ${requestId}`);
            
            // If plan is Draft or Approved, we can execute it
            if (existingStatus === 'Draft' || existingStatus === 'Approved') {
              planResult = { success: true }; // Allow execution to proceed
            } else {
              console.warn(`Cannot execute existing plan ${planId} - status is ${existingStatus}`);
              continue; // Skip this request
            }
          } else {
            console.error(`Failed to create/find distribution plan for request ${requestId}:`, error);
            continue; // Skip this request
          }
        }
        
        if (planResult?.success && planId) {
          // Just create the plan - don't execute it yet
          // The plan will show as "Draft" in distribution logs for admin approval
          console.log(`Distribution plan ${planId} created for request ${requestId} - awaiting admin approval`);
          
          distributionResults.push({
            planId: planId,
            requestId: requestId,
            beneficiaryName: request.beneficiary_name,
            executed: false, // Plan created but not executed yet
            status: 'Draft' // Pending admin approval
          });
        }
      }
      
      // Show success message using modal
      const createdCount = distributionResults.length;
      const totalRequests = formData.selectedRequests.length;
      
      console.log('Distribution results:', { createdCount, totalRequests, distributionResults });
      
      if (createdCount === totalRequests) {
        showSuccess({
          title: '🎉 Distribution Plans Created!',
          message: `Successfully created ${createdCount} distribution plans. All plans are now pending admin approval in Distribution Logs.`,
          details: {
            plans_created: createdCount,
            total_requests: totalRequests,
            success_rate: '100%',
            status: 'Pending Admin Approval',
            next_step: 'Plans available in Distribution Logs'
          },
          icon: 'trophy',
          buttonText: 'Excellent!'
        });
      } else if (createdCount > 0) {
        showSuccess({
          title: '⚠️ Partial Success',
          message: `Created ${createdCount} of ${totalRequests} distribution plans. Some requests may need inventory check.`,
          details: {
            plans_created: createdCount,
            total_requests: totalRequests,
            success_rate: `${Math.round((createdCount / totalRequests) * 100)}%`,
            status: 'Partial Success',
            note: 'Check inventory availability for failed requests'
          },
          icon: 'checkCircle',
          buttonText: 'Got It!'
        });
      } else {
        console.log('🟡 About to show success modal...');
        console.log('🟡 showSuccess function:', showSuccess);
        console.log('🟡 typeof showSuccess:', typeof showSuccess);
        console.log('🟡 showSuccess is function?', typeof showSuccess === 'function');
        
        if (typeof showSuccess === 'function') {
          console.log('🟡 Calling showSuccess...');
          showSuccess({
          title: '🚫 No Plans Created - Safety Restrictions',
          message: 'No distribution plans could be created due to inventory safety restrictions and low stock levels.',
          details: [
            '⚠️ Items below safety threshold cannot be distributed',
            '📊 Check inventory status (avoid Critical/Low Stock items)',
            '🔄 Wait for restocking before creating distribution plans',
            '🛡️ Safety thresholds protect against stockouts',
            '📋 Review requests for items with sufficient stock'
          ],
          icon: 'thumbsUp',
          buttonText: 'I Understand'
        });
          console.log('🟡 showSuccess called successfully!');
        } else {
          console.error('❌ showSuccess is not a function!', showSuccess);
          alert('ERROR: showSuccess is not a function');
        }
        console.log('🟡 Success modal should be showing now...');
      }
      
      // Wait a bit before resetting form to prevent modal from closing too quickly
      setTimeout(() => {
        setFormData({
          selectedRequests: [],
          distributionDate: "",
          notes: "",
          distributionPlan: {},
          selectedDistribution: {},
        });
        setStep(1);
      }, 500); // 500ms delay
      // onClose(); // Removed - will be called when success modal is closed
      
    } catch (error) {
      console.error('Error executing distribution:', error);
      // Still use alert for errors since this is an error case, not a success
      alert('Failed to execute distribution plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData.selectedRequests, pendingRequests, inventoryData, formData.distributionDate, formData.notes, onClose]);

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
              Assess needs, optimize with AI insights, and execute distribution plans.
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
                  Review & Optimize
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

            {/* Step 1: Select Beneficiary Requests */}

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

                {/* Pagination Info */}
                {filteredInventoryData.length > 0 && (
                  <div className="mb-4 flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                      <span className="font-semibold">{Math.min(endIndex, filteredInventoryData.length)}</span> of{" "}
                      <span className="font-semibold">{filteredInventoryData.length}</span> items
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setChartPage((prev) => Math.max(1, prev - 1))}
                        disabled={chartPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page <span className="font-semibold">{chartPage}</span> of{" "}
                        <span className="font-semibold">{totalPages}</span>
                      </span>
                      <button
                        onClick={() => setChartPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={chartPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {/* Chart */}
                <div className="h-80 flex items-center justify-center">
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
                          🤖 AI Assessment & Distribution Insights
                          {formData.selectedRequests?.length > 0 && (
                            <span className="ml-2 text-sm font-normal text-purple-700">
                              (Analyzing {formData.selectedRequests.length} request{formData.selectedRequests.length !== 1 ? 's' : ''})
                            </span>
                          )}
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
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Stock Status Guide</h5>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        <strong>Optimal:</strong> Between reorder & max
                      </span>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-lg">
                      <div className="w-4 h-4 bg-yellow-500 rounded mr-2 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        <strong>Low:</strong> Below reorder point
                      </span>
                    </div>
                    <div className="flex items-center bg-red-50 px-3 py-2 rounded-lg">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        <strong>Critical:</strong> Below safety buffer
                      </span>
                    </div>
                    <div className="flex items-center bg-orange-50 px-3 py-2 rounded-lg">
                      <div className="w-4 h-4 bg-orange-500 rounded mr-2 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        <strong>Overstocked:</strong> Exceeds capacity
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800 flex items-start">
                      <span className="mr-2 mt-0.5">💡</span>
                      <span>
                        <strong>Tip:</strong> Hover over bars for detailed information. Green bars indicate healthy stock levels, 
                        yellow suggests approaching reorder point, and red indicates urgent restocking needed.
                      </span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    📦 Warehouse Capacity: 240 sq.m | Based on realistic storage constraints and emergency response needs
                  </p>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                  {/* Beneficiary Requests Selection */}
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

                      {/* Auto-approved requests from database */}
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
                                <div>
                                  <strong>Individuals to be Served:</strong>{" "}
                                  <span className="text-blue-600 font-semibold">
                                    {request.individuals_served || 1}
                                  </span>
                                  {" "}
                                  {request.beneficiary_type === "Individual" ? "person" : "people/families"}
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
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800 flex items-center">
                            <HiCheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            Showing aggregated needs from selected beneficiary
                            requests. You can adjust quantities based on your
                            assessment.
                          </p>
                        </div>
                      </div>
                    )}

                    {formData.selectedRequests?.length > 0 && (
                      <div className="space-y-4 max-h-96 overflow-y-auto mt-6">
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
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                <span className="text-sm text-gray-500 w-16">
                                  units
                                </span>
                              </div>

                              {/* Quantity adjustment note */}
                              {(() => {
                                const assessedQty = formData.requests?.[requestItem.itemtype_name];
                                const requestedQty = requestItem.total_requested;
                                const perPerson = requestItem.total_individuals_served > 0 
                                  ? (assessedQty / requestItem.total_individuals_served).toFixed(2)
                                  : 0;
                                const requestedPerPerson = requestItem.total_individuals_served > 0
                                  ? (requestedQty / requestItem.total_individuals_served).toFixed(2)
                                  : 0;
                                
                                if (assessedQty === requestedQty || !assessedQty) return null;
                                
                                return (
                                  <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                                    {assessedQty > requestedQty ? (
                                      <div>
                                        <strong>Note:</strong> Quantity increased from {requestedQty} to {assessedQty} units 
                                        ({requestedPerPerson} → {perPerson} per person) based on available stock.
                                      </div>
                                    ) : currentStock < requestedQty ? (
                                      <div>
                                        <strong>Note:</strong> Quantity adjusted to {assessedQty} units ({perPerson} per person) 
                                        due to limited inventory.
                                      </div>
                                    ) : (
                                      <div>
                                        <strong>Note:</strong> Quantity rounded to {assessedQty} units 
                                        for easier distribution.
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

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
                                          className="space-y-0.5"
                                        >
                                          <div className="flex justify-between">
                                            <span>
                                              {ctx.beneficiary} (#{ctx.request_id})
                                            </span>
                                            <span className="font-medium">
                                              {ctx.quantity} units
                                            </span>
                                          </div>
                                          {ctx.individuals_served && ctx.individuals_served > 1 && (
                                            <div className="flex justify-between text-blue-600 pl-2">
                                              <span>↳ Serves {ctx.individuals_served} individuals</span>
                                              <span className="font-medium">
                                                ~{(ctx.quantity / ctx.individuals_served).toFixed(1)} per person
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    {requestItem.context.length > 2 && (
                                      <div className="text-gray-500 italic">
                                        ...and {requestItem.context.length - 2}{" "}
                                        more requests
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-50">
                                    <div className="flex justify-between font-medium">
                                      <span>Total Requested:</span>
                                      <span>{requestItem.total_requested} units</span>
                                    </div>
                                    {requestItem.total_individuals_served && requestItem.total_individuals_served > 0 && (
                                      <div className="flex justify-between text-blue-600 mt-1">
                                        <span>Total Individuals:</span>
                                        <span>{requestItem.total_individuals_served} people</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Per-person allocation helper */}
                              {requestItem.total_individuals_served && requestItem.total_individuals_served > 1 && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                  <div className="flex justify-between text-blue-800">
                                    <span>📊 If distributing assessed amount equally:</span>
                                    <span className="font-semibold">
                                      ~{(
                                        (formData.requests?.[requestItem.itemtype_name] || requestItem.total_requested) / 
                                        requestItem.total_individuals_served
                                      ).toFixed(2)} per person
                                    </span>
                                  </div>
                                </div>
                              )}

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
                    )}
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
                          Step 2: Review & Optimize Distribution Plan
                        </h4>
                        <p className="text-blue-700 text-sm mt-1">
                          Review assessed needs and optimize distribution plan for{" "}
                          {formData.selectedRequests?.length || 0} selected requests
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assessed Needs Summary */}
                  {aggregatedRequestItems.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                        <HiCheckCircle className="w-5 h-5 mr-2" />
                        Assessed Needs Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aggregatedRequestItems.slice(0, 6).map((item, index) => {
                          const inventoryItem = filteredInventoryData.find(inv => inv.name === item.itemtype_name);
                          const currentStock = inventoryItem?.current || 0;
                          const canFulfill = currentStock >= item.total_requested;
                          
                          return (
                            <div key={index} className="bg-white rounded-lg p-3 border">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-sm text-gray-900">{item.itemtype_name}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.max_urgency === "Critical" ? "bg-red-100 text-red-800" :
                                  item.max_urgency === "High" ? "bg-orange-100 text-orange-800" :
                                  item.max_urgency === "Medium" ? "bg-blue-100 text-blue-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {item.max_urgency}
                                </span>
                              </div>
                              <div className="text-xs space-y-1">
                                <div>Requested: {item.total_requested} units</div>
                                <div>Available: {currentStock} units</div>
                                <div className={`font-medium ${canFulfill ? 'text-green-600' : 'text-red-600'}`}>
                                  {canFulfill ? '✓ Can fulfill' : '⚠ Shortage'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {aggregatedRequestItems.length > 6 && (
                        <div className="mt-3 text-sm text-green-700">
                          ...and {aggregatedRequestItems.length - 6} more items
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    {/* Request vs Inventory Matching */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <HiLightBulb className="w-5 h-5 text-purple-600 mr-2" />
                        Distribution Recommendation
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          (Based on assessed needs)
                        </span>
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

                    {/* Distribution Impact Chart */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Distribution Impact
                      </h4>
                      <p className="text-sm text-gray-600 mb-6">
                        Measuring how effectively this plan addresses beneficiary needs
                      </p>
                      
                      {/* Impact Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-blue-700 uppercase">Need Fulfillment</span>
                            <span className="text-2xl font-bold text-blue-700">
                              {(() => {
                                const totalRequested = aggregatedRequestItems.reduce((sum, item) => sum + (item.total_requested || 0), 0);
                                const totalRecommended = aggregatedRequestItems.reduce((sum, item) => {
                                  const recommended = formData.requests[item.itemtype_name] || item.total_requested;
                                  return sum + recommended;
                                }, 0);
                                const percentage = totalRequested > 0 ? Math.round((totalRecommended / totalRequested) * 100) : 0;
                                return percentage > 100 ? `${percentage}%` : `${percentage}%`;
                              })()}
                            </span>
                          </div>
                          <p className="text-xs text-blue-600">
                            {(() => {
                              const totalRequested = aggregatedRequestItems.reduce((sum, item) => sum + (item.total_requested || 0), 0);
                              const totalRecommended = aggregatedRequestItems.reduce((sum, item) => {
                                const recommended = formData.requests[item.itemtype_name] || item.total_requested;
                                return sum + recommended;
                              }, 0);
                              const percentage = totalRequested > 0 ? Math.round((totalRecommended / totalRequested) * 100) : 0;
                              if (percentage > 100) {
                                return `Exceeding needs by ${percentage - 100}% (abundant stock)`;
                              } else if (percentage === 100) {
                                return 'Fully meeting all requested needs';
                              } else {
                                return `Fulfilling ${percentage}% of requested items`;
                              }
                            })()}
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-green-700 uppercase">Beneficiary Reach</span>
                            <span className="text-2xl font-bold text-green-700">
                              {(() => {
                                const selectedRequests = pendingRequests.filter(req => 
                                  formData.selectedRequests?.includes(req.request_id)
                                );
                                return selectedRequests.reduce((sum, req) => 
                                  sum + (parseInt(req.individuals_served) || 1), 0
                                );
                              })()}
                            </span>
                          </div>
                          <p className="text-xs text-green-600">
                            Individuals receiving assistance
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-purple-700 uppercase">Avg Per Person</span>
                            <span className="text-2xl font-bold text-purple-700">
                              {(() => {
                                const totalUnits = aggregatedRequestItems.reduce((sum, item) => {
                                  const recommended = formData.requests[item.itemtype_name] || item.total_requested;
                                  return sum + recommended;
                                }, 0);
                                const selectedRequests = pendingRequests.filter(req => 
                                  formData.selectedRequests?.includes(req.request_id)
                                );
                                const totalIndividuals = selectedRequests.reduce((sum, req) => 
                                  sum + (parseInt(req.individuals_served) || 1), 0
                                );
                                return totalIndividuals > 0 ? (totalUnits / totalIndividuals).toFixed(1) : 0;
                              })()}
                            </span>
                          </div>
                          <p className="text-xs text-purple-600">
                            Items per individual served
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-orange-700 uppercase">Priority Items</span>
                            <span className="text-2xl font-bold text-orange-700">
                              {aggregatedRequestItems.filter(item => 
                                item.max_urgency === 'Critical' || item.max_urgency === 'High'
                              ).length}/{aggregatedRequestItems.length}
                            </span>
                          </div>
                          <p className="text-xs text-orange-600">
                            High-priority needs addressed
                          </p>
                        </div>
                      </div>
                      
                      {/* Item Distribution Breakdown */}
                      <div className="h-64">
                        {aggregatedRequestItems.length > 0 ? (
                          <Doughnut
                            data={{
                              labels: aggregatedRequestItems.map(item => item.itemtype_name),
                              datasets: [{
                                label: 'Distribution Quantity',
                                data: aggregatedRequestItems.map(item => formData.requests[item.itemtype_name] || item.total_requested),
                                backgroundColor: [
                                  'rgba(59, 130, 246, 0.8)',
                                  'rgba(34, 197, 94, 0.8)',
                                  'rgba(168, 85, 247, 0.8)',
                                  'rgba(251, 191, 36, 0.8)',
                                  'rgba(249, 115, 22, 0.8)',
                                  'rgba(236, 72, 153, 0.8)',
                                  'rgba(14, 165, 233, 0.8)',
                                  'rgba(132, 204, 22, 0.8)',
                                  'rgba(245, 158, 11, 0.8)',
                                  'rgba(239, 68, 68, 0.8)',
                                ],
                                borderColor: [
                                  'rgba(59, 130, 246, 1)',
                                  'rgba(34, 197, 94, 1)',
                                  'rgba(168, 85, 247, 1)',
                                  'rgba(251, 191, 36, 1)',
                                  'rgba(249, 115, 22, 1)',
                                  'rgba(236, 72, 153, 1)',
                                  'rgba(14, 165, 233, 1)',
                                  'rgba(132, 204, 22, 1)',
                                  'rgba(245, 158, 11, 1)',
                                  'rgba(239, 68, 68, 1)',
                                ],
                                borderWidth: 2,
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'right',
                                  labels: {
                                    font: { size: 11 },
                                    padding: 10,
                                    boxWidth: 12
                                  }
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      const item = aggregatedRequestItems[context.dataIndex];
                                      const quantity = context.parsed;
                                      const individuals = item.total_individuals_served || 0;
                                      const perPerson = individuals > 0 ? (quantity / individuals).toFixed(2) : 0;
                                      const requested = item.total_requested;
                                      const fulfillment = requested > 0 ? Math.round((quantity / requested) * 100) : 100;
                                      return [
                                        `${context.label}: ${quantity} units`,
                                        `Fulfillment: ${fulfillment}% of need`,
                                        `Serves: ${individuals} individuals`,
                                        `Impact: ${perPerson} units/person`
                                      ];
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <p className="text-sm">No items selected for distribution</p>
                              <p className="text-xs mt-1">Select beneficiary requests to see impact analysis</p>
                            </div>
                          </div>
                        )}
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
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) =>
                          handleInputChange("distributionDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h5 className="font-medium text-blue-900 mb-4 flex items-center">
                    <HiExclamation className="w-4 h-4 mr-2" />
                    Distribution Readiness Check
                  </h5>
                  
                  {/* Dynamic recommendations based on assessed needs */}
                  {aggregatedRequestItems.length > 0 ? (
                    <div className="space-y-3">
                      {/* Critical items check */}
                      {aggregatedRequestItems.filter(item => item.max_urgency === 'Critical').length > 0 && (
                        <div className="flex items-start text-sm">
                          <span className="text-red-600 mr-2">⚠</span>
                          <span className="text-red-800">
                            <strong>{aggregatedRequestItems.filter(item => item.max_urgency === 'Critical').length} critical priority items</strong> detected. 
                            Prioritize these for immediate distribution.
                          </span>
                        </div>
                      )}
                      
                      {/* Stock shortage warnings */}
                      {aggregatedRequestItems.filter(item => {
                        const inventoryItem = filteredInventoryData.find(inv => inv.name === item.itemtype_name);
                        return (inventoryItem?.current || 0) < item.total_requested;
                      }).length > 0 && (
                        <div className="flex items-start text-sm">
                          <span className="text-orange-600 mr-2">⚠</span>
                          <span className="text-orange-800">
                            <strong>Stock shortages</strong> detected for {
                              aggregatedRequestItems.filter(item => {
                                const inventoryItem = filteredInventoryData.find(inv => inv.name === item.itemtype_name);
                                return (inventoryItem?.current || 0) < item.total_requested;
                              }).length
                            } items. Consider partial fulfillment or procurement.
                          </span>
                        </div>
                      )}
                      
                      {/* Safety stock warnings */}
                      {aggregatedRequestItems.filter(item => {
                        const inventoryItem = filteredInventoryData.find(inv => inv.name === item.itemtype_name);
                        return inventoryItem?.status === 'critical' || inventoryItem?.status === 'low';
                      }).length > 0 && (
                        <div className="flex items-start text-sm">
                          <span className="text-yellow-600 mr-2">⚠</span>
                          <span className="text-yellow-800">
                            Some requested items are <strong>below safety thresholds</strong>. 
                            Review distribution quantities to maintain emergency reserves.
                          </span>
                        </div>
                      )}
                      
                      {/* All good message */}
                      {aggregatedRequestItems.every(item => {
                        const inventoryItem = filteredInventoryData.find(inv => inv.name === item.itemtype_name);
                        return (inventoryItem?.current || 0) >= item.total_requested && inventoryItem?.status === 'safe';
                      }) && (
                        <div className="flex items-start text-sm">
                          <span className="text-green-600 mr-2">✓</span>
                          <span className="text-green-800">
                            <strong>All assessed needs can be fulfilled</strong> with current inventory levels. 
                            Ready for distribution execution.
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Select beneficiary requests in Step 1 to get contextual recommendations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Use AI insights to optimize distribution planning</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Review stock levels and safety thresholds before execution</span>
                      </li>
                    </ul>
                  )}
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
                    {step === 1 ? "Review & Optimize →" : "Execute Distribution Plan"}
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

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={handleSuccessModalClose}
        title={successData.title}
        message={successData.message}
        details={successData.details}
        icon={successData.icon}
      />
    </div>
  );
};

export default DistributeDonationForm;
