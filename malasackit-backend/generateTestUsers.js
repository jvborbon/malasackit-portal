import { hashPassword } from './src/services/services_utils/passwordHashing.js';
import { query } from './src/db.js';

// Sample realistic user data
const testUsers = [
    // Executive Admins
    {
        user_id: 'EXEC_001',
        full_name: 'Maria Santos-Cruz',
        email: 'maria.santos@malasackit.org',
        password: 'Maria@2024!',
        account_type: 'INDIVIDUAL',
        role: 'Executive Admin',
        parish: 'St. Sebastian Cathedral',
        vicariate: 'Vicariate of St. Sebastian'
    },
    {
        user_id: 'EXEC_002', 
        full_name: 'Father Miguel Rodriguez',
        email: 'fr.miguel@malasackit.org',
        password: 'FrMiguel123!',
        account_type: 'INDIVIDUAL',
        role: 'Executive Admin',
        parish: 'Basilica of St. Martin de Tours', 
        vicariate: 'Vicariate of Our Lady of Caysasay'
    },

    // Resource Staff
    {
        user_id: 'STAFF_001',
        full_name: 'Juan dela Cruz',
        email: 'juan.delacruz@malasackit.org',
        password: 'Juan2024@',
        account_type: 'INDIVIDUAL',
        role: 'Resource Staff',
        parish: 'St. Francis Xavier Parish',
        vicariate: 'Vicariate of St. Francis Xavier'
    },
    {
        user_id: 'STAFF_002',
        full_name: 'Anna Marie Gonzales',
        email: 'anna.gonzales@malasackit.org', 
        password: 'Anna@Staff123',
        account_type: 'INDIVIDUAL',
        role: 'Resource Staff',
        parish: 'Immaculate Conception Parish',
        vicariate: 'Vicariate of Immaculate Conception'
    },
    {
        user_id: 'STAFF_003',
        full_name: 'Roberto Villanueva',
        email: 'roberto.v@malasackit.org',
        password: 'Roberto#2024',
        account_type: 'INDIVIDUAL', 
        role: 'Resource Staff',
        parish: 'St. Roche Parish',
        vicariate: 'Vicariate of St. Roche'
    },

    // Individual Donors
    {
        user_id: 'DONOR_001',
        full_name: 'Catherine Reyes',
        email: 'catherine.reyes@gmail.com',
        password: 'Cathy123!',
        account_type: 'INDIVIDUAL',
        role: 'Donor',
        parish: 'St. Francis Xavier Parish',
        vicariate: 'Vicariate of St. Francis Xavier'
    },
    {
        user_id: 'DONOR_002',
        full_name: 'Benjamin Castro',
        email: 'ben.castro@yahoo.com',
        password: 'Ben@Donor2024',
        account_type: 'INDIVIDUAL',
        role: 'Donor',
        parish: 'Basilica of the Immaculate Conception',
        vicariate: 'Vicariate of Sto. Niño'
    },
    {
        user_id: 'DONOR_003',
        full_name: 'Lisa Marie Fernandez',
        email: 'lisa.fernandez@gmail.com',
        password: 'Lisa#2024!',
        account_type: 'INDIVIDUAL',
        role: 'Donor',
        parish: 'St. Michael the Archangel',
        vicariate: 'Vicariate of St. Michael the Archangel'
    },

    // Organization Donors
    {
        user_id: 'ORG_001',
        full_name: 'Batangas Medical Center Foundation',
        email: 'donations@bmcfoundation.org',
        password: 'BMC@Foundation2024',
        account_type: 'ORGANIZATION',
        role: 'Donor',
        parish: 'St. Sebastian Cathedral',
        vicariate: 'Vicariate of St. Sebastian'
    },
    {
        user_id: 'ORG_002',
        full_name: 'Taal Rotary Club',
        email: 'secretary@taalrotary.org',
        password: 'TaalRotary#2024',
        account_type: 'ORGANIZATION', 
        role: 'Donor',
        parish: 'Basilica of St. Martin de Tours',
        vicariate: 'Vicariate of Our Lady of Caysasay'
    },
    {
        user_id: 'ORG_003',
        full_name: 'UP Los Baños Alumni Association Batangas',
        email: 'uplb.batangas@gmail.com',
        password: 'UPLB@Bat2024!',
        account_type: 'ORGANIZATION',
        role: 'Donor', 
        parish: 'St. Joseph the Patriarch Parish',
        vicariate: 'Vicariate of St. Joseph the Patriarch'
    }
];

const generateTestUsers = async () => {
    try {
        console.log('🔐 Generating password hashes and SQL statements...\n');
        
        // First, get role IDs, parish IDs, and vicariate IDs
        const rolesResult = await query('SELECT role_id, role_name FROM Roles');
        const parishesResult = await query('SELECT parish_id, parish_name FROM Parishes');  
        const vicariatesResult = await query('SELECT vicariate_id, vicariate_name FROM Vicariates');
        
        const roleMap = {};
        rolesResult.rows.forEach(role => {
            roleMap[role.role_name] = role.role_id;
        });
        
        const parishMap = {};
        parishesResult.rows.forEach(parish => {
            parishMap[parish.parish_name] = parish.parish_id;
        });
        
        const vicariateMap = {};
        vicariatesResult.rows.forEach(vicariate => {
            vicariateMap[vicariate.vicariate_name] = vicariate.vicariate_id;
        });

        console.log('📝 **COPY THESE SQL STATEMENTS TO POPULATE YOUR DATABASE:**\n');
        console.log('-- ====================================================');
        console.log('-- USERS TABLE INSERTS');
        console.log('-- ====================================================\n');
        
        let userInserts = [];
        let credentialInserts = [];
        
        for (const user of testUsers) {
            const hashedPassword = await hashPassword(user.password);
            const roleId = roleMap[user.role];
            const parishId = parishMap[user.parish];
            const vicariateId = vicariateMap[user.vicariate];
            
            // User insert statement
            const userInsert = `INSERT INTO Users (
    user_id, full_name, email, account_type, role_id, status, 
    parish_id, vicariate_id, is_approved, email_verified, created_at
) VALUES (
    '${user.user_id}', 
    '${user.full_name}', 
    '${user.email}', 
    '${user.account_type}', 
    ${roleId}, 
    'active', 
    ${parishId}, 
    ${vicariateId}, 
    true, 
    true, 
    CURRENT_TIMESTAMP
);`;

            // Credential insert statement  
            const credentialInsert = `INSERT INTO Login_Credentials (user_id, password_hash, login_attempts) VALUES (
    '${user.user_id}', 
    '${hashedPassword}', 
    0
);`;

            userInserts.push(userInsert);
            credentialInserts.push(credentialInsert);
            
            console.log(`-- ${user.role}: ${user.full_name}`);
            console.log(`-- Email: ${user.email} | Password: ${user.password}`);
            console.log(userInsert);
            console.log('');
        }
        
        console.log('\n-- ====================================================');
        console.log('-- LOGIN_CREDENTIALS TABLE INSERTS');
        console.log('-- ====================================================\n');
        
        credentialInserts.forEach(insert => {
            console.log(insert);
            console.log('');
        });
        
        console.log('\n-- ====================================================');
        console.log('-- TEST CREDENTIALS SUMMARY');
        console.log('-- ====================================================\n');
        
        testUsers.forEach(user => {
            console.log(`${user.role.padEnd(15)} | ${user.email.padEnd(35)} | ${user.password}`);
        });
        
        console.log('\n✅ **SQL statements generated successfully!**');
        console.log('\n📋 **Next Steps:**');
        console.log('1. Copy the SQL INSERT statements above');
        console.log('2. Run them in your PostgreSQL database');
        console.log('3. Test login with any of the email/password combinations');
        console.log('4. All users are pre-approved and email-verified for immediate use\n');
        
    } catch (error) {
        console.error('❌ Error generating test users:', error);
    } finally {
        process.exit(0);
    }
};

generateTestUsers();