import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SPACING, TYPOGRAPHY, COLORS, RADIUS } from '../../utils/constants';
import { LibraryItem } from '../../utils/types';

const POSTER_WIDTH = 150;
const POSTER_HEIGHT = 226;

interface MovieCardProps {
  item: LibraryItem;
  onPress?: () => void;
}

const ICON_SIZE = 16;

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
            <>
              <Image source={require('../../../assets/Tomatos.png')} style={styles.icon} resizeMode="contain" />
              <Text style={styles.rating}>{rottenTomatoesScore}%</Text>
            </>
          )}
          {rating != null && (
            <>
              <Image source={require('../../../assets/tmdb.png')} style={styles.icon} resizeMode="contain" />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            </>
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
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.tertiary,
  },
  title: {
    fontSize: TYPOGRAPHY.subhead,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  rating: {
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.secondary,
  },
});
