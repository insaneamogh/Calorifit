const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/pantry - get all pantry items
router.get('/', auth, async (req, res) => {
  try {
    const items = await prisma.pantryItem.findMany({
      where: { userId: req.userId },
      include: { food: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pantry - add pantry item
router.post('/', auth, async (req, res) => {
  try {
    const { name, quantity, unit, category, expiryDate, foodId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const item = await prisma.pantryItem.create({
      data: {
        userId: req.userId,
        name,
        quantity: quantity || 1,
        unit: unit || 'piece',
        category: category || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        foodId: foodId || null,
      },
      include: { food: true },
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/pantry/:id - update quantity/expiry
router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.pantryItem.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) return res.status(404).json({ error: 'Pantry item not found' });
    if (existing.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    const { name, quantity, unit, category, expiryDate } = req.body;

    const item = await prisma.pantryItem.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(unit !== undefined && { unit }),
        ...(category !== undefined && { category }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
      },
      include: { food: true },
    });

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/pantry/:id - remove item
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.pantryItem.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) return res.status(404).json({ error: 'Pantry item not found' });
    if (existing.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.pantryItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
