import React from 'react';
import { ScrollView, StyleSheet, Text, View, Linking, TextInput, AccessibilityInfo } from 'react-native';
import { Stack } from 'expo-router';

import { masterIndex } from '../../../data/research-master-index';
import A11yPressable from '../../../components/A11yPressable';
import SettingsLink from '../../../components/SettingsLink';
import ContrastToggle from '../../../components/ContrastToggle';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';
import { useTextScale } from '../../../theme/typography';

export const options = { href: null };

const regionOrder: { key: keyof typeof masterIndex; title: string }[] = [
  { key: 'canada', title: 'Master Index — Canada' },
  { key: 'global', title: 'Master Index — Global & Regional' },
  { key: 'themes', title: 'Thematic Drill-Downs' },
  { key: 'landmarks', title: 'Historical Bedrock & Frameworks' },
  { key: 'search', title: 'Search Portals' },
  { key: 'howTo', title: 'How to Use This Map' },
];

export default function MasterIndexScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Master research index');
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState('');
  const [announceTimer, setAnnounceTimer] = React.useState<ReturnType<typeof setTimeout> | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

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

  return (
    <>
      <Stack.Screen options={{ title: 'Master Index' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text ref={titleRef} style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Master Research Index</Text>
        <SettingsLink style={{ position: 'absolute', right: 20, top: 20 }} />
        <ContrastToggle style={{ position: 'absolute', right: 56, top: 20 }} />
        <Text style={styles.intro}>Hierarchical map of authoritative data sources, research hubs, thematic drill-downs, historical frameworks, and search strategies across Canada and global contexts.</Text>
        <View style={styles.searchWrap} accessibilityRole="search">
          <Text style={styles.searchLabel}>Filter sources</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search themes, portals, hubs..."
            placeholderTextColor={palette.muted}
            style={styles.searchInput}
            accessibilityLabel="Search or filter master index"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {normalizedQuery ? (
            <Text style={styles.resultsMeta} accessibilityLiveRegion="polite">{totalResults ?? 0} link{(totalResults ?? 0) === 1 ? '' : 's'} match</Text>
          ) : null}
        </View>
        {regionOrder.map(sectionGroup => {
          const sections = (normalizedQuery ? filtered : masterIndex)[sectionGroup.key];
          return (
            <View key={sectionGroup.key} style={styles.group}>
              <Text style={styles.groupTitle} accessibilityRole="header">{sectionGroup.title}</Text>
              {sections.map(sec => (
                <View key={sec.id} style={styles.section}>
                  <Text style={styles.sectionTitle}>{sec.title}</Text>
                  {sec.description && <Text style={styles.sectionDescription}>{sec.description}</Text>}
                  {sec.links.map(link => (
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
                  {sec.subsections?.map(sub => (
                    <View key={sub.id} style={styles.subSection}>
                      <Text style={styles.subSectionTitle}>{sub.title}</Text>
                      {sub.description && <Text style={styles.sectionDescription}>{sub.description}</Text>}
                      {sub.links.map(l => (
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
