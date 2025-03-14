import axios from 'axios';
import { Platform } from 'react-native';
import { QuestionnaireState } from '@/types/questionnaire';
import { MealPlanResponse } from '@/types/api-response';
import { logger } from '@/utils/logger';

// API endpoint - make sure this is correct
const API_BASE_URL = 'http://localhost:5000/api';

export async function generateMealPlanFromAPI(questionnaireData: QuestionnaireState): Promise<MealPlanResponse> {
  try {
    logger.info('API', 'Starting API request to generate meal plan');
    
    /**
     * === Removed the snippet that used to skip on web ===
     * // if (Platform.OS === 'web') {
     * //   logger.info('API', 'Skipping actual API call on web platform');
     * //   throw new Error('API calls are disabled on web platform');
     * // }
     */

    // Format the questionnaire data for the API
    const formData = formatQuestionnaireData(questionnaireData);
    
    logger.info('API', 'Sending API request with formatted data');
    logger.debug('API', 'Request payload', formData);
    
    // Full URL to call
    const url = `${API_BASE_URL}/mealplan`;
    logger.debug('API', `Making POST request to ${url}`);
    
    // Make the API call with extended timeout and detailed logging
    logger.debug('API', 'Starting axios request with 120s timeout');
    
    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 120000, // 2 minutes
      });
      
      logger.info('API', `API response received with status: ${response.status}`);
      logger.debug('API', 'Response headers', response.headers);
      
      if (response.data) {
        logger.info('API', 'API response data received successfully');
        logger.debug('API', 'API response data structure', {
          keys: Object.keys(response.data),
          hasMealPlan: !!response.data.meal_plan,
          hasRecipes: !!response.data.recipes,
          hasShoppingList: !!response.data.shopping_list,
        });
        
        // Return the response data
        return response.data;
      } else {
        logger.error('API', 'API response data is empty');
        throw new Error('Empty response from API');
      }
    } catch (axiosError) {
      logger.error('API', 'Axios request failed', axiosError);
      
      if (axios.isAxiosError(axiosError)) {
        logger.error('API', 'Axios error details', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          message: axiosError.message,
          code: axiosError.code,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            timeout: axiosError.config?.timeout,
            headers: axiosError.config?.headers,
          }
        });
        
        // Provide more specific error messages
        if (axiosError.response) {
          if (axiosError.response.status === 404) {
            throw new Error('API endpoint not found. Please check the API URL.');
          } else if (axiosError.response.status === 400) {
            throw new Error('Bad request: The API rejected the data format. Check your inputs.');
          } else if (axiosError.response.status === 500) {
            throw new Error('Server error: The API server encountered an error. Please try later.');
          } else if (axiosError.response.status === 401 || axiosError.response.status === 403) {
            throw new Error('Authentication error: Not authorized to access this API.');
          }
        } else if (axiosError.code === 'ECONNABORTED') {
          throw new Error('API request timed out. The server took too long to respond.');
        } else if (axiosError.code === 'ERR_NETWORK') {
          throw new Error('Network error: Could not connect to the API. Check your internet.');
        }
        
        // Otherwise, rethrow a general error
        throw new Error(`API request failed: ${axiosError.message}`);
      }
      
      // If it's not an AxiosError, re-throw
      throw axiosError;
    }
  } catch (error) {
    logger.error('API', 'Error generating meal plan from API', error);
    
    // Throw a more descriptive error
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred while calling the API');
    }
  }
}

// Helper function to format data for the API
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
      medications: personalInfo.medications || []
    },
    diet_preferences: {
      cuisines: dietPreferences.cuisines || [],
      other_cuisine: dietPreferences.otherCuisine || '',
      allergies: dietPreferences.allergies || [],
      dietary_preferences: dietPreferences.dietaryPreferences || [],
      batch_cooking: dietPreferences.batchCooking || false,
      strictness_level: dietPreferences.strictnessLevel || 'moderate'
    },
    goal_settings: {
      health_goal: goalSettings.healthGoal || 'weight_loss',
      calorie_reduction: goalSettings.calorieReduction || 'moderate',
      meal_plan_days: goalSettings.mealPlanDays || 7,
      meals_per_day: goalSettings.mealsPerDay || 3
    }
  };
  
  logger.info('API', 'Formatted data for API request');
  
  return formattedData;
}
