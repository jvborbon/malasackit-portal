import React from 'react';
import { HiSearch } from 'react-icons/hi';

function SearchAndFilters({ search, setSearch, statusFilter, setStatusFilter }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by donor name, email, or donation ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
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
    </div>
  );
}

export default SearchAndFilters;