import { useState } from 'react';
import { 
    HiX, 
    HiUser, 
    HiMail, 
    HiCalendar, 
    HiClock, 
    HiShieldCheck,
    HiStatusOnline,
    HiStatusOffline,
    HiPencil,
    HiTrash,
    HiCheck,
    HiBan
} from 'react-icons/hi';

export default function UserDetails({ isOpen, onClose, user, onEdit, onDelete }) {
    if (!isOpen || !user) return null;

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'staff':
                return 'bg-blue-100 text-blue-800';
            case 'donor':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <HiUser className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-sm text-gray-500">User Details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiX className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                Basic Information
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <HiUser className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Full Name</p>
                                        <p className="text-sm text-gray-600">{user.name}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <HiMail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Email Address</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <HiShieldCheck className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Role</p>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    {user.status === 'active' ? 
                                        <HiStatusOnline className="w-5 h-5 text-green-500" /> : 
                                        <HiStatusOffline className="w-5 h-5 text-gray-400" />
                                    }
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Status</p>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                Account Details
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <HiCalendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Date Created</p>
                                        <p className="text-sm text-gray-600">{formatDate(user.dateCreated)}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <HiClock className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Last Login</p>
                                        <p className="text-sm text-gray-600">{formatDateTime(user.lastLogin)}</p>
                                    </div>
                                </div>
                                
                                {user.phone && (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">📞</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Phone Number</p>
                                            <p className="text-sm text-gray-600">{user.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    {(user.streetAddress || user.city || user.state || user.brgysubdivision || user.zipCode) && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                                Address Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.streetAddress && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-medium text-gray-900">Street Address</p>
                                        <p className="text-sm text-gray-600 mt-1">{user.streetAddress}</p>
                                    </div>
                                )}
                                
                                {user.brgysubdivision && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Barangay/Subdivision</p>
                                        <p className="text-sm text-gray-600 mt-1">{user.brgysubdivision}</p>
                                    </div>
                                )}
                                
                                {user.city && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Municipality/City/Town</p>
                                        <p className="text-sm text-gray-600 mt-1">{user.city}</p>
                                    </div>
                                )}
                                
                                {user.state && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">State/Province</p>
                                        <p className="text-sm text-gray-600 mt-1">{user.state}</p>
                                    </div>
                                )}
                                
                                {user.zipCode && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Postal Code</p>
                                        <p className="text-sm text-gray-600 mt-1">{user.zipCode}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Church Information */}
                    {(user.parish || user.vicariate) && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                                Church Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.parish && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Parish</p>
                                        <p className="text-sm text-gray-600 mt-1">{user.parish}</p>
                                    </div>
                                )}
                                
                                {user.vicariate && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Vicariate</p>
                                        <p className="text-sm text-gray-600 mt-1">{user.vicariate}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Permissions */}
                    {user.permissions && user.permissions.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                                Permissions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {user.permissions.map((permission, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg"
                                    >
                                        <HiCheck className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-gray-700">
                                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Notes */}
                    {user.notes && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                                Notes
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-700">{user.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex space-x-3">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(user)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <HiPencil className="w-4 h-4 mr-2" />
                                Edit User
                            </button>
                        )}
                    </div>

                    <div className="flex space-x-3">
                        {onDelete && (
                            <button
                                onClick={() => onDelete(user)}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <HiTrash className="w-4 h-4 mr-2" />
                                Delete
                            </button>
                        )}
                        
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
                    </div>
                </div>
            </div>
        </div>
    );
}