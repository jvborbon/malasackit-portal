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
import PaginationComponent from "./common/PaginationComponent";
import { 
  getInventory, 
  getInventoryStats, 
  updateInventoryItem, 
  getLowStockItems,
  getCategories 
} from "../services/inventoryService";
import { formatCurrency } from "../utils/donationHelpers";

function Inventory() {
  const [search, setSearch] = useState("");
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  
  // Create pagination object for PaginationComponent
  const pagination = {
    currentPage,
    pages: totalPages,
    total: totalItems,
    limit: itemsPerPage
  };
  
  // Page change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Load data functions
  const loadInventoryData = async (includeStats = true) => {
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
      
      if (includeStats) {
        const [inventoryResponse, statsResponse] = await Promise.all([
          getInventory(params),
          getInventoryStats()
        ]);
        
        setInventory(inventoryResponse.data.inventory || []);
        setTotalPages(inventoryResponse.data.pagination.pages || 1);
        setTotalItems(inventoryResponse.data.pagination.total || 0);
        setStats(statsResponse.data || stats);
      } else {
        const inventoryResponse = await getInventory(params);
        
        setInventory(inventoryResponse.data.inventory || []);
        setTotalPages(inventoryResponse.data.pagination.pages || 1);
        setTotalItems(inventoryResponse.data.pagination.total || 0);
      }
      
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
    // Initial load on mount - load categories and data
    const initializeData = async () => {
      try {
        setLoading(true);
        await loadCategories();
        await loadInventoryData();
        setInitialLoadComplete(true); // Mark initial load as complete
      } catch (err) {
        console.error('Error initializing inventory data:', err);
        setError('Failed to load inventory data');
      }
    };
    
    initializeData();
  }, []); // Empty dependency array - only run on mount
  
  // Debounced effect for search and filters
  useEffect(() => {
    // Skip only on the very first render before initial load completes
    if (!initialLoadComplete) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1
      loadInventoryData(false); // Load table data only, not stats
    }, 500); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, selectedStatus, initialLoadComplete]);
  
  // Effect for page changes (pagination only)
  useEffect(() => {
    // Skip on initial load (page 1 before initialLoadComplete)
    if (!initialLoadComplete) {
      return;
    }
    // Load data whenever page changes (including back to page 1)
    loadInventoryData(false); // Load table data only, not stats
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
    loadInventoryData(false); // Refresh table only, not stats
  };
  


  // Show loading spinner on initial load
  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading inventory...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <HiExclamation className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-900 font-medium mb-2">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadInventoryData();
            }}
            className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-950 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 relative">
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
            className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-900 focus:border-red-900"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-md ${showFilters ? 'bg-red-100 text-red-900' : 'text-gray-400 hover:text-gray-600'}`}
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-900 focus:border-red-900"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-900 focus:border-red-900"
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
            <dt className="text-sm font-medium text-red-900 mb-1">Total Value</dt>
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
                className="mt-2 text-sm text-red-900 hover:text-red-500 underline"
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
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsDistributeModalOpen(true)}
              className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
            >
              <HiTruck className="w-4 h-4 mr-2" />
              Distribute
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-900"></div>
              <span className="ml-3 text-gray-600">Loading inventory...</span>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-red-900 sticky top-0">
                <tr>
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
                    className="hover:bg-gray-50"
                  >
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
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
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
        {!loading && inventory.length > 0 && pagination.pages > 1 && (
          <div className="px-6 py-2 border-t border-gray-200">
            <PaginationComponent 
              pagination={pagination} 
              onPageChange={handlePageChange}
              itemName="items"
            />
          </div>
        )}
      </div>

      {/* Distribution Modal */}
      <DistributeDonationForm 
        isOpen={isDistributeModalOpen}
        onClose={() => setIsDistributeModalOpen(false)}
      />
      
      {/* Loading overlay for refresh operations */}
      {loading && inventory.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-900"></div>
            <span className="text-sm text-gray-600">Refreshing...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
