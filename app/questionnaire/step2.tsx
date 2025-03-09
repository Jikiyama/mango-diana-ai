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
import { Cuisine, DietaryPreference, StrictnessLevel } from '@/types/questionnaire';

export default function DietPreferencesStep() {
  const router = useRouter();
  const { dietPreferences, updateDietPreferences, nextStep, prevStep } = useQuestionnaireStore();
  
  const [cuisines, setCuisines] = useState<Cuisine[]>(dietPreferences.cuisines || []);
  const [otherCuisine, setOtherCuisine] = useState(dietPreferences.otherCuisine || '');
  const [allergies, setAllergies] = useState<string[]>(dietPreferences.allergies || []);
  const [newAllergy, setNewAllergy] = useState('');
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>(
    dietPreferences.dietaryPreferences || []
  );
  const [batchCooking, setBatchCooking] = useState(dietPreferences.batchCooking || false);
  const [strictnessLevel, setStrictnessLevel] = useState<StrictnessLevel>(
    dietPreferences.strictnessLevel || 'moderately_strict'
  );

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const toggleCuisine = (cuisine: Cuisine) => {
    if (cuisines.includes(cuisine)) {
      setCuisines(cuisines.filter(c => c !== cuisine));
    } else {
      setCuisines([...cuisines, cuisine]);
    }
  };

  const toggleDietaryPreference = (pref: DietaryPreference) => {
    if (dietaryPrefs.includes(pref)) {
      setDietaryPrefs(dietaryPrefs.filter(p => p !== pref));
    } else {
      setDietaryPrefs([...dietaryPrefs, pref]);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const handleNext = () => {
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
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Preferred Cuisines</Text>
          <Text style={styles.sectionSubtitle}>
            Select the types of cuisine you enjoy (select multiple)
          </Text>
          
          <View style={styles.cuisineGrid}>
            <CuisineOption 
              label="Latin"
              selected={cuisines.includes('latin')}
              onToggle={() => toggleCuisine('latin')}
            />
            
            <CuisineOption 
              label="Mexican"
              selected={cuisines.includes('mexican')}
              onToggle={() => toggleCuisine('mexican')}
            />
            
            <CuisineOption 
              label="Asian"
              selected={cuisines.includes('asian')}
              onToggle={() => toggleCuisine('asian')}
            />
            
            <CuisineOption 
              label="Mediterranean"
              selected={cuisines.includes('mediterranean')}
              onToggle={() => toggleCuisine('mediterranean')}
            />
            
            <CuisineOption 
              label="Italian"
              selected={cuisines.includes('italian')}
              onToggle={() => toggleCuisine('italian')}
            />
            
            <CuisineOption 
              label="American"
              selected={cuisines.includes('american')}
              onToggle={() => toggleCuisine('american')}
            />
            
            <CuisineOption 
              label="Indian"
              selected={cuisines.includes('indian')}
              onToggle={() => toggleCuisine('indian')}
            />
            
            <CuisineOption 
              label="Middle Eastern"
              selected={cuisines.includes('middle_eastern')}
              onToggle={() => toggleCuisine('middle_eastern')}
            />
            
            <CuisineOption 
              label="Other"
              selected={cuisines.includes('other')}
              onToggle={() => toggleCuisine('other')}
            />
          </View>
          
          {cuisines.includes('other') && (
            <Input
              placeholder="Specify other cuisine"
              value={otherCuisine}
              onChangeText={setOtherCuisine}
              style={styles.otherCuisineInput}
            />
          )}
          
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
              {allergies.map((allergy, index) => (
                <View key={index} style={styles.allergyTag}>
                  <Text style={styles.allergyTagText}>{allergy}</Text>
                  <TouchableOpacity 
                    onPress={() => removeAllergy(allergy)}
                    style={styles.allergyTagRemove}
                  >
                    <Text style={styles.allergyTagRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <Text style={styles.sectionSubtitle}>
            Select any specific diets you follow (select multiple)
          </Text>
          
          <View style={styles.checkboxGroup}>
            <Checkbox
              label="Keto"
              checked={dietaryPrefs.includes('keto')}
              onToggle={() => toggleDietaryPreference('keto')}
            />
            
            <Checkbox
              label="Vegetarian"
              checked={dietaryPrefs.includes('vegetarian')}
              onToggle={() => toggleDietaryPreference('vegetarian')}
            />
            
            <Checkbox
              label="Vegan"
              checked={dietaryPrefs.includes('vegan')}
              onToggle={() => toggleDietaryPreference('vegan')}
            />
            
            <Checkbox
              label="DASH Diet"
              description="Dietary Approaches to Stop Hypertension"
              checked={dietaryPrefs.includes('dash')}
              onToggle={() => toggleDietaryPreference('dash')}
            />
            
            <Checkbox
              label="Mediterranean Diet"
              checked={dietaryPrefs.includes('mediterranean')}
              onToggle={() => toggleDietaryPreference('mediterranean')}
            />
            
            <Checkbox
              label="Gluten-Free"
              checked={dietaryPrefs.includes('gluten_free')}
              onToggle={() => toggleDietaryPreference('gluten_free')}
            />
            
            <Checkbox
              label="Dairy-Free"
              checked={dietaryPrefs.includes('dairy_free')}
              onToggle={() => toggleDietaryPreference('dairy_free')}
            />
          </View>
          
          <Text style={styles.sectionTitle}>Meal Planning Preferences</Text>
          
          <View style={styles.checkboxGroup}>
            <Checkbox
              label="I prefer batch cooking"
              description="Same meal for multiple days to save time"
              checked={batchCooking}
              onToggle={() => setBatchCooking(!batchCooking)}
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
  cuisineOptionInner: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  selectedCuisineOptionInner: {
    borderColor: Colors.primary,
    backgroundColor: Colors.highlight,
  },
  cuisineOption: {
    width: '33.33%',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  selectedCuisineOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.highlight,
  },
  cuisineOptionText: {
    textAlign: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    color: Colors.text.primary,
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
    marginTop: 24, // Align with input
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
  footer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
});