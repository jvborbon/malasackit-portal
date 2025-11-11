import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import DonorDonationForm from '../components/DonorDonationForm';
import Notifs from '../components/Notifs';
import Calendar from '../components/Calendar';
import UserProfileSettings from '../components/UserProfileSettings';
import DonorKPICards from '../components/analytics/descriptivechart/donor/DonorKPICards';
import DonationTrendsChart from '../components/analytics/descriptivechart/donor/DonationTrendsChart';
import DonorDonationHistory from '../components/DonorDonationHistory';

export default function DonorDashboard() {
    // Function to render main content based on active navigation
    const renderMainContent = ({ activeNav, userInfo }) => {
        switch (activeNav) {
            case 'Donate Now':
                return <DonorDonationForm />;

            case 'Donation History':
                return <DonorDonationHistory />;

            case 'Notifications':
                return <Notifs />;

            case 'Calendar':
                return <Calendar />;

            case 'Settings':
                return <UserProfileSettings userInfo={userInfo} />;

            default: // Dashboard (Overview)
                return (
                    <>
                        <DonorKPICards />
                        
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
