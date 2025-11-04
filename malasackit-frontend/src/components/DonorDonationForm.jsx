import { useState } from 'react';
import { HiPlus, HiCalendar, HiChevronDown, HiX } from 'react-icons/hi';

export default function DonorDonationForm() {
    const [formData, setFormData] = useState({
        selectedCategory: '',
        selectedItemType: '',
        customItemName: '',
        brandName: '',
        quantity: '',
        weight: '',
        value: '',
        deliveryMethod: 'pickup',
        description: '',
        scheduleDate: ''
    });

    const [donationItems, setDonationItems] = useState([]);
    const [showItemTypeModal, setShowItemTypeModal] = useState(false);

    // Categorized donation items based on DSWD guidelines
    const donationCategories = {
        'Food Items': {
            icon: '🍲',
            description: 'Canned goods, rice, noodles, etc.',
            items: [
                'Canned Goods',
                'Rice',
                'Noodles',
                'Cooking Oil',
                'Sugar',
                'Salt',
                'Coffee',
                'Milk Powder',
                'Biscuits',
                'Dried Fish',
                'Other Food Items'
            ]
        },
        'Non-Food Items': {
            icon: '🧴',
            description: 'Personal care, hygiene, household items',
            items: [
                'Soap',
                'Shampoo',
                'Toothpaste',
                'Toothbrush',
                'Toilet Paper',
                'Detergent',
                'Sanitary Pads',
                'Diapers',
                'Face Masks',
                'Alcohol',
                'Other Hygiene Items'
            ]
        },
        'Clothing': {
            icon: '👕',
            description: 'New or gently used clothes',
            items: [
                'T-Shirts',
                'Pants',
                'Dresses',
                'Shorts',
                'Underwear (New Only)',
                'Socks',
                'Shoes',
                'Jackets',
                'School Uniforms',
                'Baby Clothes',
                'Other Clothing'
            ]
        },
        'Shelter Materials': {
            icon: '🏠',
            description: 'Emergency shelter and construction materials',
            items: [
                'Blankets',
                'Tents',
                'Tarpaulins',
                'Pillows',
                'Bed Sheets',
                'Mosquito Nets',
                'Jerry Cans',
                'Plastic Containers',
                'Emergency Kits',
                'Other Shelter Items'
            ]
        },
        'Educational Materials': {
            icon: '📚',
            description: 'School supplies and learning materials',
            items: [
                'Notebooks',
                'Pens',
                'Pencils',
                'Erasers',
                'Rulers',
                'Crayons',
                'Books',
                'Backpacks',
                'School Supplies',
                'Other Educational Items'
            ]
        },
        'Kitchen Utensils': {
            icon: '🍴',
            description: 'Cooking and eating utensils',
            items: [
                'Plates',
                'Cups',
                'Spoons',
                'Forks',
                'Knives',
                'Cooking Pots',
                'Pans',
                'Water Containers',
                'Other Kitchen Items'
            ]
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCategorySelect = (category) => {
        setFormData(prev => ({
            ...prev,
            selectedCategory: category,
            selectedItemType: ''
        }));
    };

    const handleItemTypeSelect = (itemType) => {
        setFormData(prev => ({
            ...prev,
            selectedItemType: itemType,
            customItemName: itemType === 'Other' ? '' : itemType
        }));
        setShowItemTypeModal(false);
    };

    const addDonationItem = () => {
        const itemName = formData.selectedItemType === 'Other' ? formData.customItemName : formData.selectedItemType;
        
        if (formData.selectedCategory && itemName && formData.quantity && formData.value) {
            const newItem = {
                id: Date.now(),
                category: formData.selectedCategory,
                itemType: itemName,
                brandName: formData.brandName,
                quantity: parseInt(formData.quantity),
                weight: formData.weight ? parseFloat(formData.weight) : null,
                value: parseFloat(formData.value)
            };
            
            setDonationItems(prev => [...prev, newItem]);
            
            // Reset only item fields
            setFormData(prev => ({
                ...prev,
                selectedItemType: '',
                customItemName: '',
                brandName: '',
                quantity: '',
                weight: '',
                value: ''
            }));
        } else {
            alert('Please fill in all required fields before adding.');
        }
    };

    const removeDonationItem = (itemId) => {
        setDonationItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (donationItems.length === 0) {
            alert('Please add at least one donation item.');
            return;
        }
        
        const donationData = {
            items: donationItems,
            deliveryMethod: formData.deliveryMethod,
            description: formData.description,
            scheduleDate: formData.scheduleDate,
            submittedAt: new Date().toISOString()
        };
        
        console.log('Donation submitted:', donationData);
        alert('Donation submitted successfully!');
        
        // Reset form
        setDonationItems([]);
        setFormData({
            selectedCategory: '',
            selectedItemType: '',
            customItemName: '',
            brandName: '',
            quantity: '',
            weight: '',
            value: '',
            deliveryMethod: 'pickup',
            description: '',
            scheduleDate: ''
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-6">Donation Form</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Layout - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Side - Add Donation Item */}
                    <div className="lg:col-span-1 bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6 h-fit">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Add Item</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Item Type
                                </label>
                                <input
                                    type="text"
                                    name="itemName"
                                    value={formData.itemName}
                                    onChange={handleInputChange}
                                    placeholder="Enter item type"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors bg-gray-50"
                                />
                            </div>

                            {/* Brand Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    name="brandName"
                                    value={formData.brandName}
                                    onChange={handleInputChange}
                                    placeholder="Enter brand/item name"
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
                                    placeholder="Enter item category"
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
                                    Value (₱)
                                </label>
                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    placeholder="Enter value"
                                    step="0.01"
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
                    <div className="lg:col-span-2 bg-gray-50 border-2 border-gray-200 rounded-lg p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Added Donation Items ({donationItems.length})
                        </h3>
                        {donationItems.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-3">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm">No items added yet</p>
                                <p className="text-xs text-gray-400 mt-1">Add donation items to see them here</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 max-h-64 lg:max-h-80 overflow-y-auto pr-2">
                                    {donationItems.map((item, index) => (
                                        <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                                        <div className="flex flex-wrap gap-4">
                                                            <div>
                                                                <span className="font-medium text-gray-700">Type:</span>
                                                                <span className="ml-1 text-gray-900">{item.itemName}</span>
                                                            </div>
                                                            {item.brandName && (
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Name:</span>
                                                                    <span className="ml-1 text-gray-900">{item.brandName}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-4">
                                                            <div>
                                                                <span className="font-medium text-gray-700">Category:</span>
                                                                <span className="ml-1 text-gray-900">{item.category}</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-700">Qty:</span>
                                                                <span className="ml-1 text-gray-900">{item.quantity}</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-700">Value:</span>
                                                                <span className="ml-1 text-gray-900">₱{item.value.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDonationItem(item.id)}
                                                    className="ml-3 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
                                                    title="Remove this item"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex flex-wrap gap-4 text-sm text-blue-800">
                                        <div>
                                            <strong>Total Items:</strong> {donationItems.length}
                                        </div>
                                        <div>
                                            <strong>Total Value:</strong> ₱{donationItems.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Donation Details Section */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Donation Details</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Delivery Method */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delivery Method
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="deliveryMethod"
                                        value="dropoff"
                                        checked={formData.deliveryMethod === 'dropoff'}
                                        onChange={() => handleDeliveryMethodChange('dropoff')}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Drop-off</span>
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
                                    <span className="ml-2 text-sm text-gray-700">Pickup</span>
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
                                placeholder="Enter description"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors resize-none bg-gray-50 text-sm"
                            />
                        </div>

                        {/* Set Schedule */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Schedule Date
                            </label>
                            <input
                                type="date"
                                name="scheduleDate"
                                value={formData.scheduleDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-colors bg-gray-50 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={donationItems.length === 0}
                        className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Donation
                    </button>
                </div>
            </form>
        </div>
    );
}