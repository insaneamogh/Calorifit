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
 */
async function analyzeImage(base64Image, mimeType = 'image/jpeg') {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an expert nutritionist and dietitian AI with deep knowledge of global cuisines including Indian, Middle Eastern, Asian, Mediterranean, and Western foods.

Analyze this food image carefully. Identify ALL food items, ingredients, and dishes visible.

For each distinct food item or dish, provide precise nutritional data based on the estimated serving size in the image.

Return ONLY valid JSON matching this exact schema (no markdown, no code blocks, no extra text):
${FOOD_JSON_SCHEMA}

Nutritional guidelines:
- estimatedGrams: realistic portion weight in grams based on what is visually shown
- calories: accurate total calories for that specific portion
- protein/carbs/fat/fiber: grams for that exact portion (not per 100g)
- glycemicIndex: scientifically accurate GI value 0-100
  * Pure proteins (chicken, fish, eggs, paneer, tofu) = 0
  * Pure fats (oil, ghee, butter, nuts) = 0-15
  * Non-starchy vegetables = 10-35
  * Legumes (dal, rajma, lentils) = 25-40
  * Whole grains (brown rice, oats, quinoa) = 40-60
  * White rice = 64-72, White bread = 70-85, Sugar/sweets = 65-100
  * Fruits: apple=38, banana=51, mango=56, dates=42
- tags: 2-3 relevant health tags like "High Protein", "Low Carb", "High Fiber", "Healthy Fat", "Complex Carbs", "Antioxidants"
- confidence: "high" if food is clearly identifiable, "medium" if partially visible, "low" if unclear
- notes: brief observation about the meal nutritional quality

Be conservative with calories — accuracy matters more than estimates. If you see a mixed dish (like biryani or curry), break it into its main components OR list as a single dish with combined macros.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType } },
  ]);

  const text = result.response.text().trim();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    throw new Error('AI returned invalid response. Please try again.');
  }
}

/**
 * Parse a food description text into structured nutrition data
 */
async function describeFood(description) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an expert nutritionist AI specializing in accurate calorie and macro calculation.

The user has described their meal or food. Analyze it carefully and extract each food item with precise nutritional data.

User input: "${description}"

Instructions:
1. Parse each food item mentioned, inferring standard portion sizes if not specified
2. For combined dishes (e.g. "dal with rice"), list as separate items or as one combined item
3. If quantity is mentioned (e.g. "2 eggs", "200g chicken"), use that exact amount
4. If no quantity given, use standard Indian/international serving sizes
5. Account for cooking methods (fried adds ~5-8g fat per 100g vs grilled)

Return ONLY valid JSON matching this exact schema (no markdown, no code blocks, no extra text):
${FOOD_JSON_SCHEMA}

Nutritional guidelines:
- estimatedGrams: portion weight in grams (use standard serving sizes if unspecified)
- calories: accurate total for that portion
- protein/carbs/fat/fiber: grams for that portion
- glycemicIndex: scientifically accurate GI (0=pure protein/fat, low<55, medium 56-69, high≥70)
- tags: 2-3 health tags ("High Protein", "Low Carb", "High Fiber", "Healthy Fat", "Complex Carbs", "Processed", "Whole Food")
- confidence: "high" if standard food, "medium" if estimating, "low" if very unclear
- notes: any important nutritional insight or assumption made

Common Indian food references:
- 1 roti = 120 cal, 3g protein, 25g carbs, 2g fat, GI=62
- 1 cup rice (cooked) = 200 cal, 4g protein, 44g carbs, 0.5g fat, GI=68
- 1 cup dal = 180 cal, 12g protein, 30g carbs, 2g fat, GI=32
- 100g paneer = 265 cal, 18g protein, 3g carbs, 20g fat, GI=0
- 1 banana = 105 cal, 1.3g protein, 27g carbs, 0.4g fat, GI=51`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    throw new Error('AI returned invalid response. Please try again.');
  }
}

module.exports = { analyzeImage, describeFood };
