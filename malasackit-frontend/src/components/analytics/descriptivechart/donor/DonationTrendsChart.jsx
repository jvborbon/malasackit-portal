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
    // Empty data - will be populated when donation API is implemented
    const donationData = [
        { month: 'Jan', amount: 0 },
        { month: 'Feb', amount: 0 },
        { month: 'Mar', amount: 0 },
        { month: 'Apr', amount: 0 },
        { month: 'May', amount: 0 },
        { month: 'Jun', amount: 0 },
        { month: 'Jul', amount: 0 },
        { month: 'Aug', amount: 0 },
        { month: 'Sep', amount: 0 },
        { month: 'Oct', amount: 0 },
        { month: 'Nov', amount: 0 },
        { month: 'Dec', amount: 0 }
    ];

    // Chart.js Bar Chart Configuration
    const barChartData = {
        labels: donationData.map(d => d.month),
        datasets: [
            {
                label: 'Donation Amount (₱)',
                data: donationData.map(d => d.amount),
                backgroundColor: '#DC2626',
                borderColor: '#B91C1C',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }
        ]
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
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    callback: function(value) {
                        return value;
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
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Donation Trends</h3>
                <div className="flex items-center space-x-2">
                    <select className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-red-500">
                        <option>2025</option>
                        <option>2024</option>
                    </select>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                        <HiDotsHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            {/* Chart Container */}
            <div className="relative h-80">
                <Bar data={barChartData} options={barChartOptions} />
            </div>
            
            {/* Chart Summary - Empty State */}
            <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">₱0</div>
                    <div className="text-sm text-gray-500">Avg/Month</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">₱0</div>
                    <div className="text-sm text-gray-500">Highest</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">₱0</div>
                    <div className="text-sm text-gray-500">Lowest</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">0</div>
                    <div className="text-sm text-gray-500">Active Months</div>
                </div>
            </div>
            
            {/* Empty State Message */}
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">Start making donations to see your trends and statistics</p>
            </div>
        </div>
    );
}
