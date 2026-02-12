import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const { signInWithGoogle, continueAsGuest, isAuthenticated, isGuestMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme(); // Will be 'dark' forced
  const insets = useSafeAreaInsets();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    continueAsGuest();
  };

  // If authenticated or guest, would navigate to main app
  // For now, just show the auth screen
  if (isAuthenticated || isGuestMode) {
    // TODO: Navigate to ContentView equivalent
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to MovieFriend!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/Container.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark overlay gradient */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.8)']}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        >
          {/* Spacer to push content down */}
          <View style={{ flex: 1 }} />

          {/* Content Container at bottom */}
          <View style={styles.content}>
            {/* Logo - 66x66px with 14px rounded corners */}
            <Image
              source={require('../../assets/Logo.png')}
              style={styles.logo}
              resizeMode="cover"
            />

            {/* App Title */}
            <Text style={styles.appTitle}>MovieFriend</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>Your entertainment library for free</Text>

            {/* Continue with Google Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
              accessibilityLabel="Continue with Google"
              accessibilityHint="Sign in using your Google account"
            >
              <Image
                source={require('../../assets/Google.png')}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Skip for now Button with Blur Effect */}
            <TouchableOpacity
              onPress={handleSkip}
              accessibilityLabel="Skip for now"
              accessibilityHint="Continue using the app without signing in"
              style={styles.skipButtonContainer}
            >
              <BlurView intensity={80} tint="dark" style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </BlurView>
            </TouchableOpacity>

            {/* Bottom safe area padding */}
            <View style={{ height: Math.max(insets.bottom, 32) + 48 }} />
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20, // iOS standard margin
  },
  logo: {
    width: 66,
    height: 66,
    borderRadius: 14,
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 32, 
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    marginBottom: 25, // 25px gap to Skip button as specified
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  skipButtonContainer: {
    overflow: 'hidden',
    borderRadius: 26, // Fully rounded pill shape from Figma
  },
  skipButton: {
    height: 44,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 37, 37, 0.55)', // Base background from Figma
    borderRadius: 26,
  },
  skipButtonText: {
    fontSize: 15, // 15px from Figma
    fontWeight: '500',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
});
