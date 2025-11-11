-- Initialize Inventory table and add sample data for testing
-- This script should be run if the Inventory table doesn't exist or needs sample data

-- First, let's make sure the Inventory table exists
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

-- Add some sample inventory data for testing
-- Note: This assumes ItemType records already exist

-- Insert sample inventory items (adjust itemtype_id values based on your actual ItemType data)
INSERT INTO Inventory (itemtype_id, quantity_available, total_fmv_value, location, status) VALUES
-- Food Items
(1, 50, 2500.00, 'LASAC Warehouse - Section A', 'Available'),  -- Canned Goods
(2, 200, 10000.00, 'LASAC Warehouse - Section A', 'Available'), -- Rice
(3, 30, 900.00, 'LASAC Warehouse - Section A', 'Available'),   -- Noodles
(4, 5, 500.00, 'LASAC Warehouse - Section A', 'Low Stock'),    -- Cooking Oil
(12, 25, 750.00, 'LASAC Warehouse - Section A', 'Available'),  -- Pasta

-- Household Essentials
(15, 40, 800.00, 'LASAC Warehouse - Section B', 'Available'),  -- Soap
(16, 20, 600.00, 'LASAC Warehouse - Section B', 'Available'),  -- Shampoo
(17, 8, 240.00, 'LASAC Warehouse - Section B', 'Low Stock'),   -- Toothpaste
(19, 100, 500.00, 'LASAC Warehouse - Section B', 'Available'), -- Toilet Paper

-- Clothing
(28, 15, 1500.00, 'LASAC Warehouse - Section C', 'Available'), -- T-Shirts
(29, 12, 1800.00, 'LASAC Warehouse - Section C', 'Available'), -- Pants
(32, 8, 400.00, 'LASAC Warehouse - Section C', 'Low Stock'),   -- Socks

-- Educational Materials
(43, 80, 400.00, 'LASAC Warehouse - Section D', 'Available'),  -- Notebooks
(44, 50, 250.00, 'LASAC Warehouse - Section D', 'Available'),  -- Pens
(45, 30, 150.00, 'LASAC Warehouse - Section D', 'Available'),  -- Pencils

-- Kitchen Utensils
(54, 25, 2500.00, 'LASAC Warehouse - Section E', 'Available'), -- Plates
(55, 20, 1000.00, 'LASAC Warehouse - Section E', 'Available'), -- Cups
(58, 10, 2000.00, 'LASAC Warehouse - Section E', 'Available')  -- Cooking Pots
ON CONFLICT (inventory_id) DO NOTHING;

-- Update FMV values in ItemType if they don't exist
UPDATE ItemType SET fmv_value = 50.00 WHERE itemtype_name = 'Canned Goods' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 50.00 WHERE itemtype_name = 'Rice' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 30.00 WHERE itemtype_name = 'Noodles' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 100.00 WHERE itemtype_name = 'Cooking Oil' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 30.00 WHERE itemtype_name = 'Pasta' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 20.00 WHERE itemtype_name = 'Soap' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 30.00 WHERE itemtype_name = 'Shampoo' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 30.00 WHERE itemtype_name = 'Toothpaste' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 5.00 WHERE itemtype_name = 'Toilet Paper' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 100.00 WHERE itemtype_name = 'T-Shirts' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 150.00 WHERE itemtype_name = 'Pants' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 50.00 WHERE itemtype_name = 'Socks' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 5.00 WHERE itemtype_name = 'Notebooks' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 5.00 WHERE itemtype_name = 'Pens' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 5.00 WHERE itemtype_name = 'Pencils' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 100.00 WHERE itemtype_name = 'Plates' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 50.00 WHERE itemtype_name = 'Cups' AND fmv_value IS NULL;
UPDATE ItemType SET fmv_value = 200.00 WHERE itemtype_name = 'Cooking Pots' AND fmv_value IS NULL;

-- Verify the data
SELECT 
    i.inventory_id,
    i.quantity_available,
    i.total_fmv_value,
    i.status,
    it.itemtype_name,
    ic.category_name
FROM Inventory i
JOIN ItemType it ON i.itemtype_id = it.itemtype_id
JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
ORDER BY ic.category_name, it.itemtype_name;