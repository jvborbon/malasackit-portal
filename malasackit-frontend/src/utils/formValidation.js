export const validateRegistrationForm = (formData) => {
    const errors = {};

    // Personal Information Validation
    if (!formData.fullName.trim()) {
        errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
        errors.email = 'Email is required';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
    }

    if (formData.phoneNumber && formData.phoneNumber.trim()) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            errors.phoneNumber = 'Please enter a valid phone number';
        }
    }

    // Address Validation (Optional but if provided, should be complete)
    if (formData.regionId || formData.provinceId || formData.municipalityId || formData.barangayId) {
        if (!formData.regionId) errors.regionId = 'Please select a region';
        if (!formData.provinceId) errors.provinceId = 'Please select a province';
        if (!formData.municipalityId) errors.municipalityId = 'Please select a municipality';
        if (!formData.barangayId) errors.barangayId = 'Please select a barangay';
    }

    // Password Validation
    if (!formData.password) {
        errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.repeatPassword) {
        errors.repeatPassword = 'Please confirm your password';
    } else if (formData.password !== formData.repeatPassword) {
        errors.repeatPassword = 'Passwords do not match';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const getStepValidation = (step, formData) => {
    const validation = validateRegistrationForm(formData);
    
    switch (step) {
        case 1: // Personal Info
            return {
                isValid: !validation.errors.fullName && !validation.errors.email && !validation.errors.phoneNumber,
                errors: {
                    fullName: validation.errors.fullName,
                    email: validation.errors.email,
                    phoneNumber: validation.errors.phoneNumber
                }
            };
        
        case 2: // Address Info
            // Address is optional, so always valid
            return { isValid: true, errors: {} };
        
        case 3: // Parish/Vicariate
            // Parish/Vicariate is optional, so always valid
            return { isValid: true, errors: {} };
        
        case 4: // Security
            return {
                isValid: !validation.errors.password && !validation.errors.repeatPassword,
                errors: {
                    password: validation.errors.password,
                    repeatPassword: validation.errors.repeatPassword
                }
            };
        
        default:
            return { isValid: true, errors: {} };
    }
};