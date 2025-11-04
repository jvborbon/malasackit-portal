const AddressInfoStep = ({ 
    formData, 
    handleInputChange, 
    onNext, 
    onBack, 
    onSwitchToLogin, 
    isTransitioning,
    regions,
    provinces,
    municipalities,
    barangays,
    isLoadingRegions,
    isLoadingProvinces,
    isLoadingMunicipalities,
    isLoadingBarangays
}) => {
    const handleSubmit = (e) => {
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
        onNext();
    };

    return (
        <div className={`transition-all duration-300 ease-in-out ${
            !isTransitioning 
                ? 'transform translate-x-0 opacity-100' 
                : 'transform -translate-x-full opacity-0'
        }`}>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        onClick={onBack}
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
    );
};

export default AddressInfoStep;