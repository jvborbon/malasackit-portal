import DashboardLayout from '../components/DashboardLayout';
import StaffKPICards from '../analytics/descriptivechart/staff/StaffKPICards';
import DonationReportsChart from '../analytics/descriptivechart/staff/DonationReportsChart';
import TopDonorsSection from '../analytics/descriptivechart/staff/TopDonorsSection';
import TopParishesSection from '../analytics/descriptivechart/admin/TopParishesSection';
import TopMunicipalitySection from '../analytics/descriptivechart/admin/TopMunicipalitySection';
import DonatedItemsChart from '../analytics/descriptivechart/staff/DonatedItemsChart';
import UserProfileSettings from '../components/UserProfileSettings';

export default function AdminDashboard() {
    // Function to render main content based on active navigation
    const renderMainContent = ({ activeNav, userInfo }) => {
        switch (activeNav) {
            case 'User Management':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
                        <p className="text-gray-600">Manage users, roles, and permissions.</p>
                        {/* Add user management components here */}
                    </div>
                );
            
            case 'Reports':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Reports</h2>
                        <p className="text-gray-600">View system reports and analytics.</p>
                        {/* Add reporting components here */}
                    </div>
                );

            case 'System Settings':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
                        <p className="text-gray-600">Configure system-wide settings.</p>
                        {/* Add system settings components here */}
                    </div>
                );

            case 'Notifications':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Notifications</h2>
                        <p className="text-gray-600">System alerts and notifications.</p>
                        {/* Add admin notifications here */}
                    </div>
                );

            case 'Calendar':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">System Calendar</h2>
                        <p className="text-gray-600">System events and maintenance schedule.</p>
                        {/* Add admin calendar here */}
                    </div>
                );

            case 'Settings':
                return <UserProfileSettings userInfo={userInfo} />;

            default: // Dashboard (Overview)
                return (
                    <div className="space-y-6">
                        {/* KPI Cards */}
                        <StaffKPICards />
                        
                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Donation Reports Chart */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <DonationReportsChart />
                            </div>

                            {/* Top Donors Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <TopDonorsSection />
                            </div>
                        </div>

                        {/* New KPI Sections Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Parishes Section */}
                            <TopParishesSection />

                            {/* Top Municipality Section */}
                            <TopMunicipalitySection />
                        </div>

                        {/* Donated Items Chart */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <DonatedItemsChart />
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
