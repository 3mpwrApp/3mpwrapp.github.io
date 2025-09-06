import React from "react";
import { AccessibilityInfo } from "react-native";
import { Stack, usePathname } from "expo-router";

import Header from "../components/ThemedHeader";
import Footer from "../components/ThemedFooter";

import { FavoritesProvider } from "../store/favorites";
import { CountsProvider } from "../store/counts";
import { RefreshProvider } from "../store/refresh";
import { NetworkProvider } from "../store/network";
// ðŸ”¹ Replace old AuthProvider with Firebase AuthProvider
import { AuthProvider } from "../context/AuthContext";
import { SettingsProvider } from "../store/settings";
import { A11ySettingsProvider } from "../store/a11ySettings";
import { I18nProvider } from "../i18n";

import * as Notifier from "../services/notifications";
// ðŸ”¹ Use Firebase analytics init instead of custom
import { getFirebaseAnalytics } from "../firebase/config";

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
      (enabled) => setReduceMotion(enabled)
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

  // ðŸ”¹ Firebase Analytics (web only)
  React.useEffect(() => {
    getFirebaseAnalytics().then((analytics) => {
      if (analytics && __DEV__) {
        console.log("Firebase Analytics initialized");
      }
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
          {/* ðŸ”¹ Firebase Auth Provider wraps the app */}
          <AuthProvider>
            <FavoritesProvider>
              <CountsProvider>
                <NetworkProvider>
                  <RefreshProvider>
                    <Header />
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
                    <Footer />
                  </RefreshProvider>
                </NetworkProvider>
              </CountsProvider>
            </FavoritesProvider>
          </AuthProvider>
        </SettingsProvider>
      </A11ySettingsProvider>
    </I18nProvider>
  );
}



