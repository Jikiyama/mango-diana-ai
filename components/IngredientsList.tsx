import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { Ingredient } from '@/types/meal-plan';

interface IngredientsListProps {
  ingredients: Ingredient[];
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  // Group ingredients by category
  const groupedIngredients: Record<string, Ingredient[]> = {};
  
  ingredients.forEach(ingredient => {
    if (!groupedIngredients[ingredient.category]) {
      groupedIngredients[ingredient.category] = [];
    }
    groupedIngredients[ingredient.category].push(ingredient);
  });

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Ingredients</Text>
      
      {Object.entries(groupedIngredients).map(([category, items]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          
          {items.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text style={styles.ingredientAmount}>
                {ingredient.amount} {ingredient.unit}
              </Text>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  categorySection: {
    marginBottom: SPACING.md,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: SPACING.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  ingredientAmount: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
});