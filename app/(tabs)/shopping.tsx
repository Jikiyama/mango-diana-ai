import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Check, Printer, Share, Book } from 'lucide-react-native';
import ShoppingListItem from '@/components/ShoppingListItem';
import TabBar from '@/components/TabBar';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useMealPlanStore } from '@/store/meal-plan-store';
import { ShoppingItem } from '@/types/meal-plan';
import { useRouter } from 'expo-router';

export default function ShoppingListScreen() {
  const router = useRouter();
  const { shoppingList, toggleShoppingItem } = useMealPlanStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  if (!shoppingList) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Shopping List Found</Text>
          <Text style={styles.emptyDescription}>
            Generate a meal plan to create your shopping list
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Get all unique categories
  const categories = Array.from(
    new Set(shoppingList.items.map(item => item.category))
  ).sort();
  
  // Filter items based on selected category
  const filteredItems = shoppingList.items.filter(item => {
    if (activeTab === 'all') {
      return true;
    }
    return item.category === activeTab;
  });
  
  // Calculate progress
  const checkedItems = shoppingList.items.filter(item => item.checked).length;
  const progress = shoppingList.items.length > 0 
    ? (checkedItems / shoppingList.items.length) 
    : 0;
  
  const handleViewRecipes = () => {
    router.push('/recipes');
  };
  
  const renderShoppingItem = ({ item }: { item: ShoppingItem }) => (
    <ShoppingListItem
      item={item}
      onToggle={() => toggleShoppingItem(item.name)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleViewRecipes}
          >
            <Book size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Printer size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Share size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
        
        <Text style={styles.progressText}>
          {checkedItems} of {shoppingList.items.length} items checked
        </Text>
      </View>
      
      <TabBar
        tabs={[
          { key: 'all', title: 'All Items' },
          ...categories.map(category => ({
            key: category,
            title: category,
          })),
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scrollable
      />
      
      <FlatList
        data={filteredItems}
        renderItem={renderShoppingItem}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              No items found in this category
            </Text>
          </View>
        }
      />
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.checkAllButton}
          onPress={() => {
            // Toggle all visible items
            filteredItems.forEach(item => {
              toggleShoppingItem(item.name);
            });
          }}
        >
          <Check size={20} color="#fff" />
          <Text style={styles.checkAllButtonText}>
            {filteredItems.every(item => item.checked) 
              ? 'Uncheck All' 
              : 'Check All Items'}
          </Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  listContent: {
    padding: SPACING.lg,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  checkAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  checkAllButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyListContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});