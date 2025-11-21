import { useState, useEffect } from 'react';
import { 
    HiUsers, 
    HiUserGroup, 
    HiCheckCircle, 
    HiClock,
    HiShieldCheck,
    HiHeart
} from 'react-icons/hi';
import dashboardService from '../../../../services/dashboardService';

export default function UserKPICards() {
    const [userStats, setUserStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await dashboardService.getAdminUserStatistics();
                
                if (response.success) {
                    setUserStats(response.data);
                } else {
                    throw new Error(response.message || 'Failed to fetch user statistics');
                }
            } catch (error) {
                console.error('Failed to fetch user statistics:', error);
                setError(error.message);
                
                // Set fallback data
                setUserStats({
                    activeStaff: 0,
                    activeDonors: 0,
                    totalStaff: 0,
                    totalDonors: 0,
                    registeredDonors: 0,
                    nonRegisteredDonors: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserStats();
    }, []);

    const kpiCards = [
        {
            title: 'Active Staff',
            value: userStats.activeStaff,
            total: userStats.totalStaff,
            subtitle: `${userStats.activeStaff}/${userStats.totalStaff} staff members`,
            icon: HiShieldCheck,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-900',
            subtitleColor: 'text-blue-600'
        },
        {
            title: 'Active Donors',
            value: userStats.activeDonors,
            total: userStats.totalDonors,
            subtitle: `${userStats.activeDonors}/${userStats.totalDonors} donors active`,
            icon: HiHeart,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            textColor: 'text-green-900',
            subtitleColor: 'text-green-600'
        },
        {
            title: 'Total Staff',
            value: userStats.totalStaff,
            subtitle: 'All staff members',
            icon: HiUsers,
            color: 'purple',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            textColor: 'text-purple-900',
            subtitleColor: 'text-purple-600'
        },
        {
            title: 'Total Donors',
            value: userStats.totalDonors,
            subtitle: 'All registered donors',
            icon: HiUserGroup,
            color: 'indigo',
            bgColor: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            textColor: 'text-indigo-900',
            subtitleColor: 'text-indigo-600'
        },
        {
            title: 'Registered Donors',
            value: userStats.registeredDonors,
            subtitle: 'Admin approved donors',
            icon: HiCheckCircle,
            color: 'emerald',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            textColor: 'text-emerald-900',
            subtitleColor: 'text-emerald-600'
        },
        {
            title: 'Pending Approval',
            value: userStats.nonRegisteredDonors,
            subtitle: 'Awaiting admin approval',
            icon: HiClock,
            color: 'orange',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-900',
            subtitleColor: 'text-orange-600'
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            </div>
                            <div className="ml-4 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Unable to fetch real-time data. Showing fallback values. Error: {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpiCards.map((card, index) => {
                    const IconComponent = card.icon;
                    
                    return (
                        <div key={index} className={`${card.bgColor} rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200`}>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <IconComponent className={`h-8 w-8 ${card.iconColor}`} />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className={`text-sm font-medium ${card.iconColor}`}>
                                        {card.title}
                                    </p>
                                    <div className="flex items-baseline">
                                        <p className={`text-2xl font-bold ${card.textColor}`}>
                                            {dashboardService.formatNumber(card.value || 0)}
                                        </p>
                                        {card.total && (
                                            <span className={`ml-2 text-sm ${card.subtitleColor}`}>
                                                / {dashboardService.formatNumber(card.total)}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs ${card.subtitleColor} mt-1`}>
                                        {card.subtitle}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Progress bar for active users */}
                            {card.total && (
                                <div className="mt-3">
                                    <div className="bg-white bg-opacity-50 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full bg-${card.color}-400`}
                                            style={{ 
                                                width: `${Math.min(((card.value || 0) / card.total) * 100, 100)}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Summary Stats */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {dashboardService.formatNumber((userStats.activeStaff || 0) + (userStats.activeDonors || 0))}
                        </p>
                        <p className="text-sm text-gray-600">Total Active Users</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {dashboardService.formatNumber((userStats.totalStaff || 0) + (userStats.totalDonors || 0))}
                        </p>
                        <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">
                            {dashboardService.formatNumber(userStats.registeredDonors || 0)}
                        </p>
                        <p className="text-sm text-gray-600">Approved Donors</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-orange-600">
                            {dashboardService.formatNumber(userStats.nonRegisteredDonors || 0)}
                        </p>
                        <p className="text-sm text-gray-600">Pending Approval</p>
                    </div>
                </div>
            </div>
        </div>
    );
}