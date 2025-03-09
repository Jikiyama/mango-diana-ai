import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Heart } from 'lucide-react-native';
import Card from './Card';
import Colors from '@/constants/colors';
import { BORDER_RADIUS, SPACING } from '@/constants/theme';
import { Meal } from '@/types/meal-plan';

interface MealCardProps {
  meal: Meal;
  onPress: () => void;
  onFavoriteToggle: () => void;
}

export default function MealCard({ meal, onPress, onFavoriteToggle }: MealCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={styles.card} elevation="medium">
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: meal.recipe.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={onFavoriteToggle}
          >
            <Heart 
              size={22} 
              color={meal.isFavorite ? Colors.error : '#fff'} 
              fill={meal.isFavorite ? Colors.error : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.mealType}>
            {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} • Day {meal.day}
          </Text>
          <Text style={styles.title} numberOfLines={2}>{meal.name}</Text>
          
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{meal.recipe.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            
            {meal.recipe.nutrients.slice(0, 3).map((nutrient, index) => (
              <View key={index} style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(nutrient.amount)}
                </Text>
                <Text style={styles.nutritionLabel}>{nutrient.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
  },
  mealType: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});