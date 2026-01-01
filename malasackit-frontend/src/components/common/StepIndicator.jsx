const StepIndicator = ({ 
    currentStep, 
    totalSteps = 3, 
    colorTheme = 'red',
    size = 'medium',
    className = ''
}) => {
    // Color theme configurations
    const themes = {
        red: {
            active: 'bg-white text-red-600',
            inactive: 'bg-red-400 text-white',
            connector: 'bg-white',
            connectorInactive: 'bg-red-400'
        },
        blue: {
            active: 'bg-white text-blue-600',
            inactive: 'bg-blue-400 text-white',
            connector: 'bg-white',
            connectorInactive: 'bg-blue-400'
        },
        green: {
            active: 'bg-white text-green-600',
            inactive: 'bg-green-400 text-white',
            connector: 'bg-white',
            connectorInactive: 'bg-green-400'
        },
        gray: {
            active: 'bg-gray-800 text-white',
            inactive: 'bg-gray-400 text-white',
            connector: 'bg-gray-800',
            connectorInactive: 'bg-gray-400'
        }
    };

    // Size configurations
    const sizes = {
        small: {
            circle: 'w-5 h-5 sm:w-6 sm:h-6 text-xs',
            connector: 'w-6 sm:w-8 h-0.5',
            spacing: 'space-x-1.5 sm:space-x-2'
        },
        medium: {
            circle: 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm',
            connector: 'w-8 sm:w-10 md:w-12 h-0.5',
            spacing: 'space-x-2 sm:space-x-3 md:space-x-4'
        },
        large: {
            circle: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-sm sm:text-base',
            connector: 'w-10 sm:w-12 md:w-16 h-0.5',
            spacing: 'space-x-3 sm:space-x-4 md:space-x-6'
        }
    };

    const theme = themes[colorTheme] || themes.red;
    const sizeConfig = sizes[size] || sizes.medium;

    return (
        <div className={`flex justify-center mb-4 sm:mb-5 md:mb-6 ${className}`}>
            <div className={`flex items-center ${sizeConfig.spacing}`}>
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNumber = index + 1;
                    const isActive = currentStep >= stepNumber;
                    const isLast = stepNumber === totalSteps;
                    
                    return (
                        <div key={stepNumber} className="flex items-center">
                            <div className={`${sizeConfig.circle} rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                isActive 
                                    ? `${theme.active} scale-110` 
                                    : `${theme.inactive} scale-100`
                            }`}>
                                {stepNumber}
                            </div>
                            {!isLast && (
                                <div className={`${sizeConfig.connector} transition-all duration-500 ${
                                    currentStep > stepNumber ? theme.connector : theme.connectorInactive
                                }`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;