import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { Config } from '../config';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  isAuthenticated: boolean;
  isGuestMode: boolean;
  isInitialized: boolean;
  currentUserId: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => void;
  handleDeepLink: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingLinkToken, setPendingLinkToken] = useState<string | null>(null);

  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Config.googleiOSClientID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'com.googleusercontent.apps.1092222459837-7do7dilb66ic4hsh8j03q7trjejcpkjh',
      }),
    },
    discovery
  );

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleResponse(authentication);
    }
  }, [response]);

  const checkAuthStatus = async () => {
    try {
      const anonymousId = await AsyncStorage.getItem('anonymousUserId');
      const supabaseId = await AsyncStorage.getItem('supabaseUserId');

      if (anonymousId) {
        setIsGuestMode(true);
        setIsAuthenticated(false);
        setCurrentUserId(anonymousId);
      } else if (supabaseId) {
        setIsAuthenticated(true);
        setIsGuestMode(false);
        setCurrentUserId(supabaseId);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const handleGoogleResponse = async (authentication: any) => {
    try {
      // Here you would typically send the token to your Supabase backend
      // For now, simulate successful login
      const mockUserId = 'google_' + Date.now();
      await AsyncStorage.setItem('supabaseUserId', mockUserId);
      setCurrentUserId(mockUserId);
      setIsAuthenticated(true);
      setIsGuestMode(false);

      // Handle pending link token if any
      if (pendingLinkToken) {
        console.log('Linking social media account with token:', pendingLinkToken);
        // await APIService.linkAccount(mockUserId, pendingLinkToken);
        setPendingLinkToken(null);
      }
    } catch (error) {
      console.error('Error handling Google response:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Here you would send the credential to your Supabase backend
      // For now, simulate successful login
      const mockUserId = 'apple_' + Date.now();
      await AsyncStorage.setItem('supabaseUserId', mockUserId);
      setCurrentUserId(mockUserId);
      setIsAuthenticated(true);
      setIsGuestMode(false);

      // Handle pending link token if any
      if (pendingLinkToken) {
        console.log('Linking social media account with token:', pendingLinkToken);
        // await APIService.linkAccount(mockUserId, pendingLinkToken);
        setPendingLinkToken(null);
      }

      console.log('Apple sign-in successful:', credential);
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled the sign-in
        console.log('Apple sign-in canceled');
      } else {
        console.error('Apple sign-in error:', error);
        throw error;
      }
    }
  };

  const continueAsGuest = async () => {
    try {
      let anonymousId = await AsyncStorage.getItem('anonymousUserId');
      if (!anonymousId) {
        anonymousId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await AsyncStorage.setItem('anonymousUserId', anonymousId);
      }
      setCurrentUserId(anonymousId);
      setIsGuestMode(true);
      setIsAuthenticated(false);
      console.log('Continuing as guest with ID:', anonymousId);
    } catch (error) {
      console.error('Error continuing as guest:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('supabaseUserId');
      await AsyncStorage.removeItem('anonymousUserId');
      setIsAuthenticated(false);
      setIsGuestMode(false);
      setCurrentUserId(null);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeepLink = (token: string) => {
    if (isAuthenticated) {
      // User is logged in, link immediately
      console.log('User already logged in, linking social media account with token:', token);
      // await APIService.linkAccount(currentUserId, token);
    } else {
      // Guest mode or not logged in, save token
      setPendingLinkToken(token);
      console.log('Guest user, saving link token:', token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuestMode,
        isInitialized,
        currentUserId,
        signInWithGoogle,
        signInWithApple,
        continueAsGuest,
        signOut,
        handleDeepLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
