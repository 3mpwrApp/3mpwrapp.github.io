import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { researchItems } from "../../../data/research";
import SearchBar from "../../../components/SearchBar";
import Card from "../../../components/Card";
import { Link } from "expo-router";
import SettingsLink from "../../../components/SettingsLink";
import ContrastToggle from "../../../components/ContrastToggle";
import { Ionicons } from "@expo/vector-icons";

export const options = { href: null };

export default function ResearchScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Research");
  useFocusOnRefOnMount(titleRef);

  const [selectedView, setSelectedView] = React.useState<'overview' | 'studies' | 'reports' | 'articles'>('overview');
  const [query, setQuery] = React.useState("");
  const [topic, setTopic] = React.useState<string | "all">("all");
  const [year, setYear] = React.useState<number | "all">("all");

  const topics = React.useMemo(() => {
    const t = new Set<string>();
    researchItems.forEach((r) => r.topics.forEach((x) => t.add(x)));
    return Array.from(t).sort();
  }, []);
  const years = React.useMemo(() => {
    const y = Array.from(new Set(researchItems.map((r) => r.year))).sort(
      (a, b) => b - a,
    );
    return y;
  }, []);

  // Categorize research items
  const studies = React.useMemo(() => {
    return researchItems.filter(item => 
      item.source.toLowerCase().includes('university') || 
      item.source.toLowerCase().includes('research') ||
      item.topics.includes('policy')
    );
  }, []);

  const reports = React.useMemo(() => {
    return researchItems.filter(item => 
      item.source.toLowerCase().includes('government') || 
      item.source.toLowerCase().includes('policy') ||
      item.source.toLowerCase().includes('working paper')
    );
  }, []);

  const articles = React.useMemo(() => {
    return researchItems.filter(item => 
      item.source.toLowerCase().includes('review') ||
      item.topics.includes('disability') ||
      item.topics.includes('accommodations') ||
      item.topics.includes('advocacy')
    );
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let dataToFilter = researchItems;
    
    if (selectedView === 'studies') dataToFilter = studies;
    else if (selectedView === 'reports') dataToFilter = reports;
    else if (selectedView === 'articles') dataToFilter = articles;
    
    return dataToFilter.filter((r) => {
      if (topic !== "all" && !r.topics.includes(topic)) return false;
      if (year !== "all" && r.year !== year) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q)
      );
    });
  }, [query, topic, year, selectedView, studies, reports, articles]);

  if (selectedView === 'overview') {
    return (
      <ScrollView style={styles.container}>
        <Text
          ref={titleRef}
          style={styles.title}
          accessibilityRole="header"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          Research
        </Text>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
        <Text style={styles.subtitle}>
          Access studies, reports, articles, history timeline, and case wait-times.
        </Text>

        {/* Main Research Categories */}
        <View style={styles.sectionGrid}>
          <Pressable 
            style={styles.sectionCard}
            onPress={() => setSelectedView('studies')}
            accessibilityRole="button"
            accessibilityLabel="Studies - Access clinical and workplace studies"
          >
            <Ionicons name="library-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>Studies</Text>
            <Text style={styles.sectionDescription}>
              Access clinical and workplace studies
            </Text>
            <Text style={styles.sectionCount}>{studies.length} studies</Text>
          </Pressable>

          <Pressable 
            style={styles.sectionCard}
            onPress={() => setSelectedView('reports')}
            accessibilityRole="button"
            accessibilityLabel="Reports - Community and government reports made easy"
          >
            <Ionicons name="document-text-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>Reports</Text>
            <Text style={styles.sectionDescription}>
              Community and government reports made easy
            </Text>
            <Text style={styles.sectionCount}>{reports.length} reports</Text>
          </Pressable>

          <Pressable 
            style={styles.sectionCard}
            onPress={() => setSelectedView('articles')}
            accessibilityRole="button"
            accessibilityLabel="Articles - Insights on disability, workplace rights, and advocacy"
          >
            <Ionicons name="newspaper-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>Articles</Text>
            <Text style={styles.sectionDescription}>
              Insights on disability, workplace rights, advocacy
            </Text>
            <Text style={styles.sectionCount}>{articles.length} articles</Text>
          </Pressable>

          <Link href="/(tabs)/research/history-timeline" asChild>
            <Pressable 
              style={styles.sectionCard}
              accessibilityRole="button"
              accessibilityLabel="History Timeline - Track milestones in disability and worker rights"
            >
              <Ionicons name="time-outline" size={32} color={palette.primary} />
              <Text style={styles.sectionTitle}>History Timeline</Text>
              <Text style={styles.sectionDescription}>
                Track milestones in disability, worker, and injured worker rights
              </Text>
            </Pressable>
          </Link>

          <Link href="/(tabs)/research/wait-times" asChild>
            <Pressable 
              style={styles.sectionCard}
              accessibilityRole="button"
              accessibilityLabel="Case Wait-Times - Estimate how long processes may take"
            >
              <Ionicons name="time-outline" size={32} color={palette.primary} />
              <Text style={styles.sectionTitle}>Case/File Wait-Times</Text>
              <Text style={styles.sectionDescription}>
                Estimate how long processes may take
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setSelectedView('overview')}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to research overview"
        >
          <Ionicons name="arrow-back" size={24} color={palette.text} />
        </Pressable>
        <Text
          style={styles.title}
          accessibilityRole="header"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {selectedView === 'studies' ? 'Studies' : 
           selectedView === 'reports' ? 'Reports' : 'Articles'}
        </Text>
        <SettingsLink style={{ position: "absolute", right: 20, top: 0 }} />
      </View>
      
      <Text style={styles.subtitle}>
        {selectedView === 'studies' ? 'Clinical and workplace research studies' :
         selectedView === 'reports' ? 'Community and government reports' :
         'Insights on disability, workplace rights, and advocacy'}
      </Text>
      
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={`Search ${selectedView}`}
        accessibilityLabel={`Search ${selectedView}`}
      />
      
      <View style={styles.filters} accessibilityLabel="Filters" accessible>
        <Pressable
          onPress={() => setTopic("all")}
          style={[styles.chip, topic === "all" && styles.chipActive]}
          accessibilityRole="button"
          accessibilityLabel="All topics"
        >
          <Text
            style={[styles.chipText, topic === "all" && styles.chipTextActive]}
          >
            All topics
          </Text>
        </Pressable>
        {topics.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTopic(t)}
            style={[styles.chip, topic === t && styles.chipActive]}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${t}`}
          >
            <Text
              style={[styles.chipText, topic === t && styles.chipTextActive]}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>
      
      <View style={styles.filters}>
        <Pressable
          onPress={() => setYear("all")}
          style={[styles.chip, year === "all" && styles.chipActive]}
          accessibilityRole="button"
          accessibilityLabel="All years"
        >
          <Text
            style={[styles.chipText, year === "all" && styles.chipTextActive]}
          >
            All years
          </Text>
        </Pressable>
        {years.map((y) => (
          <Pressable
            key={y}
            onPress={() => setYear(y)}
            style={[styles.chip, year === y && styles.chipActive]}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${y}`}
          >
            <Text
              style={[styles.chipText, year === y && styles.chipTextActive]}
            >
              {y}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={
              {
                pathname: "/(tabs)/research/[id]",
                params: { id: item.id },
              } as any
            }
            asChild
          >
            <Card
              title={item.title}
              subtitle={`${item.source} - ${item.year}`}
              left={
                <View
                  style={{
                    backgroundColor: palette.primary,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: palette.onPrimary, fontSize: 12 }}>
                    {item.topics[0]}
                  </Text>
                </View>
              }
            />
          </Link>
        )}
        ListEmptyComponent={<Text style={[styles.subtitle, { opacity: 0.7 }]}>No {selectedView} found</Text>}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
    </View>
  );
}

function createStyles(
  palette: ReturnType<typeof useAppPalette>,
  factor: number,
) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.9,
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      position: 'relative',
    },
    backButton: {
      padding: 8,
      marginRight: 8,
      marginLeft: -8,
    },
    sectionGrid: {
      gap: 16,
      paddingBottom: 20,
    },
    sectionCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      alignItems: 'center',
      minHeight: 140,
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: Math.round(18 * factor),
      fontWeight: '700',
      color: palette.text,
      marginTop: 12,
      marginBottom: 8,
      textAlign: 'center',
    },
    sectionDescription: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.8,
      textAlign: 'center',
      marginBottom: 8,
    },
    sectionCount: {
      fontSize: Math.round(12 * factor),
      color: palette.primary,
      fontWeight: '600',
    },
    filters: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    chipActive: { backgroundColor: palette.primary },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary },
  });
}


