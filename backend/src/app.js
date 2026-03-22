require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/foods');
const logRoutes = require('./routes/logs');
const aiRoutes = require('./routes/ai');
const waterRoutes = require('./routes/water');
const progressRoutes = require('./routes/progress');
const exerciseRoutes = require('./routes/exercises');
const pantryRoutes = require('./routes/pantry');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/pantry', pantryRoutes);

app.get('/', (req, res) => res.json({
  name: 'CalorieCalx API',
  version: '1.0.0',
  status: 'running',
  endpoints: [
    'POST /api/auth/register',
    'POST /api/auth/login',
    'GET  /api/users/me',
    'GET  /api/foods/search?q=',
    'GET  /api/logs/:date',
    'POST /api/ai/scan-image',
    'POST /api/ai/describe-food',
    'POST /api/ai/barcode',
    'GET  /api/water/:date',
    'GET  /api/progress/stats',
    'GET  /api/exercises',
    'GET  /api/pantry',
  ],
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CalorieCalx API running on port ${PORT}`));
