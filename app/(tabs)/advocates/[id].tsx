import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { colors } from "../../../theme/colors";
import { advocates } from "../../../data/advocates";
import { useFavorites } from "../../../store/favorites";

export default function AdvocateDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  const advocate = advocates.find((a) => a.id === id);
  const { has, toggle } = useFavorites();
  const saved = advocate ? has("advocate", advocate.id) : false;

  return (
    <>
      <Stack.Screen options={{ title: advocate?.name ?? "Advocate" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{advocate?.name ?? "Advocate"}</Text>
        <Text style={styles.text}>{advocate?.bio ?? "Details unavailable."}</Text>
        {!!advocate && (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => toggle("advocate", advocate.id)}
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

function createStyles(palette: typeof colors.light) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: palette.text },
    text: { fontSize: 16, color: palette.muted, marginBottom: 16 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, minHeight: 44, minWidth: 44 },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  });
}
