import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type AvatarOption = {
  id: string;
  colors: [string, string];
};

const AVATAR_OPTIONS: AvatarOption[] = [
  { id: '1', colors: ['#FF6B6B', '#FFE66D'] },
  { id: '2', colors: ['#4ECDC4', '#44A08D'] },
  { id: '3', colors: ['#A8E6CF', '#3D84A8'] },
  { id: '4', colors: ['#FFD93D', '#FF6B6B'] },
  { id: '5', colors: ['#C589E8', '#6A4C93'] },
  { id: '6', colors: ['#FF8C42', '#C73E1D'] },
  { id: '7', colors: ['#6C5CE7', '#A29BFE'] },
  { id: '8', colors: ['#00B894', '#00CEC9'] },
];

interface AvatarPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (avatar: AvatarOption) => void;
  currentAvatar?: AvatarOption;
}

export function AvatarPicker({ visible, onClose, onSelect, currentAvatar }: AvatarPickerProps) {
  const handleSelect = (avatar: AvatarOption) => {
    onSelect(avatar);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Avatar</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.grid}>
            {AVATAR_OPTIONS.map((avatar) => (
              <TouchableOpacity
                key={avatar.id}
                onPress={() => handleSelect(avatar)}
                style={[
                  styles.avatarWrapper,
                  currentAvatar?.id === avatar.id && styles.avatarWrapperSelected,
                ]}
              >
                <LinearGradient
                  colors={avatar.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                />
                {currentAvatar?.id === avatar.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontFamily: Platform.select({ ios: 'SF Pro Display', default: 'System' }),
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '300',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
  },
  avatarWrapperSelected: {
    borderColor: '#2B7FFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  checkmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2B7FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export { AVATAR_OPTIONS };
