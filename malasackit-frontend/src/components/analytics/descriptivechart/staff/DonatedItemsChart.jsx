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
          
          // Monochromatic dark red/maroon gradient - each category gets a shade variation
          const categoryGradientMap = {
            'Food Items': { start: 'rgba(127, 29, 29, 0.95)', end: 'rgba(127, 29, 29, 0.7)' },
            'Household Essentials/Personal Care': { start: 'rgba(153, 27, 27, 0.95)', end: 'rgba(153, 27, 27, 0.7)' },
            'Kitchen Utensils': { start: 'rgba(185, 28, 28, 0.95)', end: 'rgba(185, 28, 28, 0.7)' },
            'Shelter Materials': { start: 'rgba(220, 38, 38, 0.95)', end: 'rgba(220, 38, 38, 0.7)' },
            'Clothing': { start: 'rgba(239, 68, 68, 0.95)', end: 'rgba(239, 68, 68, 0.7)' },
            'Educational Materials': { start: 'rgba(248, 113, 113, 0.95)', end: 'rgba(248, 113, 113, 0.7)' },
            'Medical Supplies': { start: 'rgba(252, 165, 165, 0.95)', end: 'rgba(252, 165, 165, 0.7)' }
          };
          
          // Fallback gradients for unmapped categories
          const fallbackGradients = [
            { start: 'rgba(200, 30, 30, 0.95)', end: 'rgba(200, 30, 30, 0.7)' },
            { start: 'rgba(170, 30, 30, 0.95)', end: 'rgba(170, 30, 30, 0.7)' }
          ];
          
          // Create gradients for each category
          const createGradient = (ctx, chartArea, gradientColors) => {
            const gradient = ctx.createRadialGradient(
              chartArea.width / 2,
              chartArea.height / 2,
              0,
              chartArea.width / 2,
              chartArea.height / 2,
              Math.max(chartArea.width, chartArea.height) / 2
            );
            gradient.addColorStop(0, gradientColors.start);
            gradient.addColorStop(1, gradientColors.end);
            return gradient;
          };
          
          // Map gradient colors based on category names
          const gradientConfigs = categories.map((cat, idx) => 
            categoryGradientMap[cat] || fallbackGradients[idx % fallbackGradients.length]
          );
          
          setChartData({
            labels: categories,
            datasets: [
              {
                data: quantities,
                backgroundColor: (context) => {
                  const chart = context.chart;
                  const { ctx, chartArea } = chart;
                  if (!chartArea) return null;
                  const index = context.dataIndex;
                  return createGradient(ctx, chartArea, gradientConfigs[index]);
                },
                borderWidth: 0,
                offset: offsets,
                // Store gradient configs in dataset for legend access
                _gradientConfigs: gradientConfigs
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
              const gradientConfigs = data.datasets[0]._gradientConfigs || [];
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                // Get the gradient start color for legend
                const bgColor = gradientConfigs[i]?.start || 'rgba(220, 38, 38, 0.85)';
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: bgColor,
                  hidden: false,
                  index: i
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
          className="text-sm bg-red-900 text-white border-0 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-950 cursor-pointer hover:bg-red-950 transition-colors"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="h-[360px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-900"></div>
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
