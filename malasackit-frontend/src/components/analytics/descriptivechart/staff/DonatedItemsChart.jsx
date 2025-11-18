import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonatedItemsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonatedItemsData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await getDonatedItemsDistribution();
        
        // For now, show empty state until API is implemented
        setChartData(null);
        setError('Data not available - API integration pending');
      } catch (err) {
        setError('Failed to load donated items data');
      } finally {
        setLoading(false);
      }
    };

    fetchDonatedItemsData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Donated Items Distribution',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} items (${percentage}%)`;
          }
        }
      }
    },
  };

  // Empty data structure for when no data is available
  const emptyData = {
    labels: ['No Data Available'],
    datasets: [
      {
        data: [1],
        backgroundColor: ['rgba(107, 114, 128, 0.3)'],
        borderColor: ['rgba(107, 114, 128, 0.5)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-[408px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">📊 Chart Data Unavailable</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        ) : chartData ? (
          <Pie options={options} data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">📊 No Data Available</p>
              <p className="text-sm text-gray-400">Connect to database to view donated items distribution</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '--' : chartData ? chartData.totalItems || 0 : 0}
            </p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '--' : chartData ? chartData.categories || 0 : 0}
            </p>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatedItemsChart;
