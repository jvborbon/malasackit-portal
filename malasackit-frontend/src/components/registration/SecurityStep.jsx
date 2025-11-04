import FloatingInput from '../common/FloatingInput';

const SecurityStep = ({ 
    formData, 
    handleInputChange, 
    onSubmit, 
    onBack, 
    onSwitchToLogin, 
    isTransitioning 
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate passwords
        if (formData.password !== formData.repeatPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        onSubmit();
    };

    return (
        <div className={`transition-all duration-300 ease-in-out ${
            !isTransitioning 
                ? 'transform translate-x-0 opacity-100' 
                : 'transform translate-x-full opacity-0'
        }`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-4">
                    <h3 className="text-white text-lg font-bold">Security</h3>
                </div>

                {/* Password Fields */}
                <div className="space-y-4">
                    <FloatingInput
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                    <FloatingInput
                        label="Repeat Password"
                        type="password"
                        name="repeatPassword"
                        value={formData.repeatPassword}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Navigation buttons */}
                <div className="flex space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full bg-red-400 text-white font-bold py-3 px-4 rounded hover:bg-red-500 transition duration-200"
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-white text-red-600 font-bold py-3 px-4 rounded hover:bg-red-50 transition duration-200"
                    >
                        Register
                    </button>
                </div>

                {/* Login link */}
                <div className="text-center pt-3">
                    <span className="text-white text-base">Already have an account? </span>
                    <button 
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-blue-200 hover:text-blue-100 underline font-semibold text-sm"
                    >
                        Login Here!
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SecurityStep;