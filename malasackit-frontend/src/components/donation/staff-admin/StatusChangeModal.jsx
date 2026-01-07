import React, { useState } from 'react';
import Modal from '../../common/Modal';

function StatusChangeModal({ donation, newStatus, onConfirm, onClose, isUpdating = false }) {
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(remarks)}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-md text-white flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                newStatus === 'Rejected' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isUpdating && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isUpdating ? 'Processing...' : 'Confirm'}</span>
            </button>
          </div>
    </Modal>
  );
}

export default StatusChangeModal;