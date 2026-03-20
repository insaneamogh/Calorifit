const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { calculateTDEE, calculateMacros } = require('../services/nutrition');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...userSafe } = user;
    res.json(userSafe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  try {
    const { name, age, gender, heightCm, currentWeight, goalWeight, activityLevel, goal,
      dailyWaterGoalMl } = req.body;

    const current = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!current) return res.status(404).json({ error: 'User not found' });

    const merged = {
      gender: gender ?? current.gender,
      age: age ?? current.age,
      heightCm: heightCm ?? current.heightCm,
      weightKg: currentWeight ?? current.currentWeight,
      activityLevel: activityLevel ?? current.activityLevel,
      goal: goal ?? current.goal,
    };

    const dailyCalGoal = calculateTDEE(merged);
    const macros = calculateMacros(dailyCalGoal, merged.goal);

    const updates = {
      ...(name && { name }),
      ...(age && { age }),
      ...(gender && { gender }),
      ...(heightCm && { heightCm }),
      ...(currentWeight && { currentWeight }),
      ...(goalWeight && { goalWeight }),
      ...(activityLevel && { activityLevel }),
      ...(goal && { goal }),
      ...(dailyWaterGoalMl && { dailyWaterGoalMl }),
      dailyCalGoal,
      dailyProteinGoal: macros.protein,
      dailyCarbGoal: macros.carbs,
      dailyFatGoal: macros.fat,
    };

    const user = await prisma.user.update({ where: { id: req.userId }, data: updates });

    // Log new weight if changed
    if (currentWeight && currentWeight !== current.currentWeight) {
      await prisma.weightEntry.create({
        data: { userId: req.userId, date: new Date(), weightKg: currentWeight },
      });
    }

    const { passwordHash, ...userSafe } = user;
    res.json(userSafe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
