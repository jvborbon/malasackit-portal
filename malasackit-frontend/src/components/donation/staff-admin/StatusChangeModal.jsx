import React, { useState } from 'react';
import Modal from '../../common/Modal';

function StatusChangeModal({ donation, newStatus, onConfirm, onClose }) {
  const [remarks, setRemarks] = useState('');

  const getStatusMessage = () => {
    switch (newStatus) {
      case 'Approved':
        return 'Are you sure you want to approve this donation request?';
      case 'Rejected':
        return 'Are you sure you want to reject this donation request?';
      case 'Completed':
        return 'Are you sure you want to mark this donation as completed?';
      default:
        return `Are you sure you want to change the status to ${newStatus}?`;
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-md" showHeader={false}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Confirm Status Change
      </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {getStatusMessage()}
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks or notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(remarks)}
              className={`px-4 py-2 rounded-md text-white ${
                newStatus === 'Rejected' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Confirm
            </button>
          </div>
    </Modal>
  );
}

export default StatusChangeModal;