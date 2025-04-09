// utils/meal-plan-generator.ts

import { logger } from '@/utils/logger';
import { QuestionnaireState } from '@/types/questionnaire';
import { MealPlan, ShoppingList } from '@/types/meal-plan';

import { createMealPlanJob, pollMealPlan } from '@/services/api';
import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';

/**
 * Convert final API shape to your local shape. 
 * 
 * The API (per your sample) returns something like:
 *
 *   {
 *     "mealPlan": {
 *       "id": "...",
 *       "days": {
 *         "Day 1": { "Breakfast": "Overnight Oats...", ... },
 *         "Day 2": { ... },
 *         ...
 *       },
 *       "notes": "",
 *       "nutritionalInfo": {
 *         "daily_totals": { ... },
 *         "meal_breakdown": { ... }
 *       }
 *     }
 *   }
 *
 * But your UI code expects an object with an array of Meal objects:
 *   {
 *     mealPlan: {
 *       id: string,
 *       createdAt: string,
 *       meals: Meal[],
 *       totalCalories: number,
 *       totalNutrients: Nutrient[],
 *     },
 *     shoppingList: ...
 *   }
 */
function convertApiResponseToAppModel(apiResp: any, jobId: string) {
  // If the API returns your entire JSON under "apiResp.mealPlan"
  // we check that it exists:
  const mealPlanFromApi = apiResp?.mealPlan;
  if (!mealPlanFromApi || !mealPlanFromApi.days) {
    logger.warn(
      'MEAL_PLAN_GENERATOR',
      'convertApiResponseToAppModel: "mealPlan" or "days" was missing in API response'
    );
    return null; // This will trigger fallback in generateMealPlan
  }

  // We'll build up an array of "Meal" objects:
  const mealArray = [];

  // mealPlanFromApi.days is something like:
  // {
  //   "Day 1": { "Breakfast": "...", "Lunch": "...", "Dinner": "...", "Snack": "..." },
  //   "Day 2": { ... },
  //   ...
  // }
  Object.entries(mealPlanFromApi.days).forEach(([dayKey, mealObj]) => {
    // dayKey might be "Day 1"
    // mealObj might be { Breakfast: "...", Lunch: "...", Dinner: "..." }
    const dayNumber = parseInt(dayKey.replace('Day ', ''), 10) || 1;

    Object.entries(mealObj).forEach(([mealType, mealName]) => {
      // mealType: "Breakfast" or "Lunch" or "Dinner" or "Snack"
      // mealName: e.g. "Overnight Oats with Berries"
      // We'll create a unique ID for each meal:
      const mealTypeLower = mealType.toLowerCase();

      mealArray.push({
        id: `meal-${dayNumber}-${mealTypeLower}`,
        name: mealName,
        type: mealTypeLower, // "breakfast"|"lunch"|"dinner"|"snack"
        day: dayNumber,
        isFavorite: false,
        // The front-end expects a "recipe" object:
        recipe: {
          id: `recipe-${dayNumber}-${mealTypeLower}`,
          name: mealName,
          ingredients: [],          // We'll keep these empty or you can fill them
          instructions: [],         // The code typically reads from meal.recipe.instructions
          prepTime: 0,
          cookTime: 0,
          // We'll use a placeholder image:
          imageUrl: 'https://via.placeholder.com/600x400?text=Meal+Image', // <-- CHANGED
          nutrients: [],
          calories: 0,
        },
      });
    });
  });

  // If we have "nutritionalInfo" in the API, we’ll parse it:
  const nutritionalInfo = mealPlanFromApi.nutritionalInfo || {};
  let totalCalories = 0;
  let totalNutrients = [];

  // If the top-level daily_totals exist, parse them:
  if (nutritionalInfo.daily_totals) {
    const dt = nutritionalInfo.daily_totals;
    // "calories" might be "2300" or something:
    totalCalories = parseInt(dt.calories, 10) || 0;

    // We can store macros as the "top level" totalNutrients array:
    if (dt.macronutrients) {
      // dt.macronutrients has { carbohydrates: { grams, percentage }, proteins: { ... }, fats: { ... } }
      totalNutrients = [
        {
          name: 'carbohydrates',
          amount: parseFloat(dt.macronutrients.carbohydrates.grams) || 0,
          unit: 'g',
        },
        {
          name: 'proteins',
          amount: parseFloat(dt.macronutrients.proteins.grams) || 0,
          unit: 'g',
        },
        {
          name: 'fats',
          amount: parseFloat(dt.macronutrients.fats.grams) || 0,
          unit: 'g',
        },
        {
          name: 'fiber',
          amount: parseFloat(dt.fiber) || 0,
          unit: 'g',
        },
        // etc. You can parse more if needed
      ];
    }
  }

  // If we have "meal_breakdown", we’ll fill the per-meal calories & macros:
  if (nutritionalInfo.meal_breakdown) {
    // meal_breakdown = { "Day 1": { "Breakfast": { "calories": "500", "macronutrients": {...} }, ... }, ... }
    Object.entries(nutritionalInfo.meal_breakdown).forEach(
      ([dayKey, mealTypes]) => {
        const dayNumber = parseInt(dayKey.replace('Day ', ''), 10) || 1;

        // mealTypes is something like { "Breakfast": { "calories": "500", "macronutrients": {carbohydrates, fats, proteins} }, ... }
        Object.entries(mealTypes).forEach(([mealType, macros]) => {
          const mealTypeLower = mealType.toLowerCase(); // "breakfast", "lunch", "dinner", etc.
          const mealObj = mealArray.find(
            (m) => m.day === dayNumber && m.type === mealTypeLower
          );

          if (mealObj && macros) {
            // macros might be: { calories: "500", macronutrients: { carbohydrates: "...", fats: "...", proteins: "..." } }
            mealObj.recipe.calories = parseInt((macros as any).calories, 10) || 0;

            // Build an array of nutrient items:
            if ((macros as any).macronutrients) {
              const mm = (macros as any).macronutrients;
              mealObj.recipe.nutrients = [
                {
                  name: 'carbohydrates',
                  amount: parseFloat(mm.carbohydrates) || 0,
                  unit: 'g',
                },
                {
                  name: 'fats',
                  amount: parseFloat(mm.fats) || 0,
                  unit: 'g',
                },
                {
                  name: 'proteins',
                  amount: parseFloat(mm.proteins) || 0,
                  unit: 'g',
                },
              ];
            }
          }
        });
      }
    );
  }

  // We could also store the "notes" from nutritionalInfo if needed:
  // (Your UI might not use it, but just in case.)
  const notes = nutritionalInfo.notes || mealPlanFromApi.notes || '';

  // Return the final shape the front-end expects:
  return {
    mealPlan: {
      id: mealPlanFromApi.id || `plan-${jobId}`,
      createdAt: new Date().toISOString(),
      meals: mealArray,
      totalCalories,
      totalNutrients,
    },
    // If you want to parse a "shoppingList" from the API, do it here:
    // For now we can just set null, or you can create from day-based ingredients
    shoppingList: null,
  };
}

/**
 * If the real API fails, we fallback to sample data.
 */
function buildSampleFallback(q: QuestionnaireState) {
  const requestedDays = q.goalSettings.mealPlanDays || 5;
  const fallbackPlan: MealPlan = {
    ...sampleMealPlan,
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    meals: sampleMealPlan.meals.filter((m) => m.day <= requestedDays),
  };
  const fallbackShopping = createShoppingList(fallbackPlan);

  logger.info('MEAL_PLAN_GENERATOR', 'Created fallback meal plan with sample data', {
    planId: fallbackPlan.id,
    mealsCount: fallbackPlan.meals.length,
    shoppingItemsCount: fallbackShopping.items.length,
  });

  return {
    mealPlan: fallbackPlan,
    shoppingList: fallbackShopping,
  };
}

/**
 * Format your store's QuestionnaireState to the shape needed by POST /mealplan
 */
function formatQuestionnaireData(q: QuestionnaireState) {
  return {
    personal_info: {
      age: q.personalInfo.age,
      weight: q.personalInfo.weight,
      height: q.personalInfo.height,
      gender: q.personalInfo.gender,
      zip_code: q.personalInfo.zipCode || '',
      medical_conditions: q.personalInfo.medicalConditions || [],
      hba1c: q.personalInfo.hba1c || null,
      medications: q.personalInfo.medications || [],
    },
    diet_preferences: {
      cuisines: q.dietPreferences.cuisines || [],
      other_cuisine: q.dietPreferences.otherCuisine || '',
      allergies: q.dietPreferences.allergies || [],
      dietary_preferences: q.dietPreferences.dietaryPreferences || [],
      batch_cooking: q.dietPreferences.batchCooking || false,
      strictness_level: q.dietPreferences.strictnessLevel || 'moderate',
    },
    goal_settings: {
      health_goal: q.goalSettings.healthGoal || 'maintenance',
      calorie_reduction: q.goalSettings.calorieReduction || 'moderate',
      meal_plan_days: q.goalSettings.mealPlanDays || 5,
      meals_per_day: q.goalSettings.mealsPerDay || 3,
    },
  };
}

/**
 * The main function:
 *  - (1) Format data & create job
 *  - (2) Poll for final result
 *  - (3) Convert final result to app shape
 *  - (4) If any step fails, fallback to sample
 */
export async function generateMealPlan(questionnaireData: QuestionnaireState) {
  logger.info('MEAL_PLAN_GENERATOR', 'Starting meal plan generation');

  // 1) Format and create job
  const payload = formatQuestionnaireData(questionnaireData);
  let jobResponse: any;
  try {
    jobResponse = await createMealPlanJob(payload);
    if (!jobResponse?.jobId) {
      throw new Error('No jobId found in createMealPlanJob response.');
    }
  } catch (err) {
    logger.error('MEAL_PLAN_GENERATOR', 'API call failed (create job)', err);
    logger.warn('MEAL_PLAN_GENERATOR', 'Falling back to sample data due to create error');
    return buildSampleFallback(questionnaireData);
  }

  // 2) Poll
  let finalApiResp: any;
  try {
    finalApiResp = await pollMealPlan(jobResponse.jobId);
    logger.info('MEAL_PLAN_GENERATOR', 'Job polled successfully, final result', finalApiResp);
  } catch (pollErr) {
    logger.error('MEAL_PLAN_GENERATOR', 'API call failed (poll)', pollErr);
    logger.warn('MEAL_PLAN_GENERATOR', 'Falling back to sample data due to poll error');
    return buildSampleFallback(questionnaireData);
  }

  if (!finalApiResp) {
    logger.warn('MEAL_PLAN_GENERATOR', 'Poll returned nothing, fallback');
    return buildSampleFallback(questionnaireData);
  }

  // 3) Convert shape
  const unified = convertApiResponseToAppModel(finalApiResp, jobResponse.jobId);

  if (!unified) {
    // If convertApiResponseToAppModel returned null, fallback
    logger.warn('MEAL_PLAN_GENERATOR', 'Converted meal plan is null, fallback');
    return buildSampleFallback(questionnaireData);
  }

  logger.info('MEAL_PLAN_GENERATOR', 'Returning final meal plan from real API', unified);
  return unified; 
}

