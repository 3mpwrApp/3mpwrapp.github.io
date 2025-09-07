import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Share,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { researchItems } from "../../../data/research";
import SettingsLink from "../../../components/SettingsLink";

export const options = { href: null };

export default function ResearchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const item = researchItems.find((r) => r.id === id);

  return (
    <>
      <Stack.Screen options={{ title: item?.title ?? "Research" }} />
      <View style={styles.container}>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        <Text style={styles.title}>{item?.title ?? "Research"}</Text>
        <Text style={styles.text}>
          {item ? `${item.source} â€¢ ${item.year}` : ""}
        </Text>
        <Text style={styles.text}>
          {item?.summary ?? "Details unavailable."}
        </Text>
        {item?.url ? (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => Linking.openURL(item.url!).catch(() => {})}
            accessibilityRole="button"
            accessibilityLabel="Open research link"
          >
            <Text style={styles.buttonText}>Open Link</Text>
          </Pressable>
        ) : null}
        {item?.url ? (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { marginTop: 8 },
              pressed && { opacity: 0.9 },
            ]}
            onPress={() =>
              Share.share({ title: item.title, message: item.url }).catch(
                () => {},
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Share"
          >
            <Text style={styles.buttonText}>Share</Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

function createStyles(
  palette: ReturnType<typeof useAppPalette>,
  factor: number,
) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: {
      fontSize: Math.round(22 * factor),
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    text: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.95,
      marginBottom: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
    },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  });
}
