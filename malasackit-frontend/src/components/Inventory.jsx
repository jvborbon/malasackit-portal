import React, { useState, useEffect } from "react";
import { 
  HiSearch, 
  HiFilter, 
  HiPlus, 
  HiTruck,
  HiExclamation,
  HiCheckCircle,
  HiRefresh
} from "react-icons/hi";
import DistributeDonationForm from "./DistributeDonationForm";
import { 
  getInventory, 
  getInventoryStats, 
  updateInventoryItem, 
  getLowStockItems,
  getCategories 
} from "../services/inventoryService";
import { formatCurrency } from "./utilities/donationHelpers";

function Inventory() {
  const [search, setSearch] = useState("");
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Data states
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProducts: 0,
    topDonatedItem: 'N/A',
    stocksByCategory: [],
    totalValue: 0
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  // Load data functions
  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
        page: currentPage,
        limit: itemsPerPage
      };
      
      const [inventoryResponse, statsResponse] = await Promise.all([
        getInventory(params),
        getInventoryStats()
      ]);
      
      setInventory(inventoryResponse.data.inventory || []);
      setTotalPages(inventoryResponse.data.pagination.pages || 1);
      setTotalItems(inventoryResponse.data.pagination.total || 0);
      setStats(statsResponse.data || stats);
      
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };
  
  // Effects
  useEffect(() => {
    loadCategories();
  }, []);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      loadInventoryData();
    }, 500); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, selectedStatus]);
  
  useEffect(() => {
    loadInventoryData();
  }, [currentPage]);
  
  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'No Stock':
        return 'bg-red-100 text-red-800';
      case 'Reserved':
        return 'bg-blue-100 text-blue-800';
      case 'Bazaar':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return <HiCheckCircle className="w-4 h-4" />;
      case 'Low Stock':
      case 'No Stock':
        return <HiExclamation className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  const handleRefresh = () => {
    loadInventoryData();
  };
  
  const handleItemSelect = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(selected => selected.inventory_id === item.inventory_id);
      if (isSelected) {
        return prev.filter(selected => selected.inventory_id !== item.inventory_id);
      } else {
        return [...prev, item];
      }
    });
  };

  return (
    <div className="space-y-2">
      {/* Search Bar with Action Icons */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search inventory items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-md ${showFilters ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <HiFilter className="w-5 h-5" />
          </button>
          <button 
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.itemcategory_id} value={category.itemcategory_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Low Stock">Low Stock</option>
                <option value="No Stock">No Stock</option>
                <option value="Reserved">Reserved</option>
                <option value="Bazaar">Bazaar</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedStatus("");
                  setSearch("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-2">
          <div className="flex flex-col">
            <dt className="text-sm font-medium text-blue-600 mb-1">Categories</dt>
            <dd className="text-base font-bold text-gray-900">{stats.totalCategories}</dd>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-2">
          <div className="flex flex-col">
            <dt className="text-sm font-medium text-orange-600 mb-1">Total Products</dt>
            <dd className="text-base font-bold text-gray-900">{stats.totalProducts}</dd>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-2">
          <div className="flex flex-col">
            <dt className="text-sm font-medium text-purple-600 mb-1">Top Donated Items</dt>
            <dd className="text-base font-bold text-gray-900">{stats.topDonatedItem}</dd>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-2">
          <div className="flex flex-col">
            <dt className="text-sm font-medium text-red-600 mb-1">Total Value</dt>
            <dd className="text-base font-bold text-gray-900">{formatCurrency(stats.totalValue)}</dd>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <HiExclamation className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Inventory</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Products Header */}
        <div className="px-6 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-semibold text-gray-900">Inventory Items</h2>
            {selectedItems.length > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                {selectedItems.length} selected
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsDistributeModalOpen(true)}
              disabled={selectedItems.length === 0}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                selectedItems.length > 0 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <HiTruck className="w-4 h-4 mr-2" />
              Distribute ({selectedItems.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Loading inventory...</span>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-red-600 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === inventory.length && inventory.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(inventory.filter(item => item.quantity_available > 0));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Total Value</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr 
                    key={item.inventory_id} 
                    className={`hover:bg-gray-50 ${
                      selectedItems.find(selected => selected.inventory_id === item.inventory_id) 
                        ? 'bg-red-50' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={!!selectedItems.find(selected => selected.inventory_id === item.inventory_id)}
                        onChange={() => handleItemSelect(item)}
                        disabled={item.quantity_available === 0}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.itemtype_name}</div>
                      <div className="text-sm text-gray-500">Unit FMV: {formatCurrency(item.unit_fmv)}</div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {item.category_name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {item.quantity_available.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.total_fmv_value)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {item.location || 'Not specified'}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className={getStatusIcon(item.status) ? 'ml-1' : ''}>{item.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-500 font-medium">No inventory items found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {search || selectedCategory || selectedStatus 
                            ? 'Try adjusting your filters'
                            : 'Approved donations will appear here'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && inventory.length > 0 && (
          <div className="flex items-center justify-between px-6 py-2 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Distribution Modal */}
      <DistributeDonationForm 
        isOpen={isDistributeModalOpen}
        onClose={() => setIsDistributeModalOpen(false)}
        selectedItems={selectedItems}
      />
    </div>
  );
}

export default Inventory;
