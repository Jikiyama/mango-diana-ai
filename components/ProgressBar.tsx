import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Colors from '@/constants/colors';
import { BORDER_RADIUS, SPACING } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  steps?: number;
  currentStep?: number;
  showStepIndicator?: boolean;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  label?: string;
}

export default function ProgressBar({
  progress,
  steps,
  currentStep,
  showStepIndicator = false,
  height = 8,
  backgroundColor = Colors.border,
  progressColor = Colors.primary,
  animated = true,
  label,
}: ProgressBarProps) {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.progressContainer, { height, backgroundColor }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: progressColor,
            },
            animated && styles.animated,
          ]}
        />
      </View>
      
      {showStepIndicator && steps && currentStep && (
        <View style={styles.stepsContainer}>
          {Array.from({ length: steps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepIndicator,
                index < currentStep && styles.completedStep,
                index === currentStep - 1 && styles.currentStep,
              ]}
            />
          ))}
        </View>
      )}
      
      {steps && currentStep && (
        <Text style={styles.stepText}>
          Step {currentStep} of {steps}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.md,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.round,
  },
  animated: {
    transition: 'width 0.3s ease',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  completedStep: {
    backgroundColor: Colors.primary,
  },
  currentStep: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});