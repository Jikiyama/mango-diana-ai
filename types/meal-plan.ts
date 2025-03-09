export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  imageUrl: string;
  nutrients: Nutrient[];
  calories: number;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe: Recipe;
  day: number;
  isFavorite: boolean;
}

export interface MealPlan {
  id: string;
  meals: Meal[];
  createdAt: string;
  totalCalories: number;
  totalNutrients: Nutrient[];
}

export interface ShoppingItem {
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
}

export interface ShoppingList {
  items: ShoppingItem[];
}

export interface MealPlanState {
  currentPlan: MealPlan | null;
  isLoading: boolean;
  error: string | null;
  favoriteMeals: Meal[];
  shoppingList: ShoppingList | null;
}