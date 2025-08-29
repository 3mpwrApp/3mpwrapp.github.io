import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList } from "react-native";
import { colors } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import { posts } from "../../data/community";

export default function CommunityScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Community");
  useFocusOnRefOnMount(titleRef);
  return (
    <View style={styles.container} accessibilityLabel="Community screen" accessible>
      <Text ref={titleRef} nativeID="community-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Community
      </Text>
      <Text style={styles.subtitle}>Hear from community voices.</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.post} accessibilityLabel={`Post by ${item.author}`} accessible>
            <Text style={styles.postAuthor}>{item.author}</Text>
            <Text style={styles.postContent}>{item.content}</Text>
          </View>
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
    post: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    postAuthor: { color: palette.text, fontWeight: "600", marginBottom: 4 },
    postContent: { color: palette.muted },
  });
}
