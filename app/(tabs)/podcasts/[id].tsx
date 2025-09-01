import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable, Linking, Share } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { colors, type Palette } from "../../../theme/colors";
import { podcasts } from "../../../data/podcasts";
import { useFavorites } from "../../../store/favorites";
// Lazily import expo-av to avoid bundling errors if it's not installed
// and provide a graceful fallback when unavailable.
let Audio: any; // assigned at runtime via dynamic import
type AVPlaybackStatusSuccess = any;

export default function PodcastDetail() {
  const { id, title: t, description: d, duration: du } = useLocalSearchParams<{ id: string; title?: string; description?: string; duration?: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const podcast = podcasts.find((p) => p.id === id) || (t ? { id: String(id), title: String(t), description: String(d || ""), duration: String(du || ""), audioUrl: "" } : undefined);
  const { has, toggle } = useFavorites();
  const saved = podcast ? has("podcast", podcast.id) : false;

  const soundRef = React.useRef<any | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(0);
  const [dur, setDur] = React.useState(0);
  const [audioSupported, setAudioSupported] = React.useState(true);

  React.useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const ensureLoaded = React.useCallback(async () => {
    if (!podcast?.audioUrl) return null;
    if (soundRef.current) return soundRef.current;
    if (!Audio) {
      try {
        const mod = await import("expo-av");
        Audio = mod.Audio;
      } catch (e) {
        setAudioSupported(false);
        return null;
      }
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: podcast.audioUrl },
      { shouldPlay: false },
      (status: any) => {
        if (!status.isLoaded) return;
        const s = status as AVPlaybackStatusSuccess;
        setPos(s.positionMillis);
        setDur(s.durationMillis ?? 0);
        setIsPlaying(s.isPlaying);
      }
    );
    soundRef.current = sound;
    return sound;
  }, [podcast?.audioUrl]);

  const togglePlay = React.useCallback(async () => {
    if (!podcast?.audioUrl) return;
    const snd = await ensureLoaded();
    if (!snd) return;
    const status = await snd.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await snd.pauseAsync();
    } else {
      await snd.playAsync();
    }
  }, [ensureLoaded, podcast?.audioUrl]);

  return (
    <>
      <Stack.Screen options={{ title: podcast?.title ?? "Podcast" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{podcast?.title ?? "Podcast"}</Text>
        <Text style={styles.text}>{podcast ? `${podcast.description} • ${podcast.duration}` : "Details unavailable."}</Text>
        {!!podcast && (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => toggle("podcast", podcast.id)}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove from favorites" : "Save to favorites"}
          >
            <Text style={styles.buttonText}>{saved ? "Remove from Favorites" : "Save to Favorites"}</Text>
          </Pressable>
        )}

        {podcast?.audioUrl ? (
          <View style={{ height: 12 }} />
        ) : null}

        {podcast?.audioUrl ? (
          <View accessibilityLabel="Audio player" accessible>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
              onPress={togglePlay}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? "Pause" : "Play"}
            >
              <Text style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</Text>
            </Pressable>
            <Text style={styles.text} accessibilityLabel={`Progress ${formatTime(pos)} of ${formatTime(dur)}`}>
              {formatTime(pos)} / {formatTime(dur)}
            </Text>
          </View>
        ) : null}

        {!podcast?.audioUrl && String(id || "").startsWith("yt:") ? (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => {
              const vid = String(id).slice(3);
              const url = `https://www.youtube.com/watch?v=${vid}`;
              Linking.openURL(url).catch(() => {});
            }}
            accessibilityRole="button"
            accessibilityLabel="Open on YouTube"
          >
            <Text style={styles.buttonText}>Open on YouTube</Text>
          </Pressable>
        ) : null}

        <View style={{ height: 8 }} />
        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
          onPress={() => {
            const vid = String(id).startsWith("yt:") ? String(id).slice(3) : null;
            const url = vid ? `https://www.youtube.com/watch?v=${vid}` : podcast?.audioUrl;
            Share.share({ title: podcast?.title ?? "Podcast", message: url || podcast?.title || "" }).catch(() => {});
          }}
          accessibilityRole="button"
          accessibilityLabel="Share"
        >
          <Text style={styles.buttonText}>Share</Text>
        </Pressable>

        {!podcast?.audioUrl && !String(id || "").startsWith("yt:") ? (
          <Text style={styles.text}>No audio available.</Text>
        ) : null}

        {!audioSupported && (
          <Text style={styles.text}>
            Audio playback not available. Install expo-av to enable podcasts.
          </Text>
        )}
      </View>
    </>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: palette.text },
    text: { fontSize: 16, color: palette.text, opacity: 0.95, marginBottom: 16 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, minHeight: 44, minWidth: 44 },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  });
}

function formatTime(ms: number) {
  if (!ms || ms < 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
