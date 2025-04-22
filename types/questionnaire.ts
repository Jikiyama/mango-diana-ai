// types/questionnaire.ts
/* NEW: activity‑level enum */
export type ActivityLevel =
  | 'sedentary'          // desk job / little exercise
  | 'lightly_active'     // 1–3 exercise sessions / week
  | 'moderately_active'  // 3–5 sessions / week
  | 'very_active'        // 6–7 sessions / week, physically demanding job
  | 'athlete';           // 2‑a‑day training / competitive sport

export type HealthGoal = 'weight_loss' | 'muscle_building' | 'maintenance';
export type StrictnessLevel = 'very_strict' | 'moderately_strict' | 'flexible';
export type MedicalCondition =
  | 'hypertension'
  | 'dyslipidemia'
  | 'diabetes'
  | 'kidney_disease'
  | 'obesity'
  | 'none';

/* … existing Cuisine, DietaryPreference etc. declarations … */

export interface PersonalInfo {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  zipCode?: string;
  medicalConditions: MedicalCondition[];
  hba1c?: number;
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'in';
}

export interface DietPreferences {
  cuisines: Cuisine[];
  otherCuisine?: string;
  allergies: string[];
  dietaryPreferences: DietaryPreference[];
  batchCooking: boolean;
  strictnessLevel: StrictnessLevel;
}

export interface GoalSettings {
  healthGoal: HealthGoal;
  calorieReduction?: 'light' | 'moderate' | 'aggressive';
  mealPlanDays: 3 | 5 | 7;
  mealsPerDay: 3 | 4 | 5;
  /* NEW */
  activityLevel: ActivityLevel;
}
	