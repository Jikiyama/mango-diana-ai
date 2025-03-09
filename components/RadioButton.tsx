import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  ViewStyle 
} from 'react-native';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  description?: string;
}

export default function RadioButton({
  label,
  selected,
  onSelect,
  disabled = false,
  style,
  description,
}: RadioButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[
        styles.radio,
        disabled && styles.disabled,
      ]}>
        {selected && (
          <View style={[
            styles.selected,
            disabled && styles.disabledSelected,
          ]} />
        )}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[
          styles.label,
          disabled && styles.disabledText,
        ]}>
          {label}
        </Text>
        
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  selected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  disabled: {
    borderColor: Colors.border,
  },
  disabledSelected: {
    backgroundColor: Colors.border,
  },
  textContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  label: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  disabledText: {
    color: Colors.text.muted,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: SPACING.xs,
  },
});