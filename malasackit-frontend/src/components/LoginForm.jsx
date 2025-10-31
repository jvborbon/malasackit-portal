import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiLockClosed } from 'react-icons/hi';

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

export default function LoginForm({ onSwitchToRegister }) {
    const navigate = useNavigate();
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
            // Basic form validation
            if (!formData.email || !formData.password) {
                throw new Error('Please fill in all fields');
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock authentication logic
            // would be an API call to your backend
            const mockUsers = [
                { email: 'donor@example.com', password: 'password123', type: 'donor' },
                { email: 'staff@example.com', password: 'staff123', type: 'staff' },
                { email: 'admin@example.com', password: 'test123', type: 'admin' }
            ];

            const user = mockUsers.find(u => 
                u.email === formData.email && u.password === formData.password
            );

            if (user) {
                // Store user info in localStorage
                const userInfo = {
                    email: user.email,
                    type: user.type,
                    loginTime: new Date().toISOString()
                };

                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                localStorage.setItem('userToken', 'mock-jwt-token-' + Date.now());

                // Redirect based on user type
                if (user.type === 'donor') {
                    navigate('/donor-dashboard');
                } else if (user.type === 'staff') {
                    navigate('/staff-dashboard');
                } else {
                    navigate('/admin-dashboard');
                }
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
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
