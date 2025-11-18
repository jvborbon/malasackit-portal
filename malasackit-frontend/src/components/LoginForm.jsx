import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../auth/Authentication';

// Google-style Floating Input Component
const FloatingLoginInput = ({ label, type = "text", name, value, onChange, icon: Icon, required = false, disabled = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;
    const shouldFloat = isFocused || hasValue;

    return (
        <div className="relative">
            <div className="relative">
                <Icon className={`absolute left-4 w-5 h-5 transition-all duration-200 z-10 ${
                    shouldFloat ? 'top-6 text-red-200' : 'top-1/2 transform -translate-y-1/2 text-red-300'
                }`} />
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full pl-12 pr-4 py-4 bg-transparent border-2 text-white placeholder-transparent focus:outline-none text-base rounded-lg transition-all duration-200 ${
                        isFocused ? 'border-red-200' : 'border-white'
                    } ${shouldFloat ? 'pt-6 pb-2' : 'pt-4 pb-4'}`}
                    placeholder=" "
                    required={required}
                    disabled={disabled}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none bg-red-600 px-1 ${
                    shouldFloat 
                        ? 'left-4 -top-2 text-xs text-red-200 scale-90' 
                        : 'left-12 top-1/2 transform -translate-y-1/2 text-base text-white'
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
                <Icon className={`absolute left-4 w-5 h-5 transition-all duration-200 z-10 ${
                    shouldFloat ? 'top-6 text-red-200' : 'top-1/2 transform -translate-y-1/2 text-red-300'
                }`} />
                <input
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full pl-12 pr-12 py-4 bg-transparent border-2 text-white placeholder-transparent focus:outline-none text-base rounded-lg transition-all duration-200 ${
                        isFocused ? 'border-red-200' : 'border-white'
                    } ${shouldFloat ? 'pt-6 pb-2' : 'pt-4 pb-4'}`}
                    placeholder=" "
                    required={required}
                    disabled={disabled}
                />
                <label className={`absolute transition-all duration-200 pointer-events-none bg-red-600 px-1 ${
                    shouldFloat 
                        ? 'left-4 -top-2 text-xs text-red-200 scale-90' 
                        : 'left-12 top-1/2 transform -translate-y-1/2 text-base text-white'
                }`}>
                    {label}
                </label>
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-red-200 transition-colors focus:outline-none"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <HiEyeOff className="w-5 h-5" />
                    ) : (
                        <HiEye className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};


const loginUser = async (email, password) => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
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
        const response = await fetch('http://localhost:3000/api/auth/logout', {
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
        const response = await fetch('http://localhost:3000/api/auth/profile', {
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
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

            console.log('Attempting login with:', formData.email);

            // Use the optimized loginAuthentication function
            const result = await loginAuthentication(formData.email, formData.password);
            
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                    <p className="text-sm">{error}</p>
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

            <div className="flex items-center justify-between text-white pt-2" style={{ transform: 'translateZ(0)', willChange: 'auto' }}>
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        name="keepLoggedIn"
                        checked={formData.keepLoggedIn}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">Keep me logged in</span>
                </label>
                <button
                    type="button"
                    onClick={onSwitchToForgotPassword}
                    className="text-sm hover:underline hover:text-red-200 transition-colors"
                >
                    Forgot password?
                </button>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-red-600 font-bold py-4 px-6 hover:bg-red-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-md text-base"
            >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-3"></div>
                    <span>Logging in...</span>
                </>
            ) : (
                'Login'
            )}
            </button>

            <div className="text-center pt-6">
                <span className="text-white text-base">Don't have an account? </span>
                <button 
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-blue-200 hover:text-blue-100 underline font-semibold text-base transition-colors"
                >
                    Register here
                </button>
            </div>
        </form>
    );
}
