export default function UserProfileSettings({ userInfo }) {
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
                            onClick={() => alert('Profile picture functionality will be implemented soon!')}
                        >
                            Edit Profile Picture
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={userInfo?.fullName || ''} 
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                        type="email" 
                        value={userInfo?.email || ''} 
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                        type="tel" 
                        value={userInfo?.phone || ''} 
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea 
                        value={userInfo?.address || ''} 
                        readOnly
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>
                <div className="pt-4">
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
