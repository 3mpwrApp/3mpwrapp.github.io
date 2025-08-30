import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList, RefreshControl } from "react-native";
import { colors, type Palette } from "../../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import Card from "../../../components/Card";
import { resources as localResources } from "../../../data/resources";
import { fetchResources } from "../../../services/resources";
import { Link } from "expo-router";
import SearchBar from "../../../components/SearchBar";
import { useCounts } from "../../../store/counts";
import { useAnnounceOnChange } from "../../../hooks/useA11y";
import SkeletonRow from "../../../components/SkeletonRow";
import { useRefresh } from "../../../store/refresh";
import { useNetwork } from "../../../store/network";

export default function ResourcesScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Resources");
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState(localResources);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setCount } = useCounts();
  const { setOffline } = useNetwork();
  const reload = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchResources();
      setItems(data);
      setOffline(false);
    } catch (e) {
      setError("Failed to load resources");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const { tick } = useRefresh();
  React.useEffect(() => {
    reload();
  }, [reload, tick]);

  React.useEffect(() => {
    setCount("resources", items.length);
  }, [items, setCount]);

  useAnnounceOnChange(items.length, (n) => `${n} resources loaded`);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [query, items]);

  return (
    <View style={styles.container} accessibilityLabel="Resources screen" accessible>
      <Text ref={titleRef} nativeID="resources-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Resources
      </Text>
      <Text style={styles.subtitle}>Find helpful guides and materials.</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search resources" accessibilityLabel="Search resources" />
      {loading && (
        <View>
          <SkeletonRow testID="skeleton-resource-1" />
          <SkeletonRow testID="skeleton-resource-2" />
          <SkeletonRow testID="skeleton-resource-3" />
        </View>
      )}
      {error && (
        <Text style={styles.subtitle} accessibilityRole="alert">
          {error}
        </Text>
      )}
      {error && (
        <Text
          onPress={() => {
            setError(null);
            (async () => {
              try {
                setLoading(true);
                const data = await fetchResources();
                setItems(data);
              } catch (e) {
                setError("Failed to load resources");
              } finally {
                setLoading(false);
              }
            })();
          }}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={styles.subtitle}
        >
          Try again
        </Text>
      )}
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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
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
