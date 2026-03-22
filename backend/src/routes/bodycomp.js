const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/body-composition - get all entries (most recent first)
router.get('/', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const entries = await prisma.bodyComposition.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/body-composition/latest - get most recent entry
router.get('/latest', auth, async (req, res) => {
  try {
    const entry = await prisma.bodyComposition.findFirst({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });
    res.json(entry || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/body-composition - add new entry
router.post('/', auth, async (req, res) => {
  try {
    const {
      date, weightKg, bmi, bodyFatPct, fatFreeBodyKg, subcutaneousFat,
      visceralFat, bodyWaterPct, skeletalMusclePct, muscleMassKg,
      boneMassKg, proteinPct, bmr, metabolicAge, source,
    } = req.body;

    if (!date || !weightKg) {
      return res.status(400).json({ error: 'date and weightKg are required' });
    }

    const entryDate = new Date(date + 'T00:00:00');

    const entry = await prisma.bodyComposition.upsert({
      where: {
        userId_date_source: {
          userId: req.userId,
          date: entryDate,
          source: source || 'manual',
        },
      },
      update: {
        weightKg, bmi, bodyFatPct, fatFreeBodyKg, subcutaneousFat,
        visceralFat, bodyWaterPct, skeletalMusclePct, muscleMassKg,
        boneMassKg, proteinPct, bmr, metabolicAge,
      },
      create: {
        userId: req.userId,
        date: entryDate,
        weightKg,
        bmi, bodyFatPct, fatFreeBodyKg, subcutaneousFat,
        visceralFat, bodyWaterPct, skeletalMusclePct, muscleMassKg,
        boneMassKg, proteinPct, bmr, metabolicAge,
        source: source || 'manual',
      },
    });

    // Also update user's current weight
    await prisma.user.update({
      where: { id: req.userId },
      data: { currentWeight: weightKg },
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/body-composition/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await prisma.bodyComposition.findUnique({ where: { id: req.params.id } });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (entry.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.bodyComposition.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
