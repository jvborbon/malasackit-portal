import React, { useState } from 'react';
import { HiX, HiCalendar, HiClock } from 'react-icons/hi';

function AddEventModal({ isOpen, onClose, onSubmit, loading }) {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        description: '',
        remarks: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.date) {
            newErrors.date = 'Date is required';
        }
        
        if (!formData.description || formData.description.trim() === '') {
            newErrors.description = 'Event description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validate()) {
            onSubmit(formData);
        }
    };

    const handleClose = () => {
        setFormData({
            date: '',
            time: '',
            description: '',
            remarks: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            style={{ margin: 0, padding: '1rem' }}
        >
            <div className="relative w-full max-w-2xl bg-white rounded-md shadow-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Add New Event</h3>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <HiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`pl-10 pr-3 py-2.5 block w-full rounded-md shadow-sm bg-white text-gray-900 border focus:ring-red-500 focus:border-red-500 ${
                                    errors.date ? 'border-red-300' : 'border-gray-300'
                                }`}
                                style={{ colorScheme: 'light' }}
                                disabled={loading}
                            />
                        </div>
                        {errors.date && (
                            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                        )}
                    </div>

                    {/* Time (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time (Optional)
                        </label>
                        <div className="relative">
                            <HiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="pl-10 pr-3 py-2.5 block w-full rounded-md border border-gray-300 shadow-sm bg-white text-gray-900 focus:ring-red-500 focus:border-red-500"
                                style={{ colorScheme: 'light' }}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Description <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="e.g., Team Meeting, Donation Drive, Community Event"
                            className={`px-3 py-2.5 block w-full rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-400 border focus:ring-red-500 focus:border-red-500 ${
                                errors.description ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={loading}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Remarks/Notes (Optional)
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Additional details about the event..."
                            className="px-3 py-2.5 block w-full rounded-md border border-gray-300 shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                            disabled={loading}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEventModal;
