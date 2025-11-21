import { query } from '../db.js';

// Get KPI metrics for staff dashboard
const getStaffKPIMetrics = async (req, res) => {
  try {
    // Total Worth of Response - sum of all donation values
    const totalWorthQuery = `
      SELECT COALESCE(SUM(
        CASE 
          WHEN di.calculated_fmv > 0 THEN di.calculated_fmv
          ELSE di.quantity * di.declared_value
        END
      ), 0) as total_worth
      FROM DonationItems di
      INNER JOIN DonationRequests dr ON di.donation_id = dr.donation_id
      WHERE dr.status IN ('Approved', 'Completed')
    `;
    const totalWorthResult = await query(totalWorthQuery);
    const totalWorth = parseFloat(totalWorthResult.rows[0].total_worth) || 0;

    // Donors Engaged - count of unique donors who made donations
    const donorsEngagedQuery = `
      SELECT COUNT(DISTINCT dr.user_id) as donors_engaged
      FROM DonationRequests dr 
      WHERE dr.status IN ('Approved', 'Completed')
    `;
    const donorsEngagedResult = await query(donorsEngagedQuery);
    const donorsEngaged = parseInt(donorsEngagedResult.rows[0].donors_engaged) || 0;

    // Beneficiaries Served - count of executed distribution plans
    const beneficiariesServedQuery = `
      SELECT COUNT(*) as beneficiaries_served
      FROM DistributionPlans 
      WHERE status = 'Completed'
    `;
    const beneficiariesServedResult = await query(beneficiariesServedQuery);
    const beneficiariesServed = parseInt(beneficiariesServedResult.rows[0].beneficiaries_served) || 0;

    res.json({
      success: true,
      data: {
        totalWorth: totalWorth,
        donorsEngaged: donorsEngaged,
        beneficiariesServed: beneficiariesServed
      }
    });

  } catch (error) {
    console.error('Error fetching staff KPI metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff KPI metrics',
      error: error.message
    });
  }
};

// Get user statistics for admin dashboard
const getAdminUserStatistics = async (req, res) => {
  try {
    // Total staff count
    const totalStaffQuery = `
      SELECT COUNT(*) as total_staff
      FROM Users u
      INNER JOIN Roles r ON u.role_id = r.role_id 
      WHERE r.role_name IN ('Resource Staff', 'Executive Admin')
    `;
    const totalStaffResult = await query(totalStaffQuery);
    const totalStaff = parseInt(totalStaffResult.rows[0].total_staff) || 0;

    // Active staff count (logged in within last 30 days)
    const activeStaffQuery = `
      SELECT COUNT(*) as active_staff
      FROM Users u
      INNER JOIN Roles r ON u.role_id = r.role_id 
      WHERE r.role_name IN ('Resource Staff', 'Executive Admin')
      AND u.last_login >= NOW() - INTERVAL '30 days'
    `;
    const activeStaffResult = await query(activeStaffQuery);
    const activeStaff = parseInt(activeStaffResult.rows[0].active_staff) || 0;

    // Total donors count
    const totalDonorsQuery = `
      SELECT COUNT(*) as total_donors
      FROM Users u
      INNER JOIN Roles r ON u.role_id = r.role_id 
      WHERE r.role_name = 'Donor'
    `;
    const totalDonorsResult = await query(totalDonorsQuery);
    const totalDonors = parseInt(totalDonorsResult.rows[0].total_donors) || 0;

    // Active donors count (made donations within last 30 days)
    const activeDonorsQuery = `
      SELECT COUNT(DISTINCT u.user_id) as active_donors
      FROM Users u
      INNER JOIN Roles r ON u.role_id = r.role_id
      INNER JOIN DonationRequests dr ON u.user_id = dr.user_id
      WHERE r.role_name = 'Donor'
      AND dr.created_at >= NOW() - INTERVAL '30 days'
    `;
    const activeDonorsResult = await query(activeDonorsQuery);
    const activeDonors = parseInt(activeDonorsResult.rows[0].active_donors) || 0;

    // Registered donors (approved donors)
    const registeredDonorsQuery = `
      SELECT COUNT(*) as registered_donors
      FROM Users u
      INNER JOIN Roles r ON u.role_id = r.role_id 
      WHERE r.role_name = 'Donor'
      AND u.is_approved = true
    `;
    const registeredDonorsResult = await query(registeredDonorsQuery);
    const registeredDonors = parseInt(registeredDonorsResult.rows[0].registered_donors) || 0;

    // Non-registered donors (pending approval)
    const nonRegisteredDonorsQuery = `
      SELECT COUNT(*) as non_registered_donors
      FROM Users u
      INNER JOIN Roles r ON u.role_id = r.role_id 
      WHERE r.role_name = 'Donor'
      AND u.is_approved = false
    `;
    const nonRegisteredDonorsResult = await query(nonRegisteredDonorsQuery);
    const nonRegisteredDonors = parseInt(nonRegisteredDonorsResult.rows[0].non_registered_donors) || 0;

    res.json({
      success: true,
      data: {
        totalStaff: totalStaff,
        activeStaff: activeStaff,
        totalDonors: totalDonors,
        activeDonors: activeDonors,
        registeredDonors: registeredDonors,
        nonRegisteredDonors: nonRegisteredDonors
      }
    });

  } catch (error) {
    console.error('Error fetching admin user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin user statistics',
      error: error.message
    });
  }
};

// Get donation analytics for charts
const getDonationAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to 30 days

    // Daily donation trends
    const dailyTrendsQuery = `
      SELECT 
        DATE(dr.created_at) as date,
        COUNT(*) as donation_count,
        COALESCE(SUM(
          CASE 
            WHEN di.calculated_fmv > 0 THEN di.calculated_fmv
            ELSE di.quantity * di.declared_value
          END
        ), 0) as total_amount
      FROM DonationRequests dr
      LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
      WHERE dr.status IN ('Approved', 'Completed')
      AND dr.created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY DATE(dr.created_at)
      ORDER BY date DESC
    `;
    const dailyTrendsResult = await query(dailyTrendsQuery);

    // Donation by category/type
    const categoryQuery = `
      SELECT 
        ic.category_name,
        COUNT(*) as count,
        COALESCE(SUM(
          CASE 
            WHEN di.calculated_fmv > 0 THEN di.calculated_fmv
            ELSE di.quantity * di.declared_value
          END
        ), 0) as total_amount
      FROM DonationItems di
      INNER JOIN DonationRequests dr ON di.donation_id = dr.donation_id
      INNER JOIN ItemType it ON di.itemtype_id = it.itemtype_id
      INNER JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
      WHERE dr.status IN ('Approved', 'Completed')
      AND dr.created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY ic.category_name
      ORDER BY total_amount DESC
    `;
    const categoryResult = await query(categoryQuery);

    // Top donors
    const topDonorsQuery = `
      SELECT 
        u.full_name,
        u.email,
        COUNT(dr.donation_id) as donation_count,
        COALESCE(SUM(
          CASE 
            WHEN di.calculated_fmv > 0 THEN di.calculated_fmv
            ELSE di.quantity * di.declared_value
          END
        ), 0) as total_donated
      FROM Users u
      INNER JOIN DonationRequests dr ON u.user_id = dr.user_id
      LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
      WHERE dr.status = 'Approved'
      AND dr.created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY u.user_id, u.full_name, u.email
      ORDER BY total_donated DESC
      LIMIT 10
    `;
    const topDonorsResult = await query(topDonorsQuery);

    res.json({
      success: true,
      data: {
        dailyTrends: dailyTrendsResult.rows,
        donationsByCategory: categoryResult.rows,
        topDonors: topDonorsResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching donation analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation analytics',
      error: error.message
    });
  }
};

// Get distribution analytics
const getDistributionAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to 30 days

    // Distribution trends
    const distributionTrendsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as plans_created,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as plans_executed,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as plans_approved,
        COUNT(CASE WHEN status = 'Draft' THEN 1 END) as plans_pending
      FROM DistributionPlans 
      WHERE created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const distributionTrendsResult = await query(distributionTrendsQuery);

    // Items distributed
    const itemsDistributedQuery = `
      SELECT 
        it.itemtype_name,
        SUM(dpi.quantity) as total_units_distributed,
        COUNT(dp.plan_id) as distribution_count
      FROM DistributionPlans dp
      INNER JOIN DistributionPlanItems dpi ON dp.plan_id = dpi.plan_id
      INNER JOIN Inventory inv ON dpi.inventory_id = inv.inventory_id
      INNER JOIN ItemType it ON inv.itemtype_id = it.itemtype_id
      WHERE dp.status = 'Completed'
      AND dp.created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY it.itemtype_id, it.itemtype_name
      ORDER BY total_units_distributed DESC
      LIMIT 10
    `;
    const itemsDistributedResult = await query(itemsDistributedQuery);

    // Location-wise distribution (by beneficiary location)
    const locationDistributionQuery = `
      SELECT 
        b.address as location_name,
        COUNT(dp.plan_id) as distribution_count,
        SUM(dpi.quantity) as total_units
      FROM DistributionPlans dp
      INNER JOIN BeneficiaryRequests br ON dp.request_id = br.request_id
      INNER JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
      LEFT JOIN DistributionPlanItems dpi ON dp.plan_id = dpi.plan_id
      WHERE dp.status = 'Completed'
      AND dp.created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY b.beneficiary_id, b.address
      ORDER BY distribution_count DESC
      LIMIT 10
    `;
    const locationDistributionResult = await query(locationDistributionQuery);

    res.json({
      success: true,
      data: {
        distributionTrends: distributionTrendsResult.rows,
        itemsDistributed: itemsDistributedResult.rows,
        locationDistribution: locationDistributionResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching distribution analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch distribution analytics',
      error: error.message
    });
  }
};

export {
  getStaffKPIMetrics,
  getAdminUserStatistics,
  getDonationAnalytics,
  getDistributionAnalytics
};