import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Checkbox from '@/components/Checkbox';
import RadioButton from '@/components/RadioButton';
import ProgressBar from '@/components/ProgressBar';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import {
  Cuisine,
  DietaryPreference,
  StrictnessLevel,
} from '@/types/questionnaire';

/* ─────────────────────────────────────────────── */

export default function DietPreferencesStep() {
  const router = useRouter();
  const {
    dietPreferences,
    updateDietPreferences,
    nextStep,
    prevStep,
  } = useQuestionnaireStore();

  /* -------------------- local state -------------------- */
  const [cuisines, setCuisines] = useState<Cuisine[]>(
    dietPreferences.cuisines || []
  );
  const [otherCuisine, setOtherCuisine] = useState(
    dietPreferences.otherCuisine || ''
  );
  const [allergies, setAllergies] = useState<string[]>(
    dietPreferences.allergies || []
  );
  const [newAllergy, setNewAllergy] = useState('');
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>(
    dietPreferences.dietaryPreferences || []
  );
  const [batchCooking, setBatchCooking] = useState(
    dietPreferences.batchCooking || false
  );
  const [strictnessLevel, setStrictnessLevel] = useState<StrictnessLevel>(
    dietPreferences.strictnessLevel || 'moderately_strict'
  );

  /* -------------------- validation -------------------- */
  const [formErrors, setFormErrors] = useState<{ strictness?: string }>({});

  const validate = () => {
    const e: { strictness?: string } = {};
    if (!strictnessLevel) e.strictness = 'Please choose a strictness level.';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  /* -------------------- handlers -------------------- */
  const handleBack = () => {
    prevStep();
    router.back();
  };

  const toggleCuisine = (c: Cuisine) => {
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const toggleDietaryPreference = (pref: DietaryPreference) => {
    setDietaryPrefs((prev) =>
      prev.includes(pref) ? prev.filter((x) => x !== pref) : [...prev, pref]
    );
  };

  const addAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (a: string) => {
    setAllergies(allergies.filter((x) => x !== a));
  };

  const handleNext = () => {
    if (!validate()) return;

    updateDietPreferences({
      cuisines,
      otherCuisine: cuisines.includes('other') ? otherCuisine : '',
      allergies,
      dietaryPreferences: dietaryPrefs,
      batchCooking,
      strictnessLevel,
    });

    nextStep();
    router.push('/questionnaire/step3');
  };

  /* -------------------- render -------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* ---------- header ---------- */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Diet Preferences</Text>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={0.66}
              steps={3}
              currentStep={2}
              showStepIndicator
            />
          </View>
        </View>

        {/* ---------- content ---------- */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Preferred Cuisines */}
          <Text style={styles.sectionTitle}>Preferred Cuisines</Text>
          <Text style={styles.sectionSubtitle}>
            Select the types of cuisine you enjoy (select multiple)
          </Text>

          <View style={styles.cuisineGrid}>
            {(
              [
                'latin',
                'mexican',
                'asian',
                'mediterranean',
                'italian',
                'american',
                'indian',
                'middle_eastern',
                'other',
              ] as Cuisine[]
            ).map((c) => (
              <CuisineOption
                key={c}
                label={c
                  .charAt(0)
                  .toUpperCase()
                  .concat(c.slice(1).replace('_', ' '))}
                selected={cuisines.includes(c)}
                onToggle={() => toggleCuisine(c)}
              />
            ))}
          </View>

          {cuisines.includes('other') && (
            <Input
              placeholder="Specify other cuisine"
              value={otherCuisine}
              onChangeText={setOtherCuisine}
              style={styles.otherCuisineInput}
            />
          )}

          {/* Allergies */}
          <Text style={styles.sectionTitle}>Food Allergies & Restrictions</Text>
          <Text style={styles.sectionSubtitle}>
            Add any food allergies or ingredients you want to avoid
          </Text>

          <View style={styles.allergyInputContainer}>
            <Input
              placeholder="e.g., Peanuts, Shellfish"
              value={newAllergy}
              onChangeText={setNewAllergy}
              style={styles.allergyInput}
            />
            <Button
              title="Add"
              onPress={addAllergy}
              variant="outline"
              size="medium"
              disabled={!newAllergy.trim()}
              style={styles.addButton}
            />
          </View>

          {allergies.length > 0 && (
            <View style={styles.allergiesList}>
              {allergies.map((a) => (
                <View key={a} style={styles.allergyTag}>
                  <Text style={styles.allergyTagText}>{a}</Text>
                  <TouchableOpacity
                    onPress={() => removeAllergy(a)}
                    style={styles.allergyTagRemove}
                  >
                    <Text style={styles.allergyTagRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Dietary Preferences */}
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <Text style={styles.sectionSubtitle}>
            Select any specific diets you follow (select multiple)
          </Text>

          <View style={styles.checkboxGroup}>
            {(
              [
                'keto',
                'vegetarian',
                'vegan',
                'dash',
                'mediterranean',
                'gluten_free',
                'dairy_free',
              ] as DietaryPreference[]
            ).map((p) => (
              <Checkbox
                key={p}
                label={p
                  .replace('_', '-')
                  .replace(/^./, (ch) => ch.toUpperCase())}
                checked={dietaryPrefs.includes(p)}
                onToggle={() => toggleDietaryPreference(p)}
              />
            ))}
          </View>

          {/* Meal planning + strictness */}
          <Text style={styles.sectionTitle}>Meal Planning Preferences</Text>
          <View style={styles.checkboxGroup}>
            <Checkbox
              label="I prefer batch cooking"
              description="Same meal for multiple days to save time"
              checked={batchCooking}
              onToggle={() => setBatchCooking((b) => !b)}
            />
          </View>

          <Text style={styles.sectionSubtitle}>
            How strict do you want your meal plan to be?
          </Text>
          <View style={styles.radioGroup}>
            <RadioButton
              label="Very Strict"
              description="I am ready for immediate significant changes"
              selected={strictnessLevel === 'very_strict'}
              onSelect={() => setStrictnessLevel('very_strict')}
            />
            <RadioButton
              label="Moderately Strict"
              description="I need some flexibility"
              selected={strictnessLevel === 'moderately_strict'}
              onSelect={() => setStrictnessLevel('moderately_strict')}
            />
            <RadioButton
              label="Flexible"
              description="I prefer gradual changes and occasional treats"
              selected={strictnessLevel === 'flexible'}
              onSelect={() => setStrictnessLevel('flexible')}
            />
          </View>

          {/* strictness validation error */}
          {formErrors.strictness && (
            <Text style={styles.errorText}>{formErrors.strictness}</Text>
          )}
        </ScrollView>

        {/* ---------- footer ---------- */}
        <View style={styles.footer}>
          <Button
            title="Next"
            onPress={handleNext}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ───────────────────────── styles ───────────────────────── */

interface CuisineOptionProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

function CuisineOption({ label, selected, onToggle }: CuisineOptionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.cuisineOption,
        selected && styles.selectedCuisineOption,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.cuisineOptionText,
          selected && styles.selectedCuisineOptionText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: SPACING.md,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
    marginBottom: SPACING.md,
  },
  cuisineOption: {
    width: '33.33%',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  cuisineOptionText: {
    textAlign: 'center',
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    color: Colors.text.primary,
  },
  selectedCuisineOption: {
    /* container tweak */
  },
  selectedCuisineOptionText: {
    borderColor: Colors.primary,
    backgroundColor: Colors.highlight,
    color: Colors.primary,
    fontWeight: '600',
  },
  otherCuisineInput: {
    marginTop: SPACING.sm,
  },
  allergyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  allergyInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  addButton: {
    marginTop: 24,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.highlight,
    borderRadius: 16,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  allergyTagText: {
    color: Colors.primary,
    marginRight: SPACING.xs,
  },
  allergyTagRemove: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allergyTagRemoveText: {
    color: Colors.text.primary,
    fontSize: 16,
    lineHeight: 20,
  },
  checkboxGroup: {
    marginBottom: SPACING.md,
  },
  radioGroup: {
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: SPACING.sm,
  },
  footer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
});
