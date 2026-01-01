import FloatingInput from '../common/FloatingInput';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '../../utils/sanitization';

const PersonalInfoStep = ({ 
    formData, 
    handleInputChange, 
    onNext, 
    onSwitchToLogin, 
    isTransitioning,
    validationErrors = {}
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <div className={`transition-all duration-300 ease-in-out ${
            !isTransitioning 
                ? 'transform translate-x-0 opacity-100' 
                : 'transform -translate-x-full opacity-0'
        }`}>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Personal Details */}
                <div className="space-y-2.5 sm:space-y-3">
                    <FloatingInput
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        error={validationErrors.fullName}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <FloatingInput
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            error={validationErrors.email}
                        />
                        <FloatingInput
                            label="Phone Number"
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required={false}
                            error={validationErrors.phoneNumber}
                        />
                    </div>
                </div>

                {/* Account Type */}
                <div className="space-y-2">
                    <label className="text-white font-medium text-xs sm:text-sm block">Account Type</label>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <button
                            type="button"
                            className={`p-2.5 sm:p-3 border-2 rounded-lg transition-all duration-200 ${
                                formData.donorType === 'INDIVIDUAL' 
                                    ? 'border-white bg-white text-red-600' 
                                    : 'border-white/40 bg-transparent text-white hover:border-white'
                            }`}
                            onClick={() => handleInputChange({ 
                                target: { name: 'donorType', value: 'INDIVIDUAL' } 
                            })}
                        >
                            <div className="text-center text-xs sm:text-sm font-medium">Individual</div>
                        </button>
                        <button
                            type="button"
                            className={`p-2.5 sm:p-3 border-2 rounded-lg transition-all duration-200 ${
                                formData.donorType === 'ORGANIZATION' 
                                    ? 'border-white bg-white text-red-600' 
                                    : 'border-white/40 bg-transparent text-white hover:border-white'
                            }`}
                            onClick={() => handleInputChange({ 
                                target: { name: 'donorType', value: 'ORGANIZATION' } 
                            })}
                        >
                            <div className="text-center text-xs sm:text-sm font-medium">Organization</div>
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 sm:pt-3">
                    <button
                        type="submit"
                        className="w-full bg-white text-red-600 font-semibold py-3 sm:py-3.5 rounded-lg hover:bg-red-50 transition-all duration-200 text-sm sm:text-base"
                    >
                        Continue →
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

export default PersonalInfoStep;