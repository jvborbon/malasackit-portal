import { useState } from 'react';
import { 
    HiX,
    HiCheck
} from 'react-icons/hi';
import { sanitizeInput, sanitizeEmail, sanitizeFormData } from '../utils/sanitization';

export default function UserModalForm({ isOpen, onClose, user, onSave }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'donor',
        status: user?.status || 'active',
        permissions: user?.permissions || []
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const rolePermissions = {
        admin: ['user_management', 'system_settings', 'reports', 'beneficiary_logs', 'donation_requests'],
        staff: ['inventory_management', 'beneficiary_logs', 'donation_requests'],
        donor: ['donate', 'view_history']
    };

    const handleRoleChange = (newRole) => {
        setFormData({
            ...formData,
            role: newRole,
            permissions: rolePermissions[newRole] || []
        });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Sanitize form data before submission
            const sanitizedData = sanitizeFormData(formData);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSave(sanitizedData);
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        // Sanitize input based on field type
        let sanitizedValue = value;
        if (field === 'email') {
            sanitizedValue = sanitizeEmail(value);
        } else if (field === 'name') {
            sanitizedValue = sanitizeInput(value);
        }
        
        setFormData({ ...formData, [field]: sanitizedValue });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {user ? 'Edit User' : 'Add New User'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {user ? 'Update user information and permissions' : 'Create a new user account'}
                                </p>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
                                disabled={isSubmitting}
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 transition-colors duration-200 ${
                                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-red-500'
                                    }`}
                                    placeholder="Enter full name"
                                    disabled={isSubmitting}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 transition-colors duration-200 ${
                                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-red-500'
                                    }`}
                                    placeholder="Enter email address"
                                    disabled={isSubmitting}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Role and Status Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Role Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-colors duration-200"
                                        disabled={isSubmitting}
                                    >
                                        <option value="donor">Donor</option>
                                        <option value="resource staff">Resource Staff</option>
                                        <option value="executive admin">Executive Admin</option>
                                    </select>
                                </div>

                                {/* Status Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-colors duration-200"
                                        disabled={isSubmitting}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Permissions Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Permissions
                                    <span className="text-xs text-gray-500 ml-1">(Auto-assigned based on role)</span>
                                </label>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                        {formData.permissions.map((permission) => (
                                            <div key={permission} className="flex items-center">
                                                <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full mr-3 flex-shrink-0">
                                                    <HiCheck className="w-3 h-3 text-green-600" />
                                                </div>
                                                <span className="text-sm text-gray-700">
                                                    {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {formData.permissions.length === 0 && (
                                        <p className="text-sm text-gray-500 italic">No permissions assigned</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {user ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        user ? 'Update User' : 'Create User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
