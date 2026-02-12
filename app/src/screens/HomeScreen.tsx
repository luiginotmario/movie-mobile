import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { HeaderTitle, FilterTabs, MovieCard } from '../components/home';
import { useFilteredLibrary } from '../hooks/useFilteredLibrary';
import { SPACING, TYPOGRAPHY, COLORS } from '../utils/constants';
import { LibraryItem, FilterTab } from '../utils/types';
import { WatchStatus } from '../types/models';
import type { LibraryMode } from '../components/home/HeaderTitle';

// Mock data for development - will be replaced with Supabase
const MOCK_ITEMS: LibraryItem[] = [
  {
    id: '1',
    title: 'Inception',
    posterURL: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5ur4.jpg',
    overview: 'A thief who steals corporate secrets...',
    genres: [],
    cast: [],
    watchStatus: WatchStatus.Watched,
    dateAdded: new Date(),
    rating: 8.4,
  },
  {
    id: '2',
    title: 'The Dark Knight',
    posterURL: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    overview: 'When the menace known as the Joker...',
    genres: [],
    cast: [],
    watchStatus: WatchStatus.Watching,
    dateAdded: new Date(),
    rating: 9.0,
  },
];

interface HomeScreenProps {
  onAvatarPress?: () => void;
}

export function HomeScreen({ onAvatarPress }: HomeScreenProps) {
  const [mode, setMode] = useState<LibraryMode>('movies');
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = useFilteredLibrary(MOCK_ITEMS, filter, mode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header: avatar + title */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={onAvatarPress}
            accessibilityLabel="Profile"
            accessibilityRole="button"
          />
          <View style={styles.headerTitle}>
            <HeaderTitle mode={mode} onModeChange={setMode} />
          </View>
        </View>

        <FilterTabs active={filter} onTabChange={setFilter} />

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No {mode === 'movies' ? 'movies' : 'shows'} yet</Text>
            <Text style={styles.emptySubtext}>
              Add from search or they'll appear when you link your social accounts
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => <MovieCard item={item} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.avatarPlaceholder,
    marginRight: SPACING.md,
  },
  headerTitle: {
    flex: 1,
  },
  grid: {
    paddingBottom: SPACING.xxl,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.headline,
    fontWeight: '500',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.tertiary,
    textAlign: 'center',
  },
});
