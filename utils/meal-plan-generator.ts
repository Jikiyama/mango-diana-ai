import { Platform } from 'react-native';
import { MealPlan, ShoppingList, ShoppingItem as AppShoppingItem } from '@/types/meal-plan';
import { QuestionnaireState } from '@/types/questionnaire';
import { sampleMealPlan, createShoppingList } from '@/mocks/meal-plans';
import { generateMealPlanFromAPI } from '@/services/api';
import { MealPlanResponse, ShoppingItem } from '@/types/api-response';
import { logger } from '@/utils/logger';

// Convert API response to our app's data model
function convertApiResponseToAppModel(response: MealPlanResponse): { mealPlan: MealPlan; shoppingList: ShoppingList } {
  logger.info('MEAL_PLAN_GENERATOR', 'Converting API response to app model');
  
  try {
    // Validate the API response structure
    if (!response.meal_plan) {
      logger.error('MEAL_PLAN_GENERATOR', 'API response missing meal_plan property', response);
      throw new Error('Invalid API response: missing meal_plan property');
    }
    
    if (!response.recipes) {
      logger.error('MEAL_PLAN_GENERATOR', 'API response missing recipes property', response);
      throw new Error('Invalid API response: missing recipes property');
    }
    
    if (!response.shopping_list) {
      logger.error('MEAL_PLAN_GENERATOR', 'API response missing shopping_list property', response);
      throw new Error('Invalid API response: missing shopping_list property');
    }
    
    // Create a unique ID for the meal plan
    const planId = `plan-${Date.now()}`;
    
    // Convert meal plan data
    const meals = [];
    let totalCalories = 0;
    
    logger.debug('MEAL_PLAN_GENERATOR', 'Processing meal plan days', {
      days: Object.keys(response.meal_plan)
    });
    
    // Process each day in the meal plan
    Object.entries(response.meal_plan).forEach(([day, dayMeals], dayIndex) => {
      // Convert day string to day number (Monday = 1, Tuesday = 2, etc.)
      const dayNumber = dayIndex + 1;
      logger.debug('MEAL_PLAN_GENERATOR', `Processing day: ${day} (${dayNumber})`, {
        mealTypes: Object.keys(dayMeals)
      });
      
      // Process each meal type in the day
      Object.entries(dayMeals).forEach(([mealType, mealInfo]) => {
        // Get the corresponding recipe
        const recipe = response.recipes[day]?.[mealType as keyof typeof response.recipes[typeof day]];
        
        if (!recipe) {
          logger.warn('MEAL_PLAN_GENERATOR', `Recipe not found for ${day} ${mealType}`, {
            availableRecipes: Object.keys(response.recipes[day] || {})
          });
          return;
        }
        
        // Create a unique ID for the meal
        const mealId = `meal-${mealType.toLowerCase()}-day${dayNumber}`;
        
        // Add to total calories
        const calories = mealInfo.estimated_calories || 0;
        totalCalories += calories;
        
        logger.debug('MEAL_PLAN_GENERATOR', `Creating meal: ${mealId} - ${mealInfo.name}`, {
          calories,
          ingredientsCount: recipe.ingredients?.length || 0,
          instructionsLength: recipe.instructions?.length || 0
        });
        
        // Create the meal object
        meals.push({
          id: mealId,
          name: mealInfo.name,
          type: mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          day: dayNumber,
          isFavorite: false,
          recipe: {
            id: `recipe-${mealId}`,
            name: mealInfo.name,
            ingredients: (recipe.ingredients || []).map((ingredient, index) => {
              // Try to parse the ingredient string to extract amount, unit, and name
              const parts = ingredient.split(' ');
              let amount = 1;
              let unit = 'item';
              let name = ingredient;
              
              if (parts.length > 1) {
                // Try to parse the first part as a number
                const parsedAmount = parseFloat(parts[0]);
                if (!isNaN(parsedAmount)) {
                  amount = parsedAmount;
                  // If we have at least 3 parts, the second part is likely the unit
                  if (parts.length > 2) {
                    unit = parts[1];
                    name = parts.slice(2).join(' ');
                  } else {
                    name = parts.slice(1).join(' ');
                  }
                }
              }
              
              return {
                name,
                amount,
                unit,
                category: getCategoryForIngredient(name)
              };
            }),
            instructions: (recipe.instructions || '').split(/\d+\.\s/).filter(Boolean).map(step => step.trim()),
            prepTime: 15, // Default values since API doesn't provide these
            cookTime: 20,
            imageUrl: `https://source.unsplash.com/random/800x600/?food,${encodeURIComponent(mealInfo.name.replace(/\s+/g, '-'))}`,
            nutrients: [
              { 
                name: 'Protein', 
                amount: response.nutritional_info?.daily_totals?.macronutrients?.proteins?.grams / 4 || 0, 
                unit: 'g' 
              },
              { 
                name: 'Carbs', 
                amount: response.nutritional_info?.daily_totals?.macronutrients?.carbohydrates?.grams / 4 || 0, 
                unit: 'g' 
              },
              { 
                name: 'Fat', 
                amount: response.nutritional_info?.daily_totals?.macronutrients?.fats?.grams / 4 || 0, 
                unit: 'g' 
              }
            ],
            calories: calories
          }
        });
      });
    });
    
    logger.info('MEAL_PLAN_GENERATOR', `Created ${meals.length} meals with total calories: ${totalCalories}`);
    
    // Create the meal plan object
    const mealPlan: MealPlan = {
      id: planId,
      meals,
      createdAt: new Date().toISOString(),
      totalCalories,
      totalNutrients: [
        { 
          name: 'Protein', 
          amount: response.nutritional_info?.daily_totals?.macronutrients?.proteins?.grams || 0, 
          unit: 'g' 
        },
        { 
          name: 'Carbs', 
          amount: response.nutritional_info?.daily_totals?.macronutrients?.carbohydrates?.grams || 0, 
          unit: 'g' 
        },
        { 
          name: 'Fat', 
          amount: response.nutritional_info?.daily_totals?.macronutrients?.fats?.grams || 0, 
          unit: 'g' 
        }
      ]
    };
    
    logger.debug('MEAL_PLAN_GENERATOR', 'Converting shopping list data');
    
    // Convert shopping list data
    const shoppingItems: AppShoppingItem[] = (response.shopping_list || []).map(item => ({
      name: item.ingredient,
      amount: 1,
      unit: item.quantity || 'item',
      category: getCategoryForIngredient(item.ingredient),
      checked: false
    }));
    
    const shoppingList: ShoppingList = {
      items: shoppingItems
    };
    
    logger.info('MEAL_PLAN_GENERATOR', `Created shopping list with ${shoppingItems.length} items`);
    
    return { mealPlan, shoppingList };
  } catch (error) {
    logger.error('MEAL_PLAN_GENERATOR', 'Error converting API response to app model', error);
    throw error;
  }
}

// Helper function to categorize ingredients
function getCategoryForIngredient(ingredient: string): string {
  if (!ingredient) return 'Other';
  
  const lowerIngredient = ingredient.toLowerCase();
  
  if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || 
      lowerIngredient.includes('fish') || lowerIngredient.includes('meat') ||
      lowerIngredient.includes('turkey') || lowerIngredient.includes('salmon') ||
      lowerIngredient.includes('tofu')) {
    return 'Protein';
  } else if (lowerIngredient.includes('vegetable') || lowerIngredient.includes('carrot') || 
             lowerIngredient.includes('broccoli') || lowerIngredient.includes('spinach') ||
             lowerIngredient.includes('lettuce') || lowerIngredient.includes('tomato') ||
             lowerIngredient.includes('pepper') || lowerIngredient.includes('onion')) {
    return 'Produce';
  } else if (lowerIngredient.includes('rice') || lowerIngredient.includes('pasta') || 
             lowerIngredient.includes('bread') || lowerIngredient.includes('cereal') ||
             lowerIngredient.includes('oat') || lowerIngredient.includes('grain')) {
    return 'Grains';
  } else if (lowerIngredient.includes('milk') || lowerIngredient.includes('cheese') || 
             lowerIngredient.includes('yogurt') || lowerIngredient.includes('butter')) {
    return 'Dairy';
  } else if (lowerIngredient.includes('apple') || lowerIngredient.includes('banana') || 
             lowerIngredient.includes('berry') || lowerIngredient.includes('fruit')) {
    return 'Fruits';
  } else if (lowerIngredient.includes('oil') || lowerIngredient.includes('vinegar') || 
             lowerIngredient.includes('sauce') || lowerIngredient.includes('condiment')) {
    return 'Condiments';
  } else if (lowerIngredient.includes('spice') || lowerIngredient.includes('herb') || 
             lowerIngredient.includes('salt') || lowerIngredient.includes('pepper')) {
    return 'Spices';
  } else if (lowerIngredient.includes('nut') || lowerIngredient.includes('seed') || 
             lowerIngredient.includes('almond') || lowerIngredient.includes('walnut')) {
    return 'Nuts & Seeds';
  } else {
    return 'Other';
  }
}

// This function will call the API and convert the response to our app's data model
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
    
    // For web platform, always use sample data to avoid API issues
    if (Platform.OS === 'web') {
      logger.info('MEAL_PLAN_GENERATOR', 'Using sample data for web platform');
      
      // Use sample data
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
      
      logger.info('MEAL_PLAN_GENERATOR', 'Created meal plan with sample data', {
        planId: modifiedMealPlan.id,
        mealsCount: modifiedMealPlan.meals.length,
        shoppingItemsCount: shoppingList.items.length
      });
      
      return { mealPlan: modifiedMealPlan, shoppingList };
    }
    
    // For native platforms, try to call the API
    logger.info('MEAL_PLAN_GENERATOR', 'Calling API to generate meal plan');
    
    try {
      logger.debug('MEAL_PLAN_GENERATOR', 'Before API call');
      const apiResponse = await generateMealPlanFromAPI(questionnaireData);
      logger.debug('MEAL_PLAN_GENERATOR', 'After API call - success!');
      
      logger.info('MEAL_PLAN_GENERATOR', 'API response received successfully');
      
      // Convert the API response to our app's data model
      logger.info('MEAL_PLAN_GENERATOR', 'Converting API response to app model');
      return convertApiResponseToAppModel(apiResponse);
    } catch (apiError) {
      logger.error('MEAL_PLAN_GENERATOR', 'API call failed, falling back to sample data', apiError);
      
      // Fallback to sample data if API call fails
      logger.warn('MEAL_PLAN_GENERATOR', 'Using sample data due to API error');
      
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
  } catch (error) {
    logger.error('MEAL_PLAN_GENERATOR', 'Error generating meal plan, using fallback data', error);
    
    // Final fallback to sample data if anything else fails
    logger.warn('MEAL_PLAN_GENERATOR', 'Using sample data as final fallback');
    
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
    
    logger.info('MEAL_PLAN_GENERATOR', 'Created emergency fallback meal plan with sample data', {
      planId: modifiedMealPlan.id,
      mealsCount: modifiedMealPlan.meals.length,
      shoppingItemsCount: shoppingList.items.length
    });
    
    return { mealPlan: modifiedMealPlan, shoppingList };
  }
}