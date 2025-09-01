import { View, Text, StyleSheet, useColorScheme, Pressable, Linking } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { colors, type Palette } from "../../../theme/colors";
import { resources } from "../../../data/resources";
import { useFavorites } from "../../../store/favorites";

export default function ResourceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  const resource = resources.find((r) => r.id === id);
  const { has, toggle } = useFavorites();
  const saved = resource ? has("resource", resource.id) : false;

  return (
    <>
      <Stack.Screen options={{ title: resource?.title ?? "Resource" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{resource?.title ?? "Resource"}</Text>
        <Text style={styles.text}>{resource?.description ?? "Details unavailable."}</Text>
        {!!resource && (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => toggle("resource", resource.id)}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove from favorites" : "Save to favorites"}
          >
            <Text style={styles.buttonText}>{saved ? "Remove from Favorites" : "Save to Favorites"}</Text>
          </Pressable>
        )}
        {!!resource?.url && (
          <Pressable
            style={({ pressed }) => [styles.button, { marginTop: 8 }, pressed && { opacity: 0.8 }]}
            onPress={() => Linking.openURL(resource.url!).catch(() => {})}
            accessibilityRole="button"
            accessibilityLabel="Open website"
          >
            <Text style={styles.buttonText}>Open Website</Text>
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
