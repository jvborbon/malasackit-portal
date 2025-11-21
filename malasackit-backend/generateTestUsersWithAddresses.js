import { hashPassword } from './src/services/services_utils/passwordHashing.js';
import { query } from './src/db.js';

const generateTestUsersWithAddresses = async () => {
    try {
        console.log('🔐 Generating Test Users with Realistic Filipino Addresses...\n');

        // First, let's get some real location data from the database - Focus on Batangas Province only
        console.log('📍 Fetching realistic Batangas location combinations...');
        const locationData = await query(`
            SELECT 
                r.region_id, r.region_name,
                p.province_id, p.province_name,
                m.municipality_id, m.municipality_name,
                b.barangay_id, b.barangay_name
            FROM table_region r
            JOIN table_province p ON r.region_id = p.region_id
            JOIN table_municipality m ON p.province_id = m.province_id  
            JOIN table_barangay b ON m.municipality_id = b.municipality_id
            WHERE p.province_name = 'Batangas'
            ORDER BY RANDOM()
            LIMIT 20
        `);

        const locations = locationData.rows;
        console.log(`✅ Found ${locations.length} Batangas location combinations\n`);

        // Sample realistic user data with proper Filipino addresses
        const testUsers = [
            // Executive Admins
            {
                user_id: 'EXEC_001',
                full_name: 'Maria Santos-Cruz',
                email: 'maria.santos@malasackit.org',
                password: 'Maria@2024!',
                contact_num: '+63 917 123 4567',
                account_type: 'INDIVIDUAL',
                role: 'Executive Admin',
                parish: 'St. Sebastian Cathedral',
                vicariate: 'Vicariate of St. Sebastian',
                location_index: 0
            },
            {
                user_id: 'EXEC_002', 
                full_name: 'Father Miguel Rodriguez',
                email: 'fr.miguel@malasackit.org',
                password: 'FrMiguel123!',
                contact_num: '+63 925 987 6543',
                account_type: 'INDIVIDUAL',
                role: 'Executive Admin',
                parish: 'Basilica of St. Martin de Tours', 
                vicariate: 'Vicariate of Our Lady of Caysasay',
                location_index: 1
            },

            // Resource Staff
            {
                user_id: 'STAFF_001',
                full_name: 'Juan dela Cruz',
                email: 'juan.delacruz@malasackit.org',
                password: 'Juan2024@',
                contact_num: '+63 939 555 7890',
                account_type: 'INDIVIDUAL',
                role: 'Resource Staff',
                parish: 'St. Francis Xavier Parish',
                vicariate: 'Vicariate of St. Francis Xavier',
                location_index: 2
            },
            {
                user_id: 'STAFF_002',
                full_name: 'Anna Marie Gonzales',
                email: 'anna.gonzales@malasackit.org', 
                password: 'Anna@Staff123',
                contact_num: '+63 916 444 5555',
                account_type: 'INDIVIDUAL',
                role: 'Resource Staff',
                parish: 'Immaculate Conception Parish',
                vicariate: 'Vicariate of Immaculate Conception',
                location_index: 3
            },
            {
                user_id: 'STAFF_003',
                full_name: 'Roberto Villanueva',
                email: 'roberto.v@malasackit.org',
                password: 'Roberto#2024',
                contact_num: '+63 928 777 8888',
                account_type: 'INDIVIDUAL', 
                role: 'Resource Staff',
                parish: 'St. Roche Parish',
                vicariate: 'Vicariate of St. Roche',
                location_index: 4
            },

            // Individual Donors
            {
                user_id: 'DONOR_001',
                full_name: 'Catherine Reyes',
                email: 'catherine.reyes@gmail.com',
                password: 'Cathy123!',
                contact_num: '+63 917 333 4444',
                account_type: 'INDIVIDUAL',
                role: 'Donor',
                parish: 'St. Francis Xavier Parish',
                vicariate: 'Vicariate of St. Francis Xavier',
                location_index: 5
            },
            {
                user_id: 'DONOR_002',
                full_name: 'Benjamin Castro',
                email: 'ben.castro@yahoo.com',
                password: 'Ben@Donor2024',
                contact_num: '+63 925 666 7777',
                account_type: 'INDIVIDUAL',
                role: 'Donor',
                parish: 'Basilica of the Immaculate Conception',
                vicariate: 'Vicariate of Sto. Niño',
                location_index: 6
            },
            {
                user_id: 'DONOR_003',
                full_name: 'Lisa Marie Fernandez',
                email: 'lisa.fernandez@gmail.com',
                password: 'Lisa#2024!',
                contact_num: '+63 939 888 9999',
                account_type: 'INDIVIDUAL',
                role: 'Donor',
                parish: 'St. Michael the Archangel',
                vicariate: 'Vicariate of St. Michael the Archangel',
                location_index: 7
            },

            // Organization Donors
            {
                user_id: 'ORG_001',
                full_name: 'Batangas Medical Center Foundation',
                email: 'donations@bmcfoundation.org',
                password: 'BMC@Foundation2024',
                contact_num: '+63 917 111 2222',
                account_type: 'ORGANIZATION',
                role: 'Donor',
                parish: 'St. Sebastian Cathedral',
                vicariate: 'Vicariate of St. Sebastian',
                location_index: 8
            },
            {
                user_id: 'ORG_002',
                full_name: 'Taal Rotary Club',
                email: 'secretary@taalrotary.org',
                password: 'TaalRotary#2024',
                contact_num: '+63 925 222 3333',
                account_type: 'ORGANIZATION', 
                role: 'Donor',
                parish: 'Basilica of St. Martin de Tours',
                vicariate: 'Vicariate of Our Lady of Caysasay',
                location_index: 9
            },
            {
                user_id: 'ORG_003',
                full_name: 'UP Los Baños Alumni Association Batangas',
                email: 'uplb.batangas@gmail.com',
                password: 'UPLB@Bat2024!',
                contact_num: '+63 916 333 4444',
                account_type: 'ORGANIZATION',
                role: 'Donor', 
                parish: 'St. Joseph the Patriarch Parish',
                vicariate: 'Vicariate of St. Joseph the Patriarch',
                location_index: 10
            },

            // Additional users for diversity
            {
                user_id: 'VOL_001',
                full_name: 'Dr. Sarah Jane Reyes',
                email: 'dr.sarah@hospital.ph',
                password: 'DrSarah@2024',
                contact_num: '+63 917 555 6666',
                account_type: 'INDIVIDUAL',
                role: 'Volunteer',
                parish: 'St. Joseph the Patriarch Parish',
                vicariate: 'Vicariate of St. Joseph the Patriarch',
                location_index: 11
            },
            {
                user_id: 'VOL_002',
                full_name: 'Engineer Mark Santos',
                email: 'mark.santos@engineering.ph',
                password: 'EngMark#123',
                contact_num: '+63 928 777 8888',
                account_type: 'INDIVIDUAL',
                role: 'Volunteer',
                parish: 'St. Michael the Archangel',
                vicariate: 'Vicariate of St. Michael the Archangel',
                location_index: 12
            }
        ];
        
        // Get role IDs, parish IDs, and vicariate IDs
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

        console.log('📝 **GENERATED TEST DATA WITH REALISTIC ADDRESSES:**\n');
        console.log('-- ====================================================');
        console.log('-- USERS TABLE INSERTS WITH COMPLETE ADDRESSES');
        console.log('-- ====================================================\n');
        
        let userInserts = [];
        let credentialInserts = [];
        
        for (let i = 0; i < testUsers.length; i++) {
            const user = testUsers[i];
            const location = locations[user.location_index] || locations[0]; // Fallback to first location
            const hashedPassword = await hashPassword(user.password);
            const roleId = roleMap[user.role];
            const parishId = parishMap[user.parish];
            const vicariateId = vicariateMap[user.vicariate];
            
            console.log(`👤 USER ${i + 1}: ${user.full_name}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   📱 Contact: ${user.contact_num}`);
            console.log(`   🔑 Password: ${user.password}`);
            console.log(`   👥 Role: ${user.role}`);
            console.log(`   🏢 Type: ${user.account_type}`);
            console.log(`   📍 Address: ${location.barangay_name}, ${location.municipality_name}, ${location.province_name}, ${location.region_name}`);
            console.log(`   🗺️  Location IDs: Region(${location.region_id}), Province(${location.province_id}), Municipality(${location.municipality_id}), Barangay(${location.barangay_id})`);
            console.log('');
            
            // User insert statement with complete address
            const userInsert = `INSERT INTO Users (
    user_id, full_name, email, contact_num, account_type, role_id, status, 
    region_id, province_id, municipality_id, barangay_id,
    parish_id, vicariate_id, email_verified, created_at
) VALUES (
    '${user.user_id}', 
    '${user.full_name}', 
    '${user.email}', 
    '${user.contact_num}',
    '${user.account_type}', 
    ${roleId}, 
    'active',
    ${location.region_id},
    ${location.province_id}, 
    ${location.municipality_id},
    ${location.barangay_id},
    ${parishId}, 
    ${vicariateId}, 
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
        
        console.log('\n🏠 **ADDITIONAL BATANGAS LOCATION COMBINATIONS AVAILABLE:**');
        console.log('Here are more realistic Batangas addresses from your database:');
        for (let i = testUsers.length; i < Math.min(locations.length, testUsers.length + 5); i++) {
            const loc = locations[i];
            console.log(`   ${i + 1}. ${loc.barangay_name}, ${loc.municipality_name}, ${loc.province_name}, ${loc.region_name}`);
            console.log(`      📍 IDs: Region(${loc.region_id}), Province(${loc.province_id}), Municipality(${loc.municipality_id}), Barangay(${loc.barangay_id})`);
        }
        console.log('');
        
        console.log('\n-- ====================================================');
        console.log('-- TEST CREDENTIALS SUMMARY');
        console.log('-- ====================================================\n');
        
        testUsers.forEach(user => {
            const location = locations[user.location_index] || locations[0];
            console.log(`${user.role.padEnd(15)} | ${user.email.padEnd(35)} | ${user.password.padEnd(20)} | ${location.municipality_name}, ${location.province_name}`);
        });
        
        console.log('\n✅ **Test user generation with realistic addresses complete!**');
        console.log('\n📋 **Next Steps:**');
        console.log('1. Copy the SQL INSERT statements above');
        console.log('2. Run them in your PostgreSQL database');
        console.log('3. Test login with any of the email/password combinations');
        console.log('4. All users have REAL Batangas addresses from your location tables');
        console.log('5. Users are distributed across different municipalities in Batangas Province');
        console.log('6. All location IDs are valid and reference existing database records\n');
        
    } catch (error) {
        console.error('❌ Error generating test users:', error);
    } finally {
        process.exit(0);
    }
};

generateTestUsersWithAddresses();