import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import type { FilterTab } from '../../utils/types';

const TABS: FilterTab[] = ['all', 'watched', 'favourites', 'unwatched'];

const TAB_CONFIG: Record<FilterTab, { label: string; emoji: string }> = {
  all: { label: 'ALL', emoji: '🍿' },
  watched: { label: 'WATCHED', emoji: '🎞️' },
  favourites: { label: 'FAVOURITES', emoji: '🎬' },
  unwatched: { label: 'UNWATCHED', emoji: '📺' },
};

interface FilterTabsProps {
  active: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

export function FilterTabs({ active, onTabChange }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, tab === active && styles.tabActive]}
          onPress={() => onTabChange(tab)}
          accessibilityLabel={TAB_CONFIG[tab].label}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === active }}
        >
          <Text style={styles.emoji}>{TAB_CONFIG[tab].emoji}</Text>
          <Text style={styles.tabText}>{TAB_CONFIG[tab].label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: -13,
  },
  scrollContent: {
    gap: 10,
    paddingHorizontal: 13,
    paddingBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 999,
    gap: 5,
  },
  tabActive: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
  },
  emoji: {
    fontSize: 16,
    lineHeight: 21,
  },
  tabText: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(60, 60, 67, 0.6)',
    letterSpacing: -0.07,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
});
