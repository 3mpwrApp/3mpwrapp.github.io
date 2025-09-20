import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Link } from "expo-router";
import React from "react";
import {
    Linking,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import A11yPressable from "../../../components/A11yPressable";
import Card from "../../../components/Card";
import ContrastToggle from "../../../components/ContrastToggle";
import SearchBar from "../../../components/SearchBar";
import SettingsLink from "../../../components/SettingsLink";
import SkeletonRow from "../../../components/SkeletonRow";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import { resources as localResources } from "../../../data/resources";
import {
    MAX_FONT_SCALE,
    useAnnounceOnChange,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { fetchResources } from "../../../services/resources";
import { useCounts } from "../../../store/counts";
import { useNetwork } from "../../../store/network";
import { useRefresh } from "../../../store/refresh";
import { useSettings } from "../../../store/settings";
import { useAppPalette } from "../../../theme/usePalette";
import type { Resource, ResourceCategory } from "../../../types/models";
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
  QC: "Quebec",
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

      {/* 1. AI Tools */}
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { marginTop: 4 }]}
      >
        🤖 AI Tools
      </Text>
      <Link href={"/(tabs)/resources/ai-decision-simplifier" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          AI Decision Simplifier
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/appeal-coach" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Appeal Coach
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/body-mechanics-advisor" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Body Mechanics Advisor
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/justice-as-a-service" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Justice as a Service
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/rights-checker" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Rights Checker
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/rights-explainer" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Rights Explained
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/voice-notes" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Voice-to-Case Notes Tool
        </Text>
      </Link>

      {/* 2. Templates & Documents */}
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { marginTop: 20 }]}
      >
        📄 Templates & Documents
      </Text>
      <Link href={"/(tabs)/resources/accessibility-log" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Accessibility Log
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/templates-gallery" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Template Gallery
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/letter-accommodation" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Template Letter: Accommodation
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/accommodation-request" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Accommodation Request Builder
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/letter-appeal" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Template Letter: Appeal
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/letter-reconsideration" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Template Letter: Reconsideration
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/letter-rtw-plan" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Template Letter: RTW Plan
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/letter-union-request" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Template Letter: Union Request
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/case-timeline" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Case Timeline
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/claims-navigator" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Claims Navigator
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/evidence-checklist" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Evidence Checklist
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/evidence-locker" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Evidence Locker
        </Text>
      </Link>

      {/* 3. Trackers & Planners */}
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { marginTop: 20 }]}
      >
        📊 Trackers & Planners
      </Text>
      <Link href={"/(tabs)/resources/chronic-tracker" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Chronic Tracker
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/deadlines" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Deadline Calculator + Reminders
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/deadlines-list" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Deadlines List
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/denial-decoder" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Denial Decoder
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/doctor-visit-prep" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Doctor Visit Prep
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/financial-safety-net" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Financial Safety Net
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/impact-simulator" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Impact Simulator
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/meds-tracker" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Meds Tracker
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/rtw-planner" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Return-to-Work Planner
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/rehab-tracker" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Rehab Progress Tracker
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/policy-simulator" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Interactive Policy Simulator
        </Text>
      </Link>

      {/* 4. Support & Directories */}
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { marginTop: 20 }]}
      >
        🤝 Support & Directories
      </Text>
      <Link href={"/(tabs)/resources/adaptive-tech-library" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Adaptive Tech Library
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/allyship-playbook" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Allyship Playbook
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/solidarity-toolkit" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Solidarity Toolkit
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/support-directory" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Support Directory
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/myth-busting-hub" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Myth-Busting Knowledge Hub
        </Text>
      </Link>
      <Link href={"/(tabs)/resources/emergency-wallet-card" as Href} asChild>
        <Text style={[styles.toggleText, { marginBottom: 8 }]}>
          Emergency Info Wallet Card
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
          <A11yPressable
            hitSlop={HIT_SLOP_8}
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
          </A11yPressable>
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
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          style={[styles.chip, region === "all" && styles.chipActive]}
          onPress={() => setRegion("all")}
        >
          <Text
            style={[styles.chipText, region === "all" && styles.chipTextActive]}
          >
            {t("resources.filters.all", "All")}
          </Text>
        </A11yPressable>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
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
        </A11yPressable>
        {presentProvinceCodes(items).map((code) => (
          <A11yPressable
            hitSlop={HIT_SLOP_8}
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
          </A11yPressable>
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

      {/* Additional Resources from External Data */}
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { marginTop: 20 }]}
      >
        📚 External Resources
      </Text>
      <A11yPressable hitSlop={HIT_SLOP_8} accessibilityLabel="Download key resources for offline use" onPress={reload} style={{ alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6, marginBottom: 8 }}>
        <Text style={{ color: palette.text }}>Download key resources for offline use</Text>
      </A11yPressable>

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
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
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
    subtitle: { color: palette.text, opacity: 1, marginBottom: 12 },
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

