// app/questionnaire/step3.tsx
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
import { ActivityLevel, HealthGoal } from '@/types/questionnaire';
import { logger } from '@/utils/logger';

export default function GoalSettingsStep() {
  const router = useRouter();
  const {
    goalSettings,
    updateGoalSettings,
    prevStep,
  } = useQuestionnaireStore();

  /* ---------- state ---------- */
  const [healthGoal, setHealthGoal] = useState<HealthGoal>(
    goalSettings.healthGoal ?? 'maintenance'
  );
  const [calorieReduction, setCalorieReduction] = useState<
    'light' | 'moderate' | 'aggressive'
  >(goalSettings.calorieReduction ?? 'moderate');
  const [mealPlanDays, setMealPlanDays] = useState<3 | 5 | 7>(
    (goalSettings.mealPlanDays as 3 | 5 | 7) ?? 5
  );
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4 | 5>(
    (goalSettings.mealsPerDay as 3 | 4 | 5) ?? 3
  );
  /* NEW: activity level */
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    goalSettings.activityLevel ?? 'sedentary'
  );
  const [errors, setErrors] = useState<{ activity?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const validate = () => {
    const e: { activity?: string } = {};
    if (!activityLevel) e.activity = 'Please select your activity level.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleComplete = () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      updateGoalSettings({
        healthGoal,
        calorieReduction: healthGoal === 'weight_loss' ? calorieReduction : undefined,
        mealPlanDays,
        mealsPerDay,
        activityLevel,
      });

      router.push('/questionnaire/loading');
    } catch (error) {
      logger.error('QUESTIONNAIRE', 'Error in handleComplete', error);
      Alert.alert('Error', 'There was a problem saving your preferences.');
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
          <ProgressBar progress={1} steps={3} currentStep={3} showStepIndicator />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ───────── Primary goal ───────── */}
        <Text style={styles.sectionTitle}>What is your primary health goal?</Text>

        <View style={styles.radioGroup}>
          <RadioButton
            label="Weight Loss"
            description="Reduce body weight and fat"
            selected={healthGoal === 'weight_loss'}
            onSelect={() => setHealthGoal('weight_loss')}
          />
          <RadioButton
            label="Muscle Building"
            description="Increase muscle mass and strength"
            selected={healthGoal === 'muscle_building'}
            onSelect={() => setHealthGoal('muscle_building')}
          />
          <RadioButton
            label="Maintenance / Disease Prevention"
            description="Maintain current weight and improve overall health"
            selected={healthGoal === 'maintenance'}
            onSelect={() => setHealthGoal('maintenance')}
          />
        </View>

        {/* ───────── Calorie reduction (conditional) ───────── */}
        {healthGoal === 'weight_loss' && (
          <>
            <Text style={styles.sectionTitle}>
              How aggressive do you want your weight loss to be?
            </Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="Light (≈ 0.5 lb / week)"
                selected={calorieReduction === 'light'}
                onSelect={() => setCalorieReduction('light')}
              />
              <RadioButton
                label="Moderate (≈ 1 lb / week)"
                selected={calorieReduction === 'moderate'}
                onSelect={() => setCalorieReduction('moderate')}
              />
              <RadioButton
                label="Aggressive (≈ 2 lb / week)"
                selected={calorieReduction === 'aggressive'}
                onSelect={() => setCalorieReduction('aggressive')}
              />
            </View>
          </>
        )}

        {/* ───────── NEW: Activity level ───────── */}
        <Text style={styles.sectionTitle}>What is your activity level?</Text>
        <View style={styles.radioGroup}>
          <RadioButton
            label="Sedentary (little or no exercise)"
            selected={activityLevel === 'sedentary'}
            onSelect={() => setActivityLevel('sedentary')}
          />
          <RadioButton
            label="Lightly Active (1–3 sessions / week)"
            selected={activityLevel === 'lightly_active'}
            onSelect={() => setActivityLevel('lightly_active')}
          />
          <RadioButton
            label="Moderately Active (3–5 sessions / week)"
            selected={activityLevel === 'moderately_active'}
            onSelect={() => setActivityLevel('moderately_active')}
          />
          <RadioButton
            label="Very Active (6–7 sessions / week or physical job)"
            selected={activityLevel === 'very_active'}
            onSelect={() => setActivityLevel('very_active')}
          />
          <RadioButton
            label="Athlete / Two‑a‑day training"
            selected={activityLevel === 'athlete'}
            onSelect={() => setActivityLevel('athlete')}
          />
        </View>
        {errors.activity && (
          <Text style={styles.errorText}>{errors.activity}</Text>
        )}

        {/* ───────── Plan parameters ───────── */}
        <Text style={styles.sectionTitle}>
          How many days do you want your meal plan for?
        </Text>
        <View style={styles.daysSelector}>
          {[3, 5, 7].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.dayOption,
                mealPlanDays === days && styles.selectedDayOption,
              ]}
              onPress={() => setMealPlanDays(days as 3 | 5 | 7)}
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
              onPress={() => setMealsPerDay(meals as 3 | 4 | 5)}
            >
              <Text
                style={[
                  styles.mealOptionText,
                  mealsPerDay === meals && styles.selectedMealOptionText,
                ]}
              >
                {meals === 3
                  ? '3 (no snacks)'
                  : meals === 4
                  ? '4 (1 snack)'
                  : '5 (2 snacks)'}
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

/* ---------- styles (only additions shown) ---------- */
const styles = StyleSheet.create({
  /* existing styles … */
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: SPACING.sm,
  },
});
