import React from 'react';
import { formatCurrency, formatDate, formatTime } from '../utilities/donationHelpers';
import Modal from '../common/Modal';
import DataTable from '../common/DataTable';

function DonationDetailsModal({ donation, onClose }) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Donation Details" maxWidth="max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Donor Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Name:</span> {donation.donation.donor_name}</p>
                <p><span className="font-medium">Email:</span> {donation.donation.donor_email}</p>
                <p><span className="font-medium">Delivery:</span> {donation.donation.delivery_method}</p>
                {donation.donation.appointment_date && (
                  <p><span className="font-medium">Scheduled:</span> 
                    {formatDate(donation.donation.appointment_date)}
                    {donation.donation.appointment_time && ` at ${formatTime(donation.donation.appointment_time)}`}
                  </p>
                )}
              </div>
            </div>

            {/* Donation Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Total Items:</span> {donation.summary.totalItems}</p>
                <p><span className="font-medium">Total Quantity:</span> {donation.summary.totalQuantity}</p>
                <p><span className="font-medium">Total Value:</span> {formatCurrency(donation.summary.totalValue)}</p>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Items</h3>
            <DataTable
              headers={['Category', 'Item Type', 'Quantity', 'Value', 'Description']}
              data={donation.items}
              renderRow={(item) => (
                <>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.category_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.itemtype_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.declared_value)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description || 'N/A'}</td>
                </>
              )}
              emptyMessage="No donation items found"
            />
          </div>
    </Modal>
  );
}

export default DonationDetailsModal;