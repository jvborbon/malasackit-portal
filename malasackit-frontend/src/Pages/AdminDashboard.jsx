import DashboardLayout from '../components/DashboardLayout';
import StaffKPICards from '../components/analytics/descriptivechart/staff/StaffKPICards';
import DonationReportsChart from '../components/analytics/descriptivechart/staff/DonationReportsChart';
import TopDonorsSection from '../components/analytics/descriptivechart/staff/TopDonorsSection';
import TopParishesSection from '../components/analytics/descriptivechart/admin/TopParishesSection';
import TopMunicipalitySection from '../components/analytics/descriptivechart/admin/TopMunicipalitySection';
import DonatedItemsChart from '../components/analytics/descriptivechart/staff/DonatedItemsChart';
import UserKPICards from '../components/analytics/descriptivechart/admin/UserKPICards';
import UserProfileSettings from '../components/UserProfileSettings';
import DonationRequests from '../components/DonationRequests';
import BeneficiaryLogs from '../components/DistributionLogs';
import UserManagement from '../components/UserManagement';
import Calendar from '../components/Calendar';


export default function AdminDashboard() {
    // Function to render main content based on active navigation
    const renderMainContent = ({ activeNav, userInfo, setActiveNav }) => {
        switch (activeNav) {
            case 'User Management':
                return <UserManagement />;
            
            case 'Distribution Logs':
               return <BeneficiaryLogs />;

            case 'Donation Requests':
                return <DonationRequests />;

            case 'Notifications':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Notifications</h2>
                        <p className="text-gray-600">System alerts and notifications.</p>
                        {/* Add admin notifications here */}
                    </div>
                );

            case 'Calendar':
                return <Calendar />;

            case 'Settings':
                return <UserProfileSettings userInfo={userInfo} />;

            default: // Dashboard (Overview)
                return (
                    <div className="space-y-6">
                        <StaffKPICards />
                        
                        {/* User Management KPIs */}
                        <UserKPICards />
                        
                        {/* Donation Reports Chart - Full Width */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <DonationReportsChart />
                        </div>
                        
                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <DonatedItemsChart />
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <TopDonorsSection />
                            </div>
                        </div>

                        {/* New KPI Sections Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TopParishesSection />
                            <TopMunicipalitySection />
                        </div>
                    </div>
                );
        }
    };

    return (
        <DashboardLayout userRole="admin">
            {renderMainContent}
        </DashboardLayout>
    );
}
