import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { HiDotsHorizontal } from 'react-icons/hi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { getDonorStatistics } from '../../../../services/donationService';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function DonationTrendsChart() {
    const [donationData, setDonationData] = useState([]);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        avgPerMonth: 0,
        highest: 0,
        lowest: 0,
        activeMonths: 0
    });

    // Generate year options dynamically from system start year (2023) to current year
    const systemStartYear = 2023;
    const yearRange = currentYear - systemStartYear + 1;
    const yearOptions = Array.from({ length: yearRange }, (_, i) => currentYear - i);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    useEffect(() => {
        const fetchTrendsData = async () => {
            setLoading(true);
            try {
                const response = await getDonorStatistics(selectedYear);
                if (response.success) {
                    const monthlyTrends = response.data.monthly_trends;
                    
                    // Transform the data for the chart
                    const chartData = monthNames.map((monthName, index) => {
                        const monthData = monthlyTrends.find(m => m.month === index + 1);
                        return {
                            month: monthName,
                            amount: monthData ? monthData.monthly_value : 0
                        };
                    });
                    
                    setDonationData(chartData);
                    
                    // Calculate enhanced statistics
                    const values = chartData.map(d => d.amount).filter(v => v > 0);
                    const totalValue = values.reduce((sum, val) => sum + val, 0);
                    const activeMonths = values.length;
                    
                    // Calculate true average (only from active months) vs overall average
                    const trueAverage = activeMonths > 0 ? totalValue / activeMonths : 0;
                    const overallAverage = totalValue / 12; // Spread over all 12 months
                    
                    setStatistics({
                        avgPerMonth: overallAverage, // Keep original logic for consistency
                        trueAverage: trueAverage, // Add true average for reference
                        highest: values.length > 0 ? Math.max(...values) : 0,
                        lowest: values.length > 0 ? Math.min(...values) : 0,
                        activeMonths: activeMonths,
                        totalValue: totalValue
                    });
                }
            } catch (error) {
                console.error('Error fetching donation trends:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendsData();
    }, [selectedYear]);

    // Chart.js Bar Chart Configuration
    const barChartData = {
        labels: donationData.map(d => d.month),
        datasets: [
            {
                label: 'Donation Amount (₱)',
                data: donationData.map(d => d.amount),
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return '#DC2626';
                    // Create vertical gradient from dark red at bottom to lighter red at top
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(127, 29, 29, 0.85)'); // Darker maroon at bottom
                    gradient.addColorStop(0.5, 'rgba(185, 28, 28, 0.9)'); // Mid red
                    gradient.addColorStop(1, 'rgba(220, 38, 38, 0.95)'); // Brighter red at top
                    return gradient;
                },
                borderWidth: 0,
                borderRadius: 4,
                borderSkipped: false,
            }
        ]
    };

    const maxValue = Math.max(...donationData.map(d => d.amount));
    
    // Enhanced scaling logic based on donation value ranges
    const calculateDynamicMax = (maxVal) => {
        if (maxVal === 0) return 1000; // Default minimum for empty state
        if (maxVal <= 5000) return Math.ceil(maxVal * 1.3); // Small donors range
        if (maxVal <= 25000) return Math.ceil(maxVal * 1.2); // Medium donors range  
        if (maxVal <= 250000) return Math.ceil(maxVal * 1.15); // Large donors range
        return Math.ceil(maxVal * 1.1); // Very large amounts
    };
    
    const dynamicMax = calculateDynamicMax(maxValue);
    
    // Calculate appropriate step size for ticks
    const getStepSize = (maxVal) => {
        if (maxVal <= 1000) return 200;
        if (maxVal <= 5000) return 500;
        if (maxVal <= 25000) return 2500;
        if (maxVal <= 100000) return 10000;
        if (maxVal <= 250000) return 25000;
        return 50000;
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1F2937',
                titleColor: '#F9FAFB',
                bodyColor: '#F9FAFB',
                borderColor: '#DC2626',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        return `₱${context.parsed.y.toLocaleString()}`;
                    },
                    afterLabel: function(context) {
                        const percentage = maxValue > 0 ? ((context.parsed.y / maxValue) * 100).toFixed(1) : 0;
                        return `${percentage}% of highest month`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: dynamicMax,
                ticks: {
                    stepSize: getStepSize(dynamicMax),
                    callback: function(value) {
                        // Format large numbers more compactly
                        if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
                        return `₱${value.toLocaleString()}`;
                    }
                },
                grid: {
                    color: '#E5E7EB',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Donation Trends</h3>
                <div className="flex items-center space-x-2">
                    <select 
                        className="text-sm bg-red-900 text-white border border-red-900 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 hover:bg-red-950 transition-colors"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                        <HiDotsHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            {/* Chart Container */}
            <div className="relative h-80">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-900"></div>
                    </div>
                ) : (
                    <Bar data={barChartData} options={barChartOptions} />
                )}
            </div>
            
            {/* Chart Summary */}
            <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                        {loading ? '...' : 
                         statistics.avgPerMonth >= 1000 ? 
                         `₱${(statistics.avgPerMonth / 1000).toFixed(1)}K` : 
                         `₱${Math.round(statistics.avgPerMonth).toLocaleString()}`
                        }
                    </div>
                    <div className="text-sm text-gray-500">Avg/Month</div>
                    {!loading && statistics.trueAverage !== statistics.avgPerMonth && statistics.activeMonths > 0 && (
                        <div className="text-xs text-gray-400">
                            (₱{statistics.trueAverage >= 1000 ? 
                              `${(statistics.trueAverage / 1000).toFixed(1)}K` : 
                              Math.round(statistics.trueAverage).toLocaleString()} active avg)
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                        {loading ? '...' : 
                         statistics.highest >= 1000 ? 
                         `₱${(statistics.highest / 1000).toFixed(1)}K` : 
                         `₱${statistics.highest.toLocaleString()}`
                        }
                    </div>
                    <div className="text-sm text-gray-500">Highest</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-red-900">
                        {loading ? '...' : 
                         statistics.lowest > 0 ? 
                         (statistics.lowest >= 1000 ? 
                          `₱${(statistics.lowest / 1000).toFixed(1)}K` : 
                          `₱${statistics.lowest.toLocaleString()}`) : 
                         '₱0'
                        }
                    </div>
                    <div className="text-sm text-gray-500">Lowest</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                        {loading ? '...' : statistics.activeMonths}
                    </div>
                    <div className="text-sm text-gray-500">Active Months</div>
                </div>
            </div>
            
            {/* Empty State Message or Data Message */}
            <div className="mt-4 text-center">
                {loading ? (
                    <p className="text-sm text-gray-400">Loading your donation trends...</p>
                ) : statistics.activeMonths === 0 ? (
                    <p className="text-sm text-gray-400">Start making donations to see your trends and statistics</p>
                ) : (
                    <p className="text-sm text-gray-600">Showing donation trends for {selectedYear}</p>
                )}
            </div>
        </div>
    );
}
