const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const foods = [
  // Proteins
  { name: 'Chicken Breast (cooked)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, tags: ['High Protein', 'Low Carb'] },
  { name: 'Eggs (whole)', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, tags: ['High Protein'] },
  { name: 'Greek Yogurt (plain)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, tags: ['High Protein', 'Probiotic'] },
  { name: 'Salmon (cooked)', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, tags: ['High Protein', 'Omega-3'] },
  { name: 'Tuna (canned in water)', calories: 116, protein: 25.5, carbs: 0, fat: 1, fiber: 0, tags: ['High Protein', 'Low Fat'] },
  { name: 'Cottage Cheese (low fat)', calories: 72, protein: 12.5, carbs: 2.7, fat: 1, fiber: 0, tags: ['High Protein'] },
  { name: 'Turkey Breast (cooked)', calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, tags: ['High Protein', 'Low Fat'] },
  { name: 'Beef (lean, cooked)', calories: 215, protein: 26, carbs: 0, fat: 12, fiber: 0, tags: ['High Protein', 'Iron'] },
  { name: 'Shrimp (cooked)', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, tags: ['High Protein', 'Low Carb'] },
  { name: 'Tofu (firm)', calories: 76, protein: 8, carbs: 1.9, fat: 4.2, fiber: 0.3, tags: ['Plant Protein', 'Vegan'] },

  // Carbs / Grains
  { name: 'Oats (dry)', calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, tags: ['High Fiber', 'Complex Carbs'] },
  { name: 'Brown Rice (cooked)', calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, tags: ['Complex Carbs'] },
  { name: 'White Rice (cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, tags: ['Carbs'] },
  { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, tags: ['High Fiber', 'Complex Carbs'] },
  { name: 'Sweet Potato (cooked)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, tags: ['High Fiber', 'Vitamin A'] },
  { name: 'Pasta (cooked)', calories: 158, protein: 5.8, carbs: 31, fat: 0.9, fiber: 1.8, tags: ['Carbs'] },
  { name: 'Quinoa (cooked)', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, tags: ['Complete Protein', 'Gluten Free'] },

  // Vegetables
  { name: 'Broccoli (raw)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, tags: ['High Fiber', 'Vitamin C'] },
  { name: 'Spinach (raw)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, tags: ['High Fiber', 'Iron'] },
  { name: 'Mixed Salad Greens', calories: 17, protein: 1.8, carbs: 2.7, fat: 0.2, fiber: 1.7, tags: ['Low Calorie'] },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, tags: ['Healthy Fats', 'High Fiber'] },

  // Fruits
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, tags: ['Potassium', 'Quick Energy'] },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, tags: ['High Fiber', 'Vitamin C'] },
  { name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, tags: ['Antioxidants', 'Low Calorie'] },
  { name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, tags: ['Vitamin C', 'Low Calorie'] },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, tags: ['Vitamin C'] },

  // Dairy
  { name: 'Whole Milk', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, tags: ['Calcium'] },
  { name: 'Almond Milk (unsweetened)', calories: 15, protein: 0.6, carbs: 0.3, fat: 1.2, fiber: 0.3, tags: ['Low Calorie', 'Vegan'] },
  { name: 'Cheddar Cheese', calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, tags: ['Calcium', 'High Fat'] },

  // Fats / Nuts
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, tags: ['Healthy Fats', 'High Fiber'] },
  { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, tags: ['High Protein', 'Healthy Fats'] },
  { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, tags: ['Healthy Fats', 'Omega-9'] },
  { name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, tags: ['Omega-3', 'Healthy Fats'] },

  // Common Meals
  { name: 'Avocado Toast & Egg', calories: 482, protein: 18, carbs: 34, fat: 22, fiber: 6, tags: ['High Fiber', 'Vitamin E'] },
  { name: 'Grilled Chicken Salad', calories: 250, protein: 30, carbs: 12, fat: 8, fiber: 4, tags: ['High Protein', 'Low Carb'] },
  { name: 'Oatmeal with Berries', calories: 220, protein: 8, carbs: 40, fat: 4, fiber: 6, tags: ['High Fiber', 'Antioxidants'] },
];

async function main() {
  console.log('Seeding food database...');
  let created = 0;
  for (const food of foods) {
    await prisma.food.upsert({
      where: { id: `seed_${food.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}` },
      update: food,
      create: { id: `seed_${food.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, ...food },
    });
    created++;
  }
  console.log(`✅ Seeded ${created} foods`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
