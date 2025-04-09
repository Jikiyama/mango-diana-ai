//
// mealPlanService.ts (All-in-One Example)
//

import axios, { AxiosError } from 'axios';
import { logger } from '@/utils/logger'; // adjust your import path
import { QuestionnaireState } from '@/types/questionnaire';
import { MealPlan, ShoppingList } from '@/types/meal-plan';

// If you have them in a "mocks" directory:
import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';

/**
 * The base URL for your API. If you need "/dev" or "/prod"
 * in the path, include it here.
 */
const API_BASE_URL = 'https://mfeg93gr00.execute-api.us-east-1.amazonaws.com';

/**
 * A small helper: produce a more detailed error message from Axios errors
 */
function formatAxiosError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return String(error);
  }
  const axiosErr = error as AxiosError;
  const status = axiosErr.response?.status ?? 'N/A';
  const data   = axiosErr.response?.data   ?? 'N/A';
  return `AxiosError: ${axiosErr.message}, status=${status}, data=${JSON.stringify(data)}`;
}

/**
 * formatQuestionnaireData:
 * Convert your local `QuestionnaireState` into the JSON body
 * that your backend expects for POST /mealplan.
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
 * STEP 1: Create a meal plan job by POSTing to /mealplan
 * Returns something like: { jobId: "...", status: "queued" }
 */
async function createMealPlanJob(questionnaire: QuestionnaireState) {
  logger.info('API', 'Creating meal plan job (POST /mealplan)...');
  const payload = formatQuestionnaireData(questionnaire);
  const url = `${API_BASE_URL}/mealplan`;

  logger.debug('API', 'POST URL', url);
  logger.debug('API', 'POST Payload', payload);

  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    logger.info('API', 'Job created successfully', response.data);
    return response.data; // e.g. { jobId: "abc123", status: "queued" }
  } catch (error) {
    const errMsg = formatAxiosError(error);
    logger.error('API', 'Failed to create job', errMsg);
    throw new Error(`CreateMealPlanJob failed: ${errMsg}`);
  }
}

/**
 * STEP 2A: Helper to do one GET request to /mealplan-status?jobId=xxx
 */
async function getMealPlanStatus(jobId: string) {
  const url = `${API_BASE_URL}/mealplan-status`;
  logger.debug('API', 'GET /mealplan-status', { jobId });

  try {
    const response = await axios.get(url, { params: { jobId } });
    logger.debug('API', 'Status response', response.data);
    return response.data;
  } catch (error) {
    const errMsg = formatAxiosError(error);
    logger.error('API', `Failed to GET /mealplan-status for jobId=${jobId}`, errMsg);
    throw new Error(`GetMealPlanStatus failed: ${errMsg}`);
  }
}

/**
 * STEP 2B: Poll the job until "COMPLETED" or "ERROR"
 */
async function pollMealPlan(jobId: string, intervalMs = 5000, maxAttempts = 20): Promise<any> {
  logger.info('API', `Polling meal plan jobId=${jobId}...`);

  return new Promise((resolve, reject) => {
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      logger.debug('API', `Polling attempt #${attempts}, jobId=${jobId}`);

      try {
        const data = await getMealPlanStatus(jobId);

        if (data.status === 'COMPLETED') {
          logger.info('API', `Poll success: jobId=${jobId} is COMPLETED`);
          clearInterval(timer);
          resolve(data.result);
        } else if (data.status === 'ERROR') {
          logger.error('API', `Poll fail: jobId=${jobId} reported ERROR`, data.errorMessage);
          clearInterval(timer);
          reject(new Error(data.errorMessage || 'Meal plan generation failed.'));
        } else if (attempts >= maxAttempts) {
          logger.error('API', `Poll timeout: jobId=${jobId} still not complete after ${maxAttempts} attempts`);
          clearInterval(timer);
          reject(new Error('Timed out waiting for meal plan.'));
        } else {
          // Probably "PROCESSING" — keep going
          logger.debug('API', `jobId=${jobId} still processing (status=${data.status})`);
        }
      } catch (pollError) {
        logger.error('API', `Polling error on attempt #${attempts}, jobId=${jobId}`, String(pollError));
        clearInterval(timer);
        reject(pollError);
      }
    }, intervalMs);
  });
}

/**
 * If the real API fails, or the polling fails,
 * we build a fallback meal plan from local sample data.
 */
function buildSampleFallback(questionnaire: QuestionnaireState): {
  mealPlan: MealPlan;
  shoppingList: ShoppingList;
} {
  const requestedDays = questionnaire.goalSettings.mealPlanDays || 5;

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

  return { mealPlan: fallbackPlan, shoppingList: fallbackShopping };
}

/**
 * MAIN ENTRY POINT:
 *  - POST /mealplan to create the job
 *  - Poll /mealplan-status for completion
 *  - If anything fails, fallback to sample data
 */
export async function generateMealPlan(questionnaireData: QuestionnaireState) {
  logger.info('MEAL_PLAN_GENERATOR', 'Starting meal plan generation');

  // Step 1: create job
  let jobResponse;
  try {
    jobResponse = await createMealPlanJob(questionnaireData);
    if (!jobResponse || !jobResponse.jobId) {
      throw new Error('No jobId found in createMealPlanJob response.');
    }
  } catch (createErr) {
    logger.error('MEAL_PLAN_GENERATOR', 'API call failed (create job)', createErr);
    logger.warn('MEAL_PLAN_GENERATOR', 'Falling back to sample data due to create error');
    return buildSampleFallback(questionnaireData);
  }

  // Step 2: poll
  try {
    logger.info('MEAL_PLAN_GENERATOR', 'Now polling jobId=' + jobResponse.jobId);
    const finalResult = await pollMealPlan(jobResponse.jobId);
    logger.info('MEAL_PLAN_GENERATOR', 'Poll completed successfully', finalResult);

    // finalResult is presumably { mealPlan: {...}, shoppingList: {...} }
    if (!finalResult) {
      logger.warn('MEAL_PLAN_GENERATOR', 'Poll returned nothing, fallback');
      return buildSampleFallback(questionnaireData);
    }

    // Return the final from the real API
    return finalResult;
  } catch (pollErr) {
    logger.error('MEAL_PLAN_GENERATOR', 'API call failed (poll)', pollErr);
    logger.warn('MEAL_PLAN_GENERATOR', 'Falling back to sample data due to poll error');
    return buildSampleFallback(questionnaireData);
  }
}
