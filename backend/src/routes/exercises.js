const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/exercises?date=YYYY-MM-DD - get exercises for a day
router.get('/', auth, async (req, res) => {
  try {
    const dateStr = req.query.date;
    if (!dateStr) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });

    const start = new Date(dateStr);
    if (isNaN(start)) return res.status(400).json({ error: 'Invalid date format' });
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const exercises = await prisma.exercise.findMany({
      where: {
        userId: req.userId,
        date: { gte: start, lt: end },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/exercises/week - get weekly exercise summary
router.get('/week', auth, async (req, res) => {
  try {
    const now = new Date();
    // Get start of current week (Monday)
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const exercises = await prisma.exercise.findMany({
      where: {
        userId: req.userId,
        date: { gte: weekStart, lt: weekEnd },
      },
      orderBy: { date: 'asc' },
    });

    // Group by day of week (0=Mon, 6=Sun)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const summary = days.map((label, idx) => {
      const dayStart = new Date(weekStart);
      dayStart.setDate(dayStart.getDate() + idx);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayExercises = exercises.filter((e) => {
        const d = new Date(e.date);
        return d >= dayStart && d < dayEnd;
      });

      const totalCalories = dayExercises.reduce((s, e) => s + (e.caloriesBurned || 0), 0);
      const count = dayExercises.length;

      return { day: label, calories: Math.round(totalCalories), count };
    });

    const totalWeek = summary.reduce((s, d) => s + d.calories, 0);

    res.json({ days: summary, totalCalories: totalWeek });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exercises - add exercise
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, sets, reps, weight, duration, caloriesBurned, date } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'name and category are required' });
    }

    // Auto-calculate calories if not provided
    let burned = caloriesBurned;
    if (burned == null) {
      if (category === 'cardio' && duration) {
        burned = duration * 10;
      } else if (sets && reps) {
        burned = sets * reps * 0.5;
      } else {
        burned = 0;
      }
    }

    const exercise = await prisma.exercise.create({
      data: {
        userId: req.userId,
        name,
        category,
        sets: sets || null,
        reps: reps || null,
        weight: weight || null,
        duration: duration || null,
        caloriesBurned: burned,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json(exercise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/exercises/:id - delete exercise
router.delete('/:id', auth, async (req, res) => {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id },
    });

    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    if (exercise.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.exercise.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
