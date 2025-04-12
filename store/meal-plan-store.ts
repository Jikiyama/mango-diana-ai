// store/meal-plan-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealPlanState } from '@/types/meal-plan';

interface MealPlanStore extends MealPlanState {
  setCurrentPlan: (plan: any) => void; // the new shape
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearCurrentPlan: () => void;
  toggleFavoriteMeal: (mealId: string) => void;
  // plus any toggles for favorites, etc...
}

const initialState: MealPlanState = {
  currentPlan: null,
  isLoading: false,
  error: null,
  favoriteMeals: [],
  shoppingList: null,
};

export const useMealPlanStore = create<MealPlanStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentPlan: (plan: any) => {
        // 'plan' might be something like: { mealPlan: {...}, shoppingList: {...} }
        set({
          currentPlan: plan.mealPlan || null,
          shoppingList: plan.shoppingList || null,
        });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      clearCurrentPlan: () => set({ currentPlan: null, shoppingList: null }),
      
      toggleFavoriteMeal: (mealId: string) => {
        const { currentPlan } = get();
        
        if (!currentPlan) return;
        
        const updatedMeals = currentPlan.meals.map(meal => {
          if (meal.id === mealId) {
            return { ...meal, isFavorite: !meal.isFavorite };
          }
          return meal;
        });
        
        set({
          currentPlan: {
            ...currentPlan,
            meals: updatedMeals,
          }
        });
      },
    }),
    {
      name: 'mango-meal-plan-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favoriteMeals: state.favoriteMeals,
        // Don't persist loading states or currentPlan if you don't want to
      }),
    }
  )
);
