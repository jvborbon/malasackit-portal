import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../auth/Authentication';
import { sanitizeInput, sanitizeInputForSubmission } from '../utils/sanitization';

// Google-style Floating Input Component
const FloatingLoginInput = ({ label, type = "text", name, value, onChange, icon: Icon, required = false, disabled = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;
    const shouldFloat = isFocused || hasValue;

    return (
        <div className="relative">
            <div className="relative">
                <Icon className={`absolute left-3 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 z-10 ${
                    shouldFloat ? 'top-5 sm:top-6 text-red-200' : 'top-1/2 transform -translate-y-1/2 text-red-300'
                }`} />
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-transparent border-2 text-white placeholder-transparent focus:outline-none text-sm sm:text-base rounded-lg transition-all duration-200 ${
                        isFocused ? 'border-red-200' : 'border-white'
                    } ${shouldFloat ? 'pt-5 sm:pt-6 pb-1 sm:pb-2' : 'pt-3 sm:pt-4 pb-3 sm:pb-4'}`}
                    placeholder=" "
                    required={required}
                    disabled={disabled}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none bg-red-600 px-1 ${
                    shouldFloat 
                        ? 'left-3 sm:left-4 -top-2 text-xs text-red-200 scale-90' 
                        : 'left-10 sm:left-12 top-1/2 transform -translate-y-1/2 text-sm sm:text-base text-white'
                }`}>
                    {label}
                </label>
            </div>
        </div>
    );
};

// Password Input with Toggle
const FloatingPasswordInput = ({ label, name, value, onChange, icon: Icon, required = false, disabled = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const hasValue = value && value.length > 0;
    const shouldFloat = isFocused || hasValue;

    return (
        <div className="relative">
            <div className="relative">
                <Icon className={`absolute left-3 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 z-10 ${
                    shouldFloat ? 'top-5 sm:top-6 text-red-200' : 'top-1/2 transform -translate-y-1/2 text-red-300'
                }`} />
                <input
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-transparent border-2 text-white placeholder-transparent focus:outline-none text-sm sm:text-base rounded-lg transition-all duration-200 ${
                        isFocused ? 'border-red-200' : 'border-white'
                    } ${shouldFloat ? 'pt-5 sm:pt-6 pb-1 sm:pb-2' : 'pt-3 sm:pt-4 pb-3 sm:pb-4'}`}
                    placeholder=" "
                    required={required}
                    disabled={disabled}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none bg-red-600 px-1 ${
                    shouldFloat 
                        ? 'left-3 sm:left-4 -top-2 text-xs text-red-200 scale-90' 
                        : 'left-10 sm:left-12 top-1/2 transform -translate-y-1/2 text-sm sm:text-base text-white'
                }`}>
                    {label}
                </label>
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-red-200 transition-colors focus:outline-none"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <HiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                        <HiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};


const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important: Include cookies
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

const logoutUser = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include', // Include cookies
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

const getUserProfile = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/profile`, {
            method: 'GET',
            credentials: 'include', // Include cookies
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get profile error:', error);
        throw error;
    }
};

export default function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword }) {
    const navigate = useNavigate();
    const { loginAuthentication, getDefaultDashboard } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '', // This field now accepts either email or full name
        password: '',
        keepLoggedIn: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let sanitizedValue = value;
        
        if (type !== 'checkbox') {
            // For email field, use sanitizeInput to allow both email and full name
            // This preserves spaces and capitalization for names
            // Backend will handle the actual validation
            sanitizedValue = sanitizeInput(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : sanitizedValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (!formData.email || !formData.password) {
                throw new Error('Please fill in all fields');
            }

            // Sanitize and trim input before submission
            const sanitizedEmail = sanitizeInputForSubmission(formData.email);
            const sanitizedPassword = formData.password.trim(); // Just trim password, don't sanitize

            console.log('Attempting login with:', sanitizedEmail);

            // Use the optimized loginAuthentication function
            const result = await loginAuthentication(sanitizedEmail, sanitizedPassword);
            
            console.log('Login successful, user role:', result.role);
            
            // Use React Router navigation with the returned redirect path
            console.log('Navigating to:', result.redirectTo);
            
            // Navigate with replace to prevent back navigation to login
            navigate(result.redirectTo, { replace: true });
            
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <HiUser className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1.5 sm:mb-2">Welcome to Malasackit Portal</h2>
                <p className="text-red-100 text-xs sm:text-sm">Sign in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Error Message */}
                {error && (
                    <div className="bg-white/10 border border-white/30 text-white px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg backdrop-blur-sm">
                        <p className="text-xs sm:text-sm">{error}</p>
                    </div>
                )}

                <FloatingLoginInput
                    label="Email or Full Name"
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={HiUser}
                    required
                    disabled={isLoading}
                />

                <FloatingPasswordInput
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    icon={HiLockClosed}
                    required
                    disabled={isLoading}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-white text-xs sm:text-sm">
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="checkbox"
                            name="keepLoggedIn"
                            checked={formData.keepLoggedIn}
                            onChange={handleInputChange}
                            className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white bg-white/20 border-white/40 rounded focus:ring-white focus:ring-offset-0 focus:ring-2"
                        />
                        <span className="group-hover:text-red-100 transition-colors whitespace-nowrap">Keep me logged in</span>
                    </label>
                    <button
                        type="button"
                        onClick={onSwitchToForgotPassword}
                        className="hover:text-red-100 transition-colors font-medium whitespace-nowrap"
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-red-600 font-semibold py-3 sm:py-3.5 rounded-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-red-600 mr-2 sm:mr-3"></div>
                            <span>Signing in...</span>
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>

                <div className="text-center pt-3 sm:pt-4">
                    <span className="text-white text-xs sm:text-sm">Don't have an account? </span>
                    <button 
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-white font-semibold underline hover:text-red-100 transition-colors text-xs sm:text-sm"
                    >
                        Create Account
                    </button>
                </div>
            </form>
        </div>
    );
}
