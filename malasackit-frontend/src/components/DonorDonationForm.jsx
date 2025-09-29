import { useState } from 'react';
import { HiPlus, HiCalendar } from 'react-icons/hi';

export default function DonorDonationForm() {
    const [formData, setFormData] = useState({
        itemName: '',
        category: '',
        quantity: '',
        value: '',
        deliveryMethod: 'pickup', // 'pickup' or 'dropoff'
        description: '',
        scheduleDate: ''
    });

    const [donationItems, setDonationItems] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDeliveryMethodChange = (method) => {
        setFormData(prev => ({
            ...prev,
            deliveryMethod: method
        }));
    };

    const addDonationItem = () => {
        if (formData.itemName && formData.category && formData.quantity && formData.value) {
            const newItem = {
                id: Date.now(),
                itemName: formData.itemName,
                category: formData.category,
                quantity: formData.quantity,
                value: formData.value
            };
            
            setDonationItems(prev => [...prev, newItem]);
            
            // Reset item fields
            setFormData(prev => ({
                ...prev,
                itemName: '',
                category: '',
                quantity: '',
                value: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const donationData = {
            items: donationItems,
            deliveryMethod: formData.deliveryMethod,
            description: formData.description,
            scheduleDate: formData.scheduleDate,
            submittedAt: new Date().toISOString()
        };
        
        console.log('Donation submitted:', donationData);
        
        // Here you would typically send the data to your backend
        alert('Donation submitted successfully!');
        
        // Reset form
        setDonationItems([]);
        setFormData({
            itemName: '',
            category: '',
            quantity: '',
            value: '',
            deliveryMethod: 'pickup',
            description: '',
            scheduleDate: ''
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-red-600 mb-8">Donation Form</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Left Column - Item Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {/* Item Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    name="itemName"
                                    value={formData.itemName}
                                    onChange={handleInputChange}
                                    placeholder="Enter items"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors bg-gray-50"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    placeholder="Enter item type"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors bg-gray-50"
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    placeholder="Enter quantity"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors bg-gray-50"
                                />
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Value
                                </label>
                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    placeholder="Enter value"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors bg-gray-50"
                                />
                            </div>

                            {/* Add Button */}
                            <button
                                type="button"
                                onClick={addDonationItem}
                                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center font-medium"
                            >
                                <HiPlus className="w-5 h-5 mr-2" />
                                Add
                            </button>
                        </div>

                        {/* Right Column - Delivery & Schedule */}
                        <div className="space-y-6">
                            {/* Delivery Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    How would you like to reach us your donations?
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value="dropoff"
                                            checked={formData.deliveryMethod === 'dropoff'}
                                            onChange={() => handleDeliveryMethodChange('dropoff')}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                        />
                                        <span className="ml-3 text-gray-700">Drop-off</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value="pickup"
                                            checked={formData.deliveryMethod === 'pickup'}
                                            onChange={() => handleDeliveryMethodChange('pickup')}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                        />
                                        <span className="ml-3 text-gray-700">Pickup</span>
                                    </label>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter text"
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors resize-none bg-gray-50"
                                />
                            </div>

                            {/* Set Schedule */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Set Schedule
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="scheduleDate"
                                        value={formData.scheduleDate}
                                        onChange={handleInputChange}
                                        style={{
                                            colorScheme: 'dark'
                                        }}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors bg-white [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:bg-red-500 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Added Items Display */}
                    {donationItems.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Added Items</h3>
                            <div className="space-y-2">
                                {donationItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                                            <span><strong>Name:</strong> {item.itemName}</span>
                                            <span><strong>Category:</strong> {item.category}</span>
                                            <span><strong>Qty:</strong> {item.quantity}</span>
                                            <span><strong>Value:</strong> ₱{item.value}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setDonationItems(prev => prev.filter(i => i.id !== item.id))}
                                            className="text-red-600 hover:text-red-800 ml-4"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                   
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={donationItems.length === 0}
                            className="bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
    );
}