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
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                {/* Address Details - Grid */}
                <div className="space-y-2">
                    {/* Grid for Region and Province */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                            <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                                Region <span className="text-red-200">*</span>
                            </label>
                            <select
                                name="regionId"
                                value={formData.regionId}
                                onChange={handleInputChange}
                                disabled={isLoadingRegions}
                                className="w-full px-2.5 sm:px-3 py-2.5 text-xs sm:text-sm border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none disabled:opacity-50"
                                required
                            >
                                <option value="" className="text-gray-900 bg-white">
                                    {isLoadingRegions ? 'Loading...' : 'Select region'}
                                </option>
                                {regions.map((region) => (
                                    <option key={region.value} value={region.value} className="text-gray-900 bg-white">
                                        {region.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                                Province <span className="text-red-200">*</span>
                            </label>
                            <select
                                name="provinceId"
                                value={formData.provinceId}
                                onChange={handleInputChange}
                                disabled={!formData.regionId || isLoadingProvinces}
                                className="w-full px-2.5 sm:px-3 py-2.5 text-xs sm:text-sm border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none disabled:opacity-50"
                                required
                            >
                                <option value="" className="text-gray-900 bg-white">
                                    {!formData.regionId ? 'Select region first' : 
                                     isLoadingProvinces ? 'Loading...' : 'Select province'}
                                </option>
                                {provinces.map((province) => (
                                    <option key={province.value} value={province.value} className="text-gray-900 bg-white">
                                        {province.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Grid for Municipality and Barangay */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                            <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                                Municipality <span className="text-red-200">*</span>
                            </label>
                            <select
                                name="municipalityId"
                                value={formData.municipalityId}
                                onChange={handleInputChange}
                                disabled={!formData.provinceId || isLoadingMunicipalities}
                                className="w-full px-2.5 sm:px-3 py-2.5 text-xs sm:text-sm border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none disabled:opacity-50"
                                required
                            >
                                <option value="" className="text-gray-900 bg-white">
                                    {!formData.provinceId ? 'Select province first' : 
                                     isLoadingMunicipalities ? 'Loading...' : 'Select municipality'}
                                </option>
                                {municipalities.map((municipality) => (
                                    <option key={municipality.value} value={municipality.value} className="text-gray-900 bg-white">
                                        {municipality.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                                Barangay <span className="text-red-200">*</span>
                            </label>
                            <select
                                name="barangayId"
                                value={formData.barangayId}
                                onChange={handleInputChange}
                                disabled={!formData.municipalityId || isLoadingBarangays}
                                className="w-full px-2.5 sm:px-3 py-2.5 text-xs sm:text-sm border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none disabled:opacity-50"
                                required
                            >
                                <option value="" className="text-gray-900 bg-white">
                                    {!formData.municipalityId ? 'Select municipality first' : 
                                     isLoadingBarangays ? 'Loading...' : 'Select barangay'}
                                </option>
                                {barangays.map((barangay) => (
                                    <option key={barangay.value} value={barangay.value} className="text-gray-900 bg-white">
                                        {barangay.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Street Address */}
                    <div>
                        <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                            Street Address <span className="text-red-200">*</span>
                        </label>
                        <input
                            type="text"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            className="w-full px-2.5 sm:px-3 py-2.5 text-xs sm:text-sm border-2 border-white bg-transparent text-white rounded-lg focus:border-red-200 focus:outline-none placeholder-red-200"
                            placeholder="House no., Street, Subdivision"
                            required
                        />
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-2.5 sm:gap-3 pt-2 sm:pt-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full bg-white/20 text-white font-semibold py-3 sm:py-3.5 rounded-lg hover:bg-white/30 transition duration-200 text-sm sm:text-base"
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-white text-red-900 font-semibold py-3 sm:py-3.5 rounded-lg hover:bg-red-50 transition duration-200 text-sm sm:text-base"
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

export default AddressInfoStep;