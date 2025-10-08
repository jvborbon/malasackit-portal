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
                quantity: parseInt(formData.quantity),
                value: parseFloat(formData.value)
            };
            
            setDonationItems(prev => [...prev, newItem]);
            
            // Reset only item fields, keep delivery method, description, and schedule
            setFormData(prev => ({
                ...prev,
                itemName: '',
                category: '',
                quantity: '',
                value: ''
            }));
        } else {
            alert('Please fill in all item details before adding.');
        }
    };

    const removeDonationItem = (itemId) => {
        setDonationItems(prev => prev.filter(item => item.id !== itemId));
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
        
        // would send the data to your backend
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
                {/* Main Layout Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Left Side - Add Donation Item */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Donation Item</h2>
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
                    </div>

                    {/* Right Side - Added Items Display */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Added Donation Items ({donationItems.length})
                        </h3>
                        {donationItems.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">No items added yet</p>
                                <p className="text-sm text-gray-400 mt-1">Add donation items to see them here</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {donationItems.map((item, index) => (
                                        <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                                        <div>
                                                            <span className="font-medium text-gray-700">Item:</span>
                                                            <span className="ml-2 text-gray-900">{item.itemName}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-700">Category:</span>
                                                            <span className="ml-2 text-gray-900">{item.category}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <span className="font-medium text-gray-700">Qty:</span>
                                                                <span className="ml-2 text-gray-900">{item.quantity}</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-700">Value:</span>
                                                                <span className="ml-2 text-gray-900">₱{item.value.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDonationItem(item.id)}
                                                    className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    title="Remove this item"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <strong>Total Items:</strong> {donationItems.length} | 
                                        <strong className="ml-2">Total Value:</strong> ₱{donationItems.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Donation Details Section */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Donation Details</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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