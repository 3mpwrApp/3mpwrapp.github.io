import { Stack, useLocalSearchParams } from "expo-router";
import {
    Image,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    useColorScheme,
} from "react-native";

import { useFavorites } from "../../store/favorites";
import { colors, type Palette } from "../../theme/colors";
import { useTextScale } from "../../theme/typography";

 
const { trackEvent } = require("../../services/analyticsClient");

export const options = { href: null };

export default function PodcastDetail() {
  const { id, title, description, duration } = useLocalSearchParams<{
    id: string;
    title: string;
    description: string;
    duration: string;
  }>();

  const scheme = useColorScheme();
  const palette: Palette = scheme === "dark" ? colors.dark : colors.light;
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);

  const { has, toggle } = useFavorites();
  const saved = id ? has("podcast", id) : false;

  return (
    <>
      <Stack.Screen options={{ title: title ?? "Podcast" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Thumbnail placeholder */}
        <Image
          source={{
            uri:
              "https://placehold.co/400x200?text=Podcast" +
              (title ? `: ${title}` : ""),
          }}
          style={styles.thumbnail}
        />

        <Text style={styles.title}>{title ?? "Podcast"}</Text>
        <Text style={styles.meta}>
          {duration ? `Duration: ${duration}` : ""}
        </Text>
        <Text style={styles.description}>
          {description ?? "No description available."}
        </Text>

        {/* Save / Unsave */}
        {id && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => toggle("podcast", id)}
            accessibilityRole="button"
            accessibilityLabel={
              saved ? "Remove from favorites" : "Save to favorites"
            }
          >
            <Text style={styles.buttonText}>
              {saved ? "Remove from Favorites" : "Save to Favorites"}
            </Text>
          </Pressable>
        )}

        {/* Share */}
        {id && (
          <Pressable
            style={({ pressed }) => [
              styles.secondary,
              pressed && { opacity: 0.8 },
            ]}
            onPress={async () => {
              try {
                const msg = `${title ?? "Podcast"} â€” ${description ?? ""}`;
                await Share.share({
                  title: title ?? "Podcast",
                  message: msg,
                  url: `https://3mpwrapp.pages.dev/podcasts/${id}`,
                });
                try { trackEvent("podcast_share", { id }); } catch {}
              } catch (e) {
                console.warn("Share failed", e);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Share podcast"
          >
            <Text style={styles.secondaryText}>Share</Text>
          </Pressable>
        )}
      </ScrollView>
    </>
  );
}

function createStyles(palette: Palette, factor: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    thumbnail: {
      width: "100%",
      height: 200,
      borderRadius: 8,
      backgroundColor: palette.muted,
      marginBottom: 16,
    },
    title: {
      fontSize: Math.round(22 * factor),
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    meta: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.8,
      marginBottom: 12,
    },
    description: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.95,
      marginBottom: 16,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      marginBottom: 8,
    },
    buttonText: {
      color: palette.onPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    secondary: {
      backgroundColor: "transparent",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 6,
    },
    secondaryText: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
