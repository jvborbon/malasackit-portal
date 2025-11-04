import { useState } from 'react';

const FloatingSelect = ({ 
    label, 
    name, 
    value, 
    onChange, 
    options = [], 
    required = false, 
    disabled = false,
    loading = false,
    theme = 'default',
    size = 'md'
}) => {
    const themeClasses = {
        default: {
            container: 'relative',
            select: `w-full px-3 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-0 focus:border-blue-600 
                    disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200`,
            label: `block text-sm font-medium text-gray-700 mb-2`,
            loading: 'text-gray-400'
        },
        dark: {
            container: 'relative',
            select: `w-full px-3 py-3 text-white bg-transparent border-2 border-white/30 rounded-lg 
                    focus:outline-none focus:ring-0 focus:border-white 
                    disabled:bg-white/10 disabled:cursor-not-allowed disabled:text-white/50 
                    transition-colors duration-200 appearance-none
                    [&>option]:text-gray-900 [&>option]:bg-white`,
            label: `block text-sm font-medium text-white mb-2`,
            loading: 'text-white/50'
        }
    };

    const sizeClasses = {
        sm: 'text-sm py-2',
        md: 'text-base py-3',
        lg: 'text-lg py-4'
    };

    const currentTheme = themeClasses[theme] || themeClasses.default;
    const currentSize = sizeClasses[size] || sizeClasses.md;

    const handleSelectChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className={currentTheme.container}>
            <label 
                htmlFor={name}
                className={`${currentTheme.label} ${loading ? currentTheme.loading : ''}`}
            >
                {loading ? `Loading ${label.toLowerCase()}...` : label}
                {required && !loading && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            <div className="relative">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={handleSelectChange}
                    required={required}
                    disabled={disabled || loading}
                    className={`${currentTheme.select} ${currentSize}`}
                >
                    <option value="" style={{ color: '#374151', backgroundColor: '#ffffff' }}>
                        {loading ? 'Loading...' : 'Select an option'}
                    </option>
                    {options.map((option) => (
                        <option 
                            key={option.value} 
                            value={option.value}
                            style={{ color: '#374151', backgroundColor: '#ffffff' }}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                
                {/* Custom dropdown arrow for dark theme */}
                {theme === 'dark' && (
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingSelect;