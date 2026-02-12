import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import ChevronIcon from '../../../assets/chevron-right.svg';
import { SPACING } from '../../utils/constants';

export type LibraryMode = 'movies' | 'tv';

const OPTIONS: { value: LibraryMode; label: string }[] = [
  { value: 'movies', label: 'My Movies' },
  { value: 'tv', label: 'TV Shows' },
];

interface HeaderTitleProps {
  mode: LibraryMode;
  onModeChange: (mode: LibraryMode) => void;
}

export function HeaderTitle({ mode, onModeChange }: HeaderTitleProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const currentLabel = OPTIONS.find((o) => o.value === mode)?.label ?? 'My Movies';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setDropdownVisible(!dropdownVisible)}
        activeOpacity={0.7}
        accessibilityLabel={`${currentLabel}, tap to change`}
        accessibilityRole="button"
      >
        <Text style={styles.title} numberOfLines={1}>
          {currentLabel}
        </Text>
        <ChevronIcon width={19} height={11} style={styles.chevron} />
      </TouchableOpacity>

      {dropdownVisible && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setDropdownVisible(false)} />
          <View style={styles.dropdownWrapper}>
            <BlurView intensity={40} tint="light" style={styles.dropdown}>
              {OPTIONS.map((opt, index) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.option}
                  onPress={() => {
                    onModeChange(opt.value);
                    setDropdownVisible(false);
                  }}
                  accessibilityLabel={opt.label}
                  accessibilityRole="menuitem"
                >
                  <Text style={styles.emoji}>{index === 0 ? '🎬' : '🍿'}</Text>
                  <Text style={styles.optionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: Platform.select({ ios: 'SF Pro Display', default: 'System' }),
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.374,
    lineHeight: 41,
  },
  chevron: {
    marginLeft: 4,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownWrapper: {
    position: 'absolute',
    top: 50,
    left: 0,
    zIndex: 1000,
  },
  dropdown: {
    overflow: 'hidden',
    borderRadius: 32,
    backgroundColor: 'rgba(245, 245, 245, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: 160,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 6,
  },
  emoji: {
    fontSize: 15,
    width: 28,
    textAlign: 'center',
    marginRight: 8,
  },
  optionText: {
    fontFamily: Platform.select({ ios: 'SF Pro', default: 'System' }),
    fontSize: 15,
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
});
