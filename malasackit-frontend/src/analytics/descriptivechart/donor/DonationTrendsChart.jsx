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
    // Mock data for charts
    const donationData = [
        { month: 'Jan', amount: 520 },
        { month: 'Feb', amount: 630 },
        { month: 'Mar', amount: 540 },
        { month: 'Apr', amount: 480 },
        { month: 'May', amount: 720 },
        { month: 'Jun', amount: 1050 },
        { month: 'Jul', amount: 740 },
        { month: 'Aug', amount: 860 },
        { month: 'Sep', amount: 650 },
        { month: 'Oct', amount: 580 },
        { month: 'Nov', amount: 480 },
        { month: 'Dec', amount: 120 }
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
                max: 1200,
                ticks: {
                    stepSize: 200,
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
            
            {/* Chart Summary */}
            <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">₱7,380</div>
                    <div className="text-sm text-gray-500">Avg/Month</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">₱1,050</div>
                    <div className="text-sm text-gray-500">Highest</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">₱120</div>
                    <div className="text-sm text-gray-500">Lowest</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">12</div>
                    <div className="text-sm text-gray-500">Active Months</div>
                </div>
            </div>
        </div>
    );
}
