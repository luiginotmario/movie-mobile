import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderTitle, FilterTabs, MovieCard, SearchButton } from '../components/home';
import type { LibraryMode } from '../components/home';
import { ProfileModal } from '../components/ProfileModal';
import { SearchSheet } from '../components/SearchSheet';
import { MovieDetailScreen } from './MovieDetailScreen';
import { useFilteredLibrary } from '../hooks/useFilteredLibrary';
import { SPACING, COLORS } from '../utils/constants';
import { LibraryItem, FilterTab } from '../utils/types';
import { WatchStatus, Movie } from '../types/models';
import { AVATAR_OPTIONS } from '../components/AvatarPicker';
import type { AvatarOption } from '../components/AvatarPicker';

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

export function HomeScreen() {
  const [mode, setMode] = useState<LibraryMode>('movies');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [library, setLibrary] = useState<LibraryItem[]>(MOCK_ITEMS);
  const [selectedMovie, setSelectedMovie] = useState<LibraryItem | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(AVATAR_OPTIONS[0]);

  const handleAddMovie = (movieId: string, movieData?: Partial<Movie>) => {
    // Check if already in library
    if (library.find((item) => item.id === movieId)) {
      // Remove from library
      setLibrary((prev) => prev.filter((item) => item.id !== movieId));
    } else {
      // Add to library
      const newItem: LibraryItem = {
        id: movieId,
        title: movieData?.title || 'Unknown',
        posterURL: movieData?.posterURL || '',
        overview: movieData?.overview || '',
        releaseDate: movieData?.releaseDate || '',
        genres: movieData?.genres || [],
        cast: movieData?.cast || [],
        watchStatus: WatchStatus.WatchLater,
        dateAdded: new Date(),
        rating: movieData?.rating,
        rottenTomatoesScore: movieData?.rottenTomatoesScore,
      };
      setLibrary((prev) => [...prev, newItem]);
    }
  };

  const filtered = useFilteredLibrary(library, filter, mode);

  if (selectedMovie) {
    const isInLibrary = library.some((item) => item.id === selectedMovie.id);
    return (
      <MovieDetailScreen
        item={selectedMovie}
        onBack={() => setSelectedMovie(null)}
        isInLibrary={isInLibrary}
        onToggleLibrary={() => handleAddMovie(selectedMovie.id)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header: title + avatar */}
        <View style={styles.header}>
          <HeaderTitle mode={mode} onModeChange={setMode} />
          <TouchableOpacity
            onPress={() => setShowProfile(true)}
            accessibilityLabel="Profile"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={selectedAvatar.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        <FilterTabs active={filter} onTabChange={setFilter} />

        <View style={{ height: 23 }} />

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>{mode === 'movies' ? '🎬' : '📺'}</Text>
            </View>
            <Text style={styles.emptyTitle}>
              No {mode === 'movies' ? 'Movies' : 'TV Shows'} Yet
            </Text>
            <Text style={styles.emptySubtext}>
              Start building your collection by searching for movies and TV shows
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowSearch(true)}
              accessibilityLabel={`Add your first ${mode === 'movies' ? 'movie' : 'TV show'}`}
              accessibilityRole="button"
            >
              <Text style={styles.emptyButtonText}>
                Add Your First {mode === 'movies' ? 'Movie' : 'TV Show'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <MovieCard item={item} onPress={() => setSelectedMovie(item)} />
            )}
          />
        )}

        <ProfileModal
          visible={showProfile}
          onClose={() => setShowProfile(false)}
          selectedAvatar={selectedAvatar}
          onAvatarChange={setSelectedAvatar}
        />
        <SearchSheet
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          onAddItem={handleAddMovie}
          libraryIds={library.map((item) => item.id)}
        />
      </View>
      <SearchButton onPress={() => setShowSearch(true)} />
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
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        backgroundColor: '#EFF6FF',
      },
      default: {
        backgroundColor: '#EFF6FF',
      },
    }),
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 20,
    fontWeight: '400',
    color: '#0A0A0A',
    letterSpacing: -0.45,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)',
    letterSpacing: -0.15,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 294,
  },
  emptyButton: {
    backgroundColor: '#2B7FFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyButtonText: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
});
