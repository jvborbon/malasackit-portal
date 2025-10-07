import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import DonorDonationForm from '../components/DonorDonationForm';
import Notifs from '../components/Notifs';
import Calendar from '../components/Calendar';
import UserProfileSettings from '../components/UserProfileSettings';
import DonorKPICards from '../analytics/descriptivechart/donor/DonorKPICards';
import DonationTrendsChart from '../analytics/descriptivechart/donor/DonationTrendsChart';

export default function DonorDashboard() {
    // Function to render main content based on active navigation
    const renderMainContent = ({ activeNav, userInfo }) => {
        switch (activeNav) {
            case 'Donate Now':
                return <DonorDonationForm />;

            case 'Donation History':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">You don't have any request at the moment.</h2>
                        {/* Render donation history content here */}
                    </div>
                );

            case 'Notifications':
                return <Notifs />;

            case 'Calendar':
                return <Calendar />;

            case 'Settings':
                return <UserProfileSettings userInfo={userInfo} />;

            default: // Dashboard (Overview)
                return (
                    <>
                        {/* Statistics Cards */}
                        <DonorKPICards />
                        
                        {/* Donation Trends Chart */}
                        <DonationTrendsChart />
                    </>
                );
        }
    };

    return (
        <DashboardLayout userRole="donor">
            {renderMainContent}
        </DashboardLayout>
    );
}
