import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import React from "react";
import { AccessibilityInfo, AppState, Platform, StyleSheet, Text, View } from "react-native";

// Filter console warnings in development during initial load only
// Suppresses known non-critical Expo Go warnings that can't be avoided
if (__DEV__) {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  
  const suppressedPatterns = [
    /expo-notifications.*not fully supported in Expo Go/i,
    /expo-notifications.*not yet fully supported on web/i,
    /Push notifications.*removed from Expo Go/i,
    /Push tokens not available in Expo Go/i,
    /Use a development build/i,
    /We recommend you instead use a development build/i,
    /shadow.*style props are deprecated.*Use.*boxShadow/i,
    /Listening to push token changes is not yet fully supported on web/i,
    /VirtualizedLists should never be nested/i,
    /componentWillReceiveProps has been renamed/i,
    /componentWillMount has been renamed/i,
  ];
  
  const shouldSuppress = (message: string) => {
    return suppressedPatterns.some(pattern => pattern.test(message));
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalWarn.apply(console, args);
    }
  };
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    // Suppress specific errors we can't fix in Expo Go
    const isSentryError = /Cannot read property '__extends' of undefined/.test(message) ||
                          /InternalBytecode/.test(message);
    const isExpoGoWarning = shouldSuppress(message);
    
    if (!isSentryError && !isExpoGoWarning) {
      originalError.apply(console, args);
    }
  };
  
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalLog.apply(console, args);
    }
  };
  
  // Restore original console functions after app loads (10 seconds for web)
  // This ensures real errors during development are still visible
  setTimeout(() => {
    if (__DEV__) {
      console.warn = originalWarn;
      console.error = originalError;
      console.log = originalLog;
    }
  }, 10000);
}

// Type for React Native event subscriptions (compatible with multiple RN versions)
// Older RN: { remove: () => void }, Newer RN: () => void
type RNSubscription = { remove?: () => void } | (() => void) | undefined;

// internal modules
import ChangelogGate from "../components/ChangelogGate";
import DyslexiaVisualLayer from "../components/DyslexiaVisualLayer";
import ErrorBoundary from "../components/ErrorBoundary";
import GlobalAssistant from "../components/GlobalAssistant";
import { SafeProviderWrapper } from "../components/SafeProviderWrapper";
import TermsGate from "../components/TermsGate";
import Footer from "../components/ThemedFooter";
import Header from "../components/ThemedHeader";
import UpdateSplashScreen from "../components/UpdateSplashScreen";
import { channels } from "../data/community";
import { setSessionSeed } from "../services/session";
import { CommunityProvider, useCommunity } from "../store/community";
import { CountsProvider } from "../store/counts";
import { FavoritesProvider } from "../store/favorites";
import { NetworkProvider, useNetwork } from "../store/network";
import { RefreshProvider } from "../store/refresh";
import { useAppPalette } from "../theme/usePalette";
import { announce } from "../utils/announce";
import { logger } from "../utils/logger";
// Ã°Å¸â€Â¹ Replace old AuthProvider with Firebase AuthProvider
import { AuthProvider } from "../context/AuthContext";
import { CognitiveAccessibilityProvider } from "../context/CognitiveAccessibilityContext";
import { DyslexiaProvider } from "../context/DyslexiaContext";
import { NeurodivergentProvider } from "../context/NeurodivergentContext";
import { I18nProvider } from "../i18n";
import { setBetaFlag } from "../services/analytics";
import { fetchCampaigns } from "../services/campaigns";
import { pruneExpiredReminders } from "../services/eventReminders";
import { fetchEvents } from "../services/events";
import { maybeRunPruneCycle } from "../services/evidenceQueue";
import * as Notifier from "../services/notifications";
import { fetchPodcasts } from "../services/podcasts";
import { fetchResources } from "../services/resources";
import { initAnalytics, initSentry } from "../services/telemetry";
import { A11ySettingsProvider } from "../store/a11ySettings";
import { BlocksProvider } from "../store/blocks";
import { BookmarksProvider } from "../store/bookmarks";
import { CoachProgressProvider } from "../store/coachProgress";
import { JurisdictionProvider } from "../store/jurisdiction";
import { NotificationsProvider } from "../store/notifications";
import { First7Provider } from "../store/onboardingFirst7";
import { PrivacyProvider, usePrivacy } from "../store/privacy";
import { ProfileLocalProvider } from "../store/profileLocal";
import { ResilienceProvider } from "../store/resilience";
import { SettingsProvider } from "../store/settings";
import { logError } from '../utils/errorLogger';
import { ToastViewport } from "../utils/toast";
// Ã°Å¸â€Â¹ Use Firebase analytics init instead of custom
// removed getFirebaseAnalytics direct import (handled via telemetry module)

export default function RootLayout() {
  // Ensure vector icon fonts are loaded before rendering UI
  const [fontsLoaded, fontsError] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  const [reduceMotion, setReduceMotion] = React.useState(false);

  // Track reduce motion preference
  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub: RNSubscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => setReduceMotion(enabled),
    );
    return () => {
      mounted = false;
      // Handle different RN version subscription types
      if (sub && 'remove' in sub && typeof sub.remove === 'function') {
        sub.remove();
      }
    };
  }, []);

  // Notifications setup
  React.useEffect(() => {
    // establish a per-launch session seed (enables suggestion rotation)
    setSessionSeed();
    Notifier.setupAsync();
    Notifier.getExpoPushToken().then((t) => {
      if (t && __DEV__) logger.debug("Expo push token:", t);
    });
    // Cleanup any past-due event reminders (fire and forget)
    pruneExpiredReminders().then(r => { if (r.removed && __DEV__) logger.debug('Pruned reminders', r.removed); }).catch(()=>{});
    // Run light pruning cycle (queue cleanup) on start
    maybeRunPruneCycle().catch(()=>{});
  }, []);

  // Announce route changes for screen readers
  const pathname = usePathname();
  React.useEffect(() => {
    if (!pathname) return;
    const readable =
      pathname === "/" ? "Home" : pathname.replace(/[/()-]+/g, " ").trim();
  announce(`${readable}`);
  }, [pathname]);

  // Light prefetch: warm common data caches shortly after mount and on app foreground
  React.useEffect(() => {
    let mounted = true;
    const prefetch = () => {
      // Fire & forget; each service manages its own cache/fallback
      Promise.allSettled([
        fetchPodcasts(),
        fetchResources(),
        fetchCampaigns(),
        fetchEvents(),
      ]).catch(() => {});
    };
    const t = setTimeout(() => mounted && prefetch(), 1200);
    const sub: RNSubscription = AppState.addEventListener("change", (s) => {
      if (s === "active") { prefetch(); maybeRunPruneCycle().catch(()=>{}); }
    });
    return () => {
      mounted = false;
      clearTimeout(t);
      // Handle different RN version subscription types
      if (sub && 'remove' in sub && typeof sub.remove === 'function') {
        sub.remove();
      }
    };
  }, []);

  // Render with fallback if fonts fail to load
  const shouldRender = fontsLoaded || fontsError;
  
  if (fontsError) {
    logError('RootLayout', 'Font loading failed', fontsError);
  }

  try {
    return (
      // Render even if fonts fail to load - prevent white screen
      shouldRender ? (
      <ErrorBoundary>
      <SafeProviderWrapper providerName="RootProviderTree">
      <I18nProvider>
    <CognitiveAccessibilityProvider>
      <DyslexiaProvider>
      <A11ySettingsProvider>
        <NeurodivergentProvider>
          <SettingsProvider>
            <CoachProgressProvider>
            <ResilienceProvider>
            <BookmarksProvider>
            <ProfileLocalProvider>
              <PrivacyProvider>
                {/* 🔹 Firebase Auth Provider wraps the app */}
                <AuthProvider>
                  <UpdateSplashScreen />
                  <FavoritesProvider>
                    <CountsProvider>
                      <NetworkProvider>
                        <RefreshProvider>
                          <CommunityProvider>
                            {/* Ensure a single root element (avoid Fragment) */}
                            <BlocksProvider>
                            <JurisdictionProvider>
                          <View style={{ flex: 1 }}>
                            <View>
                              <OfflineBanner />
                              <Header />
                            </View>
                            <TermsGate>
                              <ChangelogGate>
                                <TelemetryInit />
                                <SecurityInit />
                                <CommunityPreload />
                                <SafeProviderWrapper providerName="NotificationsProvider">
                                  <NotificationsProvider>
                                    <SafeProviderWrapper providerName="First7Provider">
                                      <First7Provider>
                                        <Stack
                                          screenOptions={{
                                            animation: reduceMotion ? "none" : "default",
                                          }}
                                        >
                                          <Stack.Screen
                                            name="profile"
                                            options={{ headerShown: false }}
                                          />
                                          <Stack.Screen
                                            name="(auth)"
                                            options={{ headerShown: false }}
                                          />
                                          <Stack.Screen
                                            name="(tabs)"
                                            options={{ headerShown: false }}
                                          />
                                          <Stack.Screen
                                            name="modal"
                                            options={{ presentation: "modal" }}
                                          />
                                        </Stack>
                                      </First7Provider>
                                    </SafeProviderWrapper>
                                  </NotificationsProvider>
                                </SafeProviderWrapper>
                              </ChangelogGate>
                            </TermsGate>
                            <GlobalAssistant />
                            <DyslexiaVisualLayer />
                            <ToastViewport />
                            {/* Show footer only on web to avoid overlapping native tab bar */}
                            {Platform.OS === 'web' ? <Footer /> : null}
                          </View>
                          </JurisdictionProvider>
                          </BlocksProvider>
                          </CommunityProvider>
                        </RefreshProvider>
                      </NetworkProvider>
                    </CountsProvider>
                  </FavoritesProvider>
                </AuthProvider>
              </PrivacyProvider>
            </ProfileLocalProvider>
            </BookmarksProvider>
            </ResilienceProvider>
            </CoachProgressProvider>
          </SettingsProvider>
          </NeurodivergentProvider>
        </A11ySettingsProvider>
      </DyslexiaProvider>
      </CognitiveAccessibilityProvider>
      </I18nProvider>
      </SafeProviderWrapper>
      </ErrorBoundary>
    ) : null
    );
  } catch (error) {
    logError('RootLayout', 'Render error', error);
    // Emergency fallback - render a basic loading screen
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
}

function TelemetryInit() {
  const { state } = usePrivacy();
  // Mark analytics events as coming from a beta build when explicitly enabled
  React.useEffect(() => {
    try {
      const betaEnv = (process.env.EXPO_PUBLIC_BETA || "").toLowerCase();
      if (betaEnv === "1" || betaEnv === "true") setBetaFlag(true);
    } catch {}
  }, []);
  React.useEffect(() => {
    if (state.errorReportingEnabled) {
      const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN as string | undefined;
      if (dsn) {
        initSentry(dsn).catch((error) => {
          // Silent fail - don't crash the app if Sentry init fails
          if (__DEV__) {
            logError('TelemetryInit', 'Failed to initialize Sentry', error);
          }
        });
      }
    }
  }, [state.errorReportingEnabled]);
  React.useEffect(() => {
    if (state.analyticsEnabled) {
      initAnalytics();
    }
  }, [state.analyticsEnabled]);
  return null;
}

function SecurityInit() {
  React.useEffect(() => {
    // Initialize security framework on app startup
    import("../services/security")
      .then((module) => {
        if (module && typeof module.initializeSecurity === 'function') {
          return module.initializeSecurity({
            enableTamperDetection: true,
            enableRootJailbreakCheck: true,
            enableIntegrityValidation: true,
            enableSecureStorage: true,
            strictBYOCMode: process.env.EXPO_PUBLIC_DATA_POLICY === 'strict_byoc',
            allowDebugging: __DEV__
          });
        } else {
          throw new Error('initializeSecurity is not a function (module may have failed to load)');
        }
      })
      .then((success: boolean) => {
        if (__DEV__) {
          logger.log('🔒 Security framework initialized:', success ? 'SUCCESS' : 'FAILED');
        }
      })
      .catch((error: Error) => {
        // Log error but don't crash the app - security is optional enhancement
        if (__DEV__) {
          logError('SecurityInit', 'Security initialization error', error);
        }
      });
  }, []);
  return null;
}

function CommunityPreload() {
  const { seed } = useCommunity();
  React.useEffect(() => {
    // Performance monitoring: track community preload time
    const startTime = performance.now();
    
    // Pre-load community channels on app startup for faster initial load
    // Threads and comments will load from Firestore in real-time
    seed({ channels, threads: [], comments: [] });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (__DEV__) {
      logger.log('🌐 Community channels pre-loaded:', channels.length, `(${duration.toFixed(2)}ms)`);
    }
     
  }, []); // Only run once on mount - seed function is stable but not memoized
  return null;
}

function OfflineBanner() {
  const { offline } = useNetwork();
  const palette = useAppPalette();
  if (!offline) return null;
  return (
    <View
      style={[bannerStyles.wrap, { backgroundColor: palette.error }]}
      accessibilityRole="alert"
      accessibilityLabel="Offline notice"
    >
      <Text style={[bannerStyles.text, { color: palette.onPrimary }]}>Offline: showing cached content</Text>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  wrap: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  text: { textAlign: "center", fontWeight: "700" },
});




