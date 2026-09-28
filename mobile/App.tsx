// VelaiConnect – வேலைConnect : App entry
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context';
import { RootNavigator } from './src/Navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
