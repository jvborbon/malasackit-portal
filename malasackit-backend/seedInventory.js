import pg from 'pg';
import dotenv from 'dotenv';
import { SAFETY_THRESHOLDS } from './src/config/safetyThresholds.js';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Category mapping - maps to EXISTING database categories (Food Items, Household Essentials/Personal Care, etc.)
const CATEGORY_MAPPING = {
  // Food Items (maps to existing "Food Items" category)
  'Rice (10kg)': 'Food Items',
  'Rice (25kg)': 'Food Items',
  'Canned Goods': 'Food Items',
  'Sardines': 'Food Items',
  'Corned Beef': 'Food Items',
  'Noodles': 'Food Items',
  'Instant Noodles': 'Food Items',
  'Cooking Oil': 'Food Items',
  'Sugar': 'Food Items',
  'Salt': 'Food Items',
  'Coffee': 'Food Items',
  'Milk Powder': 'Food Items',
  'Biscuits (Pack)': 'Food Items',
  'Dried Fish': 'Food Items',
  'Bread': 'Food Items',
  'Pasta': 'Food Items',
  'Cereals': 'Food Items',
  'Other Food Items': 'Food Items',
  
  // Household Essentials/Personal Care
  'Bath Soap': 'Household Essentials/Personal Care',
  'Soap': 'Household Essentials/Personal Care',
  'Laundry Soap': 'Household Essentials/Personal Care',
  'Detergent': 'Household Essentials/Personal Care',
  'Shampoo': 'Household Essentials/Personal Care',
  'Toothpaste': 'Household Essentials/Personal Care',
  'Toothbrush': 'Household Essentials/Personal Care',
  'Toilet Paper': 'Household Essentials/Personal Care',
  'Sanitary Pads': 'Household Essentials/Personal Care',
  'Hygiene Napkin': 'Household Essentials/Personal Care',
  'Diapers': 'Household Essentials/Personal Care',
  'Face Masks': 'Household Essentials/Personal Care',
  'Alcohol': 'Household Essentials/Personal Care',
  'Hand Sanitizer': 'Household Essentials/Personal Care',
  'Tissues': 'Household Essentials/Personal Care',
  'Face Towel': 'Household Essentials/Personal Care',
  'Other Hygiene Items': 'Household Essentials/Personal Care',
  
  // Shelter Materials
  'Blankets': 'Shelter Materials',
  'Blanket': 'Shelter Materials',
  'Sleeping Mat': 'Shelter Materials',
  'Mats': 'Shelter Materials',
  'Tents': 'Shelter Materials',
  'Tarpaulins': 'Shelter Materials',
  'Pillows': 'Shelter Materials',
  'Bed Sheets': 'Shelter Materials',
  'Mosquito Nets': 'Shelter Materials',
  'Sleeping Bags': 'Shelter Materials',
  'Other Shelter Items': 'Shelter Materials',
  'Jerry Cans': 'Shelter Materials',
  'Jerry Can': 'Shelter Materials',
  'Plastic Containers': 'Shelter Materials',
  'Emergency Kits': 'Shelter Materials',
  
  // Clothing
  'T-Shirts': 'Clothing',
  'Pants': 'Clothing',
  'Dresses': 'Clothing',
  'Shorts': 'Clothing',
  'Underwear (New Only)': 'Clothing',
  'Socks': 'Clothing',
  'Shoes': 'Clothing',
  'Jackets': 'Clothing',
  'School Uniforms': 'Clothing',
  'Baby Clothes': 'Clothing',
  'Sleepwear': 'Clothing',
  'Other Clothing': 'Clothing',
  
  // Educational Materials
  'Notebooks': 'Educational Materials',
  'Ballpens': 'Educational Materials',
  'Pencils': 'Educational Materials',
  'Crayons (12 pcs)': 'Educational Materials',
  'Coloring Materials (Markers/Paints)': 'Educational Materials',
  'Ruler/Compass/Protractor Set': 'Educational Materials',
  'Backpacks/School Bags': 'Educational Materials',
  'School Supplies': 'Educational Materials',
  'Textbooks': 'Educational Materials',
  'Storybooks': 'Educational Materials',
  'Paper Reams (Bond Paper)': 'Educational Materials',
  'Folders/Binder Sets': 'Educational Materials',
  'Chalk/Whiteboard Markers': 'Educational Materials',
  'Educational Toys (Preschool)': 'Educational Materials',
  'Tablet/Basic Laptop (for learning)': 'Educational Materials',
  'Other Educational Materials': 'Educational Materials',
  
  // Kitchen Utensils
  'Cooking Pots (medium)': 'Kitchen Utensils',
  'Frying Pan': 'Kitchen Utensils',
  'Cooking Utensil Set (spoon, ladle, etc.)': 'Kitchen Utensils',
  'Cutlery Set (forks, spoons, knives)': 'Kitchen Utensils',
  'Plates (set of 6)': 'Kitchen Utensils',
  'Bowls (set of 6)': 'Kitchen Utensils',
  'Cups/Glasses (set)': 'Kitchen Utensils',
  'Cooking Knife': 'Kitchen Utensils',
  'Chopping Board': 'Kitchen Utensils',
  'Rice Cooker': 'Kitchen Utensils',
  'Water Jug/Pitcher': 'Kitchen Utensils',
  'Thermos Flask': 'Kitchen Utensils',
  'Serving Tray': 'Kitchen Utensils',
  'Plastic Containers (food storage)': 'Kitchen Utensils',
  'Other Kitchen Items': 'Kitchen Utensils',
  
  // Medical Supplies
  'Medicine': 'Medical Supplies',
  'First Aid Kit': 'Medical Supplies',
  'Bandages': 'Medical Supplies',
  'Antiseptic Solution': 'Medical Supplies',
  'Basic Medicines': 'Medical Supplies',
  'Gloves (Disposable)': 'Medical Supplies',
  'Thermometer': 'Medical Supplies',
  'Stethoscope': 'Medical Supplies',
  'Other Medical Supplies': 'Medical Supplies'
};

// Unit mapping for items
const UNIT_MAPPING = {
  'Rice (10kg)': 'pcs',
  'Rice (25kg)': 'pcs',
  'Canned Goods': 'cans',
  'Sardines': 'cans',
  'Corned Beef': 'cans',
  'Noodles': 'packs',
  'Instant Noodles': 'packs',
  'Cooking Oil': 'bottles',
  'Sugar': 'kg',
  'Salt': 'kg',
  'Coffee': 'sachets',
  'Milk Powder': 'cans',
  'Biscuits (Pack)': 'packs',
  'Dried Fish': 'packs',
  'Bread': 'loaves',
  'Pasta': 'packs',
  'Cereals': 'boxes',
  'Bath Soap': 'bars',
  'Soap': 'bars',
  'Laundry Soap': 'bars',
  'Detergent': 'packs',
  'Shampoo': 'sachets',
  'Toothpaste': 'tubes',
  'Toothbrush': 'pcs',
  'Toilet Paper': 'rolls',
  'Sanitary Pads': 'packs',
  'Hygiene Napkin': 'packs',
  'Diapers': 'packs',
  'Face Masks': 'boxes',
  'Alcohol': 'bottles',
  'Hand Sanitizer': 'bottles',
  'Tissues': 'boxes',
  'Face Towel': 'pcs',
  'Blankets': 'pcs',
  'Blanket': 'pcs',
  'Sleeping Mat': 'pcs',
  'Mats': 'pcs',
  'Tents': 'pcs',
  'Tarpaulins': 'pcs',
  'Pillows': 'pcs',
  'Bed Sheets': 'pcs',
  'Mosquito Nets': 'pcs',
  'Sleeping Bags': 'pcs',
  'Jerry Cans': 'pcs',
  'Jerry Can': 'pcs',
  'Plastic Containers': 'pcs',
  'Emergency Kits': 'kits',
  'T-Shirts': 'pcs',
  'Pants': 'pcs',
  'Dresses': 'pcs',
  'Shorts': 'pcs',
  'Underwear (New Only)': 'pcs',
  'Socks': 'pairs',
  'Shoes': 'pairs',
  'Jackets': 'pcs',
  'School Uniforms': 'sets',
  'Baby Clothes': 'pcs',
  'Sleepwear': 'pcs',
  'Notebooks': 'pcs',
  'Ballpens': 'pcs',
  'Pencils': 'pcs',
  'Crayons (12 pcs)': 'boxes',
  'Coloring Materials (Markers/Paints)': 'sets',
  'Ruler/Compass/Protractor Set': 'sets',
  'Backpacks/School Bags': 'pcs',
  'School Supplies': 'sets',
  'Textbooks': 'pcs',
  'Storybooks': 'pcs',
  'Paper Reams (Bond Paper)': 'reams',
  'Folders/Binder Sets': 'sets',
  'Chalk/Whiteboard Markers': 'boxes',
  'Educational Toys (Preschool)': 'pcs',
  'Tablet/Basic Laptop (for learning)': 'pcs',
  'Cooking Pots (medium)': 'pcs',
  'Frying Pan': 'pcs',
  'Cooking Utensil Set (spoon, ladle, etc.)': 'sets',
  'Cutlery Set (forks, spoons, knives)': 'sets',
  'Plates (set of 6)': 'sets',
  'Bowls (set of 6)': 'sets',
  'Cups/Glasses (set)': 'sets',
  'Cooking Knife': 'pcs',
  'Chopping Board': 'pcs',
  'Rice Cooker': 'pcs',
  'Water Jug/Pitcher': 'pcs',
  'Thermos Flask': 'pcs',
  'Serving Tray': 'pcs',
  'Medicine': 'units',
  'First Aid Kit': 'kits',
  'Bandages': 'rolls',
  'Antiseptic Solution': 'bottles',
  'Basic Medicines': 'units',
  'Gloves (Disposable)': 'boxes',
  'Thermometer': 'pcs',
  'Stethoscope': 'pcs'
};

/**
 * Generate realistic inventory quantity with varied stock levels
 * Creates a mix of: No Stock (0), Low Stock (critical to reorder), and Available (reorder to max)
 */
function generateRealisticQuantity(thresholds) {
  const { critical, reorder, max } = thresholds;
  
  // Random distribution: 10% no stock, 40% low stock, 50% available
  const rand = Math.random();
  
  if (rand < 0.10) {
    // 10% chance of no stock
    return 0;
  } else if (rand < 0.50) {
    // 40% chance of low stock (between critical and reorder)
    const min = critical;
    const maxQty = reorder - 1;
    return Math.floor(Math.random() * (maxQty - min + 1)) + min;
  } else {
    // 50% chance of available stock (between reorder and 70% of max)
    const min = reorder;
    const maxQty = Math.floor(max * 0.7);
    return Math.floor(Math.random() * (maxQty - min + 1)) + min;
  }
}

/**
 * Estimate Fair Market Value per unit based on item type
 */
function estimateFMV(itemName) {
  const fmvRanges = {
    'Rice (10kg)': [400, 600],
    'Rice (25kg)': [900, 1200],
    'Canned Goods': [30, 80],
    'Sardines': [25, 45],
    'Corned Beef': [40, 70],
    'Noodles': [10, 20],
    'Instant Noodles': [10, 20],
    'Cooking Oil': [80, 150],
    'Sugar': [50, 80],
    'Salt': [15, 30],
    'Coffee': [3, 8],
    'Milk Powder': [150, 300],
    'Biscuits (Pack)': [25, 50],
    'Dried Fish': [100, 200],
    'Bread': [40, 60],
    'Pasta': [30, 60],
    'Cereals': [100, 200],
    'Bath Soap': [15, 30],
    'Soap': [15, 30],
    'Laundry Soap': [20, 40],
    'Detergent': [50, 100],
    'Shampoo': [5, 15],
    'Toothpaste': [40, 80],
    'Toothbrush': [20, 40],
    'Toilet Paper': [30, 50],
    'Sanitary Pads': [50, 100],
    'Hygiene Napkin': [50, 100],
    'Diapers': [200, 400],
    'Face Masks': [100, 200],
    'Alcohol': [50, 100],
    'Hand Sanitizer': [50, 100],
    'Tissues': [30, 60],
    'Face Towel': [50, 100],
    'Blankets': [200, 500],
    'Blanket': [200, 500],
    'Sleeping Mat': [150, 300],
    'Mats': [150, 300],
    'Tents': [2000, 5000],
    'Tarpaulins': [200, 500],
    'Pillows': [100, 250],
    'Bed Sheets': [150, 300],
    'Mosquito Nets': [150, 300],
    'Sleeping Bags': [500, 1000],
    'Jerry Cans': [100, 200],
    'Jerry Can': [100, 200],
    'Plastic Containers': [50, 150],
    'Emergency Kits': [500, 1000],
    'T-Shirts': [100, 250],
    'Pants': [200, 500],
    'Dresses': [200, 600],
    'Shorts': [150, 300],
    'Underwear (New Only)': [50, 150],
    'Socks': [30, 80],
    'Shoes': [300, 800],
    'Jackets': [400, 1000],
    'School Uniforms': [300, 600],
    'Baby Clothes': [100, 300],
    'Sleepwear': [150, 350],
    'Notebooks': [20, 50],
    'Ballpens': [5, 15],
    'Pencils': [5, 15],
    'Crayons (12 pcs)': [30, 80],
    'Coloring Materials (Markers/Paints)': [50, 150],
    'Ruler/Compass/Protractor Set': [50, 120],
    'Backpacks/School Bags': [200, 500],
    'School Supplies': [100, 300],
    'Textbooks': [150, 400],
    'Storybooks': [100, 300],
    'Paper Reams (Bond Paper)': [200, 350],
    'Folders/Binder Sets': [30, 80],
    'Chalk/Whiteboard Markers': [50, 120],
    'Educational Toys (Preschool)': [200, 600],
    'Tablet/Basic Laptop (for learning)': [5000, 15000],
    'Cooking Pots (medium)': [200, 500],
    'Frying Pan': [150, 400],
    'Cooking Utensil Set (spoon, ladle, etc.)': [100, 250],
    'Cutlery Set (forks, spoons, knives)': [150, 350],
    'Plates (set of 6)': [150, 350],
    'Bowls (set of 6)': [150, 350],
    'Cups/Glasses (set)': [100, 250],
    'Cooking Knife': [100, 300],
    'Chopping Board': [80, 200],
    'Rice Cooker': [800, 2000],
    'Water Jug/Pitcher': [100, 250],
    'Thermos Flask': [200, 500],
    'Serving Tray': [80, 200],
    'Medicine': [50, 200],
    'First Aid Kit': [200, 500],
    'Bandages': [20, 50],
    'Antiseptic Solution': [50, 150],
    'Basic Medicines': [50, 200],
    'Gloves (Disposable)': [100, 250],
    'Thermometer': [150, 400],
    'Stethoscope': [1000, 3000]
  };

  const range = fmvRanges[itemName] || [50, 150];
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

async function seedInventory() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting inventory seeding process...\n');
    console.log('📦 Based on 240 sq.m warehouse realistic capacity\n');
    
    let insertCount = 0;
    let updateCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    await client.query('BEGIN');

    for (const [itemName, thresholds] of Object.entries(SAFETY_THRESHOLDS)) {
      try {
        // Get EXISTING category - DO NOT CREATE NEW ONES
        const category = CATEGORY_MAPPING[itemName];
        if (!category) {
          console.log(`⚠️  Skipped ${itemName}: No category mapping`);
          skipCount++;
          continue;
        }

        const categoryResult = await client.query(
          'SELECT itemcategory_id FROM ItemCategory WHERE category_name = $1',
          [category]
        );

        if (categoryResult.rows.length === 0) {
          console.log(`⚠️  Skipped ${itemName}: Category '${category}' does not exist in database`);
          skipCount++;
          continue;
        }

        const categoryId = categoryResult.rows[0].itemcategory_id;

        // Get or create item type
        let itemTypeResult = await client.query(
          'SELECT itemtype_id FROM ItemType WHERE itemtype_name = $1',
          [itemName]
        );

        let itemTypeId;
        const unitValue = estimateFMV(itemName);
        
        if (itemTypeResult.rows.length === 0) {
          // Insert item type with FMV values (no unit column in schema)
          const insertItemType = await client.query(
            `INSERT INTO ItemType (itemtype_name, itemcategory_id, avg_retail_price, min_fmv, max_fmv)
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING itemtype_id`,
            [itemName, categoryId, unitValue, unitValue * 0.7, unitValue * 1.3]
          );
          itemTypeId = insertItemType.rows[0].itemtype_id;
        } else {
          itemTypeId = itemTypeResult.rows[0].itemtype_id;
        }

        // Check if inventory already exists
        const inventoryCheck = await client.query(
          'SELECT inventory_id, quantity_available FROM Inventory WHERE itemtype_id = $1',
          [itemTypeId]
        );

        const quantity = generateRealisticQuantity(thresholds);
        const totalValue = quantity * unitValue;
        const unit = UNIT_MAPPING[itemName] || 'pcs';

        if (inventoryCheck.rows.length > 0) {
          // Update existing inventory
          await client.query(
            `UPDATE Inventory 
             SET quantity_available = $1,
                 total_fmv_value = $2,
                 last_updated = CURRENT_TIMESTAMP,
                 status = CASE 
                   WHEN $1 = 0 THEN 'No Stock'
                   WHEN $1 < $3 THEN 'Low Stock'
                   ELSE 'Available'
                 END
             WHERE itemtype_id = $4`,
            [quantity, totalValue, thresholds.reorder, itemTypeId]
          );
          console.log(`🔄 Updated: ${itemName} | Qty: ${quantity} ${unit} | Value: ₱${totalValue.toFixed(2)}`);
          updateCount++;
        } else {
          // Insert new inventory
          const status = quantity === 0 ? 'No Stock' : quantity < thresholds.reorder ? 'Low Stock' : 'Available';
          
          await client.query(
            `INSERT INTO Inventory (itemtype_id, quantity_available, total_fmv_value, location, status)
             VALUES ($1, $2, $3, $4, $5)`,
            [itemTypeId, quantity, totalValue, 'LASAC Warehouse - 240 sq.m', status]
          );
          console.log(`✅ Created: ${itemName} | Qty: ${quantity} ${unit} | Value: ₱${totalValue.toFixed(2)}`);
          insertCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing ${itemName}:`, error.message);
        errorCount++;
      }
    }

    await client.query('COMMIT');

    console.log('\n=== INVENTORY SEEDING SUMMARY ===');
    console.log(`✅ New items created: ${insertCount}`);
    console.log(`🔄 Existing items updated: ${updateCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total items processed: ${Object.keys(SAFETY_THRESHOLDS).length}`);
    console.log(`\n💡 Note: Quantities set between critical and reorder thresholds to simulate realistic warehouse state`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Fatal error during inventory seeding:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\n✅ Inventory seeding completed');
  }
}

seedInventory();
