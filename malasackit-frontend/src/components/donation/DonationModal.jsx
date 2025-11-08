import { HiX, HiShoppingCart } from 'react-icons/hi';
import { donationCategories } from './donationCategories';

export function DonationModal({ 
    isOpen, 
    onClose, 
    activeCategory,
    setActiveCategory,
    selectedItems,
    setSelectedItems,
    onConfirm
}) {
    if (!isOpen) return null;

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

    return (
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
                        onClick={onClose}
                        className="text-white hover:text-red-200 transition-colors"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row h-[70vh]">
                    {/* Category Tabs - Left Side */}
                    <CategoryTabs 
                        categories={donationCategories}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />

                    {/* Item Selection - Right Side */}
                    <ItemSelection
                        activeCategory={activeCategory}
                        categories={donationCategories}
                        selectedItems={selectedItems}
                        toggleItemSelection={toggleItemSelection}
                        isItemSelected={isItemSelected}
                    />
                </div>

                {/* Modal Footer */}
                <ModalFooter
                    selectedItems={selectedItems}
                    onClose={onClose}
                    onConfirm={onConfirm}
                />
            </div>
        </div>
    );
}

// Category Tabs Component
function CategoryTabs({ categories, activeCategory, setActiveCategory }) {
    return (
        <div className="lg:w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                    {Object.entries(categories).map(([category, info]) => (
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
    );
}

// Item Selection Component
function ItemSelection({ activeCategory, categories, selectedItems, toggleItemSelection, isItemSelected }) {
    const categoryInfo = categories[activeCategory];

    return (
        <div className="lg:w-2/3 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4">
                    <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{categoryInfo?.icon}</span>
                        <h3 className="text-xl font-bold text-gray-900">{activeCategory}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{categoryInfo?.description}</p>
                </div>

                {/* Item Type Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {categoryInfo?.items.map((item, index) => (
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
                <SelectedItemsPreview 
                    selectedItems={selectedItems}
                    activeCategory={activeCategory}
                    toggleItemSelection={toggleItemSelection}
                />
            </div>
        </div>
    );
}

// Selected Items Preview Component
function SelectedItemsPreview({ selectedItems, activeCategory, toggleItemSelection }) {
    const categorySelectedItems = selectedItems.filter(item => item.category === activeCategory);

    if (categorySelectedItems.length === 0) return null;

    return (
        <div className="bg-red-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-red-800 mb-2">
                Selected from {activeCategory} ({categorySelectedItems.length})
            </h4>
            <div className="flex flex-wrap gap-2">
                {categorySelectedItems.map((item, index) => (
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
    );
}

// Modal Footer Component
function ModalFooter({ selectedItems, onClose, onConfirm }) {
    const uniqueCategories = new Set(selectedItems.map(item => item.category)).size;

    return (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    {selectedItems.length > 0 && (
                        <span>
                            {selectedItems.length} items selected from {uniqueCategories} categories
                        </span>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={selectedItems.length === 0}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <HiShoppingCart className="w-4 h-4 mr-1" />
                        Add Items ({selectedItems.length})
                    </button>
                </div>
            </div>
        </div>
    );
}