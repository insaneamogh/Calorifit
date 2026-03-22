const axios = require('axios');

/**
 * Look up a product by barcode using Open Food Facts API
 */
async function lookupBarcode(barcode) {
  try {
    const res = await axios.get(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { timeout: 8000 }
    );

    if (res.data.status !== 1 || !res.data.product) {
      return null;
    }

    const p = res.data.product;
    const name = p.product_name || p.product_name_en || 'Unknown Product';
    const n = p.nutriments || {};
    const servingG = parseFloat(p.serving_quantity) || 100;

    return {
      foods: [{
        name,
        estimatedGrams: servingG,
        calories: Math.round((n['energy-kcal_100g'] || n['energy-kcal'] || 0) * servingG / 100),
        protein: Math.round(((n.proteins_100g || 0) * servingG / 100) * 10) / 10,
        carbs: Math.round(((n.carbohydrates_100g || 0) * servingG / 100) * 10) / 10,
        fat: Math.round(((n.fat_100g || 0) * servingG / 100) * 10) / 10,
        fiber: Math.round(((n.fiber_100g || 0) * servingG / 100) * 10) / 10,
        glycemicIndex: 50, // Default since OFF doesn't provide GI
        tags: [
          ...(p.categories_tags || []).slice(0, 2).map(t => t.replace('en:', '').replace(/-/g, ' ')),
        ].filter(Boolean),
      }],
      confidence: 'high',
      notes: `Product: ${name}. Brand: ${p.brands || 'Unknown'}.`,
    };
  } catch (err) {
    console.error('Barcode lookup error:', err.message);
    return null;
  }
}

module.exports = { lookupBarcode };
