// Types for the API response

export interface MealInfo {
  name: string;
  description: string;
  estimated_calories: number;
}

export interface DayMeals {
  Breakfast: MealInfo;
  Lunch: MealInfo;
  Dinner: MealInfo;
  Snack?: MealInfo;
}

export interface MacroNutrient {
  percentage: string;
  grams: number;
  notes: string;
}

export interface DailyTotals {
  calories: number;
  macronutrients: {
    carbohydrates: MacroNutrient;
    proteins: MacroNutrient;
    fats: MacroNutrient;
  };
  fiber: string;
  sodium: {
    target: string;
    notes: string;
  };
  potassium: string;
  phosphorus: string;
  calcium: string;
  vitamin_D: string;
}

export interface MealMacros {
  calories: number;
  macros: {
    carbs: string;
    proteins: string;
    fats: string;
  };
}

export interface NutritionalInfo {
  daily_totals: DailyTotals;
  per_meal_estimates: {
    Breakfast: MealMacros;
    Lunch: MealMacros;
    Dinner: MealMacros;
    Snack?: MealMacros;
  };
  notes: string;
}

export interface ShoppingItem {
  ingredient: string;
  quantity: string;
}

export interface RecipeIngredients {
  title: string;
  ingredients: string[];
  instructions: string;
}

export interface DayRecipes {
  Breakfast: RecipeIngredients;
  Lunch: RecipeIngredients;
  Dinner: RecipeIngredients;
  Snack?: RecipeIngredients;
}

export interface MealPlanResponse {
  meal_plan: {
    [day: string]: DayMeals;
  };
  nutritional_info: NutritionalInfo;
  shopping_list: ShoppingItem[];
  recipes: {
    [day: string]: DayRecipes;
  };
}