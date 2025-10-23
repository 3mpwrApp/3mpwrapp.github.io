import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { AccessibilityInfo, Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import ContrastToggle from '../../../components/ContrastToggle';
import SettingsLink from '../../../components/SettingsLink';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { masterIndex } from '../../../data/research-master-index';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useTextScale } from '../../../theme/typography';
import { useAppPalette } from '../../../theme/usePalette';
let AsyncStorage: any; try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

export const options = { href: null };

const buildRegionOrder = (t: any) => ([
  { key: 'canada', title: t('masterIndex.sections.canada') },
  { key: 'global', title: t('masterIndex.sections.global') },
  { key: 'themes', title: t('masterIndex.sections.themes') },
  { key: 'landmarks', title: t('masterIndex.sections.landmarks') },
  { key: 'search', title: t('masterIndex.sections.search') },
  { key: 'howTo', title: t('masterIndex.sections.howTo') },
]);

export default function MasterIndexScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t, tCount } = useTranslation();
  useAnnounceOnMount(t('masterIndex.screenLabel'));
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState('');
  const [announceTimer, setAnnounceTimer] = React.useState<ReturnType<typeof setTimeout> | null>(null);
  const [quickFilter, setQuickFilter] = React.useState<string | null>(null);

  // Load persisted quick filter
  React.useEffect(() => {
    (async () => {
      if (params.filter) return; // URL param overrides saved
      try {
        const saved = await AsyncStorage?.getItem?.('research:quickFilter');
        if (saved) setQuickFilter(saved);
      } catch {}
    })();
  }, [params.filter]);

  React.useEffect(() => {
    if (params.filter && typeof params.filter === 'string') {
      const lower = params.filter.toLowerCase();
      const allowed = ['uncrpd','advocacy','poverty','suppression'];
      if (allowed.includes(lower)) setQuickFilter(lower);
    }
  }, [params.filter]);

  const normalizedQuery = (quickFilter ? `${query} ${quickFilter}` : query).trim().toLowerCase();

  const filtered = React.useMemo(() => {
    if (!normalizedQuery) return masterIndex;
    const filterSections = (sections: typeof masterIndex.canada) =>
      sections
        .map(sec => {
          const linkMatches = sec.links.filter(l => l.label.toLowerCase().includes(normalizedQuery) || (l.note?.toLowerCase().includes(normalizedQuery)));
          const subMatches = sec.subsections?.map(sub => {
            const subLinkMatches = sub.links.filter(l => l.label.toLowerCase().includes(normalizedQuery) || (l.note?.toLowerCase().includes(normalizedQuery)));
            return subLinkMatches.length ? { ...sub, links: subLinkMatches } : null;
          }).filter(Boolean) as any[] | undefined;
          const sectionMatch = sec.title.toLowerCase().includes(normalizedQuery) || sec.description?.toLowerCase().includes(normalizedQuery);
          if (sectionMatch || linkMatches.length || (subMatches && subMatches.length)) {
            return { ...sec, links: linkMatches, subsections: subMatches };
          }
          return null;
        })
        .filter(Boolean) as typeof masterIndex.canada;
    return {
      canada: filterSections(masterIndex.canada),
      global: filterSections(masterIndex.global),
      themes: filterSections(masterIndex.themes),
      landmarks: filterSections(masterIndex.landmarks),
      search: filterSections(masterIndex.search),
      howTo: filterSections(masterIndex.howTo),
    } as typeof masterIndex;
  }, [normalizedQuery]);

  const totalResults: number | null = React.useMemo(() => {
    if (!normalizedQuery) return null;
    let count = 0;
    Object.values(filtered).forEach((sectionArray: typeof filtered.canada) => {
      sectionArray.forEach((sec: any) => {
        count += sec.links.length;
        sec.subsections?.forEach((sub: any) => { count += sub.links.length; });
      });
    });
    return count;
  }, [filtered, normalizedQuery]);

  React.useEffect(() => {
    if (announceTimer) clearTimeout(announceTimer);
    if (normalizedQuery) {
      const t = setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(`${totalResults ?? 0} results for ${query}`);
      }, 600);
      setAnnounceTimer(t);
    }
    return () => {
      if (announceTimer) clearTimeout(announceTimer);
    };
  }, [normalizedQuery, totalResults]);

  const regionOrder = React.useMemo(() => buildRegionOrder(t), [t]);

  React.useEffect(() => {
    if (quickFilter) {
      const msg = t('masterIndex.chipsAnnounce').replace('{{label}}', quickFilter.toUpperCase());
      AccessibilityInfo.announceForAccessibility(msg);
    }
  }, [quickFilter, t]);

  return (
    <>
      <Stack.Screen options={{ title: t('masterIndex.title') }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text ref={titleRef} style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('masterIndex.title')}</Text>
        <SettingsLink style={{ position: 'absolute', right: 20, top: 20 }} />
        <ContrastToggle style={{ position: 'absolute', right: 56, top: 20 }} />
        <Text style={styles.intro}>{t('masterIndex.intro')}</Text>
        <View style={styles.searchWrap} accessibilityRole="search">
          <View style={styles.filterChipsRow} accessibilityRole="tablist">
            {[t('research.chips.uncrpd'), t('research.chips.advocacy'), t('research.chips.poverty'), t('research.chips.suppression')].map(chip => {
              const active = quickFilter === chip.toLowerCase();
              return (
                <A11yPressable
                  key={chip}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${chip} ${t('common.filter') || 'quick filter'}`}
                  onPress={async () => {
                    const next = active ? null : chip.toLowerCase();
                    setQuickFilter(next);
                    try { if (next) await AsyncStorage?.setItem?.('research:quickFilter', next); else await AsyncStorage?.removeItem?.('research:quickFilter'); } catch {}
                  }}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{chip}</Text>
                </A11yPressable>
              );
            })}
          </View>
          <Text style={styles.searchLabel}>{t('masterIndex.filterLabel')}</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('masterIndex.searchPlaceholder')}
            placeholderTextColor={palette.muted}
            style={styles.searchInput}
            accessibilityLabel="Search or filter master index"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {(normalizedQuery || quickFilter) ? (
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
              <Text style={styles.resultsMeta} accessibilityLiveRegion="polite">{tCount('masterIndex.results', totalResults ?? 0)}</Text>
              <A11yPressable
                accessibilityRole="button"
                accessibilityLabel={t('common.resetFilters','Reset filters')}
                onPress={async () => { setQuery(''); setQuickFilter(null); try { await AsyncStorage?.removeItem?.('research:quickFilter'); } catch {} }}
                hitSlop={HIT_SLOP_8}
                style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor: palette.card, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
              >
                <Text style={{ color: palette.text, fontWeight:'700' }}>{t('common.resetFilters','Reset filters')}</Text>
              </A11yPressable>
            </View>
          ) : null}
        </View>
        {regionOrder.map(sectionGroup => {
          const source: any = normalizedQuery ? filtered : masterIndex;
          const sections: any[] = source[sectionGroup.key as keyof typeof source] as any[];
          return (
            <View key={sectionGroup.key} style={styles.group}>
              <Text style={styles.groupTitle} accessibilityRole="header">{sectionGroup.title}</Text>
              {sections.map((sec: any) => (
                <View key={sec.id} style={styles.section}>
                  <Text style={styles.sectionTitle}>{sec.title}</Text>
                  {sec.description && <Text style={styles.sectionDescription}>{sec.description}</Text>}
                  {sec.links.map((link: any) => (
                    <A11yPressable
                      key={link.label + link.url}
                      accessibilityRole="link"
                      accessibilityLabel={`Open ${link.label}`}
                      style={styles.linkPress}
                      onPress={() => link.url && Linking.openURL(link.url).catch(() => {})}
                      hitSlop={HIT_SLOP_8}
                    >
                      <Text style={styles.linkText}>{link.label}</Text>
                      {link.note && <Text style={styles.linkNote}>{link.note}</Text>}
                    </A11yPressable>
                  ))}
                  {sec.subsections?.map((sub: any) => (
                    <View key={sub.id} style={styles.subSection}>
                      <Text style={styles.subSectionTitle}>{sub.title}</Text>
                      {sub.description && <Text style={styles.sectionDescription}>{sub.description}</Text>}
                      {sub.links.map((l: any) => (
                        <A11yPressable
                          key={l.label + l.url}
                          accessibilityRole="link"
                          accessibilityLabel={`Open ${l.label}`}
                          style={styles.linkPress}
                          onPress={() => l.url && Linking.openURL(l.url).catch(() => {})}
                          hitSlop={HIT_SLOP_8}
                        >
                          <Text style={styles.linkText}>{l.label}</Text>
                          {l.note && <Text style={styles.linkNote}>{l.note}</Text>}
                        </A11yPressable>
                      ))}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    content: { padding: 20, paddingBottom: 120 },
    title: { fontSize: Math.round(24 * factor), fontWeight: '700', marginBottom: 12, color: palette.text },
    intro: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20, marginBottom: 24 },
    searchWrap: { marginBottom: 28, backgroundColor: palette.surface, padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: palette.card, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
  filterChipActive: { backgroundColor: palette.primary },
  filterChipText: { fontSize: Math.round(12 * factor), color: palette.text },
  filterChipTextActive: { color: palette.onPrimary },
    searchLabel: { fontSize: Math.round(12 * factor), fontWeight: '600', color: palette.text, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  searchInput: { backgroundColor: palette.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: Math.round(14 * factor), color: palette.text, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    resultsMeta: { marginTop: 8, fontSize: Math.round(12 * factor), color: palette.text, opacity: 0.75 },
    group: { marginBottom: 40 },
    groupTitle: { fontSize: Math.round(20 * factor), fontWeight: '700', color: palette.text, marginBottom: 12 },
    section: { marginBottom: 24, backgroundColor: palette.surface, padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    sectionTitle: { fontSize: Math.round(16 * factor), fontWeight: '600', color: palette.text, marginBottom: 6 },
    sectionDescription: { fontSize: Math.round(13 * factor), lineHeight: 18, color: palette.text, opacity: 0.85, marginBottom: 8 },
    subSection: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.muted },
    subSectionTitle: { fontSize: Math.round(14 * factor), fontWeight: '600', color: palette.text, marginBottom: 4 },
    linkPress: { marginBottom: 8 },
    linkText: { fontSize: Math.round(13 * factor), color: palette.primary, textDecorationLine: 'underline' },
    linkNote: { fontSize: Math.round(11 * factor), color: palette.text, opacity: 0.7 },
  });
}
