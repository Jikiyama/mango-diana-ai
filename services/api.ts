// services/api.ts

import axios from 'axios';
import { logger } from '@/utils/logger';
import { QuestionnaireState } from '@/types/questionnaire';

const API_BASE_URL = 'https://mfeg93gr00.execute-api.us-east-1.amazonaws.com';

/**
 * Optional helper to format questionnaire data before sending to /mealplan.
 */
function formatQuestionnaireData(data: QuestionnaireState) {
  logger.debug('API', 'Entering formatQuestionnaireData with', data);

  const { personalInfo, dietPreferences, goalSettings } = data;

  const formattedData = {
    personal_info: {
      age: personalInfo.age,
      weight: personalInfo.weight,
      height: personalInfo.height,
      gender: personalInfo.gender,
      zip_code: personalInfo.zipCode || '10001',
      medical_conditions: personalInfo.medicalConditions || [],
      hba1c: personalInfo.hba1c || null,
      medications: personalInfo.medications || [],
    },
    diet_preferences: {
      cuisines: dietPreferences.cuisines || [],
      other_cuisine: dietPreferences.otherCuisine || '',
      allergies: dietPreferences.allergies || [],
      dietary_preferences: dietPreferences.dietaryPreferences || [],
      batch_cooking: dietPreferences.batchCooking || false,
      strictness_level: dietPreferences.strictnessLevel || 'moderate',
    },
    goal_settings: {
      health_goal: goalSettings.healthGoal || 'weight_loss',
      calorie_reduction: goalSettings.calorieReduction || 'moderate',
      meal_plan_days: goalSettings.mealPlanDays || 7,
      meals_per_day: goalSettings.mealsPerDay || 3,
    },
  };

  logger.debug('API', 'Exiting formatQuestionnaireData with', formattedData);
  return formattedData;
}

/**
 * (1) Create an asynchronous meal plan job by posting your
 * questionnaire data to /mealplan.
 */
export async function createMealPlanJob(questionnaireData: QuestionnaireState) {
  logger.info('API', 'Creating meal plan job (async approach)');

  // Double-check the incoming data
  logger.debug('API', 'Questionnaire data received', questionnaireData);

  // Optional step to transform data for the backend
  const payload = formatQuestionnaireData(questionnaireData);

  const url = `${API_BASE_URL}/mealplan`; // Producer Lambda endpoint
  logger.debug('API', `POST to ${url} with payload`, payload);

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('API', 'Job creation response', response.data);
    return response.data; // e.g. { jobId: "...", status: "queued" }
  } catch (error: any) {
    // Additional logging for troubleshooting
    logger.error('API', 'Failed to create meal plan job', error?.message || error);
    if (error?.response) {
      logger.error('API', 'Response status', error.response.status);
      logger.error('API', 'Response data', error.response.data);
    }
    throw error;
  }
}

/**
 * (2) Check the status of a job by GET /mealplan-status?jobId=xxx
 */
async function getMealPlanStatus(jobId: string) {
  logger.info('API', `Checking meal plan status for jobId=${jobId}`);

  const url = `${API_BASE_URL}/mealplan-status`;
  logger.debug('API', `GET ${url} with query param jobId=${jobId}`);

  try {
    const response = await axios.get(url, {
      params: { jobId },
    });
    logger.debug('API', 'Status response', response.data);
    return response.data;
  } catch (error: any) {
    logger.error('API', 'Failed to get meal plan status', error?.message || error);
    if (error?.response) {
      logger.error('API', 'Response status', error.response.status);
      logger.error('API', 'Response data', error.response.data);
    }
    throw error;
  }
}

/**
 * (3) Poll for completion.
 * Repeatedly calls getMealPlanStatus(jobId) every intervalMs 
 * until "status" is COMPLETED or ERROR, or until maxAttempts is reached.
 */
export function pollMealPlan(
  jobId: string,
  intervalMs = 5000,
  maxAttempts = 20
): Promise<any> {
  logger.info('API', `Polling meal plan jobId=${jobId} every ${intervalMs}ms, maxAttempts=${maxAttempts}`);

  return new Promise((resolve, reject) => {
    let attempts = 0;

    const timer = setInterval(async () => {
      attempts++;
      try {
        logger.debug('API', `Polling attempt #${attempts} for jobId=${jobId}`);
        const data = await getMealPlanStatus(jobId);

        if (data.status === 'COMPLETED') {
          logger.info('API', `Meal plan job ${jobId} completed successfully`);
          clearInterval(timer);
          resolve(data.result);
        } else if (data.status === 'ERROR') {
          logger.warn('API', `Meal plan job ${jobId} errored`, data.errorMessage);
          clearInterval(timer);
          reject(new Error(data.errorMessage || 'Meal plan generation failed.'));
        } else if (attempts >= maxAttempts) {
          logger.error('API', `Timed out waiting for meal plan jobId=${jobId}`);
          clearInterval(timer);
          reject(new Error('Timed out waiting for meal plan.'));
        } else {
          logger.debug('API', `Still processing jobId=${jobId}... (status=${data.status})`);
        }
      } catch (err) {
        logger.error('API', `Error during polling jobId=${jobId}`, err);
        clearInterval(timer);
        reject(err);
      }
    }, intervalMs);
  });
}

/**
 * (4) Example "controller" function that 
 *  - Creates the job
 *  - Polls for completion
 *  - Catches any errors or falls back to sample data if needed
 */
export async function generateMealPlan(questionnaireData: QuestionnaireState) {
  logger.info('MEAL_PLAN_GENERATOR', 'Attempting to call the API for all platforms');
  logger.debug('MEAL_PLAN_GENERATOR', 'Before API call, data:', questionnaireData);

  try {
    // Step 1: Create the job
    const jobResponse = await createMealPlanJob(questionnaireData);
    logger.debug('MEAL_PLAN_GENERATOR', 'Created job, response:', jobResponse);

    // Step 2: Poll until completion
    logger.debug('MEAL_PLAN_GENERATOR', 'Starting to poll for meal plan');
    const mealPlanData = await pollMealPlan(jobResponse.jobId);
    logger.debug('MEAL_PLAN_GENERATOR', 'Meal plan data returned from the API:', mealPlanData);

    // Return the successful meal plan data
    return mealPlanData;

  } catch (error: any) {
    // If there's an error, log it and optionally return a fallback
    logger.error(
      'MEAL_PLAN_GENERATOR',
      'API call failed, falling back to sample data\nData: {}',
      error?.message || error
    );

    // If you have fallback data or want to re-throw, handle that here:
    // e.g., return { error: 'Failed to generate meal plan', fallback: true };
    // or just rethrow:
    // throw error;

    // Example fallback:
    return {
      error: true,
      message: 'Meal plan API call failed. Falling back to sample data.',
      sampleData: {
        /* your fallback data here */
      },
    };
  }
}
