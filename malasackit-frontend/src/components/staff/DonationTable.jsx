import React from 'react';
import { HiEye, HiCheck, HiX } from 'react-icons/hi';

function DonationTable({ 
  donations, 
  loading, 
  processingId,
  onViewDetails, 
  onStatusChange,
  getStatusColor,
  formatDate,
  formatCurrency 
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-red-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Donor Information
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Donation Details
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation.donation_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {donation.donor_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {donation.donor_email}
                    </div>
                    {donation.donor_phone && (
                      <div className="text-sm text-gray-500">
                        {donation.donor_phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      ID: {donation.donation_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {donation.item_count} items • {formatCurrency(donation.total_value)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {donation.delivery_method === 'pickup' ? '📦 Pickup' : '🚚 Drop-off'}
                    </div>
                    {donation.categories && (
                      <div className="text-xs text-gray-400 mt-1">
                        {donation.categories}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {donation.appointment_date ? (
                      <>
                        <div>{formatDate(donation.appointment_date)}</div>
                        {donation.appointment_time && (
                          <div className="text-xs text-gray-500">
                            {donation.appointment_time.slice(0, 5)}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500">Not scheduled</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                    {donation.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(donation.donation_id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View Details"
                    >
                      <HiEye className="w-4 h-4" />
                    </button>
                    
                    {donation.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => onStatusChange(donation, 'Approved')}
                          disabled={processingId === donation.donation_id}
                          className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                          title="Approve"
                        >
                          <HiCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onStatusChange(donation, 'Rejected')}
                          disabled={processingId === donation.donation_id}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="Reject"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {donation.status === 'Approved' && (
                      <button
                        onClick={() => onStatusChange(donation, 'Completed')}
                        disabled={processingId === donation.donation_id}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded disabled:opacity-50"
                        title="Mark Complete"
                      >
                        <HiCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {donations.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No donation requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DonationTable;