import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { researchItems } from "../../../data/research";
import SearchBar from "../../../components/SearchBar";
import Card from "../../../components/Card";
import { Link } from "expo-router";
import SettingsLink from "../../../components/SettingsLink";
import ContrastToggle from "../../../components/ContrastToggle";


export const options = { href: null };

export default function ResearchScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Research");
  useFocusOnRefOnMount(titleRef);

  const [query, setQuery] = React.useState("");
  const [topic, setTopic] = React.useState<string | "all">("all");
  const [year, setYear] = React.useState<number | "all">("all");

  const topics = React.useMemo(() => {
    const t = new Set<string>();
    researchItems.forEach((r) => r.topics.forEach((x) => t.add(x)));
    return Array.from(t).sort();
  }, []);
  const years = React.useMemo(() => {
    const y = Array.from(new Set(researchItems.map((r) => r.year))).sort((a, b) => b - a);
    return y;
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return researchItems.filter((r) => {
      if (topic !== "all" && !r.topics.includes(topic)) return false;
      if (year !== "all" && r.year !== year) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q)
      );
    });
  }, [query, topic, year]);

  return (
    <View style={styles.container}>
      <Text ref={titleRef} style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Research</Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.subtitle}>Curated research on injured workers and the disability community.</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search research" accessibilityLabel="Search research" />
      <View style={styles.filters} accessibilityLabel="Filters" accessible>
        <Pressable onPress={() => setTopic("all")} style={[styles.chip, topic === "all" && styles.chipActive]} accessibilityRole="button" accessibilityLabel="All topics"><Text style={[styles.chipText, topic === "all" && styles.chipTextActive]}>All topics</Text></Pressable>
        {topics.map((t) => (
          <Pressable key={t} onPress={() => setTopic(t)} style={[styles.chip, topic === t && styles.chipActive]} accessibilityRole="button" accessibilityLabel={`Filter ${t}`}>
            <Text style={[styles.chipText, topic === t && styles.chipTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.filters}>
        <Pressable onPress={() => setYear("all")} style={[styles.chip, year === "all" && styles.chipActive]} accessibilityRole="button" accessibilityLabel="All years"><Text style={[styles.chipText, year === "all" && styles.chipTextActive]}>All years</Text></Pressable>
        {years.map((y) => (
          <Pressable key={y} onPress={() => setYear(y)} style={[styles.chip, year === y && styles.chipActive]} accessibilityRole="button" accessibilityLabel={`Filter ${y}`}>
            <Text style={[styles.chipText, year === y && styles.chipTextActive]}>{y}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/(tabs)/research/[id]", params: { id: item.id } } as any} asChild>
            <Card
              title={item.title}
              subtitle={`${item.source} Ã¢â‚¬Â¢ ${item.year}`}
              left={
                <View style={{ backgroundColor: palette.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: palette.onPrimary, fontSize: 12 }}>{item.topics[0]}</Text>
                </View>
              }
            />
          </Link>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
      />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.9, marginBottom: 8 },
    filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
    chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    chipActive: { backgroundColor: palette.primary },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary },
  });
}
