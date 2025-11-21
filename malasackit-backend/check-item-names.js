/**
 * Quick script to check the actual item names in the database
 * Run this in the backend directory: node check-item-names.js
 */

import { query } from './src/db.js';

const checkItemNames = async () => {
    try {
        console.log('🔍 Checking actual item names in database...\n');
        
        // Get all item types
        const itemTypesQuery = `
            SELECT itemtype_id, itemtype_name, category_name
            FROM ItemType it
            LEFT JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            ORDER BY ic.category_name, it.itemtype_name
        `;
        
        const itemTypes = await query(itemTypesQuery);
        
        console.log('📋 All Item Types in Database:');
        itemTypes.rows.forEach(item => {
            console.log(`  "${item.itemtype_name}" (${item.category_name})`);
        });
        
        // Check specifically for Biscuits
        const biscuitItems = itemTypes.rows.filter(item => 
            item.itemtype_name.toLowerCase().includes('biscuit')
        );
        
        console.log('\n🍪 Biscuit-related items:');
        biscuitItems.forEach(item => {
            console.log(`  ID: ${item.itemtype_id}, Name: "${item.itemtype_name}"`);
        });
        
        // Check current inventory for Biscuits
        const inventoryQuery = `
            SELECT 
                i.inventory_id,
                i.quantity_available,
                it.itemtype_name,
                ic.category_name
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE it.itemtype_name ILIKE '%biscuit%'
            ORDER BY it.itemtype_name
        `;
        
        const inventory = await query(inventoryQuery);
        
        console.log('\n📦 Current Biscuit Inventory:');
        if (inventory.rows.length === 0) {
            console.log('  No Biscuit inventory found');
        } else {
            inventory.rows.forEach(item => {
                console.log(`  "${item.itemtype_name}": ${item.quantity_available} units`);
            });
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error checking item names:', error);
        process.exit(1);
    }
};

checkItemNames();