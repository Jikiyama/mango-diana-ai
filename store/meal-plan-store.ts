import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealPlanState, Meal, MealPlan, ShoppingList } from '@/types/meal-plan';

interface MealPlanStore extends MealPlanState {
  setCurrentPlan: (plan: MealPlan) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  toggleFavoriteMeal: (mealId: string) => void;
  addToFavorites: (meal: Meal) => void;
  removeFromFavorites: (mealId: string) => void;
  setShoppingList: (list: ShoppingList) => void;
  toggleShoppingItem: (itemName: string) => void;
  clearCurrentPlan: () => void;
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
      setCurrentPlan: (plan: MealPlan) => set({ currentPlan: plan }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      toggleFavoriteMeal: (mealId: string) => {
        const { currentPlan, favoriteMeals } = get();
        
        if (!currentPlan) return;
        
        // Update the current plan
        const updatedMeals = currentPlan.meals.map(meal => {
          if (meal.id === mealId) {
            return { ...meal, isFavorite: !meal.isFavorite };
          }
          return meal;
        });
        
        // Update favorites list
        const mealToToggle = currentPlan.meals.find(m => m.id === mealId);
        if (!mealToToggle) return;
        
        let updatedFavorites = [...favoriteMeals];
        if (mealToToggle.isFavorite) {
          // Remove from favorites
          updatedFavorites = favoriteMeals.filter(m => m.id !== mealId);
        } else {
          // Add to favorites
          updatedFavorites.push({ ...mealToToggle, isFavorite: true });
        }
        
        set({ 
          currentPlan: { ...currentPlan, meals: updatedMeals },
          favoriteMeals: updatedFavorites
        });
      },
      addToFavorites: (meal: Meal) => {
        const { favoriteMeals } = get();
        if (!favoriteMeals.some(m => m.id === meal.id)) {
          set({ favoriteMeals: [...favoriteMeals, { ...meal, isFavorite: true }] });
        }
      },
      removeFromFavorites: (mealId: string) => {
        set({ 
          favoriteMeals: get().favoriteMeals.filter(m => m.id !== mealId) 
        });
      },
      setShoppingList: (list: ShoppingList) => set({ shoppingList: list }),
      toggleShoppingItem: (itemName: string) => {
        const { shoppingList } = get();
        if (!shoppingList) return;
        
        const updatedItems = shoppingList.items.map(item => {
          if (item.name === itemName) {
            return { ...item, checked: !item.checked };
          }
          return item;
        });
        
        set({ shoppingList: { items: updatedItems } });
      },
      clearCurrentPlan: () => set({ currentPlan: null, shoppingList: null }),
    }),
    {
      name: 'mango-meal-plan-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favoriteMeals: state.favoriteMeals,
        // Don't persist loading states or current plan
      }),
    }
  )
);