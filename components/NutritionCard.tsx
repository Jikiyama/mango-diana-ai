import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { Nutrient } from '@/types/meal-plan';

interface NutritionCardProps {
  calories: number;
  nutrients: Nutrient[];
}

export default function NutritionCard({ calories, nutrients }: NutritionCardProps) {
  // We assume you pass in `calories` = daily total, `nutrients` = daily macros, etc.

  // Separate macros from others if you want
  const protein = nutrients.find(n => n.name.toLowerCase() === 'protein')?.amount || 0;
  const carbs = nutrients.find(n => n.name.toLowerCase() === 'carbs')?.amount || 0;
  const fat = nutrients.find(n => n.name.toLowerCase() === 'fat')?.amount || 0;
  
  return (
    <Card style={styles.card}>
      <View style={styles.calorieContainer}>
        <Text style={styles.calorieValue}>{Math.round(calories)}</Text>
        <Text style={styles.calorieLabel}>Calories (Daily)</Text>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Macronutrients (Daily)</Text>
      <View style={styles.nutrientsGrid}>
        <NutrientItem label="Carbs" amount={Math.round(carbs)} unit="g" color="#2196F3" />
        <NutrientItem label="Protein" amount={Math.round(protein)} unit="g" color="#4CAF50" />
        <NutrientItem label="Fat" amount={Math.round(fat)} unit="g" color="#FF9800" />
      </View>
    </Card>
  );
}

function NutrientItem({ label, amount, unit, color }: 
  { label: string; amount: number; unit: string; color: string }) {
  return (
    <View style={styles.nutrientItem}>
      <Text style={[styles.nutrientValue, { color }]}>{amount}{unit}</Text>
      <Text style={styles.nutrientName}>{label}</Text>
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
    justifyContent: 'space-around',
  },
  nutrientItem: {
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  nutrientName: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
