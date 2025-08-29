import { View, Text, StyleSheet, useColorScheme, Pressable } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { colors, type Palette } from "../../../theme/colors";
import { campaigns } from "../../../data/campaigns";
import { useFavorites } from "../../../store/favorites";

export default function CampaignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  const campaign = campaigns.find((c) => c.id === id);
  const { has, toggle } = useFavorites();
  const saved = campaign ? has("campaign", campaign.id) : false;

  return (
    <>
      <Stack.Screen options={{ title: campaign?.title ?? "Campaign" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{campaign?.title ?? "Campaign"}</Text>
        <Text style={styles.text}>{campaign?.summary ?? "Details unavailable."}</Text>
        {!!campaign && (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => toggle("campaign", campaign.id)}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove from favorites" : "Save to favorites"}
          >
            <Text style={styles.buttonText}>{saved ? "Remove from Favorites" : "Save to Favorites"}</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: palette.text },
    text: { fontSize: 16, color: palette.muted, marginBottom: 16 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, minHeight: 44, minWidth: 44 },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  });
}
