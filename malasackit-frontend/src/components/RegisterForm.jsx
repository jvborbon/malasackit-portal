import { useState, useEffect } from 'react';
import { locationAPI } from '../services/locationAPI';
import { registrationAPI } from '../services/registrationAPI';
import { validateRegistrationForm, getStepValidation } from './utilities/formValidation';
import StepIndicator from './common/StepIndicator';
import PersonalInfoStep from './registration/PersonalInfoStep';
import AddressInfoStep from './registration/AddressInfoStep';
import ParishVicariateStep from './registration/ParishVicariateStep';
import SecurityStep from './registration/SecurityStep';

export default function RegisterForm({ onSwitchToLogin }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    
    // Address dropdown data
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [vicariates, setVicariates] = useState([]);
    const [parishes, setParishes] = useState([]);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);
    const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);
    const [isLoadingVicariates, setIsLoadingVicariates] = useState(false);
    const [isLoadingParishes, setIsLoadingParishes] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        donorType: 'INDIVIDUAL',
        email: '',
        phoneNumber: '',
        streetAddress: '',
        regionId: '',
        provinceId: '',
        municipalityId: '',
        barangayId: '',
        vicariateId: '',
        parishId: '',
        customVicariate: '',
        customParish: '',
        password: '',
        repeatPassword: ''
    });

    // Load regions on component mount
    useEffect(() => {
        loadRegions();
        loadVicariates();
    }, []);

    // Load provinces when region changes
    useEffect(() => {
        if (formData.regionId) {
            loadProvinces(formData.regionId);
            // Clear dependent data arrays only
            setProvinces([]);
            setMunicipalities([]);
            setBarangays([]);
        } else {
            setProvinces([]);
            setMunicipalities([]);
            setBarangays([]);
        }
    }, [formData.regionId]);

    // Load municipalities when province changes
    useEffect(() => {
        if (formData.provinceId) {
            loadMunicipalities(formData.provinceId);
            // Clear dependent data arrays only
            setMunicipalities([]);
            setBarangays([]);
        } else {
            setMunicipalities([]);
            setBarangays([]);
        }
    }, [formData.provinceId]);

    // Load barangays when municipality changes
    useEffect(() => {
        if (formData.municipalityId) {
            loadBarangays(formData.municipalityId);
            // Clear dependent data arrays only
            setBarangays([]);
        } else {
            setBarangays([]);
        }
    }, [formData.municipalityId]);

    // Load parishes when vicariate changes
    useEffect(() => {
        if (formData.vicariateId) {
            loadParishesByVicariate(formData.vicariateId);
            // Clear parishes when vicariate changes
            setParishes([]);
        } else {
            setParishes([]);
        }
    }, [formData.vicariateId]);

    // API functions
    const loadRegions = async () => {
        setIsLoadingRegions(true);
        try {
            const regionsData = await locationAPI.getRegions();
            setRegions(regionsData.map(region => ({
                value: region.region_id.toString(),
                label: region.region_name
            })));
        } catch (error) {
            console.error('Failed to load regions:', error);
            alert('Failed to load regions. Please try again.');
        } finally {
            setIsLoadingRegions(false);
        }
    };

    const loadProvinces = async (regionId) => {
        setIsLoadingProvinces(true);
        try {
            const provincesData = await locationAPI.getProvincesByRegion(regionId);
            setProvinces(provincesData.map(province => ({
                value: province.province_id.toString(),
                label: province.province_name
            })));
        } catch (error) {
            console.error('Failed to load provinces:', error);
            alert('Failed to load provinces. Please try again.');
        } finally {
            setIsLoadingProvinces(false);
        }
    };

    const loadMunicipalities = async (provinceId) => {
        setIsLoadingMunicipalities(true);
        try {
            const municipalitiesData = await locationAPI.getMunicipalitiesByProvince(provinceId);
            setMunicipalities(municipalitiesData.map(municipality => ({
                value: municipality.municipality_id.toString(),
                label: municipality.municipality_name
            })));
        } catch (error) {
            console.error('Failed to load municipalities:', error);
            alert('Failed to load municipalities. Please try again.');
        } finally {
            setIsLoadingMunicipalities(false);
        }
    };

    const loadBarangays = async (municipalityId) => {
        setIsLoadingBarangays(true);
        try {
            const barangaysData = await locationAPI.getBarangaysByMunicipality(municipalityId);
            setBarangays(barangaysData.map(barangay => ({
                value: barangay.barangay_id.toString(),
                label: barangay.barangay_name
            })));
        } catch (error) {
            console.error('Failed to load barangays:', error);
            alert('Failed to load barangays. Please try again.');
        } finally {
            setIsLoadingBarangays(false);
        }
    };

    const loadVicariates = async () => {
        setIsLoadingVicariates(true);
        try {
            const vicariatesData = await locationAPI.getVicariates();
            setVicariates(vicariatesData.map(vicariate => ({
                value: vicariate.vicariate_id.toString(),
                label: vicariate.vicariate_name
            })));
        } catch (error) {
            console.error('Failed to load vicariates:', error);
            alert('Failed to load vicariates. Please try again.');
        } finally {
            setIsLoadingVicariates(false);
        }
    };

    const loadParishesByVicariate = async (vicariateId) => {
        setIsLoadingParishes(true);
        try {
            const parishesData = await locationAPI.getParishesByVicariate(vicariateId);
            setParishes(parishesData.map(parish => ({
                value: parish.parish_id.toString(),
                label: parish.parish_name
            })));
        } catch (error) {
            console.error('Failed to load parishes:', error);
            alert('Failed to load parishes. Please try again.');
        } finally {
            setIsLoadingParishes(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Handle cascading resets for location dropdowns
        if (name === 'regionId') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                provinceId: '',
                municipalityId: '',
                barangayId: ''
            }));
        } else if (name === 'provinceId') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                municipalityId: '',
                barangayId: ''
            }));
        } else if (name === 'municipalityId') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                barangayId: ''
            }));
        } else if (name === 'vicariateId') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                parishId: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleNext = () => {
        // Validate current step before proceeding
        const stepValidation = getStepValidation(1, formData);
        if (!stepValidation.isValid) {
            setValidationErrors(stepValidation.errors);
            return;
        }
        
        setValidationErrors({});
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(2);
            setIsTransitioning(false);
        }, 300);
    };

    const handleNext2 = () => {
        // Address step is optional, so no validation needed
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(3);
            setIsTransitioning(false);
        }, 300);
    };

    const handleNext3 = () => {
        // Parish/Vicariate step is optional, so no validation needed
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(4);
            setIsTransitioning(false);
        }, 300);
    };

    const handleSkipParish = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(4);
            setIsTransitioning(false);
        }, 300);
    };

    const handleBack = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(1);
            setIsTransitioning(false);
        }, 300);
    };

    const handleBack2 = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(2);
            setIsTransitioning(false);
        }, 300);
    };

    const handleBack3 = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(3);
            setIsTransitioning(false);
        }, 300);
    };

    const handleRegistrationSubmit = async () => {
        // Validate entire form
        const validation = validateRegistrationForm(formData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        setValidationErrors({});

        try {
            const result = await registrationAPI.registerUser(formData);
            
            if (result.success) {
                // Show success message and redirect to login
                alert(`🎉 ${result.message}\n\nYou can now log in with your credentials.`);
                onSwitchToLogin();
            } else {
                setSubmitError(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setSubmitError(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} totalSteps={4} />

            {/* Form Container with Smooth Transitions */}
            <div className="relative overflow-hidden min-h-[600px]">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                    <PersonalInfoStep
                        formData={formData}
                        handleInputChange={handleInputChange}
                        onNext={handleNext}
                        onSwitchToLogin={onSwitchToLogin}
                        isTransitioning={isTransitioning}
                        validationErrors={validationErrors}
                    />
                )}

                {/* Step 2: Address Information */}
                {currentStep === 2 && (
                    <AddressInfoStep
                        formData={formData}
                        handleInputChange={handleInputChange}
                        onNext={handleNext2}
                        onBack={handleBack}
                        onSwitchToLogin={onSwitchToLogin}
                        isTransitioning={isTransitioning}
                        regions={regions}
                        provinces={provinces}
                        municipalities={municipalities}
                        barangays={barangays}
                        isLoadingRegions={isLoadingRegions}
                        isLoadingProvinces={isLoadingProvinces}
                        isLoadingMunicipalities={isLoadingMunicipalities}
                        isLoadingBarangays={isLoadingBarangays}
                    />
                )}

                {/* Step 3: Parish & Vicariate Information */}
                {currentStep === 3 && (
                    <ParishVicariateStep
                        formData={formData}
                        handleInputChange={handleInputChange}
                        onNext={handleNext3}
                        onSkip={handleSkipParish}
                        onBack={handleBack2}
                        onSwitchToLogin={onSwitchToLogin}
                        isTransitioning={isTransitioning}
                        vicariates={vicariates}
                        parishes={parishes}
                        isLoadingVicariates={isLoadingVicariates}
                        isLoadingParishes={isLoadingParishes}
                    />
                )}

                {/* Step 4: Security */}
                {currentStep === 4 && (
                    <SecurityStep
                        formData={formData}
                        handleInputChange={handleInputChange}
                        onSubmit={handleRegistrationSubmit}
                        onBack={handleBack3}
                        onSwitchToLogin={onSwitchToLogin}
                        isTransitioning={isTransitioning}
                        validationErrors={validationErrors}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                    />
                )}
            </div>
        </div>
    );
}
