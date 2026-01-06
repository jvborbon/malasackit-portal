import bcrypt from 'bcrypt';
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

const organizations = [
  'Krispy Kreme',
  'Jollibee Group Foundation',
  'Odyssey Foundation, Inc.',
  'Bahay ng Diyos Foundation, Inc.',
  'CWL Lipa',
  'Lady Fatima Montessori School',
  'Holy Family Montessori of San Jose',
  'LCC Silvercrest - SSG',
  'De La Salle Lipa',
  'El Shaddai',
  'Minor Basilica of Immaculate Concepcion - Batangas City',
  'Parish of St. Anthony of Padua',
  'SM Lipa City',
  'Philippine Air Force - 441st Supply and Support Squadron',
  'BPI Batangas',
  'San Roque Parish - Lemery, Batangas',
  'Holy Trinity Parish - Batangas City',
  'Parish of Sto. Nino, Marawoy',
  'Saint Mary Euphrasia Parish - Batangas City',
  'Sta. Rita Parish - Batangas City'
];

const individuals = [
  'Geraldine Marasigan',
  'Erlinda Mendoza',
  'Dra. Teresita Gonzales',
  'Jun Gonzales',
  'Bro. Rene Lantin',
  'Joy Calibara',
  'John Nadores',
  'Mark Lester Patron'
];

function generateEmail(name) {
  // Convert name to email format: lowercase, remove special chars, replace spaces with dots
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    + '@donor.com';
}

async function generateDonors() {
  const client = await pool.connect();
  
  try {
    console.log('Starting donor generation...\n');
    
    // Default password for all donors
    const defaultPassword = 'Donor@2025';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    let successCount = 0;
    let skipCount = 0;
    
    // Insert organizations
    console.log('=== ORGANIZATIONS/BUSINESS FIRMS ===');
    for (const orgName of organizations) {
      const email = generateEmail(orgName);
      
      try {
        await client.query('BEGIN');
        
        // Check if email already exists
        const checkResult = await client.query(
          'SELECT user_id, full_name FROM Users WHERE email = $1',
          [email]
        );
        
        if (checkResult.rows.length > 0) {
          console.log(`⏭️  Skipped: ${orgName} (${email}) - already exists`);
          skipCount++;
          await client.query('ROLLBACK');
          continue;
        }
        
        // Generate user_id (format: USR followed by timestamp and random number)
        const userId = `USR${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        // Insert into Users table
        const userResult = await client.query(
          `INSERT INTO Users (user_id, full_name, email, is_approved, role_id, account_type)
           VALUES ($1, $2, $3, TRUE, (SELECT role_id FROM roles WHERE role_name = 'donor'), 'ORGANIZATION')
           RETURNING user_id, full_name, email`,
          [userId, orgName, email]
        );
        
        // Insert into Login_Credentials table
        await client.query(
          `INSERT INTO Login_Credentials (user_id, password_hash)
           VALUES ($1, $2)`,
          [userId, hashedPassword]
        );
        
        await client.query('COMMIT');
        console.log(`✅ Created: ${userResult.rows[0].full_name} (${userResult.rows[0].email})`);
        successCount++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error creating ${orgName}:`, error.message);
      }
    }
    
    // Insert individuals
    console.log('\n=== INDIVIDUALS ===');
    for (const individualName of individuals) {
      const email = generateEmail(individualName);
      
      try {
        await client.query('BEGIN');
        
        // Check if email already exists
        const checkResult = await client.query(
          'SELECT user_id, full_name FROM Users WHERE email = $1',
          [email]
        );
        
        if (checkResult.rows.length > 0) {
          console.log(`⏭️  Skipped: ${individualName} (${email}) - already exists`);
          skipCount++;
          await client.query('ROLLBACK');
          continue;
        }
        
        // Generate user_id
        const userId = `USR${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        // Insert into Users table
        const userResult = await client.query(
          `INSERT INTO Users (user_id, full_name, email, is_approved, role_id, account_type)
           VALUES ($1, $2, $3, TRUE, (SELECT role_id FROM roles WHERE role_name = 'donor'), 'INDIVIDUAL')
           RETURNING user_id, full_name, email`,
          [userId, individualName, email]
        );
        
        // Insert into Login_Credentials table
        await client.query(
          `INSERT INTO Login_Credentials (user_id, password_hash)
           VALUES ($1, $2)`,
          [userId, hashedPassword]
        );
        
        await client.query('COMMIT');
        console.log(`✅ Created: ${userResult.rows[0].full_name} (${userResult.rows[0].email})`);
        successCount++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error creating ${individualName}:`, error.message);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`✅ Successfully created: ${successCount} donors`);
    console.log(`⏭️  Skipped (already exist): ${skipCount} donors`);
    console.log(`📊 Total processed: ${successCount + skipCount} donors`);
    console.log(`\n🔑 Default password for all donors: ${defaultPassword}`);
    
  } catch (error) {
    console.error('Error generating donors:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\n✅ Script completed');
  }
}

generateDonors();
