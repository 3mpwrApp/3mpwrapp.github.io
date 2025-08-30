import { SafeAreaView, Text, StyleSheet, useColorScheme, View, Pressable, Linking, Image } from "react-native";
import { colors, type Palette } from "../theme/colors";
import { useFavorites } from "../store/favorites";
import { useCounts } from "../store/counts";
import { useRefresh } from "../store/refresh";
import { Ionicons } from "@expo/vector-icons";

export default function ThemedHeader() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const { state } = useFavorites();
  const { counts } = useCounts();
  const { refreshAll } = useRefresh();

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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="link-social-x"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="logo-twitter" size={20} color={palette.text} />
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL("https://www.instagram.com/empowrapp/?fbclid=IwY2xjawMfJvBleHRuA2FlbQIxMABicmlkETFmTzUwSUVDOFM3N2JlNjRMAR5N-V-9SV42Io93BvOCfSWc6g6mmXNfCAx5RzeznffITIWwGf9zXPY1WN-mmg_aem_CH3LxzsfYeUEwnmKyuGbOQ")}
            accessibilityRole="link"
            accessibilityLabel="Open Empowr on Instagram"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="link-social-instagram"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="logo-instagram" size={20} color={palette.text} />
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL("https://www.facebook.com/profile.php?id=61579428783083")}
            accessibilityRole="link"
            accessibilityLabel="Open Empowr on Facebook"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="link-social-facebook"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="logo-facebook" size={20} color={palette.text} />
          </Pressable>
        </View>

        {/* Counts and refresh */}
        <Text style={styles.countText} testID="header-favorites-count" accessibilityLabel={`Favorites ${favTotal}`}>
          Favs: {favTotal}
        </Text>
        <Text
          style={styles.countText}
          testID="header-items-count"
          accessibilityLabel={`Items ${counts.campaigns + counts.resources + counts.advocates + counts.podcasts + counts.events}`}
        >
          Items: {counts.campaigns + counts.resources + counts.advocates + counts.podcasts + counts.events}
        </Text>
        <Pressable
          onPress={refreshAll}
          accessibilityRole="button"
          accessibilityLabel="Refresh all"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="refresh" size={20} color={palette.text} />
        </Pressable>
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
      fontSize: 20,
      fontWeight: "700",
      fontFamily: "Poppins",
    },
    right: { flexDirection: "row", gap: 12, alignItems: "center" },
    social: { flexDirection: "row", gap: 12, marginRight: 8 },
    countText: { color: palette.muted, fontSize: 12 },
  });
}
