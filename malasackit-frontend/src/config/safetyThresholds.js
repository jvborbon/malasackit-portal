/**
 * Frontend Safety Thresholds Configuration
 * This mirrors the backend configuration for realistic 240 sq.m warehouse capacity
 * 
 * Structure: { max, reorder, critical }
 * - max: Maximum realistic storage capacity
 * - reorder: Trigger for requesting donations (60% of max)
 * - critical: Emergency minimum buffer (30% of max)
 */

export const FRONTEND_SAFETY_THRESHOLDS = {
  // FOOD ITEMS (35% warehouse space)
  'Rice (10kg)': { max: 500, reorder: 300, critical: 150 },
  'Rice (25kg)': { max: 200, reorder: 120, critical: 60 },
  'Canned Goods': { max: 3000, reorder: 1800, critical: 900 },
  'Sardines': { max: 2000, reorder: 1200, critical: 600 },
  'Corned Beef': { max: 1500, reorder: 900, critical: 450 },
  'Noodles': { max: 2500, reorder: 1500, critical: 750 },
  'Instant Noodles': { max: 2500, reorder: 1500, critical: 750 },
  'Cooking Oil': { max: 400, reorder: 240, critical: 120 },
  'Sugar': { max: 600, reorder: 360, critical: 180 },
  'Salt': { max: 500, reorder: 300, critical: 150 },
  'Coffee': { max: 1000, reorder: 600, critical: 300 },
  'Milk Powder': { max: 400, reorder: 240, critical: 120 },
  'Biscuits (Pack)': { max: 1200, reorder: 720, critical: 360 },
  'Dried Fish': { max: 300, reorder: 180, critical: 90 },
  'Bread': { max: 150, reorder: 90, critical: 45 },
  'Pasta': { max: 800, reorder: 480, critical: 240 },
  'Cereals': { max: 500, reorder: 300, critical: 150 },
  'Other Food Items': { max: 600, reorder: 360, critical: 180 },

  // HYGIENE & HOUSEHOLD (25% warehouse space)
  'Bath Soap': { max: 2400, reorder: 1440, critical: 720 },
  'Soap': { max: 2400, reorder: 1440, critical: 720 },
  'Laundry Soap': { max: 1200, reorder: 720, critical: 360 },
  'Detergent': { max: 1200, reorder: 720, critical: 360 },
  'Shampoo': { max: 1500, reorder: 900, critical: 450 },
  'Toothpaste': { max: 800, reorder: 480, critical: 240 },
  'Toothbrush': { max: 1000, reorder: 600, critical: 300 },
  'Toilet Paper': { max: 600, reorder: 360, critical: 180 },
  'Sanitary Pads': { max: 800, reorder: 480, critical: 240 },
  'Hygiene Napkin': { max: 800, reorder: 480, critical: 240 },
  'Diapers': { max: 600, reorder: 360, critical: 180 },
  'Face Masks': { max: 2000, reorder: 1200, critical: 600 },
  'Alcohol': { max: 500, reorder: 300, critical: 150 },
  'Hand Sanitizer': { max: 500, reorder: 300, critical: 150 },
  'Tissues': { max: 600, reorder: 360, critical: 180 },
  'Face Towel': { max: 800, reorder: 480, critical: 240 },
  'Other Hygiene Items': { max: 500, reorder: 300, critical: 150 },

  // BEDDING & SHELTER (10% warehouse space)
  'Blankets': { max: 600, reorder: 360, critical: 180 },
  'Blanket': { max: 600, reorder: 360, critical: 180 },
  'Sleeping Mat': { max: 500, reorder: 300, critical: 150 },
  'Mats': { max: 500, reorder: 300, critical: 150 },
  'Tents': { max: 50, reorder: 30, critical: 15 },
  'Tarpaulins': { max: 300, reorder: 180, critical: 90 },
  'Pillows': { max: 400, reorder: 240, critical: 120 },
  'Bed Sheets': { max: 500, reorder: 300, critical: 150 },
  'Mosquito Nets': { max: 300, reorder: 180, critical: 90 },
  'Jerry Cans': { max: 400, reorder: 240, critical: 120 },
  'Jerry Can': { max: 400, reorder: 240, critical: 120 },
  'Plastic Containers': { max: 500, reorder: 300, critical: 150 },
  'Emergency Kits': { max: 300, reorder: 180, critical: 90 },
  'Sleeping Bags': { max: 250, reorder: 150, critical: 75 },
  'Other Shelter Items': { max: 300, reorder: 180, critical: 90 },

  // CLOTHING (20% warehouse space)
  'T-Shirts': { max: 1000, reorder: 600, critical: 300 },
  'Pants': { max: 600, reorder: 360, critical: 180 },
  'Dresses': { max: 400, reorder: 240, critical: 120 },
  'Shorts': { max: 500, reorder: 300, critical: 150 },
  'Underwear (New Only)': { max: 800, reorder: 480, critical: 240 },
  'Socks': { max: 1000, reorder: 600, critical: 300 },
  'Shoes': { max: 400, reorder: 240, critical: 120 },
  'Jackets': { max: 300, reorder: 180, critical: 90 },
  'School Uniforms': { max: 400, reorder: 240, critical: 120 },
  'Baby Clothes': { max: 600, reorder: 360, critical: 180 },
  'Sleepwear': { max: 500, reorder: 300, critical: 150 },
  'Other Clothing': { max: 500, reorder: 300, critical: 150 },

  // EDUCATIONAL MATERIALS (5% warehouse space)
  'Notebooks': { max: 500, reorder: 300, critical: 150 },
  'Ballpens': { max: 600, reorder: 360, critical: 180 },
  'Pencils': { max: 600, reorder: 360, critical: 180 },
  'Crayons (12 pcs)': { max: 300, reorder: 180, critical: 90 },
  'Coloring Materials (Markers/Paints)': { max: 200, reorder: 120, critical: 60 },
  'Ruler/Compass/Protractor Set': { max: 300, reorder: 180, critical: 90 },
  'Backpacks/School Bags': { max: 200, reorder: 120, critical: 60 },
  'School Supplies': { max: 400, reorder: 240, critical: 120 },
  'Textbooks': { max: 300, reorder: 180, critical: 90 },
  'Storybooks': { max: 300, reorder: 180, critical: 90 },
  'Paper Reams (Bond Paper)': { max: 150, reorder: 90, critical: 45 },
  'Folders/Binder Sets': { max: 250, reorder: 150, critical: 75 },
  'Chalk/Whiteboard Markers': { max: 300, reorder: 180, critical: 90 },
  'Educational Toys (Preschool)': { max: 150, reorder: 90, critical: 45 },
  'Tablet/Basic Laptop (for learning)': { max: 30, reorder: 18, critical: 9 },
  'Other Educational Materials': { max: 250, reorder: 150, critical: 75 },

  // KITCHEN ITEMS (3% warehouse space)
  'Cooking Pots (medium)': { max: 150, reorder: 90, critical: 45 },
  'Frying Pan': { max: 150, reorder: 90, critical: 45 },
  'Cooking Utensil Set (spoon, ladle, etc.)': { max: 200, reorder: 120, critical: 60 },
  'Cutlery Set (forks, spoons, knives)': { max: 250, reorder: 150, critical: 75 },
  'Plates (set of 6)': { max: 200, reorder: 120, critical: 60 },
  'Bowls (set of 6)': { max: 200, reorder: 120, critical: 60 },
  'Cups/Glasses (set)': { max: 250, reorder: 150, critical: 75 },
  'Cooking Knife': { max: 150, reorder: 90, critical: 45 },
  'Chopping Board': { max: 150, reorder: 90, critical: 45 },
  'Rice Cooker': { max: 80, reorder: 48, critical: 24 },
  'Water Jug/Pitcher': { max: 200, reorder: 120, critical: 60 },
  'Thermos Flask': { max: 150, reorder: 90, critical: 45 },
  'Serving Tray': { max: 150, reorder: 90, critical: 45 },
  'Plastic Containers (food storage)': { max: 250, reorder: 150, critical: 75 },
  'Other Kitchen Items': { max: 200, reorder: 120, critical: 60 },

  // MEDICAL SUPPLIES (2% warehouse space)
  'Medicine': { max: 500, reorder: 300, critical: 150 },
  'First Aid Kit': { max: 200, reorder: 120, critical: 60 },
  'Bandages': { max: 800, reorder: 480, critical: 240 },
  'Antiseptic Solution': { max: 300, reorder: 180, critical: 90 },
  'Basic Medicines': { max: 500, reorder: 300, critical: 150 },
  'Gloves (Disposable)': { max: 1000, reorder: 600, critical: 300 },
  'Thermometer': { max: 100, reorder: 60, critical: 30 },
  'Stethoscope': { max: 25, reorder: 15, critical: 8 },
  'Other Medical Supplies': { max: 300, reorder: 180, critical: 90 }
};