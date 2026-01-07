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
  const [selectedYear, setSelectedYear] = useState(2025); // Default to 2025 which has historical data

  useEffect(() => {
    const fetchDonatedItemsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/donations/category-distribution?year=${selectedYear}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch category distribution');
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          // Sort data by category name for consistent order
          const sortedData = [...result.data].sort((a, b) => 
            a.category_name.localeCompare(b.category_name)
          );
          
          const categories = sortedData.map(item => item.category_name);
          const quantities = sortedData.map(item => parseInt(item.total_quantity));
          
          // Find the index of the highest value to highlight it
          const maxValue = Math.max(...quantities);
          const maxIndex = quantities.indexOf(maxValue);
          
          // Create offset array - pull out the highest slice
          const offsets = quantities.map((_, index) => index === maxIndex ? 15 : 0);
          
          // Consistent color mapping based on category names
          const categoryColorMap = {
            'Food Items': 'rgba(239, 68, 68, 0.9)',
            'Household Essentials/Personal Care': 'rgba(251, 146, 60, 0.9)',
            'Kitchen Utensils': 'rgba(250, 204, 21, 0.9)',
            'Shelter Materials': 'rgba(34, 197, 94, 0.9)',
            'Clothing': 'rgba(59, 130, 246, 0.9)',
            'Educational Materials': 'rgba(168, 85, 247, 0.9)',
            'Medical Supplies': 'rgba(236, 72, 153, 0.9)'
          };
          
          const categoryBorderMap = {
            'Food Items': 'rgb(239, 68, 68)',
            'Household Essentials/Personal Care': 'rgb(251, 146, 60)',
            'Kitchen Utensils': 'rgb(250, 204, 21)',
            'Shelter Materials': 'rgb(34, 197, 94)',
            'Clothing': 'rgb(59, 130, 246)',
            'Educational Materials': 'rgb(168, 85, 247)',
            'Medical Supplies': 'rgb(236, 72, 153)'
          };
          
          // Fallback colors for unmapped categories
          const fallbackColors = ['rgba(156, 163, 175, 0.9)', 'rgba(107, 114, 128, 0.9)'];
          const fallbackBorders = ['rgb(156, 163, 175)', 'rgb(107, 114, 128)'];
          
          // Map colors based on category names
          const backgroundColors = categories.map((cat, idx) => 
            categoryColorMap[cat] || fallbackColors[idx % fallbackColors.length]
          );
          const borderColors = categories.map((cat, idx) => 
            categoryBorderMap[cat] || fallbackBorders[idx % fallbackBorders.length]
          );
          
          setChartData({
            labels: categories,
            datasets: [
              {
                data: quantities,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                offset: offsets,
              },
            ],
          });
        } else {
          setChartData(null);
        }
      } catch (err) {
        console.error('Error fetching category distribution:', err);
        setError('Failed to load category data');
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDonatedItemsData();
  }, [selectedYear]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 11,
            weight: '500'
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 14,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        boxPadding: 6,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              `Items: ${value.toLocaleString()}`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      }
    },
  };

  const emptyData = {
    labels: ['No Data'],
    datasets: [
      {
        data: [1],
        backgroundColor: ['rgba(107, 114, 128, 0.3)'],
        borderColor: ['rgba(107, 114, 128, 0.5)'],
        borderWidth: 1,
      },
    ],
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Category Distribution</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="text-sm bg-red-600 text-white border-0 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-700 cursor-pointer hover:bg-red-700 transition-colors"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="h-[360px]">
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
    </div>
  );
};

export default DonatedItemsChart;
