import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useQuestionnaireStore } from '@/store/questionnaire-store';

export default function QuestionnaireIntro() {
  const router = useRouter();
  const { resetQuestionnaire, isComplete } = useQuestionnaireStore();
  
  // Use useEffect for side effects like resetting the questionnaire
  useEffect(() => {
    resetQuestionnaire();
  }, [resetQuestionnaire]);
  
  // Use useEffect for navigation based on state
  useEffect(() => {
    if (isComplete) {
      router.replace('/(tabs)');
    }
  }, [isComplete, router]);

  const handleStart = () => {
    router.push('/questionnaire/step1');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Let's Get Started</Text>
        <Text style={styles.subtitle}>
          Answer a few questions to help us create your personalized meal plan
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={0}
          steps={3}
          currentStep={0}
          showStepIndicator
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What to expect</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>1</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoItemTitle}>Personal Information</Text>
              <Text style={styles.infoItemDescription}>
                Basic details about you and any medical conditions
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>2</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoItemTitle}>Diet Preferences</Text>
              <Text style={styles.infoItemDescription}>
                Your food preferences, allergies, and dietary restrictions
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>3</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoItemTitle}>Health Goals</Text>
              <Text style={styles.infoItemDescription}>
                What you want to achieve with your meal plan
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.privacyNote}>
          Your information is private and will only be used to generate your meal plan
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Start Questionnaire" 
          onPress={handleStart} 
          variant="primary"
          size="large"
          fullWidth
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
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  progressContainer: {
    paddingHorizontal: SPACING.xl,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  infoNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  infoNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoItemDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  privacyNote: {
    fontSize: 14,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  footer: {
    padding: SPACING.xl,
  },
});