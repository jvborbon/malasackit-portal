import api from '../utils/api';
import { downloadReceiptPDF, previewReceiptPDF } from './pdfReceiptGenerator';

/**
 * Generate donation acknowledgment receipt
 * @param {number} donationId - The donation ID
 * @param {string} format - 'pdf' (default) or 'json'
 * @returns {Promise} Promise that resolves to the receipt data
 */
export const generateDonationReceipt = async (donationId, format = 'pdf') => {
    try {
        // Always get JSON data from backend
        const response = await api.get(`/api/receipts/donation/${donationId}`, {
            params: { format: 'json' }
        });
        
        if (format === 'pdf') {
            // Generate PDF on frontend using jsPDF
            const result = downloadReceiptPDF(response.data.data, false);
            return {
                success: true,
                message: result.message,
                filename: result.filename,
                data: response.data.data
            };
        }
        
        return response.data;
    } catch (error) {
        console.error('Error generating donation receipt:', error);
        throw error;
    }
};

/**
 * Download donation receipt as PDF (using frontend jsPDF generation)
 * @param {number} donationId - The donation ID
 * @param {boolean} openInNewTab - Whether to open in new tab instead of download
 * @returns {Promise} Promise that resolves when download starts
 */
export const downloadDonationReceipt = async (donationId, openInNewTab = false) => {
    try {
        // Get receipt data from backend
        const response = await api.get(`/api/receipts/donation/${donationId}`, {
            params: { format: 'json' }
        });
        
        // Generate and download PDF using jsPDF
        const result = downloadReceiptPDF(response.data.data, openInNewTab);
        
        return {
            success: true,
            message: result.message,
            filename: result.filename,
            data: response.data.data
        };
    } catch (error) {
        console.error('Error downloading donation receipt:', error);
        throw error;
    }
};

/**
 * Preview donation receipt as PDF in browser
 * @param {number} donationId - The donation ID
 * @returns {Promise} Promise that resolves to receipt preview URL and data
 */
export const previewDonationReceipt = async (donationId) => {
    try {
        // Get receipt data from backend
        const response = await api.get(`/api/receipts/donation/${donationId}`, {
            params: { format: 'json' }
        });
        
        // Generate PDF preview URL
        const previewUrl = previewReceiptPDF(response.data.data);
        
        return {
            success: true,
            previewUrl: previewUrl,
            data: response.data.data,
            message: 'Receipt preview generated successfully'
        };
    } catch (error) {
        console.error('Error previewing donation receipt:', error);
        throw error;
    }
};

/**
 * Get receipt generation history
 * @param {Object} params - Query parameters (limit, offset)
 * @returns {Promise} Promise that resolves to receipt history
 */
export const getReceiptHistory = async (params = {}) => {
    try {
        const response = await api.get('/api/receipts/history', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching receipt history:', error);
        throw error;
    }
};

/**
 * Get receipt statistics
 * @param {number} period - Number of days to include (default: 30)
 * @returns {Promise} Promise that resolves to receipt statistics
 */
export const getReceiptStatistics = async (period = 30) => {
    try {
        const response = await api.get('/api/receipts/statistics', {
            params: { period }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching receipt statistics:', error);
        throw error;
    }
};

/**
 * Batch generate receipts for multiple donations
 * @param {number[]} donationIds - Array of donation IDs
 * @param {boolean} openInNewTab - Whether to open PDFs in new tabs instead of download
 * @returns {Promise} Promise that resolves to batch operation results
 */
export const batchGenerateReceipts = async (donationIds, openInNewTab = false) => {
    try {
        const results = await Promise.allSettled(
            donationIds.map(id => downloadDonationReceipt(id, openInNewTab))
        );
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        return {
            success: true,
            summary: {
                total: donationIds.length,
                successful,
                failed
            },
            results,
            message: `Batch operation completed: ${successful} successful, ${failed} failed`
        };
    } catch (error) {
        console.error('Error in batch receipt generation:', error);
        throw error;
    }
};

export default {
    generateDonationReceipt,
    downloadDonationReceipt,
    previewDonationReceipt,
    getReceiptHistory,
    getReceiptStatistics,
    batchGenerateReceipts
};