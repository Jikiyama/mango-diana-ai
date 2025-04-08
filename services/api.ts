// services/api.ts
 
import axios from 'axios';
import { logger } from '@/utils/logger';
import { QuestionnaireState } from '@/types/questionnaire';
 
// The base URL for your AWS API (Producer Lambda + status endpoint)
const API_BASE_URL = 'https://mfeg93gr00.execute-api.us-east-1.amazonaws.com';
 
/**
 * Helper (optional) to format questionnaire data 
 * before sending to the /mealplan endpoint.
 */
function formatQuestionnaireData(data: QuestionnaireState) {
  const { personalInfo, dietPreferences, goalSettings } = data;
 
  logger.debug('API', 'Formatting questionnaire data for API', data);
 
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
 
  logger.info('API', 'Formatted data for API request');
  return formattedData;
}
 
/**
 * (1) Create an asynchronous meal plan job by posting 
 * your questionnaire data to /mealplan. 
 * The server enqueues it in SQS and returns { jobId, status: "queued" } quickly.
 */
export async function createMealPlanJob(questionnaireData: QuestionnaireState) {
  logger.info('API', 'Creating meal plan job (async approach)');
 
  // Optional step to transform data for the backend:
  const payload = formatQuestionnaireData(questionnaireData);
 
  const url = `${API_BASE_URL}/mealplan`; // Your Producer Lambda endpoint
  logger.debug('API', `POST to ${url} with`, payload);
 
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
 
    logger.info('API', 'Job creation response', response.data);
    return response.data; // { jobId: "...", status: "queued" }
  } catch (error) {
    logger.error('API', 'Failed to create meal plan job', error);
    throw error;
  }
}
 
/**
 * (2) Check the status of a job by GET /mealplan-status?jobId=xxx
 * The server (Producer Lambda or a new route) 
 * looks in DynamoDB for job status: PROCESSING | COMPLETED | ERROR
 */
async function getMealPlanStatus(jobId: string) {
  logger.info('API', `Checking meal plan status for jobId=${jobId}`);
 
  const url = `${API_BASE_URL}/mealplan-status`; // Your "status" endpoint
  logger.debug('API', `GET ${url}`, { jobId });
 
  try {
    const response = await axios.get(url, {
      params: { jobId },
    });
    logger.debug('API', 'Status response', response.data);
    return response.data;
  } catch (error) {
    logger.error('API', 'Failed to get meal plan status', error);
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
  logger.info('API', `Polling meal plan jobId=${jobId}`);
 
  return new Promise((resolve, reject) => {
    let attempts = 0;
 
    const timer = setInterval(async () => {
      attempts++;
      try {
        const data = await getMealPlanStatus(jobId);
 
        if (data.status === 'COMPLETED') {
          clearInterval(timer);
          logger.info('API', `Meal plan job ${jobId} completed`);
          resolve(data.result);
        } else if (data.status === 'ERROR') {
          clearInterval(timer);
          logger.warn('API', `Meal plan job ${jobId} errored`, data.errorMessage);
          reject(new Error(data.errorMessage || 'Meal plan generation failed.'));
        } else if (attempts >= maxAttempts) {
          clearInterval(timer);
          logger.error('API', `Timed out waiting for meal plan jobId=${jobId}`);
          reject(new Error('Timed out waiting for meal plan.'));
        } else {
          logger.debug('API', `Still processing jobId=${jobId}... attempt=${attempts}`);
        }
      } catch (err) {
        clearInterval(timer);
        reject(err);
      }
    }, intervalMs);
  });
}
 