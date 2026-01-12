/* eslint-disable no-restricted-syntax */
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { Platform, Text, View } from "react-native";

import { RootProviders } from "../components/RootProviders";

// Safe error handlers
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message?.includes('ResizeObserver')) return;
    if (!event.error && !event.message) return;
    console.error('[GlobalError]', event.message);
  });
  
  // Handle unhandled promise rejections (like the 6000ms timeout)
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason);
    // Suppress known timeout errors in development
    if (__DEV__ && msg?.includes('timeout')) {
      console.warn('[UnhandledPromise] Timeout (suppressed):', msg);
      event.preventDefault(); // Prevent console error
      return;
    }
    console.error('[UnhandledPromise]', msg);
  });
}

if (__DEV__) console.warn('[RootLayout] Starting...');

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts(
    {},
    { timeout: 10000 } // Increase timeout to 10 seconds
  );

  if (__DEV__) console.warn('[RootLayout] Render - fontsLoaded:', fontsLoaded);

  if (!fontsLoaded && !fontsError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  try {
    if (__DEV__) console.warn('[RootLayout] Rendering Stack with all routes...');
    return (
      <RootProviders>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RootProviders>
    );
  } catch (err) {
    console.error('[RootLayout] Error:', err);
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#c00', marginBottom: 10 }}>
          Error
        </Text>
        <Text style={{ fontSize: 12, color: '#333' }}>
          {String(err)}
        </Text>
      </View>
    );
  }
}