import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/userService';

export default function VerifyEmail() {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmailToken = async () => {
            // Get token from URL query parameters
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                setStatus('error');
                setMessage('No verification token provided.');
                return;
            }

            try {
                const response = await verifyEmail(token);
                
                if (response.success) {
                    setStatus('success');
                    setMessage(response.message || 'Email verified successfully!');
                    
                    // Redirect to profile settings after 3 seconds
                    setTimeout(() => {
                        navigate('/profile-settings');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(response.message || 'Email verification failed.');
                }
            } catch (error) {
                console.error('Email verification error:', error);
                setStatus('error');
                setMessage(
                    error.response?.data?.message || 
                    'Failed to verify email. The link may be invalid or expired.'
                );
            }
        };

        verifyEmailToken();
    }, [location.search, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                {status === 'verifying' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-700 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
                        <p className="text-gray-600">Please wait while we verify your email address...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting you to your profile...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/profile-settings')}
                                className="w-full px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                            >
                                Go to Profile Settings
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
