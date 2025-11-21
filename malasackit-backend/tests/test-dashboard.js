import { query } from '../src/db.js';

async function checkDashboardData() {
  try {
    console.log('=== TESTING DASHBOARD QUERIES ===');
    
    // Test total worth query with updated logic
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
    console.log('Total Worth Result:', totalWorthResult.rows[0]);
    
    // Test donors engaged query
    const donorsEngagedQuery = `
      SELECT COUNT(DISTINCT dr.user_id) as donors_engaged
      FROM DonationRequests dr 
      WHERE dr.status IN ('Approved', 'Completed')
    `;
    
    const donorsEngagedResult = await query(donorsEngagedQuery);
    console.log('Donors Engaged Result:', donorsEngagedResult.rows[0]);
    
    // Check sample donation items
    const sampleItemsQuery = `
      SELECT di.calculated_fmv, di.declared_value, di.quantity, dr.status
      FROM DonationItems di
      INNER JOIN DonationRequests dr ON di.donation_id = dr.donation_id
      WHERE dr.status IN ('Approved', 'Completed')
      LIMIT 5
    `;
    
    const sampleItems = await query(sampleItemsQuery);
    console.log('Sample Items:', sampleItems.rows);
    
    // Test alternative calculations
    const totalValueQuery = `
      SELECT 
        COALESCE(SUM(di.calculated_fmv), 0) as total_calculated_fmv,
        COALESCE(SUM(di.declared_value), 0) as total_declared_value,
        COALESCE(SUM(di.quantity * di.declared_value), 0) as total_quantity_times_value
      FROM DonationItems di
      INNER JOIN DonationRequests dr ON di.donation_id = dr.donation_id
      WHERE dr.status IN ('Approved', 'Completed')
    `;
    
    const valueResult = await query(totalValueQuery);
    console.log('Value comparison:', valueResult.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDashboardData();