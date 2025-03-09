import React from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import Colors from '@/constants/colors';
import { BORDER_RADIUS, SPACING } from '@/constants/theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  disabled?: boolean;
  maxLength?: number;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  maxLength,
}: InputProps) {
  const [hidePassword, setHidePassword] = React.useState(secureTextEntry);

  const togglePasswordVisibility = () => {
    setHidePassword(!hidePassword);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        leftIcon && styles.withLeftIcon,
        (rightIcon || secureTextEntry) && styles.withRightIcon,
        error && styles.inputError,
        disabled && styles.inputDisabled,
      ]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidePassword}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          maxLength={maxLength}
        />
        
        {secureTextEntry ? (
          <TouchableOpacity 
            style={styles.rightIconContainer} 
            onPress={togglePasswordVisibility}
          >
            {hidePassword ? 
              <Eye size={20} color={Colors.text.secondary} /> : 
              <EyeOff size={20} color={Colors.text.secondary} />
            }
          </TouchableOpacity>
        ) : rightIcon && (
          <TouchableOpacity 
            style={styles.rightIconContainer} 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#fff',
  },
  withLeftIcon: {
    paddingLeft: 0,
  },
  withRightIcon: {
    paddingRight: 0,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: Colors.text.primary,
  },
  multilineInput: {
    height: 'auto',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    textAlignVertical: 'top',
  },
  leftIconContainer: {
    paddingHorizontal: SPACING.md,
  },
  rightIconContainer: {
    paddingHorizontal: SPACING.md,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.7,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
});