import bcrypt from 'bcrypt';
import { query, getClient } from '../db.js';

/**
 * Generate a simple memorable password for walk-in donors
 */
const generateWalkInPassword = (contactNumber) => {
  const currentYear = new Date().getFullYear();
  const lastFourDigits = contactNumber.slice(-4);
  return `Walk${lastFourDigits}${currentYear}`;
};

/**
 * Generate a temporary email for walk-in donors
 */
const generateTempEmail = (userId) => {
  return `${userId.toLowerCase()}@walkin.temp`;
};

/**
 * Create auto-account for walk-in donor
 */
const createWalkInAccount = async (donorInfo, createdByStaffId) => {
  try {
    // Generate user ID
    const timestamp = Date.now();
    const userId = `WALKIN_${timestamp}`;
    
    // Generate credentials
    const tempPassword = generateWalkInPassword(donorInfo.contact);
    const tempEmail = generateTempEmail(userId);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Get donor role ID
    const roleResult = await query(
      "SELECT role_id FROM Roles WHERE role_name = 'Donor'"
    );
    const donorRoleId = roleResult.rows[0].role_id;
    
    // Create user account
    const userQuery = `
      INSERT INTO Users (
        user_id, full_name, email, contact_num, account_type, 
        role_id, status, is_approved, email_verified, 
        is_walkin_generated, temp_email_generated, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `;
    
    const userResult = await query(userQuery, [
      userId,
      donorInfo.name,
      tempEmail,
      donorInfo.contact,
      'INDIVIDUAL',
      donorRoleId,
      'active',
      true, // auto-approved for walk-ins
      false, // email not verified
      true, // walk-in generated
      true // temp email generated
    ]);
    
    // Create login credentials
    const credentialQuery = `
      INSERT INTO Login_Credentials (user_id, password_hash)
      VALUES ($1, $2)
    `;
    
    await query(credentialQuery, [userId, hashedPassword]);
    
    // Log activity
    const activityQuery = `
      INSERT INTO UserActivityLogs (user_id, action, description)
      VALUES ($1, $2, $3)
    `;
    
    await query(activityQuery, [
      userId,
      'walk_in_account_created',
      `Walk-in account auto-created by staff ${createdByStaffId}`
    ]);
    
    return {
      user: userResult.rows[0],
      tempPassword: tempPassword,
      tempEmail: tempEmail
    };
    
  } catch (error) {
    console.error('Error creating walk-in account:', error);
    throw new Error('Failed to create walk-in account');
  }
};

/**
 * Create walk-in donation with auto-account
 */
const createWalkInDonation = async (donationData, staffUserId) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Create auto-account for donor
    const accountResult = await createWalkInAccount(donationData.donor, staffUserId);
    const donorUserId = accountResult.user.user_id;
    
    // Create a dummy appointment for walk-in donations (to satisfy NOT NULL constraint)
    const appointmentQuery = `
      INSERT INTO Appointments (
        appointment_date, appointment_time, status, remarks, description
      ) VALUES (CURRENT_DATE, CURRENT_TIME, 'Completed', 'Walk-in donation - no actual appointment', 'Walk-in Donation')
      RETURNING appointment_id
    `;
    
    const appointmentResult = await client.query(appointmentQuery);
    const appointmentId = appointmentResult.rows[0].appointment_id;
    
    // Create donation request
    const donationQuery = `
      INSERT INTO DonationRequests (
        user_id, status, notes, delivery_method, appointment_id,
        is_walkin
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const donationResult = await client.query(donationQuery, [
      donorUserId,
      'Completed', // walk-ins are immediately completed
      donationData.notes || 'Walk-in donation',
      'Walk-in',
      appointmentId, // use dummy appointment
      true
    ]);
    
    const donationId = donationResult.rows[0].donation_id;
    
    // Add donation items
    for (const item of donationData.items) {
      // Insert into DonationItems table
      const itemQuery = `
        INSERT INTO DonationItems (
          donation_id, itemtype_id, quantity, declared_value,
          description, selected_condition, date_added
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;
      
      await client.query(itemQuery, [
        donationId,
        item.itemtype_id,
        item.quantity,
        item.declared_value,
        item.description || '',
        item.condition || 'New'
      ]);

      // Add to inventory (walk-in donations are immediately received)
      // First check if inventory record exists
      const checkInventoryQuery = `
        SELECT inventory_id, quantity_available, total_fmv_value 
        FROM Inventory 
        WHERE itemtype_id = $1 AND location = $2
      `;
      
      const existingInventory = await client.query(checkInventoryQuery, [
        item.itemtype_id,
        'LASAC Warehouse'
      ]);
      
      if (existingInventory.rows.length > 0) {
        // Update existing inventory record
        const updateInventoryQuery = `
          UPDATE Inventory 
          SET quantity_available = quantity_available + $1,
              total_fmv_value = total_fmv_value + $2,
              last_updated = NOW(),
              status = CASE 
                WHEN quantity_available + $1 > 20 THEN 'Available'
                WHEN quantity_available + $1 > 5 THEN 'Low Stock'
                ELSE 'Low Stock'
              END
          WHERE inventory_id = $3
        `;
        
        await client.query(updateInventoryQuery, [
          item.quantity,
          item.declared_value * item.quantity,
          existingInventory.rows[0].inventory_id
        ]);
      } else {
        // Insert new inventory record
        const insertInventoryQuery = `
          INSERT INTO Inventory (
            itemtype_id, quantity_available, total_fmv_value, location, 
            last_updated, status
          ) VALUES ($1, $2, $3, $4, NOW(), $5)
        `;
        
        await client.query(insertInventoryQuery, [
          item.itemtype_id,
          item.quantity,
          item.declared_value * item.quantity,
          'LASAC Warehouse',
          item.quantity > 20 ? 'Available' : 'Low Stock'
        ]);
      }
    }
    
    await client.query('COMMIT');
    
    return {
      donation: donationResult.rows[0],
      donor: {
        user_id: accountResult.user.user_id,
        email: accountResult.user.email,
        temp_password: accountResult.tempPassword
      },
      account: accountResult,
      donorUserId: donorUserId
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating walk-in donation:', error);
    throw error;
  } finally {
    client.release();
  }
};

export {
  createWalkInAccount,
  createWalkInDonation,
  generateWalkInPassword
};