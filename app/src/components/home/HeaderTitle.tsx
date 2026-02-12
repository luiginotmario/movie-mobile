import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SPACING, TYPOGRAPHY, COLORS, RADIUS } from '../../utils/constants';

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
        onPress={() => setDropdownVisible(true)}
        accessibilityLabel={`${currentLabel}, tap to change`}
        accessibilityRole="button"
      >
        <Text style={styles.title} numberOfLines={1}>
          {currentLabel}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
          <Pressable style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
            <BlurView intensity={80} tint="dark" style={styles.blur}>
              {OPTIONS.map((opt) => (
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
                  <Text style={[styles.optionText, opt.value === mode && styles.optionTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.title,
    fontWeight: '500',
    color: COLORS.primary,
    maxWidth: 280,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.primary,
    transform: [{ rotate: '90deg' }],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dropdown: {
    ...Platform.select({
      ios: {
        overflow: 'hidden',
        borderRadius: RADIUS.lg,
      },
      android: {
        borderRadius: RADIUS.lg,
      },
    }),
    minWidth: 200,
  },
  blur: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(37, 37, 37, 0.6)',
    borderRadius: RADIUS.lg,
  },
  option: {
    paddingVertical: SPACING.md,
  },
  optionText: {
    fontSize: TYPOGRAPHY.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
