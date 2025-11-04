import { useState, useEffect } from 'react';
import { 
    HiUsers, 
    HiUserGroup, 
    HiCheckCircle, 
    HiClock,
    HiShieldCheck,
    HiHeart
} from 'react-icons/hi';

export default function UserKPICards() {
    const [userStats, setUserStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data - replace with actual API calls
        const mockUserStats = {
            // Active Users
            activeStaff: 3,
            activeDonors: 8,
            
            // Total Users
            totalStaff: 4,
            totalDonors: 12,
            
            // Donor Registration Status
            registeredDonors: 8,
            nonRegisteredDonors: 4  // Pending admin approval
        };

        // Set data immediately since it's mock data
        setUserStats(mockUserStats);
        setLoading(false);
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
                                            {card.value || 0}
                                        </p>
                                        {card.total && (
                                            <span className={`ml-2 text-sm ${card.subtitleColor}`}>
                                                / {card.total}
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
                                                width: `${((card.value || 0) / card.total) * 100}%` 
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
                            {(userStats.activeStaff || 0) + (userStats.activeDonors || 0)}
                        </p>
                        <p className="text-sm text-gray-600">Total Active Users</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {(userStats.totalStaff || 0) + (userStats.totalDonors || 0)}
                        </p>
                        <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">
                            {userStats.registeredDonors || 0}
                        </p>
                        <p className="text-sm text-gray-600">Approved Donors</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-orange-600">
                            {userStats.nonRegisteredDonors || 0}
                        </p>
                        <p className="text-sm text-gray-600">Pending Approval</p>
                    </div>
                </div>
            </div>
        </div>
    );
}