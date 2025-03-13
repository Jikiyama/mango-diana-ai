import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useMealPlanStore } from '@/store/meal-plan-store';

export default function NutritionInfoScreen() {
  const router = useRouter();
  const { currentPlan } = useMealPlanStore();
  const params = useLocalSearchParams();
  
  const handleBack = () => {
    router.back();
  };
  
  if (!currentPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Nutritional Information</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Meal Plan Found</Text>
          <Text style={styles.emptyDescription}>
            Generate a meal plan to view nutritional information
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Get the selected day from the params or default to the current selected day in the app
  const selectedDay = params.day ? parseInt(params.day as string, 10) : 1;
  
  // Filter meals for the selected day
  const dayMeals = currentPlan.meals.filter(meal => meal.day === selectedDay);
  
  // Calculate totals for the selected day
  const dayTotalCalories = dayMeals.reduce((total, meal) => total + meal.recipe.calories, 0);
  
  // Calculate macronutrients for the selected day
  const proteinTotal = dayMeals.reduce((total, meal) => {
    const protein = meal.recipe.nutrients.find(n => n.name === 'Protein');
    return total + (protein ? protein.amount : 0);
  }, 0);
  
  const carbsTotal = dayMeals.reduce((total, meal) => {
    const carbs = meal.recipe.nutrients.find(n => n.name === 'Carbs');
    return total + (carbs ? carbs.amount : 0);
  }, 0);
  
  const fatTotal = dayMeals.reduce((total, meal) => {
    const fat = meal.recipe.nutrients.find(n => n.name === 'Fat');
    return total + (fat ? fat.amount : 0);
  }, 0);
  
  // Calculate macronutrient percentages
  const totalMacroCalories = (proteinTotal * 4) + (carbsTotal * 4) + (fatTotal * 9);
  const proteinPercentage = Math.round((proteinTotal * 4 / totalMacroCalories) * 100) || 0;
  const carbsPercentage = Math.round((carbsTotal * 4 / totalMacroCalories) * 100) || 0;
  const fatPercentage = Math.round((fatTotal * 9 / totalMacroCalories) * 100) || 0;
  
  // Get meal specific calories
  const mealTypeCalories = {
    breakfast: dayMeals
      .filter(meal => meal.type === 'breakfast')
      .reduce((total, meal) => total + meal.recipe.calories, 0),
    lunch: dayMeals
      .filter(meal => meal.type === 'lunch')
      .reduce((total, meal) => total + meal.recipe.calories, 0),
    dinner: dayMeals
      .filter(meal => meal.type === 'dinner')
      .reduce((total, meal) => total + meal.recipe.calories, 0),
    snack: dayMeals
      .filter(meal => meal.type === 'snack')
      .reduce((total, meal) => total + meal.recipe.calories, 0),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Day {selectedDay} Nutrition</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.calorieCard}>
          <Text style={styles.sectionTitle}>Daily Calories</Text>
          <View style={styles.calorieContainer}>
            <Text style={styles.calorieValue}>{dayTotalCalories}</Text>
            <Text style={styles.calorieLabel}>calories total</Text>
          </View>
        </Card>
        
        <Text style={styles.sectionHeader}>Macronutrient Distribution</Text>
        
        <Card style={styles.macroCard}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroTitle}>Protein</Text>
            <Text style={styles.macroPercentage}>{proteinPercentage}%</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${proteinPercentage}%`, backgroundColor: '#4CAF50' }
              ]} 
            />
          </View>
          
          <Text style={styles.macroDetail}>
            {Math.round(proteinTotal)}g total ({Math.round(proteinTotal * 4)} calories)
          </Text>
          <Text style={styles.macroDescription}>
            Protein is essential for muscle repair and growth, and helps you feel full longer.
          </Text>
        </Card>
        
        <Card style={styles.macroCard}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroTitle}>Carbohydrates</Text>
            <Text style={styles.macroPercentage}>{carbsPercentage}%</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${carbsPercentage}%`, backgroundColor: '#2196F3' }
              ]} 
            />
          </View>
          
          <Text style={styles.macroDetail}>
            {Math.round(carbsTotal)}g total ({Math.round(carbsTotal * 4)} calories)
          </Text>
          <Text style={styles.macroDescription}>
            Carbohydrates are your body's main source of energy, fueling both physical activity and brain function.
          </Text>
        </Card>
        
        <Card style={styles.macroCard}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroTitle}>Fats</Text>
            <Text style={styles.macroPercentage}>{fatPercentage}%</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${fatPercentage}%`, backgroundColor: '#FF9800' }
              ]} 
            />
          </View>
          
          <Text style={styles.macroDetail}>
            {Math.round(fatTotal)}g total ({Math.round(fatTotal * 9)} calories)
          </Text>
          <Text style={styles.macroDescription}>
            Healthy fats are essential for hormone production, vitamin absorption, and brain health.
          </Text>
        </Card>
        
        <Text style={styles.sectionHeader}>Meal Breakdown</Text>
        
        <Card style={styles.mealsCard}>
          {mealTypeCalories.breakfast > 0 && (
            <View style={styles.mealRow}>
              <Text style={styles.mealType}>Breakfast</Text>
              <Text style={styles.mealCalories}>{mealTypeCalories.breakfast} calories</Text>
            </View>
          )}
          
          {mealTypeCalories.lunch > 0 && (
            <View style={styles.mealRow}>
              <Text style={styles.mealType}>Lunch</Text>
              <Text style={styles.mealCalories}>{mealTypeCalories.lunch} calories</Text>
            </View>
          )}
          
          {mealTypeCalories.dinner > 0 && (
            <View style={styles.mealRow}>
              <Text style={styles.mealType}>Dinner</Text>
              <Text style={styles.mealCalories}>{mealTypeCalories.dinner} calories</Text>
            </View>
          )}
          
          {mealTypeCalories.snack > 0 && (
            <View style={styles.mealRow}>
              <Text style={styles.mealType}>Snacks</Text>
              <Text style={styles.mealCalories}>{mealTypeCalories.snack} calories</Text>
            </View>
          )}
        </Card>
        
        <Text style={styles.nutritionNote}>
          This nutrition information is calculated based on the meals in your plan for Day {selectedDay}.
          Values are approximations based on the recipe data.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  calorieCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  calorieContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  calorieLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  macroCard: {
    marginBottom: SPACING.md,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  macroPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroDetail: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  macroDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  mealsCard: {
    marginBottom: SPACING.lg,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mealType: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  nutritionNote: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 20,
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