import { query } from '../db.js';

/**
 * Generate donation acknowledgment receipt data (JSON only - PDF generation handled on frontend)
 */
export const generateDonationReceipt = async (req, res) => {
    try {
        const { donationId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Get donation details with donor information
        const donationQuery = `
            SELECT 
                dr.donation_id,
                dr.status,
                dr.notes,
                dr.delivery_method,
                dr.created_at as request_date,
                dr.approved_at,
                u.full_name as donor_name,
                u.email as donor_email,
                u.contact_num as donor_phone,
                u.account_type,
                u.user_id as donor_id,
                a.appointment_date,
                a.appointment_time,
                a.status as appointment_status
            FROM DonationRequests dr
            JOIN Users u ON dr.user_id = u.user_id
            LEFT JOIN Appointments a ON dr.appointment_id = a.appointment_id
            WHERE dr.donation_id = $1 AND dr.status IN ('Approved', 'Completed')
        `;

        const donationResult = await query(donationQuery, [donationId]);

        if (donationResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found or not eligible for receipt generation'
            });
        }

        const donation = donationResult.rows[0];

        // Check permissions - donors can only get their own receipts
        if (userRole === 'Donor' && donation.donor_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only generate receipts for your own donations'
            });
        }

        // Get donation items with details
        const itemsQuery = `
            SELECT 
                di.item_id,
                di.quantity,
                di.declared_value,
                di.description,
                di.selected_condition,
                it.itemtype_name,
                ic.category_name,
                (di.declared_value * di.quantity) as total_item_value
            FROM DonationItems di
            JOIN ItemType it ON di.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE di.donation_id = $1
            ORDER BY ic.category_name, it.itemtype_name
        `;

        const itemsResult = await query(itemsQuery, [donationId]);
        const items = itemsResult.rows;

        // Calculate totals
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = items.reduce((sum, item) => sum + parseFloat(item.total_item_value), 0);

        // Prepare receipt data for frontend PDF generation
        const receiptData = {
            receiptNumber: `LASAC-${donationId}-${Date.now().toString().slice(-6)}`,
            donationId: donation.donation_id,
            receiptDate: new Date().toISOString(),
            donor: {
                name: donation.donor_name,
                email: donation.donor_email,
                phone: donation.donor_phone,
                accountType: donation.account_type,
                donorId: donation.donor_id
            },
            donation: {
                id: donation.donation_id,
                requestDate: donation.request_date,
                approvedDate: donation.approved_at,
                deliveryMethod: donation.delivery_method,
                appointmentDate: donation.appointment_date,
                appointmentTime: donation.appointment_time,
                status: donation.status,
                notes: donation.notes
            },
            items: items,
            summary: {
                totalItems: items.length,
                totalQuantity: totalQuantity,
                totalValue: totalValue,
                currency: 'PHP'
            },
            organization: {
                name: 'Lipa Archdiocese Social Action Commission, Inc. (LASAC)',
                address: 'LAFORCE Building, J. P. Laurel Hi-way, Marawoy, Lipa City, Batangas 4217 Philippines',
                phone: '(043) 757-6182',
                email: 'info@lasaclipa.org',
                website: 'www.lasaclipa.org'
            },
            taxInformation: {
                taxExempt: true,
                taxId: 'TIN-123-456-789', // Replace with actual TIN
                message: 'This donation is tax-deductible under Philippine law.'
            }
        };

        // Log receipt generation
        const activityQuery = `
            INSERT INTO UserActivityLogs (user_id, action, description)
            VALUES ($1, 'receipt_generated', $2)
        `;
        await query(activityQuery, [
            userId,
            `Generated receipt data for donation ${donationId} (${donation.donor_name})`
        ]);

        // Always return JSON data (PDF generation handled on frontend with jsPDF)
        return res.json({
            success: true,
            data: receiptData,
            message: 'Receipt data generated successfully'
        });

    } catch (error) {
        console.error('Error generating donation receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate donation receipt',
            error: error.message
        });
    }
};




/**
 * Get receipt history for a user
 */
export const getReceiptHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { limit = 20, offset = 0 } = req.query;

        let historyQuery;
        let params;

        if (userRole === 'Donor') {
            // Donors only see their own receipt history
            historyQuery = `
                SELECT 
                    ual.log_id,
                    ual.action,
                    ual.description,
                    ual.created_at,
                    dr.donation_id,
                    dr.status as donation_status,
                    SUM(di.declared_value * di.quantity) as total_value
                FROM UserActivityLogs ual
                JOIN DonationRequests dr ON ual.description LIKE '%donation ' || dr.donation_id || '%'
                LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
                WHERE ual.user_id = $1 
                  AND ual.action = 'receipt_generated'
                  AND dr.user_id = $1
                GROUP BY ual.log_id, ual.action, ual.description, ual.created_at, dr.donation_id, dr.status
                ORDER BY ual.created_at DESC
                LIMIT $2 OFFSET $3
            `;
            params = [userId, limit, offset];
        } else {
            // Staff can see all receipt history
            historyQuery = `
                SELECT 
                    ual.log_id,
                    ual.action,
                    ual.description,
                    ual.created_at,
                    ual.user_id as generated_by,
                    u.full_name as generated_by_name,
                    dr.donation_id,
                    dr.status as donation_status,
                    donor.full_name as donor_name,
                    SUM(di.declared_value * di.quantity) as total_value
                FROM UserActivityLogs ual
                JOIN Users u ON ual.user_id = u.user_id
                JOIN DonationRequests dr ON ual.description LIKE '%donation ' || dr.donation_id || '%'
                JOIN Users donor ON dr.user_id = donor.user_id
                LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
                WHERE ual.action = 'receipt_generated'
                GROUP BY ual.log_id, ual.action, ual.description, ual.created_at, 
                         ual.user_id, u.full_name, dr.donation_id, dr.status, donor.full_name
                ORDER BY ual.created_at DESC
                LIMIT $1 OFFSET $2
            `;
            params = [limit, offset];
        }

        const result = await query(historyQuery, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: result.rows.length
            },
            message: 'Receipt history retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting receipt history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve receipt history',
            error: error.message
        });
    }
};

/**
 * Get receipt statistics
 */
export const getReceiptStatistics = async (req, res) => {
    try {
        const { period = '30' } = req.query; // days
        const userRole = req.user.role;
        const userId = req.user.userId;

        let statsQuery;
        let params;

        if (userRole === 'Donor') {
            // Donor-specific statistics
            statsQuery = `
                SELECT 
                    COUNT(*) as total_receipts,
                    COUNT(CASE WHEN ual.created_at >= NOW() - INTERVAL '${parseInt(period)} days' THEN 1 END) as recent_receipts,
                    COALESCE(SUM(di.declared_value * di.quantity), 0) as total_receipt_value
                FROM UserActivityLogs ual
                JOIN DonationRequests dr ON ual.description LIKE '%donation ' || dr.donation_id || '%'
                LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
                WHERE ual.user_id = $1 
                  AND ual.action = 'receipt_generated'
                  AND dr.user_id = $1
            `;
            params = [userId];
        } else {
            // Staff/Admin statistics
            statsQuery = `
                SELECT 
                    COUNT(DISTINCT ual.log_id) as total_receipts,
                    COUNT(DISTINCT CASE WHEN ual.created_at >= NOW() - INTERVAL '${parseInt(period)} days' THEN ual.log_id END) as recent_receipts,
                    COUNT(DISTINCT dr.donation_id) as unique_donations,
                    COUNT(DISTINCT dr.user_id) as unique_donors,
                    COALESCE(SUM(di.declared_value * di.quantity), 0) as total_receipt_value
                FROM UserActivityLogs ual
                JOIN DonationRequests dr ON ual.description LIKE '%donation ' || dr.donation_id || '%'
                LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
                WHERE ual.action = 'receipt_generated'
            `;
            params = [];
        }

        const result = await query(statsQuery, params);
        const stats = result.rows[0];

        res.json({
            success: true,
            data: {
                ...stats,
                total_receipt_value: parseFloat(stats.total_receipt_value) || 0,
                period_days: parseInt(period)
            },
            message: 'Receipt statistics retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting receipt statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve receipt statistics',
            error: error.message
        });
    }
};