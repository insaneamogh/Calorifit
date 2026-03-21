/**
 * Mock data for testing UI without a backend.
 * Set USE_MOCK=true in api.ts to activate.
 */

export const MOCK_USER = {
  id: 'mock-user-1',
  name: 'Amoghh',
  email: 'amoghpatil2001@gmail.com',
  age: 24,
  gender: 'male',
  heightCm: 178,
  currentWeight: 79,
  goalWeight: 74,
  activityLevel: 'moderately_active',
  goal: 'lose',
  dailyCalGoal: 2200,
  dailyProteinGoal: 165,
  dailyCarbGoal: 220,
  dailyFatGoal: 73,
  dailyWaterGoalMl: 3000,
  streak: 12,
};

const today = () => new Date().toISOString().split('T')[0];

export const MOCK_FOODS = [
  { id: 'f1', name: 'Chicken Breast (Grilled)', brandName: null, calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, glycemicIndex: 0, shifaIndex: 0, tags: ['High Protein'] },
  { id: 'f2', name: 'Brown Rice', brandName: null, calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, glycemicIndex: 68, shifaIndex: 1731, tags: ['Whole Grain'] },
  { id: 'f3', name: 'Greek Yogurt', brandName: 'Epigamia', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, glycemicIndex: 36, shifaIndex: 212, tags: ['Probiotic'] },
  { id: 'f4', name: 'Banana', brandName: null, calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, glycemicIndex: 51, shifaIndex: 1227, tags: ['Potassium'] },
  { id: 'f5', name: 'Oats (Rolled)', brandName: null, calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6, glycemicIndex: 55, shifaIndex: 778, tags: ['High Fiber'] },
  { id: 'f6', name: 'Egg (Boiled)', brandName: null, calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, glycemicIndex: 0, shifaIndex: 0, tags: ['Complete Protein'] },
  { id: 'f7', name: 'Paneer (Cottage Cheese)', brandName: null, calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0, glycemicIndex: 0, shifaIndex: 0, tags: ['Calcium'] },
  { id: 'f8', name: 'Avocado Toast', brandName: null, calories: 220, protein: 6, carbs: 22, fat: 12, fiber: 7, glycemicIndex: 45, shifaIndex: 762, tags: ['Healthy Fats', 'High Fiber'] },
  { id: 'f9', name: 'Dal Tadka (Lentils)', brandName: null, calories: 110, protein: 7, carbs: 18, fat: 1.5, fiber: 4, glycemicIndex: 32, shifaIndex: 320, tags: ['High Fiber', 'Plant Protein'] },
  { id: 'f10', name: 'Whey Protein Shake', brandName: 'Optimum Nutrition', calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0, glycemicIndex: 15, shifaIndex: 75, tags: ['High Protein'] },
];

export const MOCK_LOG_ITEMS = [
  {
    id: 'li1', logId: 'log1', foodId: 'f5', meal: 'breakfast', grams: 60,
    calories: 233, protein: 10.1, carbs: 39.6, fat: 4.1, fiber: 6.4, gi: 55, shifaIndex: 778,
    aiDetected: false, food: MOCK_FOODS[4],
  },
  {
    id: 'li2', logId: 'log1', foodId: 'f4', meal: 'breakfast', grams: 120,
    calories: 107, protein: 1.3, carbs: 27.6, fat: 0.4, fiber: 3.1, gi: 51, shifaIndex: 1227,
    aiDetected: false, food: MOCK_FOODS[3],
  },
  {
    id: 'li3', logId: 'log1', foodId: 'f1', meal: 'lunch', grams: 200,
    calories: 330, protein: 62, carbs: 0, fat: 7.2, fiber: 0, gi: 0, shifaIndex: 0,
    aiDetected: true, food: MOCK_FOODS[0],
  },
  {
    id: 'li4', logId: 'log1', foodId: 'f2', meal: 'lunch', grams: 150,
    calories: 168, protein: 3.9, carbs: 36, fat: 1.4, fiber: 2.7, gi: 68, shifaIndex: 1731,
    aiDetected: true, food: MOCK_FOODS[1],
  },
  {
    id: 'li5', logId: 'log1', foodId: 'f9', meal: 'lunch', grams: 200,
    calories: 220, protein: 14, carbs: 36, fat: 3, fiber: 8, gi: 32, shifaIndex: 320,
    aiDetected: false, food: MOCK_FOODS[8],
  },
  {
    id: 'li6', logId: 'log1', foodId: 'f3', meal: 'snack', grams: 150,
    calories: 88, protein: 15, carbs: 5.4, fat: 0.6, fiber: 0, gi: 36, shifaIndex: 212,
    aiDetected: false, food: MOCK_FOODS[2],
  },
];

function computeMealShifaMock(items: typeof MOCK_LOG_ITEMS) {
  const byMeal: Record<string, typeof MOCK_LOG_ITEMS> = {};
  for (const item of items) {
    const m = item.meal.toLowerCase();
    if (!byMeal[m]) byMeal[m] = [];
    byMeal[m].push(item);
  }

  const calcShifa = (mealItems: typeof MOCK_LOG_ITEMS) => {
    let totalCal = 0, totalProt = 0, totalFiber = 0, totalCarbs = 0, giCarbsSum = 0;
    for (const i of mealItems) {
      totalCal += i.calories;
      totalProt += i.protein;
      totalFiber += i.fiber;
      totalCarbs += i.carbs;
      giCarbsSum += i.gi * i.carbs;
    }
    const weightedGI = totalCarbs > 0 ? Math.round(giCarbsSum / totalCarbs) : 0;
    const denom = totalProt + totalFiber;
    const shifaIndex = denom > 0.5 ? Math.round((totalCal * weightedGI) / denom) : 0;
    const rating = shifaIndex <= 0 ? 'neutral' : shifaIndex <= 50 ? 'excellent' : shifaIndex <= 150 ? 'good' : shifaIndex <= 300 ? 'moderate' : shifaIndex <= 500 ? 'fair' : 'poor';
    return { shifaIndex, weightedGI, rating, totalProtein: totalProt, totalFiber };
  };

  const result: Record<string, any> = {};
  for (const [meal, mealItems] of Object.entries(byMeal)) {
    result[meal] = calcShifa(mealItems);
  }
  result.total = calcShifa(items);
  return result;
}

export const MOCK_DAY_LOG = {
  id: 'log1',
  userId: 'mock-user-1',
  date: today(),
  items: MOCK_LOG_ITEMS,
  totals: {
    calories: MOCK_LOG_ITEMS.reduce((s, i) => s + i.calories, 0),
    protein: MOCK_LOG_ITEMS.reduce((s, i) => s + i.protein, 0),
    carbs: MOCK_LOG_ITEMS.reduce((s, i) => s + i.carbs, 0),
    fat: MOCK_LOG_ITEMS.reduce((s, i) => s + i.fat, 0),
  },
  mealShifa: computeMealShifaMock(MOCK_LOG_ITEMS),
};

export const MOCK_WATER = { totalMl: 1750 };

export const MOCK_WEIGHT_DATA = [
  { date: '2026-02-19', weightKg: 81.2 },
  { date: '2026-02-26', weightKg: 80.8 },
  { date: '2026-03-05', weightKg: 80.1 },
  { date: '2026-03-10', weightKg: 79.6 },
  { date: '2026-03-14', weightKg: 79.3 },
  { date: '2026-03-18', weightKg: 79.0 },
  { date: '2026-03-21', weightKg: 79.0 },
];

export const MOCK_CALORIES_DATA = {
  data: [
    { date: '2026-03-15', calories: 2150 },
    { date: '2026-03-16', calories: 2320 },
    { date: '2026-03-17', calories: 1890 },
    { date: '2026-03-18', calories: 2400 },
    { date: '2026-03-19', calories: 2180 },
    { date: '2026-03-20', calories: 2050 },
    { date: '2026-03-21', calories: 1146 },
  ],
};

export const MOCK_STATS = {
  streak: 12,
  avgCalories: 2141,
  totalLost: 2.2,
  currentWeight: 79,
};

export const MOCK_SCAN_RESULT = {
  foods: [
    {
      name: 'Avocado Toast & Egg',
      estimatedGrams: 280,
      calories: 482,
      protein: 18,
      carbs: 34,
      fat: 22,
      fiber: 7,
      glycemicIndex: 42,
      tags: ['High Fiber', 'Vitamin E'],
    },
  ],
  confidence: 'high',
  notes: 'Whole grain bread with mashed avocado and a poached egg',
};
