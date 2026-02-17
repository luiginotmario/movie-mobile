import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Share,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { LibraryItem } from '../utils/types';
import APIService from '../services/APIService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MovieDetailScreenProps {
  item: LibraryItem;
  onBack: () => void;
  onToggleLibrary: () => void;
  isInLibrary?: boolean;
}

export function MovieDetailScreen({ item, onBack, onToggleLibrary, isInLibrary = false }: MovieDetailScreenProps) {
  const [cast, setCast] = useState<Array<{ id: string; name: string; photo: string }>>([]);
  const [providers, setProviders] = useState<Array<{ id: number; name: string; logo: string }>>([]);
  const [trailerURL, setTrailerURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMovieDetails();
  }, [item.id]);

  const loadMovieDetails = async () => {
    setIsLoading(true);
    try {
      const isTV = 'numberOfSeasons' in item;
      const mediaType = isTV ? 'tv' : 'movie';
      const tmdbAPIKey = 'f99c4bd4f3af30bde84b8fbe75f56aa8'; // From your env
      
      console.log('🎬 MovieDetail - Loading details for:', item.title);
      console.log('🎬 MovieDetail - Media Type:', mediaType, 'ID:', item.id);
      console.log('🎬 MovieDetail - Credits URL:', `https://api.themoviedb.org/3/${mediaType}/${item.id}/credits?api_key=${tmdbAPIKey}`);
      console.log('🎬 MovieDetail - Providers URL:', `https://api.themoviedb.org/3/${mediaType}/${item.id}/watch/providers?api_key=${tmdbAPIKey}`);
      console.log('🎬 MovieDetail - Videos URL:', `https://api.themoviedb.org/3/${mediaType}/${item.id}/videos?api_key=${tmdbAPIKey}`);
      
      // Fetch cast, watch providers, and videos
      const [castResponse, providersResponse, videosResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/${mediaType}/${item.id}/credits?api_key=${tmdbAPIKey}`).then(r => r.json()),
        fetch(`https://api.themoviedb.org/3/${mediaType}/${item.id}/watch/providers?api_key=${tmdbAPIKey}`).then(r => r.json()),
        fetch(`https://api.themoviedb.org/3/${mediaType}/${item.id}/videos?api_key=${tmdbAPIKey}`).then(r => r.json()),
      ]);
      
      console.log('🎬 MovieDetail - Cast count:', castResponse.cast?.length || 0);
      console.log('🎬 MovieDetail - Providers results:', Object.keys(providersResponse.results || {}));
      console.log('🎬 MovieDetail - Videos count:', videosResponse.results?.length || 0);
      
      // Parse cast
      const castData = castResponse.cast?.slice(0, 10).map((person: any) => ({
        id: String(person.id),
        name: person.name,
        photo: person.profile_path
          ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
          : 'https://via.placeholder.com/185x278?text=No+Photo',
      })) || [];
      setCast(castData);
      
      // Parse providers and deduplicate aggressively
      const regionData = providersResponse.results?.US;
      const providersData = regionData?.flatrate || [];
      
      console.log('🎬 MovieDetail - US Region Data:', regionData ? 'Found' : 'Not Found');
      console.log('🎬 MovieDetail - Flatrate providers count:', providersData.length);
      
      const uniqueProviders = new Map();
      providersData.forEach((provider: any) => {
        // Extract base name - remove everything after space that's not part of the main brand
        let baseName = provider.provider_name;
        
        // Remove common channel suffixes
        baseName = baseName
          .replace(/\s+(Amazon|Roku|Apple TV|Prime Video)\s+Channel$/i, '')
          .replace(/\s+via\s+.+$/i, '')
          .replace(/\s+Premium\s+Channel$/i, '')
          .replace(/\s+Channel$/i, '')
          .trim();
        
        // For Paramount specifically, extract just "Paramount+"
        if (baseName.toLowerCase().includes('paramount')) {
          baseName = 'Paramount+';
        }
        
        console.log('Provider mapping:', provider.provider_name, '->', baseName);
        
        if (!uniqueProviders.has(baseName)) {
          uniqueProviders.set(baseName, {
            id: provider.provider_id,
            name: baseName,
            logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
          });
        }
      });
      
      setProviders(Array.from(uniqueProviders.values()));
      
      // Parse trailer - find the first YouTube trailer (store just the key)
      const trailer = videosResponse.results?.find(
        (video: any) => video.site === 'YouTube' && video.type === 'Trailer'
      );
      if (trailer) {
        setTrailerURL(trailer.key); // Just the YouTube video ID
        console.log('🎬 Trailer found:', trailer.key);
      }
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getYear = () => {
    const releaseDate = 'releaseDate' in item ? item.releaseDate : 'firstAirDate' in item ? item.firstAirDate : null;
    if (!releaseDate || typeof releaseDate !== 'string') return 'N/A';
    return releaseDate.split('-')[0];
  };

  const getGenres = () => {
    const genres = 'genres' in item ? item.genres : [];
    if (!genres || genres.length === 0) return 'Action · Sci-fi';
    return genres.join(' · ');
  };

  const rottenTomatoesScore = 'rottenTomatoesScore' in item ? item.rottenTomatoesScore : undefined;
  const rating = 'rating' in item ? item.rating : undefined;
  
  console.log('🎬 MovieDetail - Item:', item.title);
  console.log('🎬 MovieDetail - RT Score:', rottenTomatoesScore);
  console.log('🎬 MovieDetail - TMDB Rating:', rating);

  const handleShare = async () => {
    try {
      const shareOptions: any = {
        title: item.title,
        message: `Check out ${item.title}!`,
      };
      
      if (Platform.OS === 'ios' && item.posterURL) {
        shareOptions.url = item.posterURL;
      }
      
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleTrailer = async () => {
    if (!trailerURL) {
      console.log('No trailer available');
      return;
    }
    
    const youtubeURL = `https://www.youtube.com/watch?v=${trailerURL}`;
    try {
      const supported = await Linking.canOpenURL(youtubeURL);
      if (supported) {
        await Linking.openURL(youtubeURL);
      } else {
        console.error("Can't open YouTube URL");
      }
    } catch (error) {
      console.error('Error opening trailer:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Poster - Fixed */}
      <Image
        source={{ uri: item.posterURL }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.backgroundOverlay} />
      
      {/* Top Gradient for cleaner fade */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0)']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* Ratings Badge - Fixed */}
      {(rottenTomatoesScore || rating) && (
        <SafeAreaView style={styles.ratingsBadgeContainer} edges={['top']}>
          <View style={styles.ratingsBadge}>
            <View style={styles.glassBorder} />
            <View style={styles.glassBackground} />
            <BlurView intensity={95} tint="dark" style={styles.ratingsBadgeBlur}>
              <View style={styles.ratingsContent}>
                {rottenTomatoesScore != null && (
                  <>
                    <Image
                      source={require('../../assets/Tomatos.png')}
                      style={styles.ratingIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.ratingText}>{rottenTomatoesScore}%</Text>
                    {rating != null && <Text style={styles.ratingSeparator}>·</Text>}
                  </>
                )}
                {rating != null && (
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
        </SafeAreaView>
      )}

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
            <TouchableOpacity 
              style={[styles.trailerButton, !trailerURL && styles.trailerButtonDisabled]} 
              onPress={handleTrailer}
              disabled={!trailerURL}
            >
              <Text style={[styles.trailerButtonText, !trailerURL && styles.trailerButtonTextDisabled]}>
                ▶ Trailer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, isInLibrary && styles.iconButtonActive]}
              onPress={onToggleLibrary}
            >
              {isInLibrary ? (
                <Text style={styles.checkmarkIcon}>✓</Text>
              ) : (
                <Image
                  source={require('../../assets/Icon.png')}
                  style={styles.plusIcon}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Image
                source={require('../../assets/SF Symbol.png')}
                style={styles.shareIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Description */}
          {item.overview && (
            <View style={styles.glassCard}>
              <View style={styles.glassBorder} />
              <View style={styles.glassBackground} />
              <BlurView intensity={95} tint="dark" style={styles.glassCardBlur}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{item.overview}</Text>
              </BlurView>
            </View>
          )}

          {/* Where to Watch */}
          {isLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : providers.length > 0 ? (
            <View style={styles.whereSection}>
              <View style={styles.whereSectionHeader}>
                <Text style={styles.sectionTitle}>Where to watch</Text>
                <View style={styles.countryBadge}>
                  <View style={styles.countryDot} />
                  <Text style={styles.countryText}>US</Text>
                </View>
              </View>

              <View style={styles.providersGrid}>
                {providers.map((provider) => (
                <View key={provider.id} style={styles.providerCard}>
                  <View style={styles.glassBorder} />
                  <View style={styles.glassBackground} />
                  <BlurView intensity={95} tint="dark" style={styles.providerCardBlur}>
                    <Image
                      source={{ uri: provider.logo }}
                      style={styles.providerLogo}
                      resizeMode="contain"
                    />
                    <View style={styles.providerInfo}>
                      <Text style={styles.providerName}>{provider.name}</Text>
                      <Image
                        source={require('../../assets/􀱀.png')}
                        style={styles.providerLinkIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </BlurView>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Cast */}
          {isLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : cast.length > 0 ? (
            <View style={styles.glassCard}>
              <View style={styles.glassBorder} />
              <View style={styles.glassBackground} />
              <BlurView intensity={95} tint="dark" style={styles.glassCardBlur}>
                <Text style={styles.sectionTitle}>Cast</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.castScroll}
                >
                  {cast.map((actor) => (
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
          ) : null}
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
            <Image
              source={require('../../assets/chevron-back.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
            />
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 5,
  },
  ratingsBadgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  ratingsBadge: {
    marginTop: 31,
    marginRight: 17,
    borderRadius: 25,
    overflow: 'hidden',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    pointerEvents: 'none',
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    pointerEvents: 'none',
  },
  loadingSection: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  trailerButtonDisabled: {
    backgroundColor: '#FFFFFF40',
  },
  trailerButtonTextDisabled: {
    color: '#FFFFFF60',
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
  iconButtonActive: {
    backgroundColor: '#B6F4C6',
  },
  plusIcon: {
    width: 20,
    height: 20,
  },
  checkmarkIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A7A2E',
  },
  shareIcon: {
    width: 22,
    height: 22,
  },
  glassCard: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 21,
    position: 'relative',
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
    marginBottom: 14,
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
    minWidth: (SCREEN_WIDTH - 34 - 10) / 2,
    maxWidth: (SCREEN_WIDTH - 34 - 10) / 2,
    flex: 1,
    height: 102,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'relative',
  },
  providerCardBlur: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  providerLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 8,
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
  providerLinkIcon: {
    width: 20,
    height: 20,
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
    marginLeft: 17,
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
    width: 14,
    height: 14,
  },
});
