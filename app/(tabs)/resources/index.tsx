import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  Pressable,
  Linking,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppPalette } from "../../../theme/usePalette";
import { useTranslation } from "../../../i18n";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
  useAnnounceOnChange,
} from "../../../hooks/useA11y";
import Card from "../../../components/Card";
import SettingsLink from "../../../components/SettingsLink";
import ContrastToggle from "../../../components/ContrastToggle";
import { resources as localResources } from "../../../data/resources";
import { fetchResources } from "../../../services/resources";
import { Link } from "expo-router";
import type { Href } from "expo-router";
import SearchBar from "../../../components/SearchBar";
import { useCounts } from "../../../store/counts";
import SkeletonRow from "../../../components/SkeletonRow";
import { useRefresh } from "../../../store/refresh";
import { useNetwork } from "../../../store/network";
import type { Resource, ResourceCategory } from "../../../types/models";
import { useSettings } from "../../../store/settings";
import {
  filterResources,
  groupByRegion,
  presentProvinceCodes,
} from "../../../utils/resources";

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
  const styles = createStyles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Resources");
  useFocusOnRefOnMount(titleRef);

  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<Resource[]>(localResources);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [region, setRegion] = React.useState<RegionFilter>("all");
  const { province, plainLanguage, resourcePreferredFormat } = useSettings();
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
    } catch {
      setError("Failed to load resources");
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
    setCount("resources", items.length);
  }, [items, setCount]);

  React.useEffect(() => {
    if (province && region === "all") setRegion(province as any);
  }, [province, region]);

  useAnnounceOnChange(items.length, (n) => `${n} resources loaded`);

  const filtered = React.useMemo(
    () => filterResources(items, { region, category, query }),
    [items, region, category, query],
  );

  const sections = React.useMemo(() => {
    if (region !== "all") {
      return [
        {
          title:
            region === "canada"
              ? "Canada"
              : `${region} - ${PROVINCE_NAMES[region]}`,
          data: filtered,
        },
      ];
    }
    const { canada, byProv } = groupByRegion(filtered);
    const provSections = Array.from(byProv.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([code, list]) => ({
        title: `${code} - ${PROVINCE_NAMES[code]}`,
        data: list,
      }));
    const result: { title: string; data: Resource[] }[] = [];
    if (canada.length) result.push({ title: "Canada", data: canada });
    return result.concat(provSections);
  }, [filtered, region]);

  return (
    <View
      style={styles.container}
      accessibilityLabel="Resources screen"
      accessible
    >
      <Text
        ref={titleRef}
        nativeID="resources-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Resources
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />

      <Text style={styles.subtitle}>
        {t("resources.intro", "Find helpful guides and materials.")}
      </Text>
      {region === "all" && !province && (
        <Text style={[styles.subtitle, { opacity: 0.75 }]}>
          Tip: Set your province in Settings to filter resources.
        </Text>
      )}

      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { marginTop: 4 }]}
      >
        AI Tools
      </Text>
      <Link href={"/(tabs)/resources/rights-checker" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Automated Rights Checker
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/appeal-coach" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          AI “Appeal Coach”
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/deadlines" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          {t("resources.tools.deadlines", "Deadline Calculator + Reminders")}
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/evidence-checklist" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          {t("resources.tools.evidence", "Evidence Checklist Generator")}
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/voice-notes" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          {t("resources.tools.voice_notes", "Voice‑to‑Case Notes Tool")}
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/templates-gallery" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          {t("resources.tools.templates", "Template Gallery")}
        </Text>
      </Link>
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { marginTop: 10 }]}
      >
        AI-Generated Letter Templates
      </Text>
      <Link href={"/(tabs)/resources/letter-accommodation" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Create Accommodation Letter
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/letter-appeal" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Create Appeal Letter
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/letter-union-request" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Create Union Representation/Request Letter
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/letter-reconsideration" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Create Reconsideration Letter
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/letter-rtw-plan" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Create Return-to-Work Plan
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/claims-navigator" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Guided Claims Navigator
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/evidence-locker" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Evidence Locker
        </Text>
      </Link>

      <View
        style={styles.filters}
        accessibilityLabel="Category filters"
        accessible
      >
        {(
          [
            "all",
            "work_financial",
            "tools_downloads",
            "emergency_crisis",
          ] as CategoryFilter[]
        ).map((key) => (
          <Pressable
            key={key}
            onPress={() => setCategory(key)}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${key}`}
            style={[styles.chip, category === key && styles.chipActive]}
          >
            <View style={styles.chipInner}>
              <MaterialCommunityIcons
                name={
                  key === "work_financial"
                    ? "briefcase-outline"
                    : key === "tools_downloads"
                      ? "download"
                      : key === "emergency_crisis"
                        ? "lifebuoy"
                        : "filter-variant"
                }
                size={14}
                color={
                  category === key
                    ? styles.chipTextActive.color
                    : styles.chipText.color
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.chipText,
                  category === key && styles.chipTextActive,
                ]}
              >
                {key === "all"
                  ? t("resources.filters.all", "All")
                  : key === "work_financial"
                    ? t("resources.filters.work_financial", "Work & Financial")
                    : key === "tools_downloads"
                      ? t(
                          "resources.filters.tools_downloads",
                          "Tools & Downloads",
                        )
                      : t(
                          "resources.filters.emergency_crisis",
                          "Emergency & Crisis",
                        )}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={styles.subtitle}>
        {t("resources.filters.canada", "Canada")} / provinces
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <Pressable
          style={[styles.chip, region === "all" && styles.chipActive]}
          onPress={() => setRegion("all")}
        >
          <Text
            style={[styles.chipText, region === "all" && styles.chipTextActive]}
          >
            {t("resources.filters.all", "All")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, region === "canada" && styles.chipActive]}
          onPress={() => setRegion("canada")}
        >
          <Text
            style={[
              styles.chipText,
              region === "canada" && styles.chipTextActive,
            ]}
          >
            Canada
          </Text>
        </Pressable>
        {presentProvinceCodes(items).map((code) => (
          <Pressable
            key={code}
            style={[styles.chip, region === code && styles.chipActive]}
            onPress={() => setRegion(code as any)}
          >
            <Text
              style={[
                styles.chipText,
                region === code && styles.chipTextActive,
              ]}
            >
              {code}
            </Text>
          </Pressable>
        ))}
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t("resources.search", "Search resources...")}
      />

      <Text style={{ color: palette.text, opacity: 0.8, marginVertical: 8 }}>
        Tip: Use the Accessibility button in the header to choose plain language and your preferred format (Text, Audio, ASL, Easy-Read).
      </Text>

      {/* Tools & Simulators */}
      <View accessibilityLabel="Tools and simulators" accessible>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Tools & Simulators
        </Text>
        <Link href={("/(tabs)/resources/financial-safety-net" as any)} asChild>
          <Card
            title="Financial Safety Net Navigator"
            subtitle="Step-by-step guide to combining CPP-D, EI, ODSP, Workers’ Comp without overlap"
          />
        </Link>
        <Link href={("/(tabs)/resources/justice-as-a-service" as any)} asChild>
          <Card
            title="Justice-as-a-Service"
            subtitle="Generate anonymized struggle reports for advocacy, unions, or media"
          />
        </Link>
        <Link href={("/(tabs)/resources/impact-simulator" as any)} asChild>
          <Card
            title="Impact Simulator"
            subtitle="Model how policy or workplace changes affect disabled/injured people"
          />
        </Link>
        <Link href={("/(tabs)/resources/adaptive-tech-library" as any)} asChild>
          <Card
            title="Adaptive Tech Library"
            subtitle="Tutorials and reviews: screen readers, speech-to-text, mobility aids, apps"
          />
        </Link>
        <Link href={("/(tabs)/resources/myth-busting-hub" as any)} asChild>
          <Card
            title="Myth-Busting Knowledge Hub"
            subtitle="Plain-language explainers for CPP-D, EI Sickness, Workers' Comp, and more"
          />
        </Link>
        <Link href={("/(tabs)/resources/case-timeline" as any)} asChild>
          <Card
            title="Case Timeline Tracker"
            subtitle="Organize documents, deadlines, hearings, and reminders"
          />
        </Link>
        <Link href={("/(tabs)/resources/ai-decision-simplifier" as any)} asChild>
          <Card
            title="AI Decision Simplifier"
            subtitle="Upload a decision letter and get a plain-language summary and next steps"
          />
        </Link>
      </View>

      <SectionList<Resource>
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          const subtitle = plainLanguage
            ? simplify(item.description)
            : item.description;
          const onOpen = () => openResource(item, resourcePreferredFormat);
          return <Card title={item.title} subtitle={subtitle} onPress={onOpen} />;
        }}
        ListEmptyComponent={
          loading ? (
            <View>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </View>
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <Text style={styles.empty}>No resources found</Text>
          )
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    sectionTitle: {
      marginTop: 16,
      marginBottom: 8,
      color: palette.text,
      fontWeight: "700",
    },
    toggleText: { color: palette.primary, textDecorationLine: "underline" },
    filters: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
      marginBottom: 8,
    },
    chip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    chipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    chipInner: { flexDirection: "row", alignItems: "center" },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary },
    error: { color: "red", marginTop: 12 },
    empty: { color: palette.text, opacity: 0.7, marginTop: 12 },
  });
}

function simplify(text: string) {
  if (!text) return text;
  const end = text.indexOf(".");
  const firstSentence = end > 0 ? text.slice(0, end + 1) : text;
  return firstSentence.length > 120 ? firstSentence.slice(0, 117) + "..." : firstSentence;
}

function openResource(item: Resource, pref: import("../../../store/settings").ResourceFormat) {
  // Prefer specific format URLs when present; fall back to default url
  const url =
    (pref === "audio" && (item as any).audioUrl) ||
    (pref === "asl" && (item as any).aslUrl) ||
    (pref === "easy" && (item as any).easyReadUrl) ||
    item.url;
  if (url) {
    try {
      Linking.openURL(url);
    } catch {}
  }
}
