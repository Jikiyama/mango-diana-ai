import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { useMealPlanStore } from '@/store/meal-plan-store';
import { generateMealPlan } from '@/utils/meal-plan-generator';
import { logger } from '@/utils/logger';
import Button from '@/components/Button';

export default function LoadingScreen() {
  const router = useRouter();
  const questionnaireState = useQuestionnaireStore();
  const { setCurrentPlan, setShoppingList, setLoading, setError } = useMealPlanStore();
  
  // We call completeQuestionnaire here upon success.
  const { completeQuestionnaire } = useQuestionnaireStore();
  
  const [steps, setSteps] = useState({
    step1: true,
    step2: false,
    step3: false,
    step4: false
  });
  const [isGenerating, setIsGenerating] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [detailedError, setDetailedError] = useState('');
  
  useEffect(() => {
    let isMounted = true;
    
    const generatePlan = async () => {
      try {
        if (!isMounted) return;
        
        logger.info('LOADING', 'Starting meal plan generation process');
        setLoading(true);
        
        // Simulate step progress
        logger.debug('LOADING', 'Step 1: Analyzing health profile');
        setSteps(prev => ({ ...prev, step2: true }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!isMounted) return;
        logger.debug('LOADING', 'Step 2: Matching with nutrition guidelines');
        setSteps(prev => ({ ...prev, step3: true }));
        
        logger.info('LOADING', 'Generating meal plan with questionnaire data');
        logger.debug('LOADING', 'Questionnaire data', {
          age: questionnaireState.personalInfo.age,
          gender: questionnaireState.personalInfo.gender,
          healthGoal: questionnaireState.goalSettings.healthGoal,
          mealPlanDays: questionnaireState.goalSettings.mealPlanDays,
          mealsPerDay: questionnaireState.goalSettings.mealsPerDay,
        });
        
        // Actually generate
        logger.info('LOADING', 'Calling generateMealPlan function');
        try {
          logger.debug('LOADING', 'Before calling generateMealPlan');
          const { mealPlan, shoppingList } = await generateMealPlan(questionnaireState);
          logger.debug('LOADING', 'After calling generateMealPlan - success!');
          
          if (!isMounted) return;
          logger.debug('LOADING', 'Step 3: Generating recipes');
          setSteps(prev => ({ ...prev, step4: true }));
          
          logger.info('LOADING', `Meal plan generated successfully: ${mealPlan.id}`);
          logger.debug('LOADING', 'Meal plan details', {
            planId: mealPlan.id,
            mealsCount: mealPlan.meals.length,
            totalCalories: mealPlan.totalCalories
          });
          
          // Update store with generated plan
          logger.debug('LOADING', 'Updating store with generated plan');
          setCurrentPlan(mealPlan);
          setShoppingList(shoppingList);
          
          // Let final UI update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (!isMounted) return;
          setIsGenerating(false);

          // Now that it's done, mark questionnaire complete
          logger.info('LOADING', 'Meal plan generation done; marking questionnaire as complete');
          completeQuestionnaire();

          // Navigate to the meal plan screen
          logger.info('LOADING', 'Navigation to meal plan screen');
          router.replace('/(tabs)');

        } catch (mealPlanError) {
          logger.error('LOADING', 'Error in generateMealPlan function', mealPlanError);
          throw mealPlanError;
        }
      } catch (error) {
        logger.error('LOADING', 'Error in generatePlan function', error);
        
        if (isMounted) {
          setHasError(true);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
          setErrorMessage(errorMsg);
          
          // Set detailed error for debugging
          if (error instanceof Error) {
            setDetailedError(`${error.name}: ${error.message}\n${error.stack || ''}`);
          } else {
            setDetailedError(JSON.stringify(error));
          }
          
          setError('Failed to generate meal plan. Please try again.');
          setIsGenerating(false);
          
          logger.warn('LOADING', 'Showing error alert to user', { errorMessage: errorMsg });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Start generating immediately
    logger.info('LOADING', 'Starting meal plan generation immediately');
    generatePlan();
    
    return () => {
      logger.debug('LOADING', 'Cleaning up loading screen');
      isMounted = false;
    };
  }, []);

  const handleTryAgain = () => {
    logger.info('LOADING', 'User chose to try again');
    setHasError(false);
    setIsGenerating(true);
    setSteps({
      step1: true,
      step2: false,
      step3: false,
      step4: false
    });
    
    // Reset the component state and try generation again
    const generatePlan = async () => {
      try {
        logger.info('LOADING', 'Retrying meal plan generation');
        setLoading(true);
        
        setSteps(prev => ({ ...prev, step2: true }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSteps(prev => ({ ...prev, step3: true }));
        
        const { mealPlan, shoppingList } = await generateMealPlan(questionnaireState);
        
        setSteps(prev => ({ ...prev, step4: true }));
        
        logger.info('LOADING', `Meal plan generated successfully on retry: ${mealPlan.id}`);
        
        setCurrentPlan(mealPlan);
        setShoppingList(shoppingList);

        // Wait briefly
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsGenerating(false);

        // Mark complete now that it worked
        completeQuestionnaire();
        
        router.replace('/(tabs)');
      } catch (error) {
        logger.error('LOADING', 'Error in retry generatePlan function', error);
        
        setHasError(true);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        setErrorMessage(errorMsg);
        
        if (error instanceof Error) {
          setDetailedError(`${error.name}: ${error.message}\n${error.stack || ''}`);
        } else {
          setDetailedError(JSON.stringify(error));
        }
        
        setIsGenerating(false);
        setError('Failed to generate meal plan. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    generatePlan();
  };

  const handleGoBack = () => {
    logger.info('LOADING', 'User chose to go back');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {isGenerating ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : hasError ? (
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
        ) : null}
        
        <Text style={styles.title}>
          {hasError ? 'Error Creating Meal Plan' : 'Creating Your Meal Plan'}
        </Text>
        
        {!hasError && (
          <Text style={styles.description}>
            Our AI is analyzing your preferences and health needs to create a personalized meal plan just for you.
          </Text>
        )}
        
        {!hasError && (
          <View style={styles.stepsContainer}>
            <LoadingStep 
              step={1} 
              text="Analyzing your health profile" 
              isActive={steps.step1} 
              isComplete={steps.step2}
            />
            <LoadingStep 
              step={2} 
              text="Matching with optimal nutrition guidelines" 
              isActive={steps.step2} 
              isComplete={steps.step3}
            />
            <LoadingStep 
              step={3} 
              text="Generating delicious recipes" 
              isActive={steps.step3} 
              isComplete={steps.step4}
            />
            <LoadingStep 
              step={4} 
              text="Creating your shopping list" 
              isActive={steps.step4} 
              isComplete={false}
            />
          </View>
        )}
        
        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {errorMessage || 'There was a problem connecting to our servers. Please check your internet connection.'}
            </Text>
            
            <View style={styles.errorActions}>
              <Button 
                title="Try Again" 
                onPress={handleTryAgain}
                variant="primary"
                style={styles.errorButton}
              />
              
              <Button 
                title="Go Back" 
                onPress={handleGoBack}
                variant="outline"
                style={styles.errorButton}
              />
            </View>
            
            {Platform.OS !== 'web' && detailedError ? (
              <View style={styles.detailedErrorContainer}>
                <Text style={styles.detailedErrorTitle}>Technical Details:</Text>
                <Text style={styles.detailedErrorText}>{detailedError}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

interface LoadingStepProps {
  step: number;
  text: string;
  isActive: boolean;
  isComplete: boolean;
}

function LoadingStep({ step, text, isActive, isComplete }: LoadingStepProps) {
  return (
    <View style={styles.stepContainer}>
      <View style={[
        styles.stepNumber, 
        isActive && styles.activeStepNumber,
        isComplete && styles.completedStepNumber
      ]}>
        {isActive && !isComplete ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.stepNumberText}>
            {isComplete ? "✓" : step}
          </Text>
        )}
      </View>
      <Text style={[
        styles.stepText, 
        isActive && styles.activeStepText,
        isComplete && styles.completedStepText
      ]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginBottom: SPACING.xl,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  errorIconText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  stepsContainer: {
    width: '100%',
    marginTop: SPACING.xl,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activeStepNumber: {
    backgroundColor: Colors.primary,
  },
  completedStepNumber: {
    backgroundColor: Colors.success,
  },
  stepNumberText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  activeStepText: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  completedStepText: {
    color: Colors.success,
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    width: '100%',
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  errorButton: {
    marginHorizontal: SPACING.xs,
    minWidth: 120,
  },
  detailedErrorContainer: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  detailedErrorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  detailedErrorText: {
    fontSize: 10,
  },
});
