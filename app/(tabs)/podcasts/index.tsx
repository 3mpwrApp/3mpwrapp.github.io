import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList, RefreshControl, Image } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount, useAnnounceOnChange } from "../../../hooks/useA11y";
import { podcasts as localPodcasts } from "../../../data/podcasts";
import { stories as localStories } from "../../../data/stories";
import { fetchPodcasts } from "../../../services/podcasts";
import { fetchStories } from "../../../services/stories";
import { useCounts } from "../../../store/counts";
import Card from "../../../components/Card";
import { Link } from "expo-router";
import SkeletonRow from "../../../components/SkeletonRow";
import { useRefresh } from "../../../store/refresh";
import { useNetwork } from "../../../store/network";
import SettingsLink from "../../../components/SettingsLink";
import ContrastToggle from "../../../components/ContrastToggle";

export default function PodcastsScreen() {
  const scheme = useColorScheme();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Podcasts and Stories");
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState(localPodcasts);
  const [stories, setStories] = React.useState(localStories);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setCount } = useCounts();
  const { setOffline } = useNetwork();
  const reload = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [podData, storyData] = await Promise.all([
        fetchPodcasts(),
        fetchStories(),
      ]);
      setItems(podData);
      setStories(storyData);
      setOffline(false);
    } catch (e) {
      setError("Failed to load podcasts");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const { tick } = useRefresh();
  React.useEffect(() => {
    reload();
  }, [reload, tick]);

  React.useEffect(() => {
    setCount("podcasts", items.length);
  }, [items, setCount]);

  useAnnounceOnChange(items.length, (n) => `${n} podcasts loaded`);

  return (
    <View style={styles.container} accessibilityLabel="Podcasts and Stories screen" accessible>
      <Text ref={titleRef} nativeID="podcasts-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Podcasts & Stories
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.subtitle}>Listen to community stories and insights.</Text>
      {loading && (
        <View>
          <SkeletonRow testID="skeleton-podcast-1" />
          <SkeletonRow testID="skeleton-podcast-2" />
          <SkeletonRow testID="skeleton-podcast-3" />
        </View>
      )}
      {error && (
        <Text style={styles.subtitle} accessibilityRole="alert">
          {error}
        </Text>
      )}
      {error && (
        <Text onPress={reload} accessibilityRole="button" accessibilityLabel="Try again" style={styles.subtitle}>
          Try again
        </Text>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/(tabs)/podcasts/[id]",
              params: {
                id: item.id,
                title: item.title,
                description: item.description,
                duration: item.duration,
              },
            }}
            asChild
            accessibilityRole="link"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Card
              title={item.title}
              subtitle={`${item.description} \u2022 ${item.duration}`}
              testID={`podcast-${item.id}`}
              rightIcon={String(item.id).startsWith("yt:") ? "logo-youtube" : "chevron-forward"}
              left={item.thumbnailUrl ? (
                <Image source={{ uri: item.thumbnailUrl }} style={{ width: 48, height: 48, borderRadius: 4, backgroundColor: palette.muted }} />
              ) : undefined}
            />
          </Link>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
      />
      <Text style={[styles.title, { marginTop: 16 }]}>Stories</Text>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/(tabs)/podcasts/stories/[id]", params: { id: item.id } }} asChild accessibilityRole="link" accessibilityLabel={`Open ${item.title}`}>
            <Card title={item.title} subtitle={item.description} testID={`story-${item.id}`} />
          </Link>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
      />
    </View>
  );
}

function createStyles(palette: Palette, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: Math.round(17 * factor), color: palette.text, opacity: 0.9, marginBottom: 8 },
  });
}
