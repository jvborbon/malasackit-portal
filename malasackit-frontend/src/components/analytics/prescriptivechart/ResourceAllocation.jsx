import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  HiTrendingUp, 
  HiTrendingDown, 
  HiExclamationTriangle, 
  HiCheckCircle,
  HiLightBulb,
  HiRefresh,
  HiAdjustments
} from 'react-icons/hi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ResourceAllocation = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [selectedScenario, setSelectedScenario] = useState('optimal');

  // Current resource allocation data
  const currentAllocation = {
    labels: ['Food Items', 'Medical Supplies', 'Clothing', 'Educational Materials', 'Electronics', 'Others'],
    datasets: [
      {
        label: 'Current Allocation (%)',
        data: [35, 25, 20, 10, 5, 5],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Recommended allocation data
  const recommendedAllocation = {
    labels: ['Food Items', 'Medical Supplies', 'Clothing', 'Educational Materials', 'Electronics', 'Others'],
    datasets: [
      {
        label: 'Recommended Allocation (%)',
        data: [40, 30, 15, 10, 3, 2],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Allocation comparison data
  const comparisonData = {
    labels: ['Food Items', 'Medical Supplies', 'Clothing', 'Educational Materials', 'Electronics', 'Others'],
    datasets: [
      {
        label: 'Current Allocation (%)',
        data: [35, 25, 20, 10, 5, 5],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Recommended Allocation (%)',
        data: [40, 30, 15, 10, 3, 2],
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Efficiency trend data
  const efficiencyTrend = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Current Efficiency (%)',
        data: [72, 75, 74, 78, 76, 79],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Projected Efficiency (%)',
        data: [72, 75, 74, 82, 85, 88],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        borderDash: [5, 5],
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: selectedScenario === 'efficiency' ? 100 : undefined,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  // Recommendations data
  const recommendations = [
    {
      id: 1,
      priority: 'high',
      category: 'Food Items',
      action: 'Increase allocation by 5%',
      impact: '+12% efficiency',
      reason: 'High demand in Quezon City and Manila areas',
      icon: HiTrendingUp,
    },
    {
      id: 2,
      priority: 'high',
      category: 'Medical Supplies',
      action: 'Increase allocation by 5%',
      impact: '+8% efficiency',
      reason: 'Growing healthcare needs in rural parishes',
      icon: HiTrendingUp,
    },
    {
      id: 3,
      priority: 'medium',
      category: 'Clothing',
      action: 'Reduce allocation by 5%',
      impact: '+3% efficiency',
      reason: 'Oversupply detected in most regions',
      icon: HiTrendingDown,
    },
    {
      id: 4,
      priority: 'low',
      category: 'Electronics',
      action: 'Reduce allocation by 2%',
      impact: '+2% efficiency',
      reason: 'Low demand and high storage costs',
      icon: HiAdjustments,
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return HiExclamationTriangle;
      case 'medium':
        return HiLightBulb;
      case 'low':
        return HiCheckCircle;
      default:
        return HiAdjustments;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Resource Allocation Optimization</h2>
            <p className="text-gray-600 mt-1">AI-powered recommendations for optimal resource distribution</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="optimal">Optimal Distribution</option>
              <option value="efficiency">Maximum Efficiency</option>
              <option value="demand">Demand-Based</option>
            </select>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center">
              <HiRefresh className="w-4 h-4 mr-2" />
              Refresh Analysis
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Potential Efficiency Gain</p>
                <p className="text-2xl font-bold text-green-700">+12%</p>
              </div>
              <HiTrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Current Efficiency</p>
                <p className="text-2xl font-bold text-blue-700">79%</p>
              </div>
              <HiCheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Resources Analyzed</p>
                <p className="text-2xl font-bold text-yellow-700">6</p>
              </div>
              <HiAdjustments className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Cost Savings</p>
                <p className="text-2xl font-bold text-purple-700">₱45K</p>
              </div>
              <HiLightBulb className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current vs Recommended Allocation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current vs Recommended Allocation</h3>
          <div className="h-80">
            <Bar data={comparisonData} options={chartOptions} />
          </div>
        </div>

        {/* Efficiency Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Projection</h3>
          <div className="h-80">
            <Line data={efficiencyTrend} options={chartOptions} />
          </div>
        </div>

        {/* Current Allocation Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Allocation</h3>
          <div className="h-80">
            <Doughnut data={currentAllocation} options={doughnutOptions} />
          </div>
        </div>

        {/* Recommended Allocation Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Allocation</h3>
          <div className="h-80">
            <Doughnut data={recommendedAllocation} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            4 Actions Recommended
          </span>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec) => {
            const PriorityIcon = getPriorityIcon(rec.priority);
            const ActionIcon = rec.icon;

            return (
              <div
                key={rec.id}
                className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <PriorityIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-sm uppercase tracking-wide">
                          {rec.priority} Priority
                        </h4>
                        <span className="text-gray-500">•</span>
                        <span className="font-medium text-sm">{rec.category}</span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{rec.action}</p>
                      <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-green-600 flex items-center">
                          <ActionIcon className="w-4 h-4 mr-1" />
                          {rec.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              Apply All Recommendations
            </button>
            <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Generate Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceAllocation;