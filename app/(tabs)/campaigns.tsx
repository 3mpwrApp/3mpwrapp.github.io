import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList, RefreshControl } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import Card from "../../components/Card";
import { campaigns as localCampaigns } from "../../data/campaigns";
import { fetchCampaigns } from "../../services/campaigns";
import { Link } from "expo-router";
import SearchBar from "../../components/SearchBar";
import { useCounts } from "../../store/counts";
import { useAnnounceOnChange } from "../../hooks/useA11y";
import SkeletonRow from "../../components/SkeletonRow";
import { useRefresh } from "../../store/refresh";
import { useNetwork } from "../../store/network";

export default function CampaignsScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Campaigns");
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState(localCampaigns);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setCount } = useCounts();
  const { setOffline } = useNetwork();
  const reload = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchCampaigns();
      setItems(data);
      setOffline(false);
    } catch (e) {
      setError("Failed to load campaigns");
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
    setCount("campaigns", items.length);
  }, [items, setCount]);

  useAnnounceOnChange(items.length, (n) => `${n} campaigns loaded`);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q));
  }, [query, items]);

  return (
    <View style={styles.container} accessibilityLabel="Campaigns screen" accessible>
      <Text ref={titleRef} nativeID="campaigns-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Campaigns
      </Text>
      <Text style={styles.subtitle}>Browse and support active campaigns.</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search campaigns" accessibilityLabel="Search campaigns" />
      {loading && (
        <View>
          <SkeletonRow testID="skeleton-campaign-1" />
          <SkeletonRow testID="skeleton-campaign-2" />
          <SkeletonRow testID="skeleton-campaign-3" />
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
            // retry
            setError(null);
            (async () => {
              try {
                setLoading(true);
                const data = await fetchCampaigns();
                setItems(data);
              } catch (e) {
                setError("Failed to load campaigns");
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
            href={{ pathname: "/(tabs)/campaigns/[id]", params: { id: item.id } }}
            asChild
            accessibilityRole="link"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Card title={item.title} subtitle={item.summary} testID={`campaign-${item.id}`} />
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
