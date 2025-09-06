import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount, useAnnounceOnChange } from "../../../hooks/useA11y";
import { advocates as localAdvocates } from "../../../data/advocates";
import { fetchAdvocates } from "../../../services/advocates";
import Card from "../../../components/Card";
import SettingsLink from "../../../components/SettingsLink";
import ContrastToggle from "../../../components/ContrastToggle";
import { Link } from "expo-router";
import { useTranslation } from "../../../i18n";
import SearchBar from "../../../components/SearchBar";
import { useCounts } from "../../../store/counts";
import SkeletonRow from "../../../components/SkeletonRow";
import { useRefresh } from "../../../store/refresh";
import { useNetwork } from "../../../store/network";
import type { Href } from "expo-router";

export default function AdvocacyScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Advocacy");
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState(localAdvocates);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setCount } = useCounts();
  const { setOffline } = useNetwork();
  const reload = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchAdvocates();
      setItems(data);
      setOffline(false);
    } catch {
      setError("Failed to load advocates");
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
    setCount("advocates", items.length);
  }, [items, setCount]);

  useAnnounceOnChange(items.length, (n) => `${n} advocates loaded`);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) => a.name.toLowerCase().includes(q) || a.bio.toLowerCase().includes(q));
  }, [query, items]);

  return (
    <View style={styles.container} accessibilityLabel="Advocacy screen" accessible>
      <Text ref={titleRef} nativeID="advocacy-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Advocacy
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.subtitle}>Connect with community advocates.</Text>
      <Link href={"/(tabs)/advocacy/self-advocacy-coach" as any} asChild>
        <Text style={[styles.subtitle, { color: palette.primary, textDecorationLine: 'underline' }]}>{t('advocacy.tools.self_coach','Self‑Advocacy Coach (micro‑lessons)')}</Text>
      </Link>
      <Link href={"/(tabs)/advocacy/policy-simple" as any} asChild>
        <Text style={[styles.subtitle, { color: palette.primary, textDecorationLine: 'underline' }]}>{t('advocacy.tools.policy_simple','Policy Made Simple')}</Text>
      </Link>
      <Link href={"/(tabs)/advocacy/ai-advocate-translator" as any} asChild>
        <Text style={[styles.subtitle, { color: palette.primary, textDecorationLine: 'underline' }]}>{t('advocacy.tools.ai_translator','AI Advocate Translator')}</Text>
      </Link>
      <Link href={"/(tabs)/advocacy/ai-case-interpreter" as any} asChild>
        <Text style={[styles.subtitle, { color: palette.primary, textDecorationLine: 'underline' }]}>{t('advocacy.tools.ai_case','AI Case Interpreter')}</Text>
      </Link>
      <Link href={"/(tabs)/advocacy/collective-legal" as any} asChild>
        <Text style={[styles.subtitle, { color: palette.primary, textDecorationLine: 'underline' }]}>{t('advocacy.tools.collective','Collective Legal Action Hub')}</Text>
      </Link>
      <Link href={"/(tabs)/advocacy/ai-gov-navigator" as any} asChild>
        <Text style={[styles.subtitle, { color: palette.primary, textDecorationLine: 'underline' }]}>{t('advocacy.tools.ai_gov','AI Government Navigator')}</Text>
      </Link>
      <Link href={"/(tabs)/advocacy/ask" as Href} asChild>
        <Text style={[styles.subtitle, { color: palette.primary, textDecorationLine: 'underline' }]}>Ask an Advocate (intake form)</Text>
      </Link>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search advocates" accessibilityLabel="Search advocates" />
      {loading && (
        <View>
          <SkeletonRow testID="skeleton-advocate-1" />
          <SkeletonRow testID="skeleton-advocate-2" />
          <SkeletonRow testID="skeleton-advocate-3" />
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
                const data = await fetchAdvocates();
                setItems(data);
              } catch (e) {
                setError("Failed to load advocates");
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
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/(tabs)/advocacy/[id]", params: { id: item.id } } as any}
            asChild
            accessibilityRole="link"
            accessibilityLabel={`Open ${item.name}`}
          >
            <Card title={item.name} subtitle={item.bio} testID={`advocate-${item.id}`} />
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
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.95, marginBottom: 8 },
  });
}


