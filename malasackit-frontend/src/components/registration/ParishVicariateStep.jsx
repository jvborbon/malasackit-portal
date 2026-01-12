import FloatingInput from '../common/FloatingInput';
import FloatingSelect from '../common/FloatingSelect';

const ParishVicariateStep = ({ 
    formData, 
    handleInputChange, 
    onNext, 
    onSkip,
    onBack, 
    onSwitchToLogin, 
    isTransitioning,
    vicariates = [],
    parishes = [],
    isLoadingVicariates = false,
    isLoadingParishes = false
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    const handleSkip = () => {
        // Clear parish and vicariate fields when skipping
        handleInputChange({ target: { name: 'vicariateId', value: '' } });
        handleInputChange({ target: { name: 'parishId', value: '' } });
        onSkip();
    };

    return (
        <div className={`transition-all duration-300 ease-in-out ${
            !isTransitioning 
                ? 'transform translate-x-0 opacity-100' 
                : 'transform -translate-x-full opacity-0'
        }`}>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="text-center mb-1.5 sm:mb-2">
                    <p className="text-red-100 text-xs sm:text-sm">
                        Optional: Connect with your church community
                    </p>
                </div>

                {/* Parish and Vicariate Fields */}
                <div className="space-y-2.5 sm:space-y-3">
                    <FloatingSelect
                        label="Vicariate (Optional)"
                        name="vicariateId"
                        value={formData.vicariateId}
                        onChange={handleInputChange}
                        options={vicariates}
                        loading={isLoadingVicariates}
                        theme="dark"
                        required={false}
                    />
                    
                    <FloatingSelect
                        label="Parish (Optional)"
                        name="parishId"
                        value={formData.parishId}
                        onChange={handleInputChange}
                        options={parishes}
                        loading={isLoadingParishes}
                        disabled={!formData.vicariateId}
                        theme="dark"
                        required={false}
                    />
                </div>

                {/* Navigation buttons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 pt-2 sm:pt-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="bg-white/20 text-white font-semibold py-2.5 sm:py-3 md:py-3.5 rounded-lg hover:bg-white/30 transition duration-200 text-xs sm:text-sm"
                    >
                        ← Back
                    </button>
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="bg-white/40 text-white font-semibold py-2.5 sm:py-3 md:py-3.5 rounded-lg hover:bg-white/50 transition duration-200 text-xs sm:text-sm"
                    >
                        Skip
                    </button>
                    <button
                        type="submit"
                        className="bg-white text-red-900 font-semibold py-2.5 sm:py-3 md:py-3.5 rounded-lg hover:bg-red-50 transition duration-200 text-xs sm:text-sm"
                    >
                        Next →
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

export default ParishVicariateStep;