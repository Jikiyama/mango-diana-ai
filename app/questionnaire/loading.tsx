// app/questionnaire/loading.tsx
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { useMealPlanStore } from '@/store/meal-plan-store';
import { generateMealPlan } from '@/utils/meal-plan-generator';
import Colors from '@/constants/colors';
import { logger } from '@/utils/logger';

export default function LoadingScreen() {
  const router = useRouter();
  const questionnaireState = useQuestionnaireStore();
  const { setCurrentPlan, setLoading, setError } = useMealPlanStore();

  useEffect(() => {
    let mounted = true;

    const doGenerate = async () => {
      try {
        logger.info('LOADING', 'Starting generateMealPlan function');
        setLoading(true);

        // 1) Actually call
        const result = await generateMealPlan(questionnaireState);

        if (!mounted) return;

        // 2) If we get here, we have either a real or fallback plan
        logger.info('LOADING', 'Meal plan generated successfully', result);

        // 3) Store it
        setCurrentPlan(result);

        // <-- ADDED: Mark the questionnaire as complete so we don't redirect to it again
        questionnaireState.completeQuestionnaire(); // <-- CHANGED / ADDED

        // 4) Move on to tabs
        router.replace('/(tabs)');
      } catch (err) {
        logger.error('LOADING', 'Error in generatePlan function', err);
        setError(String(err));

        // show an alert
        logger.warn('LOADING', 'Showing error alert to user', {
          errorMessage: String(err),
        });
        Alert.alert('Error', 'Failed to generate meal plan: ' + String(err));

        // Optionally go back to previous
        router.back();
      } finally {
        setLoading(false);
      }
    };

    doGenerate();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <StatusBar style="dark" />
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={{ marginTop: 12, fontSize: 16, color: Colors.text.secondary }}>
        Generating your meal plan...
      </Text>
    </View>
  );
}
