import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  FlatList,
  RefreshControl,
  TextInput,
  Pressable,
} from "react-native";
import { colors, type Palette } from "../../../theme/colors";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
  useAnnounceOnChange,
} from "../../../hooks/useA11y";
import Card from "../../../components/Card";
import { campaigns as localCampaigns } from "../../../data/campaigns";
import { fetchCampaigns } from "../../../services/campaigns";
import { Link } from "expo-router";
import SearchBar from "../../../components/SearchBar";
import { useCounts } from "../../../store/counts";
import SkeletonRow from "../../../components/SkeletonRow";
import { useRefresh } from "../../../store/refresh";
import { useNetwork } from "../../../store/network";
import {
  CampaignsLocalProvider,
  useCampaignsLocal,
} from "../../../store/campaignsLocal";
import { logEvent } from "../../../services/analytics";
import {
  fsAddCampaign,
  fsIncrementCampaignMembers,
} from "../../../services/firestore";

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
    } catch {
      setError("Failed to load campaigns");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [setOffline]);

  const { tick } = useRefresh();
  React.useEffect(() => {
    reload();
  }, [reload, tick]);

  React.useEffect(() => {
    setCount("campaigns", items.length);
  }, [items, setCount]);

  useAnnounceOnChange(items.length, (n) => `${n} campaigns loaded`);

  const allItems = React.useMemo(
    () => [...local.myCampaigns, ...items],
    [local.myCampaigns, items],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q),
    );
  }, [query, allItems]);

  return (
    <View style={styles.container}>
      <Text
        ref={titleRef}
        nativeID="campaigns-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Campaigns
      </Text>
      <Text style={styles.subtitle}>Browse, create, and join campaigns.</Text>

      <CreateCampaignBox
        onCreate={async (data) => {
          const c = createCampaign(data.title, data.summary);
          logEvent("campaign_create", { id: c.id });
          await fsAddCampaign({
            id: c.id,
            title: data.title,
            summary: data.summary,
            target: data.target || undefined,
            goalCount: data.goalCount || undefined,
            contactEmail: data.contactEmail || undefined,
            createdAt: Date.now(),
          });
        }}
        palette={palette}
      />

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search campaigns"
      />

      {loading && (
        <View>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      )}

      {error && (
        <>
          <Text style={styles.subtitle}>{error}</Text>
          <Text onPress={reload} style={styles.subtitle}>
            Try again
          </Text>
        </>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => `thread-${item.id}`}
        renderItem={({ item }) => (
          <View>
            <Link
              href={
                {
                  pathname: "/(tabs)/campaigns/[id]",
                  params: { id: item.id },
                } as any
              }
              asChild
            >
              <Card
                title={item.title}
                subtitle={`${item.summary}${item.membersCount ? ` • ${item.membersCount} supporters` : ""}`}
              />
            </Link>
            <Pressable
              onPress={async () => {
                try {
                  await fsIncrementCampaignMembers(item.id, 1);
                } catch {}
              }}
              accessibilityRole="button"
              accessibilityLabel="Support this campaign"
              style={{
                alignSelf: "flex-start",
                marginTop: 6,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: palette.muted,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: palette.text, fontWeight: "700" }}>
                Support
              </Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} />
        }
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
    title: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: {
      fontSize: 17,
      color: palette.text,
      opacity: 0.9,
      marginBottom: 8,
    },
  });
}

function CreateCampaignBox({
  onCreate,
  palette,
}: {
  onCreate: (data: {
    title: string;
    summary: string;
    target?: string;
    goalCount?: number;
    contactEmail?: string;
  }) => void;
  palette: Palette;
}) {
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [goalCount, setGoalCount] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const canCreate = title.trim().length > 2 && summary.trim().length > 4;

  const field = (ph: string, val: string, set: (v: string) => void) => (
    <TextInput
      placeholder={ph}
      placeholderTextColor={palette.muted}
      value={val}
      onChangeText={set}
      style={{
        borderWidth: 1,
        borderColor: palette.muted,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: palette.text,
        marginBottom: 6,
      }}
    />
  );

  return (
    <View style={{ marginBottom: 12 }}>
      {field("Campaign title", title, setTitle)}
      {field("Brief summary", summary, setSummary)}
      {field("Target (e.g., Ministry of Labour)", target, setTarget)}
      {field("Goal (supporters count)", goalCount, setGoalCount)}
      {field("Contact email (optional)", contactEmail, setContactEmail)}
      <Pressable
        onPress={() => {
          if (!canCreate) return;
          onCreate({
            title: title.trim(),
            summary: summary.trim(),
            target: target.trim() || undefined,
            goalCount: goalCount ? Number(goalCount) : undefined,
            contactEmail: contactEmail.trim() || undefined,
          });
          setTitle("");
          setSummary("");
          setTarget("");
          setGoalCount("");
          setContactEmail("");
        }}
        disabled={!canCreate}
        style={{
          backgroundColor: palette.primary,
          borderRadius: 10,
          paddingVertical: 10,
          alignItems: "center",
          opacity: canCreate ? 1 : 0.6,
        }}
      >
        <Text style={{ color: palette.onPrimary, fontWeight: "700" }}>
          Create Campaign
        </Text>
      </Pressable>
    </View>
  );
}
