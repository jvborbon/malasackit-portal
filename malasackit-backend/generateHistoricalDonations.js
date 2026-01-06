import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Helper to generate random date within a year
function randomDateInYear(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

// Helper to generate random appointment date 7-14 days after request
function appointmentDate(requestDate) {
  const date = new Date(requestDate);
  date.setDate(date.getDate() + Math.floor(Math.random() * 8) + 7);
  return date.toISOString();
}

// Helper to pick random items from array
function randomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate condition factor (0.1 to 1.0)
function randomCondition() {
  const conditions = [0.3, 0.5, 0.7, 0.8, 0.9, 1.0];
  return conditions[Math.floor(Math.random() * conditions.length)];
}

async function generateHistoricalDonations() {
  const client = await pool.connect();

  try {
    console.log('📅 Generating 4 years (2022-2025) of historical donation data...\n');

    await client.query('BEGIN');

    // Get all donors (exclude test donors)
    const donorsResult = await client.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.user_type
      FROM Users u
      WHERE u.user_type IN ('Individual Donor', 'Organization')
        AND u.first_name NOT ILIKE '%test%'
        AND u.last_name NOT ILIKE '%test%'
      ORDER BY u.user_id
    `);

    const donors = donorsResult.rows;
    console.log(`Found ${donors.length} real donors\n`);

    // Get all item types with their categories
    const itemTypesResult = await client.query(`
      SELECT it.itemtype_id, it.itemtype_name, it.avg_retail_price, 
             ic.category_name
      FROM ItemType it
      JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
      ORDER BY it.itemtype_id
    `);

    const itemTypes = itemTypesResult.rows;
    console.log(`Found ${itemTypes.length} item types\n`);

    if (donors.length === 0 || itemTypes.length === 0) {
      console.log('❌ No donors or item types found. Please seed donors and inventory first.');
      await client.query('ROLLBACK');
      return;
    }

    const years = [2022, 2023, 2024, 2025];
    let totalCreated = 0;

    for (const year of years) {
      console.log(`\n📆 Processing year ${year}...`);
      
      // Target 2-3 million per year
      const targetValue = 2000000 + Math.random() * 1000000;
      let yearValue = 0;
      let donationsThisYear = 0;

      // Generate donations until we reach target value
      while (yearValue < targetValue && donationsThisYear < 100) {
        // Pick random donor
        const donor = donors[Math.floor(Math.random() * donors.length)];

        // Pick 3-10 random items for this donation
        const numItems = Math.floor(Math.random() * 8) + 3;
        const donationItems = randomItems(itemTypes, numItems);

        // Create donation request
        const requestDate = randomDateInYear(year);
        const appointmentDateTime = appointmentDate(requestDate);

        const donationRequest = await client.query(`
          INSERT INTO DonationRequest (
            user_id, request_type, preferred_date, preferred_time,
            special_instructions, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING donationrequest_id
        `, [
          donor.user_id,
          'Drop-off',
          appointmentDateTime.split('T')[0],
          '10:00:00',
          `${year} donation - ${donor.first_name} ${donor.last_name}`,
          'Completed',
          requestDate
        ]);

        const requestId = donationRequest.rows[0].donationrequest_id;

        // Create appointment
        await client.query(`
          INSERT INTO Appointment (
            donationrequest_id, appointment_date, appointment_time,
            status, created_at
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          requestId,
          appointmentDateTime.split('T')[0],
          '10:00:00',
          'Completed',
          requestDate
        ]);

        // Calculate donation value and create items
        let donationValue = 0;
        const donationItemsData = [];

        for (const item of donationItems) {
          // Random quantity based on item type
          let quantity;
          if (item.avg_retail_price > 2000) {
            quantity = Math.floor(Math.random() * 10) + 1; // High value: 1-10
          } else if (item.avg_retail_price > 500) {
            quantity = Math.floor(Math.random() * 30) + 5; // Medium: 5-35
          } else {
            quantity = Math.floor(Math.random() * 100) + 20; // Low value: 20-120
          }

          const condition = randomCondition();
          const unitValue = item.avg_retail_price * condition;
          const totalValue = unitValue * quantity;
          
          donationValue += totalValue;

          donationItemsData.push({
            itemtype_id: item.itemtype_id,
            quantity,
            unitValue,
            totalValue
          });
        }

        // Create donation record
        const donation = await client.query(`
          INSERT INTO Donation (
            user_id, donationrequest_id, donation_type, donation_date,
            total_value, receipt_number, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING donation_id
        `, [
          donor.user_id,
          requestId,
          'In-Kind',
          appointmentDateTime.split('T')[0],
          donationValue,
          `REC-${year}-${String(donationsThisYear + 1).padStart(4, '0')}`,
          'Received',
          requestDate
        ]);

        const donationId = donation.rows[0].donation_id;

        // Insert donation items
        for (const itemData of donationItemsData) {
          await client.query(`
            INSERT INTO DonationItems (
              donation_id, itemtype_id, quantity, unit_value,
              total_value, item_condition, condition_factor
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            donationId,
            itemData.itemtype_id,
            itemData.quantity,
            itemData.unitValue,
            itemData.totalValue,
            'good',
            itemData.unitValue / itemTypes.find(it => it.itemtype_id === itemData.itemtype_id).avg_retail_price
          ]);
        }

        yearValue += donationValue;
        donationsThisYear++;
        totalCreated++;

        if (donationsThisYear % 10 === 0) {
          console.log(`  Created ${donationsThisYear} donations, value: ₱${yearValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        }
      }

      console.log(`✅ ${year}: Created ${donationsThisYear} donations, total value: ₱${yearValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    }

    await client.query('COMMIT');

    console.log('\n=== HISTORICAL DONATION GENERATION SUMMARY ===');
    console.log(`✅ Total donations created: ${totalCreated}`);
    console.log(`📅 Years covered: 2022-2025`);
    console.log(`💰 Target range: ₱2-3M per year`);
    console.log(`👥 Using ${donors.length} real donors`);
    console.log(`📦 Using ${itemTypes.length} item types`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error generating historical donations:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\n✅ Historical donation generation completed');
  }
}

generateHistoricalDonations();
