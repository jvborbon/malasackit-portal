import { useState, useEffect } from 'react';
import { 
    HiTrendingUp,
    HiCheckCircle,
    HiCurrencyDollar,
    HiGift
} from 'react-icons/hi';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { getDonorStatistics } from '../../../../services/donationService';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonorKPICards() {
    const [statistics, setStatistics] = useState({
        totalWorth: 0,
        successfulDonations: 0,
        pendingDonations: 0,
        failedDonations: 0,
        totalDonations: 0,
        totalItems: 0,
        categories: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await getDonorStatistics();
                if (response.success) {
                    const stats = response.data.statistics;
                    setStatistics({
                        totalWorth: stats.total_worth_of_response || 0,
                        successfulDonations: stats.successful_donations || 0,
                        pendingDonations: stats.pending_count || 0,
                        failedDonations: stats.rejected_count || 0,
                        totalDonations: stats.total_donations || 0,
                        totalItems: stats.total_items_given || 0,
                        categories: response.data.categories || []
                    });
                }
            } catch (error) {
                console.error('Error fetching donor statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    const successRateData = {
        labels: ['Successful', 'Pending', 'Failed'],
        datasets: [
            {
                data: [
                    statistics.successfulDonations || 0,
                    statistics.pendingDonations || 0,
                    statistics.failedDonations || 0
                ],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                borderColor: ['#059669', '#D97706', '#DC2626'],
                borderWidth: 2,
            }
        ]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 12,
                    usePointStyle: true,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '65%'
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-5 sm:mb-6 md:mb-7 lg:mb-8">
            {/* Total Worth of Response */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 md:p-6 border-l-4 border-red-600 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-red-600 font-semibold text-sm sm:text-base">Total Worth of Response</h3>
                    <div className="bg-red-100 p-2 sm:p-2.5 md:p-3 rounded-full flex-shrink-0">
                        <HiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                </div>
                
                {/* Main Value */}
                <div className="flex items-center mb-2">
                    <HiCurrencyDollar className="text-2xl sm:text-3xl text-red-600 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                        {loading ? '...' : `₱${statistics.totalWorth.toLocaleString()}`}
                    </span>
                </div>
                
                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-500">
                    {loading ? 'Loading...' : statistics.totalWorth === 0 ? 'No data available' : 'From approved/completed donations'}
                </p>
            </div>

            {/* Donation Status Overview with Chart */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 md:p-6 border-l-4 border-green-600 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-green-600 font-semibold text-sm sm:text-base">Donation Status</h3>
                    <div className="bg-green-100 p-2 sm:p-2.5 md:p-3 rounded-full flex-shrink-0">
                        <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                </div>
                
                {/* Total count */}
                <div className="text-center mb-3">
                    <div className="flex items-baseline justify-center gap-1.5">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">
                            {loading ? '...' : statistics.totalDonations}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">total</span>
                    </div>
                </div>
                
                {/* Chart with stats */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-32 sm:h-36 md:h-40">
                        <Doughnut data={successRateData} options={doughnutOptions} />
                    </div>
                    
                    <div className="flex flex-col gap-3 pr-2">
                        <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600">
                                {loading ? '...' : statistics.successfulDonations}
                            </div>
                            <div className="text-xs text-gray-500">Successful</div>
                        </div>
                        <div className="h-px bg-gray-200"></div>
                        <div className="text-center">
                            <div className="text-lg sm:text-xl font-semibold text-amber-600">
                                {loading ? '...' : statistics.pendingDonations}
                            </div>
                            <div className="text-xs text-gray-500">Pending</div>
                        </div>
                        <div className="h-px bg-gray-200"></div>
                        <div className="text-center">
                            <div className="text-lg sm:text-xl font-semibold text-red-600">
                                {loading ? '...' : statistics.failedDonations}
                            </div>
                            <div className="text-xs text-gray-500">Failed</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Items Given */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 md:p-6 border-l-4 border-blue-600 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-blue-600 font-semibold text-sm sm:text-base">Total Items Given</h3>
                    <div className="bg-blue-100 p-2 sm:p-2.5 md:p-3 rounded-full flex-shrink-0">
                        <HiGift className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                </div>
                
                {/* Main Value */}
                <div className="flex items-center mb-2">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                        {loading ? '...' : statistics.totalItems}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 ml-1.5 sm:ml-2">items</span>
                </div>
                
                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-500 mb-3">
                    {loading ? 'Loading...' : statistics.categories.length === 0 ? 'No categories yet' : 
                     `${statistics.categories.length} categories donated`}
                </p>
                
                {/* Category breakdown */}
                <div>
                    {loading ? (
                        <div className="text-center text-sm text-gray-400 py-4">
                            <p>Loading categories...</p>
                        </div>
                    ) : statistics.categories.length > 0 ? (
                        <div className="space-y-2">
                            {statistics.categories.slice(0, 3).map((category, index) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600 truncate">{category.category_name}</span>
                                    <span className="text-blue-600 font-medium">
                                        {category.total_quantity} items
                                    </span>
                                </div>
                            ))}
                            {statistics.categories.length > 3 && (
                                <div className="text-xs text-gray-400 text-center pt-1">
                                    +{statistics.categories.length - 3} more categories
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-400 py-4">
                            <p>Donation categories will appear here</p>
                            <p className="text-xs">when you start making donations</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}