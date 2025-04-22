import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Heart, Clock, Share } from 'lucide-react-native';
import TabBar from '@/components/TabBar';
import NutritionCard from '@/components/NutritionCard';
import IngredientsList from '@/components/IngredientsList';
import RecipeSteps from '@/components/RecipeSteps';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useMealPlanStore } from '@/store/meal-plan-store';

// Import meal type images
const mealImages = {
  breakfast: require('@/assets/images/breakfast.png'),
  lunch: require('@/assets/images/lunch.png'),
  dinner: require('@/assets/images/dinner.png'),
  snack: require('@/assets/images/snack.png'),
};

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { currentPlan, toggleFavoriteMeal } = useMealPlanStore();
  const [activeTab, setActiveTab] = useState('recipe');
  
  // Find the meal in the current plan
  const meal = currentPlan?.meals.find(m => m.id === id);
  
  if (!meal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Meal Not Found</Text>
          <Text style={styles.emptyDescription}>
            The meal you're looking for doesn't exist or has been removed
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleFavoriteToggle = () => {
    toggleFavoriteMeal(meal.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.imageContainer}>
        <Image 
          source={mealImages[meal.type]} 
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={styles.imageOverlay}>
          <View style={styles.mealTypeContainer}>
            <Text style={styles.mealType}>
              {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} • Day {meal.day}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleFavoriteToggle}
            >
              <Heart 
                size={24} 
                color="#fff" 
                fill={meal.isFavorite ? '#fff' : 'transparent'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Share size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{meal.name}</Text>
          
          <View style={styles.timeInfo}>
            <Clock size={16} color={Colors.text.secondary} />
            <Text style={styles.timeText}>
              {meal.recipe.prepTime + meal.recipe.cookTime} min
            </Text>
          </View>
        </View>
        
        <TabBar
          tabs={[
            { key: 'recipe', title: 'Recipe' },
            { key: 'nutrition', title: 'Nutrition' },
            { key: 'ingredients', title: 'Ingredients' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'recipe' && (
            <RecipeSteps
              instructions={meal.recipe.instructions}
              prepTime={meal.recipe.prepTime}
              cookTime={meal.recipe.cookTime}
            />
          )}
          
          {activeTab === 'nutrition' && (
            <NutritionCard
              nutrients={meal.recipe.nutrients}
              calories={meal.recipe.calories}
            />
          )}
          
          {activeTab === 'ingredients' && (
            <IngredientsList
              ingredients={meal.recipe.ingredients}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  mealTypeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
  },
  mealType: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    backgroundColor: Colors.background,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});