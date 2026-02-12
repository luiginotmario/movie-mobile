import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LibraryItem } from '../../utils/types';

const POSTER_WIDTH = 178;
const POSTER_HEIGHT = 232;
const ICON_SIZE = 20;

interface MovieCardProps {
  item: LibraryItem;
  onPress?: () => void;
}

export function MovieCard({ item, onPress }: MovieCardProps) {
  const title = item.title;
  const posterURL = item.posterURL;
  const rating = 'rating' in item ? item.rating : undefined;
  const rottenTomatoesScore = 'rottenTomatoesScore' in item ? item.rottenTomatoesScore : undefined;

  const hasRating = rating != null || rottenTomatoesScore != null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <View style={styles.posterWrapper}>
        {posterURL ? (
          <Image
            source={{ uri: posterURL }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.placeholderText}>No poster</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {hasRating && (
        <View style={styles.ratingRow}>
          {rottenTomatoesScore != null && (
            <View style={styles.ratingGroup}>
              <Image source={require('../../../assets/Tomatos.png')} style={styles.icon} resizeMode="contain" />
              <Text style={styles.rating}>{rottenTomatoesScore}%</Text>
            </View>
          )}
          {rottenTomatoesScore != null && rating != null && (
            <Text style={styles.separator}>·</Text>
          )}
          {rating != null && (
            <View style={styles.ratingGroup}>
              <Image source={require('../../../assets/tmdb.png')} style={styles.icon} resizeMode="contain" />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: POSTER_WIDTH,
  },
  posterWrapper: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  title: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.408,
    lineHeight: 22,
    marginBottom: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  separator: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)',
    letterSpacing: -0.408,
    lineHeight: 22,
  },
  rating: {
    fontFamily: Platform.select({ ios: 'SF Pro Text', default: 'System' }),
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)',
    letterSpacing: -0.408,
    lineHeight: 22,
  },
});
