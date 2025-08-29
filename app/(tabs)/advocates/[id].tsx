import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { colors } from "../../../theme/colors";
import { advocates } from "../../../data/advocates";

export default function AdvocateDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  const advocate = advocates.find((a) => a.id === id);

  return (
    <>
      <Stack.Screen options={{ title: advocate?.name ?? "Advocate" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{advocate?.name ?? "Advocate"}</Text>
        <Text style={styles.text}>{advocate?.bio ?? "Details unavailable."}</Text>
      </View>
    </>
  );
}

function createStyles(palette: typeof colors.light) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: palette.text },
    text: { fontSize: 16, color: palette.muted },
  });
}

