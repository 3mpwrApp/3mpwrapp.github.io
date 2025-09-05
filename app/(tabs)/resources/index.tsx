import React from "react";
import { View, Text, StyleSheet, SectionList, RefreshControl, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppPalette } from "../../../theme/usePalette";
import { useTranslation } from "../../../i18n";
import { useTextScale } from "../../../theme/typography";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import Card from "../../../components/Card";
import SettingsLink from "../../../components/SettingsLink";
import ContrastToggle from "../../../components/ContrastToggle";
import { resources as localResources } from "../../../data/resources";
import { fetchResources } from "../../../services/resources";
import { Link } from "expo-router";
import SearchBar from "../../../components/SearchBar";
import { useCounts } from "../../../store/counts";
import { useAnnounceOnChange } from "../../../hooks/useA11y";
import SkeletonRow from "../../../components/SkeletonRow";
import { useRefresh } from "../../../store/refresh";
import { useNetwork } from "../../../store/network";

import type { Resource, ResourceCategory } from "../../../types/models";
import { useSettings } from "../../../store/settings";
import { filterResources, groupByRegion, presentProvinceCodes } from "../../../utils/resources";

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
type CategoryFilter = "all" | ResourceCategory;

export default function ResourcesScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Resources");
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState(localResources);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [region, setRegion] = React.useState<RegionFilter>("all");
  const { province } = useSettings();
  const [showAllRegions, setShowAllRegions] = React.useState(false);
  const [category, setCategory] = React.useState<CategoryFilter>("all");

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

  React.useEffect(() => {
    if (province && region === "all") setRegion(province as any);
  }, [province]);

  useAnnounceOnChange(items.length, (n) => `${n} resources loaded`);
  const filtered = React.useMemo(() => filterResources(items, { region, category, query }), [items, region, category, query]);

  const sections = React.useMemo(() => {
    if (region !== "all") {
      return [
        {
          title: region === "canada" ? "Canada" : `${region} - ${PROVINCE_NAMES[region]}`,
          data: filtered,
        },
      ];
    }
    const { canada, byProv } = groupByRegion(filtered);
    const provSections = Array.from(byProv.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([code, list]) => ({ title: `${code} - ${PROVINCE_NAMES[code]}`, data: list }));
    const result = [] as { title: string; data: Resource[] }[];
    if (canada.length) result.push({ title: "Canada", data: canada });
    return result.concat(provSections);
  }, [filtered, region]);

  return (
    <View style={styles.container} accessibilityLabel="Resources screen" accessible>
      <Text ref={titleRef} nativeID="resources-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Resources
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.subtitle}>{t("resources.intro", "Find helpful guides and materials.")}</Text>
      {region === "all" && !province && (
        <Text style={[styles.subtitle, { opacity: 0.75 }]}>Tip: Set your province in Settings to filter resources.</Text>
      )}
      <Link href="/(tabs)/resources/letter-accommodation" asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>Create Accommodation Letter</Text>
      </Link>
      <Link href="/(tabs)/resources/letter-appeal" asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>Create Appeal Letter</Text>
      </Link>
      <Link href="/(tabs)/resources/letter-reconsideration" asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>Create Reconsideration Letter</Text>
      </Link>
      <Link href="/(tabs)/resources/letter-rtw-plan" asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>Create Return-to-Work Plan</Text>
      </Link>
      <Link href="/(tabs)/resources/claims-navigator" asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>Guided Claims Navigator</Text>
      </Link>
      <Link href="/(tabs)/resources/evidence-locker" asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>Evidence Locker</Text>
      </Link>
      <Link href="/(tabs)/resources/support-directory" asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>Support Directory</Text>
      </Link>
      <View style={styles.filters} accessibilityLabel="Category filters" accessible>
        {(["all", "work_financial", "tools_downloads", "emergency_crisis"] as CategoryFilter[]).map((key) => (
          <Pressable
            key={key}
            onPress={() => setCategory(key)}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${key}`}
            style={[styles.chip, category === key && styles.chipActive]}
          >
            <View style={styles.chipInner}>
              <MaterialCommunityIcons
                name={key === "work_financial" ? "briefcase-outline" : key === "tools_downloads" ? "download" : key === "emergency_crisis" ? "lifebuoy" : "filter-variant"}
                size={14}
                color={category === key ? styles.chipTextActive.color : styles.chipText.color}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.chipText, category === key && styles.chipTextActive]}>{
                key === "all"
                  ? t("resources.filters.all", "All")
                  : key === "work_financial"
                  ? t("resources.filters.work_financial", "Work & Financial")
                  : key === "tools_downloads"
                  ? t("resources.filters.tools_downloads", "Tools & Downloads")
                  : t("resources.filters.emergency_crisis", "Emergency & Crisis")
              }</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <Text style={styles.subtitle}>{t("resources.filters.canada", "Canada")} / provinces</Text>
      <View style={styles.filters} accessibilityLabel="Region filters" accessible>
        {(() => {
          const allProvCodes = Object.keys(PROVINCE_NAMES) as (keyof typeof PROVINCE_NAMES)[];
          const presentProvSet = new Set(presentProvinceCodes(items) as (keyof typeof PROVINCE_NAMES)[]);
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
            <Card
              title={item.title}
              subtitle={item.description}
              testID={`resource-${item.id}`}
              left={
                <View style={{ backgroundColor: palette.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: palette.onPrimary, fontSize: 12 }}>
                    {item.scope === "canada" ? "CA" : item.province}
                  </Text>
                </View>
              }
            />
          </Link>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
      />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text, fontFamily: "Poppins" },
    subtitle: { fontSize: Math.round(17 * factor), color: palette.text, opacity: 0.9, marginBottom: 8, fontFamily: "Roboto" },
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






