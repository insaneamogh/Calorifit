const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/water/:date
router.get('/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const logs = await prisma.waterLog.findMany({
      where: { userId: req.userId, date },
      orderBy: { createdAt: 'asc' },
    });
    const total = logs.reduce((sum, l) => sum + l.amountMl, 0);
    res.json({ logs, totalMl: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/water
router.post('/', auth, async (req, res) => {
  try {
    const { date, amountMl } = req.body;
    if (!amountMl) return res.status(400).json({ error: 'amountMl is required' });

    const log = await prisma.waterLog.create({
      data: {
        userId: req.userId,
        date: new Date(date || new Date()),
        amountMl: Number(amountMl),
      },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
