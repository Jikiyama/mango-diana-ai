import { Platform } from 'react-native';
import { MealPlan, ShoppingList, ShoppingItem as AppShoppingItem, Meal, Recipe, Ingredient, Nutrient } from '@/types/meal-plan';
import { QuestionnaireState } from '@/types/questionnaire';
import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';
import { generateMealPlanFromAPI } from '@/services/api';
import { MealPlanResponse } from '@/types/api-response';
import { logger } from '@/utils/logger';

/**
 * Primary function that gets called from your loading screen:
 * 1) Calls the API with `questionnaireData`.
 * 2) If it fails, fallback to sample data.
 * 3) Returns a { mealPlan, shoppingList } you can store.
 */
export async function generateMealPlan(
  questionnaireData: QuestionnaireState
): Promise<{ mealPlan: MealPlan; shoppingList: ShoppingList }> {
  try {
    logger.info('MEAL_PLAN_GENERATOR', 'Starting meal plan generation process');
    logger.debug('MEAL_PLAN_GENERATOR', 'Using questionnaire data', {
      age: questionnaireData.personalInfo.age,
      gender: questionnaireData.personalInfo.gender,
      healthGoal: questionnaireData.goalSettings.healthGoal,
      mealPlanDays: questionnaireData.goalSettings.mealPlanDays,
      mealsPerDay: questionnaireData.goalSettings.mealsPerDay,
      dietaryPreferences: questionnaireData.dietPreferences.dietaryPreferences,
    });
    
    logger.info('MEAL_PLAN_GENERATOR', 'Attempting to call the API for all platforms');
    
    // 1) Try the real API call
    try {
      logger.debug('MEAL_PLAN_GENERATOR', 'Before API call');
      const apiResponse = await generateMealPlanFromAPI(questionnaireData);
      logger.debug('MEAL_PLAN_GENERATOR', 'After API call - success!');
      
      logger.info('MEAL_PLAN_GENERATOR', 'API response received successfully');
      
      // 2) Convert the API response to our app's data model
      logger.info('MEAL_PLAN_GENERATOR', 'Converting API response to app model');
      const { mealPlan, shoppingList } = convertApiResponseToAppModel(apiResponse);
      
      return { mealPlan, shoppingList };
      
    } catch (apiError) {
      // 3) If the API fails, fallback to sample
      logger.error('MEAL_PLAN_GENERATOR', 'API call failed, falling back to sample data', apiError);
      logger.warn('MEAL_PLAN_GENERATOR', 'Using sample data due to API error');
      
      const fallbackPlan = buildSampleFallback(questionnaireData);
      return fallbackPlan;
    }
    
  } catch (error) {
    logger.error('MEAL_PLAN_GENERATOR', 'Error generating meal plan, using fallback data', error);
    
    // 4) Final fallback if something else fails
    logger.warn('MEAL_PLAN_GENERATOR', 'Using sample data as final fallback');
    
    const fallbackPlan = buildSampleFallback(questionnaireData);
    return fallbackPlan;
  }
}

/**
 * buildSampleFallback - utility to build a plan from the sampleMealPlan for fallback
 */
function buildSampleFallback(
  questionnaireData: QuestionnaireState
): { mealPlan: MealPlan; shoppingList: ShoppingList } {
  const modifiedMealPlan = { 
    ...sampleMealPlan,
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    // Filter meals to match the requested number of days
    meals: sampleMealPlan.meals.filter(meal => 
      meal.day <= (questionnaireData.goalSettings.mealPlanDays || 7)
    ),
  };
  
  const shoppingList = createShoppingList(modifiedMealPlan);
  
  logger.info('MEAL_PLAN_GENERATOR', 'Created fallback meal plan with sample data', {
    planId: modifiedMealPlan.id,
    mealsCount: modifiedMealPlan.meals.length,
    shoppingItemsCount: shoppingList.items.length
  });
  
  return { mealPlan: modifiedMealPlan, shoppingList };
}

/**
 * convertApiResponseToAppModel - parse the new shape of your API response:
 * {
 *   "meal_plan": {
 *     "Day 1": {
 *       "Breakfast": "Scrambled Egg Tacos with Avocado Salsa",
 *       "Lunch": "Chicken Fajita Bowl",
 *       "Dinner": "Mexican Grilled Shrimp Salad"
 *     }, ...
 *   },
 *   "nutritional_info": {
 *     "daily_totals": { ... },
 *     "per_meal": {
 *       "Breakfast": { "calories": 500, "carbohydrates": "...", ... },
 *       "Lunch": { ... },
 *       "Dinner": { ... }
 *     },
 *     "notes": "..."
 *   },
 *   "shopping_list": [ { "ingredient": "Eggs", "quantity": "..." }, ... ],
 *   "recipes": {
 *     "Scrambled Egg Tacos with Avocado Salsa": {
 *       "ingredients": [...strings or objects...],
 *       "instructions": "1. ... 2. ..."
 *     },
 *     ...
 *   }
 * }
 */
function convertApiResponseToAppModel(
  response: MealPlanResponse
): { mealPlan: MealPlan; shoppingList: ShoppingList } {
  logger.info('MEAL_PLAN_GENERATOR', 'Converting API response to app model');
  
  try {
    // 1) Basic checks
    if (!response.meal_plan) {
      throw new Error('Invalid API response: missing "meal_plan"');
    }
    if (!response.recipes) {
      throw new Error('Invalid API response: missing "recipes"');
    }
    if (!response.shopping_list) {
      throw new Error('Invalid API response: missing "shopping_list"');
    }
    
    // 2) Build Meal[] array
    const meals: Meal[] = [];
    let totalCalories = 0;
    
    // dayEntries: [ [ "Day 1", {Breakfast: "Scrambled Egg Tacos", ...}], [ "Day 2", {...} ] ]
    const dayEntries = Object.entries(response.meal_plan);
    
    dayEntries.forEach(([dayLabel, dayMealsObj], index) => {
      // Convert "Day 1" => numeric day
      const dayNumber = index + 1;
      
      // dayMealsObj might be: { Breakfast: "Scrambled Egg Tacos with Avocado Salsa", Lunch: "...", Dinner: "..." }
      Object.entries(dayMealsObj).forEach(([mealType, mealName]) => {
        // mealName is a string that references a key in response.recipes
        const recipeData = response.recipes[mealName];
        if (!recipeData) {
          logger.warn(
            'MEAL_PLAN_GENERATOR',
            `Recipe not found for mealName="${mealName}"; skipping.`
          );
          return;
        }
        
        // parse the "per_meal" breakdown for e.g. Breakfast => { calories: 500, carbs: "≈69 g", ...}
        const mealBreakdown = response.nutritional_info?.per_meal?.[mealType];
        const estimatedCalories = mealBreakdown?.calories ?? 0;
        totalCalories += estimatedCalories;
        
        // Convert the recipe's ingredients to our Ingredient[] shape
        let parsedIngredients: Ingredient[] = [];
        if (Array.isArray(recipeData.ingredients)) {
          parsedIngredients = recipeData.ingredients.map(ing => {
            if (typeof ing === 'string') {
              // It's a string like "2 large eggs"
              return parseIngredientString(ing);
            } else {
              // Possibly an object { item: "Eggs", quantity: "2" }
              const { item, quantity } = ing;
              return {
                name: item || 'Ingredient',
                amount: 1,
                unit: quantity || '',
                category: getCategoryForIngredient(item || ''),
              };
            }
          });
        }
        
        // Convert instructions from e.g. "1. Step one 2. Step two" to string[] if you want
        const instructionsArray = parseInstructions(recipeData.instructions);
        
        // Convert macros to Nutrient[]
        const nutrients: Nutrient[] = [];
        if (mealBreakdown) {
          nutrients.push({
            name: 'Carbs',
            amount: parseNumberFromString(mealBreakdown.carbohydrates),
            unit: 'g'
          });
          nutrients.push({
            name: 'Protein',
            amount: parseNumberFromString(mealBreakdown.protein),
            unit: 'g'
          });
          nutrients.push({
            name: 'Fat',
            amount: parseNumberFromString(mealBreakdown.fat),
            unit: 'g'
          });
        }
        
        // Build the Recipe object
        const recipe: Recipe = {
          id: `recipe-${mealName.replace(/\s+/g, '-')}`,
          name: mealName,
          ingredients: parsedIngredients,
          instructions: instructionsArray,
          prepTime: 10, // placeholder
          cookTime: 15, // placeholder
          imageUrl: guessMealImageUrl(mealName),
          nutrients,
          calories: estimatedCalories,
        };
        
        // Build the Meal
        const mealId = `meal-${mealType.toLowerCase()}-day${dayNumber}`;
        const newMeal: Meal = {
          id: mealId,
          name: mealName,
          type: mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          day: dayNumber,
          isFavorite: false,
          recipe,
        };
        meals.push(newMeal);
      });
    });
    
    logger.info(
      'MEAL_PLAN_GENERATOR',
      `Finished building ${meals.length} meals; total cals ~ ${totalCalories}`
    );
    
    // Build the MealPlan
    const planId = `plan-${Date.now()}`;
    const mealPlan: MealPlan = {
      id: planId,
      meals,
      createdAt: new Date().toISOString(),
      totalCalories,
      // We could parse overall macros from daily_totals if we want:
      totalNutrients: []
    };
    
    // 3) Convert the shopping list
    const shoppingItems: AppShoppingItem[] = response.shopping_list.map(item => ({
      name: item.ingredient,
      amount: 1,
      unit: item.quantity,
      category: getCategoryForIngredient(item.ingredient),
      checked: false
    }));
    
    const shoppingList: ShoppingList = { items: shoppingItems };
    
    // Return
    return { mealPlan, shoppingList };
  } catch (err) {
    logger.error('MEAL_PLAN_GENERATOR', 'Error converting API response to app model', err);
    throw err;
  }
}

/**
 * parseIngredientString: e.g. "2 large eggs" => { name: "eggs", amount: 2, unit: "large" }
 */
function parseIngredientString(ingredientLine: string): Ingredient {
  const parts = ingredientLine.split(' ');
  let amount = 1;
  let unit = '';
  let name = ingredientLine; // fallback
  
  // Try parse first token as a float
  const maybeAmount = parseFloat(parts[0]);
  if (!isNaN(maybeAmount)) {
    amount = maybeAmount;
    // If there's at least 3 tokens, treat second as "unit", the rest as the name
    if (parts.length >= 3) {
      unit = parts[1];
      name = parts.slice(2).join(' ');
    } else {
      // e.g. "2 eggs"
      name = parts.slice(1).join(' ');
    }
  }
  
  return {
    name,
    amount,
    unit,
    category: getCategoryForIngredient(name),
  };
}

/**
 * parseInstructions: from "1. do this 2. do that" into string[]
 */
function parseInstructions(instructions: string | undefined): string[] {
  if (!instructions) return [];
  return instructions
    .split(/\d+\.\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * parseNumberFromString: handles "≈69 g" or "≈16-18 g" => pick a float
 */
function parseNumberFromString(str?: string): number {
  if (!str) return 0;
  
  // handle "16-18" => average
  const dashMatch = str.match(/(\d+(\.\d+)?)-(\d+(\.\d+)?)/);
  if (dashMatch) {
    const n1 = parseFloat(dashMatch[1]);
    const n2 = parseFloat(dashMatch[3]);
    return (n1 + n2) / 2;
  }
  
  // handle single number
  const match = str.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * guessMealImageUrl: optional placeholder if your API doesn't provide images
 */
function guessMealImageUrl(mealName: string): string {
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(mealName)}`;
}

/**
 * getCategoryForIngredient: same logic from your code
 */
function getCategoryForIngredient(name: string): string {
  const lower = name.toLowerCase();
  if (
    lower.includes('chicken') ||
    lower.includes('beef') ||
    lower.includes('shrimp') ||
    lower.includes('egg') ||
    lower.includes('turkey') ||
    lower.includes('fish') ||
    lower.includes('tofu')
  ) {
    return 'Protein';
  } else if (
    lower.includes('broccoli') ||
    lower.includes('pepper') ||
    lower.includes('onion') ||
    lower.includes('garlic') ||
    lower.includes('tomato') ||
    lower.includes('spinach') ||
    lower.includes('lettuce') ||
    lower.includes('corn') ||
    lower.includes('cabbage') ||
    lower.includes('bean') ||
    lower.includes('avocado')
  ) {
    return 'Produce';
  } else if (lower.includes('rice') || lower.includes('pasta') || lower.includes('grain') || lower.includes('oat')) {
    return 'Grains';
  } else if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('butter')) {
    return 'Dairy';
  } else if (lower.includes('oil') || lower.includes('vinegar') || lower.includes('salsa') || lower.includes('sauce')) {
    return 'Condiments';
  } else if (lower.includes('salt') || lower.includes('cumin') || lower.includes('chili') || lower.includes('powder') || lower.includes('paprika')) {
    return 'Spices';
  }
  return 'Other';
}
