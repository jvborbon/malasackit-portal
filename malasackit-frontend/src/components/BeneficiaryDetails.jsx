import { useState, useEffect } from 'react';
import { HiX, HiPencil, HiTrash, HiUser, HiMail, HiPhone, HiLocationMarker, HiClipboardList } from 'react-icons/hi';
import beneficiaryService from '../services/beneficiaryService';

export default function BeneficiaryDetails({ isOpen, onClose, beneficiary, onEdit, onDelete }) {
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    useEffect(() => {
        if (isOpen && beneficiary) {
            loadBeneficiaryRequests();
        }
    }, [isOpen, beneficiary]);

    const loadBeneficiaryRequests = async () => {
        try {
            setLoadingRequests(true);
            const response = await beneficiaryService.getBeneficiaryRequests(beneficiary.beneficiary_id);
            setRequests(response.data || []);
        } catch (error) {
            console.error('Error loading requests:', error);
            setRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-xl font-bold text-red-900">
                                        {beneficiary?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{beneficiary?.name}</h2>
                                    <p className="text-sm text-gray-600 mt-1">{beneficiary?.type}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <HiUser className="w-5 h-5 mr-2 text-red-900" />
                                    Contact Information
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex items-start">
                                        <HiUser className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Contact Person</p>
                                            <p className="text-sm text-gray-900">{beneficiary?.contact_person || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <HiPhone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Phone</p>
                                            <p className="text-sm text-gray-900">{beneficiary?.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <HiMail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Email</p>
                                            <p className="text-sm text-gray-900">{beneficiary?.email || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <HiLocationMarker className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Address</p>
                                            <p className="text-sm text-gray-900">{beneficiary?.address || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {beneficiary?.notes && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{beneficiary.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Request History */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <HiClipboardList className="w-5 h-5 mr-2 text-red-900" />
                                    Request History ({requests.length})
                                </h3>
                                {loadingRequests ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-900"></div>
                                    </div>
                                ) : requests.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                                        {requests.map((request) => (
                                            <div key={request.request_id} className="bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {request.purpose || 'No purpose specified'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(request.request_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        request.status === 'Fulfilled' ? 'bg-blue-100 text-blue-800' :
                                                        request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {request.status}
                                                    </span>
                                                </div>
                                                {request.items && request.items.length > 0 && (
                                                    <div className="text-xs text-gray-600">
                                                        {request.items.length} item(s) requested
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <HiClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No requests found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => onDelete(beneficiary)}
                                className="flex items-center px-4 py-2 text-red-900 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <HiTrash className="w-4 h-4 mr-2" />
                                Delete Beneficiary
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => onEdit(beneficiary)}
                                    className="flex items-center px-6 py-2 bg-red-900 text-white rounded-lg hover:bg-red-950 font-medium"
                                >
                                    <HiPencil className="w-4 h-4 mr-2" />
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
