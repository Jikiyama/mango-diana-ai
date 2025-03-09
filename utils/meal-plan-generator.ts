import { Platform } from 'react-native';
import { 
  MealPlan, 
  ShoppingList, 
  ShoppingItem as AppShoppingItem,
  Meal, 
  Recipe, 
  Ingredient, 
  Nutrient 
} from '@/types/meal-plan';
import { QuestionnaireState } from '@/types/questionnaire';
import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';
import { generateMealPlanFromAPI } from '@/services/api';
import { MealPlanResponse } from '@/types/api-response';
import { logger } from '@/utils/logger';

/**
 * Primary function that gets called from your loading screen:
 * 1) Calls the API with `questionnaireData`.
 * 2) If it fails, fallback to sample data.
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
      
      return buildSampleFallback(questionnaireData);
    }
    
  } catch (error) {
    logger.error('MEAL_PLAN_GENERATOR', 'Error generating meal plan, using fallback data', error);
    logger.warn('MEAL_PLAN_GENERATOR', 'Using sample data as final fallback');
    
    return buildSampleFallback(questionnaireData);
  }
}

/**
 * buildSampleFallback: utility to build a plan from the sampleMealPlan for fallback
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
 * Convert the new shape where:
{
  "meal_plan": {
    "Day 1": { "Breakfast": "", "Snack": "", "Lunch": "", "Dinner": "" },
    ...
  },
  "nutritional_info": {
    "daily_totals": { ... },
    "meal_breakdown": {
      "Day 1": {
        "Breakfast": { "calories": "", "macronutrients": { "carbohydrates": "", "proteins": "", "fats": "" } },
        "Snack": { ... },
        ...
      },
      "Day 2": { ... }
    },
    "notes": ""
  },
  "shopping_list": [ { "ingredient": "", "quantity": "" } ],
  "recipes": {
    "Recipe Title": {
      "ingredients": [ { "item": "", "quantity": "" } ],
      "instructions": ""
    }
  }
}
*/
function convertApiResponseToAppModel(
  response: MealPlanResponse
): { mealPlan: MealPlan; shoppingList: ShoppingList } {
  logger.info('MEAL_PLAN_GENERATOR', 'Converting API response to app model');
  
  if (!response.meal_plan) {
    throw new Error('Invalid API response: missing "meal_plan"');
  }
  if (!response.nutritional_info) {
    throw new Error('Invalid API response: missing "nutritional_info"');
  }
  if (!response.shopping_list) {
    throw new Error('Invalid API response: missing "shopping_list"');
  }
  if (!response.recipes) {
    throw new Error('Invalid API response: missing "recipes"');
  }
  
  // Build up Meal[] 
  const meals: Meal[] = [];
  let totalCalories = 0;
  
  // Day-based meal breakdown: "Day 1", "Day 2"
  const dayEntries = Object.entries(response.meal_plan);
  
  dayEntries.forEach(([dayLabel, dayMealTypes], index) => {
    // Convert "Day 1" => numeric day
    const dayNumber = index + 1;
    
    // dayMealTypes = { "Breakfast": "Scrambled Egg Tacos ...", "Snack": "...", "Lunch": "...", "Dinner": "..." }
    Object.entries(dayMealTypes).forEach(([mealType, mealName]) => {
      // mealName is a string that references the key in response.recipes
      if (!mealName) return; // in case empty
      const recipeData = response.recipes[mealName];
      if (!recipeData) {
        logger.warn(
          'MEAL_PLAN_GENERATOR',
          `Recipe not found for name="${mealName}" in "Day ${dayNumber}" -> ${mealType}`
        );
        return;
      }
      
      // Now we want the meal_breakdown for the same day + meal type
      // e.g. response.nutritional_info.meal_breakdown["Day 1"].Breakfast
      let mealCalories = 0;
      let macros = { carbs: '', protein: '', fat: '' };
      
      const breakdownForDay = response.nutritional_info.meal_breakdown[dayLabel];
      if (breakdownForDay) {
        const mealBreakdown = breakdownForDay[mealType];
        if (mealBreakdown) {
          mealCalories = parseFloat(mealBreakdown.calories || '0');
          macros = {
            carbs: mealBreakdown.macronutrients.carbohydrates || '',
            protein: mealBreakdown.macronutrients.proteins || '',
            fat: mealBreakdown.macronutrients.fats || '',
          };
        }
      }
      totalCalories += mealCalories;
      
      // Build the `Recipe`
      const newRecipe = buildRecipe(mealName, recipeData, mealCalories, macros);
      
      // Build the `Meal`
      const mealId = `meal-${mealType.toLowerCase()}-day${dayNumber}`;
      meals.push({
        id: mealId,
        name: mealName,
        type: mealType.toLowerCase() as 'breakfast'|'lunch'|'dinner'|'snack',
        day: dayNumber,
        isFavorite: false,
        recipe: newRecipe,
      });
    });
  });
  
  logger.info('MEAL_PLAN_GENERATOR', `Built ${meals.length} meals, total cals ~ ${totalCalories}`);
  
  // Build a MealPlan object
  const planId = `plan-${Date.now()}`;
  const mealPlan: MealPlan = {
    id: planId,
    meals,
    createdAt: new Date().toISOString(),
    totalCalories,
    totalNutrients: [], // We can fill from daily_totals below
  };
  
  // We can also store more data if you want the "notes" or the dailyTotals
  // Parse daily_totals
  const dt = response.nutritional_info.daily_totals;
  if (dt) {
    // example: dt.calories, dt.macronutrients.{carbohydrates,proteins,fats}
    // parse them into mealPlan.totalNutrients
    const carbsG = parseFloat(dt.macronutrients.carbohydrates.grams || '0');
    const proteinG = parseFloat(dt.macronutrients.proteins.grams || '0');
    const fatsG = parseFloat(dt.macronutrients.fats.grams || '0');
    
    mealPlan.totalNutrients = [
      { name: 'Carbs', amount: carbsG, unit: 'g' },
      { name: 'Protein', amount: proteinG, unit: 'g' },
      { name: 'Fat', amount: fatsG, unit: 'g' },
    ];
  }
  
  // Convert the shopping_list
  const items: AppShoppingItem[] = response.shopping_list.map(si => ({
    name: si.ingredient || 'Ingredient',
    // remove "amount=1" so we don't show that extra "1 "
    amount: 0,
    unit: si.quantity || '',
    category: getCategoryForIngredient(si.ingredient || ''),
    checked: false,
  }));
  
  const shoppingList: ShoppingList = {
    items,
  };

  return { mealPlan, shoppingList };
}

/**
 * Build a `Recipe` object from the name, data, and the mealBreakdown macros
 */
function buildRecipe(
  mealName: string,
  recipeData: { ingredients: any; instructions: string },
  mealCalories: number,
  macros: { carbs: string; protein: string; fat: string }
): Recipe {
  // parse recipe ingredients
  let parsedIngredients: Ingredient[] = [];
  if (Array.isArray(recipeData.ingredients)) {
    // e.g. [ { item: "", quantity: ""}, ... ] or sometimes just strings
    parsedIngredients = recipeData.ingredients.map(ing => {
      if (typeof ing === 'string') {
        // parse something like "2 large eggs"
        return parseIngredientString(ing);
      } else {
        // assume { item: "", quantity: "" }
        return {
          name: ing.item || 'Ingredient',
          amount: 0,
          unit: ing.quantity || '',
          category: getCategoryForIngredient(ing.item || ''),
        };
      }
    });
  }
  
  // parse instructions into array if needed
  const instructionsArray = parseInstructions(recipeData.instructions);
  
  // parse macros
  const nutrients: Nutrient[] = [
    { name: 'Carbs', amount: parseNumberFromString(macros.carbs), unit: 'g' },
    { name: 'Protein', amount: parseNumberFromString(macros.protein), unit: 'g' },
    { name: 'Fat', amount: parseNumberFromString(macros.fat), unit: 'g' },
  ];
  
  return {
    id: `recipe-${mealName.replace(/\s+/g, '-')}`,
    name: mealName,
    ingredients: parsedIngredients,
    instructions: instructionsArray,
    prepTime: 10, 
    cookTime: 15, 
    imageUrl: guessMealImageUrl(mealName),
    nutrients,
    calories: mealCalories,
  };
}

/**
 * parseIngredientString: e.g. "2 large eggs" => { name: "eggs", amount: 2, unit: "large" }
 * We'll store amount=0 to avoid the "1" glitch, or parse carefully.
 */
function parseIngredientString(ingredientLine: string): Ingredient {
  // You can parse more thoroughly, but let's keep it simple:
  return {
    name: ingredientLine,
    amount: 0,
    unit: '',
    category: getCategoryForIngredient(ingredientLine),
  };
}

/**
 * parseNumberFromString: handle "≈69 g" or "16-18 g"
 */
function parseNumberFromString(str?: string): number {
  if (!str) return 0;
  
  // if "16-18" => average
  const dash = str.match(/(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)/);
  if (dash) {
    const v1 = parseFloat(dash[1]);
    const v2 = parseFloat(dash[2]);
    return (v1 + v2) / 2;
  }
  
  // else parse single float
  const match = str.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * parseInstructions: e.g. "1. step one 2. step two"
 */
function parseInstructions(instr: string): string[] {
  if (!instr) return [];
  
  return instr
    .split(/\d+\.\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/** guessMealImageUrl: optional placeholder */
function guessMealImageUrl(mealName: string): string {
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(mealName)}`;
}

/**
 * getCategoryForIngredient: your existing categorization logic
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
    lower.includes('pepper') ||
    lower.includes('onion') ||
    lower.includes('garlic') ||
    lower.includes('tomato') ||
    lower.includes('spinach') ||
    lower.includes('lettuce') ||
    lower.includes('corn') ||
    lower.includes('avocado') ||
    lower.includes('bean') ||
    lower.includes('cilantro') ||
    lower.includes('lime') ||
    lower.includes('cabbage')
  ) {
    return 'Produce';
  } else if (lower.includes('rice') || lower.includes('pasta') || lower.includes('grain') || lower.includes('oat') || lower.includes('tortilla')) {
    return 'Grains';
  } else if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('butter')) {
    return 'Dairy';
  } else if (lower.includes('oil') || lower.includes('vinegar') || lower.includes('salsa') || lower.includes('sauce') || lower.includes('broth')) {
    return 'Condiments';
  } else if (lower.includes('salt') || lower.includes('cumin') || lower.includes('chili') || lower.includes('powder') || lower.includes('paprika') || lower.includes('seasoning')) {
    return 'Spices';
  }
  return 'Other';
}
