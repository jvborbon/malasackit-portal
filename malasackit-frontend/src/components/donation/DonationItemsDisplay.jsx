import { HiPlus, HiX, HiShoppingCart } from 'react-icons/hi';
import { useDonationCategories } from './useDonationCategories';

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
        <div className="bg-gray-50 rounded-lg p-6">
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
    );
}

// Header Component for Items Display
function DonationItemsHeader({ itemCount, setShowDonationModal }) {
    return (
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
                Your Donation Items ({itemCount})
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
    );
}

// Items List Component
function DonationItemsList({ donationItems, updateDonationItem, removeDonationItem, categories }) {
    return (
        <div className="space-y-3">
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
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
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
    );
}

// Item Input Fields Component
function ItemFields({ item, updateDonationItem }) {
    return (
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
    );
}

// Summary Component
function DonationSummary({ donationItems }) {
    const totalItems = donationItems.length;
    const totalQuantity = donationItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    const totalValue = donationItems.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    const totalCategories = new Set(donationItems.map(item => item.category)).size;

    return (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-3">
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div>
                    <div className="font-bold text-blue-900 text-lg">{totalItems}</div>
                    <div className="text-blue-700 text-xs">Total Items</div>
                </div>
                <div>
                    <div className="font-bold text-blue-900 text-lg">{totalQuantity}</div>
                    <div className="text-blue-700 text-xs">Total Quantity</div>
                </div>
                <div>
                    <div className="font-bold text-blue-900 text-lg">
                        ₱{totalValue.toLocaleString()}
                    </div>
                    <div className="text-blue-700 text-xs">Total Value</div>
                </div>
                <div>
                    <div className="font-bold text-blue-900 text-lg">{totalCategories}</div>
                    <div className="text-blue-700 text-xs">Categories</div>
                </div>
            </div>
        </div>
    );
}