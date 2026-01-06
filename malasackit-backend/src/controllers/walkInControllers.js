import { createWalkInDonation } from '../services/walkInService.js';
import { query } from '../db.js';

/**
 * Create walk-in donation with auto-account creation
 */
const createWalkIn = async (req, res) => {
  try {
    const { donor, items, notes } = req.body;
    const staffUserId = req.user.user_id;
    
    // Validate required fields
    if (!donor || !donor.name || !donor.contact) {
      return res.status(400).json({
        success: false,
        message: 'Donor name and contact are required'
      });
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one donation item is required'
      });
    }
    
    // Create walk-in donation with auto-account
    const result = await createWalkInDonation({
      donor,
      items,
      notes
    }, staffUserId);
    
    res.status(201).json({
      success: true,
      message: result.isExistingDonor 
        ? 'Walk-in donation recorded successfully (existing donor)'
        : 'Walk-in donation recorded successfully (new donor account created)',
      donation: {
        donation_id: result.donation.donation_id
      },
      donor: {
        user_id: result.donorUserId,
        email: result.donor.email,
        temp_password: result.donor.temp_password,
        is_existing_donor: result.isExistingDonor
      },
      data: {
        donation_id: result.donation.donation_id,
        donor_user_id: result.donorUserId,
        is_existing_donor: result.isExistingDonor,
        login_credentials: result.donor.temp_password ? {
          email: result.donor.email,
          password: result.donor.temp_password
        } : null
      }
    });
    
  } catch (error) {
    console.error('Walk-in creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create walk-in donation'
    });
  }
};

/**
 * Get walk-in donations (for staff dashboard)
 */
const getWalkInDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let queryString = `
      SELECT 
        dr.donation_id,
        dr.created_at,
        dr.status,
        dr.notes,
        u.full_name as donor_name,
        u.contact_num as donor_contact,
        u.is_walkin_generated,
        COUNT(di.item_id) as item_count,
        SUM(di.quantity * di.declared_value) as total_value
      FROM DonationRequests dr
      JOIN Users u ON dr.user_id = u.user_id
      LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
      WHERE dr.is_walkin = true
    `;
    
    const queryParams = [];
    
    if (search) {
      queryString += ` AND (u.full_name ILIKE $${queryParams.length + 1} OR u.contact_num ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }
    
    queryString += `
      GROUP BY dr.donation_id, u.user_id
      ORDER BY dr.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    queryParams.push(limit, offset);
    
    const result = await query(queryString, queryParams);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT dr.donation_id) as total
      FROM DonationRequests dr
      JOIN Users u ON dr.user_id = u.user_id
      WHERE dr.is_walkin = true
    `;
    
    const countParams = [];
    if (search) {
      countQuery += ` AND (u.full_name ILIKE $1 OR u.contact_num ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      data: {
        donations: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total: total,
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching walk-in donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch walk-in donations'
    });
  }
};

export {
  createWalkIn,
  getWalkInDonations
};