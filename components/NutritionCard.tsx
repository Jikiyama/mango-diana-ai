import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { Nutrient } from '@/types/meal-plan';

interface NutritionCardProps {
  nutrients: Nutrient[];
  calories: number;
}

export default function NutritionCard({ nutrients, calories }: NutritionCardProps) {
  // Group nutrients by type
  const macronutrients = nutrients.filter(n => 
    ['Protein', 'Carbs', 'Fat'].includes(n.name)
  );
  
  const vitamins = nutrients.filter(n => 
    n.name.includes('Vitamin')
  );
  
  const minerals = nutrients.filter(n => 
    ['Calcium', 'Iron', 'Magnesium', 'Potassium', 'Sodium', 'Zinc'].includes(n.name)
  );
  
  const others = nutrients.filter(n => 
    !macronutrients.includes(n) && !vitamins.includes(n) && !minerals.includes(n)
  );

  return (
    <Card style={styles.card}>
      <View style={styles.calorieContainer}>
        <Text style={styles.calorieValue}>{calories}</Text>
        <Text style={styles.calorieLabel}>Calories</Text>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Macronutrients</Text>
      <View style={styles.nutrientsGrid}>
        {macronutrients.map((nutrient, index) => (
          <NutrientItem key={index} nutrient={nutrient} />
        ))}
      </View>
      
      {minerals.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Minerals</Text>
          <View style={styles.nutrientsGrid}>
            {minerals.map((nutrient, index) => (
              <NutrientItem key={index} nutrient={nutrient} />
            ))}
          </View>
        </>
      )}
      
      {vitamins.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Vitamins</Text>
          <View style={styles.nutrientsGrid}>
            {vitamins.map((nutrient, index) => (
              <NutrientItem key={index} nutrient={nutrient} />
            ))}
          </View>
        </>
      )}
      
      {others.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Others</Text>
          <View style={styles.nutrientsGrid}>
            {others.map((nutrient, index) => (
              <NutrientItem key={index} nutrient={nutrient} />
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

function NutrientItem({ nutrient }: { nutrient: Nutrient }) {
  return (
    <View style={styles.nutrientItem}>
      <Text style={styles.nutrientValue}>
        {Math.round(nutrient.amount)} {nutrient.unit}
      </Text>
      <Text style={styles.nutrientName}>{nutrient.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  calorieContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  calorieLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  nutrientItem: {
    width: '33.33%',
    marginBottom: SPACING.sm,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  nutrientName: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});