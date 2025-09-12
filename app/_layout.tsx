import React from "react";
import { AccessibilityInfo, View, Text, StyleSheet } from "react-native";
import { Stack, usePathname } from "expo-router";

import Header from "../components/ThemedHeader";
import Footer from "../components/ThemedFooter";
import TermsGate from "../components/TermsGate";
import ChangelogGate from "../components/ChangelogGate";

import { FavoritesProvider } from "../store/favorites";
import { CountsProvider } from "../store/counts";
import { RefreshProvider } from "../store/refresh";
import { NetworkProvider, useNetwork } from "../store/network";
// Ã°Å¸â€Â¹ Replace old AuthProvider with Firebase AuthProvider
import { AuthProvider } from "../context/AuthContext";
import { SettingsProvider } from "../store/settings";
import { A11ySettingsProvider } from "../store/a11ySettings";
import { I18nProvider } from "../i18n";
import { ProfileLocalProvider } from "../store/profileLocal";
import { PrivacyProvider, usePrivacy } from "../store/privacy";

import * as Notifier from "../services/notifications";
import { initSentry, initAnalytics } from "../services/telemetry";
// Ã°Å¸â€Â¹ Use Firebase analytics init instead of custom
// removed getFirebaseAnalytics direct import (handled via telemetry module)

export default function RootLayout() {
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
      if (t && __DEV__) console.log("Expo push token:", t);
    });
  }, []);

  // Announce route changes for screen readers
  const pathname = usePathname();
  React.useEffect(() => {
    if (!pathname) return;
    const readable =
      pathname === "/" ? "Home" : pathname.replace(/[/()-]+/g, " ").trim();
    AccessibilityInfo.announceForAccessibility?.(`${readable}`);
  }, [pathname]);

  return (
    <I18nProvider>
      <A11ySettingsProvider>
        <SettingsProvider>
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
        </SettingsProvider>
      </A11ySettingsProvider>
    </I18nProvider>
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




