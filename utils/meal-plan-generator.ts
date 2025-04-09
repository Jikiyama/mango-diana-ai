import { logger } from '@/utils/logger';
import { QuestionnaireState } from '@/types/questionnaire';
import { MealPlan, ShoppingList } from '@/types/meal-plan';
import { createMealPlanJob, pollMealPlan } from '@/services/api'; // <--- your new robust "api.ts"

import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';

/**
 * Utility function that logs + builds a fallback plan if the real API call fails.
 */
function buildSampleFallback(questionnaireData: QuestionnaireState): {
  mealPlan: MealPlan;
  shoppingList: ShoppingList;
} {
  // Filter the sample plan to the number of days the user requested
  const requestedDays = questionnaireData.goalSettings.mealPlanDays || 5;
  const fallbackPlan: MealPlan = {
    ...sampleMealPlan,
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    meals: sampleMealPlan.meals.filter(meal => meal.day <= requestedDays),
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
 * The main function that your loading screen calls:
 *  1) Calls createMealPlanJob(...) [POST /mealplan]
 *  2) Polls pollMealPlan(...) [GET /mealplan-status?jobId=...]
 *  3) If any step fails, logs the true error reason, then falls back to sample data.
 */
export async function generateMealPlan(questionnaireData: QuestionnaireState) {
  logger.info('MEAL_PLAN_GENERATOR', 'Starting meal plan generation');
  logger.debug('MEAL_PLAN_GENERATOR', 'Using questionnaire data', questionnaireData);

  // Step 1: Attempt to create the job
  let jobResponse: any;
  try {
    logger.info('MEAL_PLAN_GENERATOR', 'Attempting to create job via POST /mealplan');
    jobResponse = await createMealPlanJob(questionnaireData);

    if (!jobResponse || !jobResponse.jobId) {
      throw new Error('createMealPlanJob returned no jobId!');
    }

    logger.info('MEAL_PLAN_GENERATOR', 'Job created successfully', jobResponse);
  } catch (createError) {
    logger.error(
      'MEAL_PLAN_GENERATOR',
      'API call to create job failed; we will fallback to sample data',
      createError
    );
    const fallback = buildSampleFallback(questionnaireData);
    return fallback;
  }

  // Step 2: Attempt to poll the job until it's completed
  let finalResult: any;
  try {
    logger.info('MEAL_PLAN_GENERATOR', 'Now polling jobId=' + jobResponse.jobId);
    finalResult = await pollMealPlan(jobResponse.jobId);

    logger.info('MEAL_PLAN_GENERATOR', 'Job polled successfully, final result', finalResult);
  } catch (pollError) {
    logger.error(
      'MEAL_PLAN_GENERATOR',
      'API call to poll job failed; we will fallback to sample data',
      pollError
    );
    const fallback = buildSampleFallback(questionnaireData);
    return fallback;
  }

  // If we get here, finalResult presumably has the shape { mealPlan: {...}, shoppingList: {...} }
  if (!finalResult) {
    logger.warn('MEAL_PLAN_GENERATOR', 'Result from poll was empty! Falling back just in case.');
    return buildSampleFallback(questionnaireData);
  }

  // Return final success result from API
  logger.info('MEAL_PLAN_GENERATOR', 'Returning final meal plan from real API', finalResult);
  return finalResult;
}
