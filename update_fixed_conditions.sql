-- Update ItemType condition factors to implement fixed conditions
-- Items that should only be "New" will have other condition factors set to 0

-- Household Essentials / Personal Care (Hygiene-sensitive items)
UPDATE ItemType SET 
    condition_factor_good = 0.00,
    condition_factor_fair = 0.00,
    condition_factor_poor = 0.00
WHERE itemtype_name IN (
    'Soap', 'Shampoo', 'Toothpaste', 'Toothbrush', 'Toilet Paper',
    'Detergent', 'Sanitary Pads', 'Diapers', 'Face Masks', 'Alcohol',
    'Hand Sanitizer', 'Tissues'
);

-- Medical Supplies (Must be sealed/new for safety)
UPDATE ItemType SET 
    condition_factor_good = 0.00,
    condition_factor_fair = 0.00,
    condition_factor_poor = 0.00
WHERE itemtype_name IN (
    'Medicines', 'Bandages', 'Medical Gloves', 'Thermometers', 
    'First Aid Kits', 'Syringes', 'Ointments', 'Vitamins'
);

-- Food Items (Perishable - must be sealed/new)
UPDATE ItemType SET 
    condition_factor_good = 0.00,
    condition_factor_fair = 0.00,
    condition_factor_poor = 0.00
WHERE itemtype_name IN (
    'Rice', 'Noodles', 'Canned Goods', 'Cooking Oil', 'Sugar', 'Salt',
    'Milk Powder', 'Coffee', 'Biscuits', 'Pasta', 'Bread', 'Cereals', 
    'Dried Fish'
);

-- Kitchen Utensils (Hygiene-related - prefer new only)
UPDATE ItemType SET 
    condition_factor_good = 0.00,
    condition_factor_fair = 0.00,
    condition_factor_poor = 0.00
WHERE itemtype_name IN (
    'Plastic Plates', 'Spoons', 'Forks', 'Tumblers', 'Food Containers'
);

-- Shelter Materials (Should be functional and safe)
UPDATE ItemType SET 
    condition_factor_good = 0.00,
    condition_factor_fair = 0.00,
    condition_factor_poor = 0.00
WHERE itemtype_name IN (
    'Jerry Cans', 'Plastic Containers', 'Emergency Kits'
);

-- Educational Materials - Allow some flexibility (New -> Fair)
-- Keep good and fair conditions for books, notebooks, etc.
UPDATE ItemType SET 
    condition_factor_poor = 0.00  -- Only disable "poor" condition
WHERE itemtype_name IN (
    'School Bags', 'Notebooks', 'Writing Pads', 'Pens', 'Pencils',
    'Crayons', 'Rulers'
);

-- Display updated condition factors for verification
SELECT 
    ic.category_name,
    it.itemtype_name,
    it.condition_factor_new,
    it.condition_factor_good,
    it.condition_factor_fair,
    it.condition_factor_poor,
    CASE 
        WHEN it.condition_factor_good = 0 AND it.condition_factor_fair = 0 AND it.condition_factor_poor = 0 
        THEN 'NEW ONLY' 
        ELSE 'VARIABLE CONDITIONS'
    END as condition_type
FROM ItemType it
JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
ORDER BY ic.category_name, it.itemtype_name;