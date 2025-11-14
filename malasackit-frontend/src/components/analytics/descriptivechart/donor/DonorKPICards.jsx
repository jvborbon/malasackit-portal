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

    // Calculate donation status data with separate pending and failed
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
                    padding: 15,
                    usePointStyle: true,
                }
            }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Worth of Response */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-600 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-red-600 font-semibold mb-2">Total Worth of Response</h3>
                        <div className="flex items-center">
                            <HiCurrencyDollar className="text-3xl text-red-600 mr-2" />
                            <span className="text-2xl font-bold text-gray-900">
                                {loading ? '...' : `₱${statistics.totalWorth.toLocaleString()}`}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {loading ? 'Loading...' : statistics.totalWorth === 0 ? 'No data available' : 'From approved/completed donations'}
                        </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                        <HiTrendingUp className="w-6 h-6 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Donation Status Overview with Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-green-600 font-semibold mb-2">Donation Status Overview</h3>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-gray-900">
                                {loading ? '...' : statistics.successfulDonations}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">successful</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {loading ? 'Loading...' : 
                             `${statistics.pendingDonations || 0} pending • ${statistics.failedDonations || 0} failed`}
                        </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                        <HiCheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                <div className="h-24">
                    <Doughnut data={successRateData} options={doughnutOptions} />
                </div>
            </div>

            {/* Total Items Given */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-blue-600 font-semibold mb-2">Total Items Given</h3>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-gray-900">
                                {loading ? '...' : statistics.totalItems}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">items</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {loading ? 'Loading...' : statistics.categories.length === 0 ? 'No categories yet' : 
                             `${statistics.categories.length} categories donated`}
                        </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                        <HiGift className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                {/* Category breakdown - shows actual categories or placeholder */}
                <div className="mt-4 space-y-1">
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
