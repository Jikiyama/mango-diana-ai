import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useMealPlanStore } from '@/store/meal-plan-store';

export default function RecipesScreen() {
  const router = useRouter();
  const { currentPlan } = useMealPlanStore();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
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
          <Text style={styles.title}>Recipes</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Meal Plan Found</Text>
          <Text style={styles.emptyDescription}>
            Generate a meal plan to view recipes
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Get all unique days
  const days = Array.from(
    new Set(currentPlan.meals.map(meal => meal.day))
  ).sort((a, b) => a - b);
  
  // Filter meals by selected day
  const filteredMeals = selectedDay 
    ? currentPlan.meals.filter(meal => meal.day === selectedDay)
    : currentPlan.meals;
  
  // Group meals by day
  const mealsByDay = days.map(day => ({
    day,
    meals: currentPlan.meals.filter(meal => meal.day === day)
  }));
  
  // Convert day number to day name
  const getDayName = (day: number) => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return dayNames[day - 1] || `Day ${day}`;
  };
  
  const handleMealPress = (mealId: string) => {
    router.push(`/meal-details/${mealId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Recipes</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>All Recipes by Day</Text>
        
        {mealsByDay.map(({ day, meals }) => (
          <Card key={day} style={styles.dayCard}>
            <Text style={styles.dayTitle}>{getDayName(day)}</Text>
            
            {meals.sort((a, b) => {
              const mealOrder = { breakfast: 1, lunch: 2, snack: 3, dinner: 4 };
              return mealOrder[a.type] - mealOrder[b.type];
            }).map(meal => (
              <TouchableOpacity 
                key={meal.id} 
                style={styles.mealItem}
                onPress={() => handleMealPress(meal.id)}
              >
                <View style={styles.mealInfo}>
                  <Text style={styles.mealType}>
                    {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                  </Text>
                  <Text style={styles.mealName}>{meal.name}</Text>
                </View>
                <ChevronRight size={20} color={Colors.text.muted} />
              </TouchableOpacity>
            ))}
          </Card>
        ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  dayCard: {
    marginBottom: SPACING.md,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: SPACING.md,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 16,
    color: Colors.text.primary,
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