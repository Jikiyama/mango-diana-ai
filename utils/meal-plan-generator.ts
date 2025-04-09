// utils/meal-plan-generator.ts
import { logger } from '@/utils/logger';
import { QuestionnaireState } from '@/types/questionnaire';
import { MealPlan } from '@/types/meal-plan';

import { createMealPlanJob, pollMealPlan } from '@/services/api';
import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';

/**
 * Convert final API shape to your local shape. 
 * 
 * We log additional messages so we can see if something goes wrong.
 */
function convertApiResponseToAppModel(apiResp: any, jobId: string) {
  logger.debug('MEAL_PLAN_GENERATOR', 'Entered convertApiResponseToAppModel', { jobId, apiResp });

  try {
    // If your shape is Data: { meal_plan: {...}, nutritional_info: {...} }
    // we unify that here.
    const topLevel = apiResp?.Data || apiResp;
    logger.debug('MEAL_PLAN_GENERATOR', 'topLevel object', topLevel); // <-- ADDED LOGGING

    if (!topLevel) {
      logger.warn('MEAL_PLAN_GENERATOR', 'No "Data" or top-level object found, returning null');
      return null;
    }

    const mealPlanObj = topLevel.meal_plan;
    logger.debug('MEAL_PLAN_GENERATOR', 'mealPlanObj', mealPlanObj); // <-- ADDED LOGGING

    if (!mealPlanObj) {
      logger.warn('MEAL_PLAN_GENERATOR', 'No "meal_plan" key found in final API response, returning null');
      return null;
    }

    // If we reach here, we have a meal_plan
    const nutritionalInfo = topLevel.nutritional_info || {};
    logger.debug('MEAL_PLAN_GENERATOR', 'nutritionalInfo', nutritionalInfo); // <-- ADDED LOGGING

    // We'll build up an array of "Meal" objects:
    const mealArray = [];

    // mealPlanObj might be { "Day 1": {...}, "Day 2": {...} }
    logger.debug('MEAL_PLAN_GENERATOR', 'Iterating meal_plan days...'); // <-- ADDED LOGGING
    Object.entries(mealPlanObj).forEach(([dayKey, mealObj]) => {
      logger.debug('MEAL_PLAN_GENERATOR', `Processing ${dayKey}`, mealObj); // <-- ADDED LOGGING

      const dayNumber = parseInt(dayKey.replace('Day ', ''), 10) || 1;
      Object.entries(mealObj as any).forEach(([mealType, mealName]) => {
        const mealTypeLower = mealType.toLowerCase();
        mealArray.push({
          id: `meal-${dayNumber}-${mealTypeLower}`,
          name: mealName as string,
          type: mealTypeLower,
          day: dayNumber,
          isFavorite: false,
          recipe: {
            id: `recipe-${dayNumber}-${mealTypeLower}`,
            name: mealName as string,
            ingredients: [],
            instructions: [],
            prepTime: 0,
            cookTime: 0,
            imageUrl: 'https://via.placeholder.com/600x400?text=Meal+Image', 
            nutrients: [],
            calories: 0,
          },
        });
      });
    });

    logger.debug('MEAL_PLAN_GENERATOR', 'Finished building mealArray', { mealArray }); // <-- ADDED LOGGING

    // Now parse daily_totals for top-level total cals/macros
    let totalCalories = 0;
    let totalNutrients = [];
    if (nutritionalInfo.daily_totals) {
      const dt = nutritionalInfo.daily_totals;
      logger.debug('MEAL_PLAN_GENERATOR', 'daily_totals found', dt); // <-- ADDED LOGGING

      // e.g. "2550 kcal"
      // parseInt should still pick up "2550" from "2550 kcal"
      totalCalories = parseInt(dt.calories, 10) || 0;

      if (dt.macronutrients) {
        const { carbohydrates, fats, proteins } = dt.macronutrients;
        totalNutrients = [
          {
            name: 'carbohydrates',
            amount: parseFloat(carbohydrates?.grams) || 0,
            unit: 'g',
          },
          {
            name: 'fats',
            amount: parseFloat(fats?.grams) || 0,
            unit: 'g',
          },
          {
            name: 'proteins',
            amount: parseFloat(proteins?.grams) || 0,
            unit: 'g',
          },
        ];
      }
    } else {
      logger.debug('MEAL_PLAN_GENERATOR', 'No daily_totals in nutritionalInfo'); // <-- ADDED LOGGING
    }

    // Next parse meal_breakdown
    if (nutritionalInfo.meal_breakdown) {
      logger.debug('MEAL_PLAN_GENERATOR', 'meal_breakdown found, populating macros'); // <-- ADDED LOGGING
      Object.entries(nutritionalInfo.meal_breakdown).forEach(([dayKey, dayVal]) => {
        const dayNumber = parseInt(dayKey.replace('Day ', ''), 10) || 1;
        Object.entries(dayVal as any).forEach(([mealType, macros]) => {
          logger.debug('MEAL_PLAN_GENERATOR', `Populating macros for Day ${dayNumber} / ${mealType}`, macros); // <-- ADDED LOGGING
          const mealTypeLower = mealType.toLowerCase();
          const mealObj = mealArray.find((m) => m.day === dayNumber && m.type === mealTypeLower);
          if (mealObj && macros) {
            mealObj.recipe.calories = parseInt((macros as any).calories, 10) || 0;
            const mm = (macros as any).macronutrients;
            if (mm) {
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
      });
    } else {
      logger.debug('MEAL_PLAN_GENERATOR', 'No meal_breakdown in nutritionalInfo'); // <-- ADDED LOGGING
    }

    // Return final shape
    const finalPlan = {
      mealPlan: {
        id: `plan-${jobId}`,
        createdAt: new Date().toISOString(),
        meals: mealArray,
        totalCalories,
        totalNutrients,
      },
      shoppingList: null,
    };

    logger.debug('MEAL_PLAN_GENERATOR', 'finalPlan created successfully', finalPlan); // <-- ADDED LOGGING
    return finalPlan;
  } catch (err: any) {
    logger.error('MEAL_PLAN_GENERATOR', 'Error while converting API response', {
      message: err?.message,
      stack: err?.stack,
    });
    return null;
  }
}

/**
 * If the real API fails or the shape is invalid, fallback to sample data.
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
