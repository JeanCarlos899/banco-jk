import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { Routes } from './src/routes';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    // Contêiner raiz para lidar com gestos no aplicativo
    <GestureHandlerRootView style={{ flex: 1 }}>   
      <AuthProvider>
        <StatusBar style="auto" />
        <Routes />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

