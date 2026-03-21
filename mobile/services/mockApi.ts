/**
 * Mock API layer — drop-in replacement for api.ts exports.
 * Set USE_MOCK = true in this file to bypass all backend calls.
 */

import {
  MOCK_USER,
  MOCK_FOODS,
  MOCK_DAY_LOG,
  MOCK_WATER,
  MOCK_WEIGHT_DATA,
  MOCK_CALORIES_DATA,
  MOCK_STATS,
  MOCK_SCAN_RESULT,
  MOCK_LOG_ITEMS,
} from './mockData';

// ────────────────────────────────────────────
//  Toggle this flag to switch between real & mock
// ────────────────────────────────────────────
export const USE_MOCK = true;

/** Simulate network latency (ms) */
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/** Wrap a value in an axios-style { data } response */
const wrap = async <T>(value: T, ms = 200): Promise<{ data: T }> => {
  await delay(ms);
  return { data: value };
};

// Keep a mutable copy of items so add/delete works within a session
let sessionItems = [...MOCK_LOG_ITEMS];
let sessionWaterMl = MOCK_WATER.totalMl;
let nextId = 100;

function rebuildDayLog() {
  const items = sessionItems;
  const totals = {
    calories: items.reduce((s, i) => s + i.calories, 0),
    protein: items.reduce((s, i) => s + i.protein, 0),
    carbs: items.reduce((s, i) => s + i.carbs, 0),
    fat: items.reduce((s, i) => s + i.fat, 0),
  };

  // Compute meal-level shifa
  const byMeal: Record<string, typeof items> = {};
  for (const item of items) {
    const m = item.meal.toLowerCase();
    if (!byMeal[m]) byMeal[m] = [];
    byMeal[m].push(item);
  }

  const calcShifa = (mealItems: typeof items) => {
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

  const mealShifa: Record<string, any> = {};
  for (const [meal, mealItems] of Object.entries(byMeal)) {
    mealShifa[meal] = calcShifa(mealItems);
  }
  mealShifa.total = calcShifa(items);

  return { ...MOCK_DAY_LOG, items, totals, mealShifa };
}

// ─── Mock API objects (same shape as api.ts exports) ───

export const mockAuthAPI = {
  register: (data: any) => wrap({ user: MOCK_USER, accessToken: 'mock-token', refreshToken: 'mock-refresh' }),
  login: (_email: string, _password: string) => wrap({ user: MOCK_USER, accessToken: 'mock-token', refreshToken: 'mock-refresh' }),
  refresh: (_refreshToken: string) => wrap({ accessToken: 'mock-token' }),
};

export const mockUserAPI = {
  getMe: () => wrap(MOCK_USER),
  updateMe: (data: any) => wrap({ ...MOCK_USER, ...data }),
};

export const mockFoodsAPI = {
  search: (q: string) => {
    const lower = q.toLowerCase();
    const results = MOCK_FOODS.filter((f) => f.name.toLowerCase().includes(lower));
    return wrap(results);
  },
  getById: (id: string) => wrap(MOCK_FOODS.find((f) => f.id === id) || MOCK_FOODS[0]),
  createCustom: (data: any) => wrap({ id: 'custom-' + (nextId++), ...data }),
};

export const mockLogsAPI = {
  getDay: (_date: string) => wrap(rebuildDayLog()),
  addItem: (data: any) => {
    const food = MOCK_FOODS.find((f) => f.id === data.foodId) || MOCK_FOODS[0];
    const grams = data.grams || 100;
    const ratio = grams / 100;
    const newItem = {
      id: 'li-' + (nextId++),
      logId: 'log1',
      foodId: food.id,
      meal: data.meal || 'lunch',
      grams,
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      fiber: Math.round(food.fiber * ratio * 10) / 10,
      gi: food.glycemicIndex,
      shifaIndex: food.shifaIndex,
      aiDetected: false,
      food,
    };
    sessionItems.push(newItem);
    return wrap(newItem);
  },
  addAIItems: (data: any) => {
    const items = (data.items || []).map((item: any) => ({
      id: 'li-' + (nextId++),
      logId: 'log1',
      foodId: 'ai-' + (nextId++),
      meal: data.meal || 'lunch',
      grams: item.estimatedGrams || 100,
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: item.fiber || 0,
      gi: item.glycemicIndex || 0,
      shifaIndex: 0,
      aiDetected: true,
      food: { id: 'ai-food', name: item.name, tags: item.tags || [] },
    }));
    sessionItems.push(...items);
    return wrap(items);
  },
  deleteItem: (id: string) => {
    sessionItems = sessionItems.filter((i) => i.id !== id);
    return wrap({ success: true });
  },
};

export const mockAiAPI = {
  scanImage: (_base64: string, _mimeType = 'image/jpeg') => wrap(MOCK_SCAN_RESULT, 800),
  describeFood: (_description: string) => wrap(MOCK_SCAN_RESULT, 600),
};

export const mockWaterAPI = {
  getDay: (_date: string) => wrap({ totalMl: sessionWaterMl }),
  log: (amountMl: number, _date?: string) => {
    sessionWaterMl += amountMl;
    return wrap({ totalMl: sessionWaterMl });
  },
};

export const mockProgressAPI = {
  getWeight: (_days = 30) => wrap(MOCK_WEIGHT_DATA),
  logWeight: (weightKg: number) => {
    MOCK_WEIGHT_DATA.push({ date: new Date().toISOString().split('T')[0], weightKg });
    return wrap({ success: true });
  },
  getCalories: (_days = 7) => wrap(MOCK_CALORIES_DATA),
  getStats: () => wrap(MOCK_STATS),
};
