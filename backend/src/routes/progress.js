const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/progress/weight?days=30
router.get('/weight', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const from = new Date();
    from.setDate(from.getDate() - days);

    const entries = await prisma.weightEntry.findMany({
      where: { userId: req.userId, date: { gte: from } },
      orderBy: { date: 'asc' },
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/progress/weight
router.post('/weight', auth, async (req, res) => {
  try {
    const { weightKg, date } = req.body;
    if (!weightKg) return res.status(400).json({ error: 'weightKg is required' });

    const entry = await prisma.weightEntry.create({
      data: {
        userId: req.userId,
        date: new Date(date || new Date()),
        weightKg: Number(weightKg),
      },
    });

    // Update user's currentWeight
    await prisma.user.update({
      where: { id: req.userId },
      data: { currentWeight: Number(weightKg) },
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/progress/calories?days=7
router.get('/calories', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const from = new Date();
    from.setDate(from.getDate() - days);

    const logs = await prisma.foodLog.findMany({
      where: { userId: req.userId, date: { gte: from } },
      include: { items: true },
      orderBy: { date: 'asc' },
    });

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    const data = logs.map((log) => {
      const calories = log.items.reduce((s, i) => s + i.calories, 0);
      const protein = log.items.reduce((s, i) => s + i.protein, 0);
      const carbs = log.items.reduce((s, i) => s + i.carbs, 0);
      const fat = log.items.reduce((s, i) => s + i.fat, 0);
      return { date: log.date, calories, protein, carbs, fat };
    });

    res.json({ data, goalCalories: user?.dailyCalGoal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/progress/stats - summary stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    const weightEntries = await prisma.weightEntry.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'asc' },
    });

    const startWeight = weightEntries[0]?.weightKg;
    const currentWeight = weightEntries[weightEntries.length - 1]?.weightKg;
    const totalLost = startWeight ? +(startWeight - currentWeight).toFixed(1) : 0;

    // Average calories last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = await prisma.foodLog.findMany({
      where: { userId: req.userId, date: { gte: sevenDaysAgo } },
      include: { items: true },
    });
    const avgCalories = recentLogs.length
      ? Math.round(recentLogs.reduce((s, l) => s + l.items.reduce((a, i) => a + i.calories, 0), 0) / recentLogs.length)
      : 0;

    res.json({
      streak: user?.streak || 0,
      startWeight,
      currentWeight,
      goalWeight: user?.goalWeight,
      totalLost,
      avgCalories,
      dailyCalGoal: user?.dailyCalGoal,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
