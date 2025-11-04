import { useState, useEffect } from 'react';
import { locationAPI } from './services/locationAPI';
import StepIndicator from './common/StepIndicator';
import PersonalInfoStep from './registration/PersonalInfoStep';
import AddressInfoStep from './registration/AddressInfoStep';
import ParishVicariateStep from './registration/ParishVicariateStep';
import SecurityStep from './registration/SecurityStep';

export default function RegisterForm({ onSwitchToLogin }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // Address dropdown data
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);
    const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

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
        parish: '',
        vicariate: '',
        password: '',
        repeatPassword: ''
    });

    // Load regions on component mount
    useEffect(() => {
        loadRegions();
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
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(2);
            setIsTransitioning(false);
        }, 300);
    };

    const handleNext2 = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(3);
            setIsTransitioning(false);
        }, 300);
    };

    const handleNext3 = () => {
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

    const handleRegistrationSubmit = () => {
        console.log('Registration data:', formData);
        // Add registration logic here
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
                    />
                )}
            </div>
        </div>
    );
}
