import { useState, useEffect } from 'react';
import { sanitizeInput, sanitizeEmail, sanitizePhone, sanitizeFormData } from '../utils/sanitization';
import { updateUserProfile, sendVerificationEmail } from '../services/userService';
import { locationAPI } from '../services/locationAPI';

export default function UserProfileSettings({ userInfo }) {
    const [formData, setFormData] = useState({
        fullName: userInfo?.full_name || '',
        email: userInfo?.email || '',
        phone: userInfo?.contact_num || '',
        regionId: userInfo?.region_id || '',
        provinceId: userInfo?.province_id || '',
        municipalityId: userInfo?.municipality_id || '',
        barangayId: userInfo?.barangay_id || '',
        streetAddress: userInfo?.streetaddress || ''
    });
    
    // Local state for email verification status
    const [emailVerified, setEmailVerified] = useState(userInfo?.email_verified || false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Location data
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    
    // Update email verified status when userInfo changes
    useEffect(() => {
        if (userInfo?.email_verified !== undefined) {
            setEmailVerified(userInfo.email_verified);
        }
    }, [userInfo?.email_verified]);
    
    // Load regions on mount
    useEffect(() => {
        const loadRegions = async () => {
            try {
                const data = await locationAPI.getRegions();
                setRegions(data);
            } catch (err) {
                console.error('Error loading regions:', err);
            }
        };
        loadRegions();
    }, []);
    
    // Load provinces when region changes
    useEffect(() => {
        const loadProvinces = async () => {
            if (formData.regionId) {
                try {
                    const data = await locationAPI.getProvincesByRegion(formData.regionId);
                    setProvinces(data);
                } catch (err) {
                    console.error('Error loading provinces:', err);
                }
            } else {
                setProvinces([]);
                setMunicipalities([]);
                setBarangays([]);
            }
        };
        loadProvinces();
    }, [formData.regionId]);
    
    // Load municipalities when province changes
    useEffect(() => {
        const loadMunicipalities = async () => {
            if (formData.provinceId) {
                try {
                    const data = await locationAPI.getMunicipalitiesByProvince(formData.provinceId);
                    setMunicipalities(data);
                } catch (err) {
                    console.error('Error loading municipalities:', err);
                }
            } else {
                setMunicipalities([]);
                setBarangays([]);
            }
        };
        loadMunicipalities();
    }, [formData.provinceId]);
    
    // Load barangays when municipality changes
    useEffect(() => {
        const loadBarangays = async () => {
            if (formData.municipalityId) {
                try {
                    const data = await locationAPI.getBarangaysByMunicipality(formData.municipalityId);
                    setBarangays(data);
                } catch (err) {
                    console.error('Error loading barangays:', err);
                }
            } else {
                setBarangays([]);
            }
        };
        loadBarangays();
    }, [formData.municipalityId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Sanitize input based on field type
        let sanitizedValue = value;
        if (name === 'email') {
            sanitizedValue = sanitizeEmail(value);
        } else if (name === 'phone') {
            sanitizedValue = sanitizePhone(value);
        } else if (['fullName', 'streetAddress'].includes(name)) {
            sanitizedValue = sanitizeInput(value);
        }
        
        // Reset dependent dropdowns when parent changes
        if (name === 'regionId') {
            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue,
                provinceId: '',
                municipalityId: '',
                barangayId: ''
            }));
        } else if (name === 'provinceId') {
            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue,
                municipalityId: '',
                barangayId: ''
            }));
        } else if (name === 'municipalityId') {
            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue,
                barangayId: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue
            }));
        }
    };

    const handleEditProfile = () => {
        setIsEditing(true);
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            // Sanitize form data before submission
            const sanitizedData = sanitizeFormData(formData);
            
            // Call API to update profile
            const response = await updateUserProfile(sanitizedData);
            
            if (response.success) {
                setSuccessMessage('Profile updated successfully!');
                setIsEditing(false);
                
                // Update local userInfo if needed
                if (userInfo) {
                    Object.assign(userInfo, {
                        fullName: response.data.user.full_name,
                        email: response.data.user.email,
                        phone: response.data.user.contact_num,
                        regionId: response.data.user.region_id,
                        provinceId: response.data.user.province_id,
                        municipalityId: response.data.user.municipality_id,
                        barangayId: response.data.user.barangay_id,
                        streetaddress: response.data.user.streetaddress
                    });
                }
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(response.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError(
                err.response?.data?.message || 
                'Failed to update profile. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original values
        setFormData({
            fullName: userInfo?.full_name || '',
            email: userInfo?.email || '',
            phone: userInfo?.contact_num || '',
            regionId: userInfo?.region_id || '',
            provinceId: userInfo?.province_id || '',
            municipalityId: userInfo?.municipality_id || '',
            barangayId: userInfo?.barangay_id || '',
            streetAddress: userInfo?.streetaddress || ''
        });
        setIsEditing(false);
        setError('');
        setSuccessMessage('');
    };

    const handleSendVerificationEmail = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            const response = await sendVerificationEmail();
            
            if (response.success) {
                setSuccessMessage('Verification email sent! Please check your inbox.');
                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setError(response.message || 'Failed to send verification email');
            }
        } catch (err) {
            console.error('Send verification email error:', err);
            setError(
                err.response?.data?.message || 
                'Failed to send verification email. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Set Profile for Your Account</h2>
            
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">{successMessage}</p>
                </div>
            )}
            
            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName} 
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                            isEditing ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                        }`}
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        {emailVerified ? (
                            <span className="flex items-center text-xs text-green-600 font-medium">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                Verified
                            </span>
                        ) : (
                            <span className="flex items-center text-xs text-orange-600 font-medium">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                </svg>
                                Not Verified
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg ${
                                isEditing ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                            }`}
                        />
                        {!emailVerified && (
                            <button
                                type="button"
                                onClick={handleSendVerificationEmail}
                                disabled={loading}
                                className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Sending...' : 'Verify Email'}
                            </button>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                            isEditing ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                        }`}
                    />
                </div>
                
                {/* Address Section */}
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                            <select 
                                name="regionId"
                                value={formData.regionId}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                                    isEditing ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                                }`}
                            >
                                <option value="">Select Region</option>
                                {regions.map((region) => (
                                    <option key={region.region_id} value={region.region_id}>
                                        {region.region_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                            <select 
                                name="provinceId"
                                value={formData.provinceId}
                                onChange={handleInputChange}
                                disabled={!isEditing || !formData.regionId}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                                    isEditing && formData.regionId ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                                }`}
                            >
                                <option value="">Select Province</option>
                                {provinces.map((province) => (
                                    <option key={province.province_id} value={province.province_id}>
                                        {province.province_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Municipality/City</label>
                            <select 
                                name="municipalityId"
                                value={formData.municipalityId}
                                onChange={handleInputChange}
                                disabled={!isEditing || !formData.provinceId}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                                    isEditing && formData.provinceId ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                                }`}
                            >
                                <option value="">Select Municipality/City</option>
                                {municipalities.map((municipality) => (
                                    <option key={municipality.municipality_id} value={municipality.municipality_id}>
                                        {municipality.municipality_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
                            <select 
                                name="barangayId"
                                value={formData.barangayId}
                                onChange={handleInputChange}
                                disabled={!isEditing || !formData.municipalityId}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                                    isEditing && formData.municipalityId ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                                }`}
                            >
                                <option value="">Select Barangay</option>
                                {barangays.map((barangay) => (
                                    <option key={barangay.barangay_id} value={barangay.barangay_id}>
                                        {barangay.barangay_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                            <textarea 
                                name="streetAddress"
                                value={formData.streetAddress}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                rows="3"
                                placeholder="House number, street name, building, etc."
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                                    isEditing ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                                }`}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="pt-4">
                    {isEditing ? (
                        <div className="flex space-x-3">
                            <button 
                                onClick={handleSaveChanges}
                                disabled={loading}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                            <button 
                                onClick={handleCancel}
                                disabled={loading}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleEditProfile}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}