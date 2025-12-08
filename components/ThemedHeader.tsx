import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router, usePathname, type Href } from "expo-router";
import React from "react";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HIT_SLOP_12, HIT_SLOP_8, touchTarget } from "../constants/A11Y";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n";
import { useCounts } from "../store/counts";
import { useFavorites } from "../store/favorites";
import { useNetwork } from "../store/network";
import { useRefresh } from "../store/refresh";
import { type Palette } from "../theme/colors";
import { useAppPalette } from "../theme/usePalette";

import A11yQuickSettings from "./A11yQuickSettings";
import GapView from "./GapView";

// Memoize menu items to prevent recreation on every render
// NOTE: Bottom tabs (Home, Wellness, Resources, Advocacy, Community, Campaigns, Events, Research) are NOT in menu
// Only deep links to sub-pages and utility screens
const MENU_SECTIONS = {
  tools: [
    { label: "Claims Navigator", path: "/(tabs)/resources/claims-navigator" },
    { label: "Evidence Locker", path: "/(tabs)/resources/evidence-locker" },
    { label: "Letter Templates", path: "/(tabs)/resources/letters" },
    { label: "Support Directory", path: "/(tabs)/resources/support-directory" },
    { label: "Podcasts", path: "/podcasts" },
  ],
  account: [
    { label: "My Profile", path: "/profile" },
    { label: "Saved Items", path: "/(tabs)/saved" },
    { label: "Inbox", path: "/(tabs)/inbox" },
  ],
  about: [
    { label: "What's New", path: "/whatsnew" },
    { label: "FAQs", path: "/(tabs)/faqs" },
    { label: "About & Contact", path: "/(tabs)/about" },
  ],
} as const;

// Memoized menu item component for better performance
const MenuItem = React.memo<{
  label: string;
  path: string;
  onPress: () => void;
  palette: Palette;
}>(({ label, onPress, palette }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Go to ${label}`}
    hitSlop={HIT_SLOP_12}
    style={({ pressed }) => [
      { paddingVertical: 8, paddingHorizontal: 14, minWidth: 44, minHeight: 44 },
      pressed && { opacity: 0.7 },
    ]}
  >
    <Text style={{ color: palette.text, fontSize: 15, lineHeight: 22 }}>{label}</Text>
  </Pressable>
));
MenuItem.displayName = 'MenuItem';

// Memoized section header
const MenuSection = React.memo<{ title: string; palette: Palette }>(
  ({ title, palette }) => (
    <Text
      style={{
        color: palette.textSecondary,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 6,
        fontWeight: "700",
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {title}
    </Text>
  )
);
MenuSection.displayName = 'MenuSection';

const ThemedHeader = React.memo(() => {
  const palette = useAppPalette();
  const insets = useSafeAreaInsets();
  const styles = createStyles(palette, insets);
  const { state } = useFavorites();
  const { counts } = useCounts();
  const { refreshAll } = useRefresh();
  const { offline, syncing } = useNetwork();
  const { user, signOut, isAdmin, refreshClaims } = useAuth();
  const { t } = useTranslation();

  const favTotal =
    state?.campaign.size +
      state?.resource.size +
      state?.advocate.size +
      state?.podcast.size || 0;

  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();
  
  // Memoize menu item press handler
  const handleMenuItemPress = React.useCallback((path: string) => {
    setMenuOpen(false);
    router.push(path as Href);
  }, []);

  // Memoize refresh admin handler
  const handleRefreshAdmin = React.useCallback(() => {
    setMenuOpen(false);
    refreshClaims();
  }, [refreshClaims]);

  // Memoize admin panel handler
  const handleAdminPanel = React.useCallback(() => {
    setMenuOpen(false);
    router.push('/(tabs)/admin' as Href);
  }, []);

  // Close menu when route changes
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  return (
    <View style={styles.container} accessibilityRole="header" collapsable={false}>
      {/* Brand */}
      <Pressable
        style={styles.brand}
        onPress={() => {
          try {
            // Navigate to home index
            router.push("/" as Href);
          } catch (err) {
            console.error('Home navigation error:', err);
          }
        }}
        accessibilityRole="link"
        accessibilityLabel="Go to Home"
        hitSlop={HIT_SLOP_8}
      >
        <Image
          source={require("../assets/images/brand-logo.png")}
          style={styles.logo}
          accessible={true}
          accessibilityLabel="3mpwr App logo"
        />
        <Text style={styles.title} accessibilityLabel="3mpwr App header">
          3mpwr App
        </Text>
      </Pressable>

      {/* Ask 3mpwr - Quick access to advocacy help - PROMINENT PLACEMENT */}
      <Pressable
        onPress={() => router.push('/(tabs)/advocacy/ask' as Href)}
        accessibilityRole="button"
        accessibilityLabel="Ask an Advocate - Get help with your case"
        hitSlop={HIT_SLOP_8}
        focusable={true}
        style={({ pressed }) => [
          {
            backgroundColor: palette.primary,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginLeft: 8,
            flexShrink: 1,
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Ionicons name="chatbubble-ellipses" size={14} color={palette.onPrimary} />
        <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 13 }}>Ask</Text>
      </Pressable>

      {/* Spacer to push right controls to the right */}
      <View style={{ flex: 1 }} />

      {/* Right side controls */}
      <GapView style={styles.right} gap={6}>
        {/* Social media links - hidden on smaller screens to prevent overlap */}
        <GapView
          style={[styles.social, { display: 'none' }]}
          gap={8}
          accessibilityLabel="Social media links"
          accessible={true}
        >
          <Pressable
            onPress={() => Linking.openURL("https://x.com/3mpowrApp0816")}
            accessibilityRole="link"
            accessibilityLabel="Open 3mpwr on X (formerly Twitter)"
            hitSlop={HIT_SLOP_8}
            testID="link-social-x"
            focusable={true}
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="logo-twitter" size={20} color={palette.text} />
          </Pressable>

          <Pressable
            onPress={() =>
              Linking.openURL("https://www.instagram.com/empowrapp/")
            }
            accessibilityRole="link"
            accessibilityLabel="Open 3mpwr on Instagram"
            hitSlop={HIT_SLOP_8}
            testID="link-social-instagram"
            focusable={true}
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="logo-instagram" size={20} color={palette.text} />
          </Pressable>

          <Pressable
            onPress={() =>
              Linking.openURL(
                "https://www.facebook.com/profile.php?id=61579428783083",
              )
            }
            accessibilityRole="link"
            accessibilityLabel="Open 3mpwr on Facebook"
            hitSlop={HIT_SLOP_8}
            testID="link-social-facebook"
            focusable={true}
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="logo-facebook" size={20} color={palette.text} />
          </Pressable>
        </GapView>

        {/* Counts - hidden to save space with 8 tabs */}
        <Text
          style={[styles.countText, { display: 'none' }]}
          testID="header-favorites-count"
          accessibilityLabel={`${t("header.favorites")} ${favTotal}`}
        >
          {t("header.favorites")}: {favTotal}
        </Text>

        <Text
          style={[styles.countText, { display: 'none' }]}
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
          {syncing ? " • Syncing…" : ""}
        </Text>

        {/* Refresh - hidden to save space, available in pull-to-refresh */}
        <Pressable
          onPress={refreshAll}
          accessibilityRole="button"
          accessibilityLabel={t("header.refresh")}
          hitSlop={HIT_SLOP_8}
          focusable={true}
          style={({ pressed }) => [
            touchTarget.min,
            { opacity: pressed ? 0.7 : 1, display: 'none' },
          ]}
        >
          <Ionicons name="refresh" size={18} color={palette.text} />
        </Pressable>

        {/* A11y quick settings */}
        <A11yQuickSettings />

        {/* Menu */}
        <Pressable
          onPress={() => setMenuOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={menuOpen ? "Close menu" : "Open menu"}
          hitSlop={HIT_SLOP_8}
          focusable={true}
          style={({ pressed }) => [
            touchTarget.min,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="menu" size={20} color={palette.text} />
        </Pressable>

        {/* Settings */}
        <Pressable
          onPress={() => {
            try {
              router.push("/(tabs)/settings" as Href);
            } catch (err) {
              console.error('Settings navigation error:', err);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={HIT_SLOP_8}
          focusable={true}
          style={({ pressed }) => [
            touchTarget.min,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="settings-outline" size={18} color={palette.text} />
        </Pressable>

        {/* Profile - hidden, accessible via menu */}
        <Pressable
          onPress={() => {
            try {
              router.push("/profile" as Href);
            } catch {
              // Fallback: navigate to settings if profile route fails
              router.push("/(tabs)/settings" as Href);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={t("header.openProfile", "View profile")}
          hitSlop={HIT_SLOP_8}
          focusable={true}
          style={({ pressed }) => [
            touchTarget.min,
            { opacity: pressed ? 0.7 : 1, display: 'none' },
          ]}
        >
          <Ionicons
            name="person-circle-outline"
            size={20}
            color={palette.text}
          />
        </Pressable>

        {/* Auth control - hidden, accessible via menu */}
        {user ? (
          <Pressable
            onPress={signOut}
            accessibilityRole="button"
            accessibilityLabel={t("header.signOut")}
            hitSlop={HIT_SLOP_8}
            focusable={true}
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1, display: 'none' },
            ]}
          >
            <Ionicons name="log-out" size={18} color={palette.text} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() =>
              router.push("/(auth)/signin" as Href)
            }
            accessibilityRole="button"
            accessibilityLabel={t("header.signIn")}
            hitSlop={HIT_SLOP_8}
            focusable={true}
            style={({ pressed }) => [
              touchTarget.min,
              { opacity: pressed ? 0.7 : 1, display: 'none' },
            ]}
          >
            <Ionicons name="log-in" size={18} color={palette.text} />
          </Pressable>
        )}
      </GapView>

      <Modal
        visible={menuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={() => setMenuOpen(false)}
          style={styles.menuBackdrop}
        >
          <Pressable
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Main menu"
            accessible={true}
            accessibilityViewIsModal={true}
            style={styles.menuWrap}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView 
              contentContainerStyle={{ paddingBottom: 16 }}
              removeClippedSubviews={false}
            >
              <MenuSection title="Tools & Resources" palette={palette} />
              {MENU_SECTIONS.tools.map((item) => (
                <MenuItem
                  key={item.path}
                  label={item.label}
                  path={item.path}
                  onPress={() => handleMenuItemPress(item.path)}
                  palette={palette}
                />
              ))}

              <MenuSection title="Account" palette={palette} />
              {MENU_SECTIONS.account.map((item) => (
                <MenuItem
                  key={item.path}
                  label={item.label}
                  path={item.path}
                  onPress={() => handleMenuItemPress(item.path)}
                  palette={palette}
                />
              ))}

              <MenuSection title="About" palette={palette} />
              {MENU_SECTIONS.about.map((item) => (
                <MenuItem
                  key={item.path}
                  label={item.label}
                  path={item.path}
                  onPress={() => handleMenuItemPress(item.path)}
                  palette={palette}
                />
              ))}

              <MenuSection title="Admin" palette={palette} />
              <Pressable
                onPress={handleRefreshAdmin}
                accessibilityRole="button"
                accessibilityLabel="Refresh admin status"
                hitSlop={HIT_SLOP_12}
                style={({ pressed }) => [
                  { paddingVertical: 8, paddingHorizontal: 14, minWidth: 44, minHeight: 44 },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ color: palette.text, fontSize: 15, lineHeight: 22 }}>
                  Refresh admin status
                </Text>
              </Pressable>
              {isAdmin && (
                <Pressable
                  onPress={handleAdminPanel}
                  accessibilityRole="button"
                  accessibilityLabel="Go to Admin Panel"
                  hitSlop={HIT_SLOP_12}
                  style={({ pressed }) => [
                    { paddingVertical: 8, paddingHorizontal: 14, minWidth: 44, minHeight: 44 },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ color: palette.text, fontSize: 15, lineHeight: 22 }}>
                    Admin Panel
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});

ThemedHeader.displayName = 'ThemedHeader';

export default ThemedHeader;

function createStyles(palette: Palette, insets: { top: number; right: number; bottom: number; left: number }) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
      paddingTop: Math.max(insets.top, 10), // Ensure minimum padding, use safe area top
      paddingHorizontal: 8,
      paddingBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      overflow: 'visible',
    },
    brand: { flexDirection: "row", alignItems: "center", flexShrink: 1, minWidth: 0 },
  logo: { height: 22, width: 22, marginRight: 6 },
    title: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "700",
      fontFamily: "System",
    },
    right: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "nowrap",
      gap: 0,
      flexShrink: 0,
      marginRight: 4,
    },
    menuWrap: {
      position: "absolute",
      right: 12,
      top: Math.max(insets.top, 10) + 50, // Position below header
      backgroundColor: palette.surface ?? palette.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 10,
      paddingVertical: 6,
      minWidth: 200,
      maxHeight: 400,
      shadowColor: palette.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    menuSection: {
      color: palette.textSecondary,
      paddingHorizontal: 14,
      paddingTop: 8,
      paddingBottom: 4,
      fontWeight: "700",
    },
    menuBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    social: { flexDirection: "row", marginEnd: 8 },
    countText: { color: palette.text, opacity: 1, fontSize: 14 },
  });
}
