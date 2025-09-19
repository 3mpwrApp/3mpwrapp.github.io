import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Linking,
} from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import Card from "../../../components/Card";
import { fetchAdvocates, type AdvocateFilter } from "../../../services/advocates";
import type { Advocate as AdvocateModel } from "../../../data/lawyers";

const PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
];

type Advocate = AdvocateModel;

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function AdvocacyScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Advocacy");
  useFocusOnRefOnMount(titleRef);

  const [query, setQuery] = React.useState("");
  const [issue, setIssue] = React.useState<string | null>(null);
  const [province, setProvince] = React.useState<string | null>(null);
  const [proBono, setProBono] = React.useState(false);
  const [items, setItems] = React.useState<Advocate[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const issues = React.useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((adv) => adv.issues.forEach((iss) => map.set(iss, (map.get(iss) || 0) + 1)));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([iss]) => iss);
  }, [items]);

  const load = React.useCallback(async () => {
    const filters: AdvocateFilter = {
      query: query.trim() || undefined,
      issue: issue || undefined,
      province: province || undefined,
      proBono: proBono || undefined,
    };
    try {
      setError(null);
      setLoading(true);
      const { items: rows, total: t } = await fetchAdvocates(1, 40, filters);
      setItems(rows);
      setTotal(typeof t === "number" ? t : rows.length);
    } catch {
      setError("Unable to load advocates. Try again later.");
    } finally {
      setLoading(false);
    }
  }, [query, issue, province, proBono]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onOpen = (adv: Advocate) => {
    const first = adv.website || (adv.email ? `mailto:${adv.email}` : adv.phone ? `tel:${adv.phone}` : undefined);
    if (first) Linking.openURL(first).catch(() => {});
  };

  return (
    <View style={styles.container} accessibilityLabel="Advocacy screen" accessible>
      <Text
        ref={titleRef}
        nativeID="advocacy-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Advocacy Directory
      </Text>
      <Text style={styles.subtitle}>
        Browse trusted legal clinics and advocates that can help with WSIB, accommodation, human-rights, and return-to-work issues.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name, organization, city, or issue"
        placeholderTextColor={palette.muted}
        style={styles.input}
        returnKeyType="search"
      />

      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setProBono((p) => !p)}
          style={({ pressed }) => [styles.filterChip, proBono && styles.filterChipActive, pressed && { opacity: 0.8 }]}
        >
          <Text style={[styles.filterText, proBono && styles.filterTextActive]}>Pro bono</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setQuery("");
            setIssue(null);
            setProvince(null);
            setProBono(false);
          }}
          style={({ pressed }) => [styles.filterChip, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.filterText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Filter by issue</Text>
      <View style={styles.chipRow}>
        <FilterChip label="All" active={!issue} onPress={() => setIssue(null)} />
        {issues.map((iss) => (
          <FilterChip key={iss} label={iss} active={issue === iss} onPress={() => setIssue(iss)} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Filter by province/territory</Text>
      <View style={styles.chipRow}>
        <FilterChip label="All" active={!province} onPress={() => setProvince(null)} />
        {PROVINCES.map((prov) => (
          <FilterChip key={prov} label={prov} active={province === prov} onPress={() => setProvince(prov)} />
        ))}
      </View>

      <Text style={styles.resultMeta}>{loading ? "Loading advocates…" : `${items.length} of ${total} entries`}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            title={item.name}
            subtitle={[item.org, item.city && `${item.city}, ${item.province}`].filter(Boolean).join(" • ")}
            onPress={() => onOpen(item)}
            footer={
              <View style={styles.tagRow}>
                {item.issues.slice(0, 3).map((iss) => (
                  <View key={iss} style={styles.tag}>
                    <Text style={styles.tagText}>{iss}</Text>
                  </View>
                ))}
                {item.proBono && (
                  <View style={[styles.tag, { backgroundColor: palette.primary }]}>
                    <Text style={[styles.tagText, { color: palette.onPrimary }]}>Pro bono</Text>
                  </View>
                )}
              </View>
            }
          />
        )}
        contentContainerStyle={{ paddingVertical: 12 }}
        ListEmptyComponent={!loading && !error ? <Text style={styles.empty}>No advocates match your filters.</Text> : null}
      />
    </View>
  );
}

function FilterChip({ label, active, onPress }: FilterChipProps) {
  const palette = useAppPalette();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: palette.muted,
          backgroundColor: active ? palette.primary : "transparent",
          marginRight: 8,
          marginBottom: 8,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={{ color: active ? palette.onPrimary : palette.text }}>{label}</Text>
    </Pressable>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { color: palette.text, marginBottom: 12, opacity: 0.95 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginBottom: 12,
    },
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
    filterChip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    filterChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    filterText: { color: palette.text },
    filterTextActive: { color: palette.onPrimary },
    chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
    sectionLabel: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    resultMeta: { color: palette.text, opacity: 0.7, marginBottom: 6 },
    error: { color: "red", marginBottom: 6 },
    empty: { color: palette.text, opacity: 0.7, marginTop: 12 },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
    tag: {
      backgroundColor: palette.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    tagText: { color: palette.text, fontSize: 12 },
  });
}
