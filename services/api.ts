// services/api.ts

import axios, { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

/**
 * The base URL for your API. Add "/dev" or "/prod" if needed.
 */
const API_BASE_URL = 'https://mfeg93gr00.execute-api.us-east-1.amazonaws.com';

/**
 * A helper to produce a more detailed error message from Axios errors.
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
 * POST /mealplan → expects { jobId, status }
 */
export async function createMealPlanJob(payload: any) {
  logger.info('API', 'Creating meal plan job (POST /mealplan)...');
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
 * GET /mealplan-status?jobId=... → returns { status, result? }
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
 * Poll until "COMPLETED" or "ERROR" or max attempts
 */
export async function pollMealPlan(jobId: string, intervalMs = 5000, maxAttempts = 20): Promise<any> {
  logger.info('API', `Polling meal plan jobId=${jobId}...`);

  return new Promise((resolve, reject) => {
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      logger.debug('API', `Polling attempt #${attempts}, jobId=${jobId}`);

      try {
        const data = await getMealPlanStatus(jobId);

        if (data.status === 'COMPLETED') {
          logger.info('API', `STEP 2 SUCCESS: jobId=${jobId} COMPLETED`);
          clearInterval(timer);
          resolve(data.result);
        } else if (data.status === 'ERROR') {
          logger.error('API', `Poll fail: jobId=${jobId} reported ERROR`, data.errorMessage);
          clearInterval(timer);
          reject(new Error(data.errorMessage || 'Meal plan generation failed.'));
        } else if (attempts >= maxAttempts) {
          logger.error('API', `Poll timeout: jobId=${jobId} not complete after ${maxAttempts} attempts`);
          clearInterval(timer);
          reject(new Error('Timed out waiting for meal plan.'));
        } else {
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
