import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HiHome, 
    HiGift, 
    HiBell, 
    HiCalendar, 
    HiCog, 
    HiLogout,
    HiDotsHorizontal,
    HiUsers,
    HiClipboardCheck,
    HiChartBar,
    HiDatabase,
    HiClock,
    HiMenu,
    HiX
} from 'react-icons/hi';
import LogoutConfirm from '../dialogs/LogoutConfim';

export default function DashboardLayout({ children, userRole }) {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [activeNav, setActiveNav] = useState('Dashboard');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // Get user info from localStorage (set during login)
        const user = localStorage.getItem('userInfo');
        if (user) {
            setUserInfo(JSON.parse(user));
        } else {
            // If no user info, redirect to login
            navigate('/login');
        }
    }, [navigate]);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
        setShowLogoutConfirm(false);
        navigate('/login');
    };

    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
    };

    // Navigation items based on user role
    const getNavigationItems = (role) => {
        const commonItems = [
            { name: 'Dashboard', icon: HiHome }
        ];

        const roleSpecificItems = {
            donor: [
                { name: 'Donate Now', icon: HiGift, position: 1 },
                { name: 'Notifications', icon: HiBell, position: 2 },
                { name: 'Calendar', icon: HiCalendar, position: 3 },
                { name: 'Settings', icon: HiCog, position: 4 }
            ],
            admin: [
                { name: 'User Management', icon: HiUsers, position: 1 },
                { name: 'Beneficiary Logs', icon: HiClipboardCheck, position: 2 },
                { name: 'Donation Requests', icon: HiDatabase, position: 3 },
                { name: 'Notifications', icon: HiBell, position: 4 },
                { name: 'Calendar', icon: HiCalendar, position: 5 },
                { name: 'Settings', icon: HiCog, position: 6 }
            ],
            staff: [
                { name: 'Inventory Management', icon: HiDatabase, position: 1 },
                { name: 'Donation Requests', icon: HiClipboardCheck, position: 2 },
                { name: 'Beneficiary Logs', icon: HiUsers, position: 3 },
                { name: 'Calendar', icon: HiCalendar, position: 4 },
                { name: 'Settings', icon: HiCog, position: 5 }
            ]
        };

        // Insert role-specific items at their designated positions
        const items = [...commonItems];
        const roleItems = roleSpecificItems[role] || [];
        
        roleItems.forEach(item => {
            items.splice(item.position, 0, { name: item.name, icon: item.icon });
        });

        return items;
    };

    const navigationItems = getNavigationItems(userRole);

    // Get portal name based on role
    const getPortalName = (role) => {
        switch(role) {
            case 'admin':
                return 'Admin Portal';
            case 'staff':
                return 'Staff Portal';
            case 'donor':
            default:
                return 'Malasackit Portal';
        }
    };

    if (!userInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Menu Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-red-600 text-white transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                {/* Logo Section */}
                <div className="flex items-center justify-between p-6 border-b border-red-500">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center mr-3">
                            <HiHome className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-lg font-bold">{getPortalName(userRole)}</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-red-500"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-2">
                        {navigationItems.map((item) => (
                            <li key={item.name}>
                                <button
                                    onClick={() => {
                                        setActiveNav(item.name);
                                        setIsSidebarOpen(false); // Close mobile menu on item click
                                    }}
                                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                        activeNav === item.name
                                            ? 'bg-red-700 text-white'
                                            : 'text-red-100 hover:bg-red-500 hover:text-white'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-red-500">
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center px-4 py-3 text-red-100 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                    >
                        <HiLogout className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:ml-64">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b px-4 lg:px-6 py-4 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-2"
                            >
                                <HiMenu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                                {activeNav === 'Dashboard' ? 'Dashboard' : activeNav}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-4">
                            <span className="text-gray-600 text-sm lg:text-base font-medium">
                                Welcome, {userRole.charAt(0).toUpperCase() + userRole.slice(1)}!
                            </span>
                            <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-4 lg:p-6 overflow-x-auto">
                    <div className="min-w-0">
                        {children({ activeNav, userInfo, setActiveNav })}
                    </div>
                </main>
            </div>

            {/* Logout Confirmation Dialog */}
            <LogoutConfirm 
                isOpen={showLogoutConfirm}
                onClose={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
            />
        </div>
    );
}
