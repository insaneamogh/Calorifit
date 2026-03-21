/**
 * Shifa Index frontend utilities
 *
 * Formula (per 100g): (Calories x GI) / (Protein(g) + Fiber(g))
 * Lower = healthier
 */

export function getShifaRating(index: number): string {
  if (index <= 0)    return 'neutral';
  if (index <= 50)   return 'excellent';
  if (index <= 150)  return 'good';
  if (index <= 300)  return 'moderate';
  if (index <= 500)  return 'fair';
  return 'poor';
}

export function getShifaColor(rating: string): string {
  const colors: Record<string, string> = {
    neutral:   '#888888',
    excellent: '#22c55e',
    good:      '#10b981',
    moderate:  '#f59e0b',
    fair:      '#f97316',
    poor:      '#ef4444',
  };
  return colors[rating] || '#888888';
}

export function getShifaLabel(rating: string): string {
  const labels: Record<string, string> = {
    neutral:   'Neutral',
    excellent: 'Excellent',
    good:      'Good',
    moderate:  'Moderate',
    fair:      'Fair',
    poor:      'Poor',
  };
  return labels[rating] || 'N/A';
}

export function getShifaBgColor(rating: string): string {
  const colors: Record<string, string> = {
    neutral:   'rgba(136,136,136,0.10)',
    excellent: 'rgba(34,197,94,0.10)',
    good:      'rgba(16,185,129,0.10)',
    moderate:  'rgba(245,158,11,0.10)',
    fair:      'rgba(249,115,22,0.10)',
    poor:      'rgba(239,68,68,0.10)',
  };
  return colors[rating] || 'rgba(136,136,136,0.10)';
}

/**
 * Compute a client-side Shifa Index from an AI scan result
 * (for display before the backend computes it)
 */
export function computeShifaFromScan(food: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  glycemicIndex?: number;
  estimatedGrams?: number;
}): { shifaIndex: number; rating: string } {
  const grams = food.estimatedGrams || 100;
  const per100 = 100 / grams;
  const calPer100 = food.calories * per100;
  const protPer100 = food.protein * per100;
  const fiberPer100 = (food.fiber || 0) * per100;
  const gi = food.glycemicIndex || 50; // default moderate if unknown

  const denom = protPer100 + fiberPer100;
  if (denom < 0.5) {
    return { shifaIndex: gi > 0 ? 999 : 0, rating: gi > 0 ? 'poor' : 'neutral' };
  }

  const shifaIndex = Math.round((calPer100 * gi) / denom);
  return { shifaIndex, rating: getShifaRating(shifaIndex) };
}

/**
 * Compute a cumulative meal-level Shifa Index from multiple items
 * Uses weighted average GI by carb contribution
 */
export function computeMealShifa(items: Array<{
  calories: number;
  protein: number;
  carbs: number;
  fiber?: number;
  gi?: number;
}>): { shifaIndex: number; weightedGI: number; rating: string } {
  if (!items || items.length === 0) {
    return { shifaIndex: 0, weightedGI: 0, rating: 'neutral' };
  }

  let totalCal = 0, totalProt = 0, totalFiber = 0, totalCarbs = 0, giCarbsSum = 0;
  for (const item of items) {
    totalCal += item.calories || 0;
    totalProt += item.protein || 0;
    totalFiber += item.fiber || 0;
    totalCarbs += item.carbs || 0;
    giCarbsSum += (item.gi || 0) * (item.carbs || 0);
  }

  const weightedGI = totalCarbs > 0 ? Math.round(giCarbsSum / totalCarbs) : 0;
  const denom = totalProt + totalFiber;

  if (denom < 0.5) {
    return { shifaIndex: weightedGI > 0 ? 999 : 0, weightedGI, rating: weightedGI > 0 ? 'poor' : 'neutral' };
  }

  const shifaIndex = Math.round((totalCal * weightedGI) / denom);
  return { shifaIndex, weightedGI, rating: getShifaRating(shifaIndex) };
}
