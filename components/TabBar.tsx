import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import { BORDER_RADIUS, SPACING } from '@/constants/theme';

interface Tab {
  key: string;
  title: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  scrollable?: boolean;
}

export default function TabBar({
  tabs,
  activeTab,
  onTabChange,
  scrollable = false,
}: TabBarProps) {
  const TabContainer = scrollable ? ScrollView : View;
  const containerProps = scrollable ? {
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: styles.scrollableContainer,
  } : {};

  return (
    <View style={styles.container}>
      <TabContainer style={styles.tabsContainer} {...containerProps}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            {tab.icon && <View style={styles.icon}>{tab.icon}</View>}
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </TabContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  scrollableContainer: {
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});