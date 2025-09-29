import { useState } from 'react';

export default function RegisterForm({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        fullName: '',
        donorType: 'INDIVIDUAL',
        email: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        brgysubdivision: '',
        zipCode: '',
        parish: '',
        vicariate: '',
        password: '',
        repeatPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.repeatPassword) {
            alert('Passwords do not match!');
            return;
        }
        console.log('Registration data:', formData);
        // Add registration logic 
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            {/* First Row - Full Name, Email, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        Email Address:
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
                <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        Phone Number:
                    </label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
                </div>
            </div>

            {/* Donor Type */}
            <div>
                <label className="block text-white font-semibold mb-2 text-xs">
                    Donor Type:
                </label>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, donorType: 'INDIVIDUAL' }))}
                        className={`px-4 py-1.5 text-sm font-semibold transition duration-200 ${
                            formData.donorType === 'INDIVIDUAL'
                                ? 'bg-red-800 text-white'
                                : 'bg-red-400 text-white hover:bg-red-500'
                        }`}
                    >
                        INDIVIDUAL
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, donorType: 'ORGANIZATION' }))}
                        className={`px-4 py-1.5 text-sm font-semibold transition duration-200 ${
                            formData.donorType === 'ORGANIZATION'
                                ? 'bg-red-800 text-white'
                                : 'bg-red-400 text-white hover:bg-red-500'
                        }`}
                    >
                        ORGANIZATION
                    </button>
                </div>
            </div>

            {/* Street Address Row */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        Street Address:
                    </label>
                    <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
            </div>
    

            {/* Third Row - State and Municipality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        State/Province:
                    </label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        Municipality/City/Town:
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
            </div>
            
            {/* Fourth Row - Barangay and Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        Barangay/Subdivision:
                    </label>
                    <input
                        type="text"
                        name="brgysubdivision"
                        value={formData.brgysubdivision}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        Postal Code:
                    </label>
                    <input
                        type="text"
                        name="zipcode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
            </div>

            {/* Fifth Row - Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        Password:
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-white font-semibold mb-1 text-xs">
                        Repeat Password:
                    </label>
                    <input
                        type="password"
                        name="repeatPassword"
                        value={formData.repeatPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border-2 border-white text-white placeholder-red-200 focus:outline-none focus:border-red-200 text-sm rounded-md"
                        required
                    />
                </div>
            </div>

            {/* Submit button */}
            <div className="pt-3">
                <button
                    type="submit"
                    className="w-full bg-white text-red-600 font-bold py-2.5 px-4 hover:bg-red-50 transition duration-200"
                >
                    Register
                </button>
            </div>

            {/* Login link */}
            <div className="text-center pt-3">
                <span className="text-white font-semibold text-sm">Already have an account? </span>
                <button 
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-blue-200 hover:text-blue-100 underline font-semibold text-sm"
                >
                    Login Here!
                </button>
            </div>
        </form>
    );
}
