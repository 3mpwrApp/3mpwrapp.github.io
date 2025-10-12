import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import React from "react";
import { AccessibilityInfo, AppState, Platform, StyleSheet, Text, View } from "react-native";

// internal modules
import ChangelogGate from "../components/ChangelogGate";
import GlobalAssistant from "../components/GlobalAssistant";
import TermsGate from "../components/TermsGate";
import Footer from "../components/ThemedFooter";
import Header from "../components/ThemedHeader";
import { setSessionSeed } from "../services/session";
import { CountsProvider } from "../store/counts";
import { FavoritesProvider } from "../store/favorites";
import { NetworkProvider, useNetwork } from "../store/network";
import { RefreshProvider } from "../store/refresh";
import { useAppPalette } from "../theme/usePalette";
import { announce } from "../utils/announce";
// Ã°Å¸â€Â¹ Replace old AuthProvider with Firebase AuthProvider
import { AuthProvider } from "../context/AuthContext";
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
import { ToastViewport } from "../utils/toast";
// Ã°Å¸â€Â¹ Use Firebase analytics init instead of custom
// removed getFirebaseAnalytics direct import (handled via telemetry module)

export default function RootLayout() {
  // Ensure vector icon fonts are loaded before rendering UI
  const [fontsLoaded] = useFonts({
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
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => setReduceMotion(enabled),
    );
    return () => {
      mounted = false;
      // RN <=0.71 returns { remove }, newer returns subscription
      // @ts-ignore
      sub?.remove?.();
    };
  }, []);

  // Notifications setup
  React.useEffect(() => {
    // establish a per-launch session seed (enables suggestion rotation)
    setSessionSeed();
    Notifier.setupAsync();
    Notifier.getExpoPushToken().then((t) => {
      if (t && __DEV__) console.warn("Expo push token:", t);
    });
    // Cleanup any past-due event reminders (fire and forget)
    pruneExpiredReminders().then(r => { if (r.removed && __DEV__) console.warn('Pruned reminders', r.removed); }).catch(()=>{});
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
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") { prefetch(); maybeRunPruneCycle().catch(()=>{}); }
    });
    return () => {
      mounted = false;
      clearTimeout(t);
      // @ts-ignore RN versions return different shapes
      sub?.remove?.();
    };
  }, []);

  return (
    // Avoid rendering until fonts are available to prevent missing glyphs (X boxes)
    fontsLoaded ? (
    <I18nProvider>
      <A11ySettingsProvider>
        <SettingsProvider>
          <CoachProgressProvider>
          <ResilienceProvider>
          <BookmarksProvider>
          <ProfileLocalProvider>
            <PrivacyProvider>
              {/* Ã°Å¸â€Â¹ Firebase Auth Provider wraps the app */}
              <AuthProvider>
                <FavoritesProvider>
                  <CountsProvider>
                    <NetworkProvider>
                      <RefreshProvider>
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
                              <NotificationsProvider>
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
                              </NotificationsProvider>
                            </ChangelogGate>
                          </TermsGate>
                          <GlobalAssistant />
                          <ToastViewport />
                          {/* Show footer only on web to avoid overlapping native tab bar */}
                          {Platform.OS === 'web' ? <Footer /> : null}
                        </View>
                        </JurisdictionProvider>
                        </BlocksProvider>
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
      </A11ySettingsProvider>
    </I18nProvider>
  ) : null
  );
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
      if (dsn) initSentry(dsn);
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
    import("../services/security").then(({ initializeSecurity }) => {
      return initializeSecurity({
        enableTamperDetection: true,
        enableRootJailbreakCheck: true,
        enableIntegrityValidation: true,
        enableSecureStorage: true,
        strictBYOCMode: process.env.EXPO_PUBLIC_DATA_POLICY === 'strict_byoc',
        allowDebugging: __DEV__
      });
    }).then((success: boolean) => {
      if (__DEV__) {
        console.warn('🔒 Security framework initialized:', success ? 'SUCCESS' : 'FAILED');
      }
    }).catch((error: Error) => {
      if (__DEV__) {
        console.error('🔒 Security initialization error:', error);
      }
    });
  }, []);
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




