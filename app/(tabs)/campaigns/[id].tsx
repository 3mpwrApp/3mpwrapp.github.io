import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { colors } from "../../../theme/colors";
import { campaigns } from "../../../data/campaigns";

export default function CampaignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  const campaign = campaigns.find((c) => c.id === id);

  return (
    <>
      <Stack.Screen options={{ title: campaign?.title ?? "Campaign" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{campaign?.title ?? "Campaign"}</Text>
        <Text style={styles.text}>{campaign?.summary ?? "Details unavailable."}</Text>
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

