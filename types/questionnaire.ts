export type MedicalCondition = 
  | 'hypertension'
  | 'dyslipidemia'
  | 'diabetes'
  | 'kidney_disease'
  | 'obesity'
  | 'none';

export type DietaryPreference = 
  | 'keto'
  | 'vegetarian'
  | 'vegan'
  | 'dash'
  | 'mediterranean'
  | 'paleo'
  | 'gluten_free'
  | 'dairy_free'
  | 'none';

export type Cuisine = 
  | 'latin'
  | 'mexican'
  | 'asian'
  | 'mediterranean'
  | 'italian'
  | 'american'
  | 'indian'
  | 'middle_eastern'
  | 'other';

export type StrictnessLevel = 'very_strict' | 'moderately_strict' | 'flexible';

export type HealthGoal = 'weight_loss' | 'muscle_building' | 'maintenance';

export interface PersonalInfo {
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  zipCode?: string;
  medicalConditions: MedicalCondition[];
  hba1c?: number;
  medications?: string[];
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
  mealPlanDays: number;
  mealsPerDay: number;
}

export interface QuestionnaireState {
  step: number;
  personalInfo: PersonalInfo;
  dietPreferences: DietPreferences;
  goalSettings: GoalSettings;
  isComplete: boolean;
}