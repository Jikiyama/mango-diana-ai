// utils/meal-plan-generator.ts

import { logger } from '@/utils/logger';
import { QuestionnaireState } from '@/types/questionnaire';
import { MealPlan, ShoppingList } from '@/types/meal-plan';

import { createMealPlanJob, pollMealPlan } from '@/services/api';
import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';

/**
 * Convert final API shape to your local shape. 
 * 
 * The API returns something like:
 *   {
 *     "meal_plan": { "Day 1": { ... }, "Day 2": {...} },
 *     "notes": "...",
 *     "nutritional_info": {...}
 *   }
 * 
 * but your UI code expects:
 *   {
 *     mealPlan: {
 *       id: "plan-<jobId>",
 *       days: { Day 1: {...}, Day 2: {...} },
 *       notes: "...",
 *       nutritionalInfo: {...}
 *     }
 *   }
 */
function convertApiResponseToAppModel(apiResp: any, jobId: string) {
  const newPlanId = `plan-${jobId}`; // store jobId in the plan

  return {
    mealPlan: {
      id: newPlanId,
      days: apiResp.meal_plan || {},
      notes: apiResp.notes || '',
      nutritionalInfo: apiResp.nutritional_info || {},
      // etc. If your UI needs more, parse it here
    },
    // If the real API eventually returns a separate "shopping_list", parse it here
    // e.g. shoppingList: apiResp.shopping_list || [],
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
 * If the real API fails, we fallback to sample data.
 */
function buildSampleFallback(q: QuestionnaireState) {
  const requestedDays = q.goalSettings.mealPlanDays || 5;
  const fallbackPlan: MealPlan = {
    ...sampleMealPlan,
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    meals: sampleMealPlan.meals.filter(m => m.day <= requestedDays),
  };
  const fallbackShopping = createShoppingList(fallbackPlan);

  logger.info('MEAL_PLAN_GENERATOR', 'Created fallback meal plan with sample data', {
    planId: fallbackPlan.id,
    mealsCount: fallbackPlan.meals.length,
    shoppingItemsCount: fallbackShopping.items.length,
  });

  // Return shape that matches your UI code
  return {
    mealPlan: fallbackPlan,
    shoppingList: fallbackShopping,
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
  logger.info('MEAL_PLAN_GENERATOR', 'Returning final meal plan from real API', unified);

  // If your actual "shoppingList" is separate, or if finalApiResp has a "shopping_list" array,
  // you'd unify that here too.

  return unified; // e.g. { mealPlan: { id, days, notes, nutritionalInfo }, shoppingList: ... }
}
