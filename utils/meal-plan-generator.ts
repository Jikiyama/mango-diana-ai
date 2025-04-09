// utils/meal-plan-generator.ts
import { logger } from '@/utils/logger';
import { QuestionnaireState } from '@/types/questionnaire';
import { MealPlan } from '@/types/meal-plan';

import { createMealPlanJob, pollMealPlan } from '@/services/api';
import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';

function convertApiResponseToAppModel(apiResp: any, jobId: string) {
  // ... (assume your existing transformation logic) ...
  // This function is where you parse "Data: { meal_plan, nutritional_info }"
  // to your local shape
  return {
    // ...
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
