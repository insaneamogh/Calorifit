/**
 * Calculate TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor equation
 */
function calculateTDEE({ gender, age, heightCm, weightKg, activityLevel, goal }) {
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  let tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  const goalAdjustments = { lose: -500, maintain: 0, gain: 300 };
  tdee += goalAdjustments[goal] || 0;

  return Math.round(tdee);
}

/**
 * Calculate macro targets based on daily calorie goal
 */
function calculateMacros(dailyCalGoal, goal) {
  let proteinPct, carbPct, fatPct;

  if (goal === 'lose') {
    proteinPct = 0.35; carbPct = 0.40; fatPct = 0.25;
  } else if (goal === 'gain') {
    proteinPct = 0.25; carbPct = 0.50; fatPct = 0.25;
  } else {
    proteinPct = 0.30; carbPct = 0.45; fatPct = 0.25;
  }

  return {
    protein: Math.round((dailyCalGoal * proteinPct) / 4),
    carbs: Math.round((dailyCalGoal * carbPct) / 4),
    fat: Math.round((dailyCalGoal * fatPct) / 9),
  };
}

/**
 * Calculate nutrition for a food item based on grams consumed
 */
function calculateItemNutrition(food, grams) {
  const ratio = grams / 100;
  return {
    calories: Math.round(food.calories * ratio * 10) / 10,
    protein: Math.round(food.protein * ratio * 10) / 10,
    carbs: Math.round(food.carbs * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10,
  };
}

module.exports = { calculateTDEE, calculateMacros, calculateItemNutrition };
