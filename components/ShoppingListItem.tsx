import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { BORDER_RADIUS, SPACING } from '@/constants/theme';
import { ShoppingItem } from '@/types/meal-plan';

interface ShoppingListItemProps {
  item: ShoppingItem;
  onToggle: () => void;
}

export default function ShoppingListItem({ item, onToggle }: ShoppingListItemProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        item.checked && styles.checked,
      ]}>
        {item.checked && <Check size={16} color="#fff" />}
      </View>
      
      <View style={styles.content}>
        <Text style={[
          styles.name,
          item.checked && styles.checkedText,
        ]}>
          {item.name}
        </Text>
        
        <Text style={styles.amount}>
          {item.amount} {item.unit}
        </Text>
      </View>
      
      <View style={styles.categoryContainer}>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  name: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: Colors.text.muted,
  },
  amount: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  categoryContainer: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  category: {
    fontSize: 12,
    color: Colors.primary,
  },
});