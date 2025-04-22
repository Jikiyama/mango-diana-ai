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
import ProgressBar from '@/components/ProgressBar';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { MedicalCondition } from '@/types/questionnaire';

export default function PersonalInfoStep() {
  const router = useRouter();
  const { personalInfo, updatePersonalInfo, nextStep } =
    useQuestionnaireStore();

  /* ─────────────── component state ─────────────── */
  const [age, setAge] = useState(personalInfo.age?.toString() || '');
  const [weight, setWeight] = useState(personalInfo.weight?.toString() || '');
  const [height, setHeight] = useState(personalInfo.height?.toString() || '');
  const [zipCode, setZipCode] = useState(personalInfo.zipCode || '');
  const [gender, setGender] = useState<
    'male' | 'female' | 'other' | undefined
  >(personalInfo.gender);
  const [medicalConditions, setMedicalConditions] = useState<
    MedicalCondition[]
  >(personalInfo.medicalConditions || []);
  const [hba1c, setHba1c] = useState(personalInfo.hba1c?.toString() || '');

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(
    personalInfo.weightUnit || 'kg',
  );
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>(
    personalInfo.heightUnit || 'cm',
  );

  /* form‑level validation errors (rename avoids the crash) */
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ─────────────── helpers ─────────────── */
  const hasDiabetes = medicalConditions.includes('diabetes');

  const toggleMedicalCondition = (condition: MedicalCondition) => {
    const update = new Set(medicalConditions);
    if (condition === 'none') {
      update.clear();
      update.add('none');
    } else {
      update.delete('none');
      update.has(condition) ? update.delete(condition) : update.add(condition);
      if (update.size === 0) update.add('none');
    }
    setMedicalConditions(Array.from(update));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const a = parseInt(age || '0', 10);
    const w = parseInt(weight || '0', 10);
    const h = parseInt(height || '0', 10);

    if (!age) e.age = 'Age is required';
    else if (a < 18 || a > 100) e.age = 'Age must be 18‑100';

    if (!weight) e.weight = 'Weight is required';
    else if (w < 30 || w > 500)
      e.weight = 'Weight must be between 30‑500 ' + weightUnit;

    if (!height) e.height = 'Height is required';
    else if (h < 50 || h > 300)
      e.height = 'Height must be between 50‑300 ' + heightUnit;

    if (!gender) e.gender = 'Select gender';

    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    updatePersonalInfo({
      age: parseInt(age, 10),
      weight: parseInt(weight, 10),
      height: parseInt(height, 10),
      gender,
      zipCode,
      medicalConditions,
      hba1c: hba1c ? parseFloat(hba1c) : undefined,
      weightUnit,
      heightUnit,
    });

    nextStep();
    router.push('/questionnaire/step2');
  };

  /* ─────────────── render ─────────────── */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* ───── header ───── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Personal Information</Text>

          <ProgressBar
            progress={0.33}
            steps={3}
            currentStep={1}
            showStepIndicator
          />
        </View>

        {/* ───── form ───── */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Basic Details</Text>

          {/* age / weight */}
          <View style={styles.row}>
            <Input
              label="Age"
              placeholder="Years"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              error={formErrors.age}
            />

            <Input
              label={`Weight (${weightUnit})`}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              error={formErrors.weight}
            />

            {/* tiny unit switch */}
            <View style={styles.unitSwitch}>
              {(['kg', 'lbs'] as const).map((u) => (
                <UnitChip
                  key={u}
                  active={weightUnit === u}
                  label={u}
                  onPress={() => setWeightUnit(u)}
                />
              ))}
            </View>
          </View>

          {/* height / zip */}
          <View style={styles.row}>
            <Input
              label={`Height (${heightUnit})`}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              error={formErrors.height}
            />

            <Input
              label="Zip Code (optional)"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
            />

            <View style={styles.unitSwitch}>
              {(['cm', 'in'] as const).map((u) => (
                <UnitChip
                  key={u}
                  active={heightUnit === u}
                  label={u}
                  onPress={() => setHeightUnit(u)}
                />
              ))}
            </View>
          </View>

          {/* gender */}
          <Text style={styles.inputLabel}>Gender</Text>
          {formErrors.gender && (
            <Text style={styles.errorText}>{formErrors.gender}</Text>
          )}
          <View style={styles.row}>
            {(['male', 'female', 'other'] as const).map((g) => (
              <GenderChip
                key={g}
                active={gender === g}
                label={g}
                onPress={() => setGender(g)}
              />
            ))}
          </View>

          {/* medical conditions */}
          <Text style={styles.sectionTitle}>Medical Conditions</Text>
          <Checkbox
            label="Hypertension"
            checked={medicalConditions.includes('hypertension')}
            onToggle={() => toggleMedicalCondition('hypertension')}
          />
          <Checkbox
            label="Dyslipidemia"
            checked={medicalConditions.includes('dyslipidemia')}
            onToggle={() => toggleMedicalCondition('dyslipidemia')}
          />
          <Checkbox
            label="Type 2 Diabetes"
            checked={medicalConditions.includes('diabetes')}
            onToggle={() => toggleMedicalCondition('diabetes')}
          />
          <Checkbox
            label="Chronic Kidney Disease"
            checked={medicalConditions.includes('kidney_disease')}
            onToggle={() => toggleMedicalCondition('kidney_disease')}
          />
          <Checkbox
            label="Obesity"
            checked={medicalConditions.includes('obesity')}
            onToggle={() => toggleMedicalCondition('obesity')}
          />
          <Checkbox
            label="None of the above"
            checked={medicalConditions.includes('none')}
            onToggle={() => toggleMedicalCondition('none')}
          />

          {/* conditional HbA1c */}
          {hasDiabetes && (
            <Input
              label="HbA1c (%)"
              placeholder="e.g. 7.2"
              value={hba1c}
              onChangeText={setHba1c}
              keyboardType="numeric"
            />
          )}
        </ScrollView>

        {/* ───── footer ───── */}
        <View style={styles.footer}>
          <Button title="Next" variant="primary" fullWidth onPress={handleNext} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ===== tiny helpers ===== */
const UnitChip = ({
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
      styles.unitChip,
      active && { backgroundColor: Colors.highlight, borderColor: Colors.primary },
    ]}>
    <Text
      style={[
        styles.unitChipText,
        active && { color: Colors.primary, fontWeight: '600' },
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const GenderChip = ({
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
      styles.genderChip,
      active && { backgroundColor: Colors.highlight, borderColor: Colors.primary },
    ]}>
    <Text
      style={[
        styles.genderChipText,
        active && { color: Colors.primary, fontWeight: '600' },
      ]}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </Text>
  </TouchableOpacity>
);

/* ===== styles ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: SPACING.lg },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text.primary, marginVertical: 8 },

  formContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: SPACING.lg },
  inputLabel: { marginTop: SPACING.lg, color: Colors.text.secondary, fontSize: 14 },
  errorText: { color: Colors.error, fontSize: 12 },

  row: { marginTop: SPACING.md },
  unitSwitch: { flexDirection: 'row', marginTop: 4 },
  unitChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.xs,
  },
  unitChipText: { fontSize: 12, color: Colors.text.primary },

  genderChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  genderChipText: { color: Colors.text.primary },

  footer: { padding: SPACING.lg },
});
