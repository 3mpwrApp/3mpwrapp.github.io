import React from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../components/A11yPressable";
import ContrastToggle from "../../components/ContrastToggle";
import GapView from "../../components/GapView";
import ResponsiveScreenWrapper from "../../components/ResponsiveScreenWrapper";
import SettingsLink from "../../components/SettingsLink";
import { HIT_SLOP_8 } from "../../constants/A11Y";
import { faqs as defaultFaqs } from "../../data/faqs";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { useFaqAssistant } from "../../hooks/useFaqAssistant";
import { useTranslation } from "../../i18n";
import { createFaq, subscribeFaqs } from "../../services/faqs";
import { addLocalFaq, getLocalFaqs } from "../../services/localContent";
import { useTextScale } from "../../theme/typography";
import { useAppPalette } from "../../theme/usePalette";

export default function FaqsScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t("faqs.title","FAQs"));
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState(defaultFaqs);
  const [qText, setQText] = React.useState("");
  const [aText, setAText] = React.useState("");
  React.useEffect(() => {
    let unsub: undefined | (() => void);
    (async () => {
      // Merge local user-added FAQs (legacy) first
      const local = await getLocalFaqs();
      if (local.length) setItems((prev) => [...local, ...prev]);
      try {
        unsub = subscribeFaqs((remote) => {
          // remote array already newest first
            setItems((prev) => {
              // keep any local-only (id starts with 'faq-') that are not in remote
              const localOnly = prev.filter(p => p.id.startsWith('faq-') && !remote.find(r => r.id === p.id));
              return [...localOnly, ...remote.length ? remote : defaultFaqs];
            });
            // remote ready
        });
      } catch {
  // remote fallback ready
      }
    })();
    return () => { if (unsub) unsub(); };
  }, []);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [query, items]);
  const suggestions = useFaqAssistant(items, query, { llm: false });
  const clearSearch = React.useCallback(() => setQuery(''), []);

  return (
    <ResponsiveScreenWrapper>
      <View style={styles.container}>
        <Text
          ref={titleRef}
          style={styles.title}
          accessibilityRole="header"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t("faqs.title","FAQs")}
        </Text>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
        <GapView style={{ flexDirection:'row', alignItems:'center', marginBottom:6 }} gap={8}>
          <TextInput
            style={[styles.input, { flex:1, marginBottom:0 }]}
            value={query}
            onChangeText={setQuery}
            placeholder={t("faqs.searchPlaceholder","Search FAQs")}
            placeholderTextColor={palette.text}
            accessibilityLabel={t("faqs.searchLabel","Search FAQs")}
            returnKeyType="search"
          />
          {!!query.trim() && (
            <A11yPressable accessibilityRole="button" accessibilityLabel={t('common.clear','Clear')} onPress={clearSearch} hitSlop={HIT_SLOP_8} style={{ paddingHorizontal:12, paddingVertical:10, borderRadius:8, backgroundColor: palette.card, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
              <Text style={{ color: palette.text, fontWeight:'700' }}>{t('common.clear','Clear')}</Text>
            </A11yPressable>
          )}
        </GapView>
        <Text style={{ color: palette.textSecondary, marginBottom: 8 }} accessibilityLiveRegion="polite">{t('eventsFeature.loadedCount','{{n}} events loaded', { n: filtered.length }).replace('events','FAQs')}</Text>
        <View style={{ marginBottom: 8 }}>
          <TextInput
            style={styles.input}
            value={qText}
            onChangeText={setQText}
            placeholder={t("faqs.questionPlaceholder","Question")}
            placeholderTextColor={palette.text}
          />
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            value={aText}
            onChangeText={setAText}
            placeholder={t("faqs.answerPlaceholder","Answer")}
            placeholderTextColor={palette.text}
            multiline={true}
          />
          <A11yPressable accessibilityRole="button" hitSlop={HIT_SLOP_8}
            disabled={!qText.trim() || !aText.trim()}
            onPress={async () => {
              const localItem = {
                id: `faq-${Date.now()}`,
                q: qText.trim(),
                a: aText.trim(),
              };
              // Optimistic local insert while attempting remote create (admin only)
              setItems((prev) => [localItem, ...prev]);
              try {
                await createFaq({ q: localItem.q, a: localItem.a, source: 'user' });
              } catch {
                // persist locally if remote fails or user not admin
                await addLocalFaq(localItem);
              }
              setQText("");
              setAText("");
            }}
            accessibilityLabel={t("faqs.addLabel","Add FAQ")}
            style={({ pressed }) => [
              styles.button,
              (!qText.trim() || !aText.trim() || pressed) && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.buttonText}>{t("faqs.add","Add")}</Text>
          </A11yPressable>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.q}>{item.q}</Text>
              <Text style={styles.a}>{item.a}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.a}>{t("faqs.empty","No FAQs found")}</Text>}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
        {!!query.trim() && suggestions.length > 0 && (
          <View style={{ marginBottom: 8, backgroundColor: palette.surface, borderRadius:8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, padding:8 }}>
            <Text style={{ color: palette.text, fontWeight:'700', marginBottom:4 }}>{t('faqs.suggestions','Suggestions')}</Text>
            {suggestions.map(s => (
              <A11yPressable key={s.id} accessibilityRole="button" hitSlop={HIT_SLOP_8} accessibilityLabel={`Use suggestion ${s.q}`} onPress={()=> { setQuery(s.q); }} style={({pressed})=> ({ paddingVertical:4, opacity: pressed?0.6:1 })}>
                <Text style={{ color: palette.text, fontWeight:'600' }}>{s.q}</Text>
              </A11yPressable>
            ))}
          </View>
        )}
      </View>
    </ResponsiveScreenWrapper>
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
      color: palette.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginBottom: 6,
    },
    item: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    q: { color: palette.text, fontWeight: "700" },
    a: { color: palette.text, opacity: 1, marginTop: 4 },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontSize: 16, fontWeight: "700" },
  });
}
