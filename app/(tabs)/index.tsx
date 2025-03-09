import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Calendar, Filter, Info } from 'lucide-react-native';
import MealCard from '@/components/MealCard';
import TabBar from '@/components/TabBar';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useMealPlanStore } from '@/store/meal-plan-store';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { Meal } from '@/types/meal-plan';

export default function MealPlanScreen() {
  const router = useRouter();
  const { currentPlan, toggleFavoriteMeal } = useMealPlanStore();
  const { isComplete } = useQuestionnaireStore();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // If questionnaire is not complete, render a prompt instead
  if (!isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Complete Your Profile</Text>
          <Text style={styles.emptyDescription}>
            Please complete the questionnaire to generate your personalized meal plan
          </Text>
          <Button
            title="Go to Questionnaire"
            onPress={() => router.push('/questionnaire')}
            variant="primary"
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  if (!currentPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Meal Plan Found</Text>
          <Text style={styles.emptyDescription}>
            Complete the questionnaire to generate your personalized meal plan
          </Text>
          <Button
            title="Go to Questionnaire"
            onPress={() => router.push('/questionnaire')}
            variant="primary"
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const days = Array.from(
    new Set(currentPlan.meals.map(meal => meal.day))
  ).sort((a, b) => a - b);
  
  const filteredMeals = currentPlan.meals.filter(meal => {
    if (selectedDay !== null && meal.day !== selectedDay) {
      return false;
    }
    
    if (activeTab === 'all') {
      return true;
    }
    
    return meal.type === activeTab;
  });
  
  const handleMealPress = (mealId: string) => {
    router.push(`/meal-details/${mealId}`);
  };
  
  const handleFavoriteToggle = (mealId: string) => {
    toggleFavoriteMeal(mealId);
  };
  
  const handleNutritionInfoPress = () => {
    router.push('/nutrition-info');
  };
  
  const renderMealItem = ({ item }: { item: Meal }) => (
    <MealCard
      meal={item}
      onPress={() => handleMealPress(item.id)}
      onFavoriteToggle={() => handleFavoriteToggle(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Your Meal Plan</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleNutritionInfoPress}
          >
            <Info size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Calendar size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.daysContainer}
        contentContainerStyle={styles.daysContent}
      >
        <TouchableOpacity
          style={[
            styles.dayButton,
            selectedDay === null && styles.selectedDayButton,
          ]}
          onPress={() => setSelectedDay(null)}
        >
          <Text
            style={[
              styles.dayButtonText,
              selectedDay === null && styles.selectedDayButtonText,
            ]}
          >
            All Days
          </Text>
        </TouchableOpacity>
        
        {days.map(day => {
          // Convert day number to day name (1 = Monday, 2 = Tuesday, etc.)
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const dayName = dayNames[day - 1] || `Day ${day}`;
          
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDay === day && styles.selectedDayButton,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDay === day && styles.selectedDayButtonText,
                ]}
              >
                {dayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <TabBar
        tabs={[
          { key: 'all', title: 'All Meals' },
          { key: 'breakfast', title: 'Breakfast' },
          { key: 'lunch', title: 'Lunch' },
          { key: 'dinner', title: 'Dinner' },
          { key: 'snack', title: 'Snacks' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scrollable
      />
      
      <FlatList
        data={filteredMeals}
        renderItem={renderMealItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.mealsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              No meals found for the selected filters
            </Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
  },
  daysContainer: {
    maxHeight: 50,
  },
  daysContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  dayButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    backgroundColor: Colors.card,
    marginRight: SPACING.sm,
  },
  selectedDayButton: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    color: Colors.text.primary,
  },
  selectedDayButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  mealsList: {
    padding: SPACING.lg,
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
  emptyListContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});