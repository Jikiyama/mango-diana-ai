import { MealPlan, Meal, Recipe, Nutrient, Ingredient, ShoppingList, ShoppingItem } from '@/types/meal-plan';

// Helper function to create nutrients
const createNutrient = (name: string, amount: number, unit: string): Nutrient => ({
  name,
  amount,
  unit,
});

// Helper function to create ingredients
const createIngredient = (name: string, amount: number, unit: string, category: string): Ingredient => ({
  name,
  amount,
  unit,
  category,
});

// Sample nutrients
const sampleNutrients: Nutrient[] = [
  createNutrient('Protein', 25, 'g'),
  createNutrient('Carbs', 35, 'g'),
  createNutrient('Fat', 12, 'g'),
  createNutrient('Fiber', 8, 'g'),
  createNutrient('Sodium', 450, 'mg'),
  createNutrient('Potassium', 800, 'mg'),
  createNutrient('Vitamin A', 120, 'µg'),
  createNutrient('Vitamin C', 45, 'mg'),
  createNutrient('Calcium', 200, 'mg'),
  createNutrient('Iron', 3.5, 'mg'),
];

// Sample recipes
const sampleRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Mediterranean Grilled Chicken Salad',
    ingredients: [
      createIngredient('Chicken breast', 150, 'g', 'Protein'),
      createIngredient('Mixed greens', 2, 'cups', 'Produce'),
      createIngredient('Cherry tomatoes', 0.5, 'cup', 'Produce'),
      createIngredient('Cucumber', 0.5, 'medium', 'Produce'),
      createIngredient('Red onion', 0.25, 'medium', 'Produce'),
      createIngredient('Feta cheese', 30, 'g', 'Dairy'),
      createIngredient('Olive oil', 1, 'tbsp', 'Oils'),
      createIngredient('Lemon juice', 1, 'tbsp', 'Condiments'),
      createIngredient('Oregano', 0.5, 'tsp', 'Spices'),
    ],
    instructions: [
      'Season chicken breast with salt, pepper, and oregano.',
      'Grill chicken for 6-7 minutes per side until fully cooked.',
      'Chop all vegetables and place in a large bowl.',
      'Slice cooked chicken and add to the bowl.',
      'Crumble feta cheese over the salad.',
      'Mix olive oil and lemon juice for dressing and drizzle over salad.',
      'Toss gently and serve immediately.'
    ],
    prepTime: 15,
    cookTime: 15,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    nutrients: sampleNutrients.map(n => ({ ...n, amount: n.amount * 0.9 + Math.random() * 10 })),
    calories: 350,
  },
  {
    id: 'recipe-2',
    name: 'Hearty Vegetable Lentil Soup',
    ingredients: [
      createIngredient('Green lentils', 1, 'cup', 'Legumes'),
      createIngredient('Carrots', 2, 'medium', 'Produce'),
      createIngredient('Celery', 2, 'stalks', 'Produce'),
      createIngredient('Onion', 1, 'medium', 'Produce'),
      createIngredient('Garlic', 2, 'cloves', 'Produce'),
      createIngredient('Vegetable broth', 4, 'cups', 'Canned Goods'),
      createIngredient('Diced tomatoes', 1, 'can', 'Canned Goods'),
      createIngredient('Spinach', 2, 'cups', 'Produce'),
      createIngredient('Olive oil', 1, 'tbsp', 'Oils'),
      createIngredient('Cumin', 1, 'tsp', 'Spices'),
      createIngredient('Bay leaf', 1, 'leaf', 'Spices'),
    ],
    instructions: [
      'Heat olive oil in a large pot over medium heat.',
      'Add diced onions, carrots, and celery. Cook for 5 minutes until softened.',
      'Add minced garlic and cook for another minute.',
      'Add lentils, diced tomatoes, vegetable broth, cumin, and bay leaf.',
      'Bring to a boil, then reduce heat and simmer for 25-30 minutes until lentils are tender.',
      'Add spinach and cook for another 2-3 minutes until wilted.',
      'Season with salt and pepper to taste. Remove bay leaf before serving.'
    ],
    prepTime: 15,
    cookTime: 35,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    nutrients: sampleNutrients.map(n => ({ ...n, amount: n.amount * 0.8 + Math.random() * 15 })),
    calories: 280,
  },
  {
    id: 'recipe-3',
    name: 'Baked Salmon with Roasted Vegetables',
    ingredients: [
      createIngredient('Salmon fillet', 150, 'g', 'Protein'),
      createIngredient('Broccoli', 1, 'cup', 'Produce'),
      createIngredient('Bell peppers', 1, 'medium', 'Produce'),
      createIngredient('Zucchini', 1, 'small', 'Produce'),
      createIngredient('Olive oil', 2, 'tbsp', 'Oils'),
      createIngredient('Lemon', 0.5, 'medium', 'Produce'),
      createIngredient('Garlic powder', 0.5, 'tsp', 'Spices'),
      createIngredient('Dill', 1, 'tsp', 'Herbs'),
      createIngredient('Salt', 0.5, 'tsp', 'Spices'),
      createIngredient('Black pepper', 0.25, 'tsp', 'Spices'),
    ],
    instructions: [
      'Preheat oven to 400°F (200°C).',
      'Cut vegetables into bite-sized pieces and place on a baking sheet.',
      'Drizzle vegetables with 1 tbsp olive oil, salt, pepper, and garlic powder. Toss to coat.',
      'Place salmon on a separate baking sheet or in the center of the vegetable tray.',
      'Drizzle salmon with remaining olive oil, squeeze lemon juice over it, and sprinkle with dill.',
      'Bake for 20-25 minutes until salmon is cooked through and vegetables are tender.',
      'Serve salmon with roasted vegetables on the side.'
    ],
    prepTime: 10,
    cookTime: 25,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    nutrients: sampleNutrients.map(n => ({ ...n, amount: n.amount * 1.1 + Math.random() * 5 })),
    calories: 420,
  },
  {
    id: 'recipe-4',
    name: 'Quinoa Bowl with Avocado and Black Beans',
    ingredients: [
      createIngredient('Quinoa', 0.75, 'cup', 'Grains'),
      createIngredient('Black beans', 0.5, 'can', 'Canned Goods'),
      createIngredient('Avocado', 0.5, 'medium', 'Produce'),
      createIngredient('Cherry tomatoes', 0.5, 'cup', 'Produce'),
      createIngredient('Corn', 0.5, 'cup', 'Produce'),
      createIngredient('Red onion', 0.25, 'small', 'Produce'),
      createIngredient('Cilantro', 2, 'tbsp', 'Herbs'),
      createIngredient('Lime juice', 1, 'tbsp', 'Condiments'),
      createIngredient('Olive oil', 1, 'tbsp', 'Oils'),
      createIngredient('Cumin', 0.5, 'tsp', 'Spices'),
      createIngredient('Chili powder', 0.25, 'tsp', 'Spices'),
    ],
    instructions: [
      'Rinse quinoa thoroughly and cook according to package instructions.',
      'Drain and rinse black beans.',
      'Dice avocado, halve cherry tomatoes, and finely chop red onion.',
      'In a large bowl, combine cooked quinoa, black beans, corn, tomatoes, and red onion.',
      'In a small bowl, whisk together lime juice, olive oil, cumin, and chili powder.',
      'Pour dressing over the quinoa mixture and toss to combine.',
      'Gently fold in diced avocado and chopped cilantro.',
      'Season with salt and pepper to taste. Serve at room temperature or chilled.'
    ],
    prepTime: 15,
    cookTime: 20,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    nutrients: sampleNutrients.map(n => ({ ...n, amount: n.amount * 0.95 + Math.random() * 8 })),
    calories: 380,
  },
  {
    id: 'recipe-5',
    name: 'Greek Yogurt Parfait with Berries',
    ingredients: [
      createIngredient('Greek yogurt', 1, 'cup', 'Dairy'),
      createIngredient('Mixed berries', 1, 'cup', 'Produce'),
      createIngredient('Granola', 0.25, 'cup', 'Breakfast'),
      createIngredient('Honey', 1, 'tbsp', 'Condiments'),
      createIngredient('Chia seeds', 1, 'tsp', 'Baking'),
      createIngredient('Cinnamon', 0.25, 'tsp', 'Spices'),
    ],
    instructions: [
      'In a glass or bowl, add half of the Greek yogurt as the bottom layer.',
      'Add a layer of mixed berries on top of the yogurt.',
      'Sprinkle half of the granola over the berries.',
      'Repeat with another layer of yogurt and berries.',
      'Top with remaining granola, a drizzle of honey, chia seeds, and a sprinkle of cinnamon.',
      'Serve immediately or refrigerate for up to 2 hours (add granola just before serving to keep it crunchy).'
    ],
    prepTime: 10,
    cookTime: 0,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    nutrients: sampleNutrients.map(n => ({ ...n, amount: n.amount * 0.7 + Math.random() * 5 })),
    calories: 250,
  },
  {
    id: 'recipe-6',
    name: 'Turkey and Vegetable Stir-Fry',
    ingredients: [
      createIngredient('Ground turkey', 150, 'g', 'Protein'),
      createIngredient('Broccoli', 1, 'cup', 'Produce'),
      createIngredient('Bell peppers', 1, 'medium', 'Produce'),
      createIngredient('Carrots', 1, 'medium', 'Produce'),
      createIngredient('Snow peas', 0.5, 'cup', 'Produce'),
      createIngredient('Garlic', 2, 'cloves', 'Produce'),
      createIngredient('Ginger', 1, 'tsp', 'Produce'),
      createIngredient('Low-sodium soy sauce', 2, 'tbsp', 'Condiments'),
      createIngredient('Sesame oil', 1, 'tsp', 'Oils'),
      createIngredient('Brown rice', 0.5, 'cup', 'Grains'),
    ],
    instructions: [
      'Cook brown rice according to package instructions.',
      'Heat a large skillet or wok over medium-high heat.',
      'Add ground turkey and cook until browned, breaking it up as it cooks.',
      'Add minced garlic and ginger, cook for 30 seconds until fragrant.',
      'Add all vegetables and stir-fry for 5-7 minutes until crisp-tender.',
      'Pour in soy sauce and drizzle with sesame oil, toss to combine.',
      'Serve the stir-fry over cooked brown rice.'
    ],
    prepTime: 15,
    cookTime: 20,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    nutrients: sampleNutrients.map(n => ({ ...n, amount: n.amount * 1.05 + Math.random() * 10 })),
    calories: 390,
  },
];

// Create sample meals
const createMeals = (days: number): Meal[] => {
  const meals: Meal[] = [];
  
  for (let day = 1; day <= days; day++) {
    // Breakfast
    meals.push({
      id: `meal-breakfast-day${day}`,
      name: sampleRecipes[4].name,
      type: 'breakfast',
      recipe: { ...sampleRecipes[4] },
      day,
      isFavorite: false,
    });
    
    // Lunch
    meals.push({
      id: `meal-lunch-day${day}`,
      name: day % 2 === 0 ? sampleRecipes[0].name : sampleRecipes[1].name,
      type: 'lunch',
      recipe: { ...sampleRecipes[day % 2 === 0 ? 0 : 1] },
      day,
      isFavorite: day === 1,
    });
    
    // Dinner
    meals.push({
      id: `meal-dinner-day${day}`,
      name: day % 2 === 0 ? sampleRecipes[2].name : sampleRecipes[5].name,
      type: 'dinner',
      recipe: { ...sampleRecipes[day % 2 === 0 ? 2 : 5] },
      day,
      isFavorite: day === 3,
    });
    
    // Snack
    if (day % 2 === 0) {
      meals.push({
        id: `meal-snack-day${day}`,
        name: sampleRecipes[3].name,
        type: 'snack',
        recipe: { ...sampleRecipes[3] },
        day,
        isFavorite: false,
      });
    }
  }
  
  return meals;
};

// Create a sample meal plan
export const sampleMealPlan: MealPlan = {
  id: 'plan-1',
  meals: createMeals(5),
  createdAt: new Date().toISOString(),
  totalCalories: 1800,
  totalNutrients: sampleNutrients.map(n => ({ 
    ...n, 
    amount: n.amount * 5 + Math.random() * 20 
  })),
};

// Create a sample shopping list from the meal plan
export const createShoppingList = (mealPlan: MealPlan): ShoppingList => {
  const ingredientMap: Record<string, ShoppingItem> = {};
  
  mealPlan.meals.forEach(meal => {
    meal.recipe.ingredients.forEach(ingredient => {
      const key = `${ingredient.name}-${ingredient.unit}`;
      
      if (ingredientMap[key]) {
        // Increment amount if ingredient already exists
        ingredientMap[key].amount += ingredient.amount;
      } else {
        // Add new ingredient
        ingredientMap[key] = {
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          category: ingredient.category,
          checked: false,
        };
      }
    });
  });
  
  // Convert map to array and sort by category
  const items = Object.values(ingredientMap).sort((a, b) => 
    a.category.localeCompare(b.category)
  );
  
  return { items };
};

export const sampleShoppingList = createShoppingList(sampleMealPlan);