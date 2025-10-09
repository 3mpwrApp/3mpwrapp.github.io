import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import * as Linking from "expo-linking";
import React from "react";
import {
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { podcasts as localPodcasts } from "../../../data/podcasts";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { usePostLoadAnnounce } from "../../../hooks/usePostLoadAnnounce";
import { useTextScale } from "../../../theme/typography";
import { useAppPalette } from "../../../theme/usePalette";
// Stories mirror YouTube list; we render a single combined list (podcasts only)
import Card from "../../../components/Card";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import { fetchPodcasts } from "../../../services/podcasts";
import { useCounts } from "../../../store/counts";
// Link not needed; we open externally via Linking
import ContrastToggle from "../../../components/ContrastToggle";
import SearchBar from "../../../components/SearchBar";
import SettingsLink from "../../../components/SettingsLink";
import SkeletonRow from "../../../components/SkeletonRow";
import { useTranslation } from "../../../i18n";
import { useFavorites } from "../../../store/favorites";
import { useNetwork } from "../../../store/network";
import { useRefresh } from "../../../store/refresh";
import { useSettings } from "../../../store/settings";

export default function PodcastsScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);

  useAnnounceOnMount("Podcasts and Stories");
  useFocusOnRefOnMount(titleRef);

  const [items, setItems] = React.useState(localPodcasts);
  const [query, setQuery] = React.useState("");
  const [mode, setMode] = React.useState<'all'|'saved'>('all');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setCount } = useCounts();
  const { setOffline } = useNetwork();
  const { tick } = useRefresh();
  const { has, toggle } = useFavorites();
  const { youtubeOpenPreference } = useSettings();
  const { t } = useTranslation();

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
          <Ionicons name="play-circle" size={22} color={palette.onPrimary} />
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
            color={palette.onPrimary}
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

  // One-time polite announcement when items first finish loading
  usePostLoadAnnounce({ loading, count: items.length, ns: 'podcasts' });

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = mode === 'saved' ? items.filter(it => has('podcast', it.id)) : items;
    if (!q) return base;
    return base.filter((it) =>
      it.title.toLowerCase().includes(q) ||
      (it.description || '').toLowerCase().includes(q)
    );
  }, [items, query, mode, has]);

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

      <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
        <FilterChip label="All" active={mode==='all'} onPress={() => setMode('all')} palette={palette} />
        <FilterChip label="Saved" active={mode==='saved'} onPress={() => setMode('saved')} palette={palette} />
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search podcasts & stories"
      />

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
        data={filtered}
        keyExtractor={(item) => `thread-${item.id}`}
        ListEmptyComponent={(
          <View style={{ paddingVertical: 12 }}>
            <Text style={[styles.subtitle, { marginBottom: 6, opacity: 0.8 }]}>
              {t('podcasts.empty','No videos match your filters')}
            </Text>
            {(query || mode !== 'all') && (
              <Pressable
                onPress={() => { setQuery(''); setMode('all'); }}
                accessibilityRole="button"
                accessibilityLabel={t('common.resetFilters','Reset filters')}
                style={({ pressed }) => [{ alignSelf:'flex-start', paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }, pressed && { opacity: 0.8 }]}
              >
                <Text style={{ color: palette.text, fontWeight:'700' }}>{t('common.resetFilters','Reset filters')}</Text>
              </Pressable>
            )}
          </View>
        )}
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

function FilterChip({ label, active, onPress, palette }: { label: string; active: boolean; onPress: () => void; palette: any; }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT_SLOP_8}
      style={({ pressed }) => [
        { borderWidth:1, borderColor: active? palette.primary: palette.muted, backgroundColor: active? palette.primary: 'transparent', paddingHorizontal:10, paddingVertical:6, borderRadius:20 },
        pressed && { opacity: 0.7 }
      ]}
    >
      <Text style={{ color: active? palette.onPrimary: palette.text, fontWeight:'700', fontSize:12 }}>{label}</Text>
    </Pressable>
  );
}
