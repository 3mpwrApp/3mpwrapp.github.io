import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList } from "react-native";
import { colors } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import { podcasts } from "../../data/podcasts";
import Card from "../../components/Card";
import { Link } from "expo-router";

export default function PodcastsScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Podcasts");
  useFocusOnRefOnMount(titleRef);
  return (
    <View style={styles.container} accessibilityLabel="Podcasts screen" accessible>
      <Text ref={titleRef} nativeID="podcasts-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Podcasts
      </Text>
      <Text style={styles.subtitle}>Listen to community stories and insights.</Text>
      <FlatList
        data={podcasts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/(tabs)/podcasts/[id]", params: { id: item.id } }} asChild accessibilityRole="link" accessibilityLabel={`Open ${item.title}`}>
            <Card title={item.title} subtitle={`${item.description} • ${item.duration}`} testID={`podcast-${item.id}`} />
          </Link>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
      />
    </View>
  );
}

function createStyles(palette: typeof colors.light) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: 16, color: palette.muted, marginBottom: 8 },
  });
}

