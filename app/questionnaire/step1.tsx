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
  const { personalInfo, updatePersonalInfo, nextStep } = useQuestionnaireStore();
  
  const [age, setAge] = useState(personalInfo.age?.toString() || '');
  const [weight, setWeight] = useState(personalInfo.weight?.toString() || '');
  const [height, setHeight] = useState(personalInfo.height?.toString() || '');
  const [zipCode, setZipCode] = useState(personalInfo.zipCode || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>(personalInfo.gender);
  const [medicalConditions, setMedicalConditions] = useState<MedicalCondition[]>(
    personalInfo.medicalConditions || []
  );
  const [hba1c, setHba1c] = useState(personalInfo.hba1c?.toString() || '');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBack = () => {
    router.back();
  };

  const toggleMedicalCondition = (condition: MedicalCondition) => {
    if (condition === 'none') {
      // If 'none' is selected, clear all other selections
      setMedicalConditions(['none']);
    } else {
      // If any other condition is selected, remove 'none'
      let updatedConditions = [...medicalConditions];
      
      if (updatedConditions.includes(condition)) {
        // Remove the condition if already selected
        updatedConditions = updatedConditions.filter(c => c !== condition);
      } else {
        // Add the condition and remove 'none' if present
        updatedConditions = updatedConditions.filter(c => c !== 'none');
        updatedConditions.push(condition);
      }
      
      // If no conditions are selected, default to 'none'
      if (updatedConditions.length === 0) {
        updatedConditions = ['none'];
      }
      
      setMedicalConditions(updatedConditions);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(age) < 18 || parseInt(age) > 100) {
      newErrors.age = 'Age must be between 18 and 100';
    }
    
    if (!weight) {
      newErrors.weight = 'Weight is required';
    } else if (parseInt(weight) < 30 || parseInt(weight) > 500) {
      newErrors.weight = 'Weight must be between 30 and 500 kg';
    }
    
    if (!height) {
      newErrors.height = 'Height is required';
    } else if (parseInt(height) < 100 || parseInt(height) > 250) {
      newErrors.height = 'Height must be between 100 and 250 cm';
    }
    
    if (!gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      updatePersonalInfo({
        age: parseInt(age),
        weight: parseInt(weight),
        height: parseInt(height),
        gender,
        zipCode,
        medicalConditions,
        hba1c: hba1c ? parseFloat(hba1c) : undefined,
      });
      
      nextStep();
      router.push('/questionnaire/step2');
    }
  };

  const hasDiabetes = medicalConditions.includes('diabetes');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Personal Information</Text>
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={0.33}
              steps={3}
              currentStep={1}
              showStepIndicator
            />
          </View>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Input
                label="Age"
                placeholder="Years"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                error={errors.age}
                maxLength={3}
              />
            </View>
            
            <View style={styles.formColumn}>
              <Input
                label="Weight"
                placeholder="kg"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                error={errors.weight}
                maxLength={3}
              />
            </View>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Input
                label="Height"
                placeholder="cm"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                error={errors.height}
                maxLength={3}
              />
            </View>
            
            <View style={styles.formColumn}>
              <Input
                label="Zip Code (Optional)"
                placeholder="For local recommendations"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>
          
          <Text style={styles.inputLabel}>Gender</Text>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
          
          <View style={styles.genderOptions}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'male' && styles.selectedGenderOption,
              ]}
              onPress={() => setGender('male')}
            >
              <Text
                style={[
                  styles.genderOptionText,
                  gender === 'male' && styles.selectedGenderOptionText,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'female' && styles.selectedGenderOption,
              ]}
              onPress={() => setGender('female')}
            >
              <Text
                style={[
                  styles.genderOptionText,
                  gender === 'female' && styles.selectedGenderOptionText,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'other' && styles.selectedGenderOption,
              ]}
              onPress={() => setGender('other')}
            >
              <Text
                style={[
                  styles.genderOptionText,
                  gender === 'other' && styles.selectedGenderOptionText,
                ]}
              >
                Other
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionTitle}>Medical Conditions</Text>
          <Text style={styles.sectionSubtitle}>
            Select any conditions you have been diagnosed with
          </Text>
          
          <View style={styles.checkboxGroup}>
            <Checkbox
              label="Hypertension (High Blood Pressure)"
              checked={medicalConditions.includes('hypertension')}
              onToggle={() => toggleMedicalCondition('hypertension')}
            />
            
            <Checkbox
              label="Dyslipidemia (High Cholesterol/Triglycerides)"
              checked={medicalConditions.includes('dyslipidemia')}
              onToggle={() => toggleMedicalCondition('dyslipidemia')}
            />
            
            <Checkbox
              label="Type 2 Diabetes (Diabetic / Pre-diabetic)"
              checked={medicalConditions.includes('diabetes')}
              onToggle={() => toggleMedicalCondition('diabetes')}
            />
            
            <Checkbox
              label="Chronic Kidney Disease (CKD)"
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
          </View>
          
          {hasDiabetes && (
            <View style={styles.conditionalSection}>
              <Text style={styles.sectionSubtitle}>
                Since you selected diabetes, please provide your HbA1c level if known:
              </Text>
              
              <Input
                label="HbA1c Level (%)"
                placeholder="e.g., 7.2"
                value={hba1c}
                onChangeText={setHba1c}
                keyboardType="numeric"
              />
            </View>
          )}
        </ScrollView>
        
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
  formRow: {
    flexDirection: 'row',
    marginHorizontal: -SPACING.xs,
  },
  formColumn: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: SPACING.xs,
  },
  genderOptions: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  genderOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  selectedGenderOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.highlight,
  },
  genderOptionText: {
    color: Colors.text.primary,
  },
  selectedGenderOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkboxGroup: {
    marginBottom: SPACING.md,
  },
  conditionalSection: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: Colors.highlight,
    borderRadius: 8,
  },
  footer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
});