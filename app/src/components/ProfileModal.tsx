import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { SPACING } from '../utils/constants';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { currentUserId, isGuestMode, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          onClose();
        },
      },
    ]);
  };

  const handleFeedback = () => {
    const subject = encodeURIComponent('MovieFriend Feature Request');
    const body = encodeURIComponent('Hi Luigi,\n\nI have a feature request:\n\n');
    Linking.openURL(`mailto:luigi@luigirivolta.com?subject=${subject}&body=${body}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          {/* Avatar */}
          <LinearGradient
            colors={['#51A2FF', '#AD46FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {isGuestMode ? 'U' : currentUserId?.charAt(0).toUpperCase() ?? 'U'}
            </Text>
          </LinearGradient>

          {/* User Info */}
          <Text style={styles.userName}>
            {isGuestMode ? 'Guest User' : 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {isGuestMode ? 'guest@reelkeeper.app' : 'user@reelkeeper.app'}
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Feedback */}
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={handleFeedback}
            accessibilityLabel="Feedback or request a feature"
            accessibilityRole="button"
          >
            <Text style={styles.feedbackText}>Feedback or request a feature</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Sign Out */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: 368,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.155,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    paddingVertical: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.25,
        shadowRadius: 50,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontFamily: Platform.select({ ios: 'Inter', default: 'System' }),
    fontSize: 24,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0.0703,
    lineHeight: 32,
  },
  userName: {
    fontFamily: Platform.select({ ios: 'Inter', default: 'System' }),
    fontSize: 18,
    fontWeight: '400',
    color: '#0A0A0A',
    letterSpacing: -0.4395,
    lineHeight: 28,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: Platform.select({ ios: 'Inter', default: 'System' }),
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    letterSpacing: -0.1504,
    lineHeight: 20,
    marginBottom: 24,
  },
  divider: {
    width: 319.533,
    height: 0.992,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 0,
  },
  feedbackButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  feedbackText: {
    fontFamily: Platform.select({ ios: 'Inter', default: 'System' }),
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.7)',
    letterSpacing: -0.3125,
    lineHeight: 24,
  },
  signOutButton: {
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  signOutText: {
    fontFamily: Platform.select({ ios: 'Inter', default: 'System' }),
    fontSize: 16,
    fontWeight: '400',
    color: '#FB2C36',
    letterSpacing: -0.3125,
    lineHeight: 24,
  },
});
