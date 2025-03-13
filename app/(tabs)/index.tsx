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
  const [selectedDay, setSelectedDay] = useState<number | null>(1);
  
  // If questionnaire is not complete, prompt user
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
    // Filter by selected day (which is always set)
    if (meal.day !== selectedDay) {
      return false;
    }
    // Filter by meal type if not "all"
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
    router.push(`/nutrition-info?day=${selectedDay}`);
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
      
      <View style={styles.navigationContainer}>
        {/* Horizontal scroll for days */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.daysContainer}
          contentContainerStyle={styles.daysContent}
          removeClippedSubviews={false}
        >
          {days.map(day => {
            const dayNames = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];
            const dayName = dayNames[day-1] || `Day ${day}`;
            
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
      </View>
      
      <View style={styles.tabBarContainer}>
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
      </View>
      
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
  navigationContainer: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  daysContainer: {
    height: 42,
    marginBottom: 8,
  },
  daysContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
    flexDirection: 'row',
  },
  dayButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    backgroundColor: Colors.card,
    marginRight: SPACING.sm,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  selectedDayButton: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    color: Colors.text.primary,
    fontSize: 14,
    textAlign: 'center',
  },
  selectedDayButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  mealsList: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
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
  tabBarContainer: {
    height: 46,
    justifyContent: 'center',
    zIndex: 10,
  },
});
