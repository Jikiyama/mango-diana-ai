import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';
import { BORDER_RADIUS, SHADOWS, SPACING } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  style,
  elevation = 'small',
  padding = 'medium',
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevation !== 'none' && SHADOWS[elevation],
        styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: SPACING.sm,
  },
  paddingMedium: {
    padding: SPACING.md,
  },
  paddingLarge: {
    padding: SPACING.lg,
  },
});