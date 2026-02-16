import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LibraryItem } from '../utils/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MovieDetailScreenProps {
  item: LibraryItem;
  onBack: () => void;
}

// Mock streaming providers
const STREAMING_PROVIDERS = [
  { id: '1', name: 'Netflix', logo: 'https://via.placeholder.com/42' },
  { id: '2', name: 'Prime Video', logo: 'https://via.placeholder.com/42' },
  { id: '3', name: 'Disney+', logo: 'https://via.placeholder.com/42' },
  { id: '4', name: 'HBO Max', logo: 'https://via.placeholder.com/42' },
];

// Mock cast
const MOCK_CAST = [
  { id: '1', name: 'Cillian Murphy', photo: 'https://via.placeholder.com/80' },
  { id: '2', name: 'Emily Blunt', photo: 'https://via.placeholder.com/80' },
  { id: '3', name: 'Robert Downey Jr.', photo: 'https://via.placeholder.com/80' },
  { id: '4', name: 'Matt Damon', photo: 'https://via.placeholder.com/80' },
];

export function MovieDetailScreen({ item, onBack }: MovieDetailScreenProps) {
  const getYear = () => {
    const releaseDate = 'releaseDate' in item ? item.releaseDate : 'firstAirDate' in item ? item.firstAirDate : null;
    if (!releaseDate) return 'N/A';
    return releaseDate.split('-')[0];
  };

  const getGenres = () => {
    const genres = 'genres' in item ? item.genres : [];
    if (!genres || genres.length === 0) return 'Action · Sci-fi';
    return genres.map((g: { name: string }) => g.name).join(' · ');
  };

  const rottenTomatoesScore = 'rottenTomatoesScore' in item ? item.rottenTomatoesScore : undefined;
  const rating = 'rating' in item ? item.rating : undefined;

  return (
    <View style={styles.container}>
      {/* Background Poster - Fixed */}
      <Image
        source={{ uri: item.posterURL }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.backgroundOverlay} />

      {/* Ratings Badge - Fixed */}
      <View style={styles.ratingsBadge}>
            <BlurView intensity={80} tint="dark" style={styles.ratingsBadgeBlur}>
              <View style={styles.ratingsContent}>
                {rottenTomatoesScore && (
                  <>
                    <Image
                      source={require('../../assets/Tomatos.png')}
                      style={styles.ratingIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.ratingText}>{rottenTomatoesScore}%</Text>
                    <Text style={styles.ratingSeparator}>·</Text>
                  </>
                )}
                {rating && (
                  <>
                    <Image
                      source={require('../../assets/tmdb.png')}
                      style={styles.ratingIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                  </>
                )}
              </View>
            </BlurView>
          </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Title Info */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{item.title.toUpperCase()}</Text>
            <Text style={styles.metadata}>
              {'Movie' in item ? 'Movie' : 'TV Series'} · {getYear()} · 30 min
            </Text>
            <Text style={styles.genres}>🎭 {getGenres()}</Text>
          </View>

          {/* Buttons Row */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.trailerButton}>
              <Text style={styles.trailerButtonText}>▶ Trailer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconButtonText}>􀈂</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.glassCard}>
            <BlurView intensity={80} tint="dark" style={styles.glassCardBlur}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {item.overview ||
                  'Narrated by Simon Smith, this documentary showcases nature\'s heroes from different places of Earth. Spotlighting amazing creatures and.'}
              </Text>
            </BlurView>
          </View>

          {/* Where to Watch */}
          <View style={styles.whereSection}>
            <View style={styles.whereSectionHeader}>
              <Text style={styles.sectionTitle}>Where to watch</Text>
              <View style={styles.countryBadge}>
                <View style={styles.countryDot} />
                <Text style={styles.countryText}>US</Text>
              </View>
            </View>

            <View style={styles.providersGrid}>
              {STREAMING_PROVIDERS.map((provider) => (
                <View key={provider.id} style={styles.providerCard}>
                  <BlurView intensity={80} tint="dark" style={styles.providerCardBlur}>
                    <Image
                      source={{ uri: provider.logo }}
                      style={styles.providerLogo}
                      resizeMode="contain"
                    />
                    <View style={styles.providerInfo}>
                      <Text style={styles.providerName}>{provider.name}</Text>
                      <Text style={styles.providerIcon}>􀱀</Text>
                    </View>
                  </BlurView>
                </View>
              ))}
            </View>
          </View>

          {/* Cast */}
          <View style={styles.glassCard}>
            <BlurView intensity={80} tint="dark" style={styles.glassCardBlur}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castScroll}
              >
                {MOCK_CAST.map((actor) => (
                  <View key={actor.id} style={styles.castItem}>
                    <Image
                      source={{ uri: actor.photo }}
                      style={styles.castPhoto}
                      resizeMode="cover"
                    />
                    <Text style={styles.castName}>{actor.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </BlurView>
          </View>
        </View>
      </ScrollView>

      {/* Back Button - Fixed Position */}
      <SafeAreaView style={styles.backButtonContainer} edges={['top']}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <BlurView intensity={80} tint="light" style={styles.backButtonBlur}>
            <Text style={styles.backButtonIcon}>􀆉</Text>
          </BlurView>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 462,
    paddingBottom: 40,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: '100%',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  ratingsBadge: {
    position: 'absolute',
    top: 85,
    right: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    zIndex: 10,
  },
  ratingsBadgeBlur: {
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  ratingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingIcon: {
    width: 20,
    height: 20,
  },
  ratingText: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.408,
    lineHeight: 22,
  },
  ratingSeparator: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  contentSection: {
    paddingHorizontal: 17,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontFamily: Platform.select({ ios: 'SF Pro Display', default: 'System' }),
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.374,
    lineHeight: 41,
    marginBottom: 7,
  },
  metadata: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 13,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.078,
    lineHeight: 16,
    marginBottom: 5,
  },
  genres: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 13,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  trailerButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailerButtonText: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 16,
    fontWeight: '400',
    color: '#0A0A0A',
    letterSpacing: -0.31,
  },
  iconButton: {
    width: 68,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
    color: '#000000',
  },
  glassCard: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    marginBottom: 21,
  },
  glassCardBlur: {
    padding: 17,
  },
  sectionTitle: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.24,
    lineHeight: 20,
    marginBottom: 12,
  },
  descriptionText: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  whereSection: {
    marginBottom: 21,
  },
  whereSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  countryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D7CFD',
  },
  countryText: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.24,
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  providerCard: {
    width: (SCREEN_WIDTH - 34 - 10) / 2,
    height: 102,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  providerCardBlur: {
    flex: 1,
    padding: 7,
  },
  providerLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 9,
  },
  providerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerName: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 20,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.24,
  },
  providerIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  castScroll: {
    gap: 25,
    paddingTop: 10,
  },
  castItem: {
    alignItems: 'center',
    width: 80,
  },
  castPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  castName: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 15,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    marginLeft: 32,
    marginTop: 31,
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonIcon: {
    fontSize: 17,
    color: '#000000',
  },
});
