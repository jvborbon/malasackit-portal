import { useState } from 'react';
import { HiUser, HiArrowLeft } from 'react-icons/hi';

// Google-style Floating Input Component (reused from login form)
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

export default function ForgotPasswordForm({ onBackToLogin }) {
    const [formData, setFormData] = useState({
        emailOrName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user types
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!formData.emailOrName.trim()) {
                throw new Error('Please enter your email address or full name');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emailOrName: formData.emailOrName.trim() }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            setSuccess('If an account with that information exists, a password reset email has been sent. Please check your email and follow the instructions to reset your password.');
            
            // Clear form
            setFormData({ emailOrName: '' });

        } catch (error) {
            console.error('Forgot password error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-red-100 text-sm">
                    Enter your email address or full name and we'll send you a link to reset your password.
                </p>
            </div>

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

            <FloatingLoginInput
                label="Email Address or Full Name"
                type="text"
                name="emailOrName"
                value={formData.emailOrName}
                onChange={handleInputChange}
                icon={HiUser}
                required
                disabled={isLoading}
            />

            <div className="space-y-4">
                <button
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full bg-white text-red-600 font-bold py-4 px-6 hover:bg-red-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-md text-base"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-3"></div>
                            <span>Sending Reset Link...</span>
                        </>
                    ) : (
                        'Send Reset Link'
                    )}
                </button>

                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full bg-transparent text-white font-medium py-3 px-6 border border-white hover:bg-white hover:text-red-600 transition duration-200 flex items-center justify-center rounded-md text-base"
                >
                    <HiArrowLeft className="w-5 h-5 mr-2" />
                    Back to Login
                </button>
            </div>

            <div className="text-center pt-6">
                <p className="text-red-100 text-sm">
                    Remember your password?{' '}
                    <button 
                        type="button"
                        onClick={onBackToLogin}
                        className="text-blue-200 hover:text-blue-100 underline font-semibold transition-colors"
                    >
                        Login here
                    </button>
                </p>
            </div>
        </form>
    );
}