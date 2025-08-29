import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import Card from "../../components/Card";
import { resources } from "../../data/resources";
import { Link } from "expo-router";
import SearchBar from "../../components/SearchBar";

export default function ResourcesScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Resources");
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={styles.container} accessibilityLabel="Resources screen" accessible>
      <Text ref={titleRef} nativeID="resources-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Resources
      </Text>
      <Text style={styles.subtitle}>Find helpful guides and materials.</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search resources" accessibilityLabel="Search resources" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/(tabs)/resources/[id]", params: { id: item.id } }}
            asChild
            accessibilityRole="link"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Card title={item.title} subtitle={item.description} testID={`resource-${item.id}`} />
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
