import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const { signInWithGoogle, continueAsGuest, isAuthenticated, isGuestMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme(); // Will be 'dark' forced

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
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.85)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Top Spacer */}
            <View style={{ height: 120 }} />

            {/* Logo Container */}
            <View style={styles.logoContainer}>
              {/* Logo background - rgb(0.50, 0.23, 0.27) = rgb(127, 59, 69) */}
              <View style={styles.logoBackground}>
                {/* Placeholder for actual logo image */}
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>M</Text>
                </View>
              </View>
            </View>

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
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Skip for now Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              accessibilityLabel="Skip for now"
              accessibilityHint="Continue using the app without signing in"
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>

            {/* Bottom Spacer */}
            <View style={{ height: 96 }} />
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
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 66,
    height: 66,
    borderRadius: 16,
    backgroundColor: 'rgba(127, 59, 69, 0.5)', // rgb(0.50, 0.23, 0.27)
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFF',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF', // UIColor.label in dark mode
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)', // UIColor.secondaryLabel
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 64,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 64,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4285F4', // Google blue
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
  },
  skipButton: {
    height: 44,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)', // UIColor.secondaryLabel
  },
});
