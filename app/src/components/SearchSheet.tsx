import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { APIService } from '../services/APIService';

const apiService = APIService.getInstance();

interface SearchResult {
  id: string;
  title: string;
  year: string;
  type: 'Movie' | 'TV Series';
  posterURL: string;
  isAdded: boolean;
}

interface SearchSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddItem?: (id: string, movieData?: Partial<any>) => void;
  libraryIds?: string[];
}

// Trending movies for initial display
const TRENDING_PLACEHOLDER: SearchResult[] = [
  {
    id: '1',
    title: 'Interstellar',
    year: '2014',
    type: 'Movie',
    posterURL: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    isAdded: false,
  },
  {
    id: '2',
    title: 'Oppenheimer',
    year: '2023',
    type: 'Movie',
    posterURL: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    isAdded: false,
  },
  {
    id: '3',
    title: 'Dune: Part Two',
    year: '2024',
    type: 'Movie',
    posterURL: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    isAdded: true,
  },
  {
    id: '4',
    title: 'The Dark Knight',
    year: '2008',
    type: 'Movie',
    posterURL: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    isAdded: false,
  },
  {
    id: '5',
    title: 'Barbie',
    year: '2023',
    type: 'Movie',
    posterURL: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    isAdded: false,
  },
  {
    id: '6',
    title: 'Stranger Things',
    year: '2016',
    type: 'TV Series',
    posterURL: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg',
    isAdded: false,
  },
];

export function SearchSheet({ visible, onClose, onAddItem, libraryIds = [] }: SearchSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState<SearchResult[]>(TRENDING_PLACEHOLDER);
  const addedItemIds = new Set(libraryIds);

  // Load trending movies on mount
  useEffect(() => {
    if (visible) {
      loadTrendingMovies();
    }
  }, [visible]);

  // Search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setResults([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadTrendingMovies = async () => {
    try {
      const trending = await apiService.getTrendingMovies('week');
      const formattedTrending = trending.slice(0, 6).map((movie) => ({
        id: movie.id,
        title: movie.title,
        year: movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A',
        type: 'Movie' as const,
        posterURL: movie.posterURL || 'https://via.placeholder.com/500x750?text=No+Poster',
        isAdded: addedItemIds.has(movie.id),
      }));
      setTrendingMovies(formattedTrending);
    } catch (error) {
      console.error('Failed to load trending movies:', error);
    }
  };

  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const searchResults = await apiService.searchMulti(query);
      const formattedResults = searchResults.map((item) => ({
        ...item,
        isAdded: addedItemIds.has(item.id),
      }));
      setResults(formattedResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToggle = async (item: SearchResult) => {
    const nextIsAdded = !item.isAdded;

    // Optimistic UI - update immediately
    const updateItemState = (items: SearchResult[]) =>
      items.map((i) => (i.id === item.id ? { ...i, isAdded: nextIsAdded } : i));

    setResults(updateItemState);
    setTrendingMovies(updateItemState);

    if (!nextIsAdded) {
      onAddItem?.(item.id);
      return;
    }

    // Fetch full details in background
    try {
      console.log('Fetching details for:', item.title, 'Type:', item.type);

      if (item.type === 'Movie') {
        const details = await apiService.getMovieDetailsWithRT(item.id);
        console.log('✅ SearchSheet - Movie details fetched:', {
          title: details.title,
          rating: details.rating,
          rtScore: details.rottenTomatoesScore,
        });

        onAddItem?.(item.id, {
          title: details.title,
          posterURL: details.posterURL,
          backdropURL: details.backdropURL,
          releaseDate: details.releaseDate,
          overview: details.overview,
          genres: details.genres,
          cast: details.cast,
          rating: details.rating,
          rottenTomatoesScore: details.rottenTomatoesScore,
          runtime: details.runtime,
          director: details.director,
        });
      } else {
        // TV Series
        const details = await apiService.getTVSeriesDetails(item.id);
        console.log('✅ SearchSheet - TV details fetched:', {
          title: details.title,
          rating: details.rating,
          rtScore: details.rottenTomatoesScore,
        });

        onAddItem?.(item.id, {
          title: details.title,
          posterURL: details.posterURL,
          backdropURL: details.backdropURL,
          firstAirDate: details.firstAirDate,
          overview: details.overview,
          genres: details.genres,
          cast: details.cast,
          rating: details.rating,
          rottenTomatoesScore: details.rottenTomatoesScore,
          numberOfSeasons: details.numberOfSeasons,
          numberOfEpisodes: details.numberOfEpisodes,
        });
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
      // Fallback to basic info
      onAddItem?.(item.id, {
        title: item.title,
        posterURL: item.posterURL,
        releaseDate: item.year,
        overview: '',
        genres: [],
        cast: [],
      });
    }
  };

  const displayResults = searchQuery.trim() ? results : trendingMovies;

  const renderItem = ({ item }: { item: SearchResult }) => (
    <View style={styles.resultItem}>
      <Image source={{ uri: item.posterURL }} style={styles.poster} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.meta}>
          {item.year} • {item.type}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleAddToggle(item)}
        accessibilityLabel={item.isAdded ? 'Added to library' : 'Add to library'}
        accessibilityRole="button"
      >
        <Text style={[styles.actionIcon, item.isAdded && styles.actionIconAdded]}>
          {item.isAdded ? '✓' : '+'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Drag indicator */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search movies and TV shows..."
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Section Title */}
        {!searchQuery.trim() && (
          <Text style={styles.sectionTitle}>Trending This Week</Text>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2B7FFF" />
          </View>
        )}

        {/* Results List */}
        {!isLoading && (
          <FlatList
            data={displayResults}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          />
        )}

        {/* No Results */}
        {!isLoading && searchQuery.trim() && displayResults.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>Try a different search term</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'SF Pro Display', default: 'System' }),
    fontSize: 20,
    fontWeight: '500',
    color: '#0A0A0A',
    letterSpacing: -0.45,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 16,
    color: '#000000',
    letterSpacing: -0.31,
  },
  sectionTitle: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 14,
  },
  poster: {
    width: 48,
    height: 72,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 14,
    fontWeight: '400',
    color: '#0A0A0A',
    letterSpacing: -0.15,
    lineHeight: 20,
    marginBottom: 2,
  },
  meta: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 16,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
  },
  actionIconAdded: {
    color: '#0D7CFD',
    fontSize: 16,
  },
});
