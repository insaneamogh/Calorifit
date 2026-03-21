const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { calculateTDEE, calculateMacros } = require('../services/nutrition');

const router = express.Router();
const prisma = new PrismaClient();

function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, age, gender, heightCm, currentWeight, goalWeight, activityLevel, goal } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);

    const dailyCalGoal = req.body.dailyCalGoal
      ? Number(req.body.dailyCalGoal)
      : calculateTDEE({
          gender: gender || 'other',
          age: age || 25,
          heightCm: heightCm || 170,
          weightKg: currentWeight || 70,
          activityLevel: activityLevel || 'moderately_active',
          goal: goal || 'maintain',
        });

    const macros = calculateMacros(dailyCalGoal, goal || 'maintain');

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        age: age || 25,
        gender: gender || 'other',
        heightCm: heightCm || 170,
        currentWeight: currentWeight || 70,
        goalWeight: goalWeight || 70,
        activityLevel: activityLevel || 'moderately_active',
        goal: goal || 'maintain',
        dailyCalGoal,
        dailyProteinGoal: macros.protein,
        dailyCarbGoal: macros.carbs,
        dailyFatGoal: macros.fat,
      },
    });

    // Log starting weight
    await prisma.weightEntry.create({
      data: {
        userId: user.id,
        date: new Date(),
        weightKg: currentWeight || 70,
      },
    });

    const tokens = generateTokens(user.id);
    const { passwordHash: _, ...userSafe } = user;
    res.status(201).json({ user: userSafe, ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    lastActive?.setHours(0, 0, 0, 0);

    let streak = user.streak;
    const dayMs = 86400000;
    if (!lastActive) {
      streak = 1;
    } else if (today - lastActive === dayMs) {
      streak += 1;
    } else if (today - lastActive > dayMs) {
      streak = 1;
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastActiveDate: new Date(), streak } });

    const tokens = generateTokens(user.id);
    const { passwordHash: _, ...userSafe } = { ...user, streak };
    res.json({ user: userSafe, ...tokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const tokens = generateTokens(payload.userId);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
