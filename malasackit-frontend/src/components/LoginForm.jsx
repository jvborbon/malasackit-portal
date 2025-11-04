import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiUser, HiLockClosed } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

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

export default function LoginForm({ onSwitchToRegister }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
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

            console.log('Attempting login with:', formData.email); // Debug log

            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            console.log('Response status:', response.status); // Debug log
            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (data.success) {
                console.log('Login successful, user role:', data.data.user.role_name); // Debug log
                
                // Update authentication context
                await login(data.data.user);
                
                // Get the intended destination or default based on role
                const from = location.state?.from;
                const userRole = data.data.user.role_name;
                
                let redirectPath;
                if (from && from !== '/login') {
                    // User was trying to access a specific page
                    redirectPath = from;
                } else {
                    // Default redirect based on role
                    if (userRole === 'Donor') {
                        redirectPath = '/donor-dashboard';
                    } else if (userRole === 'Resource Staff') {
                        redirectPath = '/staff-dashboard';
                    } else if (userRole === 'Executive Admin') {
                        redirectPath = '/admin-dashboard';
                    } else {
                        redirectPath = '/';
                    }
                }
                
                console.log('Navigating to:', redirectPath);
                navigate(redirectPath, { replace: true });
            } else {
                console.log('Login failed:', data.message); // Debug log
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error); // Debug log
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
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                icon={HiUser}
                required
                disabled={isLoading}
            />

            <FloatingLoginInput
                label="Password"
                type="password"
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
                <a href="#" className="text-sm hover:underline hover:text-red-200 transition-colors">
                    Forgot password?
                </a>
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
