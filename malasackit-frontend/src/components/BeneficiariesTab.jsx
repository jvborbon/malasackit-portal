import { useState } from 'react';
import { 
    HiSearch, 
    HiPencil, 
    HiTrash, 
    HiEye,
    HiPlus,
    HiRefresh,
    HiFilter
} from 'react-icons/hi';
import PaginationComponent from './common/PaginationComponent';

// Beneficiaries Tab Component
export function BeneficiariesTab({ 
    beneficiaries, 
    loading = false,
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType, 
    setShowAddModal, 
    setShowEditModal, 
    setShowDeleteModal, 
    setShowViewModal, 
    setSelectedBeneficiary, 
    pagination,
    onPageChange,
    onRefresh
}) {
    const handleAddBeneficiary = () => {
        setSelectedBeneficiary(null);
        setShowAddModal(true);
    };

    const handleEditBeneficiary = (beneficiary) => {
        setSelectedBeneficiary(beneficiary);
        setShowEditModal(true);
    };

    const handleViewBeneficiary = (beneficiary) => {
        setSelectedBeneficiary(beneficiary);
        setShowViewModal(true);
    };

    const handleDeleteBeneficiary = (beneficiary) => {
        setSelectedBeneficiary(beneficiary);
        setShowDeleteModal(true);
    };

    const getTypeBadge = (type) => {
        const getTypeColor = (typeKey) => {
            switch (typeKey) {
                case 'Individual':
                    return 'bg-blue-100 text-blue-800';
                case 'Family':
                    return 'bg-green-100 text-green-800';
                case 'Community':
                    return 'bg-purple-100 text-purple-800';
                case 'Institution':
                    return 'bg-orange-100 text-orange-800';
                case 'Parish/Religious Organization':
                    return 'bg-indigo-100 text-indigo-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(type)}`}>
                {type}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search beneficiaries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">All Types</option>
                    <option value="Individual">Individual</option>
                    <option value="Family">Family</option>
                    <option value="Community">Community</option>
                    <option value="Institution">Institution</option>
                    <option value="Parish/Religious Organization">Parish/Religious Organization</option>
                </select>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <HiRefresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
                <button
                    onClick={handleAddBeneficiary}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                    <HiPlus className="w-4 h-4 mr-2" />
                    Add Beneficiary
                </button>
            </div>

            {/* Beneficiaries Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full">
                        <thead className="bg-red-600 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Beneficiary
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {beneficiaries.map((beneficiary) => (
                                <tr key={beneficiary.beneficiary_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {beneficiary.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{beneficiary.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {beneficiary.contact_person || 'No contact person'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getTypeBadge(beneficiary.type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {beneficiary.phone || 'No phone'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {beneficiary.email || 'No email'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {beneficiary.address ? (
                                                <span className="line-clamp-2">{beneficiary.address}</span>
                                            ) : (
                                                <span className="text-gray-400">No address</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button
                                            onClick={() => handleViewBeneficiary(beneficiary)}
                                            className="text-gray-600 hover:text-gray-900"
                                            title="View Details"
                                        >
                                            <HiEye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditBeneficiary(beneficiary)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Edit Beneficiary"
                                        >
                                            <HiPencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBeneficiary(beneficiary)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete Beneficiary"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {beneficiaries.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No beneficiaries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <PaginationComponent 
                    pagination={pagination} 
                    onPageChange={onPageChange}
                    itemName="beneficiaries"
                />
            )}
        </div>
    );
}

export default BeneficiariesTab;
