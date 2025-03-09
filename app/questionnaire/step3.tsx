import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import Button from '@/components/Button';
import RadioButton from '@/components/RadioButton';
import ProgressBar from '@/components/ProgressBar';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { HealthGoal } from '@/types/questionnaire';
import { logger } from '@/utils/logger';

export default function GoalSettingsStep() {
  const router = useRouter();
  const { 
    goalSettings, 
    updateGoalSettings, 
    prevStep, 
    completeQuestionnaire 
  } = useQuestionnaireStore();
  
  const [healthGoal, setHealthGoal] = useState<HealthGoal>(
    goalSettings.healthGoal || 'maintenance'
  );
  const [calorieReduction, setCalorieReduction] = useState<'light' | 'moderate' | 'aggressive'>(
    goalSettings.calorieReduction || 'moderate'
  );
  const [mealPlanDays, setMealPlanDays] = useState(goalSettings.mealPlanDays || 5);
  const [mealsPerDay, setMealsPerDay] = useState(goalSettings.mealsPerDay || 3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    logger.info('QUESTIONNAIRE', 'User navigated back from step 3');
    prevStep();
    router.back();
  };

  const handleComplete = () => {
    try {
      logger.info('QUESTIONNAIRE', 'User completed questionnaire');
      setIsSubmitting(true);
      
      // Log the final goal settings
      logger.debug('QUESTIONNAIRE', 'Final goal settings', {
        healthGoal,
        calorieReduction: healthGoal === 'weight_loss' ? calorieReduction : undefined,
        mealPlanDays,
        mealsPerDay
      });
      
      // Save the goal settings to the store
      updateGoalSettings({
        healthGoal,
        calorieReduction: healthGoal === 'weight_loss' ? calorieReduction : undefined,
        mealPlanDays,
        mealsPerDay,
      });
      
      // Mark the questionnaire as complete
      logger.info('QUESTIONNAIRE', 'Marking questionnaire as complete');
      completeQuestionnaire();
      
      // Navigate to the loading screen
      logger.info('QUESTIONNAIRE', 'Navigating to loading screen');
      router.push('/questionnaire/loading');
    } catch (error) {
      logger.error('QUESTIONNAIRE', 'Error in handleComplete', error);
      Alert.alert(
        'Error',
        'There was a problem saving your preferences. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Health Goals</Text>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={1}
            steps={3}
            currentStep={3}
            showStepIndicator
          />
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>What is your primary health goal?</Text>
        
        <View style={styles.radioGroup}>
          <RadioButton
            label="Weight Loss"
            description="Reduce body weight and fat"
            selected={healthGoal === 'weight_loss'}
            onSelect={() => {
              logger.debug('QUESTIONNAIRE', 'User selected health goal: weight_loss');
              setHealthGoal('weight_loss');
            }}
          />
          
          <RadioButton
            label="Muscle Building"
            description="Increase muscle mass and strength"
            selected={healthGoal === 'muscle_building'}
            onSelect={() => {
              logger.debug('QUESTIONNAIRE', 'User selected health goal: muscle_building');
              setHealthGoal('muscle_building');
            }}
          />
          
          <RadioButton
            label="Maintenance / Disease Prevention"
            description="Maintain current weight and improve overall health"
            selected={healthGoal === 'maintenance'}
            onSelect={() => {
              logger.debug('QUESTIONNAIRE', 'User selected health goal: maintenance');
              setHealthGoal('maintenance');
            }}
          />
        </View>
        
        {healthGoal === 'weight_loss' && (
          <>
            <Text style={styles.sectionTitle}>How aggressive do you want your weight loss to be?</Text>
            
            <View style={styles.radioGroup}>
              <RadioButton
                label="Light"
                description="0.5 lb per week (slight calorie deficit)"
                selected={calorieReduction === 'light'}
                onSelect={() => {
                  logger.debug('QUESTIONNAIRE', 'User selected calorie reduction: light');
                  setCalorieReduction('light');
                }}
              />
              
              <RadioButton
                label="Moderate"
                description="1 lb per week (moderate calorie deficit)"
                selected={calorieReduction === 'moderate'}
                onSelect={() => {
                  logger.debug('QUESTIONNAIRE', 'User selected calorie reduction: moderate');
                  setCalorieReduction('moderate');
                }}
              />
              
              <RadioButton
                label="Aggressive"
                description="2 lb per week (significant calorie deficit)"
                selected={calorieReduction === 'aggressive'}
                onSelect={() => {
                  logger.debug('QUESTIONNAIRE', 'User selected calorie reduction: aggressive');
                  setCalorieReduction('aggressive');
                }}
              />
            </View>
          </>
        )}
        
        <Text style={styles.sectionTitle}>How many days do you want your meal plan for?</Text>
        
        <View style={styles.daysSelector}>
          {[3, 5, 7].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.dayOption,
                mealPlanDays === days && styles.selectedDayOption,
              ]}
              onPress={() => {
                logger.debug('QUESTIONNAIRE', `User selected meal plan days: ${days}`);
                setMealPlanDays(days);
              }}
            >
              <Text
                style={[
                  styles.dayOptionText,
                  mealPlanDays === days && styles.selectedDayOptionText,
                ]}
              >
                {days} Days
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>How many meals per day?</Text>
        
        <View style={styles.mealsSelector}>
          {[3, 4, 5].map((meals) => (
            <TouchableOpacity
              key={meals}
              style={[
                styles.mealOption,
                mealsPerDay === meals && styles.selectedMealOption,
              ]}
              onPress={() => {
                logger.debug('QUESTIONNAIRE', `User selected meals per day: ${meals}`);
                setMealsPerDay(meals);
              }}
            >
              <Text
                style={[
                  styles.mealOptionText,
                  mealsPerDay === meals && styles.selectedMealOptionText,
                ]}
              >
                {meals === 3 ? '3 (no snacks)' : 
                 meals === 4 ? '4 (with 1 snack)' : 
                 '5 (with 2 snacks)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="Create My Meal Plan" 
          onPress={handleComplete} 
          variant="primary"
          size="large"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: SPACING.lg,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  radioGroup: {
    marginBottom: SPACING.lg,
  },
  daysSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  dayOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedDayOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.highlight,
  },
  dayOptionText: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedDayOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  mealsSelector: {
    marginBottom: SPACING.xl,
  },
  mealOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  selectedMealOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.highlight,
  },
  mealOptionText: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedMealOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
});