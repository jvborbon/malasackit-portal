import { useState } from 'react';
import { HiPlus, HiCalendar, HiX, HiTrash, HiShoppingCart } from 'react-icons/hi';

export default function DonorDonationForm() {
    const [formData, setFormData] = useState({
        deliveryMethod: 'pickup',
        description: '',
        scheduleDate: ''
    });

    const [donationItems, setDonationItems] = useState([]);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Food Items');
    const [selectedItems, setSelectedItems] = useState([]);

    // Categorized donation items based on DSWD guidelines
    const donationCategories = {
        'Food Items': {
            icon: '🍲',
            description: 'Canned goods, rice, noodles, etc.',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
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
                'Bread',
                'Pasta',
                'Cereals',
                'Other Food Items'
            ]
        },
        'Household Essentials/Personal Care': {
            icon: '🧴',
            description: 'Personal care, hygiene, household items',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
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
                'Hand Sanitizer',
                'Tissues',
                'Other Hygiene Items'
            ]
        },
        'Clothing': {
            icon: '👕',
            description: 'New or gently used clothes',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
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
                'Sleepwear',
                'Other Clothing'
            ]
        },
        'Shelter Materials': {
            icon: '🏠',
            description: 'Emergency shelter and construction materials',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
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
                'Sleeping Bags',
                'Mats',
                'Other Shelter Items'
            ]
        },
        'Educational Materials': {
            icon: '📚',
            description: 'School supplies and learning materials',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
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
                'Paper',
                'Calculators',
                'Other Educational Items'
            ]
        },
        'Kitchen Utensils': {
            icon: '🍴',
            description: 'Cooking and eating utensils',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            items: [
                'Plates',
                'Cups',
                'Spoons',
                'Forks',
                'Knives',
                'Cooking Pots',
                'Pans',
                'Water Containers',
                'Bowls',
                'Cutting Boards',
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

    const toggleItemSelection = (category, itemType) => {
        const itemKey = `${category}-${itemType}`;
        setSelectedItems(prev => {
            if (prev.some(item => item.key === itemKey)) {
                return prev.filter(item => item.key !== itemKey);
            } else {
                return [...prev, {
                    key: itemKey,
                    category,
                    itemType,
                    quantity: '',
                    value: '',
                    description: ''
                }];
            }
        });
    };

    const isItemSelected = (category, itemType) => {
        const itemKey = `${category}-${itemType}`;
        return selectedItems.some(item => item.key === itemKey);
    };

    const confirmSelectedItems = () => {
        // Add selected items to donation items with unique IDs and default values
        const newDonationItems = selectedItems.map(item => ({
            id: Date.now() + Math.random(),
            category: item.category,
            itemType: item.itemType,
            quantity: '',
            value: '',
            description: ''
        }));
        
        setDonationItems(prev => [...prev, ...newDonationItems]);
        setSelectedItems([]);
        setShowDonationModal(false);
        setActiveCategory('Food Items');
    };

    const updateDonationItem = (itemId, field, value) => {
        setDonationItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
        ));
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
        
        // Check if all items have required fields
        const incompleteItems = donationItems.filter(item => !item.quantity || !item.value);
        if (incompleteItems.length > 0) {
            alert('Please fill in quantity and value for all donation items.');
            return;
        }
        
        const donationData = {
            items: donationItems.map(item => ({
                ...item,
                quantity: parseInt(item.quantity),
                value: parseFloat(item.value)
            })),
            deliveryMethod: formData.deliveryMethod,
            description: formData.description,
            scheduleDate: formData.scheduleDate,
            submittedAt: new Date().toISOString()
        };
        
        console.log('Donation submitted:', donationData);
        alert('Donation submitted successfully!');
        
        // Reset form
        setDonationItems([]);
        setSelectedItems([]);
        setFormData({
            deliveryMethod: 'pickup',
            description: '',
            scheduleDate: ''
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">What are you donating?</h1>
                <p className="text-gray-600 text-sm">
                    Every donation is important to us. However, due to logistical considerations, we have limited the items we may receive. 
                    Beyond the items indicated, you may contact the SWDA or LGU directly. Thank you for your understanding.
                </p>
            </div>

            {/* Enhanced Donation Modal with Tab Navigation */}
            {showDonationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-red-600 text-white p-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Select Donation Items</h2>
                                <p className="text-red-100 text-sm">Choose items from different categories and add them to your donation</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDonationModal(false)}
                                className="text-white hover:text-red-200 transition-colors"
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row h-[70vh]">
                            {/* Category Tabs - Left Side */}
                            <div className="lg:w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                                    <div className="space-y-2">
                                        {Object.entries(donationCategories).map(([category, info]) => (
                                            <button
                                                key={category}
                                                type="button"
                                                onClick={() => setActiveCategory(category)}
                                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                                    activeCategory === category
                                                        ? `${info.bgColor} ${info.borderColor} border-2 ${info.color}`
                                                        : 'border-2 border-transparent hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <span className="text-2xl mr-3">{info.icon}</span>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{category}</div>
                                                        <div className="text-xs text-gray-500">{info.description}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Item Selection and Management - Right Side */}
                            <div className="lg:w-2/3 flex flex-col">
                                {/* Active Category Content */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="mb-4">
                                        <div className="flex items-center mb-2">
                                            <span className="text-2xl mr-2">{donationCategories[activeCategory]?.icon}</span>
                                            <h3 className="text-xl font-bold text-gray-900">{activeCategory}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">{donationCategories[activeCategory]?.description}</p>
                                    </div>

                                    {/* Item Type Selection Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                                        {donationCategories[activeCategory]?.items.map((item, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => toggleItemSelection(activeCategory, item)}
                                                className={`p-3 text-sm border rounded-lg transition-all duration-200 ${
                                                    isItemSelected(activeCategory, item)
                                                        ? 'border-red-500 bg-red-50 text-red-700'
                                                        : 'border-gray-200 hover:border-red-200 hover:bg-red-50'
                                                }`}
                                            >
                                                {isItemSelected(activeCategory, item) && (
                                                    <div className="flex justify-center mb-1">
                                                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-xs">✓</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {item}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Selected Items in Current Category */}
                                    {selectedItems.filter(item => item.category === activeCategory).length > 0 && (
                                        <div className="bg-red-50 rounded-lg p-4 mb-4">
                                            <h4 className="font-semibold text-red-800 mb-2">
                                                Selected from {activeCategory} ({selectedItems.filter(item => item.category === activeCategory).length})
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedItems
                                                    .filter(item => item.category === activeCategory)
                                                    .map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                                        >
                                                            {item.itemType}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleItemSelection(item.category, item.itemType)}
                                                                className="ml-1 text-red-600 hover:text-red-800"
                                                            >
                                                                <HiX className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            {selectedItems.length > 0 && (
                                                <span>
                                                    {selectedItems.length} items selected from {new Set(selectedItems.map(item => item.category)).size} categories
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowDonationModal(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={confirmSelectedItems}
                                                disabled={selectedItems.length === 0}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                            >
                                                <HiShoppingCart className="w-4 h-4 mr-1" />
                                                Add Items ({selectedItems.length})
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Add Items Section or Display Added Items */}
                {donationItems.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <HiShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Add Donation Items</h3>
                        <p className="text-gray-500 mb-4">Select items from different categories to build your donation</p>
                        <button
                            type="button"
                            onClick={() => setShowDonationModal(true)}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
                        >
                            <HiPlus className="w-5 h-5 mr-2" />
                            Add / Remove Items
                        </button>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Your Donation Items ({donationItems.length})
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowDonationModal(true)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
                            >
                                <HiPlus className="w-4 h-4 mr-1" />
                                Add / Remove Items
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {donationItems.map((item) => {
                                const categoryInfo = donationCategories[item.category];
                                
                                return (
                                    <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">{categoryInfo?.icon}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryInfo?.bgColor} ${categoryInfo?.color}`}>
                                                        {item.category}
                                                    </span>
                                                    <span className="font-medium text-gray-900 text-sm">{item.itemType}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDonationItem(item.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="Remove this item"
                                            >
                                                <HiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {/* Inline editing fields */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Quantity <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateDonationItem(item.id, 'quantity', e.target.value)}
                                                    placeholder="Not set"
                                                    min="1"
                                                    className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-red-400 focus:border-red-400 ${
                                                        !item.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Value (₱) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.value}
                                                    onChange={(e) => updateDonationItem(item.id, 'value', e.target.value)}
                                                    placeholder="Not set"
                                                    step="0.01"
                                                    min="0"
                                                    className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-red-400 focus:border-red-400 ${
                                                        !item.value ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Description
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => updateDonationItem(item.id, 'description', e.target.value)}
                                                    placeholder="None"
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-400 focus:border-red-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Summary */}
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-3">
                            <div className="grid grid-cols-4 gap-4 text-center text-sm">
                                <div>
                                    <div className="font-bold text-blue-900 text-lg">{donationItems.length}</div>
                                    <div className="text-blue-700 text-xs">Total Items</div>
                                </div>
                                <div>
                                    <div className="font-bold text-blue-900 text-lg">
                                        {donationItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}
                                    </div>
                                    <div className="text-blue-700 text-xs">Total Quantity</div>
                                </div>
                                <div>
                                    <div className="font-bold text-blue-900 text-lg">
                                        ₱{donationItems.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0).toLocaleString()}
                                    </div>
                                    <div className="text-blue-700 text-xs">Total Value</div>
                                </div>
                                <div>
                                    <div className="font-bold text-blue-900 text-lg">{new Set(donationItems.map(item => item.category)).size}</div>
                                    <div className="text-blue-700 text-xs">Categories</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Prohibited Donations Section */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                        🚫 Prohibited Donations
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                        LASAC reserves the right not to accept a proposed gift for reasons 
                        <strong> including, but not limited,</strong> to the following:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-red-700">
                        <ul className="space-y-1">
                            <li>• Food items expiring in less than 6 months (local donations)</li>
                               <li>• Food items expiring in less than 1 year (foreign donations)</li>
                            <li>• Food items that did not pass quality standards</li>
                            <li>• Formula milk not pursuant to Milk Code of the Philippines</li>
                        </ul>
                        <ul className="space-y-1">
                            <li>• The gift, or gift transaction, involves an illegality.</li>
                            <li>• The gift, or gift transaction, in some manner conflicts with 
                            LASAC policies and/or is incompatible with the Social 
                            Teachings of the Roman Catholic Church or LASAC Vision, 
                            Mission, and Values. </li>
                            <li>• The benefit from the gift is insufficient to offset the extent of 
                            administrative and/or legal effort involved in its acceptance. </li>
                            <li>• The gift or transaction inhibits LASAC from seeking gifts from 
                            other donors. </li>
                            <li>• The benefit of the gift is outweighed by the potential of negative 
                            publicity for LASAC that will result from the transaction.</li>
                        </ul>
                    </div>
                </div>

                {/* Donation Details Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Do you need any of these?</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Pickup</span>
                                </label>
                            </div>
                        </div>

                        {/* Additional Notes */}
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

                        {/* Schedule Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Schedule
                            </label>
                            <input
                                type="date"
                                name="scheduleDate"
                                value={formData.scheduleDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
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
                        className="bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <HiCalendar className="w-5 h-5 mr-2" />
                        Confirm Donation
                    </button>
                </div>
            </form>
        </div>
    );
}