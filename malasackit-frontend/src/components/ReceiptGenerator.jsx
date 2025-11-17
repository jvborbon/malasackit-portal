import React, { useState, useEffect } from 'react';
import { 
    HiDownload, 
    HiEye, 
    HiDocumentText,
    HiCheck,
    HiX,
    HiExclamationCircle,
    HiPrinter
} from 'react-icons/hi';
import receiptService from '../services/receiptService';

const ReceiptGenerator = ({ donation, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleGenerateReceipt = async () => {
        try {
            setIsGenerating(true);
            setError(null);
            
            // Use the updated receiptService that generates PDF on frontend
            const result = await receiptService.downloadDonationReceipt(donation.donation_id, false);
            
            setSuccess(`Receipt downloaded successfully: ${result.filename}`);
            
            // Auto-close success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            
        } catch (err) {
            console.error('Error generating receipt:', err);
            setError(err.message || 'Failed to generate receipt');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePreviewReceipt = async () => {
        try {
            setIsPreviewing(true);
            setError(null);
            
            // Use the updated receiptService that generates PDF preview
            const response = await receiptService.previewDonationReceipt(donation.donation_id);
            
            // Clean up previous preview URL
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            
            setPreviewData(response.data);
            setPreviewUrl(response.previewUrl);
            setShowPreview(true);
            
        } catch (err) {
            console.error('Error previewing receipt:', err);
            setError(err.message || 'Failed to preview receipt');
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleOpenInNewTab = async () => {
        try {
            setIsGenerating(true);
            setError(null);
            
            const result = await receiptService.downloadDonationReceipt(donation.donation_id, true);
            setSuccess('Receipt opened in new tab!');
            
            // Auto-close success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            
        } catch (err) {
            console.error('Error opening receipt:', err);
            setError(err.message || 'Failed to open receipt');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (showPreview && previewUrl) {
        return (
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm"></div>
                
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                Receipt Preview - Donation #{donation.donation_id}
                            </h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleGenerateReceipt}
                                    disabled={isGenerating}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    <HiDownload className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                                    {isGenerating ? 'Downloading...' : 'Download PDF'}
                                </button>
                                <button
                                    onClick={handleOpenInNewTab}
                                    disabled={isGenerating}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    <HiDocumentText className="w-4 h-4 mr-2" />
                                    Open in Tab
                                </button>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <HiX className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* PDF Preview */}
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0"
                                title="Receipt Preview"
                            />
                        </div>

                        {/* Preview Footer */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={handleGenerateReceipt}
                                disabled={isGenerating}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                <HiDownload className="w-4 h-4 mr-2" />
                                Download
                            </button>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Legacy preview fallback for JSON data
    if (showPreview && previewData && !previewUrl) {
        return (
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
                
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Receipt Preview (Data)</h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleGenerateReceipt}
                                    disabled={isGenerating}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    <HiDownload className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                                    {isGenerating ? 'Generating...' : 'Download PDF'}
                                </button>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <HiX className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-8">
                                {/* Receipt Header */}
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        DONATION ACKNOWLEDGMENT RECEIPT
                                    </h1>
                                    <div className="text-lg font-semibold text-red-600">
                                        {previewData.organization.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {previewData.organization.address}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Phone: {previewData.organization.phone} | Email: {previewData.organization.email}
                                    </div>
                                </div>

                                {/* Receipt Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Receipt Number:</span>
                                            <p className="text-sm text-gray-900">{previewData.receiptNumber}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Receipt Date:</span>
                                            <p className="text-sm text-gray-900">{formatDate(previewData.receiptDate)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Donation ID:</span>
                                            <p className="text-sm text-gray-900">#{previewData.donationId}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Status:</span>
                                            <p className="text-sm text-gray-900">{previewData.donation.status}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Donor Information */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Donor Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Name:</span>
                                            <p className="text-sm text-gray-900">{previewData.donor.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Email:</span>
                                            <p className="text-sm text-gray-900">{previewData.donor.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Phone:</span>
                                            <p className="text-sm text-gray-900">{previewData.donor.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Account Type:</span>
                                            <p className="text-sm text-gray-900">{previewData.donor.accountType}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Donation Details */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Donation Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Request Date:</span>
                                            <p className="text-sm text-gray-900">{formatDate(previewData.donation.requestDate)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Approved Date:</span>
                                            <p className="text-sm text-gray-900">
                                                {previewData.donation.approvedDate ? formatDate(previewData.donation.approvedDate) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Delivery Method:</span>
                                            <p className="text-sm text-gray-900">{previewData.donation.deliveryMethod}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Appointment:</span>
                                            <p className="text-sm text-gray-900">
                                                {previewData.donation.appointmentDate 
                                                    ? formatDate(previewData.donation.appointmentDate)
                                                    : 'Walk-in'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Donated Items</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Category</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Item</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Condition</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Qty</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Unit Value</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {previewData.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-3 py-2 text-gray-900">{item.category_name}</td>
                                                        <td className="px-3 py-2 text-gray-900">{item.itemtype_name}</td>
                                                        <td className="px-3 py-2 text-gray-900">{item.selected_condition || 'Good'}</td>
                                                        <td className="px-3 py-2 text-gray-900">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-gray-900">{formatCurrency(item.declared_value)}</td>
                                                        <td className="px-3 py-2 text-gray-900">{formatCurrency(item.total_item_value)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-red-50 rounded-lg p-4 mb-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">{previewData.summary.totalItems}</div>
                                            <div className="text-sm text-gray-600">Item Types</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">{previewData.summary.totalQuantity}</div>
                                            <div className="text-sm text-gray-600">Total Quantity</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">{formatCurrency(previewData.summary.totalValue)}</div>
                                            <div className="text-sm text-gray-600">Total Value</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tax Information */}
                                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold text-blue-900 mb-2">Tax Information</h4>
                                    <p className="text-sm text-blue-800">{previewData.taxInformation.message}</p>
                                    <p className="text-sm text-blue-700 mt-1">Tax ID: {previewData.taxInformation.taxId}</p>
                                </div>

                                {/* Footer */}
                                <div className="text-center text-sm text-gray-600">
                                    <p>This receipt acknowledges your generous donation to La Salle Alumni Social Action Center.</p>
                                    <p>Your contribution helps us serve communities in need.</p>
                                    <p className="font-semibold text-red-600 mt-2">Thank you for your support!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
            
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Generate Receipt</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Donation Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center mb-3">
                                <HiDocumentText className="w-5 h-5 text-gray-500 mr-2" />
                                <span className="font-medium text-gray-900">Donation #{donation.donation_id}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div>Donor: {donation.donor_name}</div>
                                <div>Status: <span className="font-medium text-green-600">{donation.status}</span></div>
                                <div>Total Value: {formatCurrency(donation.total_value || 0)}</div>
                            </div>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <HiExclamationCircle className="w-5 h-5 text-red-500 mr-2" />
                                    <span className="text-red-800 text-sm">{error}</span>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <HiCheck className="w-5 h-5 text-green-500 mr-2" />
                                    <span className="text-green-800 text-sm">{success}</span>
                                </div>
                            </div>
                        )}

                        {/* Eligibility Check */}
                        {!['Approved', 'Completed'].includes(donation.status) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <HiExclamationCircle className="w-5 h-5 text-yellow-500 mr-2" />
                                    <span className="text-yellow-800 text-sm">
                                        Receipt can only be generated for approved or completed donations.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handlePreviewReceipt}
                                disabled={isPreviewing || !['Approved', 'Completed'].includes(donation.status)}
                                className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiEye className={`w-5 h-5 mr-2 ${isPreviewing ? 'animate-spin' : ''}`} />
                                {isPreviewing ? 'Loading Preview...' : 'Preview Receipt'}
                            </button>

                            <button
                                onClick={handleGenerateReceipt}
                                disabled={isGenerating || !['Approved', 'Completed'].includes(donation.status)}
                                className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiDownload className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                                {isGenerating ? 'Downloading PDF...' : 'Download PDF Receipt'}
                            </button>

                            <button
                                onClick={handleOpenInNewTab}
                                disabled={isGenerating || !['Approved', 'Completed'].includes(donation.status)}
                                className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiDocumentText className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                                {isGenerating ? 'Opening...' : 'Open in New Tab'}
                            </button>
                        </div>

                        {/* Info */}
                        <div className="mt-4 text-xs text-gray-500 text-center">
                            <p>The receipt will include donation details, item breakdown, and tax information.</p>
                            <p className="mt-1 font-medium">Generated using jsPDF - No server dependency required!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptGenerator;