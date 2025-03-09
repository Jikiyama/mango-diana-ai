import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import MealCard from '@/components/MealCard';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useMealPlanStore } from '@/store/meal-plan-store';
import { Meal } from '@/types/meal-plan';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteMeals, removeFromFavorites } = useMealPlanStore();
  
  const handleMealPress = (mealId: string) => {
    router.push(`/meal-details/${mealId}`);
  };
  
  const handleFavoriteToggle = (mealId: string) => {
    removeFromFavorites(mealId);
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
        <Text style={styles.title}>Favorite Meals</Text>
      </View>
      
      <FlatList
        data={favoriteMeals}
        renderItem={renderMealItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.mealsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyDescription}>
              Heart your favorite meals to save them here for easy access
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  mealsList: {
    padding: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xxl,
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