import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import { advocates } from "../../data/advocates";
import Card from "../../components/Card";
import { Link } from "expo-router";
import SearchBar from "../../components/SearchBar";

export default function AdvocatesScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Advocates");
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return advocates;
    return advocates.filter((a) => a.name.toLowerCase().includes(q) || a.bio.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={styles.container} accessibilityLabel="Advocates screen" accessible>
      <Text ref={titleRef} nativeID="advocates-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Advocates
      </Text>
      <Text style={styles.subtitle}>Connect with community advocates.</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search advocates" accessibilityLabel="Search advocates" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/(tabs)/advocates/[id]", params: { id: item.id } }}
            asChild
            accessibilityRole="link"
            accessibilityLabel={`Open ${item.name}`}
          >
            <Card title={item.name} subtitle={item.bio} testID={`advocate-${item.id}`} />
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
