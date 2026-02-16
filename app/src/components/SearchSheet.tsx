import React, { useState } from 'react';
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
} from 'react-native';

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

// Mock data for now
const MOCK_RESULTS: SearchResult[] = [
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
  const addedItemIds = new Set(libraryIds);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToggle = (item: SearchResult) => {
    onAddItem?.(item.id, {
      title: item.title,
      posterURL: item.posterURL,
      releaseDate: item.year,
      overview: '',
      genres: [],
      cast: [],
    });
  };

  // Get filtered results with current added state
  const getFilteredResults = (): SearchResult[] => {
    let filtered = MOCK_RESULTS;
    
    if (searchQuery.trim()) {
      filtered = MOCK_RESULTS.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply added state
    return filtered.map((item) => ({
      ...item,
      isAdded: addedItemIds.has(item.id),
    }));
  };

  const results = getFilteredResults();

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
        accessibilityLabel={item.isAdded ? 'Remove from library' : 'Add to library'}
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

        {/* Results List */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        />
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
