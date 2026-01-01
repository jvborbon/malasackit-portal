import { useState } from 'react';

const FloatingInput = ({ 
    label, 
    type = "text", 
    name, 
    value, 
    onChange, 
    required = false,
    error = null,
    disabled = false,
    placeholder = " ",
    colorTheme = 'red',
    className = ''
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;
    const shouldFloat = isFocused || hasValue;

    // Color theme configurations
    const themes = {
        red: {
            border: 'border-white',
            borderFocus: 'border-red-200',
            borderError: 'border-red-300',
            text: 'text-white',
            label: 'text-white',
            labelFloat: 'text-red-200',
            labelBg: 'bg-red-600'
        },
        blue: {
            border: 'border-blue-300',
            borderFocus: 'border-blue-500',
            borderError: 'border-red-400',
            text: 'text-blue-900',
            label: 'text-blue-700',
            labelFloat: 'text-blue-500',
            labelBg: 'bg-white'
        },
        white: {
            border: 'border-gray-300',
            borderFocus: 'border-blue-500',
            borderError: 'border-red-400',
            text: 'text-gray-900',
            label: 'text-gray-700',
            labelFloat: 'text-blue-500',
            labelBg: 'bg-white'
        },
        dark: {
            border: 'border-gray-600',
            borderFocus: 'border-blue-400',
            borderError: 'border-red-400',
            text: 'text-white',
            label: 'text-gray-300',
            labelFloat: 'text-blue-400',
            labelBg: 'bg-gray-800'
        }
    };

    const theme = themes[colorTheme] || themes.red;

    // Determine border color based on state
    const getBorderColor = () => {
        if (error) return theme.borderError;
        if (isFocused) return theme.borderFocus;
        return theme.border;
    };

    // Determine label color based on state
    const getLabelColor = () => {
        if (error) return 'text-red-400';
        if (shouldFloat) return theme.labelFloat;
        return theme.label;
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled}
                className={`w-full px-3 sm:px-4 py-3.5 sm:py-4 bg-transparent border-2 placeholder-transparent focus:outline-none text-sm sm:text-base rounded-lg transition-all duration-200 ${
                    theme.text
                } ${getBorderColor()} ${
                    shouldFloat ? 'pt-5 sm:pt-6 pb-1.5 sm:pb-2' : 'pt-3.5 sm:pt-4 pb-3.5 sm:pb-4'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={placeholder}
                required={required}
            />
            <label className={`absolute left-3 sm:left-4 transition-all duration-200 pointer-events-none px-1 ${
                theme.labelBg
            } ${getLabelColor()} ${
                shouldFloat 
                    ? '-top-2 text-xs sm:text-sm scale-90' 
                    : 'top-1/2 transform -translate-y-1/2 text-sm sm:text-base'
            }`}>
                {label}
            </label>
            {error && (
                <div className="mt-1 text-xs sm:text-sm text-red-400">
                    {error}
                </div>
            )}
        </div>
    );
};

export default FloatingInput;