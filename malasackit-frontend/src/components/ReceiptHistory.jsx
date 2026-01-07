import React, { useState, useEffect } from 'react';
import { 
    HiDocumentText, 
    HiDownload, 
    HiSearch, 
    HiCalendar,
    HiUser,
    HiCurrencyDollar,
    HiEye,
    HiRefresh,
    HiCheckCircle,
    HiExclamationCircle,
    HiInformationCircle
} from 'react-icons/hi';
import receiptService from '../services/receiptService';

const ReceiptHistory = ({ userRole = 'Donor' }) => {
    const [receipts, setReceipts] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [pagination, setPagination] = useState({
        limit: 20,
        offset: 0,
        hasMore: true
    });
    
    // Batch operations
    const [selectedReceipts, setSelectedReceipts] = useState([]);
    const [batchLoading, setBatchLoading] = useState(false);

    useEffect(() => {
        loadReceiptHistory();
        loadStatistics();
    }, [selectedPeriod]);

    const loadReceiptHistory = async (reset = true) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                limit: pagination.limit,
                offset: reset ? 0 : pagination.offset
            };

            const response = await receiptService.getReceiptHistory(params);
            
            if (reset) {
                setReceipts(response.data);
                setPagination(prev => ({ ...prev, offset: params.limit }));
            } else {
                setReceipts(prev => [...prev, ...response.data]);
                setPagination(prev => ({ ...prev, offset: prev.offset + params.limit }));
            }

            // Check if there are more records
            setPagination(prev => ({ 
                ...prev, 
                hasMore: response.data.length === params.limit 
            }));

        } catch (err) {
            console.error('Error loading receipt history:', err);
            setError(err.response?.data?.message || 'Failed to load receipt history');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await receiptService.getReceiptStatistics(selectedPeriod);
            setStatistics(response.data);
        } catch (err) {
            console.error('Error loading receipt statistics:', err);
        }
    };

    const handleDownloadReceipt = async (donationId, donorName) => {
        try {
            setError(null);
            const result = await receiptService.downloadDonationReceipt(donationId, false);
            setSuccess(`Receipt downloaded: ${result.filename}`);
            
            // Auto-clear success message
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error downloading receipt:', err);
            setError('Failed to download receipt: ' + err.message);
        }
    };

    const handlePreviewReceipt = async (donationId) => {
        try {
            setError(null);
            const result = await receiptService.downloadDonationReceipt(donationId, true);
            setSuccess('Receipt opened in new tab');
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error previewing receipt:', err);
            setError('Failed to preview receipt: ' + err.message);
        }
    };

    const handleBatchDownload = async () => {
        if (selectedReceipts.length === 0) return;
        
        try {
            setBatchLoading(true);
            setError(null);
            
            const result = await receiptService.batchGenerateReceipts(selectedReceipts, false);
            setSuccess(`Batch download completed: ${result.summary.successful}/${result.summary.total} receipts`);
            
            // Clear selection
            setSelectedReceipts([]);
            
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError('Failed to batch download receipts: ' + err.message);
        } finally {
            setBatchLoading(false);
        }
    };

    const handleSelectReceipt = (donationId) => {
        setSelectedReceipts(prev => {
            if (prev.includes(donationId)) {
                return prev.filter(id => id !== donationId);
            } else {
                return [...prev, donationId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedReceipts.length === filteredReceipts.length) {
            setSelectedReceipts([]);
        } else {
            setSelectedReceipts(filteredReceipts.map(r => r.donation_id));
        }
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const filteredReceipts = receipts.filter(receipt => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            receipt.description.toLowerCase().includes(searchLower) ||
            receipt.donation_id.toString().includes(searchLower) ||
            (receipt.donor_name && receipt.donor_name.toLowerCase().includes(searchLower))
        );
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && receipts.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Receipt History</h2>
                    <p className="text-gray-600">Download and manage donation acknowledgment receipts</p>
                </div>
                
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                    
                    <button
                        onClick={() => {
                            loadReceiptHistory(true);
                            loadStatistics();
                        }}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <HiRefresh className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                    <HiExclamationCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-red-700 flex-1">{error}</span>
                    <button onClick={clearMessages} className="text-red-500 hover:text-red-700 ml-2">×</button>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                    <HiCheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-green-700 flex-1">{success}</span>
                    <button onClick={clearMessages} className="text-green-500 hover:text-green-700 ml-2">×</button>
                </div>
            )}

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <HiDocumentText className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <div className="text-2xl font-bold text-gray-900">
                                    {statistics.total_receipts}
                                </div>
                                <div className="text-sm text-gray-500">Total Receipts</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <HiCalendar className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <div className="text-2xl font-bold text-gray-900">
                                    {statistics.recent_receipts}
                                </div>
                                <div className="text-sm text-gray-500">Recent ({selectedPeriod} days)</div>
                            </div>
                        </div>
                    </div>

                    {userRole !== 'Donor' && (
                        <>
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <HiUser className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {statistics.unique_donors || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">Unique Donors</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <HiDocumentText className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {statistics.unique_donations || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">Unique Donations</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {userRole === 'Donor' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <HiCurrencyDollar className="w-8 h-8 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(statistics.total_receipt_value)}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Receipt Value</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search and Batch Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="relative flex-1">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search receipts by donation ID, description, or donor name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                        />
                    </div>
                    
                    {selectedReceipts.length > 0 && (
                        <button
                            onClick={handleBatchDownload}
                            disabled={batchLoading}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <HiDownload className={`w-4 h-4 mr-2 ${batchLoading ? 'animate-spin' : ''}`} />
                            {batchLoading ? 'Downloading...' : `Download Selected (${selectedReceipts.length})`}
                        </button>
                    )}
                </div>
            </div>

            {/* Receipt List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {filteredReceipts.length === 0 ? (
                    <div className="text-center py-12">
                        <HiDocumentText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {searchTerm ? 'No receipts found matching your search.' : 'No receipts generated yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedReceipts.length === filteredReceipts.length && filteredReceipts.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Donation
                                    </th>
                                    {userRole !== 'Donor' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Donor
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Generated
                                    </th>
                                    {userRole !== 'Donor' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Generated By
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReceipts.map((receipt) => (
                                    <tr key={receipt.log_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedReceipts.includes(receipt.donation_id)}
                                                onChange={() => handleSelectReceipt(receipt.donation_id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <HiDocumentText className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Donation #{receipt.donation_id}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {receipt.donation_status}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {userRole !== 'Donor' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{receipt.donor_name}</div>
                                            </td>
                                        )}
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(receipt.total_value || 0)}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(receipt.created_at)}
                                        </td>
                                        
                                        {userRole !== 'Donor' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {receipt.generated_by_name}
                                            </td>
                                        )}
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handlePreviewReceipt(receipt.donation_id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Preview Receipt in New Tab"
                                                >
                                                    <HiEye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReceipt(
                                                        receipt.donation_id, 
                                                        receipt.donor_name
                                                    )}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Download Receipt PDF"
                                                >
                                                    <HiDownload className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Load More Button */}
                {pagination.hasMore && !loading && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <button
                            onClick={() => loadReceiptHistory(false)}
                            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <HiInformationCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Enhanced Receipt Generation with jsPDF</p>
                        <p>All PDF receipts are now generated on the frontend using jsPDF and jsPDF-AutoTable. This provides faster generation, better formatting, and reduces server load. Use the eye icon to preview receipts in a new tab or the download icon to save them directly.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptHistory;