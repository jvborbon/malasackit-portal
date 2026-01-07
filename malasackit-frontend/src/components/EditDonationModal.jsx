import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { getDonationDetails, updateDonationRequest } from '../services/donationService';

const EditDonationModal = ({ donationId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        delivery_method: 'pickup',
        notes: ''
    });
    const [donationData, setDonationData] = useState(null);

    // Load existing donation data
    useEffect(() => {
        const loadDonationData = async () => {
            try {
                setLoading(true);
                setError('');
                
                console.log('Loading donation details for ID:', donationId);
                
                // Add timeout to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout after 5 seconds')), 5000)
                );
                
                const response = await Promise.race([
                    getDonationDetails(donationId),
                    timeoutPromise
                ]);
                console.log('getDonationDetails response:', response);
                
                if (response && response.success && response.data) {
                    const donation = response.data.donation;
                    setDonationData(response.data);
                    setFormData({
                        delivery_method: donation.delivery_method || 'pickup',
                        notes: donation.notes || ''
                    });
                    console.log('Successfully loaded donation data');
                } else {
                    console.error('Response not successful or no data:', response);
                    setError('Failed to load donation details: ' + (response?.message || 'No data returned'));
                }
            } catch (err) {
                console.error('Error loading donation data:', err);
                setError('Connection error: ' + err.message + ' - Please ensure backend server is running on port 3000');
            } finally {
                setLoading(false);
            }
        };

        if (donationId) {
            loadDonationData();
        } else {
            setLoading(false);
            setError('No donation ID provided');
        }
    }, [donationId]);

    // Handle form changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');

            const updateData = {
                delivery_method: formData.delivery_method,
                notes: formData.notes
            };

            const response = await updateDonationRequest(donationId, updateData);
            
            if (response.success) {
                onSuccess();
                onClose();
            } else {
                setError(response.message || 'Failed to update donation request');
            }
        } catch (err) {
            setError('Error updating donation: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span>Loading donation details...</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                        If this takes more than a few seconds, the backend server may not be running.
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold">Edit Donation Request</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Delivery Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Method
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleInputChange('delivery_method', 'pickup')}
                                className={`p-3 border-2 rounded-lg text-center ${
                                    formData.delivery_method === 'pickup'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="font-medium">Pickup</div>
                                <div className="text-xs text-gray-500">We'll collect from you</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleInputChange('delivery_method', 'dropoff')}
                                className={`p-3 border-2 rounded-lg text-center ${
                                    formData.delivery_method === 'dropoff'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="font-medium">Drop-off</div>
                                <div className="text-xs text-gray-500">You bring to us</div>
                            </button>
                        </div>
                    </div>

                    {/* Items (Read-only display) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Donation Items (Cannot be changed)
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            {donationData?.items?.map((item, index) => (
                                <div key={index} className="mb-3 last:mb-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-gray-900">{item.itemtype_name}</div>
                                            <div className="text-sm text-gray-600">{item.category_name}</div>
                                            {item.description && (
                                                <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">Qty: {item.quantity}</div>
                                            <div className="text-sm text-gray-600">₱{item.declared_value}</div>
                                            <div className="text-xs text-gray-500 capitalize">{item.condition_donated}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Note: Items cannot be modified once submitted. Only delivery method and notes can be updated.
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
                            placeholder="Any additional information..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 flex items-center"
                        >
                            {saving && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            )}
                            {saving ? 'Updating...' : 'Update Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDonationModal;