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
    HiClipboardList,
    HiMenu,
    HiX,
    HiUserGroup,
    HiChevronLeft,
    HiChevronRight,
    HiUserCircle
} from 'react-icons/hi';
import { useAuth } from '../auth/Authentication';
import LogoutConfirm from './dialogs/LogoutConfim';
import lasacLogo from '../assets/images/lasac-logo.png';

// Enhanced Sidebar Collapse Button Component
const SidebarCollapseButton = ({ isCollapsed, onClick, className = "" }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${className}`}
            style={{
                background: isHovered 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(255, 255, 255, 0.08)',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {/* Icon with smooth animation */}
            <div 
                className="transition-transform duration-300"
                style={{
                    transform: isHovered 
                        ? (isCollapsed ? 'translateX(2px)' : 'translateX(-2px)') 
                        : 'translateX(0)'
                }}
            >
                {isCollapsed ? (
                    <HiChevronRight className="w-4 h-4 text-white" />
                ) : (
                    <HiChevronLeft className="w-4 h-4 text-white" />
                )}
            </div>

            {/* Animated border pulse on hover */}
            {isHovered && (
                <div 
                    className="absolute inset-0 rounded-lg border-2 border-white"
                    style={{
                        opacity: 0.3,
                        animation: 'pulse 1s ease-in-out infinite'
                    }}
                />
            )}
        </button>
    );
};

export default function DashboardLayout({ children, userRole }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeNav, setActiveNav] = useState('Dashboard');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showWalkInModal, setShowWalkInModal] = useState(false);

    // Simple effect to redirect if no user (handled by RouteProtection now)
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Load collapse state from localStorage on mount
    useEffect(() => {
        const savedCollapseState = localStorage.getItem('sidebarCollapsed');
        if (savedCollapseState !== null) {
            setIsCollapsed(savedCollapseState === 'true');
        }
    }, []);

    // Save collapse state to localStorage whenever it changes
    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', newState.toString());
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = async () => {
        try {
            await logout();
            setShowLogoutConfirm(false);
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            setShowLogoutConfirm(false);
            navigate('/login', { replace: true });
        }
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
                { name: 'Donation History', icon: HiClipboardList, position: 2 },
                { name: 'Notifications', icon: HiBell, position: 3 },
                { name: 'Calendar', icon: HiCalendar, position: 4 },
                { name: 'Settings', icon: HiCog, position: 5 }
            ],
            admin: [
                { name: 'User Management', icon: HiUsers, position: 1 },
                { name: 'Beneficiary Management', icon: HiUserGroup, position: 2 },
                { name: 'Distribution Logs', icon: HiClipboardCheck, position: 3 },
                { name: 'Donation Requests', icon: HiDatabase, position: 4 },
                { name: 'Notifications', icon: HiBell, position: 5 },
                { name: 'Calendar', icon: HiCalendar, position: 6 },
                { name: 'Settings', icon: HiCog, position: 7 }
            ],
            staff: [
                { name: 'Inventory', icon: HiDatabase, position: 1 },
                { name: 'Beneficiary Management', icon: HiUserGroup, position: 2 },
                { name: 'Donation Requests', icon: HiClipboardCheck, position: 3 },
                { name: 'Distribution Logs', icon: HiUsers, position: 4 },
                { name: 'Notifications', icon: HiBell, position: 5 },
                { name: 'Calendar', icon: HiCalendar, position: 6 },
                { name: 'Settings', icon: HiCog, position: 7 }
            ]
        };

        const items = [...commonItems];
        const roleItems = roleSpecificItems[role] || [];
        
        roleItems.forEach(item => {
            items.splice(item.position, 0, { name: item.name, icon: item.icon });
        });

        return items;
    };

    const navigationItems = getNavigationItems(userRole);

    // Get header title based on active navigation
    const getHeaderTitle = (activeNav, userRole) => {
        if (activeNav === 'Dashboard') {
            switch(userRole) {
                case 'admin':
                    return 'Admin Dashboard';
                case 'staff':
                    return 'Staff Dashboard';
                case 'donor':
                    return 'Donor Dashboard';
                default:
                    return 'Dashboard';
            }
        }
        
        const titleMap = {
            'Inventory': 'Inventory Management', 
            'Donation Requests': 'Donation Request Management',
            'Distribution Logs': 'Distribution Management',
            'User Management': 'User Administration',
            'Beneficiary Management': 'Beneficiary Management',
            'Donate Now': 'Make a Donation',
            'Donation History': 'Donation Dashboard',
            'Notifications': 'Notifications Center',
            'Calendar': 'Event Calendar',
            'Settings': 'Account Settings'
        };
        return titleMap[activeNav] || activeNav;
    };

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

    // Get abbreviated portal name for collapsed state
    const getPortalAbbr = (role) => {
        switch(role) {
            case 'admin':
                return 'AP';
            case 'staff':
                return 'SP';
            case 'donor':
            default:
                return 'MP';
        }
    };

    const handleAvatarClick = () => {
        setActiveNav('Settings');
        setIsSidebarOpen(false);
    };

    // Loading state if user data is not available yet
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Keyframes for pulse animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
            `}</style>

            {/* Mobile Menu Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 bg-theme-primary text-white transform transition-all duration-300 ease-in-out flex flex-col ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } ${isCollapsed ? 'lg:w-20' : 'w-64'} overflow-visible`}>
                {/* Logo Section */}
                <div className="flex items-center border-b border-theme-primary-dark flex-shrink-0 p-4">
                    {!isCollapsed ? (
                        <>
                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0 p-1">
                                <img src={lasacLogo} alt="LASAC" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-base font-bold ml-3 flex-1 min-w-0 truncate">
                                {getPortalName(userRole)}
                            </span>
                            {/* Enhanced Collapse Toggle Button - Desktop Only */}
                            <SidebarCollapseButton 
                                isCollapsed={isCollapsed}
                                onClick={toggleCollapse}
                                className="hidden lg:block flex-shrink-0 ml-2"
                            />
                            {/* Close button for mobile */}
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden p-1.5 rounded-md hover:bg-theme-primary-dark flex-shrink-0 ml-2"
                            >
                                <HiX className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center justify-center w-full gap-2">
                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0 p-1">
                                <img src={lasacLogo} alt="LASAC" className="w-full h-full object-contain" />
                            </div>
                            {/* Enhanced Collapse Toggle Button - Desktop Only */}
                            <SidebarCollapseButton 
                                isCollapsed={isCollapsed}
                                onClick={toggleCollapse}
                                className="hidden lg:block flex-shrink-0"
                            />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-visible" style={{ overflowX: 'visible' }}>
                    <ul className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
                        {navigationItems.map((item) => (
                            <li key={item.name} className="relative" style={{ overflow: 'visible' }}>
                                <button
                                    onClick={() => {
                                        setActiveNav(item.name);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center text-left rounded-lg transition-colors relative group ${
                                        activeNav === item.name
                                            ? 'bg-theme-primary-dark text-white'
                                            : 'text-red-100 hover:bg-theme-primary-dark hover:text-white'
                                    } ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}`}
                                    style={{ overflow: 'visible' }}
                                >
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${!isCollapsed && 'mr-3'}`} />
                                    {!isCollapsed && (
                                        <span className="truncate">{item.name}</span>
                                    )}
                                    
                                    {/* Tooltip - fixed position relative to viewport */}
                                    <div className="fixed px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] pointer-events-none"
                                         style={{
                                             left: isCollapsed ? '88px' : '272px',
                                             transform: 'translateY(-50%)',
                                             marginTop: '0'
                                         }}>
                                        {item.name}
                                        {/* Arrow pointing to button */}
                                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900 -mr-[1px]"></div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className={`border-t border-theme-primary-dark flex-shrink-0 ${isCollapsed ? 'p-2' : 'p-3'}`}>
                    <button
                        onClick={handleLogoutClick}
                        className={`w-full flex items-center text-red-100 hover:bg-theme-primary-dark hover:text-white rounded-lg transition-colors relative group ${
                            isCollapsed ? 'justify-center p-3' : 'px-4 py-3'
                        }`}
                    >
                        <HiLogout className={`w-5 h-5 flex-shrink-0 ${!isCollapsed && 'mr-3'}`} />
                        {!isCollapsed && <span>Logout</span>}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="hidden lg:block absolute left-full ml-6 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] pointer-events-none">
                                Logout
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900 -mr-[1px]"></div>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-1.5 sm:mr-2 flex-shrink-0"
                            >
                                <HiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                                {getHeaderTitle(activeNav, userRole)}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-4 flex-shrink-0">
                            <span className="hidden sm:inline text-gray-600 text-xs sm:text-sm lg:text-base font-medium">
                                Welcome, {userRole.charAt(0).toUpperCase() + userRole.slice(1)}!
                            </span>
                            <button
                                type="button"
                                onClick={handleAvatarClick}
                                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                                aria-label="Open profile settings"
                            >
                                <HiUserCircle className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className={`p-3 sm:p-4 md:p-5 lg:p-6 ${activeNav === 'Donation Requests' ? 'h-[calc(100vh-80px)] flex flex-col overflow-hidden' : ''}`}>
                    <div className={`${activeNav === 'Donation Requests' ? 'flex-1 flex flex-col min-h-0' : ''}`}>
                        {children({ 
                            activeNav, 
                            userInfo: user, 
                            setActiveNav,
                            showWalkInModal,
                            setShowWalkInModal 
                        })}
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