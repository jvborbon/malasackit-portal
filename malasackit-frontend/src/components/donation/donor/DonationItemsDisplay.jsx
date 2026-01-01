import { HiPlus, HiX, HiShoppingCart } from 'react-icons/hi';
import { useDonationCategories } from '../useDonationCategories';

export function DonationItemsDisplay({
    donationItems,
    setShowDonationModal,
    updateDonationItem,
    removeDonationItem
}) {
    const { categories } = useDonationCategories();
    if (donationItems.length === 0) {
        return <EmptyItemsState setShowDonationModal={setShowDonationModal} />;
    }

    return (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6">
            <DonationItemsHeader 
                itemCount={donationItems.length}
                setShowDonationModal={setShowDonationModal}
            />
            
            <DonationItemsList
                donationItems={donationItems}
                updateDonationItem={updateDonationItem}
                removeDonationItem={removeDonationItem}
                categories={categories}
            />
            
            <DonationSummary donationItems={donationItems} />
        </div>
    );
}

// Empty State Component
function EmptyItemsState({ setShowDonationModal }) {
    return (
        <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <HiShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1.5 sm:mb-2">Add Donation Items</h3>
            <p className="text-gray-500 mb-3 sm:mb-4 text-xs sm:text-sm px-4">Select items from different categories to build your donation</p>
            <button
                type="button"
                onClick={() => setShowDonationModal(true)}
                className="bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto text-sm sm:text-base"
            >
                <HiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Add / Remove Items
            </button>
        </div>
    );
}

// Header Component for Items Display
function DonationItemsHeader({ itemCount, setShowDonationModal }) {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Your Donation Items ({itemCount})
            </h3>
            <button
                type="button"
                onClick={() => setShowDonationModal(true)}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-xs sm:text-sm"
            >
                <HiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                Add / Remove Items
            </button>
        </div>
    );
}

// Items List Component
function DonationItemsList({ donationItems, updateDonationItem, removeDonationItem, categories }) {
    return (
        <div className="space-y-2 sm:space-y-3">
            {donationItems.map((item) => (
                <DonationItemCard
                    key={item.id}
                    item={item}
                    updateDonationItem={updateDonationItem}
                    removeDonationItem={removeDonationItem}
                    categories={categories}
                />
            ))}
        </div>
    );
}

// Individual Item Card Component
function DonationItemCard({ item, updateDonationItem, removeDonationItem, categories }) {
    const categoryInfo = categories[item.category] || {
        icon: '📦',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
    };

    return (
        <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-sm">
            <ItemHeader 
                item={item}
                categoryInfo={categoryInfo}
                removeDonationItem={removeDonationItem}
            />
            
            <ItemFields
                item={item}
                updateDonationItem={updateDonationItem}
            />
        </div>
    );
}

// Item Header with Category and Remove Button
function ItemHeader({ item, categoryInfo, removeDonationItem }) {
    return (
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <div className="flex items-center min-w-0 flex-1">
                <span className="text-base sm:text-lg mr-1.5 sm:mr-2 flex-shrink-0">{categoryInfo?.icon}</span>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 min-w-0">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${categoryInfo?.bgColor} ${categoryInfo?.color} whitespace-nowrap`}>
                        {item.category}
                    </span>
                    <span className="font-medium text-gray-900 text-xs sm:text-sm truncate mt-0.5 sm:mt-0">{item.itemType}</span>
                </div>
            </div>
            <button
                type="button"
                onClick={() => removeDonationItem(item.id)}
                className="text-red-600 hover:text-red-800 p-1 flex-shrink-0 ml-2"
                title="Remove this item"
            >
                <HiX className="w-4 h-4" />
            </button>
        </div>
    );
}

// Helper function to get available conditions for an item
function getAvailableConditions(item) {
    if (!item.itemData) {
        // Fallback if no item data available
        return [
            { value: 'new', label: 'New' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' },
            { value: 'poor', label: 'Poor' }
        ];
    }
    
    // Check if item has fixed condition from backend
    if (item.itemData.has_fixed_condition && item.itemData.fixed_condition) {
        return [{ 
            value: item.itemData.fixed_condition, 
            label: item.itemData.fixed_condition.charAt(0).toUpperCase() + item.itemData.fixed_condition.slice(1)
        }];
    }
    
    // Return all conditions for variable condition items
    return [
        { value: 'new', label: 'New' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'poor', label: 'Poor' }
    ];
}

// Item Input Fields Component
function ItemFields({ item, updateDonationItem }) {
    const handleConditionChange = async (newCondition) => {
        updateDonationItem(item.id, 'condition', newCondition);
        
        // Auto-calculate FMV based on condition if itemData is available
        if (item.itemData && item.itemData.avg_retail_price) {
            try {
                // Calculate FMV based on condition using the stored item data
                let conditionFactor = 0.75; // default for 'good'
                switch (newCondition) {
                    case 'new': conditionFactor = item.itemData.condition_factor_new || 1.00; break;
                    case 'good': conditionFactor = item.itemData.condition_factor_good || 0.75; break;
                    case 'fair': conditionFactor = item.itemData.condition_factor_fair || 0.50; break;
                    case 'poor': conditionFactor = item.itemData.condition_factor_poor || 0.25; break;
                }
                
                const calculatedValue = (item.itemData.avg_retail_price * conditionFactor).toFixed(2);
                updateDonationItem(item.id, 'value', calculatedValue);
            } catch (error) {
                console.error('Error calculating FMV:', error);
            }
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
                    className="w-full px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 bg-white text-gray-900 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Condition <span className="text-red-500">*</span>
                </label>
                {item.itemData?.has_fixed_condition ? (
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={item.itemData.fixed_condition.charAt(0).toUpperCase() + item.itemData.fixed_condition.slice(1)}
                            disabled
                            className="w-full px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded bg-gray-100 text-gray-700"
                        />
                        <span className="ml-2 text-xs text-blue-600 flex-shrink-0" title={item.itemData?.condition_definition || "This item type only accepts this condition for safety/hygiene reasons"}>
                            🔒
                        </span>
                    </div>
                ) : (
                    <select
                        value={item.condition || 'good'}
                        onChange={(e) => handleConditionChange(e.target.value)}
                        className="w-full px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 bg-white text-gray-900 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {getAvailableConditions(item).map(condition => (
                            <option key={condition.value} value={condition.value}>
                                {condition.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Value (₱) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="number"
                        value={item.value}
                        onChange={(e) => updateDonationItem(item.id, 'value', e.target.value)}
                        placeholder="Auto-calculated"
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 bg-white text-gray-900 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {item.value && item.quantity && (
                        <div className="text-xs text-green-600 mt-1">
                            Total: ₱{(parseFloat(item.value) * parseInt(item.quantity) || 0).toFixed(2)}
                        </div>
                    )}
                </div>
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
                    className="w-full px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 bg-white text-gray-900 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
}

// Summary Component
function DonationSummary({ donationItems }) {
    const totalItems = donationItems.length;
    const totalQuantity = donationItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    const totalValue = donationItems.reduce((sum, item) => {
        const itemValue = parseFloat(item.value) || 0;
        const itemQuantity = parseInt(item.quantity) || 0;
        return sum + (itemValue * itemQuantity);
    }, 0);
    const totalCategories = new Set(donationItems.map(item => item.category)).size;
    
    // Count items by condition
    const conditionCounts = donationItems.reduce((acc, item) => {
        const condition = item.condition || 'good';
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3 border border-blue-200 mt-2.5 sm:mt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-xs sm:text-sm mb-2.5 sm:mb-3">
                <div>
                    <div className="font-bold text-blue-900 text-base sm:text-lg">{totalItems}</div>
                    <div className="text-blue-700 text-xs">Total Items</div>
                </div>
                <div>
                    <div className="font-bold text-blue-900 text-base sm:text-lg">{totalQuantity}</div>
                    <div className="text-blue-700 text-xs">Total Quantity</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <div className="font-bold text-blue-900 text-base sm:text-lg">
                        ₱{totalValue.toLocaleString()}
                    </div>
                    <div className="text-blue-700 text-xs">Total Value</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <div className="font-bold text-blue-900 text-base sm:text-lg">{totalCategories}</div>
                    <div className="text-blue-700 text-xs">Categories</div>
                </div>
            </div>
            
            {/* Condition breakdown */}
            {Object.keys(conditionCounts).length > 0 && (
                <div className="border-t border-blue-200 pt-2">
                    <div className="text-xs text-blue-700 mb-1">Condition Breakdown:</div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(conditionCounts).map(([condition, count]) => (
                            <span 
                                key={condition}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                                {condition.charAt(0).toUpperCase() + condition.slice(1)}: {count}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}