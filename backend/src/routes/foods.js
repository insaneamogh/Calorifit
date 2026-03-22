const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/foods/search?q=chicken
router.get('/search', auth, async (req, res) => {
  try {
    const { q = '' } = req.query;
    const foods = await prisma.food.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { brandName: { contains: q, mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { isCustom: false },
              { isCustom: true, createdBy: req.userId },
            ],
          },
        ],
      },
      take: 30,
      orderBy: { name: 'asc' },
    });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/foods/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const food = await prisma.food.findUnique({ where: { id: req.params.id } });
    if (!food) return res.status(404).json({ error: 'Food not found' });
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/foods/custom - create custom food
router.post('/custom', auth, async (req, res) => {
  try {
    const { name, brandName, calories, protein, carbs, fat, fiber, sugar } = req.body;
    if (!name || calories === undefined) {
      return res.status(400).json({ error: 'Name and calories are required' });
    }
    const food = await prisma.food.create({
      data: {
        name,
        brandName,
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0,
        sugar: Number(sugar) || 0,
        isCustom: true,
        createdBy: req.userId,
      },
    });
    res.status(201).json(food);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
