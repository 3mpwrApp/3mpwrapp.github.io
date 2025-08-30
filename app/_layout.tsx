import { Stack, usePathname } from "expo-router";
import React from "react";
import { AccessibilityInfo } from "react-native";
import { FavoritesProvider } from "../store/favorites";
import { CountsProvider } from "../store/counts";
import { RefreshProvider } from "../store/refresh";
import { NetworkProvider } from "../store/network";
import { AuthProvider } from "../store/auth";
import Header from "../components/ThemedHeader";
import Footer from "../components/ThemedFooter";
import { I18nProvider } from "../i18n";
import * as Notifier from "../services/notifications";
import { initAnalytics } from "../services/analytics";

export default function RootLayout() {
  const [reduceMotion, setReduceMotion] = React.useState(false);

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

  React.useEffect(() => {
    // best-effort notification permission
    Notifier.setupAsync();
  }, []);

  React.useEffect(() => {
    // Initialize Firebase and analytics (web only)
    initAnalytics();
  }, []);

  // Announce route changes to screen readers
  const pathname = usePathname();
  React.useEffect(() => {
    if (!pathname) return;
    const readable = pathname === "/" ? "Home" : pathname.replace(/[/()-]+/g, " ").trim();
    AccessibilityInfo.announceForAccessibility?.(`${readable}`);
  }, [pathname]);

  return (
    <>
      <I18nProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CountsProvider>
              <NetworkProvider>
                <RefreshProvider>
                  <Header />
                  <Stack screenOptions={{ animation: reduceMotion ? "none" : "default" }}>
                    <Stack.Screen name="profile" options={{ headerShown: false }} />
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: "modal" }} />
                  </Stack>
                  <Footer />
                </RefreshProvider>
              </NetworkProvider>
            </CountsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </I18nProvider>
    </>
  );
}
