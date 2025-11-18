import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DonationReportsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonationReportsData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await getDonationReports();
        
        // For now, show empty state until API is implemented
        setChartData(null);
        setError('Data not available - API integration pending');
      } catch (err) {
        setError('Failed to load donation reports data');
      } finally {
        setLoading(false);
      }
    };

    fetchDonationReportsData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
      },
      title: {
        display: true,
        text: 'Donation Reports',
        font: {
          size: 18,
          weight: 'bold'
        },
        align: 'start',
        padding: {
          bottom: 20
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₱' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
  };

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Empty data structure for when no data is available
  const emptyData = {
    labels,
    datasets: [
      {
        label: 'Monthly Donations',
        data: Array(12).fill(0),
        backgroundColor: 'rgba(107, 114, 128, 0.3)',
        borderColor: 'rgba(107, 114, 128, 0.5)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-[500px]">
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
          <Bar options={options} data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">📊 No Data Available</p>
              <p className="text-sm text-gray-400">Connect to database to view donation reports</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationReportsChart;
