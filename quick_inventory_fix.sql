-- Quick fix: Create Inventory table and add minimal sample data
-- Run this in your PostgreSQL database

-- Create the inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS Inventory (
    inventory_id SERIAL PRIMARY KEY,
    itemtype_id INT REFERENCES ItemType(itemtype_id),
    quantity_available INT DEFAULT 0,
    total_fmv_value NUMERIC(12,2) DEFAULT 0.00,
    location VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Available'
        CHECK (status IN ('Available', 'Low Stock', 'No Stock', 'Reserved', 'Bazaar'))
);

-- Add a few sample inventory records to test with
-- First check if ItemType has records
INSERT INTO Inventory (itemtype_id, quantity_available, total_fmv_value, location, status) 
SELECT 
    it.itemtype_id,
    10 as quantity_available,
    (10 * COALESCE(it.fmv_value, 50.00)) as total_fmv_value,
    'LASAC Warehouse' as location,
    'Available' as status
FROM ItemType it
WHERE it.itemtype_id <= 10  -- Just first 10 items for testing
ON CONFLICT DO NOTHING;

-- Update FMV values if they are null
UPDATE ItemType SET fmv_value = 50.00 WHERE fmv_value IS NULL OR fmv_value = 0;