const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { analyzeImage, describeFood } = require('../services/gemini');
const { lookupBarcode } = require('../services/barcode');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/ai/scan-image
// Body: multipart form with "image" file OR JSON with "base64" + "mimeType"
router.post('/scan-image', auth, upload.single('image'), async (req, res) => {
  try {
    let base64, mimeType;

    if (req.file) {
      base64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.base64) {
      base64 = req.body.base64;
      mimeType = req.body.mimeType || 'image/jpeg';
    } else {
      return res.status(400).json({ error: 'Image file or base64 required' });
    }

    const result = await analyzeImage(base64, mimeType);
    res.json(result);
  } catch (err) {
    console.error('Gemini vision error:', err.message);
    res.status(500).json({ error: 'AI analysis failed: ' + err.message });
  }
});

// POST /api/ai/describe-food
// Body: { description: "I had a bowl of oats with banana and honey" }
router.post('/describe-food', auth, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'description is required' });

    const result = await describeFood(description);
    res.json(result);
  } catch (err) {
    console.error('Gemini text error:', err.message);
    res.status(500).json({ error: 'AI analysis failed: ' + err.message });
  }
});

// POST /api/ai/barcode
// Body: { barcode: "0123456789012" }
router.post('/barcode', auth, async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) return res.status(400).json({ error: 'barcode is required' });

    // 1. Try Open Food Facts first
    const offResult = await lookupBarcode(barcode);
    if (offResult) {
      return res.json(offResult);
    }

    // 2. Fall back to Gemini text description
    const geminiResult = await describeFood(
      `Nutritional information for product with barcode ${barcode}`
    );
    res.json(geminiResult);
  } catch (err) {
    console.error('Barcode lookup error:', err.message);
    res.status(500).json({ error: 'Barcode lookup failed: ' + err.message });
  }
});

module.exports = router;
