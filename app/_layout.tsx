import { Stack, usePathname } from "expo-router";
import React from "react";
import { AccessibilityInfo } from "react-native";
import { FavoritesProvider } from "../store/favorites";
import Header from "../components/ThemedHeader";
import Footer from "../components/ThemedFooter";

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

  // Announce route changes to screen readers
  const pathname = usePathname();
  React.useEffect(() => {
    if (!pathname) return;
    const readable = pathname === "/" ? "Home" : pathname.replace(/[/()-]+/g, " ").trim();
    AccessibilityInfo.announceForAccessibility?.(`${readable}`);
  }, [pathname]);

  return (
    <>
      <Header />
      <FavoritesProvider>
        <Stack screenOptions={{ animation: reduceMotion ? "none" : "default" }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </FavoritesProvider>
      <Footer />
    </>
  );
}
