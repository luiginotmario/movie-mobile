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
import { HeaderTitle, FilterTabs, MovieCard, SearchButton } from '../components/home';
import { ProfileModal } from '../components/ProfileModal';
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
    releaseDate: '2010-07-16',
    genres: [],
    cast: [],
    watchStatus: WatchStatus.Watched,
    dateAdded: new Date(),
    rating: 8.4,
    rottenTomatoesScore: 87,
  },
  {
    id: '2',
    title: 'The Dark Knight',
    posterURL: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    overview: 'When the menace known as the Joker...',
    releaseDate: '2008-07-18',
    genres: [],
    cast: [],
    watchStatus: WatchStatus.Watching,
    dateAdded: new Date(),
    rating: 9.0,
    rottenTomatoesScore: 94,
  },
  {
    id: '3',
    title: 'Interstellar',
    posterURL: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    overview: 'A team of explorers travel through a wormhole...',
    releaseDate: '2014-11-07',
    genres: [],
    cast: [],
    watchStatus: WatchStatus.WatchLater,
    dateAdded: new Date(),
    rating: 8.6,
    rottenTomatoesScore: 72,
  },
  {
    id: '4',
    title: 'Parasite',
    posterURL: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    overview: 'All unemployed, Ki-taek family takes peculiar interest...',
    releaseDate: '2019-05-30',
    genres: [],
    cast: [],
    watchStatus: WatchStatus.Watched,
    dateAdded: new Date(),
    rating: 8.5,
    rottenTomatoesScore: 99,
    isFavourite: true,
  },
];

interface HomeScreenProps {
  onAvatarPress?: () => void;
}

export function HomeScreen({ onAvatarPress }: HomeScreenProps) {
  const [mode, setMode] = useState<LibraryMode>('movies');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showProfile, setShowProfile] = useState(false);

  const filtered = useFilteredLibrary(MOCK_ITEMS, filter, mode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header: title + avatar */}
        <View style={styles.header}>
          <HeaderTitle mode={mode} onModeChange={setMode} />
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => setShowProfile(true)}
            accessibilityLabel="Profile"
            accessibilityRole="button"
          />
        </View>

        <FilterTabs active={filter} onTabChange={setFilter} />

        <View style={{ height: 23 }} />

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
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <MovieCard item={item} />}
          />
        )}

        <ProfileModal visible={showProfile} onClose={() => setShowProfile(false)} />
      </View>
      <SearchButton onPress={() => console.log('Search pressed')} />
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
    paddingHorizontal: 13,
    paddingTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 51,
    marginBottom: 11,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.avatarPlaceholder,
  },
  grid: {
    paddingBottom: SPACING.xxl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
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
