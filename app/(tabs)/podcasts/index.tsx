import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Pressable,
} from "react-native";
import * as Linking from "expo-linking";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
  useAnnounceOnChange,
} from "../../../hooks/useA11y";
import { podcasts as localPodcasts } from "../../../data/podcasts";
// Stories mirror YouTube list; we render a single combined list (podcasts only)
import { fetchPodcasts } from "../../../services/podcasts";
import { useCounts } from "../../../store/counts";
import Card from "../../../components/Card";
// Link not needed; we open externally via Linking
import SkeletonRow from "../../../components/SkeletonRow";
import { useRefresh } from "../../../store/refresh";
import { useNetwork } from "../../../store/network";
import SettingsLink from "../../../components/SettingsLink";
import ContrastToggle from "../../../components/ContrastToggle";
import { useFavorites } from "../../../store/favorites";
import { useSettings } from "../../../store/settings";

export default function PodcastsScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);

  useAnnounceOnMount("Podcasts and Stories");
  useFocusOnRefOnMount(titleRef);

  const [items, setItems] = React.useState(localPodcasts);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setCount } = useCounts();
  const { setOffline } = useNetwork();
  const { tick } = useRefresh();
  const { has, toggle } = useFavorites();
  const { youtubeOpenPreference } = useSettings();

  const openYouTubeDirect = React.useCallback(async (idOrUrl: string) => {
    const id = idOrUrl.startsWith("yt:") ? idOrUrl.replace("yt:", "") : idOrUrl;
    const appUrl = `vnd.youtube:${id}`;
    const webUrl = idOrUrl.startsWith("http")
      ? idOrUrl
      : `https://youtu.be/${id}`;
    try {
      await Linking.openURL(appUrl);
    } catch {
      await Linking.openURL(webUrl);
    }
  }, []);

  const openYouTubeChooser = React.useCallback(
    (idOrUrl: string, title: string) => {
      const id = idOrUrl.startsWith("yt:")
        ? idOrUrl.replace("yt:", "")
        : idOrUrl;
      const webUrl = idOrUrl.startsWith("http")
        ? idOrUrl
        : `https://youtu.be/${id}`;
      Alert.alert(
        title,
        "Open in:",
        [
          { text: "YouTube App", onPress: () => openYouTubeDirect(idOrUrl) },
          { text: "Browser", onPress: () => Linking.openURL(webUrl) },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true },
      );
    },
    [openYouTubeDirect],
  );

  function RowThumbnail({
    videoId,
    tint,
    saved,
    onToggle,
  }: {
    videoId: string;
    tint: string;
    saved: boolean;
    onToggle: () => void;
  }) {
    const id = videoId.replace("yt:", "");
    const [loaded, setLoaded] = React.useState(false);
    return (
      <View
        style={{
          position: "relative",
          width: 48,
          height: 48,
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: tint,
        }}
      >
        <ExpoImage
          source={{ uri: `https://img.youtube.com/vi/${id}/hqdefault.jpg` }}
          style={{ width: 48, height: 48 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          onLoadEnd={() => setLoaded(true)}
        />
        {!loaded && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              backgroundColor: tint,
              opacity: 0.3,
            }}
          />
        )}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="play-circle" size={22} color="#ffffff" />
        </View>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          accessibilityLabel={
            saved ? "Remove from favorites" : "Save to favorites"
          }
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={({ pressed }) => [
            { position: "absolute", top: 2, right: 2, padding: 2 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={16}
            color="#fff"
          />
        </Pressable>
      </View>
    );
  }

  const reload = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [podData] = await Promise.all([fetchPodcasts()]);
      setItems(podData);
      setOffline(false);
    } catch (e) {
      console.warn("Failed to fetch podcasts", e);
      setError("Failed to load podcasts");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [setOffline]);

  React.useEffect(() => {
    reload();
  }, [reload, tick]);

  React.useEffect(() => {
    setCount("podcasts", items.length);
  }, [items, setCount]);

  useAnnounceOnChange(items.length, (n) => `${n} videos loaded`);

  return (
    <View
      style={styles.container}
      accessibilityLabel="Podcasts and Stories screen"
      accessible
    >
      <Text
        ref={titleRef}
        nativeID="podcasts-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Podcasts & Stories
      </Text>

      {/* Quick settings buttons */}
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />

      <Text style={styles.subtitle}>
        Listen to community stories and insights.
      </Text>

      {/* Loading skeletons */}
      {loading && (
        <View>
          <SkeletonRow testID="skeleton-podcast-1" />
          <SkeletonRow testID="skeleton-podcast-2" />
          <SkeletonRow testID="skeleton-podcast-3" />
        </View>
      )}

      {/* Error state */}
      {error && (
        <>
          <Text style={styles.subtitle} accessibilityRole="alert">
            {error}
          </Text>
          <Text
            onPress={reload}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            style={[styles.subtitle, { textDecorationLine: "underline" }]}
          >
            Try again
          </Text>
        </>
      )}

      {/* Videos List (YouTube) */}
      <FlatList
        data={items}
        keyExtractor={(item) => `thread-${item.id}`}
        renderItem={({ item }) => {
          const isYT = String(item.id).startsWith("yt:");
          const saved = has("podcast", item.id);
          return (
            <Card
              title={item.title}
              subtitle={`${item.description}`}
              testID={`video-${item.id}`}
              rightIcon={isYT ? "logo-youtube" : "chevron-forward"}
              onPress={
                isYT
                  ? () => {
                      const id = String(item.id);
                      if (youtubeOpenPreference === "app")
                        {return openYouTubeDirect(id);}
                      if (youtubeOpenPreference === "browser")
                        {return Linking.openURL(
                          `https://youtu.be/${id.replace("yt:", "")}`,
                        );}
                      return openYouTubeChooser(id, item.title);
                    }
                  : undefined
              }
              onLongPress={
                isYT
                  ? () => openYouTubeChooser(String(item.id), item.title)
                  : undefined
              }
              accessibilityLabel={`Open ${item.title} on YouTube`}
              left={
                isYT ? (
                  <RowThumbnail
                    videoId={String(item.id)}
                    tint={palette.muted}
                    saved={saved}
                    onToggle={() => toggle("podcast", item.id)}
                  />
                ) : undefined
              }
              onPressRight={
                isYT ? () => openYouTubeDirect(String(item.id)) : undefined
              }
              rightA11yLabel="Open on YouTube"
            />
          );
        }}
        contentContainerStyle={{ paddingVertical: 12 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} />
        }
      />
    </View>
  );
}

function createStyles(palette: any, factor: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: palette.background,
    },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: {
      fontSize: Math.round(17 * factor),
      color: palette.text,
      opacity: 1,
      marginBottom: 8,
    },
  });
}
