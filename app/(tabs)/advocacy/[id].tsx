import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { advocates } from "../../../data/advocates";
import { useFavorites } from "../../../store/favorites";
import SettingsLink from "../../../components/SettingsLink";

export const options = { href: null };

export default function AdvocacyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);

  const advocate = advocates.find((a) => a.id === id);
  const { has, toggle } = useFavorites();
  const saved = advocate ? has("advocate", advocate.id) : false;

  return (
    <>
      <Stack.Screen options={{ title: advocate?.name ?? "Advocate" }} />
      <View style={styles.container}>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        <Text style={styles.title}>{advocate?.name ?? "Advocate"}</Text>
        <Text style={styles.text}>
          {advocate?.bio ?? "Details unavailable."}
        </Text>
        {!!advocate && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => toggle("advocate", advocate.id)}
            accessibilityRole="button"
            accessibilityLabel={
              saved ? "Remove from favorites" : "Save to favorites"
            }
          >
            <Text style={styles.buttonText}>
              {saved ? "Remove from Favorites" : "Save to Favorites"}
            </Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

function createStyles(
  palette: ReturnType<typeof useAppPalette>,
  factor: number,
) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: {
      fontSize: Math.round(22 * factor),
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    text: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.95,
      marginBottom: 16,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
    },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  });
}
