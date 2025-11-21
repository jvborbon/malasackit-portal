import { query } from './src/db.js';

async function investigateValueDifference() {
  try {
    console.log('=== INVESTIGATING VALUE DIFFERENCE ===\n');
    
    // 1. Dashboard calculation (what we see: ₱25,033.75)
    console.log('1. DASHBOARD CALCULATION:');
    const dashboardQuery = `
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
    const dashboardResult = await query(dashboardQuery);
    console.log('Dashboard Total:', dashboardResult.rows[0]);
    
    // 2. Inventory calculation (what we see: ₱33,285.00)
    console.log('\n2. INVENTORY CALCULATION:');
    const inventoryQuery = `
      SELECT COALESCE(SUM(total_fmv_value), 0) as total_inventory_value
      FROM Inventory
    `;
    const inventoryResult = await query(inventoryQuery);
    console.log('Inventory Total:', inventoryResult.rows[0]);
    
    // 3. Check all donation items (regardless of status)
    console.log('\n3. ALL DONATION ITEMS (regardless of status):');
    const allDonationsQuery = `
      SELECT 
        dr.status,
        COUNT(di.item_id) as item_count,
        COALESCE(SUM(di.quantity * di.declared_value), 0) as total_value
      FROM DonationRequests dr
      LEFT JOIN DonationItems di ON dr.donation_id = di.donation_id
      GROUP BY dr.status
      ORDER BY dr.status
    `;
    const allDonationsResult = await query(allDonationsQuery);
    console.log('By Status:', allDonationsResult.rows);
    
    // 4. Check inventory items breakdown
    console.log('\n4. INVENTORY BREAKDOWN:');
    const inventoryBreakdownQuery = `
      SELECT 
        it.itemtype_name,
        inv.quantity_available,
        inv.total_fmv_value,
        inv.status
      FROM Inventory inv
      LEFT JOIN ItemType it ON inv.itemtype_id = it.itemtype_id
      ORDER BY inv.total_fmv_value DESC
    `;
    const inventoryBreakdown = await query(inventoryBreakdownQuery);
    console.log('Inventory Items:', inventoryBreakdown.rows);
    
    // 5. Check the relationship between donations and inventory
    console.log('\n5. DONATION TO INVENTORY RELATIONSHIP:');
    const relationshipQuery = `
      SELECT 
        'Donations' as source,
        COALESCE(SUM(di.quantity * di.declared_value), 0) as total_value
      FROM DonationItems di
      INNER JOIN DonationRequests dr ON di.donation_id = dr.donation_id
      WHERE dr.status IN ('Approved', 'Completed')
      
      UNION ALL
      
      SELECT 
        'Inventory' as source,
        COALESCE(SUM(total_fmv_value), 0) as total_value
      FROM Inventory
    `;
    const relationshipResult = await query(relationshipQuery);
    console.log('Source Comparison:', relationshipResult.rows);
    
    // Calculate the difference
    const dashboardTotal = parseFloat(dashboardResult.rows[0].total_worth);
    const inventoryTotal = parseFloat(inventoryResult.rows[0].total_inventory_value);
    const difference = inventoryTotal - dashboardTotal;
    
    console.log('\n=== SUMMARY ===');
    console.log(`Dashboard Total: ₱${dashboardTotal.toLocaleString()}`);
    console.log(`Inventory Total: ₱${inventoryTotal.toLocaleString()}`);
    console.log(`Difference: ₱${difference.toLocaleString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

investigateValueDifference();