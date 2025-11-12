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
        setTimeout(() => {
            setCurrentView(newView);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 200);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="absolute top-4 left-4 z-50 p-2 rounded-md bg-transparent hover:bg-red-100 transition-colors"
            >
                {isMenuOpen ? (
                    <HiX className="w-6 h-6 text-red-600" />
                ) : (
                    <HiMenu className="w-6 h-6 text-red-600" />
                )}
            </button>

            {/* Slide-out Menu */}
            <div
                className={`absolute top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-6 pt-16">
                    <div className="flex items-center mb-8">
                        <img src={lasacLogo} alt="LASAC Logo" className="w-10 h-10 mr-3" />
                        <span className="text-red-600 text-xl font-bold">LASAC</span>
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
                    className="absolute inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Left side - Welcome message */}
            <div 
                className="w-full lg:w-2/5 min-h-[40vh] lg:min-h-screen min-w-0 flex items-center justify-center p-6 lg:p-12 flex-shrink-0 relative bg-gray-100"
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
                <div className="max-w-md w-full text-center lg:text-left relative z-10">
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

            {/* Right side - Dynamic Forms */}
            <div className="flex-1 bg-red-600 flex flex-col min-h-[60vh] lg:min-h-screen">
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="min-h-full flex items-center justify-center p-4 lg:p-6">
                        <div className="w-full max-w-2xl transition-opacity duration-300 ease-in-out py-4">
                            {/* Dynamic Header */}
                            <div className={`text-center mb-4 lg:mb-6 transition-all duration-300 ${
                                isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
                            }`}>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-xl lg:text-2xl font-bold text-white">
                            {currentView === 'login' ? 'Login' : 
                             currentView === 'register' ? 'Create an account' : 
                             'Reset Password'}
                        </h2>
                    </div>

                    {/* Dynamic Form Content */}
                    <div className={`transition-all duration-300 ${
                        isTransitioning ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'
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
        </div>
    );
}
