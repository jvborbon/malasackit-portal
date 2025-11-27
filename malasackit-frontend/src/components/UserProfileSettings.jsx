import { useState } from 'react';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '../utils/sanitization';

export default function UserProfileSettings({ userInfo }) {
    const [formData, setFormData] = useState({
        fullName: userInfo?.fullName || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        gender: userInfo?.gender || '',
        address: userInfo?.address || ''
    });
    
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Sanitize input based on field type
        let sanitizedValue = value;
        if (name === 'email') {
            sanitizedValue = sanitizeEmail(value);
        } else if (name === 'phone') {
            sanitizedValue = sanitizePhone(value);
        } else if (['fullName', 'address'].includes(name)) {
            sanitizedValue = sanitizeInput(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));
    };

    const handleEditProfile = () => {
        setIsEditing(true);
    };

    const handleSaveChanges = () => {
        // Here you would typically send the data to your backend
        console.log('Saving profile changes:', formData);
        
        // For now, just show an alert
        alert('Profile changes saved successfully!');
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset form data to original values
        setFormData({
            fullName: userInfo?.fullName || '',
            email: userInfo?.email || '',
            phone: userInfo?.phone || '',
            gender: userInfo?.gender || '',
            address: userInfo?.address || ''
        });
        setIsEditing(false);
    };


    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Set Profile for Your Account</h2> 
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                            isEditing ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                        }`}
                    />
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select 
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                            isEditing ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                        }`}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        rows="3"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                            isEditing ? 'bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'bg-gray-50'
                        }`}
                    />
                </div>
                <div className="pt-4">
                    {isEditing ? (
                        <div className="flex space-x-3">
                            <button 
                                onClick={handleSaveChanges}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Save Changes
                            </button>
                            <button 
                                onClick={handleCancel}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
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