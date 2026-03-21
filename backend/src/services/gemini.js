const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FOOD_JSON_SCHEMA = `{
  "foods": [
    {
      "name": "string",
      "estimatedGrams": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "glycemicIndex": number,
      "tags": ["string"]
    }
  ],
  "confidence": "high|medium|low",
  "notes": "string"
}`;

/**
 * Analyze a food image using Gemini Vision
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - Image MIME type
 */
async function analyzeImage(base64Image, mimeType = 'image/jpeg') {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a professional nutritionist AI. Analyze this food image and identify all food items visible.
For each food item, provide accurate nutritional data per the estimated serving size shown.

Return ONLY valid JSON matching this exact schema (no markdown, no extra text):
${FOOD_JSON_SCHEMA}

Rules:
- estimatedGrams: realistic portion weight in grams
- calories: total calories for that portion
- protein/carbs/fat/fiber: grams for that portion
- glycemicIndex: the estimated Glycemic Index (GI) of this food on a scale of 0-100. Pure proteins/fats = 0, low GI foods < 55, medium 56-69, high >= 70. Be accurate based on nutritional science.
- tags: relevant tags like "High Protein", "Low Carb", "High Fiber", "Vitamin C", etc. (max 3)
- confidence: how confident you are in the identification
- notes: brief note about the meal (optional)`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType } },
  ]);

  const text = result.response.text().trim();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returned invalid JSON: ' + text);
  }
}

/**
 * Parse a food description text into structured nutrition data
 * @param {string} description - Natural language food description
 */
async function describeFood(description) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a professional nutritionist AI. Parse the following food description and extract each food item with its nutritional data.

Food description: "${description}"

Return ONLY valid JSON matching this exact schema (no markdown, no extra text):
${FOOD_JSON_SCHEMA}

Rules:
- estimatedGrams: estimated portion weight in grams
- calories: total calories for that portion
- protein/carbs/fat/fiber: grams for that portion
- glycemicIndex: the estimated Glycemic Index (GI) of this food on a scale of 0-100. Pure proteins/fats = 0, low GI foods < 55, medium 56-69, high >= 70. Be accurate based on nutritional science.
- tags: relevant tags like "High Protein", "Low Carb", "High Fiber", etc. (max 3)
- confidence: how confident you are in the estimation
- notes: brief note if any assumptions were made`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returned invalid JSON: ' + text);
  }
}

module.exports = { analyzeImage, describeFood };
