import { query } from './src/db.js';
import fs from 'fs';

const createBeneficiaryTables = async () => {
    try {
        console.log('🚀 Creating Beneficiaries and BeneficiaryRequests tables...');
        
        // Read the SQL file
        const sql = fs.readFileSync('../create_beneficiary_tables.sql', 'utf8');
        
        // Split by semicolons and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim()) {
                await query(statement);
            }
        }
        
        console.log('✅ Successfully created beneficiary tables!');
        
        // Verify tables were created
        const beneficiaryCheck = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('beneficiaries', 'beneficiaryrequests')
            ORDER BY table_name
        `);
        
        console.log('📋 Created tables:');
        beneficiaryCheck.rows.forEach(row => {
            console.log(`  ✅ ${row.table_name}`);
        });
        
        // Check sample data
        const sampleCount = await query('SELECT COUNT(*) as count FROM Beneficiaries');
        console.log(`📊 Sample beneficiaries created: ${sampleCount.rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        console.error('Full error:', error);
    }
};

createBeneficiaryTables();