import { SafeAreaView, Text, StyleSheet, useColorScheme, View, Pressable, Linking, Image } from "react-native";
import { type Palette } from "../theme/colors";
import { useAppPalette } from "../theme/usePalette";
import { useFavorites } from "../store/favorites";
import { useCounts } from "../store/counts";
import { useRefresh } from "../store/refresh";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/auth";
import { router } from "expo-router";
import { HIT_SLOP_8, touchTarget } from "../constants/a11y";
import { useTranslation } from "../i18n";

export default function ThemedHeader() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { state } = useFavorites();
  const { counts } = useCounts();
  const { refreshAll } = useRefresh();
  const { state: auth, signOut } = useAuth();
  const { t } = useTranslation();

  const favTotal = state
    ? state.campaign.size + state.resource.size + state.advocate.size + state.podcast.size
    : 0;

  return (
    <SafeAreaView style={styles.container} accessibilityRole="header">
      <View style={styles.brand}>
        <Image
          source={require("../assets/images/empowr-logo.png")}
          style={styles.logo}
          accessible
          accessibilityLabel="Empowr logo"
        />
        <Text style={styles.title} accessibilityLabel="Empowr app header">Empowr</Text>
      </View>
      <View style={styles.right}>
        {/* Social media links */}
        <View style={styles.social} accessibilityLabel="Social media links" accessible>
          <Pressable
            onPress={() => Linking.openURL("https://x.com/empowrapp0816?fbclid=IwY2xjawMfJvRleHRuA2FlbQIxMABicmlkETFmTzUwSUVDOFM3N2JlNjRMAR5N-V-9SV42Io93BvOCfSWc6g6mmXNfCAx5RzeznffITIWwGf9zXPY1WN-mmg_aem_CH3LxzsfYeUEwnmKyuGbOQ")}
            accessibilityRole="link"
            accessibilityLabel="Open Empowr on X (formerly Twitter)"
            hitSlop={HIT_SLOP_8}
            testID="link-social-x"
            focusable
            style={({ pressed }) => [touchTarget.min, { outlineStyle: 'auto', outlineColor: palette.primary }, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="logo-twitter" size={20} color={palette.text} />
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL("https://www.instagram.com/empowrapp/?fbclid=IwY2xjawMfJvBleHRuA2FlbQIxMABicmlkETFmTzUwSUVDOFM3N2JlNjRMAR5N-V-9SV42Io93BvOCfSWc6g6mmXNfCAx5RzeznffITIWwGf9zXPY1WN-mmg_aem_CH3LxzsfYeUEwnmKyuGbOQ")}
            accessibilityRole="link"
            accessibilityLabel="Open Empowr on Instagram"
            hitSlop={HIT_SLOP_8}
            testID="link-social-instagram"
            focusable
            style={({ pressed }) => [touchTarget.min, { outlineStyle: 'auto', outlineColor: palette.primary }, { opacity: pressed ? 0.7 : 1 }]}
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
            style={({ pressed }) => [touchTarget.min, { outlineStyle: 'auto', outlineColor: palette.primary }, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="logo-facebook" size={20} color={palette.text} />
          </Pressable>
        </View>

        {/* Counts and refresh */}
        <Text style={styles.countText} testID="header-favorites-count" accessibilityLabel={`${t("header.favorites")} ${favTotal}`}>
          {t("header.favorites")}: {favTotal}
        </Text>
        <Text
          style={styles.countText}
          testID="header-items-count"
          accessibilityLabel={`${t("header.items")} ${counts.campaigns + counts.resources + counts.advocates + counts.podcasts + counts.events}`}
        >
          {t("header.items")}: {counts.campaigns + counts.resources + counts.advocates + counts.podcasts + counts.events}
        </Text>
        <Pressable
          onPress={refreshAll}
          accessibilityRole="button"
          accessibilityLabel={t("header.refresh")}
          hitSlop={HIT_SLOP_8}
          focusable
          style={({ pressed }) => [touchTarget.min, { outlineStyle: 'auto', outlineColor: palette.primary }, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="refresh" size={20} color={palette.text} />
        </Pressable>
        {/* Profile */}
        <Pressable
          onPress={() => router.push("/profile")}
          accessibilityRole="button"
          accessibilityLabel={t("header.openProfile")}
          hitSlop={HIT_SLOP_8}
          focusable
          style={({ pressed }) => [touchTarget.min, { outlineStyle: 'auto', outlineColor: palette.primary }, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="person-circle-outline" size={22} color={palette.text} />
        </Pressable>
        {/* Auth control */}
        {auth.status === "signedIn" ? (
          <Pressable
            onPress={signOut}
            accessibilityRole="button"
            accessibilityLabel={t("header.signOut")}
            hitSlop={HIT_SLOP_8}
            focusable
            style={({ pressed }) => [touchTarget.min, { outlineStyle: 'auto', outlineColor: palette.primary }, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="log-out" size={20} color={palette.text} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            accessibilityRole="button"
            accessibilityLabel={t("header.signIn")}
            hitSlop={HIT_SLOP_8}
            focusable
            style={({ pressed }) => [touchTarget.min, { outlineStyle: 'auto', outlineColor: palette.primary }, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="log-in" size={20} color={palette.text} />
          </Pressable>
        )}
      </View>
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
      fontFamily: "Poppins",
    },
    right: { flexDirection: "row", gap: 12, alignItems: "center", flexShrink: 1, flexWrap: "wrap" },
    social: { flexDirection: "row", gap: 12, marginEnd: 8 },
    countText: { color: palette.text, opacity: 0.9, fontSize: 14 },
  });
}
