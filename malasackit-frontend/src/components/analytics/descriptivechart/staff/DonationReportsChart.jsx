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
  const [selectedYear, setSelectedYear] = useState(2025); // Default to 2025 which has historical data

  useEffect(() => {
    const fetchDonationReportsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/donations/category-trends?year=${selectedYear}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch donation trends');
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          const monthlyData = result.data;
          
          console.log('Raw donation trends data:', monthlyData);
          
          // Get unique categories and sort alphabetically for consistent order
          const categories = [...new Set(monthlyData.map(item => item.category_name))].sort();
          
          // Monochromatic dark red/maroon gradient - each category gets a shade variation
          const categoryGradientMap = {
            'Food Items': { start: 'rgba(127, 29, 29, 0.95)', end: 'rgba(127, 29, 29, 0.7)', border: 'rgb(87, 20, 20)' },
            'Household Essentials/Personal Care': { start: 'rgba(153, 27, 27, 0.95)', end: 'rgba(153, 27, 27, 0.7)', border: 'rgb(113, 20, 20)' },
            'Kitchen Utensils': { start: 'rgba(185, 28, 28, 0.95)', end: 'rgba(185, 28, 28, 0.7)', border: 'rgb(145, 22, 22)' },
            'Shelter Materials': { start: 'rgba(220, 38, 38, 0.95)', end: 'rgba(220, 38, 38, 0.7)', border: 'rgb(180, 28, 28)' },
            'Clothing': { start: 'rgba(239, 68, 68, 0.95)', end: 'rgba(239, 68, 68, 0.7)', border: 'rgb(199, 48, 48)' },
            'Educational Materials': { start: 'rgba(248, 113, 113, 0.95)', end: 'rgba(248, 113, 113, 0.7)', border: 'rgb(208, 73, 73)' },
            'Medical Supplies': { start: 'rgba(252, 165, 165, 0.95)', end: 'rgba(252, 165, 165, 0.7)', border: 'rgb(212, 125, 125)' }
          };
          
          // Fallback gradients for any unmapped categories
          const fallbackGradients = [
            { start: 'rgba(200, 30, 30, 0.95)', end: 'rgba(200, 30, 30, 0.7)', border: 'rgb(160, 24, 24)' },
            { start: 'rgba(170, 30, 30, 0.95)', end: 'rgba(170, 30, 30, 0.7)', border: 'rgb(130, 23, 23)' }
          ];
          
          // Helper function to create vertical gradient for bars
          const createGradient = (ctx, chartArea, gradientColors) => {
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, gradientColors.end);
            gradient.addColorStop(1, gradientColors.start);
            return gradient;
          };
          
          // Create datasets for each category
          const datasets = categories.map((category, index) => {
            const categoryData = monthlyData.filter(item => item.category_name === category);
            const monthlyValues = Array(12).fill(0);
            
            categoryData.forEach(item => {
              const monthIndex = parseInt(item.month) - 1;
              const quantity = parseFloat(item.total_quantity) || 0;
              monthlyValues[monthIndex] = quantity;
            });
            
            console.log(`${category} data:`, monthlyValues);
            
            // Get gradient config from map or use fallback
            const gradientConfig = categoryGradientMap[category] || fallbackGradients[index % fallbackGradients.length];
            
            return {
              label: category,
              data: monthlyValues,
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;
                return createGradient(ctx, chartArea, gradientConfig);
              },
              borderWidth: 0,
              borderRadius: 5,
              borderSkipped: false,
              barThickness: 'flex',
              maxBarThickness: 35
            };
          });
          
          setChartData({
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets
          });
        } else {
          setChartData(null);
        }
      } catch (err) {
        console.error('Error fetching donation trends:', err);
        setError('Failed to load donation data');
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationReportsData();
  }, [selectedYear]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          boxWidth: 14,
          boxHeight: 14,
          padding: 15,
          font: {
            size: 11,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(127, 29, 29, 0.95)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        bodySpacing: 6,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return context[0].label + ' ' + selectedYear;
          },
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toLocaleString()} items`;
          },
          afterBody: function(context) {
            const total = context.reduce((sum, item) => sum + item.parsed.y, 0);
            return `\nTotal: ${total.toLocaleString()} items`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: false,
        grace: '5%',
        grid: {
          color: 'rgba(220, 38, 38, 0.08)',
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value.toLocaleString();
          },
          font: {
            size: 10
          },
          padding: 8,
          color: '#374151'
        },
        title: {
          display: true,
          text: 'Quantity',
          font: {
            size: 11,
            weight: '600'
          },
          padding: { bottom: 10 },
          color: '#374151'
        }
      },
      x: {
        stacked: false,
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 10,
            weight: '500'
          },
          padding: 8,
          color: '#374151'
        }
      }
    },
    barPercentage: 0.75,
    categoryPercentage: 0.85
  };

  const emptyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'No Data',
        data: Array(12).fill(0),
        backgroundColor: 'rgba(185, 28, 28, 0.2)',
        borderColor: 'rgba(220, 38, 38, 0.4)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Donation Trends by Category</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="text-sm bg-red-800 text-white border-0 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-900 cursor-pointer hover:bg-red-900 transition-colors"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="h-[420px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800"></div>
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
              <p className="text-sm text-gray-400">No donation data for {selectedYear}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationReportsChart;