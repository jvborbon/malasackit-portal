import { query } from './src/db.js';

async function checkLocationData() {
  try {
    console.log('🏢 Checking Location Data in Database...\n');

    // Check regions
    console.log('📍 REGIONS:');
    const regions = await query('SELECT region_id, region_name FROM table_region ORDER BY region_name LIMIT 10');
    if (regions.rows.length > 0) {
      regions.rows.forEach(row => {
        console.log(`  ID: ${row.region_id} - ${row.region_name}`);
      });
      console.log(`  Total regions: ${regions.rowCount}\n`);
    } else {
      console.log('  No regions found in database\n');
    }

    // Check provinces  
    console.log('🏛️ PROVINCES (sample from first region):');
    const provinces = await query(`
      SELECT p.province_id, p.province_name, p.region_id, r.region_name 
      FROM table_province p 
      LEFT JOIN table_region r ON p.region_id = r.region_id 
      ORDER BY r.region_name, p.province_name 
      LIMIT 10
    `);
    if (provinces.rows.length > 0) {
      provinces.rows.forEach(row => {
        console.log(`  ID: ${row.province_id} - ${row.province_name} (${row.region_name})`);
      });
      console.log(`  Total provinces: ${provinces.rowCount}\n`);
    } else {
      console.log('  No provinces found in database\n');
    }

    // Check municipalities
    console.log('🏙️ MUNICIPALITIES (sample):');
    const municipalities = await query(`
      SELECT m.municipality_id, m.municipality_name, m.province_id, p.province_name 
      FROM table_municipality m 
      LEFT JOIN table_province p ON m.province_id = p.province_id 
      ORDER BY p.province_name, m.municipality_name 
      LIMIT 10
    `);
    if (municipalities.rows.length > 0) {
      municipalities.rows.forEach(row => {
        console.log(`  ID: ${row.municipality_id} - ${row.municipality_name} (${row.province_name})`);
      });
      console.log(`  Total municipalities: ${municipalities.rowCount}\n`);
    } else {
      console.log('  No municipalities found in database\n');
    }

    // Check barangays
    console.log('🏘️ BARANGAYS (sample):');
    const barangays = await query(`
      SELECT b.barangay_id, b.barangay_name, b.municipality_id, m.municipality_name 
      FROM table_barangay b 
      LEFT JOIN table_municipality m ON b.municipality_id = m.municipality_id 
      ORDER BY m.municipality_name, b.barangay_name 
      LIMIT 15
    `);
    if (barangays.rows.length > 0) {
      barangays.rows.forEach(row => {
        console.log(`  ID: ${row.barangay_id} - ${row.barangay_name} (${row.municipality_name})`);
      });
      console.log(`  Total barangays: ${barangays.rowCount}\n`);
    } else {
      console.log('  No barangays found in database\n');
    }

    // Check if any users already exist with location data
    console.log('👥 EXISTING USERS WITH LOCATION DATA:');
    const users = await query(`
      SELECT u.user_id, u.full_name, u.region_id, u.province_id, u.municipality_id, u.barangay_id,
             r.region_name, p.province_name, m.municipality_name, b.barangay_name
      FROM Users u
      LEFT JOIN table_region r ON u.region_id = r.region_id
      LEFT JOIN table_province p ON u.province_id = p.province_id  
      LEFT JOIN table_municipality m ON u.municipality_id = m.municipality_id
      LEFT JOIN table_barangay b ON u.barangay_id = b.barangay_id
      LIMIT 5
    `);
    if (users.rows.length > 0) {
      users.rows.forEach(row => {
        console.log(`  ${row.full_name}:`);
        console.log(`    Region: ${row.region_name || 'Not set'} (ID: ${row.region_id || 'NULL'})`);
        console.log(`    Province: ${row.province_name || 'Not set'} (ID: ${row.province_id || 'NULL'})`);
        console.log(`    Municipality: ${row.municipality_name || 'Not set'} (ID: ${row.municipality_id || 'NULL'})`);
        console.log(`    Barangay: ${row.barangay_name || 'Not set'} (ID: ${row.barangay_id || 'NULL'})`);
        console.log('');
      });
    } else {
      console.log('  No users found in database\n');
    }

    // Get some random location combinations for realistic address generation
    console.log('🎯 SUGGESTED LOCATION COMBINATIONS FOR TEST DATA:');
    const locationCombos = await query(`
      SELECT 
        r.region_id, r.region_name,
        p.province_id, p.province_name,
        m.municipality_id, m.municipality_name,
        b.barangay_id, b.barangay_name
      FROM table_region r
      JOIN table_province p ON r.region_id = p.region_id
      JOIN table_municipality m ON p.province_id = m.province_id  
      JOIN table_barangay b ON m.municipality_id = b.municipality_id
      ORDER BY RANDOM()
      LIMIT 10
    `);
    
    if (locationCombos.rows.length > 0) {
      locationCombos.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.barangay_name}, ${row.municipality_name}, ${row.province_name}, ${row.region_name}`);
        console.log(`     IDs: Region(${row.region_id}), Province(${row.province_id}), Municipality(${row.municipality_id}), Barangay(${row.barangay_id})`);
      });
    } else {
      console.log('  No complete location hierarchy found');
    }

  } catch (error) {
    console.error('❌ Error checking location data:', error);
  } finally {
    process.exit(0);
  }
}

checkLocationData();