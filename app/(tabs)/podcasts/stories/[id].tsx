import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

import { colors, type Palette } from "../../../../theme/colors";
import { stories } from "../../../../data/stories";

export const options = { href: null };

export default function StoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  const story = stories.find((s) => s.id === id);

  return (
    <>
      <Stack.Screen options={{ title: story?.title ?? "Story" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{story?.title ?? "Story"}</Text>
        <Text style={styles.text}>
          {story?.description ?? "Details unavailable."}
        </Text>
        {!!story?.author && <Text style={styles.text}>By {story.author}</Text>}
      </View>
    </>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    text: { fontSize: 16, color: palette.text, opacity: 0.95, marginBottom: 8 },
  });
}
