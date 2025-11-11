import DashboardLayout from '../components/DashboardLayout';
import StaffKPICards from '../components/analytics/descriptivechart/staff/StaffKPICards';
import DonationReportsChart from '../components/analytics/descriptivechart/staff/DonationReportsChart';
import TopDonorsSection from '../components/analytics/descriptivechart/staff/TopDonorsSection';
import TopParishesSection from '../components/analytics/descriptivechart/staff/TopParishesSection';
import TopMunicipalitySection from '../components/analytics/descriptivechart/staff/TopMunicipalitySection';
import DonatedItemsChart from '../components/analytics/descriptivechart/staff/DonatedItemsChart';
import Inventory from '../components/Inventory';
import DonationRequests from '../components/DonationRequests';
import BeneficiaryLogs from '../components/DistributionLogs';
import BeneficiaryManagement from '../components/BeneficiaryManagement';
import UserProfileSettings from '../components/UserProfileSettings';
import Calendar from '../components/Calendar';

export default function StaffDashboard() {
    // Function to render main content based on active navigation
    const renderMainContent = ({ activeNav, userInfo }) => {
        switch (activeNav) {
            case 'Donation Requests':
                return <DonationRequests />;
            
            case 'Inventory':
                return <Inventory />;

            case 'Beneficiary Management':
                return <BeneficiaryManagement />;

            case 'Distribution Logs':
                return <BeneficiaryLogs />;

            case 'Calendar':
                return <Calendar />;

            case 'Settings':
                return <UserProfileSettings userInfo={userInfo} />;

            default: // Dashboard (Overview)
                return (
                    <div className="space-y-1.5">
                        {/* KPI Cards */}
                        <StaffKPICards />

                        {/* First Row - Main Chart and Donated Items Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
                            {/* Donation Reports Chart - Takes 2/3 space */}
                            <div className="lg:col-span-2">
                                <DonationReportsChart />
                            </div>
                            
                            {/* Donated Items Chart - Takes 1/3 space */}
                            <div className="lg:col-span-1">
                                <DonatedItemsChart />
                            </div>
                        </div>

                        {/* Second Row - KPI Sections with Top Donors */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                            {/* Top Parishes Section */}
                            <div className="min-h-0">
                                <TopParishesSection />
                            </div>

                            {/* Top Municipality Section */}
                            <div className="min-h-0">
                                <TopMunicipalitySection />
                            </div>
                            
                            {/* Top Donors Section - Takes 1 column */}
                            <div className="min-h-0">
                                <TopDonorsSection />
                            </div>
                        </div>

                        {/* Third Row - Recent Activities */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <h3 className="text-sm font-semibold text-gray-800">Recent Activities</h3>
                                <button className="text-red-600 hover:text-red-700 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-red-50">
                                    View All
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                                <div className="flex items-center p-1.5 bg-gray-50 rounded text-xs">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 flex-shrink-0"></div>
                                    <span className="text-gray-700 truncate">New donation - ₱25,000</span>
                                </div>
                                <div className="flex items-center p-1.5 bg-gray-50 rounded text-xs">
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5 flex-shrink-0"></div>
                                    <span className="text-gray-700 truncate">Verification completed</span>
                                </div>
                                <div className="flex items-center p-1.5 bg-gray-50 rounded text-xs">
                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5 flex-shrink-0"></div>
                                    <span className="text-gray-700 truncate">Report generated</span>
                                </div>

                                <div className="flex items-center p-1.5 bg-gray-50 rounded text-xs">
                                    <div className="w-1.5 h-1.5 bg-red-700 rounded-full mr-1.5 flex-shrink-0"></div>
                                    <span className="text-gray-700 truncate">Request approved</span>
                                </div>
                                <div className="flex items-center p-1.5 bg-gray-50 rounded text-xs">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 flex-shrink-0"></div>
                                    <span className="text-gray-700 truncate">Meeting scheduled</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <DashboardLayout userRole="staff">
            {renderMainContent}
        </DashboardLayout>
    );
}
