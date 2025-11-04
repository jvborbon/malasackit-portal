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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                    <h3 className="text-white text-lg font-bold">Parish & Vicariate Information</h3>
                    <p className="text-red-200 text-sm mt-2">
                        Optional: Help us connect you with your local church community
                    </p>
                </div>

                {/* Parish and Vicariate Fields */}
                <div className="space-y-4">
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

                {/* Information Box */}
                <div className="bg-white/10 border border-white/20 rounded-lg p-4 mt-6">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-200 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-white font-medium text-sm">Why do we ask for this?</h4>
                            <p className="text-red-200 text-xs mt-1">
                                This helps us coordinate donations and distributions with your local church community, 
                                ensuring resources reach those who need them most in your area. 
                                First select your vicariate, then choose your specific parish.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full bg-red-400 text-white font-bold py-3 px-4 rounded hover:bg-red-500 transition duration-200"
                    >
                        ← Back
                    </button>
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="w-full bg-gray-500 text-white font-bold py-3 px-4 rounded hover:bg-gray-600 transition duration-200"
                    >
                        Skip
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-white text-red-600 font-bold py-3 px-4 rounded hover:bg-red-50 transition duration-200"
                    >
                        Continue →
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

export default ParishVicariateStep;