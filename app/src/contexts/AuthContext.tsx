import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { Config } from '../config';
import { supabase } from '../lib/supabase';

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
      // Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        setIsGuestMode(false);
        setCurrentUserId(session.user.id);
      } else {
        // Check for guest mode
        const anonymousId = await AsyncStorage.getItem('anonymousUserId');
        if (anonymousId) {
          setIsGuestMode(true);
          setIsAuthenticated(false);
          setCurrentUserId(anonymousId);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const handleGoogleResponse = async (authentication: any) => {
    try {
      // Sign in with Supabase using Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: authentication.idToken,
      });

      if (error) throw error;

      if (data.user) {
        setCurrentUserId(data.user.id);
        setIsAuthenticated(true);
        setIsGuestMode(false);

        // Handle pending link token if any
        if (pendingLinkToken) {
          console.log('Linking social media account with token:', pendingLinkToken);
          // await APIService.linkAccount(data.user.id, pendingLinkToken);
          setPendingLinkToken(null);
        }
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

      // Sign in with Supabase using Apple identity token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });

      if (error) throw error;

      if (data.user) {
        setCurrentUserId(data.user.id);
        setIsAuthenticated(true);
        setIsGuestMode(false);

        // Handle pending link token if any
        if (pendingLinkToken) {
          console.log('Linking social media account with token:', pendingLinkToken);
          // await APIService.linkAccount(data.user.id, pendingLinkToken);
          setPendingLinkToken(null);
        }

        console.log('Apple sign-in successful');
      }
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
      await supabase.auth.signOut();
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
