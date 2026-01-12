import React from 'react';
import { HiEye, HiCheck, HiX, HiRefresh, HiDocumentText } from 'react-icons/hi';
import { formatTime } from '../../../utils/donationHelpers';

function DonationTable({ 
  donations, 
  loading, 
  processingId,
  onViewDetails, 
  onStatusChange,
  onGenerateReceipt,
  getStatusColor,
  formatDate,
  formatCurrency 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-red-900 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Donor Information
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Donation Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <HiRefresh className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="text-sm text-gray-500">Loading donations...</p>
                  </div>
                </td>
              </tr>
            ) : donations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">No donation requests found</p>
                    <p className="text-xs text-gray-500">Try adjusting your filters or check back later</p>
                  </div>
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr 
                  key={donation.donation_id} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Donor Information */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-9 w-9">
                        <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-red-900">
                            {donation.donor_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {donation.donor_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {donation.donor_email}
                        </div>
                        {donation.donor_phone && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {donation.donor_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Donation Details */}
                  <td className="px-5 py-3">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">ID: {donation.donation_id}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {donation.total_quantity} items • {formatCurrency(donation.total_value)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {donation.delivery_method === 'pickup' ? '📦 Pickup' : '🚚 Drop-off'}
                      </div>
                      {donation.categories && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                          {donation.categories}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Schedule */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {donation.appointment_date ? (
                        <>
                          <div className="font-medium">{formatDate(donation.appointment_date)}</div>
                          {donation.appointment_time && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatTime(donation.appointment_time)}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">Not scheduled</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                      {donation.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onViewDetails(donation.donation_id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        title="View Details"
                      >
                        <HiEye className="w-5 h-5" />
                      </button>
                      
                      {(donation.status === 'Completed' || donation.status === 'Approved') && (
                        <button
                          onClick={() => onGenerateReceipt(donation)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                          title="Generate Receipt"
                        >
                          <HiDocumentText className="w-5 h-5" />
                        </button>
                      )}
                      
                      {donation.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => onStatusChange(donation, 'Approved')}
                            disabled={processingId === donation.donation_id}
                            className="text-green-600 hover:text-green-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve"
                          >
                            <HiCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onStatusChange(donation, 'Rejected')}
                            disabled={processingId === donation.donation_id}
                            className="text-red-900 hover:text-red-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject"
                          >
                            <HiX className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {donation.status === 'Approved' && (
                        <button
                          onClick={() => onStatusChange(donation, 'Completed')}
                          disabled={processingId === donation.donation_id}
                          className="text-purple-600 hover:text-purple-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mark Complete"
                        >
                          <HiCheck className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination info */}
      {!loading && donations.length > 0 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{donations.length}</span> results
              </p>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{donations.length}</span> of{' '}
                  <span className="font-medium">{donations.length}</span> results
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonationTable;     