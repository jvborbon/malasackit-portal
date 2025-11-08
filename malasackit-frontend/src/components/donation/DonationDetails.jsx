export function DonationDetails({ formData, handleInputChange }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <SectionHeader />
            <DetailsGrid 
                formData={formData}
                handleInputChange={handleInputChange}
            />
        </div>
    );
}

// Section Header Component
function SectionHeader() {
    return (
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Do you need any of these?
        </h2>
    );
}

// Details Grid Component
function DetailsGrid({ formData, handleInputChange }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DeliveryMethodSection 
                formData={formData}
                handleInputChange={handleInputChange}
            />
            <AdditionalNotesSection 
                formData={formData}
                handleInputChange={handleInputChange}
            />
            <ScheduleDateSection 
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="flex items-center">
            <input
                type="radio"
                name="deliveryMethod"
                value={value}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
        </label>
    );
}

// Additional Notes Section
function AdditionalNotesSection({ formData, handleInputChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
            </label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Any additional information..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors resize-none bg-gray-50 text-sm"
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
                Preferred Schedule
            </label>
            <input
                type="date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleInputChange}
                min={today}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors bg-gray-50 text-sm"
            />
        </div>
    );
}