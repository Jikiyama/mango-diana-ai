import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  ViewStyle 
} from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { BORDER_RADIUS, SPACING } from '@/constants/theme';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  description?: string;
}

export default function Checkbox({
  label,
  checked,
  onToggle,
  disabled = false,
  style,
  description,
}: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        checked && styles.checked,
        disabled && styles.disabled,
      ]}>
        {checked && <Check size={16} color="#fff" />}
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checked: {
    backgroundColor: Colors.primary,
  },
  disabled: {
    borderColor: Colors.border,
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