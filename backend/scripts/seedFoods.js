const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 300+ common foods with real nutritional data (per 100g).
 * Sources: USDA FoodData Central, IFCT (Indian Food Composition Tables), NIN Hyderabad.
 */
const foods = [
  // ─────────────────────────────────────────────────────────────
  // INDIAN FOODS (55)
  // ─────────────────────────────────────────────────────────────
  { name: 'Roti (Chapati)', calories: 297, protein: 8.7, carbs: 56.0, fat: 3.7, fiber: 2.7, glycemicIndex: 52, tags: ['Indian', 'Whole Grain', 'Vegetarian'] },
  { name: 'Naan', calories: 310, protein: 9.0, carbs: 53.0, fat: 7.0, fiber: 2.0, glycemicIndex: 71, tags: ['Indian', 'Vegetarian'] },
  { name: 'Paratha (Plain)', calories: 326, protein: 7.4, carbs: 44.3, fat: 13.8, fiber: 2.2, glycemicIndex: 55, tags: ['Indian', 'Vegetarian'] },
  { name: 'Aloo Paratha', calories: 290, protein: 6.5, carbs: 42.0, fat: 11.0, fiber: 2.5, glycemicIndex: 58, tags: ['Indian', 'Vegetarian'] },
  { name: 'Poori', calories: 370, protein: 7.0, carbs: 48.0, fat: 17.0, fiber: 2.0, glycemicIndex: 65, tags: ['Indian', 'Vegetarian'] },
  { name: 'Dal Tadka', calories: 128, protein: 7.0, carbs: 15.0, fat: 4.5, fiber: 3.5, glycemicIndex: 36, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fiber'] },
  { name: 'Dal Makhani', calories: 140, protein: 6.5, carbs: 14.0, fat: 7.0, fiber: 3.0, glycemicIndex: 35, tags: ['Indian', 'Vegetarian', 'High Protein'] },
  { name: 'Chana Dal', calories: 135, protein: 8.5, carbs: 18.0, fat: 3.0, fiber: 5.0, glycemicIndex: 28, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Moong Dal', calories: 115, protein: 7.5, carbs: 16.0, fat: 2.5, fiber: 4.0, glycemicIndex: 31, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Rajma (Kidney Bean Curry)', calories: 130, protein: 7.0, carbs: 17.0, fat: 3.5, fiber: 6.0, glycemicIndex: 29, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Chole (Chickpea Curry)', calories: 150, protein: 7.5, carbs: 18.0, fat: 5.5, fiber: 5.5, glycemicIndex: 33, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Paneer Butter Masala', calories: 230, protein: 12.0, carbs: 8.0, fat: 18.0, fiber: 1.0, glycemicIndex: 30, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fat'] },
  { name: 'Paneer Tikka', calories: 260, protein: 18.0, carbs: 5.0, fat: 19.0, fiber: 0.5, glycemicIndex: 25, tags: ['Indian', 'Vegetarian', 'High Protein', 'Low Carb'] },
  { name: 'Palak Paneer', calories: 175, protein: 10.0, carbs: 6.0, fat: 13.0, fiber: 2.0, glycemicIndex: 28, tags: ['Indian', 'Vegetarian', 'High Protein'] },
  { name: 'Shahi Paneer', calories: 240, protein: 11.0, carbs: 9.0, fat: 19.0, fiber: 0.8, glycemicIndex: 30, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fat'] },
  { name: 'Matar Paneer', calories: 180, protein: 10.0, carbs: 10.0, fat: 12.0, fiber: 2.5, glycemicIndex: 35, tags: ['Indian', 'Vegetarian', 'High Protein'] },
  { name: 'Chicken Tikka Masala', calories: 175, protein: 15.0, carbs: 8.0, fat: 10.0, fiber: 1.5, glycemicIndex: 30, tags: ['Indian', 'High Protein'] },
  { name: 'Butter Chicken', calories: 195, protein: 14.0, carbs: 7.5, fat: 13.0, fiber: 1.0, glycemicIndex: 30, tags: ['Indian', 'High Protein'] },
  { name: 'Tandoori Chicken', calories: 165, protein: 25.0, carbs: 3.0, fat: 6.5, fiber: 0.5, glycemicIndex: 0, tags: ['Indian', 'High Protein', 'Low Carb'] },
  { name: 'Chicken Biryani', calories: 200, protein: 10.0, carbs: 25.0, fat: 7.5, fiber: 1.0, glycemicIndex: 60, tags: ['Indian', 'High Protein'] },
  { name: 'Veg Biryani', calories: 170, protein: 4.5, carbs: 27.0, fat: 5.5, fiber: 2.0, glycemicIndex: 58, tags: ['Indian', 'Vegetarian'] },
  { name: 'Dosa (Plain)', calories: 165, protein: 4.0, carbs: 28.0, fat: 4.0, fiber: 1.5, glycemicIndex: 66, tags: ['Indian', 'Vegetarian', 'South Indian'] },
  { name: 'Masala Dosa', calories: 200, protein: 4.5, carbs: 30.0, fat: 7.5, fiber: 2.0, glycemicIndex: 60, tags: ['Indian', 'Vegetarian', 'South Indian'] },
  { name: 'Idli', calories: 135, protein: 4.0, carbs: 25.0, fat: 1.5, fiber: 1.0, glycemicIndex: 69, tags: ['Indian', 'Vegetarian', 'South Indian', 'Low Fat'] },
  { name: 'Vada (Medu Vada)', calories: 290, protein: 8.0, carbs: 30.0, fat: 15.0, fiber: 2.5, glycemicIndex: 55, tags: ['Indian', 'Vegetarian', 'South Indian'] },
  { name: 'Uttapam', calories: 175, protein: 5.0, carbs: 25.0, fat: 6.0, fiber: 2.0, glycemicIndex: 62, tags: ['Indian', 'Vegetarian', 'South Indian'] },
  { name: 'Samosa', calories: 310, protein: 5.5, carbs: 35.0, fat: 17.0, fiber: 2.5, glycemicIndex: 55, tags: ['Indian', 'Vegetarian', 'Snack'] },
  { name: 'Pakora (Onion Bhaji)', calories: 280, protein: 5.0, carbs: 30.0, fat: 16.0, fiber: 2.0, glycemicIndex: 52, tags: ['Indian', 'Vegetarian', 'Snack'] },
  { name: 'Upma', calories: 155, protein: 4.0, carbs: 22.0, fat: 6.0, fiber: 2.5, glycemicIndex: 65, tags: ['Indian', 'Vegetarian', 'South Indian'] },
  { name: 'Poha', calories: 160, protein: 3.5, carbs: 28.0, fat: 4.5, fiber: 1.5, glycemicIndex: 64, tags: ['Indian', 'Vegetarian'] },
  { name: 'Pav Bhaji', calories: 210, protein: 5.0, carbs: 28.0, fat: 9.0, fiber: 3.0, glycemicIndex: 60, tags: ['Indian', 'Vegetarian'] },
  { name: 'Aloo Gobi', calories: 110, protein: 3.0, carbs: 14.0, fat: 5.0, fiber: 3.0, glycemicIndex: 45, tags: ['Indian', 'Vegetarian', 'Vegan'] },
  { name: 'Baingan Bharta', calories: 100, protein: 2.5, carbs: 10.0, fat: 6.0, fiber: 3.5, glycemicIndex: 30, tags: ['Indian', 'Vegetarian', 'Vegan', 'Low Calorie'] },
  { name: 'Bhindi Masala (Okra)', calories: 95, protein: 2.5, carbs: 9.0, fat: 6.0, fiber: 3.5, glycemicIndex: 25, tags: ['Indian', 'Vegetarian', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Jeera Rice', calories: 180, protein: 3.5, carbs: 32.0, fat: 4.5, fiber: 0.8, glycemicIndex: 65, tags: ['Indian', 'Vegetarian'] },
  { name: 'Pulao', calories: 175, protein: 4.0, carbs: 28.0, fat: 5.5, fiber: 1.5, glycemicIndex: 60, tags: ['Indian', 'Vegetarian'] },
  { name: 'Raita', calories: 55, protein: 3.0, carbs: 5.0, fat: 2.5, fiber: 0.5, glycemicIndex: 25, tags: ['Indian', 'Vegetarian', 'Low Calorie'] },
  { name: 'Kheer (Rice Pudding)', calories: 160, protein: 4.0, carbs: 26.0, fat: 5.0, fiber: 0.3, glycemicIndex: 60, tags: ['Indian', 'Vegetarian', 'Dessert'] },
  { name: 'Gulab Jamun', calories: 380, protein: 5.0, carbs: 55.0, fat: 16.0, fiber: 0.5, glycemicIndex: 75, tags: ['Indian', 'Vegetarian', 'Dessert', 'High Sugar'] },
  { name: 'Jalebi', calories: 390, protein: 2.5, carbs: 68.0, fat: 13.0, fiber: 0.3, glycemicIndex: 80, tags: ['Indian', 'Vegetarian', 'Dessert', 'High Sugar'] },
  { name: 'Ladoo (Besan)', calories: 430, protein: 8.0, carbs: 50.0, fat: 23.0, fiber: 2.0, glycemicIndex: 55, tags: ['Indian', 'Vegetarian', 'Dessert'] },
  { name: 'Pani Puri', calories: 220, protein: 4.0, carbs: 35.0, fat: 8.0, fiber: 2.0, glycemicIndex: 55, tags: ['Indian', 'Vegetarian', 'Street Food'] },
  { name: 'Bhel Puri', calories: 200, protein: 5.0, carbs: 30.0, fat: 7.0, fiber: 3.0, glycemicIndex: 55, tags: ['Indian', 'Vegetarian', 'Street Food'] },
  { name: 'Sev Puri', calories: 250, protein: 4.5, carbs: 32.0, fat: 12.0, fiber: 2.0, glycemicIndex: 58, tags: ['Indian', 'Vegetarian', 'Street Food'] },
  { name: 'Fish Curry (Indian)', calories: 140, protein: 16.0, carbs: 5.0, fat: 7.0, fiber: 1.0, glycemicIndex: 25, tags: ['Indian', 'High Protein'] },
  { name: 'Egg Curry', calories: 155, protein: 10.0, carbs: 6.0, fat: 10.5, fiber: 1.0, glycemicIndex: 25, tags: ['Indian', 'High Protein'] },
  { name: 'Mutton Rogan Josh', calories: 190, protein: 18.0, carbs: 5.0, fat: 11.0, fiber: 1.0, glycemicIndex: 20, tags: ['Indian', 'High Protein'] },
  { name: 'Keema (Minced Meat)', calories: 210, protein: 17.0, carbs: 4.0, fat: 14.0, fiber: 0.8, glycemicIndex: 0, tags: ['Indian', 'High Protein'] },
  { name: 'Sambhar', calories: 65, protein: 3.5, carbs: 9.0, fat: 1.5, fiber: 2.5, glycemicIndex: 35, tags: ['Indian', 'Vegetarian', 'South Indian', 'Low Calorie', 'High Fiber'] },
  { name: 'Rasam', calories: 30, protein: 1.5, carbs: 5.0, fat: 0.5, fiber: 1.0, glycemicIndex: 30, tags: ['Indian', 'Vegetarian', 'South Indian', 'Low Calorie'] },
  { name: 'Coconut Chutney', calories: 130, protein: 2.0, carbs: 6.0, fat: 11.0, fiber: 2.5, glycemicIndex: 25, tags: ['Indian', 'Vegetarian', 'South Indian'] },
  { name: 'Thepla', calories: 310, protein: 8.0, carbs: 42.0, fat: 12.0, fiber: 3.0, glycemicIndex: 50, tags: ['Indian', 'Vegetarian', 'Gujarati'] },
  { name: 'Dhokla', calories: 160, protein: 6.0, carbs: 22.0, fat: 5.5, fiber: 2.0, glycemicIndex: 50, tags: ['Indian', 'Vegetarian', 'Gujarati', 'Snack'] },
  { name: 'Khandvi', calories: 140, protein: 5.5, carbs: 18.0, fat: 5.0, fiber: 1.5, glycemicIndex: 48, tags: ['Indian', 'Vegetarian', 'Gujarati', 'Snack'] },
  { name: 'Pesarattu', calories: 150, protein: 7.0, carbs: 20.0, fat: 4.5, fiber: 3.5, glycemicIndex: 42, tags: ['Indian', 'Vegetarian', 'South Indian', 'High Protein'] },

  // ─────────────────────────────────────────────────────────────
  // PROTEINS (35)
  // ─────────────────────────────────────────────────────────────
  { name: 'Chicken Breast (Cooked)', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Low Fat', 'Low Carb'] },
  { name: 'Chicken Thigh (Cooked)', calories: 209, protein: 26.0, carbs: 0.0, fat: 10.9, fiber: 0, glycemicIndex: 0, tags: ['High Protein'] },
  { name: 'Chicken Wings (Cooked)', calories: 266, protein: 24.0, carbs: 0.0, fat: 18.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'High Fat'] },
  { name: 'Chicken Drumstick', calories: 172, protein: 28.0, carbs: 0.0, fat: 5.7, fiber: 0, glycemicIndex: 0, tags: ['High Protein'] },
  { name: 'Turkey Breast', calories: 135, protein: 30.0, carbs: 0.0, fat: 1.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Low Fat', 'Low Carb'] },
  { name: 'Lamb (Cooked)', calories: 258, protein: 25.5, carbs: 0.0, fat: 16.5, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'High Fat'] },
  { name: 'Goat Meat (Cooked)', calories: 143, protein: 27.0, carbs: 0.0, fat: 3.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Low Fat'] },
  { name: 'Beef (Lean, Cooked)', calories: 250, protein: 26.0, carbs: 0.0, fat: 15.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein'] },
  { name: 'Pork Chop (Cooked)', calories: 231, protein: 26.0, carbs: 0.0, fat: 13.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein'] },
  { name: 'Salmon (Cooked)', calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Omega-3', 'Heart Healthy'] },
  { name: 'Tuna (Canned in Water)', calories: 116, protein: 25.5, carbs: 0.0, fat: 0.8, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Low Fat', 'Low Calorie'] },
  { name: 'Tilapia (Cooked)', calories: 128, protein: 26.0, carbs: 0.0, fat: 2.7, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Low Fat'] },
  { name: 'Prawns / Shrimp (Cooked)', calories: 99, protein: 24.0, carbs: 0.2, fat: 0.3, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Low Fat', 'Low Calorie'] },
  { name: 'Sardines (Canned)', calories: 208, protein: 25.0, carbs: 0.0, fat: 11.5, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Omega-3'] },
  { name: 'Mackerel (Cooked)', calories: 262, protein: 24.0, carbs: 0.0, fat: 18.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Omega-3'] },
  { name: 'Pomfret (Cooked)', calories: 138, protein: 23.0, carbs: 0.0, fat: 5.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Indian'] },
  { name: 'Hilsa Fish (Cooked)', calories: 273, protein: 22.0, carbs: 0.0, fat: 20.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Indian', 'Omega-3'] },
  { name: 'Egg (Whole, Boiled)', calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Vegetarian'] },
  { name: 'Egg White (Boiled)', calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Low Fat', 'Low Calorie'] },
  { name: 'Tofu (Firm)', calories: 144, protein: 15.5, carbs: 2.3, fat: 8.7, fiber: 1.2, glycemicIndex: 15, tags: ['High Protein', 'Vegan', 'Low Carb', 'Low GI'] },
  { name: 'Tempeh', calories: 192, protein: 20.0, carbs: 7.6, fat: 10.8, fiber: 5.0, glycemicIndex: 15, tags: ['High Protein', 'Vegan', 'High Fiber', 'Low GI'] },
  { name: 'Paneer (Cottage Cheese, Indian)', calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Vegetarian', 'Indian', 'Low Carb'] },
  { name: 'Soy Chunks (Textured)', calories: 345, protein: 52.0, carbs: 33.0, fat: 0.5, fiber: 13.0, glycemicIndex: 25, tags: ['High Protein', 'Vegan', 'High Fiber', 'Low GI'] },
  { name: 'Seitan', calories: 370, protein: 75.0, carbs: 14.0, fat: 1.9, fiber: 0.6, glycemicIndex: 25, tags: ['High Protein', 'Vegan', 'Low Fat'] },
  { name: 'Edamame (Shelled)', calories: 121, protein: 12.0, carbs: 8.9, fat: 5.2, fiber: 5.2, glycemicIndex: 18, tags: ['High Protein', 'Vegan', 'High Fiber', 'Low GI'] },
  { name: 'Lentils (Cooked)', calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 8.0, glycemicIndex: 32, tags: ['High Protein', 'Vegan', 'High Fiber', 'Low GI'] },
  { name: 'Chickpeas (Cooked)', calories: 164, protein: 8.9, carbs: 27.0, fat: 2.6, fiber: 7.6, glycemicIndex: 33, tags: ['High Protein', 'Vegan', 'High Fiber', 'Low GI'] },
  { name: 'Black Beans (Cooked)', calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7, glycemicIndex: 30, tags: ['High Protein', 'Vegan', 'High Fiber', 'Low GI'] },
  { name: 'Kidney Beans (Cooked)', calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4, glycemicIndex: 29, tags: ['High Protein', 'Vegan', 'High Fiber', 'Low GI'] },
  { name: 'Whey Protein Powder', calories: 400, protein: 80.0, carbs: 10.0, fat: 5.0, fiber: 0, glycemicIndex: 20, tags: ['High Protein', 'Supplement'] },
  { name: 'Greek Yogurt (Low Fat)', calories: 73, protein: 10.0, carbs: 3.6, fat: 2.0, fiber: 0, glycemicIndex: 14, tags: ['High Protein', 'Vegetarian', 'Low Calorie', 'Low GI'] },
  { name: 'Cottage Cheese (Low Fat)', calories: 98, protein: 11.0, carbs: 3.4, fat: 4.3, fiber: 0, glycemicIndex: 10, tags: ['High Protein', 'Vegetarian', 'Low Calorie', 'Low GI'] },
  { name: 'Crab Meat (Cooked)', calories: 97, protein: 19.4, carbs: 0.0, fat: 1.5, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'Low Fat', 'Low Calorie'] },
  { name: 'Squid / Calamari (Cooked)', calories: 175, protein: 18.0, carbs: 7.8, fat: 7.5, fiber: 0, glycemicIndex: 0, tags: ['High Protein'] },
  { name: 'Duck (Cooked)', calories: 337, protein: 19.0, carbs: 0.0, fat: 28.0, fiber: 0, glycemicIndex: 0, tags: ['High Protein', 'High Fat'] },

  // ─────────────────────────────────────────────────────────────
  // FRUITS (35)
  // ─────────────────────────────────────────────────────────────
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14.0, fat: 0.2, fiber: 2.4, glycemicIndex: 36, tags: ['Fruit', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3, fiber: 2.6, glycemicIndex: 51, tags: ['Fruit', 'Vegan'] },
  { name: 'Mango', calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6, glycemicIndex: 51, tags: ['Fruit', 'Vegan', 'Indian'] },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12.0, fat: 0.1, fiber: 2.4, glycemicIndex: 43, tags: ['Fruit', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Grapes (Red/Green)', calories: 69, protein: 0.7, carbs: 18.0, fat: 0.2, fiber: 0.9, glycemicIndex: 46, tags: ['Fruit', 'Vegan'] },
  { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, glycemicIndex: 72, tags: ['Fruit', 'Vegan', 'Low Calorie'] },
  { name: 'Papaya', calories: 43, protein: 0.5, carbs: 11.0, fat: 0.3, fiber: 1.7, glycemicIndex: 60, tags: ['Fruit', 'Vegan', 'Low Calorie'] },
  { name: 'Guava', calories: 68, protein: 2.6, carbs: 14.0, fat: 1.0, fiber: 5.4, glycemicIndex: 12, tags: ['Fruit', 'Vegan', 'High Fiber', 'Low GI', 'Indian'] },
  { name: 'Pomegranate', calories: 83, protein: 1.7, carbs: 19.0, fat: 1.2, fiber: 4.0, glycemicIndex: 35, tags: ['Fruit', 'Vegan', 'Low GI'] },
  { name: 'Strawberry', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, glycemicIndex: 25, tags: ['Fruit', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Blueberry', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, glycemicIndex: 25, tags: ['Fruit', 'Vegan', 'Low GI'] },
  { name: 'Pineapple', calories: 50, protein: 0.5, carbs: 13.0, fat: 0.1, fiber: 1.4, glycemicIndex: 59, tags: ['Fruit', 'Vegan'] },
  { name: 'Kiwi', calories: 61, protein: 1.1, carbs: 15.0, fat: 0.5, fiber: 3.0, glycemicIndex: 39, tags: ['Fruit', 'Vegan', 'Low GI'] },
  { name: 'Peach', calories: 39, protein: 0.9, carbs: 10.0, fat: 0.3, fiber: 1.5, glycemicIndex: 28, tags: ['Fruit', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Pear', calories: 57, protein: 0.4, carbs: 15.0, fat: 0.1, fiber: 3.1, glycemicIndex: 33, tags: ['Fruit', 'Vegan', 'Low GI'] },
  { name: 'Plum', calories: 46, protein: 0.7, carbs: 11.4, fat: 0.3, fiber: 1.4, glycemicIndex: 24, tags: ['Fruit', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Cherry', calories: 50, protein: 1.0, carbs: 12.0, fat: 0.3, fiber: 1.6, glycemicIndex: 22, tags: ['Fruit', 'Vegan', 'Low GI'] },
  { name: 'Lychee', calories: 66, protein: 0.8, carbs: 17.0, fat: 0.4, fiber: 1.3, glycemicIndex: 50, tags: ['Fruit', 'Vegan'] },
  { name: 'Dragonfruit (Pitaya)', calories: 50, protein: 1.1, carbs: 11.0, fat: 0.4, fiber: 3.0, glycemicIndex: 48, tags: ['Fruit', 'Vegan', 'Low Calorie'] },
  { name: 'Cantaloupe (Muskmelon)', calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 0.9, glycemicIndex: 65, tags: ['Fruit', 'Vegan', 'Low Calorie'] },
  { name: 'Coconut (Fresh)', calories: 354, protein: 3.3, carbs: 15.0, fat: 33.0, fiber: 9.0, glycemicIndex: 45, tags: ['Fruit', 'Vegan', 'High Fat', 'High Fiber'] },
  { name: 'Jackfruit (Ripe)', calories: 95, protein: 1.7, carbs: 23.0, fat: 0.6, fiber: 1.5, glycemicIndex: 50, tags: ['Fruit', 'Vegan', 'Indian'] },
  { name: 'Sapodilla (Chikoo)', calories: 83, protein: 0.4, carbs: 20.0, fat: 1.1, fiber: 5.3, glycemicIndex: 55, tags: ['Fruit', 'Vegan', 'Indian', 'High Fiber'] },
  { name: 'Custard Apple (Sitaphal)', calories: 94, protein: 2.1, carbs: 24.0, fat: 0.3, fiber: 4.4, glycemicIndex: 54, tags: ['Fruit', 'Vegan', 'Indian'] },
  { name: 'Fig (Fresh)', calories: 74, protein: 0.8, carbs: 19.0, fat: 0.3, fiber: 2.9, glycemicIndex: 61, tags: ['Fruit', 'Vegan'] },
  { name: 'Dates (Dried)', calories: 277, protein: 1.8, carbs: 75.0, fat: 0.2, fiber: 6.7, glycemicIndex: 42, tags: ['Fruit', 'Vegan', 'High Fiber'] },
  { name: 'Raisins', calories: 299, protein: 3.1, carbs: 79.0, fat: 0.5, fiber: 3.7, glycemicIndex: 64, tags: ['Fruit', 'Vegan'] },
  { name: 'Avocado', calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7, glycemicIndex: 15, tags: ['Fruit', 'Vegan', 'Healthy Fat', 'High Fiber', 'Low GI'] },
  { name: 'Passion Fruit', calories: 97, protein: 2.2, carbs: 23.0, fat: 0.7, fiber: 10.4, glycemicIndex: 30, tags: ['Fruit', 'Vegan', 'High Fiber', 'Low GI'] },
  { name: 'Cranberry (Fresh)', calories: 46, protein: 0.5, carbs: 12.0, fat: 0.1, fiber: 4.6, glycemicIndex: 45, tags: ['Fruit', 'Vegan', 'Low Calorie'] },
  { name: 'Grapefruit', calories: 42, protein: 0.8, carbs: 11.0, fat: 0.1, fiber: 1.6, glycemicIndex: 25, tags: ['Fruit', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Apricot (Fresh)', calories: 48, protein: 1.4, carbs: 11.0, fat: 0.4, fiber: 2.0, glycemicIndex: 34, tags: ['Fruit', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Persimmon', calories: 70, protein: 0.6, carbs: 18.6, fat: 0.2, fiber: 3.6, glycemicIndex: 50, tags: ['Fruit', 'Vegan'] },
  { name: 'Starfruit (Carambola)', calories: 31, protein: 1.0, carbs: 6.7, fat: 0.3, fiber: 2.8, glycemicIndex: 45, tags: ['Fruit', 'Vegan', 'Low Calorie'] },
  { name: 'Jamun (Black Plum)', calories: 60, protein: 0.7, carbs: 14.0, fat: 0.2, fiber: 0.6, glycemicIndex: 25, tags: ['Fruit', 'Vegan', 'Indian', 'Low GI'] },

  // ─────────────────────────────────────────────────────────────
  // VEGETABLES (35)
  // ─────────────────────────────────────────────────────────────
  { name: 'Spinach (Raw)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6, glycemicIndex: 10, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Carrot', calories: 41, protein: 0.9, carbs: 10.0, fat: 0.2, fiber: 2.8, glycemicIndex: 35, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Potato (Boiled)', calories: 87, protein: 1.9, carbs: 20.0, fat: 0.1, fiber: 1.8, glycemicIndex: 78, tags: ['Vegetable', 'Vegan'] },
  { name: 'Sweet Potato (Boiled)', calories: 90, protein: 2.0, carbs: 21.0, fat: 0.1, fiber: 3.0, glycemicIndex: 44, tags: ['Vegetable', 'Vegan', 'Low GI'] },
  { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Onion', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, glycemicIndex: 10, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Capsicum (Bell Pepper)', calories: 26, protein: 1.0, carbs: 6.0, fat: 0.2, fiber: 2.0, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Cauliflower', calories: 25, protein: 1.9, carbs: 5.0, fat: 0.3, fiber: 2.0, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'Low Carb'] },
  { name: 'Cabbage', calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5, glycemicIndex: 10, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Eggplant (Brinjal)', calories: 25, protein: 1.0, carbs: 6.0, fat: 0.2, fiber: 3.0, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Okra (Bhindi)', calories: 33, protein: 1.9, carbs: 7.5, fat: 0.2, fiber: 3.2, glycemicIndex: 20, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'Indian'] },
  { name: 'Green Peas', calories: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1, glycemicIndex: 48, tags: ['Vegetable', 'Vegan', 'High Fiber'] },
  { name: 'Green Beans (French Beans)', calories: 31, protein: 1.8, carbs: 7.0, fat: 0.2, fiber: 2.7, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Mushroom (White)', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0, glycemicIndex: 10, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Zucchini (Courgette)', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1.0, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'Low Carb'] },
  { name: 'Lettuce', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, glycemicIndex: 10, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Kale', calories: 35, protein: 2.9, carbs: 4.4, fat: 1.5, fiber: 4.1, glycemicIndex: 10, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'Superfood'] },
  { name: 'Beetroot', calories: 43, protein: 1.6, carbs: 10.0, fat: 0.2, fiber: 2.8, glycemicIndex: 61, tags: ['Vegetable', 'Vegan', 'Low Calorie'] },
  { name: 'Corn (Sweet)', calories: 86, protein: 3.3, carbs: 19.0, fat: 1.4, fiber: 2.7, glycemicIndex: 52, tags: ['Vegetable', 'Vegan'] },
  { name: 'Radish (Mooli)', calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1, fiber: 1.6, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'Indian'] },
  { name: 'Bottle Gourd (Lauki)', calories: 15, protein: 0.6, carbs: 3.4, fat: 0.0, fiber: 0.5, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'Indian'] },
  { name: 'Ridge Gourd (Turai)', calories: 20, protein: 1.2, carbs: 3.4, fat: 0.2, fiber: 1.1, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'Indian'] },
  { name: 'Bitter Gourd (Karela)', calories: 17, protein: 1.0, carbs: 3.7, fat: 0.2, fiber: 2.8, glycemicIndex: 12, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'Indian'] },
  { name: 'Drumstick (Moringa Pods)', calories: 37, protein: 2.1, carbs: 8.5, fat: 0.2, fiber: 3.2, glycemicIndex: 20, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'Indian'] },
  { name: 'Asparagus', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Celery', calories: 16, protein: 0.7, carbs: 3.0, fat: 0.2, fiber: 1.6, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Brussels Sprouts', calories: 43, protein: 3.4, carbs: 8.9, fat: 0.3, fiber: 3.8, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'High Fiber'] },
  { name: 'Artichoke', calories: 47, protein: 3.3, carbs: 11.0, fat: 0.2, fiber: 5.4, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI', 'High Fiber'] },
  { name: 'Leek', calories: 61, protein: 1.5, carbs: 14.0, fat: 0.3, fiber: 1.8, glycemicIndex: 15, tags: ['Vegetable', 'Vegan', 'Low GI'] },
  { name: 'Turnip', calories: 28, protein: 0.9, carbs: 6.4, fat: 0.1, fiber: 1.8, glycemicIndex: 30, tags: ['Vegetable', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Pumpkin', calories: 26, protein: 1.0, carbs: 6.5, fat: 0.1, fiber: 0.5, glycemicIndex: 75, tags: ['Vegetable', 'Vegan', 'Low Calorie'] },
  { name: 'Garlic', calories: 149, protein: 6.4, carbs: 33.0, fat: 0.5, fiber: 2.1, glycemicIndex: 10, tags: ['Vegetable', 'Vegan', 'Low GI'] },
  { name: 'Ginger (Fresh)', calories: 80, protein: 1.8, carbs: 18.0, fat: 0.8, fiber: 2.0, glycemicIndex: 10, tags: ['Vegetable', 'Vegan', 'Low GI'] },

  // ─────────────────────────────────────────────────────────────
  // GRAINS & CEREALS (25)
  // ─────────────────────────────────────────────────────────────
  { name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, fiber: 0.4, glycemicIndex: 73, tags: ['Grain', 'Vegan'] },
  { name: 'Brown Rice (Cooked)', calories: 123, protein: 2.6, carbs: 26.0, fat: 0.9, fiber: 1.8, glycemicIndex: 50, tags: ['Grain', 'Vegan', 'Whole Grain'] },
  { name: 'Basmati Rice (Cooked)', calories: 121, protein: 3.5, carbs: 25.0, fat: 0.4, fiber: 0.4, glycemicIndex: 58, tags: ['Grain', 'Vegan', 'Indian'] },
  { name: 'Oats (Dry)', calories: 389, protein: 17.0, carbs: 66.0, fat: 7.0, fiber: 10.6, glycemicIndex: 55, tags: ['Grain', 'Vegan', 'Whole Grain', 'High Fiber'] },
  { name: 'Oatmeal (Cooked)', calories: 71, protein: 2.5, carbs: 12.0, fat: 1.5, fiber: 1.7, glycemicIndex: 55, tags: ['Grain', 'Vegan', 'Whole Grain'] },
  { name: 'Quinoa (Cooked)', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, glycemicIndex: 53, tags: ['Grain', 'Vegan', 'High Protein', 'Whole Grain'] },
  { name: 'Whole Wheat Bread', calories: 247, protein: 13.0, carbs: 41.0, fat: 3.4, fiber: 6.8, glycemicIndex: 54, tags: ['Grain', 'Vegetarian', 'Whole Grain', 'High Fiber'] },
  { name: 'White Bread', calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, fiber: 2.7, glycemicIndex: 75, tags: ['Grain', 'Vegetarian'] },
  { name: 'Pasta (Cooked)', calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1, fiber: 1.8, glycemicIndex: 50, tags: ['Grain', 'Vegetarian'] },
  { name: 'Whole Wheat Pasta (Cooked)', calories: 124, protein: 5.3, carbs: 26.5, fat: 0.5, fiber: 3.9, glycemicIndex: 42, tags: ['Grain', 'Vegetarian', 'Whole Grain', 'Low GI'] },
  { name: 'Muesli', calories: 340, protein: 9.0, carbs: 56.0, fat: 10.0, fiber: 7.0, glycemicIndex: 49, tags: ['Grain', 'Vegetarian', 'Whole Grain', 'High Fiber'] },
  { name: 'Cornflakes', calories: 357, protein: 8.0, carbs: 84.0, fat: 0.4, fiber: 0.7, glycemicIndex: 81, tags: ['Grain', 'Vegetarian'] },
  { name: 'Granola', calories: 471, protein: 10.0, carbs: 64.0, fat: 20.0, fiber: 6.5, glycemicIndex: 55, tags: ['Grain', 'Vegetarian'] },
  { name: 'Couscous (Cooked)', calories: 112, protein: 3.8, carbs: 23.0, fat: 0.2, fiber: 1.4, glycemicIndex: 65, tags: ['Grain', 'Vegan'] },
  { name: 'Millet (Bajra, Cooked)', calories: 119, protein: 3.5, carbs: 23.5, fat: 1.7, fiber: 1.3, glycemicIndex: 55, tags: ['Grain', 'Vegan', 'Indian', 'Whole Grain', 'Gluten Free'] },
  { name: 'Ragi (Finger Millet, Cooked)', calories: 104, protein: 2.3, carbs: 22.0, fat: 0.5, fiber: 2.0, glycemicIndex: 52, tags: ['Grain', 'Vegan', 'Indian', 'Whole Grain', 'Gluten Free'] },
  { name: 'Jowar (Sorghum, Cooked)', calories: 117, protein: 3.8, carbs: 25.0, fat: 0.4, fiber: 1.6, glycemicIndex: 48, tags: ['Grain', 'Vegan', 'Indian', 'Whole Grain', 'Gluten Free'] },
  { name: 'Barley (Cooked)', calories: 123, protein: 2.3, carbs: 28.0, fat: 0.4, fiber: 3.8, glycemicIndex: 28, tags: ['Grain', 'Vegan', 'Whole Grain', 'High Fiber', 'Low GI'] },
  { name: 'Buckwheat (Kuttu, Cooked)', calories: 92, protein: 3.4, carbs: 20.0, fat: 0.6, fiber: 2.7, glycemicIndex: 45, tags: ['Grain', 'Vegan', 'Gluten Free', 'Low GI'] },
  { name: 'Amaranth (Rajgira, Cooked)', calories: 102, protein: 3.8, carbs: 19.0, fat: 1.6, fiber: 2.1, glycemicIndex: 35, tags: ['Grain', 'Vegan', 'Indian', 'Gluten Free', 'Low GI'] },
  { name: 'Tortilla (Wheat)', calories: 312, protein: 8.5, carbs: 52.0, fat: 8.0, fiber: 3.0, glycemicIndex: 52, tags: ['Grain', 'Vegetarian'] },
  { name: 'Sourdough Bread', calories: 250, protein: 8.5, carbs: 47.0, fat: 3.0, fiber: 2.5, glycemicIndex: 54, tags: ['Grain', 'Vegetarian'] },
  { name: 'Pita Bread', calories: 275, protein: 9.0, carbs: 55.0, fat: 1.2, fiber: 2.2, glycemicIndex: 57, tags: ['Grain', 'Vegetarian'] },
  { name: 'Rice Cakes', calories: 387, protein: 8.0, carbs: 82.0, fat: 2.8, fiber: 1.7, glycemicIndex: 82, tags: ['Grain', 'Vegan', 'Gluten Free'] },
  { name: 'Semolina (Suji/Rava, Dry)', calories: 360, protein: 13.0, carbs: 73.0, fat: 1.1, fiber: 3.9, glycemicIndex: 55, tags: ['Grain', 'Vegetarian', 'Indian'] },

  // ─────────────────────────────────────────────────────────────
  // DAIRY (18)
  // ─────────────────────────────────────────────────────────────
  { name: 'Whole Milk', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, glycemicIndex: 27, tags: ['Dairy', 'Vegetarian', 'Low GI'] },
  { name: 'Skim Milk', calories: 34, protein: 3.4, carbs: 5.0, fat: 0.1, fiber: 0, glycemicIndex: 32, tags: ['Dairy', 'Vegetarian', 'Low Fat', 'Low Calorie', 'Low GI'] },
  { name: 'Toned Milk', calories: 45, protein: 3.0, carbs: 4.6, fat: 1.5, fiber: 0, glycemicIndex: 30, tags: ['Dairy', 'Vegetarian', 'Indian', 'Low GI'] },
  { name: 'Curd / Yogurt (Plain)', calories: 60, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, glycemicIndex: 14, tags: ['Dairy', 'Vegetarian', 'Low GI', 'Indian'] },
  { name: 'Flavored Yogurt', calories: 99, protein: 4.0, carbs: 15.0, fat: 2.6, fiber: 0, glycemicIndex: 33, tags: ['Dairy', 'Vegetarian', 'Low GI'] },
  { name: 'Cheddar Cheese', calories: 403, protein: 25.0, carbs: 1.3, fat: 33.0, fiber: 0, glycemicIndex: 0, tags: ['Dairy', 'Vegetarian', 'High Protein', 'High Fat', 'Low Carb'] },
  { name: 'Mozzarella Cheese', calories: 280, protein: 28.0, carbs: 3.1, fat: 17.0, fiber: 0, glycemicIndex: 0, tags: ['Dairy', 'Vegetarian', 'High Protein'] },
  { name: 'Parmesan Cheese', calories: 431, protein: 38.0, carbs: 4.1, fat: 29.0, fiber: 0, glycemicIndex: 0, tags: ['Dairy', 'Vegetarian', 'High Protein', 'High Fat'] },
  { name: 'Cream Cheese', calories: 342, protein: 6.0, carbs: 4.1, fat: 34.0, fiber: 0, glycemicIndex: 0, tags: ['Dairy', 'Vegetarian', 'High Fat'] },
  { name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fat: 81.0, fiber: 0, glycemicIndex: 0, tags: ['Dairy', 'Vegetarian', 'High Fat'] },
  { name: 'Ghee (Clarified Butter)', calories: 900, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0, glycemicIndex: 0, tags: ['Dairy', 'Vegetarian', 'High Fat', 'Indian'] },
  { name: 'Heavy Cream', calories: 340, protein: 2.1, carbs: 2.8, fat: 36.0, fiber: 0, glycemicIndex: 0, tags: ['Dairy', 'Vegetarian', 'High Fat'] },
  { name: 'Ice Cream (Vanilla)', calories: 207, protein: 3.5, carbs: 24.0, fat: 11.0, fiber: 0, glycemicIndex: 57, tags: ['Dairy', 'Vegetarian', 'Dessert'] },
  { name: 'Whipped Cream', calories: 257, protein: 3.0, carbs: 12.0, fat: 22.0, fiber: 0, glycemicIndex: 20, tags: ['Dairy', 'Vegetarian', 'High Fat'] },
  { name: 'Buttermilk (Chaas)', calories: 24, protein: 1.5, carbs: 3.5, fat: 0.5, fiber: 0, glycemicIndex: 15, tags: ['Dairy', 'Vegetarian', 'Low Calorie', 'Indian', 'Low GI'] },
  { name: 'Condensed Milk (Sweetened)', calories: 321, protein: 8.0, carbs: 55.0, fat: 9.0, fiber: 0, glycemicIndex: 61, tags: ['Dairy', 'Vegetarian', 'High Sugar'] },
  { name: 'Lassi (Sweet)', calories: 90, protein: 3.0, carbs: 14.0, fat: 2.5, fiber: 0, glycemicIndex: 36, tags: ['Dairy', 'Vegetarian', 'Indian'] },
  { name: 'Khoya (Mawa)', calories: 421, protein: 16.0, carbs: 24.0, fat: 30.0, fiber: 0, glycemicIndex: 32, tags: ['Dairy', 'Vegetarian', 'Indian', 'High Fat'] },

  // ─────────────────────────────────────────────────────────────
  // NUTS & SNACKS (25)
  // ─────────────────────────────────────────────────────────────
  { name: 'Almonds', calories: 579, protein: 21.2, carbs: 22.0, fat: 49.0, fiber: 12.5, glycemicIndex: 15, tags: ['Nut', 'Vegan', 'High Protein', 'High Fat', 'High Fiber', 'Low GI'] },
  { name: 'Cashews', calories: 553, protein: 18.0, carbs: 30.0, fat: 44.0, fiber: 3.3, glycemicIndex: 22, tags: ['Nut', 'Vegan', 'High Protein', 'High Fat', 'Low GI'] },
  { name: 'Peanuts', calories: 567, protein: 26.0, carbs: 16.0, fat: 49.0, fiber: 8.5, glycemicIndex: 14, tags: ['Nut', 'Vegan', 'High Protein', 'High Fat', 'High Fiber', 'Low GI'] },
  { name: 'Walnuts', calories: 654, protein: 15.0, carbs: 14.0, fat: 65.0, fiber: 6.7, glycemicIndex: 15, tags: ['Nut', 'Vegan', 'High Fat', 'Omega-3', 'Low GI'] },
  { name: 'Pistachios', calories: 560, protein: 20.0, carbs: 28.0, fat: 45.0, fiber: 10.0, glycemicIndex: 15, tags: ['Nut', 'Vegan', 'High Protein', 'High Fat', 'High Fiber', 'Low GI'] },
  { name: 'Macadamia Nuts', calories: 718, protein: 8.0, carbs: 14.0, fat: 76.0, fiber: 8.6, glycemicIndex: 10, tags: ['Nut', 'Vegan', 'High Fat', 'Low GI'] },
  { name: 'Peanut Butter', calories: 588, protein: 25.0, carbs: 20.0, fat: 50.0, fiber: 6.0, glycemicIndex: 14, tags: ['Nut', 'Vegan', 'High Protein', 'High Fat', 'Low GI'] },
  { name: 'Almond Butter', calories: 614, protein: 21.0, carbs: 19.0, fat: 56.0, fiber: 10.5, glycemicIndex: 15, tags: ['Nut', 'Vegan', 'High Protein', 'High Fat', 'Low GI'] },
  { name: 'Chia Seeds', calories: 486, protein: 17.0, carbs: 42.0, fat: 31.0, fiber: 34.0, glycemicIndex: 1, tags: ['Seed', 'Vegan', 'High Fiber', 'Omega-3', 'Low GI', 'Superfood'] },
  { name: 'Flax Seeds', calories: 534, protein: 18.0, carbs: 29.0, fat: 42.0, fiber: 27.0, glycemicIndex: 1, tags: ['Seed', 'Vegan', 'High Fiber', 'Omega-3', 'Low GI'] },
  { name: 'Pumpkin Seeds', calories: 559, protein: 30.0, carbs: 11.0, fat: 49.0, fiber: 6.0, glycemicIndex: 15, tags: ['Seed', 'Vegan', 'High Protein', 'Low GI'] },
  { name: 'Sunflower Seeds', calories: 584, protein: 21.0, carbs: 20.0, fat: 51.0, fiber: 8.6, glycemicIndex: 20, tags: ['Seed', 'Vegan', 'High Protein', 'Low GI'] },
  { name: 'Potato Chips', calories: 536, protein: 7.0, carbs: 53.0, fat: 35.0, fiber: 4.4, glycemicIndex: 60, tags: ['Snack', 'High Fat'] },
  { name: 'Tortilla Chips', calories: 490, protein: 7.0, carbs: 58.0, fat: 26.0, fiber: 4.0, glycemicIndex: 63, tags: ['Snack', 'High Fat'] },
  { name: 'Popcorn (Air Popped)', calories: 387, protein: 13.0, carbs: 78.0, fat: 4.5, fiber: 15.0, glycemicIndex: 55, tags: ['Snack', 'Vegan', 'Whole Grain', 'High Fiber'] },
  { name: 'Cookies (Chocolate Chip)', calories: 502, protein: 5.4, carbs: 62.0, fat: 26.0, fiber: 2.5, glycemicIndex: 55, tags: ['Snack', 'Vegetarian', 'Dessert'] },
  { name: 'Dark Chocolate (70%+)', calories: 598, protein: 7.8, carbs: 46.0, fat: 43.0, fiber: 11.0, glycemicIndex: 23, tags: ['Snack', 'Vegetarian', 'Low GI'] },
  { name: 'Milk Chocolate', calories: 535, protein: 8.0, carbs: 59.0, fat: 30.0, fiber: 3.4, glycemicIndex: 42, tags: ['Snack', 'Vegetarian'] },
  { name: 'Protein Bar', calories: 350, protein: 20.0, carbs: 35.0, fat: 14.0, fiber: 5.0, glycemicIndex: 30, tags: ['Snack', 'High Protein'] },
  { name: 'Trail Mix', calories: 462, protein: 14.0, carbs: 44.0, fat: 29.0, fiber: 5.0, glycemicIndex: 30, tags: ['Snack', 'High Fat'] },
  { name: 'Pretzels', calories: 380, protein: 10.0, carbs: 79.0, fat: 3.5, fiber: 2.8, glycemicIndex: 83, tags: ['Snack', 'Vegetarian'] },
  { name: 'Murukku (Chakli)', calories: 430, protein: 8.0, carbs: 55.0, fat: 20.0, fiber: 3.0, glycemicIndex: 58, tags: ['Snack', 'Indian', 'Vegetarian'] },
  { name: 'Namkeen (Mixed)', calories: 480, protein: 10.0, carbs: 48.0, fat: 28.0, fiber: 4.0, glycemicIndex: 55, tags: ['Snack', 'Indian', 'Vegetarian'] },
  { name: 'Chivda (Poha Mix)', calories: 420, protein: 7.0, carbs: 52.0, fat: 22.0, fiber: 3.0, glycemicIndex: 58, tags: ['Snack', 'Indian', 'Vegetarian'] },
  { name: 'Banana Chips', calories: 519, protein: 2.3, carbs: 58.0, fat: 34.0, fiber: 4.0, glycemicIndex: 55, tags: ['Snack', 'Indian', 'Vegan'] },

  // ─────────────────────────────────────────────────────────────
  // FAST FOOD (25)
  // ─────────────────────────────────────────────────────────────
  { name: 'Pizza (Cheese)', calories: 266, protein: 11.0, carbs: 33.0, fat: 10.0, fiber: 2.3, glycemicIndex: 60, tags: ['Fast Food'] },
  { name: 'Pizza (Pepperoni)', calories: 298, protein: 13.0, carbs: 30.0, fat: 14.0, fiber: 2.1, glycemicIndex: 60, tags: ['Fast Food'] },
  { name: 'Hamburger (Regular)', calories: 295, protein: 17.0, carbs: 24.0, fat: 14.0, fiber: 1.3, glycemicIndex: 66, tags: ['Fast Food'] },
  { name: 'Cheeseburger', calories: 330, protein: 19.0, carbs: 26.0, fat: 17.0, fiber: 1.3, glycemicIndex: 66, tags: ['Fast Food'] },
  { name: 'French Fries', calories: 312, protein: 3.4, carbs: 41.0, fat: 15.0, fiber: 3.8, glycemicIndex: 75, tags: ['Fast Food', 'Vegetarian'] },
  { name: 'Chicken Sandwich', calories: 283, protein: 16.0, carbs: 28.0, fat: 12.0, fiber: 1.5, glycemicIndex: 55, tags: ['Fast Food'] },
  { name: 'Club Sandwich', calories: 290, protein: 18.0, carbs: 22.0, fat: 14.0, fiber: 1.5, glycemicIndex: 55, tags: ['Fast Food'] },
  { name: 'Veggie Wrap', calories: 230, protein: 8.0, carbs: 30.0, fat: 9.0, fiber: 3.0, glycemicIndex: 50, tags: ['Fast Food', 'Vegetarian'] },
  { name: 'Chicken Wrap', calories: 270, protein: 15.0, carbs: 28.0, fat: 11.0, fiber: 2.0, glycemicIndex: 50, tags: ['Fast Food'] },
  { name: 'Hot Dog', calories: 290, protein: 10.0, carbs: 24.0, fat: 18.0, fiber: 0.8, glycemicIndex: 68, tags: ['Fast Food'] },
  { name: 'Chicken Nuggets', calories: 296, protein: 15.0, carbs: 16.0, fat: 20.0, fiber: 0.7, glycemicIndex: 46, tags: ['Fast Food'] },
  { name: 'Fish and Chips', calories: 245, protein: 13.0, carbs: 22.0, fat: 12.0, fiber: 2.0, glycemicIndex: 65, tags: ['Fast Food'] },
  { name: 'Fried Chicken (Breaded)', calories: 260, protein: 19.0, carbs: 10.0, fat: 16.0, fiber: 0.5, glycemicIndex: 40, tags: ['Fast Food', 'High Protein'] },
  { name: 'Onion Rings', calories: 332, protein: 4.4, carbs: 41.0, fat: 17.0, fiber: 2.0, glycemicIndex: 60, tags: ['Fast Food', 'Vegetarian'] },
  { name: 'Nachos with Cheese', calories: 346, protein: 9.0, carbs: 36.0, fat: 19.0, fiber: 4.0, glycemicIndex: 58, tags: ['Fast Food'] },
  { name: 'Mozzarella Sticks', calories: 312, protein: 13.0, carbs: 27.0, fat: 17.0, fiber: 1.0, glycemicIndex: 55, tags: ['Fast Food', 'Vegetarian'] },
  { name: 'Garlic Bread', calories: 350, protein: 8.0, carbs: 40.0, fat: 18.0, fiber: 2.0, glycemicIndex: 70, tags: ['Fast Food', 'Vegetarian'] },
  { name: 'Loaded Potato Skins', calories: 280, protein: 9.0, carbs: 25.0, fat: 16.0, fiber: 2.5, glycemicIndex: 60, tags: ['Fast Food'] },
  { name: 'Grilled Cheese Sandwich', calories: 291, protein: 12.0, carbs: 27.0, fat: 16.0, fiber: 1.5, glycemicIndex: 55, tags: ['Fast Food', 'Vegetarian'] },
  { name: 'Sub Sandwich (6 inch)', calories: 250, protein: 14.0, carbs: 30.0, fat: 8.0, fiber: 2.0, glycemicIndex: 55, tags: ['Fast Food'] },
  { name: 'Spring Roll (Fried)', calories: 240, protein: 5.0, carbs: 25.0, fat: 14.0, fiber: 1.5, glycemicIndex: 50, tags: ['Fast Food', 'Vegetarian'] },
  { name: 'Corn Dog', calories: 330, protein: 10.0, carbs: 32.0, fat: 18.0, fiber: 1.0, glycemicIndex: 62, tags: ['Fast Food'] },
  { name: 'Churros', calories: 370, protein: 4.0, carbs: 44.0, fat: 20.0, fiber: 1.0, glycemicIndex: 65, tags: ['Fast Food', 'Dessert', 'Vegetarian'] },
  { name: 'Vada Pav', calories: 300, protein: 6.0, carbs: 40.0, fat: 13.0, fiber: 2.5, glycemicIndex: 60, tags: ['Fast Food', 'Indian', 'Vegetarian', 'Street Food'] },
  { name: 'Frankie / Kathi Roll', calories: 270, protein: 10.0, carbs: 32.0, fat: 12.0, fiber: 2.0, glycemicIndex: 55, tags: ['Fast Food', 'Indian', 'Street Food'] },

  // ─────────────────────────────────────────────────────────────
  // BEVERAGES (20)
  // ─────────────────────────────────────────────────────────────
  { name: 'Black Coffee', calories: 2, protein: 0.3, carbs: 0.0, fat: 0.0, fiber: 0, glycemicIndex: 0, tags: ['Beverage', 'Vegan', 'Low Calorie'] },
  { name: 'Coffee with Milk & Sugar', calories: 30, protein: 1.0, carbs: 5.0, fat: 1.0, fiber: 0, glycemicIndex: 25, tags: ['Beverage', 'Vegetarian'] },
  { name: 'Cappuccino (Whole Milk)', calories: 60, protein: 3.0, carbs: 6.0, fat: 3.0, fiber: 0, glycemicIndex: 25, tags: ['Beverage', 'Vegetarian'] },
  { name: 'Latte (Whole Milk)', calories: 67, protein: 3.4, carbs: 6.7, fat: 3.5, fiber: 0, glycemicIndex: 27, tags: ['Beverage', 'Vegetarian'] },
  { name: 'Espresso', calories: 9, protein: 0.5, carbs: 1.7, fat: 0.2, fiber: 0, glycemicIndex: 0, tags: ['Beverage', 'Vegan', 'Low Calorie'] },
  { name: 'Tea (Black, No Sugar)', calories: 1, protein: 0.0, carbs: 0.3, fat: 0.0, fiber: 0, glycemicIndex: 0, tags: ['Beverage', 'Vegan', 'Low Calorie'] },
  { name: 'Masala Chai (with Milk)', calories: 45, protein: 1.5, carbs: 7.0, fat: 1.5, fiber: 0, glycemicIndex: 30, tags: ['Beverage', 'Vegetarian', 'Indian'] },
  { name: 'Green Tea', calories: 1, protein: 0.2, carbs: 0.0, fat: 0.0, fiber: 0, glycemicIndex: 0, tags: ['Beverage', 'Vegan', 'Low Calorie'] },
  { name: 'Orange Juice (Fresh)', calories: 45, protein: 0.7, carbs: 10.0, fat: 0.2, fiber: 0.2, glycemicIndex: 50, tags: ['Beverage', 'Vegan'] },
  { name: 'Apple Juice', calories: 46, protein: 0.1, carbs: 11.0, fat: 0.1, fiber: 0.1, glycemicIndex: 41, tags: ['Beverage', 'Vegan'] },
  { name: 'Mango Lassi', calories: 85, protein: 3.0, carbs: 14.0, fat: 2.5, fiber: 0.3, glycemicIndex: 40, tags: ['Beverage', 'Vegetarian', 'Indian'] },
  { name: 'Coconut Water', calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 1.1, glycemicIndex: 25, tags: ['Beverage', 'Vegan', 'Low Calorie', 'Low GI'] },
  { name: 'Protein Shake (Whey)', calories: 120, protein: 24.0, carbs: 5.0, fat: 1.5, fiber: 0, glycemicIndex: 20, tags: ['Beverage', 'High Protein', 'Supplement'] },
  { name: 'Smoothie (Fruit)', calories: 50, protein: 0.8, carbs: 12.0, fat: 0.3, fiber: 1.0, glycemicIndex: 45, tags: ['Beverage', 'Vegan'] },
  { name: 'Cola / Soda', calories: 42, protein: 0.0, carbs: 11.0, fat: 0.0, fiber: 0, glycemicIndex: 63, tags: ['Beverage', 'Vegan', 'High Sugar'] },
  { name: 'Diet Soda', calories: 0, protein: 0.0, carbs: 0.0, fat: 0.0, fiber: 0, glycemicIndex: 0, tags: ['Beverage', 'Vegan', 'Low Calorie'] },
  { name: 'Energy Drink', calories: 45, protein: 0.0, carbs: 11.0, fat: 0.0, fiber: 0, glycemicIndex: 70, tags: ['Beverage', 'Vegan'] },
  { name: 'Lemonade (Fresh)', calories: 26, protein: 0.1, carbs: 7.0, fat: 0.0, fiber: 0.1, glycemicIndex: 50, tags: ['Beverage', 'Vegan', 'Low Calorie'] },
  { name: 'Sugarcane Juice', calories: 40, protein: 0.0, carbs: 10.0, fat: 0.0, fiber: 0, glycemicIndex: 43, tags: ['Beverage', 'Vegan', 'Indian'] },
  { name: 'Almond Milk (Unsweetened)', calories: 17, protein: 0.6, carbs: 0.6, fat: 1.4, fiber: 0.2, glycemicIndex: 25, tags: ['Beverage', 'Vegan', 'Low Calorie', 'Low GI'] },

  // ─────────────────────────────────────────────────────────────
  // INTERNATIONAL FOODS (40)
  // ─────────────────────────────────────────────────────────────
  { name: 'Sushi (Salmon Nigiri)', calories: 150, protein: 9.0, carbs: 20.0, fat: 3.5, fiber: 0.3, glycemicIndex: 48, tags: ['Japanese', 'International'] },
  { name: 'Sushi Roll (California)', calories: 140, protein: 6.0, carbs: 20.0, fat: 4.0, fiber: 1.0, glycemicIndex: 50, tags: ['Japanese', 'International'] },
  { name: 'Miso Soup', calories: 40, protein: 3.0, carbs: 5.0, fat: 1.0, fiber: 0.5, glycemicIndex: 30, tags: ['Japanese', 'International', 'Low Calorie'] },
  { name: 'Ramen (Tonkotsu)', calories: 160, protein: 8.0, carbs: 18.0, fat: 6.5, fiber: 1.0, glycemicIndex: 55, tags: ['Japanese', 'International'] },
  { name: 'Edamame (Steamed)', calories: 121, protein: 12.0, carbs: 8.9, fat: 5.2, fiber: 5.2, glycemicIndex: 18, tags: ['Japanese', 'International', 'Vegan', 'High Protein', 'Low GI'] },
  { name: 'Tempura (Vegetable)', calories: 175, protein: 3.0, carbs: 18.0, fat: 10.0, fiber: 1.5, glycemicIndex: 55, tags: ['Japanese', 'International', 'Vegetarian'] },
  { name: 'Pad Thai', calories: 190, protein: 8.0, carbs: 27.0, fat: 6.0, fiber: 1.5, glycemicIndex: 55, tags: ['Thai', 'International'] },
  { name: 'Green Curry (Thai)', calories: 130, protein: 7.0, carbs: 5.0, fat: 10.0, fiber: 1.5, glycemicIndex: 30, tags: ['Thai', 'International'] },
  { name: 'Tom Yum Soup', calories: 45, protein: 3.0, carbs: 4.0, fat: 2.0, fiber: 0.5, glycemicIndex: 25, tags: ['Thai', 'International', 'Low Calorie'] },
  { name: 'Satay (Chicken) with Peanut Sauce', calories: 210, protein: 15.0, carbs: 8.0, fat: 14.0, fiber: 1.0, glycemicIndex: 25, tags: ['Thai', 'International', 'High Protein'] },
  { name: 'Fried Rice (Egg)', calories: 186, protein: 5.0, carbs: 28.0, fat: 6.0, fiber: 1.0, glycemicIndex: 62, tags: ['Chinese', 'International'] },
  { name: 'Noodles (Chow Mein)', calories: 220, protein: 8.0, carbs: 32.0, fat: 7.0, fiber: 2.0, glycemicIndex: 55, tags: ['Chinese', 'International'] },
  { name: 'Sweet and Sour Chicken', calories: 180, protein: 12.0, carbs: 18.0, fat: 7.0, fiber: 1.0, glycemicIndex: 50, tags: ['Chinese', 'International'] },
  { name: 'Kung Pao Chicken', calories: 170, protein: 14.0, carbs: 10.0, fat: 9.0, fiber: 1.5, glycemicIndex: 35, tags: ['Chinese', 'International', 'High Protein'] },
  { name: 'Dim Sum (Steamed)', calories: 150, protein: 7.0, carbs: 18.0, fat: 5.0, fiber: 0.5, glycemicIndex: 50, tags: ['Chinese', 'International'] },
  { name: 'Wonton Soup', calories: 70, protein: 4.0, carbs: 8.0, fat: 2.0, fiber: 0.5, glycemicIndex: 48, tags: ['Chinese', 'International', 'Low Calorie'] },
  { name: 'Hummus', calories: 166, protein: 8.0, carbs: 14.0, fat: 10.0, fiber: 6.0, glycemicIndex: 6, tags: ['Mediterranean', 'International', 'Vegan', 'High Fiber', 'Low GI'] },
  { name: 'Falafel', calories: 333, protein: 13.0, carbs: 32.0, fat: 18.0, fiber: 5.5, glycemicIndex: 32, tags: ['Mediterranean', 'International', 'Vegan', 'Low GI'] },
  { name: 'Shawarma (Chicken)', calories: 200, protein: 16.0, carbs: 14.0, fat: 9.0, fiber: 1.5, glycemicIndex: 40, tags: ['Mediterranean', 'International', 'High Protein'] },
  { name: 'Tabbouleh', calories: 100, protein: 2.5, carbs: 12.0, fat: 5.0, fiber: 2.5, glycemicIndex: 30, tags: ['Mediterranean', 'International', 'Vegan', 'Low GI'] },
  { name: 'Baba Ganoush', calories: 120, protein: 2.5, carbs: 8.0, fat: 9.0, fiber: 3.0, glycemicIndex: 25, tags: ['Mediterranean', 'International', 'Vegan', 'Low GI'] },
  { name: 'Tacos (Beef)', calories: 226, protein: 12.0, carbs: 20.0, fat: 11.0, fiber: 2.5, glycemicIndex: 50, tags: ['Mexican', 'International'] },
  { name: 'Burritos (Chicken)', calories: 195, protein: 10.0, carbs: 24.0, fat: 7.0, fiber: 3.0, glycemicIndex: 48, tags: ['Mexican', 'International'] },
  { name: 'Quesadilla', calories: 260, protein: 12.0, carbs: 25.0, fat: 13.0, fiber: 1.5, glycemicIndex: 50, tags: ['Mexican', 'International'] },
  { name: 'Guacamole', calories: 160, protein: 2.0, carbs: 9.0, fat: 15.0, fiber: 7.0, glycemicIndex: 15, tags: ['Mexican', 'International', 'Vegan', 'Healthy Fat', 'Low GI'] },
  { name: 'Enchiladas (Chicken)', calories: 168, protein: 10.0, carbs: 15.0, fat: 8.0, fiber: 2.5, glycemicIndex: 45, tags: ['Mexican', 'International'] },
  { name: 'Spaghetti Bolognese', calories: 150, protein: 8.0, carbs: 17.0, fat: 5.0, fiber: 1.5, glycemicIndex: 45, tags: ['Italian', 'International'] },
  { name: 'Lasagna', calories: 175, protein: 10.0, carbs: 15.0, fat: 8.0, fiber: 1.0, glycemicIndex: 47, tags: ['Italian', 'International'] },
  { name: 'Risotto', calories: 135, protein: 3.5, carbs: 20.0, fat: 4.5, fiber: 0.5, glycemicIndex: 58, tags: ['Italian', 'International'] },
  { name: 'Pesto Pasta', calories: 180, protein: 6.0, carbs: 23.0, fat: 7.5, fiber: 1.5, glycemicIndex: 48, tags: ['Italian', 'International', 'Vegetarian'] },
  { name: 'Bruschetta', calories: 200, protein: 5.0, carbs: 25.0, fat: 9.0, fiber: 1.5, glycemicIndex: 55, tags: ['Italian', 'International', 'Vegetarian'] },
  { name: 'Paella (Seafood)', calories: 150, protein: 8.0, carbs: 19.0, fat: 5.0, fiber: 1.0, glycemicIndex: 55, tags: ['Spanish', 'International'] },
  { name: 'Gyros (Lamb)', calories: 235, protein: 13.0, carbs: 18.0, fat: 12.0, fiber: 1.5, glycemicIndex: 48, tags: ['Greek', 'International'] },
  { name: 'Greek Salad', calories: 95, protein: 3.0, carbs: 6.0, fat: 7.0, fiber: 1.5, glycemicIndex: 10, tags: ['Greek', 'International', 'Vegetarian', 'Low Calorie', 'Low GI'] },
  { name: 'Moussaka', calories: 160, protein: 9.0, carbs: 10.0, fat: 10.0, fiber: 2.0, glycemicIndex: 40, tags: ['Greek', 'International'] },
  { name: 'Baklava', calories: 420, protein: 6.0, carbs: 50.0, fat: 22.0, fiber: 2.0, glycemicIndex: 55, tags: ['Mediterranean', 'International', 'Dessert'] },
  { name: 'Pho (Vietnamese Beef)', calories: 60, protein: 4.0, carbs: 7.0, fat: 1.5, fiber: 0.5, glycemicIndex: 50, tags: ['Vietnamese', 'International', 'Low Calorie'] },
  { name: 'Bibimbap (Korean)', calories: 160, protein: 7.0, carbs: 24.0, fat: 4.5, fiber: 2.0, glycemicIndex: 55, tags: ['Korean', 'International'] },
  { name: 'Kimchi', calories: 15, protein: 1.1, carbs: 2.4, fat: 0.5, fiber: 1.6, glycemicIndex: 10, tags: ['Korean', 'International', 'Vegan', 'Low Calorie', 'Fermented', 'Low GI'] },
  { name: 'Croissant', calories: 406, protein: 8.2, carbs: 46.0, fat: 21.0, fiber: 2.6, glycemicIndex: 67, tags: ['French', 'International', 'Vegetarian'] },

  // ─────────────────────────────────────────────────────────────
  // CONDIMENTS, OILS & MISCELLANEOUS (20)
  // ─────────────────────────────────────────────────────────────
  { name: 'Olive Oil', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0, glycemicIndex: 0, tags: ['Oil', 'Vegan', 'Healthy Fat'] },
  { name: 'Coconut Oil', calories: 862, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0, glycemicIndex: 0, tags: ['Oil', 'Vegan'] },
  { name: 'Mustard Oil', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0, glycemicIndex: 0, tags: ['Oil', 'Vegan', 'Indian'] },
  { name: 'Sunflower Oil', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0, glycemicIndex: 0, tags: ['Oil', 'Vegan'] },
  { name: 'Honey', calories: 304, protein: 0.3, carbs: 82.0, fat: 0.0, fiber: 0.2, glycemicIndex: 58, tags: ['Sweetener', 'Vegetarian'] },
  { name: 'Jaggery (Gur)', calories: 383, protein: 0.4, carbs: 98.0, fat: 0.1, fiber: 0, glycemicIndex: 65, tags: ['Sweetener', 'Vegan', 'Indian'] },
  { name: 'Sugar (White)', calories: 387, protein: 0.0, carbs: 100.0, fat: 0.0, fiber: 0, glycemicIndex: 65, tags: ['Sweetener', 'Vegan'] },
  { name: 'Maple Syrup', calories: 260, protein: 0.0, carbs: 67.0, fat: 0.1, fiber: 0, glycemicIndex: 54, tags: ['Sweetener', 'Vegan'] },
  { name: 'Ketchup', calories: 112, protein: 1.7, carbs: 26.0, fat: 0.4, fiber: 0.3, glycemicIndex: 45, tags: ['Condiment', 'Vegan'] },
  { name: 'Mayonnaise', calories: 680, protein: 1.0, carbs: 0.6, fat: 75.0, fiber: 0, glycemicIndex: 0, tags: ['Condiment', 'Vegetarian', 'High Fat'] },
  { name: 'Soy Sauce', calories: 53, protein: 5.0, carbs: 5.0, fat: 0.0, fiber: 0, glycemicIndex: 15, tags: ['Condiment', 'Vegan', 'Low Calorie'] },
  { name: 'Hot Sauce', calories: 11, protein: 0.5, carbs: 2.0, fat: 0.2, fiber: 0.5, glycemicIndex: 10, tags: ['Condiment', 'Vegan', 'Low Calorie'] },
  { name: 'Pickle (Indian Mango)', calories: 185, protein: 1.0, carbs: 6.0, fat: 18.0, fiber: 1.0, glycemicIndex: 20, tags: ['Condiment', 'Indian', 'Vegan'] },
  { name: 'Chutney (Mint)', calories: 20, protein: 0.5, carbs: 3.5, fat: 0.5, fiber: 1.0, glycemicIndex: 10, tags: ['Condiment', 'Indian', 'Vegan', 'Low Calorie'] },
  { name: 'Tahini', calories: 595, protein: 17.0, carbs: 21.0, fat: 54.0, fiber: 9.3, glycemicIndex: 15, tags: ['Condiment', 'Vegan', 'High Fat', 'Low GI'] },
  { name: 'Salsa (Tomato)', calories: 36, protein: 1.5, carbs: 7.0, fat: 0.2, fiber: 1.5, glycemicIndex: 20, tags: ['Condiment', 'Vegan', 'Low Calorie'] },
  { name: 'Mustard', calories: 66, protein: 4.4, carbs: 5.8, fat: 3.3, fiber: 3.2, glycemicIndex: 10, tags: ['Condiment', 'Vegan', 'Low Calorie'] },
  { name: 'Vinegar', calories: 18, protein: 0.0, carbs: 0.6, fat: 0.0, fiber: 0, glycemicIndex: 0, tags: ['Condiment', 'Vegan', 'Low Calorie'] },
  { name: 'Papad (Roasted)', calories: 320, protein: 20.0, carbs: 46.0, fat: 5.0, fiber: 3.5, glycemicIndex: 50, tags: ['Indian', 'Vegetarian'] },
  { name: 'Coconut Milk', calories: 230, protein: 2.3, carbs: 6.0, fat: 24.0, fiber: 0, glycemicIndex: 15, tags: ['Vegan', 'High Fat', 'Low GI'] },

  // ─────────────────────────────────────────────────────────────
  // ADDITIONAL INDIAN FOODS — Regional, Beverages, Snacks (70+)
  // ─────────────────────────────────────────────────────────────
  // Bengali
  { name: 'Machher Jhol (Bengali Fish Curry)', calories: 130, protein: 14.0, carbs: 6.0, fat: 6.0, fiber: 1.0, glycemicIndex: 25, tags: ['Indian', 'Bengali', 'High Protein'] },
  { name: 'Kosha Mangsho (Bengali Mutton)', calories: 210, protein: 18.0, carbs: 5.0, fat: 13.0, fiber: 1.0, glycemicIndex: 20, tags: ['Indian', 'Bengali', 'High Protein'] },
  { name: 'Luchi', calories: 350, protein: 6.0, carbs: 45.0, fat: 17.0, fiber: 1.0, glycemicIndex: 68, tags: ['Indian', 'Bengali', 'Vegetarian'] },
  { name: 'Sandesh', calories: 280, protein: 8.0, carbs: 42.0, fat: 10.0, fiber: 0.2, glycemicIndex: 60, tags: ['Indian', 'Bengali', 'Vegetarian', 'Dessert'] },
  { name: 'Rasgulla', calories: 186, protein: 5.0, carbs: 35.0, fat: 3.5, fiber: 0.0, glycemicIndex: 70, tags: ['Indian', 'Bengali', 'Vegetarian', 'Dessert'] },
  { name: 'Mishti Doi (Sweet Yogurt)', calories: 115, protein: 3.5, carbs: 18.0, fat: 3.5, fiber: 0.0, glycemicIndex: 50, tags: ['Indian', 'Bengali', 'Vegetarian', 'Dessert'] },
  { name: 'Shukto (Mixed Vegetable Bengali)', calories: 90, protein: 2.5, carbs: 10.0, fat: 4.5, fiber: 3.0, glycemicIndex: 35, tags: ['Indian', 'Bengali', 'Vegetarian', 'Low Calorie'] },

  // Rajasthani
  { name: 'Dal Baati Churma', calories: 350, protein: 10.0, carbs: 48.0, fat: 14.0, fiber: 3.0, glycemicIndex: 55, tags: ['Indian', 'Rajasthani', 'Vegetarian'] },
  { name: 'Gatte Ki Sabzi', calories: 160, protein: 6.5, carbs: 18.0, fat: 7.5, fiber: 2.0, glycemicIndex: 42, tags: ['Indian', 'Rajasthani', 'Vegetarian'] },
  { name: 'Ker Sangri', calories: 120, protein: 4.0, carbs: 12.0, fat: 6.5, fiber: 5.0, glycemicIndex: 30, tags: ['Indian', 'Rajasthani', 'Vegetarian', 'High Fiber', 'Low GI'] },
  { name: 'Laal Maas (Red Meat Curry)', calories: 220, protein: 20.0, carbs: 4.0, fat: 14.0, fiber: 1.0, glycemicIndex: 15, tags: ['Indian', 'Rajasthani', 'High Protein', 'Low GI'] },
  { name: 'Pyaaz Kachori', calories: 340, protein: 6.0, carbs: 38.0, fat: 18.0, fiber: 2.5, glycemicIndex: 55, tags: ['Indian', 'Rajasthani', 'Vegetarian', 'Snack'] },

  // Maharashtrian
  { name: 'Misal Pav', calories: 280, protein: 10.0, carbs: 35.0, fat: 11.0, fiber: 5.0, glycemicIndex: 52, tags: ['Indian', 'Maharashtrian', 'Vegetarian', 'High Fiber'] },
  { name: 'Vada Pav', calories: 290, protein: 6.0, carbs: 40.0, fat: 12.0, fiber: 2.5, glycemicIndex: 58, tags: ['Indian', 'Maharashtrian', 'Vegetarian', 'Street Food'] },
  { name: 'Puran Poli', calories: 315, protein: 7.0, carbs: 55.0, fat: 8.5, fiber: 3.0, glycemicIndex: 55, tags: ['Indian', 'Maharashtrian', 'Vegetarian', 'Dessert'] },
  { name: 'Sabudana Khichdi', calories: 195, protein: 3.0, carbs: 35.0, fat: 5.5, fiber: 0.5, glycemicIndex: 67, tags: ['Indian', 'Maharashtrian', 'Vegetarian'] },
  { name: 'Thalipeeth', calories: 230, protein: 7.0, carbs: 32.0, fat: 9.0, fiber: 4.0, glycemicIndex: 48, tags: ['Indian', 'Maharashtrian', 'Vegetarian', 'High Fiber'] },
  { name: 'Batata Vada', calories: 260, protein: 5.0, carbs: 32.0, fat: 13.0, fiber: 2.5, glycemicIndex: 55, tags: ['Indian', 'Maharashtrian', 'Vegetarian', 'Snack'] },

  // Kerala
  { name: 'Appam', calories: 120, protein: 2.0, carbs: 22.0, fat: 2.5, fiber: 0.8, glycemicIndex: 60, tags: ['Indian', 'Kerala', 'Vegetarian', 'South Indian'] },
  { name: 'Puttu', calories: 210, protein: 4.0, carbs: 38.0, fat: 5.0, fiber: 2.0, glycemicIndex: 62, tags: ['Indian', 'Kerala', 'Vegetarian', 'South Indian'] },
  { name: 'Kerala Fish Curry', calories: 120, protein: 15.0, carbs: 5.0, fat: 5.0, fiber: 1.0, glycemicIndex: 25, tags: ['Indian', 'Kerala', 'High Protein', 'South Indian'] },
  { name: 'Avial', calories: 95, protein: 3.0, carbs: 8.0, fat: 6.5, fiber: 3.5, glycemicIndex: 30, tags: ['Indian', 'Kerala', 'Vegetarian', 'South Indian', 'Low Calorie'] },
  { name: 'Kerala Parotta', calories: 340, protein: 7.0, carbs: 48.0, fat: 14.0, fiber: 1.5, glycemicIndex: 65, tags: ['Indian', 'Kerala', 'Vegetarian', 'South Indian'] },
  { name: 'Payasam (Kheer, Kerala)', calories: 170, protein: 4.0, carbs: 28.0, fat: 5.5, fiber: 0.5, glycemicIndex: 62, tags: ['Indian', 'Kerala', 'Vegetarian', 'Dessert', 'South Indian'] },
  { name: 'Thoran (Coconut Stir-fry)', calories: 100, protein: 2.5, carbs: 7.0, fat: 7.5, fiber: 3.0, glycemicIndex: 25, tags: ['Indian', 'Kerala', 'Vegetarian', 'South Indian', 'Low Calorie'] },

  // Andhra / Telangana
  { name: 'Hyderabadi Biryani', calories: 215, protein: 11.0, carbs: 26.0, fat: 8.0, fiber: 1.0, glycemicIndex: 62, tags: ['Indian', 'Andhra', 'High Protein'] },
  { name: 'Gongura Pickle', calories: 60, protein: 1.0, carbs: 3.0, fat: 5.0, fiber: 2.0, glycemicIndex: 15, tags: ['Indian', 'Andhra', 'Vegetarian', 'Low Calorie'] },
  { name: 'Pesarattu', calories: 150, protein: 7.0, carbs: 20.0, fat: 4.5, fiber: 3.5, glycemicIndex: 42, tags: ['Indian', 'Andhra', 'Vegetarian', 'South Indian', 'High Protein'] },
  { name: 'Andhra Chicken Curry', calories: 185, protein: 16.0, carbs: 6.0, fat: 11.0, fiber: 1.5, glycemicIndex: 25, tags: ['Indian', 'Andhra', 'High Protein'] },
  { name: 'Pulihora (Tamarind Rice)', calories: 175, protein: 3.5, carbs: 30.0, fat: 5.0, fiber: 1.0, glycemicIndex: 58, tags: ['Indian', 'Andhra', 'Vegetarian', 'South Indian'] },

  // Punjabi
  { name: 'Sarson Ka Saag', calories: 120, protein: 4.0, carbs: 8.0, fat: 8.5, fiber: 4.0, glycemicIndex: 20, tags: ['Indian', 'Punjabi', 'Vegetarian', 'High Fiber', 'Low GI'] },
  { name: 'Makki Ki Roti', calories: 275, protein: 6.0, carbs: 52.0, fat: 5.0, fiber: 3.5, glycemicIndex: 55, tags: ['Indian', 'Punjabi', 'Vegetarian', 'Whole Grain'] },
  { name: 'Chole Bhature', calories: 370, protein: 10.0, carbs: 48.0, fat: 16.0, fiber: 4.0, glycemicIndex: 55, tags: ['Indian', 'Punjabi', 'Vegetarian'] },
  { name: 'Kadhi Pakora', calories: 140, protein: 5.0, carbs: 12.0, fat: 8.5, fiber: 1.5, glycemicIndex: 35, tags: ['Indian', 'Punjabi', 'Vegetarian'] },
  { name: 'Amritsari Kulcha', calories: 320, protein: 8.0, carbs: 46.0, fat: 12.0, fiber: 2.0, glycemicIndex: 60, tags: ['Indian', 'Punjabi', 'Vegetarian'] },
  { name: 'Pinni', calories: 440, protein: 8.0, carbs: 48.0, fat: 26.0, fiber: 2.5, glycemicIndex: 55, tags: ['Indian', 'Punjabi', 'Vegetarian', 'Dessert'] },

  // Tamil Nadu
  { name: 'Pongal (Ven Pongal)', calories: 160, protein: 4.5, carbs: 25.0, fat: 5.0, fiber: 1.5, glycemicIndex: 55, tags: ['Indian', 'Tamil Nadu', 'Vegetarian', 'South Indian'] },
  { name: 'Chettinad Chicken', calories: 195, protein: 18.0, carbs: 5.0, fat: 12.0, fiber: 1.5, glycemicIndex: 20, tags: ['Indian', 'Tamil Nadu', 'High Protein', 'South Indian'] },
  { name: 'Kothu Parotta', calories: 280, protein: 8.0, carbs: 35.0, fat: 12.0, fiber: 2.0, glycemicIndex: 58, tags: ['Indian', 'Tamil Nadu', 'South Indian'] },
  { name: 'Murukku', calories: 450, protein: 8.0, carbs: 55.0, fat: 22.0, fiber: 2.0, glycemicIndex: 60, tags: ['Indian', 'Tamil Nadu', 'Vegetarian', 'Snack', 'South Indian'] },
  { name: 'Adai (Lentil Dosa)', calories: 180, protein: 7.0, carbs: 24.0, fat: 6.5, fiber: 4.0, glycemicIndex: 42, tags: ['Indian', 'Tamil Nadu', 'Vegetarian', 'South Indian', 'High Fiber'] },

  // Indian Beverages
  { name: 'Masala Chai', calories: 45, protein: 1.5, carbs: 7.0, fat: 1.5, fiber: 0.0, glycemicIndex: 40, tags: ['Indian', 'Beverage', 'Vegetarian'] },
  { name: 'Sweet Lassi', calories: 120, protein: 4.0, carbs: 18.0, fat: 3.5, fiber: 0.0, glycemicIndex: 45, tags: ['Indian', 'Beverage', 'Vegetarian'] },
  { name: 'Salt Lassi (Chaas)', calories: 40, protein: 2.5, carbs: 4.0, fat: 1.5, fiber: 0.0, glycemicIndex: 25, tags: ['Indian', 'Beverage', 'Vegetarian', 'Low Calorie'] },
  { name: 'Mango Lassi', calories: 140, protein: 4.0, carbs: 24.0, fat: 3.5, fiber: 0.5, glycemicIndex: 50, tags: ['Indian', 'Beverage', 'Vegetarian'] },
  { name: 'Badam Milk (Almond Milk Indian)', calories: 130, protein: 5.0, carbs: 16.0, fat: 5.5, fiber: 0.5, glycemicIndex: 35, tags: ['Indian', 'Beverage', 'Vegetarian'] },
  { name: 'Thandai', calories: 150, protein: 4.5, carbs: 20.0, fat: 6.0, fiber: 1.0, glycemicIndex: 42, tags: ['Indian', 'Beverage', 'Vegetarian'] },
  { name: 'Jaljeera', calories: 20, protein: 0.5, carbs: 4.0, fat: 0.2, fiber: 0.5, glycemicIndex: 15, tags: ['Indian', 'Beverage', 'Vegan', 'Low Calorie'] },
  { name: 'Aam Panna', calories: 55, protein: 0.5, carbs: 13.0, fat: 0.2, fiber: 0.5, glycemicIndex: 40, tags: ['Indian', 'Beverage', 'Vegan', 'Low Calorie'] },
  { name: 'Filter Coffee (South Indian)', calories: 50, protein: 1.5, carbs: 6.0, fat: 2.0, fiber: 0.0, glycemicIndex: 35, tags: ['Indian', 'Beverage', 'South Indian'] },
  { name: 'Nimbu Pani (Lemon Water)', calories: 25, protein: 0.2, carbs: 6.0, fat: 0.0, fiber: 0.0, glycemicIndex: 20, tags: ['Indian', 'Beverage', 'Vegan', 'Low Calorie'] },

  // Indian Breakfast / Tiffin items
  { name: 'Aloo Poha', calories: 180, protein: 3.5, carbs: 30.0, fat: 5.5, fiber: 2.0, glycemicIndex: 60, tags: ['Indian', 'Vegetarian', 'Breakfast'] },
  { name: 'Bread Pakora', calories: 300, protein: 6.0, carbs: 35.0, fat: 15.0, fiber: 1.5, glycemicIndex: 58, tags: ['Indian', 'Vegetarian', 'Snack'] },
  { name: 'Kanda Bhaji (Onion Pakoda)', calories: 280, protein: 5.0, carbs: 28.0, fat: 16.0, fiber: 2.0, glycemicIndex: 52, tags: ['Indian', 'Vegetarian', 'Snack'] },
  { name: 'Rava Idli', calories: 140, protein: 4.0, carbs: 22.0, fat: 3.5, fiber: 1.5, glycemicIndex: 58, tags: ['Indian', 'Vegetarian', 'South Indian', 'Breakfast'] },
  { name: 'Set Dosa', calories: 150, protein: 3.5, carbs: 26.0, fat: 3.5, fiber: 1.0, glycemicIndex: 62, tags: ['Indian', 'Vegetarian', 'South Indian', 'Breakfast'] },
  { name: 'Paratha Aloo (Stuffed)', calories: 310, protein: 6.5, carbs: 42.0, fat: 13.0, fiber: 2.5, glycemicIndex: 58, tags: ['Indian', 'Vegetarian', 'Breakfast'] },
  { name: 'Moong Dal Cheela', calories: 150, protein: 8.0, carbs: 18.0, fat: 5.0, fiber: 3.0, glycemicIndex: 35, tags: ['Indian', 'Vegetarian', 'Breakfast', 'High Protein', 'Low GI'] },
  { name: 'Besan Cheela', calories: 165, protein: 7.0, carbs: 20.0, fat: 6.5, fiber: 3.5, glycemicIndex: 38, tags: ['Indian', 'Vegetarian', 'Breakfast', 'High Protein', 'Low GI'] },

  // More Indian desserts & sweets
  { name: 'Barfi (Kaju Katli)', calories: 390, protein: 8.0, carbs: 52.0, fat: 18.0, fiber: 0.5, glycemicIndex: 60, tags: ['Indian', 'Vegetarian', 'Dessert'] },
  { name: 'Halwa (Gajar Ka)', calories: 225, protein: 3.0, carbs: 32.0, fat: 10.0, fiber: 1.5, glycemicIndex: 55, tags: ['Indian', 'Vegetarian', 'Dessert'] },
  { name: 'Halwa (Sooji)', calories: 250, protein: 4.0, carbs: 35.0, fat: 11.0, fiber: 0.8, glycemicIndex: 58, tags: ['Indian', 'Vegetarian', 'Dessert'] },
  { name: 'Rasmalai', calories: 200, protein: 6.0, carbs: 28.0, fat: 8.0, fiber: 0.0, glycemicIndex: 55, tags: ['Indian', 'Vegetarian', 'Dessert'] },
  { name: 'Phirni', calories: 150, protein: 3.5, carbs: 24.0, fat: 5.0, fiber: 0.3, glycemicIndex: 55, tags: ['Indian', 'Vegetarian', 'Dessert'] },
  { name: 'Shrikhand', calories: 180, protein: 5.0, carbs: 26.0, fat: 7.0, fiber: 0.0, glycemicIndex: 48, tags: ['Indian', 'Vegetarian', 'Dessert'] },
  { name: 'Malpua', calories: 350, protein: 5.0, carbs: 50.0, fat: 15.0, fiber: 1.0, glycemicIndex: 65, tags: ['Indian', 'Vegetarian', 'Dessert'] },

  // North-East Indian
  { name: 'Momos (Steamed Veg)', calories: 140, protein: 5.0, carbs: 22.0, fat: 3.5, fiber: 1.5, glycemicIndex: 45, tags: ['Indian', 'North-East', 'Vegetarian', 'Snack'] },
  { name: 'Momos (Steamed Chicken)', calories: 160, protein: 10.0, carbs: 18.0, fat: 5.0, fiber: 1.0, glycemicIndex: 42, tags: ['Indian', 'North-East', 'High Protein', 'Snack'] },
  { name: 'Fried Momos', calories: 250, protein: 7.0, carbs: 25.0, fat: 14.0, fiber: 1.0, glycemicIndex: 50, tags: ['Indian', 'North-East', 'Snack'] },
  { name: 'Thukpa (Noodle Soup)', calories: 120, protein: 6.0, carbs: 16.0, fat: 3.5, fiber: 1.5, glycemicIndex: 42, tags: ['Indian', 'North-East', 'Low Calorie'] },

  // Common Indian lentil/sabzi varieties
  { name: 'Toor Dal (Plain)', calories: 120, protein: 7.0, carbs: 16.0, fat: 3.0, fiber: 4.0, glycemicIndex: 32, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Urad Dal (Black Gram)', calories: 130, protein: 8.0, carbs: 14.0, fat: 5.0, fiber: 4.5, glycemicIndex: 30, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Masoor Dal (Red Lentil)', calories: 115, protein: 7.5, carbs: 15.0, fat: 2.5, fiber: 3.5, glycemicIndex: 28, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Mixed Dal', calories: 125, protein: 7.5, carbs: 15.0, fat: 3.5, fiber: 4.0, glycemicIndex: 30, tags: ['Indian', 'Vegetarian', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Lauki Ki Sabzi (Bottle Gourd)', calories: 65, protein: 1.5, carbs: 8.0, fat: 3.0, fiber: 2.5, glycemicIndex: 25, tags: ['Indian', 'Vegetarian', 'Low Calorie', 'Low GI'] },
  { name: 'Karela Sabzi (Bitter Gourd)', calories: 80, protein: 2.0, carbs: 6.0, fat: 5.5, fiber: 3.0, glycemicIndex: 15, tags: ['Indian', 'Vegetarian', 'Low Calorie', 'Low GI'] },
  { name: 'Methi Aloo', calories: 130, protein: 3.5, carbs: 16.0, fat: 6.5, fiber: 3.0, glycemicIndex: 40, tags: ['Indian', 'Vegetarian'] },
  { name: 'Tinda Masala', calories: 75, protein: 1.5, carbs: 8.0, fat: 4.0, fiber: 2.5, glycemicIndex: 25, tags: ['Indian', 'Vegetarian', 'Low Calorie', 'Low GI'] },
  { name: 'Sev Tameta (Tomato Sev Curry)', calories: 165, protein: 3.5, carbs: 18.0, fat: 9.0, fiber: 2.0, glycemicIndex: 45, tags: ['Indian', 'Gujarati', 'Vegetarian'] },
  { name: 'Undhiyu (Gujarati Mixed Veg)', calories: 180, protein: 5.0, carbs: 18.0, fat: 10.0, fiber: 5.0, glycemicIndex: 35, tags: ['Indian', 'Gujarati', 'Vegetarian', 'High Fiber'] },

  // Indian Rice dishes
  { name: 'Curd Rice (Thayir Sadam)', calories: 140, protein: 4.0, carbs: 22.0, fat: 4.0, fiber: 0.5, glycemicIndex: 48, tags: ['Indian', 'South Indian', 'Vegetarian'] },
  { name: 'Lemon Rice', calories: 165, protein: 3.0, carbs: 28.0, fat: 5.0, fiber: 1.0, glycemicIndex: 55, tags: ['Indian', 'South Indian', 'Vegetarian'] },
  { name: 'Bisi Bele Bath', calories: 185, protein: 6.0, carbs: 28.0, fat: 5.5, fiber: 3.0, glycemicIndex: 50, tags: ['Indian', 'South Indian', 'Vegetarian', 'Karnataka'] },
  { name: 'Vangi Bath (Brinjal Rice)', calories: 170, protein: 3.5, carbs: 27.0, fat: 5.5, fiber: 2.0, glycemicIndex: 52, tags: ['Indian', 'South Indian', 'Vegetarian', 'Karnataka'] },
  { name: 'Khichdi', calories: 140, protein: 5.0, carbs: 22.0, fat: 3.5, fiber: 2.5, glycemicIndex: 45, tags: ['Indian', 'Vegetarian', 'Comfort Food'] },

  // Indian Nuts & Dry Fruits / Health foods
  { name: 'Almonds (Badam)', calories: 579, protein: 21.0, carbs: 22.0, fat: 49.0, fiber: 12.5, glycemicIndex: 15, tags: ['Nuts', 'Indian', 'Vegan', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Cashew (Kaju)', calories: 553, protein: 18.0, carbs: 30.0, fat: 44.0, fiber: 3.3, glycemicIndex: 22, tags: ['Nuts', 'Indian', 'Vegan', 'High Fat', 'Low GI'] },
  { name: 'Pistachios (Pista)', calories: 560, protein: 20.0, carbs: 28.0, fat: 45.0, fiber: 10.0, glycemicIndex: 15, tags: ['Nuts', 'Vegan', 'High Protein', 'High Fiber', 'Low GI'] },
  { name: 'Walnuts (Akhrot)', calories: 654, protein: 15.0, carbs: 14.0, fat: 65.0, fiber: 6.7, glycemicIndex: 15, tags: ['Nuts', 'Vegan', 'Omega-3', 'Low GI'] },
  { name: 'Peanuts (Mungfali)', calories: 567, protein: 26.0, carbs: 16.0, fat: 49.0, fiber: 8.5, glycemicIndex: 14, tags: ['Nuts', 'Indian', 'Vegan', 'High Protein', 'Low GI'] },
  { name: 'Chana Roasted (Roasted Chickpeas)', calories: 370, protein: 20.0, carbs: 58.0, fat: 6.0, fiber: 12.0, glycemicIndex: 28, tags: ['Indian', 'Vegan', 'High Protein', 'High Fiber', 'Snack', 'Low GI'] },
  { name: 'Makhana (Fox Nuts)', calories: 347, protein: 9.7, carbs: 77.0, fat: 0.1, fiber: 14.5, glycemicIndex: 20, tags: ['Indian', 'Vegan', 'Low Fat', 'High Fiber', 'Snack', 'Low GI'] },
  { name: 'Flax Seeds (Alsi)', calories: 534, protein: 18.0, carbs: 29.0, fat: 42.0, fiber: 27.0, glycemicIndex: 10, tags: ['Seeds', 'Vegan', 'Omega-3', 'High Fiber', 'Low GI'] },
  { name: 'Chia Seeds', calories: 486, protein: 17.0, carbs: 42.0, fat: 31.0, fiber: 34.0, glycemicIndex: 1, tags: ['Seeds', 'Vegan', 'Omega-3', 'High Fiber', 'Low GI'] },

  // Indian Millets & Healthy Grains
  { name: 'Ragi Roti (Finger Millet)', calories: 250, protein: 7.0, carbs: 45.0, fat: 4.0, fiber: 5.0, glycemicIndex: 45, tags: ['Indian', 'Vegetarian', 'Whole Grain', 'High Fiber', 'Millet'] },
  { name: 'Bajra Roti (Pearl Millet)', calories: 270, protein: 8.0, carbs: 48.0, fat: 5.0, fiber: 4.5, glycemicIndex: 48, tags: ['Indian', 'Vegetarian', 'Whole Grain', 'High Fiber', 'Millet'] },
  { name: 'Jowar Roti (Sorghum)', calories: 265, protein: 8.5, carbs: 46.0, fat: 4.5, fiber: 5.5, glycemicIndex: 42, tags: ['Indian', 'Vegetarian', 'Whole Grain', 'High Fiber', 'Millet'] },
  { name: 'Foxtail Millet (Kangni)', calories: 351, protein: 12.0, carbs: 60.0, fat: 4.0, fiber: 8.0, glycemicIndex: 42, tags: ['Indian', 'Vegetarian', 'Whole Grain', 'High Fiber', 'Millet', 'Low GI'] },
  { name: 'Daliya (Broken Wheat Porridge)', calories: 140, protein: 5.0, carbs: 24.0, fat: 2.5, fiber: 4.0, glycemicIndex: 40, tags: ['Indian', 'Vegetarian', 'Whole Grain', 'High Fiber', 'Breakfast'] },
  { name: 'Sattu Drink', calories: 100, protein: 6.0, carbs: 14.0, fat: 2.0, fiber: 3.0, glycemicIndex: 35, tags: ['Indian', 'Vegan', 'High Protein', 'Beverage', 'Low GI'] },
];

async function main() {
  console.log(`Starting food seed: ${foods.length} items to process...\n`);

  let created = 0;
  let updated = 0;
  const batchSize = 50;

  for (let i = 0; i < foods.length; i++) {
    const food = foods[i];
    const data = {
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      glycemicIndex: food.glycemicIndex,
      tags: food.tags,
    };

    const existing = await prisma.food.findFirst({
      where: { name: food.name },
    });

    if (existing) {
      await prisma.food.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      await prisma.food.create({
        data: {
          name: food.name,
          ...data,
          isCustom: false,
        },
      });
      created++;
    }

    if ((i + 1) % batchSize === 0) {
      console.log(`  Seeded ${i + 1}/${foods.length} foods...`);
    }
  }

  console.log(`\nDone! Created ${created}, updated ${updated}. Total: ${foods.length} foods.`);
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
