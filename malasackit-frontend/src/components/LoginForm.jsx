import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiLockClosed } from 'react-icons/hi';

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
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div>
                <div className="relative max-w-sm mx-auto">
                    <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-400" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 rounded-md text-sm"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div>
                <div className="relative max-w-sm mx-auto">
                    <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-400" />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 rounded-md text-sm"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="max-w-sm mx-auto">
                <div className="flex items-center justify-between text-white text-sm">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="keepLoggedIn"
                            checked={formData.keepLoggedIn}
                            onChange={handleInputChange}
                            className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        Keep me logged in
                    </label>
                    <a href="#" className="hover:underline">
                        Forgot password?
                    </a>
                </div>
            </div>

            <div className="max-w-sm mx-auto">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-red-600 font-bold py-2.5 px-4 hover:bg-red-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-md text-sm"
                >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        Logging in...
                    </>
                ) : (
                    'Login'
                )}
                </button>
            </div>

            <div className="text-center pt-4">
                <span className="text-white">Don't have an account? </span>
                <button 
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-blue-200 hover:text-blue-100 underline font-semibold"
                >
                    Register here
                </button>
            </div>
        </form>
    );
}
