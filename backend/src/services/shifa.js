/**
 * SHIFA INDEX Calculator
 *
 * Formula (per 100g):
 *   Shifa Index = (Calories × Glycemic Index) / (Protein(g) + Fiber(g))
 *
 * Lower is better — high protein + high fiber with low GI = excellent score.
 *
 * Meal-level Shifa Index uses SUMMED nutrients across all items:
 *   Meal Shifa = (Sum_Calories × Weighted_Avg_GI) / (Sum_Protein + Sum_Fiber)
 *   where Weighted_Avg_GI = Sum(GI_i × Carbs_i) / Sum(Carbs_i)
 *
 * This correctly models that adding chicken breast to rice lowers the meal score.
 */

const axios = require('axios');

// ─── GI Lookup Table (common foods, per 100g reference) ───
// Source: International Tables of Glycemic Index (2021)
const GI_TABLE = {
  // Grains & Starches
  'white rice':       73, 'brown rice':       68, 'basmati rice':     58,
  'rice':             73, 'jasmine rice':     89, 'wild rice':        57,
  'white bread':      75, 'whole wheat bread': 74, 'sourdough bread':  54,
  'bread':            75, 'roti':             62, 'naan':             71,
  'chapati':          62, 'pasta':            49, 'spaghetti':        49,
  'noodles':          47, 'oats':             55, 'oatmeal':          55,
  'quinoa':           53, 'couscous':         65, 'corn':             52,
  'tortilla':         52, 'bagel':            72, 'croissant':        67,
  'muesli':           57, 'granola':          55, 'cereal':           72,
  'cornflakes':       81, 'pancake':          67, 'waffle':           76,
  'poha':             64, 'upma':             68, 'idli':             77,
  'dosa':             77, 'paratha':          67, 'biryani':          70,
  'pulao':            60, 'khichdi':          55, 'popcorn':          65,

  // Proteins (very low GI)
  'chicken':          0,  'chicken breast':   0,  'chicken thigh':    0,
  'turkey':           0,  'beef':             0,  'steak':            0,
  'lamb':             0,  'pork':             0,  'fish':             0,
  'salmon':           0,  'tuna':             0,  'shrimp':           0,
  'prawns':           0,  'egg':              0,  'eggs':             0,
  'tofu':             15, 'paneer':           0,  'cottage cheese':   10,
  'cheese':           0,  'whey protein':     0,  'protein shake':    15,

  // Legumes
  'lentils':          32, 'dal':              32, 'chickpeas':        28,
  'kidney beans':     24, 'black beans':      30, 'rajma':            24,
  'chana':            28, 'moong dal':        31, 'toor dal':         29,
  'soy':              16, 'peanuts':          14, 'almonds':          0,
  'walnuts':          0,  'cashews':          22,

  // Vegetables (mostly low GI)
  'potato':           78, 'sweet potato':     63, 'pumpkin':          75,
  'carrot':           39, 'beet':             64, 'corn':             52,
  'peas':             48, 'broccoli':         10, 'spinach':          6,
  'cauliflower':      10, 'cabbage':          10, 'tomato':           15,
  'cucumber':         15, 'onion':            10, 'bell pepper':      15,
  'mushroom':         10, 'lettuce':          10, 'zucchini':         15,
  'eggplant':         15, 'okra':             20, 'green beans':      20,
  'salad':            10, 'kale':             4,  'avocado':          15,

  // Fruits
  'banana':           51, 'apple':            36, 'orange':           43,
  'mango':            51, 'watermelon':       76, 'pineapple':        59,
  'grapes':           46, 'strawberry':       25, 'blueberry':        25,
  'papaya':           60, 'kiwi':             39, 'peach':            42,
  'pear':             38, 'cherry':           22, 'dates':            42,
  'fig':              61, 'pomegranate':      35, 'guava':            12,
  'lychee':           57, 'coconut':          45, 'raisins':          64,

  // Dairy
  'milk':             39, 'yogurt':           36, 'curd':             36,
  'ice cream':        51, 'butter':           0,  'cream':            0,
  'lassi':            36, 'buttermilk':       35, 'ghee':             0,

  // Sweets & Processed
  'sugar':            65, 'honey':            58, 'jaggery':          84,
  'chocolate':        40, 'cake':             67, 'cookie':           55,
  'doughnut':         76, 'candy':            78, 'jam':              51,
  'soda':             63, 'juice':            50, 'fries':            63,
  'chips':            56, 'pizza':            60, 'burger':           66,
  'samosa':           66, 'jalebi':           75, 'gulab jamun':      75,
  'halwa':            65, 'ladoo':            68, 'barfi':            60,
};

/**
 * Estimate Glycemic Index for a food item by fuzzy matching its name
 * against our lookup table. Falls back to carb-ratio heuristic.
 */
function estimateGI(foodName, carbsPer100g = 0, fiberPer100g = 0) {
  const name = foodName.toLowerCase().trim();

  // 1. Exact match
  if (GI_TABLE[name] !== undefined) return GI_TABLE[name];

  // 2. Partial / keyword match (find best match)
  let bestMatch = null;
  let bestLen = 0;
  for (const [key, gi] of Object.entries(GI_TABLE)) {
    if (name.includes(key) || key.includes(name)) {
      if (key.length > bestLen) {
        bestLen = key.length;
        bestMatch = gi;
      }
    }
  }
  if (bestMatch !== null) return bestMatch;

  // 3. Check individual words
  const words = name.split(/[\s,]+/);
  for (const word of words) {
    if (word.length < 3) continue;
    if (GI_TABLE[word] !== undefined) return GI_TABLE[word];
  }

  // 4. Heuristic based on carb content
  // High carb with low fiber = likely high GI
  if (carbsPer100g <= 5) return 10;       // Very low carb = very low GI
  if (carbsPer100g <= 15) return 30;      // Low carb
  const netCarbs = carbsPer100g - fiberPer100g;
  if (netCarbs > 50) return 70;           // Very high net carbs
  if (netCarbs > 30) return 55;           // Moderate-high
  return 45;                               // Default moderate
}

/**
 * Fetch GI from Open Food Facts by product name (optional network lookup)
 * Returns null if not found - caller should fall back to estimateGI()
 */
async function fetchGIFromOpenFoodFacts(foodName) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1&page_size=3&fields=product_name,nutriments`;
    const res = await axios.get(url, { timeout: 5000 });

    if (res.data?.products?.length > 0) {
      for (const product of res.data.products) {
        const gi = product.nutriments?.['glycemic-index'];
        if (gi && gi > 0) return Math.round(gi);
      }
    }
    return null;
  } catch {
    return null; // Network error - fall back to local estimate
  }
}

/**
 * Calculate Shifa Index for a SINGLE food item (per 100g basis)
 *
 * Formula: (Calories_per100g × GI) / (Protein_per100g + Fiber_per100g)
 *
 * @returns {{ shifaIndex: number, gi: number, rating: string }}
 */
function calculateItemShifa({ caloriesPer100g, proteinPer100g, fiberPer100g, gi }) {
  const denominator = (proteinPer100g || 0) + (fiberPer100g || 0);

  // Prevent division by zero — pure fat/sugar with no protein or fiber = worst score
  if (denominator < 0.5) {
    return {
      shifaIndex: gi > 0 ? 999 : 0,
      gi,
      rating: gi > 0 ? 'poor' : 'neutral',
    };
  }

  const shifaIndex = Math.round((caloriesPer100g * gi) / denominator);

  return {
    shifaIndex,
    gi,
    rating: getShifaRating(shifaIndex),
  };
}

/**
 * Calculate CUMULATIVE Shifa Index for an entire meal.
 *
 * Uses summed nutrients so that combining foods works correctly:
 *   Meal Shifa = (Sum_Cal × WeightedAvg_GI) / (Sum_Protein + Sum_Fiber)
 *   WeightedAvg_GI = Sum(GI_i × Carbs_i) / Sum(Carbs_i)
 *
 * This means rice (high GI, high carb, low protein) + chicken breast
 * (0 GI, high protein) will produce a MUCH lower meal Shifa than rice alone.
 */
function calculateMealShifa(items) {
  if (!items || items.length === 0) {
    return { shifaIndex: 0, weightedGI: 0, rating: 'neutral', totalProtein: 0, totalFiber: 0 };
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalFiber = 0;
  let totalCarbs = 0;
  let giCarbsSum = 0; // For weighted average GI

  for (const item of items) {
    totalCalories += item.calories || 0;
    totalProtein += item.protein || 0;
    totalFiber += item.fiber || 0;
    totalCarbs += item.carbs || 0;
    giCarbsSum += (item.gi || 0) * (item.carbs || 0);
  }

  // Weighted average GI by carb contribution
  const weightedGI = totalCarbs > 0 ? Math.round(giCarbsSum / totalCarbs) : 0;

  // Meal-level denominator
  const denominator = totalProtein + totalFiber;

  if (denominator < 0.5) {
    return {
      shifaIndex: weightedGI > 0 ? 999 : 0,
      weightedGI,
      rating: weightedGI > 0 ? 'poor' : 'neutral',
      totalProtein,
      totalFiber,
    };
  }

  const shifaIndex = Math.round((totalCalories * weightedGI) / denominator);

  return {
    shifaIndex,
    weightedGI,
    rating: getShifaRating(shifaIndex),
    totalProtein,
    totalFiber,
  };
}

/**
 * Get human-readable Shifa rating
 */
function getShifaRating(index) {
  if (index <= 0)    return 'neutral';  // Pure protein/fat, no GI impact
  if (index <= 50)   return 'excellent';
  if (index <= 150)  return 'good';
  if (index <= 300)  return 'moderate';
  if (index <= 500)  return 'fair';
  return 'poor';
}

/**
 * Get color for Shifa rating (for frontend use)
 */
function getShifaColor(rating) {
  const colors = {
    neutral:   '#888888',
    excellent: '#22c55e',
    good:      '#10b981',
    moderate:  '#f59e0b',
    fair:      '#f97316',
    poor:      '#ef4444',
  };
  return colors[rating] || '#888888';
}

module.exports = {
  estimateGI,
  fetchGIFromOpenFoodFacts,
  calculateItemShifa,
  calculateMealShifa,
  getShifaRating,
  getShifaColor,
  GI_TABLE,
};
