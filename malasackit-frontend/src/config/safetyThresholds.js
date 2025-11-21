/**
 * Frontend Safety Thresholds Configuration
 * This mirrors the backend configuration for when API calls fail
 */

export const FRONTEND_SAFETY_THRESHOLDS = {
  // ====================================
  // CATEGORY 1 - Food Items (HIGH CRITICALITY)
  // ====================================
  'Canned Goods': 300,
  'Rice (10kg)': 20,
  'Rice (25kg)': 10,
  'Noodles': 200,
  'Cooking Oil': 40,
  'Sugar': 30,
  'Salt': 20,
  'Coffee': 50,
  'Milk Powder': 40,
  'Biscuits (Pack)': 150,
  'Dried Fish': 40,
  'Bread': 20,
  'Pasta': 80,
  'Cereals': 40,
  'Other Food Items': 15,

  // ====================================
  // CATEGORY 2 - Household Essentials/Hygiene
  // ====================================
  'Soap': 150,
  'Shampoo': 80,
  'Toothpaste': 100,
  'Toothbrush': 100,
  'Toilet Paper': 50,
  'Detergent': 60,
  'Sanitary Pads': 100,
  'Diapers': 60,
  'Face Masks': 200,
  'Alcohol': 80,
  'Hand Sanitizer': 60,
  'Tissues': 80,
  'Other Hygiene Items': 15,

  // ====================================
  // CATEGORY 3 - Clothing
  // ====================================
  'T-Shirts': 100,
  'Pants': 60,
  'Dresses': 40,
  'Shorts': 50,
  'Underwear (New Only)': 80,
  'Socks': 100,
  'Shoes': 40,
  'Jackets': 40,
  'School Uniforms': 30,
  'Baby Clothes': 80,
  'Sleepwear': 50,
  'Other Clothing': 10,

  // ====================================
  // CATEGORY 4 - Shelter Materials
  // ====================================
  'Blankets': 80,
  'Tents': 10,
  'Tarpaulins': 20,
  'Pillows': 40,
  'Bed Sheets': 40,
  'Mosquito Nets': 40,
  'Jerry Cans': 20,
  'Plastic Containers': 30,
  'Emergency Kits': 20,
  'Sleeping Bags': 20,
  'Mats': 30,
  'Other Shelter Items': 15,

  // ====================================
  // CATEGORY 5 - Educational Materials
  // ====================================
  'Notebooks': 50,
  'Ballpens': 100,
  'Pencils': 100,
  'Crayons (12 pcs)': 30,
  'Coloring Materials (Markers/Paints)': 20,
  'Ruler/Compass/Protractor Set': 30,
  'Backpacks/School Bags': 20,
  'Textbooks': 10,
  'Storybooks': 15,
  'Paper Reams (Bond Paper)': 10,
  'Folders/Binder Sets': 20,
  'Chalk/Whiteboard Markers': 15,
  'Educational Toys (Preschool)': 10,
  'Tablet/Basic Laptop (for learning)': 3,
  'Other Educational Materials': 10,

  // ====================================
  // CATEGORY 6 - Kitchen Items
  // ====================================
  'Cooking Pots (medium)': 20,
  'Frying Pan': 20,
  'Cooking Utensil Set (spoon, ladle, etc.)': 30,
  'Cutlery Set (forks, spoons, knives)': 40,
  'Plates (set of 6)': 40,
  'Bowls (set of 6)': 40,
  'Cups/Glasses (set)': 40,
  'Cooking Knife': 40,
  'Chopping Board': 30,
  'Rice Cooker': 10,
  'Water Jug/Pitcher': 30,
  'Thermos Flask': 20,
  'Serving Tray': 30,
  'Plastic Containers (food storage)': 40,
  'Other Kitchen Items': 10,

  // ====================================
  // CATEGORY 7 - Medical Supplies
  // ====================================
  'First Aid Kit': 20,
  'Bandages': 200,
  'Antiseptic Solution': 40,
  'Basic Medicines': 50,
  'Gloves (Disposable)': 200,
  'Thermometer': 20,
  'Stethoscope': 5,
  'Other Medical Supplies': 15
};