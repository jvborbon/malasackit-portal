import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonatedItemsChart = () => {
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

  const data = {
    labels: ['Food Items', 'Clothing', 'Medical Supplies', 'Educational Materials', 'Electronics', 'Others'],
    datasets: [
      {
        data: [850, 620, 350, 280, 150, 120],
        backgroundColor: [
              'rgba(220, 38, 38, 0.8)',   // Red primary
          'rgba(239, 68, 68, 0.8)',   // Red lighter
          'rgba(185, 28, 28, 0.8)',   // Red darker
          'rgba(248, 113, 113, 0.8)', // Red light
          'rgba(153, 27, 27, 0.8)',   // Red very dark
          'rgba(107, 114, 128, 0.8)', // Gray for Others
        ],
        borderColor: [
          'rgba(220, 38, 38, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(185, 28, 28, 1)',
          'rgba(248, 113, 113, 1)',
          'rgba(153, 27, 27, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-[408px]">
        <Pie options={options} data={data} />
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">2,370</p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">6</p>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatedItemsChart;
