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
          colors={['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.8)']}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        >
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
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    marginBottom: 82,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 69,
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
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
});
