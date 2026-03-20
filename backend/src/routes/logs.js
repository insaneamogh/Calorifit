const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { calculateItemNutrition } = require('../services/nutrition');

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

    if (!log) return res.json({ date: req.params.date, items: [], totals: zereTotals() });

    const totals = computeTotals(log.items);
    res.json({ ...log, totals });
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
    // foods: [{ name, estimatedGrams, calories, protein, carbs, fat, fiber, tags }]
    const logDate = new Date(date);

    let log = await prisma.foodLog.findUnique({
      where: { userId_date: { userId: req.userId, date: logDate } },
    });
    if (!log) {
      log = await prisma.foodLog.create({ data: { userId: req.userId, date: logDate } });
    }

    const createdItems = [];
    for (const f of foods) {
      // Upsert the food record
      let food = await prisma.food.findFirst({
        where: { name: { equals: f.name, mode: 'insensitive' }, isCustom: false },
      });
      if (!food) {
        const per100 = f.estimatedGrams > 0 ? (100 / f.estimatedGrams) : 1;
        food = await prisma.food.create({
          data: {
            name: f.name,
            calories: f.calories * per100,
            protein: f.protein * per100,
            carbs: f.carbs * per100,
            fat: f.fat * per100,
            fiber: (f.fiber || 0) * per100,
            tags: f.tags || [],
          },
        });
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

function zereTotals() {
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
    zereTotals()
  );
}

module.exports = router;
