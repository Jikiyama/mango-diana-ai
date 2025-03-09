import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Colors from '@/constants/colors';
import { BORDER_RADIUS, SPACING } from '@/constants/theme';

interface RecipeStepsProps {
  instructions: string[];
  prepTime: number;
  cookTime: number;
}

export default function RecipeSteps({ 
  instructions, 
  prepTime, 
  cookTime 
}: RecipeStepsProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Text style={styles.timeValue}>{prepTime}</Text>
          <Text style={styles.timeLabel}>Prep Time (min)</Text>
        </View>
        
        <View style={styles.timeItem}>
          <Text style={styles.timeValue}>{cookTime}</Text>
          <Text style={styles.timeLabel}>Cook Time (min)</Text>
        </View>
        
        <View style={styles.timeItem}>
          <Text style={styles.timeValue}>{prepTime + cookTime}</Text>
          <Text style={styles.timeLabel}>Total Time (min)</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Instructions</Text>
      
      {instructions.map((instruction, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{instruction}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
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
    marginBottom: SPACING.md,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
});