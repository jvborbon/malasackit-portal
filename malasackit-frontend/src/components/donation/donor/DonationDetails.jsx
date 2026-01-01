import { useState, useEffect } from 'react';
import { HiLocationMarker } from 'react-icons/hi';
import { getAvailableSlots } from '../../../services/donationService';
import { formatTime } from '../../../utils/donationHelpers';

export function DonationDetails({ formData, handleInputChange }) {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Load available slots when date changes
    useEffect(() => {
        if (formData.scheduleDate) {
            loadAvailableSlots(formData.scheduleDate);
        } else {
            setAvailableSlots([]);
        }
    }, [formData.scheduleDate]);

    const loadAvailableSlots = async (date) => {
        try {
            setLoadingSlots(true);
            const response = await getAvailableSlots(date);
            if (response.success) {
                setAvailableSlots(response.data.slots || []);
            }
        } catch (error) {
            console.error('Error loading available slots:', error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6">
            <SectionHeader />
            <DetailsGrid 
                formData={formData}
                handleInputChange={handleInputChange}
                availableSlots={availableSlots}
                loadingSlots={loadingSlots}
            />
        </div>
    );
}

// Section Header Component
function SectionHeader() {
    return (
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Do you need any of these?
        </h2>
    );
}

// Details Grid Component
function DetailsGrid({ formData, handleInputChange, availableSlots, loadingSlots }) {
    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 md:lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <DeliveryMethodSection 
                    formData={formData}
                    handleInputChange={handleInputChange}
                />
                <ScheduleDateSection 
                    formData={formData}
                    handleInputChange={handleInputChange}
                />
            </div>
            
            {formData.scheduleDate && (
                <AppointmentTimeSection 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    availableSlots={availableSlots}
                    loadingSlots={loadingSlots}
                />
            )}
            
            {/* Pickup Address - Only shown when pickup is selected */}
            {formData.deliveryMethod === 'pickup' && (
                <PickupAddressSection 
                    formData={formData}
                    handleInputChange={handleInputChange}
                />
            )}
            
            <AdditionalNotesSection 
                formData={formData}
                handleInputChange={handleInputChange}
            />
        </div>
    );
}

// Delivery Method Section
function DeliveryMethodSection({ formData, handleInputChange }) {
    return (
        <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Delivery Method
            </label>
            <div className="space-y-2">
                <DeliveryMethodOption
                    value="dropoff"
                    label="Drop-off"
                    checked={formData.deliveryMethod === 'dropoff'}
                    onChange={handleInputChange}
                />
                <DeliveryMethodOption
                    value="pickup"
                    label="Pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
}

// Delivery Method Option Component
function DeliveryMethodOption({ value, label, checked, onChange }) {
    return (
        <label className="flex items-center cursor-pointer">
            <input
                type="radio"
                name="deliveryMethod"
                value={value}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span className="ml-2 text-xs sm:text-sm text-gray-700">{label}</span>
        </label>
    );
}

// Additional Notes Section
function AdditionalNotesSection({ formData, handleInputChange }) {
    return (
        <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Additional Notes
            </label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Any additional information..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary resize-none"
            />
        </div>
    );
}

// Schedule Date Section
function ScheduleDateSection({ formData, handleInputChange }) {
    const today = new Date().toISOString().split('T')[0];

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Schedule Date
            </label>
            <input
                type="date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleInputChange}
                min={today}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors bg-white text-sm cursor-pointer"
                style={{
                    colorScheme: 'light'
                }}
            />
            <p className="text-xs text-gray-500 mt-1">
                Leave empty for immediate processing
            </p>
        </div>
    );
}

// Appointment Time Section
function AppointmentTimeSection({ formData, handleInputChange, availableSlots, loadingSlots }) {
    if (loadingSlots) {
        return (
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                </label>
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading available times...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Time
            </label>
            
            {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                        <TimeSlotOption
                            key={slot.time}
                            slot={slot}
                            selected={formData.appointmentTime === slot.time}
                            onChange={handleInputChange}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">
                    No available time slots for this date. Please choose another date.
                </p>
            )}
        </div>
    );
}

// Time Slot Option Component
function TimeSlotOption({ slot, selected, onChange }) {
    const handleClick = () => {
        if (slot.available) {
            onChange({
                target: {
                    name: 'appointmentTime',
                    value: selected ? '' : slot.time
                }
            });
        }
    };

    // Format time for display in 12-hour format with AM/PM
    const displayTime = formatTime(slot.time);

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={!slot.available}
            className={`
                px-3 py-2 text-sm rounded-lg border transition-all duration-200
                ${slot.available 
                    ? selected 
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }
            `}
            title={slot.available ? `Available (${slot.booked}/${slot.capacity})` : 'Fully booked'}
        >
            <div className="font-medium">{displayTime}</div>
            <div className="text-xs opacity-75">
                {slot.booked}/{slot.capacity}
            </div>
        </button>
    );
}

// Pickup Address Section
function PickupAddressSection({ formData, handleInputChange }) {
    return (
        <div className="space-y-2">
            <label htmlFor="pickupAddress" className="block text-xs sm:text-sm font-medium text-gray-700">
                Pickup Address <span className="text-red-500">*</span>
            </label>
            <textarea
                id="pickupAddress"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleInputChange}
                placeholder="Enter your complete address for pickup (e.g., House/Unit No., Street, Barangay, City, Province)"
                rows={3}
                className="w-full px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary resize-none"
                required
            />
            <p className="text-xs text-gray-500">
                Please provide your complete address where we will pick up the donation items.
            </p>
            
            {/* Display saved address below the textarea */}
            {formData.address && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <div className="flex items-start">
                        <HiLocationMarker className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-800 mb-1">Saved Address:</p>
                            <p className="text-sm text-green-700">{formData.address}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}