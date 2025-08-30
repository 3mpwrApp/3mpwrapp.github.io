import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList, RefreshControl, TextInput, Pressable } from "react-native";
import { colors, type Palette } from "../../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import Card from "../../../components/Card";
import { campaigns as localCampaigns } from "../../../data/campaigns";
import { fetchCampaigns } from "../../../services/campaigns";
import { Link } from "expo-router";
import SearchBar from "../../../components/SearchBar";
import { useCounts } from "../../../store/counts";
import { useAnnounceOnChange } from "../../../hooks/useA11y";
import SkeletonRow from "../../../components/SkeletonRow";
import { useRefresh } from "../../../store/refresh";
import { useNetwork } from "../../../store/network";
import { CampaignsLocalProvider, useCampaignsLocal } from "../../../store/campaignsLocal";
import { logEvent } from "../../../services/analytics";

function ScreenInner() {
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
  const { state: local, createCampaign } = useCampaignsLocal();
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
  const allItems = React.useMemo(() => {
    // Merge user-created campaigns with fetched ones (user-created first)
    const merged = [...local.myCampaigns, ...items];
    return merged;
  }, [local.myCampaigns, items]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q));
  }, [query, allItems]);

  return (
    <View style={styles.container} accessibilityLabel="Campaigns screen" accessible>
      <Text ref={titleRef} nativeID="campaigns-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Campaigns
      </Text>
      <Text style={styles.subtitle}>Browse, create, and join campaigns.</Text>
      {/* Create campaign */}
      <CreateCampaignBox onCreate={(title, summary) => { const c = createCampaign(title, summary); logEvent("campaign_create", { id: c.id }); }} palette={palette} />
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

export default function CampaignsScreen() {
  return (
    <CampaignsLocalProvider>
      <ScreenInner />
    </CampaignsLocalProvider>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text, fontFamily: "Poppins" },
    subtitle: { fontSize: 16, color: palette.muted, marginBottom: 8, fontFamily: "Roboto" },
  });
}

function CreateCampaignBox({ onCreate, palette }: { onCreate: (title: string, summary: string) => void; palette: Palette }) {
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const canCreate = title.trim().length > 2 && summary.trim().length > 4;
  return (
    <View style={{ marginBottom: 12 }} accessibilityLabel="Create a campaign" accessible>
      <TextInput
        placeholder="Campaign title"
        placeholderTextColor={palette.muted}
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: palette.text, marginBottom: 6 }}
        accessibilityLabel="Campaign title"
      />
      <TextInput
        placeholder="Brief summary"
        placeholderTextColor={palette.muted}
        value={summary}
        onChangeText={setSummary}
        style={{ borderWidth: 1, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: palette.text, marginBottom: 6 }}
        accessibilityLabel="Campaign summary"
      />
      <Pressable
        onPress={() => { if (!canCreate) return; onCreate(title.trim(), summary.trim()); setTitle(""); setSummary(""); }}
        disabled={!canCreate}
        style={({ pressed }) => [{ backgroundColor: palette.primary, borderRadius: 10, paddingVertical: 10, alignItems: "center" }, (!canCreate || pressed) && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel="Create campaign"
      >
        <Text style={{ color: palette.onPrimary, fontWeight: "700" }}>Create Campaign</Text>
      </Pressable>
    </View>
  );
}
