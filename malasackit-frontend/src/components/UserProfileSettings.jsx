import { useState } from 'react';

export default function UserProfileSettings({ userInfo }) {
    const [formData, setFormData] = useState({
        fullName: userInfo?.fullName || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        address: userInfo?.address || ''
    });
    
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            address: userInfo?.address || ''
        });
        setIsEditing(false);
    };


    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Set Profile for Your Account</h2>
            
            {/* Profile Picture Section */}
            <div className="mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                            {userInfo?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Upload a profile picture to personalize your account
                        </p>
                        <button 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            onClick={handleEditProfile}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
            
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
