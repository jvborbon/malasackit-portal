import React from 'react';
import { HiSearch, HiUserAdd, HiRefresh } from 'react-icons/hi';

function SearchAndFilters({ search, setSearch, statusFilter, setStatusFilter, onWalkInClick, userRole, onRefresh, loading }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by donor name, email, or donation ID..."
          value={search}
          onChange={e => setSearch(e.target.value.replace(/[<>'"&]/g, ''))}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
        />
      </div>
      
      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
      >
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Rejected">Rejected</option>
      </select>

      {/* Refresh Button */}
      <button 
        onClick={onRefresh}
        disabled={loading}
        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
        title="Refresh"
      >
        <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      </button>

      {/* Walk-in Button for Staff/Admin */}
      {(userRole === 'staff' || userRole === 'admin') && onWalkInClick && (
        <button
          onClick={onWalkInClick}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium whitespace-nowrap"
        >
          <HiUserAdd className="w-4 h-4 mr-2" />
          Walk-in
        </button>
      )}
    </div>
  );
}

export default SearchAndFilters;