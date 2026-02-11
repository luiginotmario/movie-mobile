import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import AuthScreen from './src/screens/AuthScreen';

export default function App() {
  return (
    <AuthProvider>
      <AuthScreen />
    </AuthProvider>
  );
}
