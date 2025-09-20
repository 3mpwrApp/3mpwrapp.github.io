import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import React from "react";
import { AccessibilityInfo, AppState, StyleSheet, Text, View } from "react-native";

import ChangelogGate from "../components/ChangelogGate";
import TermsGate from "../components/TermsGate";
import Footer from "../components/ThemedFooter";
import Header from "../components/ThemedHeader";
import { CountsProvider } from "../store/counts";
import { FavoritesProvider } from "../store/favorites";
import { NetworkProvider, useNetwork } from "../store/network";
import { RefreshProvider } from "../store/refresh";
import { announce } from "../utils/announce";
// Ã°Å¸â€Â¹ Replace old AuthProvider with Firebase AuthProvider
import { AuthProvider } from "../context/AuthContext";
import { I18nProvider } from "../i18n";
import { fetchCampaigns } from "../services/campaigns";
import { fetchEvents } from "../services/events";
import * as Notifier from "../services/notifications";
import { fetchPodcasts } from "../services/podcasts";
import { fetchResources } from "../services/resources";
import { initAnalytics, initSentry } from "../services/telemetry";
import { A11ySettingsProvider } from "../store/a11ySettings";
import { BookmarksProvider } from "../store/bookmarks";
import { PrivacyProvider, usePrivacy } from "../store/privacy";
import { ProfileLocalProvider } from "../store/profileLocal";
import { SettingsProvider } from "../store/settings";
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
    Notifier.setupAsync();
    Notifier.getExpoPushToken().then((t) => {
      if (t && __DEV__) console.warn("Expo push token:", t);
    });
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
      if (s === "active") prefetch();
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
                        <View style={{ flex: 1 }}>
                          <View>
                            <OfflineBanner />
                            <Header />
                          </View>
                          <TermsGate>
                            <ChangelogGate>
                              <TelemetryInit />
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
                            </ChangelogGate>
                          </TermsGate>
                          <Footer />
                        </View>
                      </RefreshProvider>
                    </NetworkProvider>
                  </CountsProvider>
                </FavoritesProvider>
              </AuthProvider>
            </PrivacyProvider>
          </ProfileLocalProvider>
          </BookmarksProvider>
        </SettingsProvider>
      </A11ySettingsProvider>
    </I18nProvider>
  ) : null
  );
}

function TelemetryInit() {
  const { state } = usePrivacy();
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

function OfflineBanner() {
  const { offline } = useNetwork();
  if (!offline) return null;
  return (
    <View
      style={bannerStyles.wrap}
      accessibilityRole="alert"
      accessibilityLabel="Offline notice"
    >
      <Text style={bannerStyles.text}>Offline: showing cached content</Text>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  wrap: {
    backgroundColor: "#b00020",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  text: { color: "#fff", textAlign: "center", fontWeight: "700" },
});




