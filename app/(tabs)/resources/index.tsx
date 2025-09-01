import React from "react";
import { View, Text, StyleSheet, useColorScheme, SectionList, RefreshControl, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

import type { Resource } from "../../../types/models";

const PROVINCE_NAMES: Record<string, string> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland & Labrador",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Québec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

type RegionFilter = "all" | "canada" | keyof typeof PROVINCE_NAMES;

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
  const [region, setRegion] = React.useState<RegionFilter>("all");
  const [showAllRegions, setShowAllRegions] = React.useState(false);

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
    let base = items;
    // Region filter
    if (region === "canada") {
      base = base.filter((r) => r.scope === "canada");
    } else if (region !== "all") {
      base = base.filter((r) => r.scope === "province" && r.province === region);
    }
    if (!q) return base;
    return base.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [query, items, region]);

  const sections = React.useMemo(() => {
    if (region !== "all") {
      return [
        {
          title: region === "canada" ? "Canada" : `${region} — ${PROVINCE_NAMES[region]}`,
          data: filtered,
        },
      ];
    }
    const canada = filtered.filter((r) => r.scope === "canada");
    const byProv = new Map<string, Resource[]>();
    for (const r of filtered) {
      if (r.scope === "province" && r.province) {
        if (!byProv.has(r.province)) byProv.set(r.province, []);
        byProv.get(r.province)!.push(r);
      }
    }
    const provSections = Array.from(byProv.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([code, list]) => ({ title: `${code} — ${PROVINCE_NAMES[code]}`, data: list }));
    const result = [] as { title: string; data: Resource[] }[];
    if (canada.length) result.push({ title: "Canada", data: canada });
    return result.concat(provSections);
  }, [filtered, region]);

  return (
    <View style={styles.container} accessibilityLabel="Resources screen" accessible>
      <Text ref={titleRef} nativeID="resources-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Resources
      </Text>
      <Text style={styles.subtitle}>Find helpful guides and materials. Browse by Canada or province.</Text>
      <View style={styles.filters} accessibilityLabel="Region filters" accessible>
        {(() => {
          const allProvCodes = Object.keys(PROVINCE_NAMES) as (keyof typeof PROVINCE_NAMES)[];
          const presentProvSet = new Set(
            items
              .filter((r) => r.scope === "province" && !!r.province)
              .map((r) => r.province as keyof typeof PROVINCE_NAMES)
          );
          const provinces = (showAllRegions ? allProvCodes : Array.from(presentProvSet)).sort((a, b) =>
            PROVINCE_NAMES[a].localeCompare(PROVINCE_NAMES[b])
          );
          const canadaPresent = items.some((r) => r.scope === "canada");
          const chips: RegionFilter[] = ["all"]; // Always include All
          if (canadaPresent) chips.push("canada");
          chips.push(...(provinces as RegionFilter[]));
          return chips.map((key) => (
            <Pressable
              key={key}
              onPress={() => setRegion(key as RegionFilter)}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${key === "canada" ? "Canada" : key === "all" ? "All" : PROVINCE_NAMES[key]}`}
              style={[styles.chip, region === key && styles.chipActive]}
            >
              <View style={styles.chipInner}>
                <MaterialCommunityIcons
                  name={key === "all" ? "view-list" : key === "canada" ? "flag-variant" : "map-marker-outline"}
                  size={14}
                  color={region === key ? styles.chipTextActive.color : styles.chipText.color}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.chipText, region === key && styles.chipTextActive]}>
                  {key === "all" ? "All" : key === "canada" ? "Canada" : PROVINCE_NAMES[key]}
                </Text>
              </View>
            </Pressable>
          ));
        })()}
      </View>
      <Pressable
        onPress={() => setShowAllRegions((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={showAllRegions ? "Show only regions with resources" : "Show all regions"}
        style={styles.toggleRow}
      >
        <Text style={styles.toggleText}>{showAllRegions ? "Show active regions only" : "Show all regions"}</Text>
      </Pressable>
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
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => {
          const isCanada = section.title === "Canada";
          return (
            <View style={styles.sectionHeaderRow} accessibilityLabel={`${section.title} section`} accessible>
              <MaterialCommunityIcons
                name={isCanada ? "flag-variant" : "map-marker-outline"}
                size={18}
                color={palette.text}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionHeader}>{section.title}</Text>
            </View>
          );
        }}
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
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text, fontFamily: "Poppins" },
    subtitle: { fontSize: 17, color: palette.text, opacity: 0.9, marginBottom: 8, fontFamily: "Roboto" },
    filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    chipInner: { flexDirection: "row", alignItems: "center" },
    chipActive: { backgroundColor: palette.primary },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary },
    sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 6 },
    sectionHeader: { fontWeight: "700", color: palette.text },
    toggleRow: { marginBottom: 8 },
    toggleText: { color: palette.primary },
  });
}
