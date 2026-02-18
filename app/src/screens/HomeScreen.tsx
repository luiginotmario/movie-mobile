import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderTitle, FilterTabs, MovieCard, SearchButton } from '../components/home';
import type { LibraryMode } from '../components/home';
import { ProfileModal } from '../components/ProfileModal';
import { SearchSheet } from '../components/SearchSheet';
import { MovieDetailScreen } from './MovieDetailScreen';
import { useFilteredLibrary } from '../hooks/useFilteredLibrary';
import { useAuth } from '../contexts/AuthContext';
import { libraryService } from '../services/LibraryService';
import { SPACING, COLORS } from '../utils/constants';
import { LibraryItem, FilterTab } from '../utils/types';
import { WatchStatus, Movie } from '../types/models';
import { AVATAR_OPTIONS } from '../components/AvatarPicker';
import type { AvatarOption } from '../components/AvatarPicker';

export function HomeScreen() {
  const { currentUserId, isGuestMode } = useAuth();
  const [mode, setMode] = useState<LibraryMode>('movies');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<LibraryItem | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(AVATAR_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Load library on mount and when user changes
  useEffect(() => {
    loadLibrary();
  }, [currentUserId, isGuestMode]);

  const loadLibrary = async () => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      if (isGuestMode) {
        // Guest mode - load from AsyncStorage
        const guestLibraryKey = `guestLibrary_${currentUserId}`;
        const stored = await AsyncStorage.getItem(guestLibraryKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert dateAdded strings back to Date objects
          const movies = parsed.map((m: any) => ({
            ...m,
            dateAdded: new Date(m.dateAdded),
          }));
          setLibrary(movies);
        } else {
          setLibrary([]);
        }
      } else {
        // Authenticated user - load from Supabase
        const movies = await libraryService.getUserMovies(currentUserId);
        setLibrary(movies);
      }
    } catch (error) {
      console.error('Failed to load library:', error);
      setLibrary([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMovie = async (movieId: string, movieData?: Partial<Movie>) => {
    if (!currentUserId) return;

    const existingMovie = library.find((item) => item.id === movieId);
    
    if (isGuestMode) {
      // Guest mode - save to AsyncStorage
      const guestLibraryKey = `guestLibrary_${currentUserId}`;
      
      if (existingMovie) {
        // Remove from library
        const newLibrary = library.filter((item) => item.id !== movieId);
        setLibrary(newLibrary);
        await AsyncStorage.setItem(guestLibraryKey, JSON.stringify(newLibrary));
      } else {
        // Add to library
        if (!movieData) return;
        
        console.log('📦 HomeScreen - Received movieData:', {
          title: movieData.title,
          rating: movieData.rating,
          rtScore: movieData.rottenTomatoesScore,
        });
        
        const newItem: LibraryItem = {
          id: movieId,
          title: movieData.title || 'Unknown',
          posterURL: movieData.posterURL || '',
          overview: movieData.overview || '',
          releaseDate: movieData.releaseDate || '',
          genres: movieData.genres || [],
          cast: movieData.cast || [],
          watchStatus: WatchStatus.WatchLater,
          dateAdded: new Date(),
          rating: movieData.rating,
          rottenTomatoesScore: movieData.rottenTomatoesScore,
        };
        
        console.log('📦 HomeScreen - Created newItem:', {
          title: newItem.title,
          rating: newItem.rating,
          rtScore: newItem.rottenTomatoesScore,
        });
        
        const newLibrary = [...library, newItem];
        setLibrary(newLibrary);
        await AsyncStorage.setItem(guestLibraryKey, JSON.stringify(newLibrary));
      }
    } else {
      // Authenticated user - save to database
      if (existingMovie) {
        // Remove from library
        const success = await libraryService.removeMovie(currentUserId, movieId);
        if (success) {
          setLibrary((prev) => prev.filter((item) => item.id !== movieId));
        }
      } else {
        // Add to library
        if (!movieData) return;
        
        const success = await libraryService.addMovie(currentUserId, {
          id: movieId,
          title: movieData.title || 'Unknown',
          posterURL: movieData.posterURL || '',
          overview: movieData.overview || '',
          releaseDate: movieData.releaseDate || '',
          genres: movieData.genres || [],
          cast: movieData.cast || [],
          watchStatus: WatchStatus.WatchLater,
          rating: movieData.rating,
          rottenTomatoesScore: movieData.rottenTomatoesScore,
        } as Movie);

        if (success) {
          // Reload library to get the new item with DB ID
          await loadLibrary();
        }
      }
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safeArea}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
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
              <MovieCard 
                item={item} 
                onPress={() => setSelectedMovie(item)}
                onDelete={() => handleAddMovie(item.id)}
              />
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
      </SafeAreaView>
      <SearchButton onPress={() => setShowSearch(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 24,
    paddingBottom: 34,
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
