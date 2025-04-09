// utils/meal-plan-generator.ts
import { logger } from '@/utils/logger';
import { QuestionnaireState } from '@/types/questionnaire';
import { MealPlan } from '@/types/meal-plan';

import { createMealPlanJob, pollMealPlan } from '@/services/api';
import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';

function convertApiResponseToAppModel(apiResp: any, jobId: string) {
  // If the response is { Data: {...} }, unify that:
  const topLevel = apiResp?.Data || apiResp;
  if (!topLevel) {
    return {}; // or null → triggers fallback
  }

  // 1) Parse meal_plan
  const mealPlanObj = topLevel.meal_plan;
  if (!mealPlanObj) {
    return {}; // triggers fallback
  }

  // 2) Build an array of "Meal" objects
  const mealArray = [];
  Object.entries(mealPlanObj).forEach(([dayKey, dayMeals]) => {
    // dayKey is "Day 1", "Day 2", etc.
    const dayNumber = parseInt(dayKey.replace('Day ', ''), 10) || 1;

    // dayMeals might be { Breakfast: "...", Lunch: "...", ... }
    Object.entries(dayMeals as any).forEach(([mealType, mealString]) => {
      const mealTypeLower = mealType.toLowerCase(); // "breakfast"
      mealArray.push({
        id: `meal-${dayNumber}-${mealTypeLower}`,
        name: mealString,        // e.g. "Mexican Egg Scramble..."
        type: mealTypeLower,
        day: dayNumber,
        isFavorite: false,
        recipe: {
          id: `recipe-${dayNumber}-${mealTypeLower}`,
          name: mealString,
          ingredients: [],
          instructions: [],
          prepTime: 0,
          cookTime: 0,
          imageUrl: 'https://via.placeholder.com/600x400', // placeholder
          nutrients: [],
          calories: 0,
        },
      });
    });
  });

  // 3) Parse nutritional_info
  const nutritionalInfo = topLevel.nutritional_info || {};
  let totalCalories = 0;
  let totalNutrients = [];
  if (nutritionalInfo.daily_totals) {
    const dt = nutritionalInfo.daily_totals;
    // dt.calories might be "1600" or "1600 kcal"
    totalCalories = parseInt(dt.calories, 10) || 0;

    // If dt.macronutrients => { carbohydrates: {grams:"180"}, fats: {grams:"44"}, proteins:{grams:"120"} }
    if (dt.macronutrients) {
      const { carbohydrates, fats, proteins } = dt.macronutrients;
      totalNutrients = [
        {
          name: 'carbohydrates',
          amount: parseFloat(carbohydrates?.grams || '0'),
          unit: 'g',
        },
        {
          name: 'fats',
          amount: parseFloat(fats?.grams || '0'),
          unit: 'g',
        },
        {
          name: 'proteins',
          amount: parseFloat(proteins?.grams || '0'),
          unit: 'g',
        },
      ];
    }
  }

  // 4) Attach meal_breakdown macros to each meal
  if (nutritionalInfo.meal_breakdown) {
    Object.entries(nutritionalInfo.meal_breakdown).forEach(([dayKey, dayVal]) => {
      const dayNumber = parseInt(dayKey.replace('Day ', ''), 10) || 1;

      // dayVal might be { "Breakfast": { "calories": "400", "macronutrients": {...} }, ...}
      Object.entries(dayVal as any).forEach(([mealType, macros]) => {
        const mealTypeLower = mealType.toLowerCase();
        const mealObj = mealArray.find(
          (m) => m.day === dayNumber && m.type === mealTypeLower
        );
        if (mealObj && macros) {
          mealObj.recipe.calories = parseInt((macros as any).calories, 10) || 0;
          const mm = (macros as any).macronutrients;
          if (mm) {
            // mm: { carbohydrates: "50 g", fats: "15 g", proteins: "25 g" }
            mealObj.recipe.nutrients = [
              {
                name: 'carbohydrates',
                amount: parseFloat(mm.carbohydrates || '0'),
                unit: 'g',
              },
              {
                name: 'fats',
                amount: parseFloat(mm.fats || '0'),
                unit: 'g',
              },
              {
                name: 'proteins',
                amount: parseFloat(mm.proteins || '0'),
                unit: 'g',
              },
            ];
          }
        }
      });
    });
  }

  // 5) If there's a "shopping_list" array, parse or store it
  let finalShoppingList = null;
  if (topLevel.shopping_list && Array.isArray(topLevel.shopping_list)) {
    // e.g. "shopping_list": [{ "ingredient": "Eggs", "quantity": "12" }, ... ]
    // Convert that to your store shape if needed
    finalShoppingList = {
      items: topLevel.shopping_list.map((item) => ({
        name: item.ingredient,
        amount: 1,   // or parse from item.quantity, if you have a pattern
        unit: item.quantity,
        category: 'Misc', // You could guess from the ingredient if you want
        checked: false,
      })),
    };
  }

  // 6) Return the final shape
  return {
    mealPlan: {
      id: `plan-${jobId}`,
      createdAt: new Date().toISOString(),
      meals: mealArray,
      totalCalories,
      totalNutrients,
      notes: nutritionalInfo.notes || '',
    },
    shoppingList: finalShoppingList,
    // Potentially you could store the "recipes" as well if you want
  };
}

function buildSampleFallback(q: QuestionnaireState) {
  // ...
}

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
      // <-- ADDED:
      weight_unit: q.personalInfo.weightUnit, 
      height_unit: q.personalInfo.heightUnit, 
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

export async function generateMealPlan(questionnaireData: QuestionnaireState) {
  logger.info('MEAL_PLAN_GENERATOR', 'Starting meal plan generation');

  const payload = formatQuestionnaireData(questionnaireData);

  // 1) Create job
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
    logger.warn('MEAL_PLAN_GENERATOR', 'Converted meal plan is null, fallback');
    return buildSampleFallback(questionnaireData);
  }

  logger.info('MEAL_PLAN_GENERATOR', 'Returning final meal plan from real API', unified);
  return unified;
}
