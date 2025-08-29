import { SafeAreaView, Text, StyleSheet, useColorScheme, View, Pressable } from "react-native";
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
      <Text style={styles.title}>Empowr</Text>
      <View style={styles.right}>
        <Text style={styles.countText} testID="header-favorites-count" accessibilityLabel={`Favorites ${favTotal}`}>
          Favs: {favTotal}
        </Text>
        <Text style={styles.countText} testID="header-items-count" accessibilityLabel={`Items ${counts.campaigns + counts.resources + counts.advocates + counts.podcasts}`}>
          Items: {counts.campaigns + counts.resources + counts.advocates + counts.podcasts}
        </Text>
        <Pressable
          onPress={refreshAll}
          accessibilityRole="button"
          accessibilityLabel="Refresh all"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="refresh" size={18} color={palette.muted} />
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
    title: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "700",
    },
    right: { flexDirection: "row", gap: 12 },
    countText: { color: palette.muted, fontSize: 12 },
  });
}
