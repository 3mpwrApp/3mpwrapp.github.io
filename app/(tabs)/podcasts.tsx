import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import { podcasts as localPodcasts } from "../../data/podcasts";
import { fetchPodcasts } from "../../services/podcasts";
import Card from "../../components/Card";
import { Link } from "expo-router";

export default function PodcastsScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Podcasts");
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState(localPodcasts);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPodcasts();
        if (mounted) setItems(data);
      } catch (e: any) {
        if (mounted) setError("Failed to load podcasts");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container} accessibilityLabel="Podcasts screen" accessible>
      <Text ref={titleRef} nativeID="podcasts-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Podcasts
      </Text>
      <Text style={styles.subtitle}>Listen to community stories and insights.</Text>
      {loading && <Text style={styles.subtitle}>Loading…</Text>}
      {error && <Text style={styles.subtitle}>{error}</Text>}
      <FlatList
        data={items}
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

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: 16, color: palette.muted, marginBottom: 8 },
  });
}
