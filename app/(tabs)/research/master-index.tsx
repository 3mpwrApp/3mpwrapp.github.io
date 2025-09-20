import React from 'react';
import { ScrollView, StyleSheet, Text, View, Linking } from 'react-native';
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
  { key: 'landmarks', title: 'Landmark Documents & Frameworks' },
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

  return (
    <>
      <Stack.Screen options={{ title: 'Master Index' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text ref={titleRef} style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Master Research Index</Text>
        <SettingsLink style={{ position: 'absolute', right: 20, top: 20 }} />
        <ContrastToggle style={{ position: 'absolute', right: 56, top: 20 }} />
        <Text style={styles.intro}>Hierarchical map of authoritative data sources, research hubs, historical frameworks, and search strategies across Canada and global contexts.</Text>
        {regionOrder.map(sectionGroup => {
          const sections = masterIndex[sectionGroup.key];
          return (
            <View key={sectionGroup.key} style={styles.group} accessibilityRole="summary">
              <Text style={styles.groupTitle} accessibilityRole="header">{sectionGroup.title}</Text>
              {sections.map(sec => (
                <View key={sec.id} style={styles.section} accessibilityRole="summary">
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
                    <View key={sub.id} style={styles.subSection} accessibilityRole="summary">
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
