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
import BeneficiaryManagement from '../components/BeneficiaryManagement';
import Calendar from '../components/Calendar';
import Notifs from '../components/Notifs';
import WalkInDonationForm from '../components/WalkInDonationForm';


export default function AdminDashboard() {
    return (
        <DashboardLayout userRole="admin">
            {({ activeNav, userInfo, setActiveNav, showWalkInModal, setShowWalkInModal }) => {
                // Function to render main content based on active navigation
                const renderMainContent = () => {
                    switch (activeNav) {
                        case 'User Management':
                            return <UserManagement />;
                        
                        case 'Beneficiary Management':
                            return <BeneficiaryManagement />;
                        
                        case 'Distribution Logs':
                           return <BeneficiaryLogs />;

                        case 'Donation Requests':
                            return <DonationRequests onWalkInClick={() => setShowWalkInModal(true)} userRole="admin" />;

                        case 'Notifications':
                            return <Notifs />;

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
