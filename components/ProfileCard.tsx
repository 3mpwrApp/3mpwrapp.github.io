import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { router } from "expo-router";
import React from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { HIT_SLOP_8 } from "../constants/A11Y";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n";
import { useA11ySettings } from "../store/a11ySettings";
import { useBookmarks } from "../store/bookmarks";
import { useEnergyCoins } from "../store/energyCoins";
import { useFavorites } from "../store/favorites";
import type { Palette } from "../theme/colors";
import { useAppPalette } from "../theme/usePalette";
import { logger } from "../utils/logger";

import GapView from "./GapView";

export default function ProfileCard() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { user, signOut, isAdmin, isGuest } = useAuth();
  const { t } = useTranslation();
  const { state: favorites } = useFavorites();
  const bookmarksCtx = useBookmarks();
  const { coins } = useEnergyCoins();
  const { state: a11y } = useA11ySettings();
  
  const [displayName, setDisplayName] = React.useState(user?.displayName ?? "");
  const [editing, setEditing] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // Calculate stats - safe access to prevent crashes
  const favTotal = (
    (favorites?.campaign?.size || 0) + 
    (favorites?.resource?.size || 0) + 
    (favorites?.advocate?.size || 0) + 
    (favorites?.podcast?.size || 0)
  );
  const bookmarkTotal = bookmarksCtx?.items?.length || 0;

  // Refresh handler
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Force re-render to update stats from stores
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSaveName = async () => {
    try {
      if (user && displayName.trim()) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(user, { displayName: displayName.trim() });
        Alert.alert(t("common.success", "Success"), t("profile.nameSaved", "Display name updated"));
        setEditing(false);
      }
    } catch (error) {
      logger.error('[ProfileCard] Failed to update name:', error);
      Alert.alert(t("common.errorTitle", "Error"), t("profile.nameError", "Failed to update display name"));
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh}
          tintColor={palette.primary}
          colors={[palette.primary]}
        />
      }
    >
      {/* Header with avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: palette.primary }]}>
              <Text style={styles.avatarText}>
                {(user?.displayName?.[0] || user?.email?.[0] || "G").toUpperCase()}
              </Text>
            </View>
          )}
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={16} color={palette.onPrimary} />
            </View>
          )}
        </View>
        
        <View style={{ flex: 1 }}>
          {editing ? (
            <View>
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t("profile.enterName", "Enter display name")}
                placeholderTextColor={palette.muted}
                accessibilityLabel={t("settings.account.displayName", "Display name")}
              />
              <GapView style={{ flexDirection: 'row' }} gap={8}>
                <Pressable onPress={handleSaveName} style={[styles.smallButton, { backgroundColor: palette.primary }]}>
                  <Text style={[styles.smallButtonText, { color: palette.onPrimary }]}>{t("common.save", "Save")}</Text>
                </Pressable>
                <Pressable onPress={() => { setEditing(false); setDisplayName(user?.displayName ?? ""); }} style={[styles.smallButton, { backgroundColor: palette.surface }]}>
                  <Text style={styles.smallButtonText}>{t("common.cancel", "Cancel")}</Text>
                </Pressable>
              </GapView>
            </View>
          ) : (
            <View>
              <Text style={styles.name}>{user?.displayName || t("common.guest", "Guest User")}</Text>
              <Text style={styles.email}>{user?.email || (isGuest ? t("auth.guestMode", "Guest Mode") : "")}</Text>
              {!isGuest && (
                <Pressable onPress={() => setEditing(true)} hitSlop={HIT_SLOP_8} style={{ marginTop: 4 }}>
                  <Text style={[styles.link, { color: palette.primary }]}>
                    <Ionicons name="pencil" size={12} /> {t("profile.editName", "Edit name")}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard 
          icon="heart" 
          label={t("header.favorites", "Favorites")} 
          value={String(favTotal)} 
          palette={palette}
          onPress={() => router.push("/(tabs)/saved" as Href)}
        />
        <StatCard 
          icon="bookmark" 
          label={t("nav.bookmarks", "Bookmarks")} 
          value={String(bookmarkTotal)} 
          palette={palette}
          onPress={() => router.push("/(tabs)/saved" as Href)}
        />
        <StatCard 
          icon="flash" 
          label={t("wellness.energyCoins", "Energy Coins")} 
          value={String(coins)} 
          palette={palette}
          onPress={() => router.push("/(tabs)/wellness" as Href)}
        />
        {isAdmin && (
          <StatCard 
            icon="shield-checkmark" 
            label={t("admin.title", "Admin")} 
            value="✓" 
            palette={palette}
            color={palette.primary}
            onPress={() => router.push("/(tabs)/admin" as Href)}
          />
        )}
      </View>

      {/* Account Type Badge */}
      <View style={styles.card}>
        <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
          <Ionicons 
            name={isGuest ? "person-outline" : isAdmin ? "shield-checkmark" : "person"} 
            size={20} 
            color={isAdmin ? palette.primary : palette.text} 
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {isGuest ? t("auth.guestAccount", "Guest Account") : isAdmin ? t("admin.title", "Admin Account") : t("auth.standardAccount", "Standard Account")}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isGuest 
                ? t("auth.guestDescription", "Limited features. Sign in for full access.") 
                : isAdmin 
                  ? t("admin.description", "Full admin privileges enabled") 
                  : t("auth.standardDescription", "Full access to all features")}
            </Text>
          </View>
        </GapView>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("profile.quickActions", "Quick Actions")}</Text>
        <GapView gap={8}>
          <ActionButton
            icon="folder-open"
            label={t("profile.evidenceLocker", "Evidence Locker")}
            onPress={() => router.push("/(tabs)/resources/evidence-locker" as Href)}
            palette={palette}
          />
          <ActionButton
            icon="calendar"
            label={t("profile.deadlines", "Deadlines & Events")}
            onPress={() => router.push("/(tabs)/resources/deadlines" as Href)}
            palette={palette}
          />
          <ActionButton
            icon="checkmark-circle"
            label={t("profile.rightsChecker", "Rights Checker")}
            onPress={() => router.push("/(tabs)/resources/rights-checker" as Href)}
            palette={palette}
          />
          <ActionButton
            icon="document-text"
            label={t("profile.letterTemplates", "Letter Templates")}
            onPress={() => router.push("/(tabs)/resources/letters" as Href)}
            palette={palette}
          />
          <ActionButton
            icon="language"
            label={t("profile.translator", "Advocate Translator")}
            onPress={() => router.push("/(tabs)/advocacy/ai-advocate-translator" as Href)}
            palette={palette}
          />
          <ActionButton
            icon="chatbubbles"
            label={t("profile.community", "Community Chat")}
            onPress={() => router.push("/(tabs)/community" as Href)}
            palette={palette}
          />
        </GapView>
      </View>

      {/* Accessibility Settings */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("settings.accessibility.title", "Accessibility")}</Text>
        <GapView gap={8}>
          <SettingRow
            icon="contrast"
            label={t("settings.accessibility.highContrast", "High Contrast")}
            value={a11y?.highContrast ? t("common.on", "On") : t("common.off", "Off")}
            onPress={() => router.push("/(tabs)/settings" as Href)}
            palette={palette}
          />
          <ActionButton
            icon="settings"
            label={t("settings.accessibility.moreSettings", "More Accessibility Settings")}
            onPress={() => router.push("/(tabs)/settings" as Href)}
            palette={palette}
          />
        </GapView>
      </View>

      {/* Account Actions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("settings.account.title", "Account")}</Text>
        <GapView gap={8}>
          {!isGuest && (
            <>
              <ActionButton
                icon="notifications"
                label={t("settings.notifications.title", "Notification Settings")}
                onPress={() => router.push("/(tabs)/settings" as Href)}
                palette={palette}
              />
              <ActionButton
                icon="lock-closed"
                label={t("settings.privacy.title", "Privacy Settings")}
                onPress={() => router.push("/(tabs)/settings" as Href)}
                palette={palette}
              />
            </>
          )}
          <ActionButton
            icon="information-circle"
            label={t("nav.about", "About & Contact")}
            onPress={() => router.push("/(tabs)/about" as Href)}
            palette={palette}
          />
          <ActionButton
            icon="help-circle"
            label={t("nav.faqs", "FAQs")}
            onPress={() => router.push("/(tabs)/faqs" as Href)}
            palette={palette}
          />
        </GapView>
      </View>

      {/* Sign Out / Sign In */}
      {user ? (
        <Pressable
          style={[styles.button, { backgroundColor: palette.error }]}
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel={t("header.signOut", "Sign Out")}
        >
          <Ionicons name="log-out" size={20} color={palette.onPrimary} />
          <Text style={[styles.buttonText, { color: palette.onPrimary }]}>{t("header.signOut", "Sign Out")}</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.button, { backgroundColor: palette.primary }]}
          onPress={() => router.push("/(auth)/signin" as Href)}
          accessibilityRole="button"
          accessibilityLabel={t("header.signIn", "Sign In")}
        >
          <Ionicons name="log-in" size={20} color={palette.onPrimary} />
          <Text style={[styles.buttonText, { color: palette.onPrimary }]}>{t("header.signIn", "Sign In")}</Text>
        </Pressable>
      )}

      {isGuest && (
        <Text style={styles.hint}>
          {t("auth.guestUpgrade", "Sign in with an account to save your progress and access all features")}
        </Text>
      )}
    </ScrollView>
  );
}

function StatCard({ icon, label, value, palette, color, onPress }: { 
  icon: string; 
  label: string; 
  value: string; 
  palette: Palette;
  color?: string;
  onPress?: () => void;
}) {
  const styles = createStyles(palette);
  const Component = onPress ? Pressable : View;
  return (
    <Component 
      style={styles.statCard} 
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Ionicons name={icon as any} size={24} color={color || palette.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Component>
  );
}

function ActionButton({ icon, label, onPress, palette }: { 
  icon: string; 
  label: string; 
  onPress: () => void;
  palette: Palette;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: palette.muted,
          backgroundColor: pressed ? palette.muted + '20' : 'transparent',
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT_SLOP_8}
    >
      <Ionicons name={icon as any} size={20} color={palette.text} />
      <Text style={{ flex: 1, marginLeft: 12, color: palette.text, fontSize: 15 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={palette.muted} />
    </Pressable>
  );
}

function SettingRow({ icon, label, value, onPress, palette }: { 
  icon: string; 
  label: string; 
  value: string;
  onPress: () => void;
  palette: Palette;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: palette.muted,
          backgroundColor: pressed ? palette.muted + '20' : 'transparent',
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      hitSlop={HIT_SLOP_8}
    >
      <Ionicons name={icon as any} size={20} color={palette.text} />
      <Text style={{ flex: 1, marginLeft: 12, color: palette.text, fontSize: 15 }}>{label}</Text>
      <Text style={{ color: palette.muted, fontSize: 14, marginRight: 8 }}>{value}</Text>
      <Ionicons name="chevron-forward" size={16} color={palette.muted} />
    </Pressable>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      flexDirection: 'row',
      padding: 20,
      alignItems: 'center',
      gap: 16,
      backgroundColor: palette.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: palette.onPrimary,
      fontSize: 32,
      fontWeight: '700',
    },
    adminBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: palette.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: palette.surface,
    },
    name: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 14,
      color: palette.muted,
    },
    link: {
      fontSize: 13,
      textDecorationLine: 'underline',
    },
    nameInput: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 8,
      color: palette.text,
      marginBottom: 8,
    },
    smallButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    smallButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 12,
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: palette.muted,
      textAlign: 'center',
      marginTop: 4,
    },
    card: {
      backgroundColor: palette.surface,
      margin: 12,
      marginTop: 0,
      padding: 16,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: palette.text,
    },
    cardSubtitle: {
      fontSize: 13,
      color: palette.muted,
      marginTop: 2,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 12,
      marginTop: 0,
      padding: 16,
      borderRadius: 12,
      gap: 8,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
    },
    hint: {
      fontSize: 13,
      color: palette.muted,
      textAlign: 'center',
      marginHorizontal: 20,
      marginBottom: 20,
      fontStyle: 'italic',
    },
  });
}

