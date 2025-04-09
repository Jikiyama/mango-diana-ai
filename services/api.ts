// services/api.ts
import axios, { AxiosError } from 'axios';
import { logger } from '@/utils/logger';
import { QuestionnaireState } from '@/types/questionnaire';

/**
 * The base URL for your API. Confirm if you need '/dev' or '/prod'
 * appended here.
 */
const API_BASE_URL = 'https://mfeg93gr00.execute-api.us-east-1.amazonaws.com';

/**
 * Utility: Stringify an AxiosError, including request/response details.
 */
function formatAxiosError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return String(error);
  }
  const axiosErr = error as AxiosError;
  const status = axiosErr.response?.status || 'N/A';
  const data   = axiosErr.response?.data   || 'N/A';
  return `AxiosError: ${axiosErr.message}, status=${status}, data=${JSON.stringify(data)}`;
}

/**
 * Format the questionnaire data into whatever shape your backend expects.
 */
function formatQuestionnaireData(data: QuestionnaireState) {
  return {
    personal_info: {
      age: data.personalInfo.age,
      weight: data.personalInfo.weight,
      height: data.personalInfo.height,
      gender: data.personalInfo.gender,
      zip_code: data.personalInfo.zipCode || '',
      medical_conditions: data.personalInfo.medicalConditions || [],
      hba1c: data.personalInfo.hba1c || null,
      medications: data.personalInfo.medications || [],
    },
    diet_preferences: {
      cuisines: data.dietPreferences.cuisines || [],
      other_cuisine: data.dietPreferences.otherCuisine || '',
      allergies: data.dietPreferences.allergies || [],
      dietary_preferences: data.dietPreferences.dietaryPreferences || [],
      batch_cooking: data.dietPreferences.batchCooking || false,
      strictness_level: data.dietPreferences.strictnessLevel || 'moderate',
    },
    goal_settings: {
      health_goal: data.goalSettings.healthGoal || 'maintenance',
      calorie_reduction: data.goalSettings.calorieReduction || 'moderate',
      meal_plan_days: data.goalSettings.mealPlanDays || 5,
      meals_per_day: data.goalSettings.mealsPerDay || 3,
    },
  };
}

/**
 * Step 1) Create an asynchronous meal plan job via POST to /mealplan
 */
export async function createMealPlanJob(questionnaireData: QuestionnaireState) {
  logger.info('API', 'STEP 1: Creating meal plan job...');
  
  const payload = formatQuestionnaireData(questionnaireData);
  const url = `${API_BASE_URL}/mealplan`;
  logger.debug('API', 'POST URL', url);
  logger.debug('API', 'POST Payload', payload);

  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    logger.info('API', 'STEP 1 SUCCESS: Job creation response', response.data);
    return response.data; // Expecting { jobId: "...", status: "queued" }
  } catch (error) {
    // This catch is only for the createMealPlanJob POST
    const errMsg = formatAxiosError(error);
    logger.error('API', 'STEP 1 FAIL: POST /mealplan failed', errMsg);
    throw new Error(`CreateMealPlanJob failed: ${errMsg}`);
  }
}

/**
 * Step 2a) Single GET to check job status by /mealplan-status?jobId=xxx
 */
async function getMealPlanStatus(jobId: string) {
  const url = `${API_BASE_URL}/mealplan-status`;
  logger.debug('API', 'GET URL', url);
  logger.debug('API', 'GET Query jobId', jobId);

  try {
    const response = await axios.get(url, { params: { jobId } });
    logger.debug('API', 'Single status response', response.data);
    return response.data;
  } catch (error) {
    const errMsg = formatAxiosError(error);
    logger.error('API', `GET /mealplan-status failed for jobId=${jobId}`, errMsg);
    throw new Error(`GetMealPlanStatus failed: ${errMsg}`);
  }
}

/**
 * Step 2b) Poll for completion up to maxAttempts, every intervalMs
 */
export async function pollMealPlan(
  jobId: string,
  intervalMs = 5000,
  maxAttempts = 20
): Promise<any> {
  logger.info('API', `STEP 2: Polling for jobId=${jobId}`);
  
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const timer = setInterval(async () => {
      attempts++;
      logger.debug('API', `Polling attempt #${attempts} for jobId=${jobId}`);

      try {
        const data = await getMealPlanStatus(jobId);
        if (data.status === 'COMPLETED') {
          logger.info('API', `STEP 2 SUCCESS: jobId=${jobId} COMPLETED`);
          clearInterval(timer);
          resolve(data.result); // or entire data object
        } else if (data.status === 'ERROR') {
          logger.error('API', `STEP 2 FAIL: jobId=${jobId} reported ERROR`, data.errorMessage);
          clearInterval(timer);
          reject(new Error(data.errorMessage || 'Meal plan generation failed.'));
        } else if (attempts >= maxAttempts) {
          logger.error('API', `STEP 2 TIMEOUT: jobId=${jobId} still not complete after ${maxAttempts} attempts`);
          clearInterval(timer);
          reject(new Error('Timed out waiting for meal plan.'));
        } else {
          // PROCESSING or unknown intermediate status
          logger.debug('API', `jobId=${jobId} still processing. status=${data.status}`);
        }
      } catch (pollError) {
        logger.error('API', `STEP 2 EXCEPTION on attempt #${attempts} for jobId=${jobId}`, String(pollError));
        clearInterval(timer);
        reject(pollError);
      }
    }, intervalMs);
  });
}

/**
 * Step 3) "Controller" function that calls (1) createMealPlanJob, then (2) pollMealPlan.
 * Distinguishes whether the error came from creation vs polling.
 */
export async function generateMealPlan(questionnaireData: QuestionnaireState) {
  logger.info('API', '=== generateMealPlan() START ===');
  
  // 1) Create job
  let jobResponse;
  try {
    jobResponse = await createMealPlanJob(questionnaireData);
    logger.debug('API', 'STEP 1 returned jobResponse', jobResponse);
  } catch (createError) {
    logger.error('API', 'generateMealPlan FAIL during createMealPlanJob', String(createError));
    throw new Error(`Meal plan creation failed: ${createError}`);
  }

  // 2) Poll for completion (only if step 1 succeeded)
  if (!jobResponse || !jobResponse.jobId) {
    const e = new Error('No jobId returned from createMealPlanJob');
    logger.error('API', 'generateMealPlan FAIL: jobId is missing in jobResponse', e);
    throw e;
  }

  logger.info('API', '=== Starting pollMealPlan for jobId=' + jobResponse.jobId + ' ===');
  try {
    const finalResult = await pollMealPlan(jobResponse.jobId);
    logger.info('API', 'STEP 2 COMPLETE: Polling final result', finalResult);
    return finalResult;
  } catch (pollError) {
    logger.error('API', 'generateMealPlan FAIL during pollMealPlan', String(pollError));
    throw new Error(`Meal plan polling failed: ${pollError}`);
  }
}
