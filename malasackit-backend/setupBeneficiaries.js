import { query } from './src/db.js';

const setupBeneficiaryTables = async () => {
    try {
        console.log('🚀 Setting up beneficiary tables...');
        
        // Create Beneficiaries table
        await query(`
            CREATE TABLE IF NOT EXISTS Beneficiaries (
                beneficiary_id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                type VARCHAR(50),
                contact_person VARCHAR(100),
                email VARCHAR(100),
                phone VARCHAR(50),
                address TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Beneficiaries table created');
        
        // Create BeneficiaryRequests table
        await query(`
            CREATE TABLE IF NOT EXISTS BeneficiaryRequests (
                request_id SERIAL PRIMARY KEY,
                beneficiary_id INT REFERENCES Beneficiaries(beneficiary_id),
                requested_items JSONB NOT NULL,
                request_reason TEXT,
                urgency VARCHAR(20) DEFAULT 'Medium' CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')),
                status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled')),
                requested_by INT REFERENCES Users(user_id),
                reviewed_by INT REFERENCES Users(user_id),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ BeneficiaryRequests table created');
        
        // Add some sample data
        await query(`
            INSERT INTO Beneficiaries (name, type, contact_person, email, phone, address, notes) 
            VALUES 
                ('St. Mary Parish', 'Organization', 'Father John Smith', 'father.john@stmary.org', '+63 912 345 6789', '123 Church St, Manila', 'Main parish in the area'),
                ('Rodriguez Family', 'Family', 'Maria Rodriguez', 'maria.rodriguez@email.com', '+63 923 456 7890', '456 Barangay Rd, Quezon City', 'Family of 5 members'),
                ('Community Center Tondo', 'Organization', 'Sister Agnes', 'agnes@tondo-center.org', '+63 934 567 8901', '789 Community Ave, Tondo, Manila', 'Serves 200+ families')
            ON CONFLICT DO NOTHING
        `);
        console.log('✅ Sample data added');
        
        // Verify setup
        const count = await query('SELECT COUNT(*) as count FROM Beneficiaries');
        console.log(`📊 Total beneficiaries: ${count.rows[0].count}`);
        
        console.log('🎉 Beneficiary system setup complete!');
        console.log('Now try refreshing your Beneficiary Management page - the 500 errors should be fixed!');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    }
};

setupBeneficiaryTables();