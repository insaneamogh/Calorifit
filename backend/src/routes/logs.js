const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { calculateItemNutrition } = require('../services/nutrition');
const { estimateGI, calculateItemShifa, calculateMealShifa } = require('../services/shifa');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/logs/:date  (format: YYYY-MM-DD)
router.get('/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    if (isNaN(date)) return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });

    const log = await prisma.foodLog.findUnique({
      where: { userId_date: { userId: req.userId, date } },
      include: { items: { include: { food: true }, orderBy: { createdAt: 'asc' } } },
    });

    if (!log) return res.json({ date: req.params.date, items: [], totals: zeroTotals(), mealShifa: {} });

    const totals = computeTotals(log.items);
    const mealShifa = computeMealShifaScores(log.items);
    res.json({ ...log, totals, mealShifa });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs/item - add food item to log
router.post('/item', auth, async (req, res) => {
  try {
    const { date, foodId, meal, grams, photoUrl, aiDetected } = req.body;

    if (!date || !foodId || !meal || !grams) {
      return res.status(400).json({ error: 'date, foodId, meal, grams are required' });
    }

    const food = await prisma.food.findUnique({ where: { id: foodId } });
    if (!food) return res.status(404).json({ error: 'Food not found' });

    const logDate = new Date(date);
    let log = await prisma.foodLog.findUnique({
      where: { userId_date: { userId: req.userId, date: logDate } },
    });

    if (!log) {
      log = await prisma.foodLog.create({ data: { userId: req.userId, date: logDate } });
    }

    const nutrition = calculateItemNutrition(food, grams);

    // Compute GI and Shifa for this food
    const gi = food.glycemicIndex ?? estimateGI(food.name, food.carbs, food.fiber);
    const fiberForServing = (food.fiber || 0) * (grams / 100);
    const { shifaIndex } = calculateItemShifa({
      caloriesPer100g: food.calories,
      proteinPer100g: food.protein,
      fiberPer100g: food.fiber || 0,
      gi,
    });

    // Update food record with GI if not already set
    if (food.glycemicIndex === null || food.glycemicIndex === undefined) {
      await prisma.food.update({
        where: { id: foodId },
        data: { glycemicIndex: gi, shifaIndex },
      }).catch(() => {}); // non-critical
    }

    const item = await prisma.foodLogItem.create({
      data: {
        logId: log.id,
        foodId,
        meal,
        grams,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: fiberForServing,
        gi,
        shifaIndex,
        photoUrl,
        aiDetected: aiDetected || false,
      },
      include: { food: true },
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs/item/ai - log items directly from Gemini response (skips food lookup)
router.post('/item/ai', auth, async (req, res) => {
  try {
    const { date, meal, foods, photoUrl } = req.body;
    // foods: [{ name, estimatedGrams, calories, protein, carbs, fat, fiber, glycemicIndex, tags }]
    const logDate = new Date(date);

    let log = await prisma.foodLog.findUnique({
      where: { userId_date: { userId: req.userId, date: logDate } },
    });
    if (!log) {
      log = await prisma.foodLog.create({ data: { userId: req.userId, date: logDate } });
    }

    const createdItems = [];
    for (const f of foods) {
      // Compute per-100g values
      const per100 = f.estimatedGrams > 0 ? (100 / f.estimatedGrams) : 1;
      const calPer100 = f.calories * per100;
      const protPer100 = f.protein * per100;
      const carbPer100 = f.carbs * per100;
      const fatPer100 = f.fat * per100;
      const fiberPer100 = (f.fiber || 0) * per100;

      // GI: prefer Gemini's estimate, fall back to our lookup table
      const gi = (f.glycemicIndex != null && f.glycemicIndex >= 0)
        ? f.glycemicIndex
        : estimateGI(f.name, carbPer100, fiberPer100);

      // Shifa Index (per 100g basis)
      const { shifaIndex } = calculateItemShifa({
        caloriesPer100g: calPer100,
        proteinPer100g: protPer100,
        fiberPer100g: fiberPer100,
        gi,
      });

      // Upsert the food record
      let food = await prisma.food.findFirst({
        where: { name: { equals: f.name, mode: 'insensitive' }, isCustom: false },
      });
      if (!food) {
        food = await prisma.food.create({
          data: {
            name: f.name,
            calories: calPer100,
            protein: protPer100,
            carbs: carbPer100,
            fat: fatPer100,
            fiber: fiberPer100,
            glycemicIndex: gi,
            shifaIndex,
            tags: f.tags || [],
          },
        });
      } else if (food.glycemicIndex === null || food.glycemicIndex === undefined) {
        // Update existing food with GI if missing
        await prisma.food.update({
          where: { id: food.id },
          data: { glycemicIndex: gi, shifaIndex },
        }).catch(() => {});
      }

      const item = await prisma.foodLogItem.create({
        data: {
          logId: log.id,
          foodId: food.id,
          meal,
          grams: f.estimatedGrams,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
          fiber: f.fiber || 0,
          gi,
          shifaIndex,
          photoUrl,
          aiDetected: true,
        },
        include: { food: true },
      });
      createdItems.push(item);
    }

    res.status(201).json(createdItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/logs/item/:id - update portion size
router.put('/item/:id', auth, async (req, res) => {
  try {
    const { grams } = req.body;
    if (!grams || grams <= 0) return res.status(400).json({ error: 'Valid grams value required' });

    const item = await prisma.foodLogItem.findUnique({
      where: { id: req.params.id },
      include: { log: true, food: true },
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.log.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    // Recalculate nutrition based on new grams using food's per-100g values
    const nutrition = calculateItemNutrition(item.food, grams);

    const updated = await prisma.foodLogItem.update({
      where: { id: req.params.id },
      data: {
        grams,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: (item.food.fiber || 0) * (grams / 100),
      },
      include: { food: true },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/logs/item/:id
router.delete('/item/:id', auth, async (req, res) => {
  try {
    const item = await prisma.foodLogItem.findUnique({
      where: { id: req.params.id },
      include: { log: true },
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.log.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.foodLogItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function zeroTotals() {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

function computeTotals(items) {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    zeroTotals()
  );
}

/**
 * Compute cumulative Shifa Index for each meal type.
 * Uses SUMMED nutrients, not individual scores added up.
 */
function computeMealShifaScores(items) {
  const meals = {};
  const mealItems = {};

  // Group items by meal
  for (const item of items) {
    const meal = item.meal.toLowerCase();
    if (!mealItems[meal]) mealItems[meal] = [];
    mealItems[meal].push({
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber || 0,
      gi: item.gi || 0,
    });
  }

  // Calculate cumulative Shifa for each meal
  for (const [meal, items] of Object.entries(mealItems)) {
    meals[meal] = calculateMealShifa(items);
  }

  // Also compute a day-level total
  const allItems = items.map((item) => ({
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    fiber: item.fiber || 0,
    gi: item.gi || 0,
  }));
  meals.total = calculateMealShifa(allItems);

  return meals;
}

module.exports = router;
