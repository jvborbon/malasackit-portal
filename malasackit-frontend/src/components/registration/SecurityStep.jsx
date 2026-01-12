import FloatingInput from '../common/FloatingInput';

const SecurityStep = ({ 
    formData, 
    handleInputChange, 
    onSubmit, 
    onBack, 
    onSwitchToLogin, 
    isTransitioning,
    validationErrors = {},
    isSubmitting = false,
    submitError = ''
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className={`transition-all duration-300 ease-in-out ${
            !isTransitioning 
                ? 'transform translate-x-0 opacity-100' 
                : 'transform translate-x-full opacity-0'
        }`}>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Password Fields */}
                <div className="space-y-2.5 sm:space-y-3">
                    <FloatingInput
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        error={validationErrors.password}
                    />
                    <FloatingInput
                        label="Repeat Password"
                        type="password"
                        name="repeatPassword"
                        value={formData.repeatPassword}
                        onChange={handleInputChange}
                        required
                        error={validationErrors.repeatPassword}
                    />
                </div>

                {/* Error Message */}
                {submitError && (
                    <div className="bg-white/10 border border-white/30 text-white px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm">
                        {submitError}
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-2.5 sm:gap-3 pt-2 sm:pt-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full bg-white/20 text-white font-semibold py-3 sm:py-3.5 rounded-lg hover:bg-white/30 transition duration-200 text-sm sm:text-base"
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-semibold py-3 sm:py-3.5 rounded-lg transition duration-200 text-sm sm:text-base ${
                            isSubmitting 
                                ? 'bg-white/50 text-red-300 cursor-not-allowed'
                                : 'bg-white text-red-900 hover:bg-red-50'
                        }`}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Account'}
                    </button>
                </div>

                {/* Login link */}
                <div className="text-center pt-1.5 sm:pt-2">
                    <span className="text-white text-xs sm:text-sm">Already have an account? </span>
                    <button 
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-white font-semibold underline hover:text-red-100 transition-colors text-xs sm:text-sm"
                    >
                        Sign In
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SecurityStep;