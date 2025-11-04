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

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonorKPICards() {
    // Doughnut Chart for Success Rate
    const successRateData = {
        labels: ['Successful', 'Pending', 'Failed'],
        datasets: [
            {
                data: [47, 8, 3],
                backgroundColor: ['#DC2626', '#FCA5A5', '#FEE2E2'],
                borderColor: ['#B91C1C', '#F87171', '#FECACA'],
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
                            <span className="text-2xl font-bold text-gray-900">25,850.00</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                        <HiTrendingUp className="w-6 h-6 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Total Successful Donations with Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-green-600 font-semibold mb-2">Total Successful Donations</h3>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-gray-900">47</span>
                            <span className="text-sm text-gray-500 ml-2">/ 58 total</span>
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
                            <span className="text-2xl font-bold text-gray-900">156</span>
                            <span className="text-sm text-gray-500 ml-2">items</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Across 12 categories</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                        <HiGift className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                {/* Mini progress bars for categories */}
                <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Food</span>
                        <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-blue-600 h-1 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Clothing</span>
                        <span>30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-blue-400 h-1 rounded-full" style={{width: '30%'}}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Others</span>
                        <span>25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-blue-300 h-1 rounded-full" style={{width: '25%'}}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
