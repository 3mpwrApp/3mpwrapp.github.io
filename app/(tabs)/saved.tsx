import React from "react";
import { View, Text, StyleSheet, useColorScheme, SectionList } from "react-native";
import { useAppPalette } from "../../theme/usePalette";
import { useTextScale } from "../../theme/typography";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import { useFavorites } from "../../store/favorites";
import { fetchPodcasts } from "../../services/podcasts";
import { fetchResources } from "../../services/resources";
import { fetchCampaigns } from "../../services/campaigns";
import { Link } from "expo-router";
import Card from "../../components/Card";
import type { Podcast } from "../../data/podcasts";
import type { Resource, Campaign } from "../../types/models";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type SectionItem = (Podcast & { kind: "podcast" }) | (Resource & { kind: "resource" }) | (Campaign & { kind: "campaign" });

export default function SavedScreen() {
  const scheme = useColorScheme();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Saved");
  useFocusOnRefOnMount(titleRef);

  const { state } = useFavorites();
  const [pods, setPods] = React.useState<Podcast[]>([]);
  const [res, setRes] = React.useState<Resource[]>([]);
  const [camps, setCamps] = React.useState<Campaign[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const [p, r, c] = await Promise.all([fetchPodcasts(), fetchResources(), fetchCampaigns()]);
        setPods(p);
        setRes(r);
        setCamps(c);
      } catch {}
    })();
  }, []);

  const podItems: SectionItem[] = React.useMemo(() => {
    const savedIds = state.podcast;
    return pods.filter((p) => savedIds.has(p.id)).map((p) => ({ ...p, kind: "podcast" as const }));
  }, [pods, state.podcast]);

  const resItems: SectionItem[] = React.useMemo(() => {
    const savedIds = state.resource;
    return res.filter((r) => savedIds.has(r.id)).map((r) => ({ ...r, kind: "resource" as const }));
  }, [res, state.resource]);

  const campItems: SectionItem[] = React.useMemo(() => {
    const savedIds = state.campaign;
    return camps.filter((c) => savedIds.has(c.id)).map((c) => ({ ...c, kind: "campaign" as const }));
  }, [camps, state.campaign]);

  const sections = React.useMemo(() => {
    const s: { title: string; data: SectionItem[] }[] = [];
    if (podItems.length) s.push({ title: "Podcasts", data: podItems });
    if (resItems.length) s.push({ title: "Resources", data: resItems });
    if (campItems.length) s.push({ title: "Campaigns", data: campItems });
    return s.length ? s : [{ title: "Saved", data: [] }];
  }, [podItems, resItems, campItems]);

  return (
    <View style={styles.container} accessibilityLabel="Saved screen" accessible>
      <Text ref={titleRef} nativeID="saved-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Saved
      </Text>
      {sections.length === 1 && sections[0].data.length === 0 ? (
        <Text style={styles.subtitle}>You haven't saved anything yet.</Text>
      ) : null}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons
              name={section.title === "Podcasts" ? "microphone" : "book-outline"}
              size={18}
              color={palette.text}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.sectionHeader}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          if (item.kind === "podcast") {
            const yt = String(item.id).startsWith("yt:");
            return (
              <Link
                href={{ pathname: "/(tabs)/podcasts/[id]", params: { id: item.id, title: item.title, description: item.description, duration: item.duration } }}
                asChild
              >
                <Card
                  title={item.title}
                  subtitle={`${item.description} • ${item.duration}`}
                  rightIcon={yt ? "logo-youtube" : "chevron-forward"}
                  left={item.thumbnailUrl ? <View style={{ width: 44, height: 44, borderRadius: 4, overflow: "hidden", backgroundColor: palette.muted }} /> : undefined}
                />
              </Link>
            );
          }
          if (item.kind === "campaign") {
            return (
              <Link href={{ pathname: "/(tabs)/campaigns/[id]", params: { id: item.id } }} asChild>
                <Card title={item.title} subtitle={item.summary} rightIcon="megaphone-outline" />
              </Link>
            );
          }
          return (
            <Link href={{ pathname: "/(tabs)/resources/[id]", params: { id: item.id } }} asChild>
              <Card title={item.title} subtitle={item.description} />
            </Link>
          );
        }}
        contentContainerStyle={{ paddingTop: 12 }}
      />
    </View>
  );
}

type Palette = ReturnType<typeof useAppPalette>;
function createStyles(palette: Palette, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: Math.round(17 * factor), color: palette.text, opacity: 0.9, marginBottom: 8 },
    sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 6 },
    sectionHeader: { fontWeight: "700", color: palette.text },
  });
}
