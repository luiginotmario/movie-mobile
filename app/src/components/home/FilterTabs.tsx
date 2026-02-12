import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SPACING, TYPOGRAPHY, COLORS, RADIUS } from '../../utils/constants';
import type { FilterTab } from '../../utils/types';

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'watched', label: 'Watched' },
  { value: 'watching', label: 'Watching' },
  { value: 'favourites', label: 'Favourites' },
];

interface FilterTabsProps {
  active: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

export function FilterTabs({ active, onTabChange }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.value}
          style={[styles.tab, tab.value === active && styles.tabActive]}
          onPress={() => onTabChange(tab.value)}
          accessibilityLabel={tab.label}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab.value === active }}
        >
          <Text style={[styles.tabText, tab.value === active && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.subhead,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  tabTextActive: {
    color: COLORS.background,
  },
});
