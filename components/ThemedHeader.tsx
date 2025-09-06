
import React from "react";
import { SafeAreaView, Text, StyleSheet, View, Pressable, Image } from "react-native";
import * as Linking from "expo-linking";
import { usePathname, router } from "expo-router";
import { type Palette } from "../theme/colors";
import { useAppPalette } from "../theme/usePalette";
import { useFavorites } from "../store/favorites";
import { useCounts } from "../store/counts";
import { useNetwork } from "../store/network";
import { useRefresh } from "../store/refresh";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { HIT_SLOP_8, touchTarget } from "../constants/a11y";
import { useTranslation } from "../i18n";
import SettingsLink from "./SettingsLink";

export default function ThemedHeader() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { state } = useFavorites();
  const { counts } = useCounts();
  const { refreshAll } = useRefresh();
  const { offline } = useNetwork();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const favTotal =
    state?.campaign.size +
      state?.resource.size +
      state?.advocate.size +
      state?.podcast.size || 0;

  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();
  React.useEffect(() => {
    if (menuOpen) setMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return (
    <SafeAreaView style={styles.container} accessibilityRole="header">
      {/* Brand */}
      <View style={styles.brand}>
        <Image
          source={require("../assets/images/empowr-logo.png")}
          style={styles.logo}
          accessible
          accessibilityLabel="Empowr logo"
        />
        <Text style={styles.title} accessibilityLabel="Empowr app header">
          Empowr
        </Text>
      </View>

      {/* Right side controls */}
      <View style={styles.right}>
        {/* Social media links */}
        <View
          style={styles.social}
          accessibilityLabel="Social media links"
          accessible
        >
          <Pressable
            onPress={() => Linking.openURL("https://x.com/empowrapp0816")}
            accessibilityRole="link"
            accessibilityLabel="Open Empowr on X (formerly Twitter)"
            hitSlop={HIT_SLOP_8}
            testID="link-social-x"
            focusable
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="logo-twitter" size={20} color={palette.text} />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("https://www.instagram.com/empowrapp/")}
            accessibilityRole="link"
            accessibilityLabel="Open Empowr on Instagram"
            hitSlop={HIT_SLOP_8}
            testID="link-social-instagram"
            focusable
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="logo-instagram" size={20} color={palette.text} />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("https://www.facebook.com/profile.php?id=61579428783083")}
            accessibilityRole="link"
            accessibilityLabel="Open Empowr on Facebook"
            hitSlop={HIT_SLOP_8}
            testID="link-social-facebook"
            focusable
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="logo-facebook" size={20} color={palette.text} />
          </Pressable>
        </View>

        {/* Counts */}
        <Text
          style={styles.countText}
          testID="header-favorites-count"
          accessibilityLabel={`${t("header.favorites")} ${favTotal}`}
        >
          {t("header.favorites")}: {favTotal}
        </Text>

        <Text
          style={styles.countText}
          testID="header-items-count"
          accessibilityLabel={`${t("header.items")} ${
            counts.campaigns +
            counts.resources +
            counts.advocates +
            counts.podcasts +
            counts.events
          }`}
        >
          {t("header.items")}:{" "}
          {counts.campaigns +
            counts.resources +
            counts.advocates +
            counts.podcasts +
            counts.events}
          {offline ? " • Offline" : ""}
        </Text>

        {/* Refresh */}
        <Pressable
          onPress={refreshAll}
          accessibilityRole="button"
          accessibilityLabel={t("header.refresh")}
          hitSlop={HIT_SLOP_8}
          focusable
          style={({ pressed }) => [
            touchTarget.min,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="refresh" size={20} color={palette.text} />
        </Pressable>

        {/* Menu */}
        <Pressable
          onPress={() => setMenuOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={menuOpen ? "Close menu" : "Open menu"}
          hitSlop={HIT_SLOP_8}
          focusable
          style={({ pressed }) => [touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="menu" size={22} color={palette.text} />
        </Pressable>

        {/* Settings */}
        <Pressable
          onPress={() => router.push("/(tabs)/settings" as import("expo-router").Href)}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={HIT_SLOP_8}
          focusable
          style={({ pressed }) => [touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="settings-outline" size={20} color={palette.text} />
        </Pressable>

        {/* Settings (moved from tab bar) */}
        <SettingsLink />

        {/* Profile */}
        <Pressable
          onPress={() => router.push("/profile" as import("expo-router").Href)}
          accessibilityRole="button"
          accessibilityLabel={t("header.openProfile")}
          hitSlop={HIT_SLOP_8}
          focusable
          style={({ pressed }) => [
            touchTarget.min,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="person-circle-outline" size={22} color={palette.text} />
        </Pressable>

        {/* Auth control */}
        {user ? (
          <Pressable
            onPress={signOut}
            accessibilityRole="button"
            accessibilityLabel={t("header.signOut")}
            hitSlop={HIT_SLOP_8}
            focusable
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="log-out" size={20} color={palette.text} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/(auth)/login" as import("expo-router").Href)}
            accessibilityRole="button"
            accessibilityLabel={t("header.signIn")}
            hitSlop={HIT_SLOP_8}
            focusable
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="log-in" size={20} color={palette.text} />
          </Pressable>
        )}
      </View>

      {menuOpen && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={() => setMenuOpen(false)}
            style={styles.menuBackdrop}
          />
          <View accessibilityLabel="Main menu" accessible accessibilityViewIsModal style={styles.menuWrap}>
            <Text style={styles.menuSection}>Essentials</Text>
            {[{ label: "Resources", path: "/(tabs)/resources" }].map((item) => (
              <Pressable
                key={item.path}
                onPress={() => { setMenuOpen(false); router.push(item.path as import("expo-router").Href); }}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${item.label}`}
                style={({ pressed }) => [{ paddingVertical: 10, paddingHorizontal: 14 }, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ color: palette.text, fontWeight: "700" }}>{item.label}</Text>
              </Pressable>
            ))}
            <Text style={styles.menuSection}>Tools</Text>
            {[
              { label: "Claims Navigator", path: "/(tabs)/resources/claims-navigator" },
              { label: "Evidence Locker", path: "/(tabs)/resources/evidence-locker" },
              { label: "Letters", path: "/(tabs)/resources" },
            ].map((item) => (
              <Pressable
                key={item.path}
                onPress={() => { setMenuOpen(false); router.push(item.path as import("expo-router").Href); }}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${item.label}`}
                style={({ pressed }) => [{ paddingVertical: 8, paddingHorizontal: 14 }, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ color: palette.text }}>{item.label}</Text>
              </Pressable>
            ))}
            <Text style={styles.menuSection}>Advocacy</Text>
            {[
              { label: "Advocacy Hub", path: "/(tabs)/advocacy" },
              { label: "Support Directory", path: "/(tabs)/advocacy/support-directory" },
            ].map((item) => (
              <Pressable
                key={item.path}
                onPress={() => { setMenuOpen(false); router.push(item.path as import("expo-router").Href); }}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${item.label}`}
                style={({ pressed }) => [{ paddingVertical: 8, paddingHorizontal: 14 }, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ color: palette.text }}>{item.label}</Text>
              </Pressable>
            ))}
            <Text style={styles.menuSection}>Info</Text>
            {[
              { label: "Research", path: "/(tabs)/research" },
              { label: "What's New", path: "/(tabs)/whatsnew" },
              { label: "FAQs", path: "/(tabs)/faqs" },
              { label: "Wellness", path: "/(tabs)/wellness" },
              { label: "About & Contact", path: "/(tabs)/about" },
            ].map((item) => (
              <Pressable
                key={item.path}
                onPress={() => { setMenuOpen(false); router.push(item.path as import("expo-router").Href); }}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${item.label}`}
                style={({ pressed }) => [{ paddingVertical: 8, paddingHorizontal: 14 }, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ color: palette.text }}>{item.label}</Text>
              </Pressable>
            ))}
            <Text style={styles.menuSection}>Profile</Text>
            {[
              { label: "Saved", path: "/(tabs)/saved" },
              { label: "Settings", path: "/(tabs)/settings" },
            ].map((item) => (
              <Pressable
                key={item.path}
                onPress={() => { setMenuOpen(false); router.push(item.path as import("expo-router").Href); }}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${item.label}`}
                style={({ pressed }) => [{ paddingVertical: 8, paddingHorizontal: 14 }, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ color: palette.text }}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    brand: { flexDirection: "row", alignItems: "center", gap: 8 },
    logo: { height: 24, width: 24, resizeMode: "contain" },
    title: {
      color: palette.text,
      fontSize: 22,
      fontWeight: "700",
      fontFamily: "System",
    },
    right: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      flexShrink: 1,
      flexWrap: "wrap",
    },
    menuWrap: {
      position: "absolute",
      right: 12,
      top: 52,
      backgroundColor: palette.surface ?? palette.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 10,
      paddingVertical: 6,
      minWidth: 180,
      zIndex: 999,
    },
    menuSection: { color: palette.text, opacity: 0.7, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4, fontWeight: '700' },
    menuBackdrop: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.2)",
      zIndex: 998,
    },
    social: { flexDirection: "row", gap: 12, marginEnd: 8 },
    countText: { color: palette.text, opacity: 0.9, fontSize: 14 },
  });
}
