import FloatingInput from '../common/FloatingInput';

const PersonalInfoStep = ({ 
    formData, 
    handleInputChange, 
    onNext, 
    onSwitchToLogin, 
    isTransitioning 
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate step 1 fields
        if (!formData.fullName || !formData.email || !formData.phoneNumber) {
            alert('Please fill in all required fields');
            return;
        }
        onNext();
    };

    return (
        <div className={`transition-all duration-300 ease-in-out ${
            !isTransitioning 
                ? 'transform translate-x-0 opacity-100' 
                : 'transform -translate-x-full opacity-0'
        }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                    <h3 className="text-white text-lg font-bold">Personal Information</h3>
                </div>

                {/* Personal Details - Larger Fields */}
                <div className="space-y-4">
                    <FloatingInput
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                    />
                    <FloatingInput
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <FloatingInput
                        label="Phone Number"
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Account Type - Card Style */}
                <div className="space-y-3 mt-12 pt-9">
                    <span className="text-white font-semibold text-base">Account Type:</span>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                formData.donorType === 'INDIVIDUAL' 
                                    ? 'border-white bg-white/20 text-white shadow-lg' 
                                    : 'border-red-200 bg-transparent text-white hover:border-white hover:bg-white/10 hover:shadow-md'
                            }`}
                            onClick={() => handleInputChange({ 
                                target: { name: 'donorType', value: 'INDIVIDUAL' } 
                            })}
                        >
                            <div className="text-center">
                                <div className="text-lg font-medium">Individual</div>
                                <div className="text-sm opacity-80">Personal account</div>
                            </div>
                        </div>
                        <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                formData.donorType === 'ORGANIZATION' 
                                    ? 'border-white bg-white/20 text-white shadow-lg' 
                                    : 'border-red-200 bg-transparent text-white hover:border-white hover:bg-white/10 hover:shadow-md'
                            }`}
                            onClick={() => handleInputChange({ 
                                target: { name: 'donorType', value: 'ORGANIZATION' } 
                            })}
                        >
                            <div className="text-center">
                                <div className="text-lg font-medium">Organization</div>
                                <div className="text-sm opacity-80">Business account</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next button */}
                <div className="pt-4 flex justify-center">
                    <button
                        type="submit"
                        className="bg-white text-red-600 font-semibold py-2.5 px-40 rounded hover:bg-red-50 transition duration-200 text-base"
                    >
                        Continue →
                    </button>
                </div>

                {/* Login link */}
                <div className="text-center pt-3">
                    <span className="text-white text-m">Already have an account? </span>
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

export default PersonalInfoStep;