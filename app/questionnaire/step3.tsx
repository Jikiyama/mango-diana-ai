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

/* add a local union – update your types later if you want strict typing */
type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'athletic';

export default function GoalSettingsStep() {
  const router = useRouter();
  const { goalSettings, updateGoalSettings, prevStep } =
    useQuestionnaireStore();

  const [healthGoal, setHealthGoal] = useState<HealthGoal>(
    goalSettings.healthGoal || 'maintenance',
  );
  const [calorieReduction, setCalorieReduction] = useState<
    'light' | 'moderate' | 'aggressive'
  >(goalSettings.calorieReduction || 'moderate');
  const [mealPlanDays, setMealPlanDays] = useState(goalSettings.mealPlanDays || 5);
  const [mealsPerDay, setMealsPerDay] = useState(goalSettings.mealsPerDay || 3);

  /* NEW – physical activity level (required) */
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>(
    goalSettings.activityLevel as ActivityLevel | undefined,
  );

  const [submitting, setSubmitting] = useState(false);

  /* ---------- helpers ---------- */
  const handleComplete = () => {
    if (!activityLevel) {
      Alert.alert('Missing info', 'Please select your physical activity level.');
      return;
    }

    setSubmitting(true);

    updateGoalSettings({
      healthGoal,
      calorieReduction: healthGoal === 'weight_loss' ? calorieReduction : undefined,
      mealPlanDays,
      mealsPerDay,
      activityLevel, // <- new prop
    });

    router.push('/questionnaire/loading');
  };

  /* ---------- ui ---------- */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { prevStep(); router.back(); }}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Health Goals</Text>

        <ProgressBar progress={1} steps={3} currentStep={3} showStepIndicator />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* goal */}
        <Text style={styles.sectionTitle}>Your primary goal</Text>
        <RadioButton
          label="Weight Loss"
          description="Reduce body fat"
          selected={healthGoal === 'weight_loss'}
          onSelect={() => setHealthGoal('weight_loss')}
        />
        <RadioButton
          label="Muscle Building"
          description="Increase lean mass"
          selected={healthGoal === 'muscle_building'}
          onSelect={() => setHealthGoal('muscle_building')}
        />
        <RadioButton
          label="Maintenance / Prevention"
          description="Maintain weight & improve health"
          selected={healthGoal === 'maintenance'}
          onSelect={() => setHealthGoal('maintenance')}
        />

        {/* weight‑loss intensity */}
        {healthGoal === 'weight_loss' && (
          <>
            <Text style={styles.sectionTitle}>Weight‑loss pace</Text>
            <RadioButton
              label="Light (½ lb / week)"
              selected={calorieReduction === 'light'}
              onSelect={() => setCalorieReduction('light')}
            />
            <RadioButton
              label="Moderate (1 lb / week)"
              selected={calorieReduction === 'moderate'}
              onSelect={() => setCalorieReduction('moderate')}
            />
            <RadioButton
              label="Aggressive (2 lb / week)"
              selected={calorieReduction === 'aggressive'}
              onSelect={() => setCalorieReduction('aggressive')}
            />
          </>
        )}

        {/* plan length */}
        <Text style={styles.sectionTitle}>Plan length</Text>
        <View style={styles.chipRow}>
          {[3, 5, 7].map((d) => (
            <Chip
              key={d}
              active={mealPlanDays === d}
              label={`${d} days`}
              onPress={() => setMealPlanDays(d)}
            />
          ))}
        </View>

        {/* meals / day */}
        <Text style={styles.sectionTitle}>Meals per day</Text>
        <View style={styles.chipRow}>
          {[3, 4, 5].map((m) => (
            <Chip
              key={m}
              active={mealsPerDay === m}
              label={`${m}`}
              onPress={() => setMealsPerDay(m)}
            />
          ))}
        </View>

        {/* ───── NEW REQUIRED QUESTION ───── */}
        <Text style={styles.sectionTitle}>Physical activity level *</Text>
        <RadioButton
          label="Sedentary (little or no exercise)"
          selected={activityLevel === 'sedentary'}
          onSelect={() => setActivityLevel('sedentary')}
        />
        <RadioButton
          label="Lightly active (1‑3 days / wk)"
          selected={activityLevel === 'lightly_active'}
          onSelect={() => setActivityLevel('lightly_active')}
        />
        <RadioButton
          label="Moderately active (3‑5 days / wk)"
          selected={activityLevel === 'moderately_active'}
          onSelect={() => setActivityLevel('moderately_active')}
        />
        <RadioButton
          label="Very active (6‑7 days / wk)"
          selected={activityLevel === 'very_active'}
          onSelect={() => setActivityLevel('very_active')}
        />
        <RadioButton
          label="Athletic / training twice daily"
          selected={activityLevel === 'athletic'}
          onSelect={() => setActivityLevel('athletic')}
        />
      </ScrollView>

      {/* footer */}
      <View style={styles.footer}>
        <Button
          title="Create My Meal Plan"
          variant="primary"
          fullWidth
          onPress={handleComplete}
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </SafeAreaView>
  );
}

/* -------- small reusable chip -------- */
const Chip = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      chipStyles.base,
      active && { backgroundColor: Colors.highlight, borderColor: Colors.primary },
    ]}>
    <Text
      style={[
        chipStyles.text,
        active && { color: Colors.primary, fontWeight: '600' },
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const chipStyles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  text: { color: Colors.text.primary },
});

/* -------- main stylesheet -------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: SPACING.lg },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: SPACING.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm },
  footer: { padding: SPACING.lg },
});
