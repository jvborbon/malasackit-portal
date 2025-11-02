import { useState, useEffect } from 'react';
import { locationAPI } from '../services/locationAPI';

// Google-style Floating Input Component
const FloatingInput = ({ label, type = "text", name, value, onChange, required = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;
    const shouldFloat = isFocused || hasValue;

    return (
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full px-4 py-4 bg-transparent border-2 text-white placeholder-transparent focus:outline-none text-base rounded-lg transition-all duration-200 ${
                    isFocused ? 'border-red-200' : 'border-white'
                } ${shouldFloat ? 'pt-6 pb-2' : 'pt-4 pb-4'}`}
                placeholder=" "
                required={required}
            />
            <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-red-600 px-1 ${
                shouldFloat 
                    ? '-top-2 text-sm text-red-200 scale-90' 
                    : 'top-1/2 transform -translate-y-1/2 text-base text-white'
            }`}>
                {label}
            </label>
        </div>
    );
};

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
            // Reset dependent dropdowns
            setFormData(prev => ({
                ...prev,
                provinceId: '',
                municipalityId: '',
                barangayId: ''
            }));
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
            // Reset dependent dropdowns
            setFormData(prev => ({
                ...prev,
                municipalityId: '',
                barangayId: ''
            }));
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
            // Reset barangay selection
            setFormData(prev => ({
                ...prev,
                barangayId: ''
            }));
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        // Validate step 1 fields
        if (!formData.fullName || !formData.email || !formData.phoneNumber) {
            alert('Please fill in all required fields');
            return;
        }
        
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(2);
            setIsTransitioning(false);
        }, 300);
    };

    const handleNext2 = (e) => {
        e.preventDefault();
        // Validate step 2 fields (address)
        if (!formData.regionId || !formData.provinceId || !formData.municipalityId || !formData.barangayId) {
            alert('Please select your region, province, municipality, and barangay');
            return;
        }
        if (!formData.streetAddress) {
            alert('Please enter your street address');
            return;
        }
        
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(3);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate passwords
        if (formData.password !== formData.repeatPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        console.log('Registration data:', formData);
        // Add registration logic here
    };

    return (
        <div className="space-y-4">
            {/* Step Indicator */}
            <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep >= 1 ? 'bg-white text-red-600 scale-110' : 'bg-red-400 text-white scale-100'
                    }`}>
                        1
                    </div>
                    <div className={`w-12 h-0.5 transition-all duration-500 ${
                        currentStep >= 2 ? 'bg-white' : 'bg-red-400'
                    }`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep >= 2 ? 'bg-white text-red-600 scale-110' : 'bg-red-400 text-white scale-100'
                    }`}>
                        2
                    </div>
                    <div className={`w-12 h-0.5 transition-all duration-500 ${
                        currentStep >= 3 ? 'bg-white' : 'bg-red-400'
                    }`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep >= 3 ? 'bg-white text-red-600 scale-110' : 'bg-red-400 text-white scale-100'
                    }`}>
                        3
                    </div>
                </div>
            </div>

            {/* Form Container with Smooth Transitions */}
            <div className="relative overflow-hidden min-h-[600px]">
                {/* Step 1: Personal Information */}
                <div className={`transition-all duration-300 ease-in-out ${
                    currentStep === 1 && !isTransitioning 
                        ? 'transform translate-x-0 opacity-100' 
                        : currentStep === 1 && isTransitioning
                        ? 'transform -translate-x-full opacity-0'
                        : 'transform -translate-x-full opacity-0 absolute top-0 w-full'
                }`}>
                    <form onSubmit={handleNext} className="space-y-6">
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
                                    formData.accountType === 'INDIVIDUAL' 
                                        ? 'border-white bg-white/20 text-white shadow-lg' 
                                        : 'border-red-200 bg-transparent text-white hover:border-white hover:bg-white/10 hover:shadow-md'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, accountType: 'INDIVIDUAL' }))}
                            >
                                <div className="text-center">
                                    <div className="text-lg font-medium">Individual</div>
                                    <div className="text-sm opacity-80">Personal account</div>
                                </div>
                            </div>
                            <div 
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                    formData.accountType === 'ORGANIZATION' 
                                        ? 'border-white bg-white/20 text-white shadow-lg' 
                                        : 'border-red-200 bg-transparent text-white hover:border-white hover:bg-white/10 hover:shadow-md'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, accountType: 'ORGANIZATION' }))}
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

                {/* Step 2: Address Information */}
                <div className={`transition-all duration-300 ease-in-out ${
                    currentStep === 2 && !isTransitioning 
                        ? 'transform translate-x-0 opacity-100' 
                        : currentStep === 2 && isTransitioning
                        ? 'transform -translate-x-full opacity-0'
                        : currentStep === 1
                        ? 'transform translate-x-full opacity-0 absolute top-0 w-full'
                        : currentStep === 3
                        ? 'transform -translate-x-full opacity-0 absolute top-0 w-full'
                        : 'transform translate-x-full opacity-0 absolute top-0 w-full'
                }`}>
                    <form onSubmit={handleNext2} className="space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="text-white text-lg font-bold">Address Information</h3>
                        </div>

                        {/* Address Details with Dropdowns */}
                        <div className="space-y-3">
                        
                        {/* Address Dropdowns with Simple Styling */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Region <span className="text-red-200">*</span>
                                </label>
                                <select
                                    name="regionId"
                                    value={formData.regionId}
                                    onChange={handleInputChange}
                                    disabled={isLoadingRegions}
                                    className="w-full px-4 py-2.5 border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none disabled:opacity-50"
                                    required
                                >
                                    <option value="" className="text-gray-900 bg-white">
                                        {isLoadingRegions ? 'Loading regions...' : 'Select region'}
                                    </option>
                                    {regions.map((region) => (
                                        <option key={region.value} value={region.value} className="text-gray-900 bg-white">
                                            {region.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Province <span className="text-red-200">*</span>
                                </label>
                                <select
                                    name="provinceId"
                                    value={formData.provinceId}
                                    onChange={handleInputChange}
                                    disabled={!formData.regionId || isLoadingProvinces}
                                    className="w-full px-4 py-2.5 border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none disabled:opacity-50"
                                    required
                                >
                                    <option value="" className="text-gray-900 bg-white">
                                        {!formData.regionId ? 'Select region first' : 
                                         isLoadingProvinces ? 'Loading provinces...' : 'Select province'}
                                    </option>
                                    {provinces.map((province) => (
                                        <option key={province.value} value={province.value} className="text-gray-900 bg-white">
                                            {province.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Municipality/City/Town <span className="text-red-200">*</span>
                                </label>
                                <select
                                    name="municipalityId"
                                    value={formData.municipalityId}
                                    onChange={handleInputChange}
                                    disabled={!formData.provinceId || isLoadingMunicipalities}
                                    className="w-full px-4 py-2.5 border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none disabled:opacity-50"
                                    required
                                >
                                    <option value="" className="text-gray-900 bg-white">
                                        {!formData.provinceId ? 'Select province first' : 
                                         isLoadingMunicipalities ? 'Loading municipalities...' : 'Select municipality'}
                                    </option>
                                    {municipalities.map((municipality) => (
                                        <option key={municipality.value} value={municipality.value} className="text-gray-900 bg-white">
                                            {municipality.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Barangay <span className="text-red-200">*</span>
                                </label>
                                <select
                                    name="barangayId"
                                    value={formData.barangayId}
                                    onChange={handleInputChange}
                                    disabled={!formData.municipalityId || isLoadingBarangays}
                                    className="w-full px-4 py-2.5 border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none disabled:opacity-50"
                                    required
                                >
                                    <option value="" className="text-gray-900 bg-white">
                                        {!formData.municipalityId ? 'Select municipality first' : 
                                         isLoadingBarangays ? 'Loading barangays...' : 'Select barangay'}
                                    </option>
                                    {barangays.map((barangay) => (
                                        <option key={barangay.value} value={barangay.value} className="text-gray-900 bg-white">
                                            {barangay.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Street Address/Subdivision <span className="text-red-200">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="streetAddress"
                                    value={formData.streetAddress}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none placeholder-gray-300"
                                    placeholder="Enter your street address"
                                    required
                                />
                            </div>
                        </div>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex space-x-4 pt-3">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-full bg-red-400 text-white font-bold py-3 px-4 rounded hover:bg-red-500 transition duration-200"
                            >
                                ← Back
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
                {/* Step 3: Security */}
                <div className={`transition-all duration-300 ease-in-out ${
                    currentStep === 3 && !isTransitioning 
                        ? 'transform translate-x-0 opacity-100' 
                        : currentStep === 3 && isTransitioning
                        ? 'transform translate-x-full opacity-0'
                        : currentStep < 3
                        ? 'transform translate-x-full opacity-0 absolute top-0 w-full'
                        : 'transform -translate-x-full opacity-0 absolute top-0 w-full'
                }`}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="text-white text-lg font-bold">Security</h3>
                        </div>

                        {/* Password Fields */}
                        <div className="space-y-4">
                            <FloatingInput
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                            <FloatingInput
                                label="Repeat Password"
                                type="password"
                                name="repeatPassword"
                                value={formData.repeatPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={handleBack2}
                                className="w-full bg-red-400 text-white font-bold py-3 px-4 rounded hover:bg-red-500 transition duration-200"
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                className="w-full bg-white text-red-600 font-bold py-3 px-4 rounded hover:bg-red-50 transition duration-200"
                            >
                                Register
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
            </div>
        </div>
    );
}
