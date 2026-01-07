import DashboardLayout from '../components/DashboardLayout';
import StaffKPICards from '../components/analytics/descriptivechart/staff/StaffKPICards';
import DonationReportsChart from '../components/analytics/descriptivechart/staff/DonationReportsChart';
import TopIndividualDonors from '../components/analytics/descriptivechart/staff/TopIndividualDonors';
import TopOrganizationDonors from '../components/analytics/descriptivechart/staff/TopOrganizationDonors';
import DonatedItemsChart from '../components/analytics/descriptivechart/staff/DonatedItemsChart';
import Inventory from '../components/Inventory';
import DonationRequests from '../components/DonationRequests';
import BeneficiaryLogs from '../components/DistributionLogsNew';
import BeneficiaryManagement from '../components/BeneficiaryManagementNew';
import UserProfileSettings from '../components/UserProfileSettings';
import Calendar from '../components/Calendar';
import Notifs from '../components/Notifs';
import WalkInDonationForm from '../components/WalkInDonationForm';

export default function StaffDashboard() {
    return (
        <DashboardLayout userRole="staff">
            {({ activeNav, userInfo, showWalkInModal, setShowWalkInModal }) => {
                // Function to render main content based on active navigation
                const renderMainContent = () => {
                    switch (activeNav) {
                        case 'Donation Requests':
                            return <DonationRequests onWalkInClick={() => setShowWalkInModal(true)} userRole="staff" />;
                        
                        case 'Inventory':
                            return <Inventory />;

                        case 'Beneficiary Management':
                            return <BeneficiaryManagement />;

                        case 'Distribution Logs':
                            return <BeneficiaryLogs userRole="staff" />;

                        case 'Notifications':
                            return <Notifs />;

                        case 'Calendar':
                            return <Calendar userRole="staff" />;

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

                                    {/* Second Row - Top Donors */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                        {/* Top Individual Donors Section */}
                                        <div className="min-h-0">
                                            <TopIndividualDonors />
                                        </div>

                                        {/* Top Organizations Section */}
                                        <div className="min-h-0">
                                            <TopOrganizationDonors />
                                        </div>
                                    </div>
                                </div>
                            );
                    }
                };

                return (
                    <>
                        {renderMainContent()}
                        <WalkInDonationForm 
                            isOpen={showWalkInModal}
                            onClose={() => setShowWalkInModal(false)}
                            onSuccess={(data) => {
                                console.log('Walk-in donation recorded:', data);
                                // Optionally refresh data or show success message
                            }}
                        />
                    </>
                );
            }}
        </DashboardLayout>
    );
}
