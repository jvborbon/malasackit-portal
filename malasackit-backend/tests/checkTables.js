import { query } from '../src/db.js';

const checkBeneficiaryTables = async () => {
    try {
        console.log('Checking if Beneficiaries and BeneficiaryRequests tables exist...');
        
        // Check Beneficiaries table
        const beneficiaryTableCheck = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'beneficiaries'
        `);
        
        if (beneficiaryTableCheck.rows.length > 0) {
            console.log('✅ Beneficiaries table exists');
        } else {
            console.log('❌ Beneficiaries table NOT FOUND');
            console.log('This is likely causing the 500 errors!');
        }
        
        // Check BeneficiaryRequests table
        const beneficiaryRequestsCheck = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'beneficiaryrequests'
        `);
        
        if (beneficiaryRequestsCheck.rows.length > 0) {
            console.log('✅ BeneficiaryRequests table exists');
        } else {
            console.log('❌ BeneficiaryRequests table NOT FOUND');
        }

        // List all tables to see what we have
        console.log('\n📋 All tables in database:');
        const allTables = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        allTables.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
    } catch (error) {
        console.error('❌ Error checking tables:', error.message);
    }
};

checkBeneficiaryTables();