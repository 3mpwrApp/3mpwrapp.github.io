import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Linking, SectionList, StyleSheet, Text, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import Card from "../../../components/Card";
import ComplexityModeIndicator from "../../../components/ComplexityModeIndicator";
import ContrastToggle from "../../../components/ContrastToggle";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { GapView } from "../../../components/GapView";
import ResponsiveScreenWrapper from "../../../components/ResponsiveScreenWrapper";
import SearchBar from "../../../components/SearchBar";
import SettingsLink from "../../../components/SettingsLink";
import SimpleModeWelcome from "../../../components/SimpleModeWelcome";
import SkeletonRow from "../../../components/SkeletonRow";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import { resources as localResources } from "../../../data/resources";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { usePostLoadAnnounce } from "../../../hooks/usePostLoadAnnounce";
import { useTranslation } from "../../../i18n";
import { fetchResources } from "../../../services/resources";
import { useComplexityMode } from "../../../store/complexityMode";
import { useCounts } from "../../../store/counts";
import { useJurisdiction } from "../../../store/jurisdiction";
import { useNetwork } from "../../../store/network";
import { useRefresh } from "../../../store/refresh";
import { useSettings, type ResourceFormat } from "../../../store/settings";
import { createTextStyles } from "../../../theme/typography.enhanced";
import { useAppPalette } from "../../../theme/usePalette";
import type { Resource, ResourceCategory } from "../../../types/models";
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
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

type RegionFilter = "all" | "canada" | keyof typeof PROVINCE_NAMES;
type CategoryFilter = "all" | ResourceCategory;

// Memoized resource link component
const ResourceLink = React.memo<{ href: string; title: string; badge?: string }>(
  ({ href, title, badge }) => {
    const palette = useAppPalette();
    const router = useRouter();
    return (
      <A11yPressable hitSlop={HIT_SLOP_8} style={{ marginBottom: 8 }} onPress={() => router.push(href as any)}>
        <Text
          style={{ color: palette.primary, textDecorationLine: "underline", fontSize: 15, lineHeight: 22.5 }}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {title} {badge && <Text style={{ opacity: 0.8 }}>({badge})</Text>}
        </Text>
      </A11yPressable>
    );
  }
);
ResourceLink.displayName = 'ResourceLink';

export default function ResourcesScreen() {
  const palette = useAppPalette();
  const textStyles = React.useMemo(() => createTextStyles(palette), [palette]);
  const { t } = useTranslation();
  const { isFeatureVisible } = useComplexityMode();
  const router = useRouter();
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
  const { all: allJurisdictions } = useJurisdiction();
  const [jurisdictionFilter, setJurisdictionFilter] = React.useState<string>("all");

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

  // One-time polite announcement when items first finish loading
  usePostLoadAnnounce({ loading, count: items.length, ns: 'resources' });

  const filtered = React.useMemo(() => {
    let result = filterResources(items, { region, category, query });
    
    // Apply jurisdiction filter
    if (jurisdictionFilter !== "all") {
      result = result.filter((r) => {
        // Canada scope maps to FED jurisdiction
        if (r.scope === "canada") {
          return jurisdictionFilter === "FED";
        }
        // Province scope maps to province code as jurisdiction
        if (r.scope === "province" && r.province) {
          return jurisdictionFilter === r.province;
        }
        // Also check explicit jurisdictions field if present
        if (r.jurisdictions && r.jurisdictions.length > 0) {
          return r.jurisdictions.includes(jurisdictionFilter);
        }
        return false;
      });
    }
    
    return result;
  }, [items, region, category, query, jurisdictionFilter]);

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
  
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  
  return (
    <ResponsiveScreenWrapper>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
          accessibilityLabel="Resources screen"
          accessible={true}
        >
          <Text
            ref={titleRef}
            nativeID="resources-title"
            accessibilityRole="header"
            style={textStyles.h1}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            Resources
          </Text>
          <GapView gap={8} style={{ marginLeft: 'auto', flexDirection: 'row' }}>
            <ComplexityModeIndicator variant="minimal" />
            <ContrastToggle />
            <SettingsLink />
          </GapView>
        </View>

        <Text style={textStyles.body} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t("resources.intro", "Find helpful guides and materials.")}
        </Text>
        
        <DisclaimerBanner type="legal" compact={true} />
        
        {/* Simple Mode Welcome */}
        <SimpleModeWelcome 
          tabName="Resources"
          availableFeatures={['Master Tracker Hub', 'Document Factory', 'Appeal Command Center', 'Evidence Manager']}
          hiddenCount={35}
        />
        
        {/* Power Tools Section */}
        <Text accessibilityRole="header" style={[textStyles.h2, { marginTop: 16 }]}>
          🔧 Power Tools
        </Text>
        
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          style={{ 
            borderWidth: 2, 
            borderColor: palette.primary, 
            borderRadius: 12, 
            padding: 12, 
            marginBottom: 12,
            backgroundColor: palette.primary + '10'
          }}
          onPress={() => router.push('/(tabs)/resources/document-factory' as any)}
        >
          <Text style={{ color: palette.primary, fontWeight: '700', fontSize: 16 }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            📄 Document Factory
          </Text>
          <Text style={{ color: palette.text, fontSize: 14, marginTop: 4 }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            5 tabs: Letters, Forms, Records, Vault, Export. Complete document management.
          </Text>
          <Text style={{ color: palette.primary, fontSize: 12, fontWeight: '600', marginTop: 4 }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            POWER TOOL • Consolidates 15+ document features
          </Text>
        </A11yPressable>
        
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          style={{ 
            borderWidth: StyleSheet.hairlineWidth, 
            borderColor: palette.muted, 
            borderRadius: 12, 
            padding: 12, 
            marginBottom: 12,
            backgroundColor: palette.card
          }}
          onPress={() => router.push('/(tabs)/resources/case-tracker-pro' as any)}
        >
          <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            📊 Case Tracker Pro
          </Text>
          <Text style={{ color: palette.text, fontSize: 14, marginTop: 4 }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            5 tabs: Deadlines, Master Hub, Denial, Claims, RTW
          </Text>
          <Text style={{ color: palette.primary, fontSize: 12, fontWeight: '600', marginTop: 4 }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            POWER TOOL
          </Text>
        </A11yPressable>
        
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          style={{ 
            borderWidth: StyleSheet.hairlineWidth, 
            borderColor: palette.muted, 
            borderRadius: 12, 
            padding: 12, 
            marginBottom: 12,
            backgroundColor: palette.card
          }}
          onPress={() => router.push('/(tabs)/resources/knowledge-base' as any)}
        >
          <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            📚 Knowledge Base
          </Text>
          <Text style={{ color: palette.text, fontSize: 14, marginTop: 4 }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            5 tabs: Rights, Tech, Myths, Tools, Emergency
          </Text>
          <Text style={{ color: palette.primary, fontSize: 12, fontWeight: '600', marginTop: 4 }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            POWER TOOL
          </Text>
        </A11yPressable>
        
        {/* Featured Tools - Working & Ready */}
        <Text accessibilityRole="header" style={[textStyles.h2, { marginTop: 16 }]}>
          ⭐ Featured Tools
        </Text>
        
        <ResourceLink href="/(tabs)/resources/master-tracker-hub" title="📊 Master Tracker Hub" badge="Beta" />
        <Text style={[textStyles.bodySmall, { opacity: 0.85, marginBottom: 12, marginTop: -4 }]}>
          All-in-one health tracking: symptoms, meds, rehab, appointments - with AI insights & pattern detection
        </Text>
        
        <ResourceLink href="/(tabs)/resources/appeal-command-center" title="⚖️ Appeal Command Center" badge="Beta" />
        <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginBottom: 12, marginTop: -4 }]}>
          Deadline tracking, denial decoder, evidence strength meter, precedent finder
        </Text>
        
        <ResourceLink href="/(tabs)/advocacy/evidence-manager" title="📁 Evidence Manager" badge="Beta" />
        <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginBottom: 12, marginTop: -4 }]}>
          Secure locker, upload queue, checklist - all your evidence tools in one place
        </Text>
        
        {region === "all" && !province && (
          <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginBottom: 8, marginTop: 8 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            💡 Tip: Set your province in Settings to filter resources.
          </Text>
        )}

        {/* Appeals & Advocacy Tools */}
        {isFeatureVisible('standard') && (
          <>
            <Text accessibilityRole="header" style={[textStyles.h3, { marginTop: 20 }]}>
              ⚖️ Appeals & Advocacy
            </Text>
            <ResourceLink href="/(tabs)/resources/case-timeline" title="Case Timeline Builder" />
            <ResourceLink href="/(tabs)/resources/claims-navigator" title="Claims Navigator" badge="Beta" />
            <ResourceLink href="/(tabs)/resources/denial-decoder" title="Denial Decoder" badge="Beta" />
            <ResourceLink href="/(tabs)/resources/prepare-appeal" title="Prepare to Appeal Guide" badge="Beta" />
            <ResourceLink href="/(tabs)/resources/rights-checker" title="Rights Checker" />
            <ResourceLink href="/(tabs)/resources/rights-explainer" title="Rights Explained (Plain Language)" />
            <ResourceLink href="/(tabs)/resources/policy-simulator" title="Interactive Policy Simulator" />
          </>
        )}

        {/* Documents & Templates */}
        <Text accessibilityRole="header" style={[textStyles.h3, { marginTop: 20 }]}>
          📄 Documents & Forms
        </Text>
        <ResourceLink href="/(tabs)/resources/accommodation-request" title="Accommodation Request Builder" />
        <ResourceLink href="/(tabs)/resources/accessibility-log" title="Accessibility Log Template" />
        <ResourceLink href="/(tabs)/resources/emergency-wallet-card" title="Emergency Wallet Card" />

        {/* Health & Work Planning */}
        <Text accessibilityRole="header" style={[textStyles.h3, { marginTop: 20 }]}>
          🏥 Health & Work Planning
        </Text>
        <ResourceLink href="/(tabs)/resources/doctor-visit-prep" title="Doctor Visit Prep Checklist" badge="Beta" />
        <ResourceLink href="/(tabs)/resources/rtw-planner" title="Return-to-Work Planner" badge="Beta" />
        <ResourceLink href="/(tabs)/resources/financial-safety-net" title="Financial Safety Net Planner" />
        <ResourceLink href="/(tabs)/resources/impact-simulator" title="Disability Impact Simulator" />

        {/* Support & Community Resources */}
        <Text accessibilityRole="header" style={[textStyles.h3, { marginTop: 20 }]}>
          🤝 Support & Learning
        </Text>
        <ResourceLink href="/(tabs)/resources/support-directory" title="Support Directory" />
        <ResourceLink href="/(tabs)/resources/adaptive-tech-library" title="Adaptive Tech Library" />
        <ResourceLink href="/(tabs)/resources/allyship-playbook" title="Allyship Playbook for Allies" />
        <ResourceLink href="/(tabs)/resources/solidarity-toolkit" title="Solidarity Toolkit" />
        <ResourceLink href="/(tabs)/resources/myth-busting-hub" title="Myth-Busting Knowledge Hub" />

        {/* AI-Powered Tools (Beta) */}
        {isFeatureVisible('standard') && (
          <>
            <Text accessibilityRole="header" style={[textStyles.h3, { marginTop: 20 }]}>
              🤖 AI-Powered Tools (Beta)
            </Text>
            <DisclaimerBanner type="ai" compact={true} />
            <ResourceLink href="/(tabs)/resources/appeal-coach" title="AI Appeal Coach" badge="Beta" />
            <ResourceLink href="/(tabs)/resources/body-mechanics-advisor" title="Body Mechanics Advisor" badge="Beta" />
            <ResourceLink href="/(tabs)/resources/justice-as-a-service" title="Justice-as-a-Service" badge="Beta" />
            <ResourceLink href="/(tabs)/resources/voice-notes" title="Voice-to-Case Notes" badge="Beta" />
            <ResourceLink href="/(tabs)/resources/medical-gaslighting-detector" title="Medical Gaslighting Detector" badge="Beta" />
          </>
        )}

        <View
          style={styles.filters}
          accessibilityLabel="Category filters"
          accessible={true}
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
              accessibilityLabel={
                key === "all"
                  ? t("resources.filters.all", "All")
                  : key === "work_financial"
                    ? t("resources.filters.work_financial", "Work & Financial")
                    : key === "tools_downloads"
                      ? t("resources.filters.tools_downloads", "Tools & Downloads")
                      : t("resources.filters.emergency_crisis", "Emergency & Crisis")
              }
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

        {/* Jurisdiction Filter */}
        <Text style={styles.subtitle}>
          {t("jurisdiction.filter.label", "Filter by jurisdiction")}
        </Text>
        <GapView
          gap={8}
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <A11yPressable
            hitSlop={HIT_SLOP_8}
            style={[styles.chip, jurisdictionFilter === "all" && styles.chipActive]}
            onPress={() => setJurisdictionFilter("all")}
          >
            <Text
              style={[
                styles.chipText,
                jurisdictionFilter === "all" && styles.chipTextActive,
              ]}
            >
              {t("jurisdiction.filter.all", "All jurisdictions")}
            </Text>
          </A11yPressable>
          <A11yPressable
            hitSlop={HIT_SLOP_8}
            style={[styles.chip, jurisdictionFilter === "FED" && styles.chipActive]}
            onPress={() => setJurisdictionFilter("FED")}
          >
            <Text
              style={[
                styles.chipText,
                jurisdictionFilter === "FED" && styles.chipTextActive,
              ]}
            >
              {t("jurisdiction.filter.canada", "National (Canada)")}
            </Text>
          </A11yPressable>
          {allJurisdictions
            .filter((j) => j.code !== "FED")
            .map((j) => (
              <A11yPressable
                hitSlop={HIT_SLOP_8}
                key={j.code}
                style={[
                  styles.chip,
                  jurisdictionFilter === j.code && styles.chipActive,
                ]}
                onPress={() => setJurisdictionFilter(j.code)}
              >
                <Text
                  style={[
                    styles.chipText,
                    jurisdictionFilter === j.code && styles.chipTextActive,
                  ]}
                >
                  {j.code}
                </Text>
              </A11yPressable>
            ))}
        </GapView>

        <Text style={styles.subtitle}>
          {t("resources.filters.canada", "Canada")} / provinces
        </Text>
        <GapView
          gap={8}
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
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
        </GapView>

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
      </View>

      <SectionList<Resource>
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text accessibilityRole="header" style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          const subtitle = plainLanguage
            ? simplify(item.description)
            : item.description;
          const onOpen = () => openResource(item, resourcePreferredFormat);
          return (
            <View style={{ paddingHorizontal: 16 }}>
              <Card title={item.title} subtitle={subtitle} onPress={onOpen} />
            </View>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingHorizontal: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </View>
          ) : error ? (
            <Text accessibilityRole="alert" style={[styles.error, { paddingHorizontal: 16 }]}>
              {error}
            </Text>
          ) : (
            <Text style={[styles.empty, { paddingHorizontal: 16 }]}>No resources found</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </ResponsiveScreenWrapper>
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
    empty: { color: palette.textSecondary, marginTop: 12 },
  });
}

function simplify(text: string) {
  if (!text) return text;
  const end = text.indexOf(".");
  const firstSentence = end > 0 ? text.slice(0, end + 1) : text;
  return firstSentence.length > 120 ? firstSentence.slice(0, 117) + "..." : firstSentence;
}

function openResource(item: Resource, pref: ResourceFormat) {
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

