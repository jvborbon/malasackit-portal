-- ===============================================
-- CREATE BENEFICIARY TABLES FOR MALASACKIT PORTAL
-- ===============================================
-- This SQL creates the missing Beneficiaries and BeneficiaryRequests tables
-- Run this in your PostgreSQL client to fix the 500 errors

-- 1. Create Beneficiaries table
CREATE TABLE IF NOT EXISTS Beneficiaries (
    beneficiary_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50), -- Individual, Organization, Family
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create BeneficiaryRequests table
CREATE TABLE IF NOT EXISTS BeneficiaryRequests (
    request_id SERIAL PRIMARY KEY,
    beneficiary_id INT REFERENCES Beneficiaries(beneficiary_id),
    requested_items JSONB NOT NULL, -- Array of {itemtype_id, quantity, urgency}
    request_reason TEXT,
    urgency VARCHAR(20) DEFAULT 'Medium' CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled')),
    requested_by INT REFERENCES Users(user_id),
    reviewed_by INT REFERENCES Users(user_id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beneficiaries_type ON Beneficiaries(type);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_name ON Beneficiaries(name);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_status ON BeneficiaryRequests(status);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_urgency ON BeneficiaryRequests(urgency);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_beneficiary_id ON BeneficiaryRequests(beneficiary_id);

-- 4. Insert sample data for testing (remove ON CONFLICT if you want to see errors for duplicates)
INSERT INTO Beneficiaries (name, type, contact_person, email, phone, address, notes) VALUES
    ('St. Mary Parish', 'Organization', 'Father John Smith', 'father.john@stmary.org', '+63 912 345 6789', '123 Church St, Manila', 'Main parish in the area'),
    ('Rodriguez Family', 'Family', 'Maria Rodriguez', 'maria.rodriguez@email.com', '+63 923 456 7890', '456 Barangay Rd, Quezon City', 'Family of 5 members'),
    ('Community Center Tondo', 'Organization', 'Sister Agnes', 'agnes@tondo-center.org', '+63 934 567 8901', '789 Community Ave, Tondo, Manila', 'Serves 200+ families'),
    ('Individual - Juan Dela Cruz', 'Individual', 'Juan Dela Cruz', 'juan.delacruz@email.com', '+63 945 678 9012', '321 Residential St, Pasig City', 'Senior citizen, lives alone'),
    ('Barangay Bagumbayan', 'Organization', 'Captain Santos', 'captain@bgybagumbayan.gov.ph', '+63 956 789 0123', 'Barangay Hall, Bagumbayan', 'Represents 500+ households')
ON CONFLICT DO NOTHING;

-- 5. Verify creation
SELECT 'SUCCESS: Beneficiaries table created with ' || COUNT(*) || ' sample records!' as result FROM Beneficiaries;