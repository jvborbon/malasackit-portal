import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { sanitizeInput } from '../utils/sanitization';

// Google-style Floating Input Component
const FloatingLoginInput = ({ label, type = "text", name, value, onChange, icon: Icon, required = false, disabled = false, showPasswordToggle = false, onTogglePassword }) => {
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
                    className={`w-full pl-12 ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-4 bg-transparent border-2 text-white placeholder-transparent focus:outline-none text-base rounded-lg transition-all duration-200 ${
                        isFocused ? 'border-red-200' : 'border-white'
                    } ${shouldFloat ? 'pt-6 pb-2' : 'pt-4 pb-4'}`}
                    placeholder=" "
                    required={required}
                    disabled={disabled}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-300 hover:text-red-200 transition-colors"
                    >
                        {type === 'password' ? <HiEye className="w-5 h-5" /> : <HiEyeOff className="w-5 h-5" />}
                    </button>
                )}
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

export default function ResetPasswordForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    // Verify token on component mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Invalid reset link. Please request a new password reset.');
                setIsVerifying(false);
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/verify-reset-token/${token}`);
                const data = await response.json();

                if (!data.success) {
                    setError(data.message);
                } else {
                    setUserInfo(data.data.user);
                }
            } catch (error) {
                console.error('Token verification error:', error);
                setError('Failed to verify reset token. Please try again.');
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        setError('');
    };

    const validatePassword = (password) => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validate passwords
            const passwordError = validatePassword(formData.password);
            if (passwordError) {
                throw new Error(passwordError);
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            setSuccess('Password reset successfully! You will be redirected to the login page in 3 seconds.');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 3000);

        } catch (error) {
            console.error('Reset password error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    if (error && !userInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 transition duration-200"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                <div className="text-center mb-8">
                    <div className="text-red-600 text-5xl mb-4">🔐</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                    {userInfo && (
                        <p className="text-gray-600 text-sm">
                            Resetting password for: <strong>{userInfo.full_name}</strong>
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
                            <p className="text-sm">{success}</p>
                        </div>
                    )}

                    <div className="relative">
                        <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="New Password"
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900"
                            required
                            disabled={isLoading || success}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="relative">
                        <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm New Password"
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900"
                            required
                            disabled={isLoading || success}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="text-sm text-gray-600">
                        <p className="mb-1">Password requirements:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>At least 6 characters long</li>
                            <li>Should be unique and secure</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                <span>Resetting Password...</span>
                            </>
                        ) : success ? (
                            'Password Reset Successfully!'
                        ) : (
                            'Reset Password'
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}