import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  QuestionnaireState, 
  PersonalInfo, 
  DietPreferences, 
  GoalSettings 
} from '@/types/questionnaire';
import { logger } from '@/utils/logger';

interface QuestionnaireStore extends QuestionnaireState {
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateDietPreferences: (prefs: Partial<DietPreferences>) => void;
  updateGoalSettings: (settings: Partial<GoalSettings>) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeQuestionnaire: () => void;
  resetQuestionnaire: () => void;
}

// <-- CHANGED: We added weightUnit and heightUnit to PersonalInfo
const initialState: QuestionnaireState = {
  currentStep: 1,
  isComplete: false,
  personalInfo: {
    age: 30,
    gender: 'male',
    weight: 70,
    height: 175,
    zipCode: '',
    medicalConditions: [],
    medications: [],
    hba1c: null,
    // <-- ADDED
    weightUnit: 'kg',
    heightUnit: 'cm',
  },
  dietPreferences: {
    cuisines: [],
    otherCuisine: '',
    allergies: [],
    dietaryPreferences: [],
    batchCooking: false,
    strictnessLevel: 'moderate',
  },
  goalSettings: {
    healthGoal: 'maintenance',
    calorieReduction: 'moderate',
    mealPlanDays: 5,
    mealsPerDay: 3,
  },
};

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set) => ({
      ...initialState,
      updatePersonalInfo: (info) => {
        logger.debug('QUESTIONNAIRE_STORE', 'Updating personal info', info);
        set((state) => ({
          personalInfo: { ...state.personalInfo, ...info },
        }));
      },
      updateDietPreferences: (prefs) => {
        logger.debug('QUESTIONNAIRE_STORE', 'Updating diet preferences', prefs);
        set((state) => ({
          dietPreferences: { ...state.dietPreferences, ...prefs },
        }));
      },
      updateGoalSettings: (settings) => {
        logger.debug('QUESTIONNAIRE_STORE', 'Updating goal settings', settings);
        set((state) => ({
          goalSettings: { ...state.goalSettings, ...settings },
        }));
      },
      nextStep: () => {
        logger.debug('QUESTIONNAIRE_STORE', 'Moving to next step');
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 3),
        }));
      },
      prevStep: () => {
        logger.debug('QUESTIONNAIRE_STORE', 'Moving to previous step');
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        }));
      },
      completeQuestionnaire: () => {
        logger.info('QUESTIONNAIRE_STORE', 'Marking questionnaire as complete');
        set({ isComplete: true });
      },
      resetQuestionnaire: () => {
        logger.info('QUESTIONNAIRE_STORE', 'Resetting questionnaire');
        set({
          ...initialState,
          isComplete: false,
          currentStep: 1,
        });
      },
    }),
    {
      name: 'mango-questionnaire-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
