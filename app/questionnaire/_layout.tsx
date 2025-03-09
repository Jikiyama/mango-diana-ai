import React from 'react';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function QuestionnaireLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background },
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="step1" />
      <Stack.Screen name="step2" />
      <Stack.Screen name="step3" />
      <Stack.Screen name="loading" />
    </Stack>
  );
}