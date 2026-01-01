import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import lasacLogo from '../assets/images/lasac-logo.png';
import kasaloImage from '../assets/images/kasalo.jpg';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

// Welcome Message
const WELCOME_MESSAGES = [
    "Welcome to Malasackit Portal!",
    "Enlarge the Space of Your Tent."
];

// Display duration/loop
const MESSAGE_DISPLAY_DURATION = 4000;
const FADE_OUT_DURATION = 300;
const FADE_IN_DURATION = 100;

export default function AuthPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentView, setCurrentView] = useState('login'); 
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [isMessageTransitioning, setIsMessageTransitioning] = useState(false);

    // Prevent unnecessary re-renders
    const rotateMessage = useCallback(() => {
        setIsMessageTransitioning(true);
        
        setTimeout(() => {
            setCurrentMessageIndex(prev => (prev + 1) % WELCOME_MESSAGES.length);
            
            setTimeout(() => {
                setIsMessageTransitioning(false);
            }, FADE_IN_DURATION);
        }, FADE_OUT_DURATION);
    }, []);

    useEffect(() => {
       
        const interval = setInterval(rotateMessage, MESSAGE_DISPLAY_DURATION);

        return () => {
            clearInterval(interval);
        };
    }, [rotateMessage]);

    const handleViewSwitch = (newView) => {
        if (newView === currentView) return;
        
        setIsTransitioning(true);
        
        // Wait for fade out animation
        setTimeout(() => {
            setCurrentView(newView);
            // Small delay before fade in
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row relative overflow-hidden">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`fixed top-3 left-3 sm:top-4 sm:left-4 z-50 p-2 rounded-md transition-all duration-300 ${
                    currentView === 'register' 
                        ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm' 
                        : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                }`}
            >
                {isMenuOpen ? (
                    <HiX className={`w-5 h-5 sm:w-6 sm:h-6 ${currentView === 'register' ? 'text-white' : 'text-white lg:text-red-600'}`} />
                ) : (
                    <HiMenu className={`w-5 h-5 sm:w-6 sm:h-6 ${currentView === 'register' ? 'text-white' : 'text-white lg:text-red-600'}`} />
                )}
            </button>

            {/* Slide-out Menu */}
            <div
                className={`fixed top-0 left-0 h-full w-64 sm:w-72 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-5 sm:p-6 pt-14 sm:pt-16">
                    <div className="flex items-center mb-6 sm:mb-8">
                        <img src={lasacLogo} alt="LASAC Logo" className="w-9 h-9 sm:w-10 sm:h-10 mr-2.5 sm:mr-3" />
                        <span className="text-red-600 text-lg sm:text-xl font-bold">LASAC</span>
                    </div>
                    <nav className="space-y-4">
                        <button
                            onClick={() => setCurrentView('login')}
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setCurrentView('register')}
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        >
                            Register
                        </button>
                        <button
                            onClick={() => setCurrentView('forgot-password')}
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        >
                            Reset Password
                        </button>
                        <Link
                            to="/about"
                            className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            to="/contact"
                            className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        >
                            Contact
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Left side - Welcome message - Hidden on mobile and when in registration */}
            <div 
                className={`w-full lg:w-2/5 min-h-[40vh] lg:min-h-screen min-w-0 items-center justify-center p-6 lg:p-12 flex-shrink-0 relative bg-gray-100 transition-all duration-700 ease-in-out ${
                    currentView === 'register' 
                        ? 'hidden lg:flex lg:opacity-0 lg:w-0 lg:min-w-0 lg:p-0 lg:scale-95 lg:pointer-events-none' 
                        : 'hidden lg:flex opacity-100 lg:scale-100'
                }`}
                style={{
                    backgroundImage: `url(${kasaloImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Semi-transparent overlay to blend with white background */}
                <div className="absolute inset-0 bg-white bg-opacity-85"></div>
                
                {/* Content */}
                <div className={`max-w-md w-full text-center lg:text-left relative z-10 transition-opacity duration-500 ${
                    currentView === 'register' ? 'opacity-0' : 'opacity-100'
                }`}>
                    <div className="mb-6 lg:mb-8">
                        <img src={lasacLogo} alt="LASAC Logo" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto lg:mx-0" />
                    </div>
                    <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-red-600 leading-tight transition-all duration-300 transform ${
                        isMessageTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                    }`}>
                        {WELCOME_MESSAGES[currentMessageIndex]}
                    </h1>
                </div>
            </div>

            {/* Right side - Dynamic Forms - Expands to full width for registration */}
            <div className={`flex-1 bg-red-600 flex flex-col min-h-screen overflow-y-auto scrollbar-hide transition-all duration-700 ease-in-out ${
                currentView === 'register' ? 'w-full' : ''
            }`}>
                <div className="flex-1 flex items-center justify-center px-4 py-6 sm:p-6 md:p-8 lg:p-10">
                    <div className={`w-full transition-all duration-700 ease-in-out ${
                        currentView === 'register' ? 'max-w-4xl' : 'max-w-md sm:max-w-lg'
                    }`}>
                        {/* Dynamic Form Content with smooth transitions */}
                        <div className={`transition-all duration-300 ease-in-out ${
                            isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
                        }`}>
                            {currentView === 'login' ? (
                                <LoginForm 
                                    onSwitchToRegister={() => handleViewSwitch('register')}
                                    onSwitchToForgotPassword={() => handleViewSwitch('forgot-password')}
                                />
                            ) : currentView === 'register' ? (
                                <RegisterForm onSwitchToLogin={() => handleViewSwitch('login')} />
                            ) : (
                                <ForgotPasswordForm onBackToLogin={() => handleViewSwitch('login')} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
