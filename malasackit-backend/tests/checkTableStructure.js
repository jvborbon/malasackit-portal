import { query } from '../src/db.js';

const checkTableStructure = async () => {
    try {
        console.log('🔍 Checking Users table structure...');
        
        const structureQuery = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `;
        
        const result = await query(structureQuery);
        
        console.log('\n📋 Users table columns:');
        result.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Also check for any role-related columns
        console.log('\n🔍 Looking for role-related columns...');
        const roleColumns = result.rows.filter(col => 
            col.column_name.toLowerCase().includes('role') || 
            col.column_name.toLowerCase().includes('rbac') ||
            col.column_name.toLowerCase().includes('permission')
        );
        
        if (roleColumns.length > 0) {
            console.log('📝 Role-related columns found:');
            roleColumns.forEach(col => {
                console.log(`- ${col.column_name}: ${col.data_type}`);
            });
        } else {
            console.log('❌ No obvious role-related columns found');
        }
        
        // Let's also check what the actual user data looks like
        console.log('\n👤 Sample user data:');
        const sampleQuery = 'SELECT * FROM Users LIMIT 1';
        const sampleResult = await query(sampleQuery);
        
        if (sampleResult.rows.length > 0) {
            const user = sampleResult.rows[0];
            console.log('Sample user fields:');
            Object.keys(user).forEach(key => {
                console.log(`- ${key}: ${user[key]}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking table structure:', error);
    }
};

await checkTableStructure();
process.exit(0);