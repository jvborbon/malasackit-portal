import { HiX, HiShoppingCart, HiExclamationCircle, HiRefresh } from 'react-icons/hi';
import { useDonationCategories } from '../useDonationCategories';

export function DonationModal({ 
    isOpen, 
    onClose, 
    activeCategory,
    setActiveCategory,
    selectedItems,
    setSelectedItems,
    onConfirm
}) {
    const { categories, isLoading, error, usingFallback, refreshCategories } = useDonationCategories();

    if (!isOpen) return null;

    const toggleItemSelection = (category, itemData) => {
        const itemType = typeof itemData === 'string' ? itemData : itemData.itemtype_name;
        const itemTypeId = typeof itemData === 'object' ? itemData.itemtype_id : null;
        const itemKey = `${category}-${itemType}`;
        
        setSelectedItems(prev => {
            if (prev.some(item => item.key === itemKey)) {
                return prev.filter(item => item.key !== itemKey);
            } else {
                return [...prev, {
                    key: itemKey,
                    category,
                    itemType,
                    itemTypeId,
                    itemData: typeof itemData === 'object' ? itemData : null,
                    quantity: '',
                    value: '',
                    description: ''
                }];
            }
        });
    };

    const isItemSelected = (category, itemTypeOrName) => {
        const itemType = typeof itemTypeOrName === 'string' ? itemTypeOrName : itemTypeOrName.itemtype_name;
        const itemKey = `${category}-${itemType}`;
        return selectedItems.some(item => item.key === itemKey);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="bg-red-900 text-white p-3 sm:p-4 flex justify-between items-start sm:items-center flex-shrink-0">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold truncate">Select Donation Items</h2>
                        <p className="text-red-100 text-xs sm:text-sm mt-0.5 sm:mt-0">Choose items from different categories and add them to your donation</p>
                        {usingFallback && (
                            <div className="flex items-center mt-1 text-yellow-200 text-xs">
                                <HiExclamationCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                                Using offline categories - Database connection failed
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 ml-2">
                        {error && (
                            <button
                                type="button"
                                onClick={refreshCategories}
                                className="text-white hover:text-red-200 transition-colors p-1"
                                title="Retry loading categories"
                            >
                                <HiRefresh className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white hover:text-red-200 transition-colors p-1"
                        >
                            <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center w-full h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading donation categories...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Category Tabs - Left Side */}
                            <CategoryTabs 
                                categories={categories}
                                activeCategory={activeCategory}
                                setActiveCategory={setActiveCategory}
                            />

                            {/* Item Selection - Right Side */}
                            <ItemSelection
                                activeCategory={activeCategory}
                                categories={categories}
                                selectedItems={selectedItems}
                                toggleItemSelection={toggleItemSelection}
                                isItemSelected={isItemSelected}
                            />
                        </>
                    )}
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
        <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Categories</h3>
                {/* Horizontal scroll on mobile, vertical on desktop */}
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-3 px-3 lg:mx-0 lg:px-0 scrollbar-hide">
                    {Object.entries(categories).map(([category, info]) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setActiveCategory(category)}
                            className={`flex-shrink-0 lg:flex-shrink lg:w-full text-left p-2 sm:p-2.5 lg:p-3 rounded-lg transition-all duration-200 ${
                                activeCategory === category
                                    ? `${info.bgColor} ${info.borderColor} border-2 ${info.color}`
                                    : 'border-2 border-transparent hover:bg-gray-100'
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row items-center lg:items-center">
                                <span className="text-xl sm:text-2xl mb-1 lg:mb-0 lg:mr-3">{info.icon}</span>
                                <div className="text-center lg:text-left">
                                    <div className="font-medium text-gray-900 text-xs sm:text-sm whitespace-nowrap">{category}</div>
                                    <div className="text-xs text-gray-500 hidden lg:block">{info.description}</div>
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
        <div className="lg:w-2/3 flex flex-col min-h-0 flex-1">
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <div className="mb-3 sm:mb-4">
                    <div className="flex items-center mb-1.5 sm:mb-2">
                        <span className="text-xl sm:text-2xl mr-1.5 sm:mr-2">{categoryInfo?.icon}</span>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{activeCategory}</h3>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm">{categoryInfo?.description}</p>
                </div>

                {/* Expiration Reminder */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4 flex items-start">
                    <HiExclamationCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5 mr-2" />
                    <p className="text-amber-800 text-xs sm:text-sm">
                        <span className="font-semibold">Important:</span> Some items in this category are prone to expiration. 
                        Please ensure all donated items are in good condition and suitable for immediate use.
                    </p>
                </div>

                {/* Item Type Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3 mb-4 sm:mb-6">
                    {categoryInfo?.items.map((item, index) => {
                        const itemName = typeof item === 'string' ? item : item.itemtype_name;
                        const itemPrice = typeof item === 'object' ? item.avg_retail_price : null;
                        
                        // Check if this is a fixed condition item
                        const isFixedCondition = typeof item === 'object' && item.has_fixed_condition;
                        const conditionLabel = isFixedCondition ? 
                            item.fixed_condition.charAt(0).toUpperCase() + item.fixed_condition.slice(1) : 
                            null;
                        
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => toggleItemSelection(activeCategory, item)}
                                className={`p-2 sm:p-2.5 lg:p-3 text-xs sm:text-sm border rounded-lg transition-all duration-200 relative min-h-[70px] sm:min-h-[80px] flex flex-col justify-center ${
                                    isItemSelected(activeCategory, itemName)
                                        ? 'border-red-900 bg-red-50 text-red-900'
                                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                                }`}
                            >
                                {isItemSelected(activeCategory, itemName) && (
                                    <div className="flex justify-center mb-1">
                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-900 rounded-full flex items-center justify-center">
                                            <span className="text-white text-[10px] sm:text-xs">✓</span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="font-medium leading-tight">{itemName}</div>
                                {itemPrice && (
                                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                        Base: ₱{itemPrice.toLocaleString()}
                                    </div>
                                )}
                            </button>
                        );
                    })}
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
        <div className="bg-red-50 rounded-lg p-2.5 sm:p-3 lg:p-4 mb-3 sm:mb-4">
            <h4 className="font-semibold text-red-900 mb-1.5 sm:mb-2 text-xs sm:text-sm">
                Selected from {activeCategory} ({categorySelectedItems.length})
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {categorySelectedItems.map((item, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-red-100 text-red-900 text-[10px] sm:text-xs rounded-full"
                    >
                        <span className="truncate max-w-[120px] sm:max-w-none">{item.itemType}</span>
                        <button
                            type="button"
                            onClick={() => toggleItemSelection(item.category, item.itemType)}
                            className="ml-1 text-red-900 hover:text-red-950 flex-shrink-0"
                        >
                            <HiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
        <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    {selectedItems.length > 0 && (
                        <span>
                            {selectedItems.length} items selected from {uniqueCategories} {uniqueCategories === 1 ? 'category' : 'categories'}
                        </span>
                    )}
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={selectedItems.length === 0}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-900 text-white rounded-md hover:bg-red-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm font-medium"
                    >
                        <HiShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        Add Items ({selectedItems.length})
                    </button>
                </div>
            </div>
        </div>
    );
}