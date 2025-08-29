import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList } from "react-native";
import { colors } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import Card from "../../components/Card";
import { campaigns } from "../../data/campaigns";
import { Link } from "expo-router";
import SearchBar from "../../components/SearchBar";

export default function CampaignsScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Campaigns");
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter((c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={styles.container} accessibilityLabel="Campaigns screen" accessible>
      <Text ref={titleRef} nativeID="campaigns-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Campaigns
      </Text>
      <Text style={styles.subtitle}>Browse and support active campaigns.</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search campaigns" accessibilityLabel="Search campaigns" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/(tabs)/campaigns/[id]", params: { id: item.id } }}
            asChild
            accessibilityRole="link"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Card title={item.title} subtitle={item.summary} testID={`campaign-${item.id}`} />
          </Link>
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
  });
}
