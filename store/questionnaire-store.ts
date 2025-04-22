// store/questionnaire-store.ts
import { create } from 'zustand';
import {
  PersonalInfo,
  DietPreferences,
  GoalSettings,
  ActivityLevel,
} from '@/types/questionnaire';

interface QuestionnaireState {
  personalInfo: Partial<PersonalInfo>;
  dietPreferences: Partial<DietPreferences>;
  goalSettings: Partial<GoalSettings>;
  step: 1 | 2 | 3;
  isComplete: boolean;
  /* actions */
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateDietPreferences: (data: Partial<DietPreferences>) => void;
  updateGoalSettings: (data: Partial<GoalSettings>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetQuestionnaire: () => void;
  completeQuestionnaire: () => void;
}

export const useQuestionnaireStore = create<QuestionnaireState>()((set) => ({
  /* ---------- state ---------- */
  personalInfo: {},
  dietPreferences: {},
  goalSettings: {
    /* sensible defaults so “required” fields are never undefined
       until user edits them */
    healthGoal: 'maintenance',
    activityLevel: 'sedentary',
    mealPlanDays: 5,
    mealsPerDay: 3,
  },
  step: 1,
  isComplete: false,

  /* ---------- actions ---------- */
  updatePersonalInfo: (data) =>
    set((s) => ({ personalInfo: { ...s.personalInfo, ...data } })),
  updateDietPreferences: (data) =>
    set((s) => ({ dietPreferences: { ...s.dietPreferences, ...data } })),
  updateGoalSettings: (data) =>
    set((s) => ({ goalSettings: { ...s.goalSettings, ...data } })),

  nextStep: () => set((s) => ({ step: (s.step + 1) as 1 | 2 | 3 })),
  prevStep: () => set((s) => ({ step: (s.step - 1) as 1 | 2 | 3 })),
  resetQuestionnaire: () =>
    set({
      personalInfo: {},
      dietPreferences: {},
      goalSettings: {
        healthGoal: 'maintenance',
        activityLevel: 'sedentary',
        mealPlanDays: 5,
        mealsPerDay: 3,
      },
      step: 1,
      isComplete: false,
    }),
  completeQuestionnaire: () => set({ isComplete: true }),
}));
