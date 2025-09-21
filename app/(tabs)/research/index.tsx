import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import ContrastToggle from '../../../components/ContrastToggle';
import SettingsLink from '../../../components/SettingsLink';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { researchHubs } from '../../../data/research-hubs';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useTextScale } from '../../../theme/typography';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function ResearchScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('research.landing.screenLabel','Research screen'));
  useFocusOnRefOnMount(titleRef);

  return (
    <ScrollView style={styles.container}>
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
  {t('research.landing.title','Research')}
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.subtitle}>
  {t('research.landing.subtitle','Access studies, reports, articles, history timeline, and case wait-times.')}
      </Text>
      <View style={styles.sectionGrid}>
        <Link href="/(tabs)/research/studies" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel={`${t('research.landing.studiesTitle','Studies')} - ${t('research.landing.studiesDesc','Access clinical and workplace studies')}`}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="library-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>{t('research.landing.studiesTitle','Studies')}</Text>
            <Text style={styles.sectionDescription}>{t('research.landing.studiesDesc','Access clinical and workplace studies')}</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/reports" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel={`${t('research.landing.reportsTitle','Reports')} - ${t('research.landing.reportsDesc','Community and government reports made easy')}`}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="document-text-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>{t('research.landing.reportsTitle','Reports')}</Text>
            <Text style={styles.sectionDescription}>{t('research.landing.reportsDesc','Community and government reports made easy')}</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/articles" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel={`${t('research.landing.articlesTitle','Articles')} - ${t('research.landing.articlesDesc','Insights on disability, workplace rights, advocacy')}`}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="newspaper-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>{t('research.landing.articlesTitle','Articles')}</Text>
            <Text style={styles.sectionDescription}>{t('research.landing.articlesDesc','Insights on disability, workplace rights, advocacy')}</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/history-timeline" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel={`${t('research.landing.timelineTitle','History Timeline')} - ${t('research.landing.timelineDesc','Track milestones in disability, worker, and injured worker rights')}`}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="time-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>{t('research.landing.timelineTitle','History Timeline')}</Text>
            <Text style={styles.sectionDescription}>{t('research.landing.timelineDesc','Track milestones in disability, worker, and injured worker rights')}</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/wait-times" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel={`${t('research.landing.waitTitle','Case/File Wait-Times')} - ${t('research.landing.waitDesc','Estimate how long processes may take')}`}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="time-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>{t('research.landing.waitTitle','Case/File Wait-Times')}</Text>
            <Text style={styles.sectionDescription}>{t('research.landing.waitDesc','Estimate how long processes may take')}</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/master-index" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel={`${t('research.landing.masterIndexTitle','Master Index')} - ${t('research.landing.masterIndexDesc','Comprehensive map of data & research sources')}`}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="map-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>{t('research.landing.masterIndexTitle','Master Index')}</Text>
            <Text style={styles.sectionDescription}>{t('research.landing.masterIndexDesc','Comprehensive map of data & research sources')}</Text>
          </A11yPressable>
        </Link>
        <Link href="/(tabs)/research/uncrpd-info" asChild>
          <A11yPressable
            style={styles.sectionCard}
            accessibilityRole="button"
            accessibilityLabel={`${t('research.card.uncrpdGuideTitle')} - ${t('research.card.uncrpdGuideDesc')}`}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="people-circle-outline" size={32} color={palette.primary} />
            <Text style={styles.sectionTitle}>{t('research.card.uncrpdGuideTitle')}</Text>
            <Text style={styles.sectionDescription}>{t('research.card.uncrpdGuideDesc')}</Text>
          </A11yPressable>
        </Link>
      </View>
      <View style={styles.hubsContainer} accessibilityRole="summary">
  <Text style={styles.hubsHeader} accessibilityRole="header">{t('research.landing.hubsHeader','Research & Data Hubs')}</Text>
  <Text style={styles.hubsIntro}>{t('research.landing.hubsIntro','Trusted national and global sources for disability, return-to-work, accessibility, assistive tech, and social protection evidence.')}</Text>
        {(['canada','world'] as const).map(region => {
          const hubs = researchHubs.filter(h => h.region === region);
          if (!hubs.length) return null;
          return (
            <View key={region} style={styles.hubRegion} accessibilityRole="header" accessibilityLabel={region === 'canada' ? 'Canada hubs' : 'Worldwide hubs'}>
              <Text style={styles.regionTitle}>{region === 'canada' ? t('research.landing.regionCanada','Canada') : t('research.landing.regionWorldwide','Worldwide')}</Text>
              {hubs.map(h => (
                <View key={h.id} style={styles.hubCard} accessibilityRole="summary">
                  <Text style={styles.hubName}>{h.name}</Text>
                  <Text style={styles.hubDescription}>{h.description}</Text>
                  <View style={styles.linksRow}>
                    {h.links.map(l => (
                      <A11yPressable
                        key={l.url}
                        accessibilityRole="link"
                        accessibilityLabel={`Open ${l.label}`}
                        style={styles.hubLinkPress}
                        onPress={() => Linking.openURL(l.url).catch(() => {})}
                        hitSlop={HIT_SLOP_8}
                      >
                        <Text style={styles.hubLinkText}>{l.label}</Text>
                      </A11yPressable>
                    ))}
                  </View>
                  {h.tags && (
                    <View style={styles.tagRow}>
                      {h.tags.map(t => (
                        <View key={t} style={styles.tagChip}>
                          <Text style={styles.tagText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: '700', marginBottom: 8, color: palette.text },
    subtitle: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.9, marginBottom: 16 },
    sectionGrid: { gap: 16, paddingBottom: 20 },
    sectionCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, alignItems: 'center', minHeight: 140, justifyContent: 'center' },
    sectionTitle: { fontSize: Math.round(18 * factor), fontWeight: '700', color: palette.text, marginTop: 12, marginBottom: 8, textAlign: 'center' },
    sectionDescription: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.8, textAlign: 'center' },
    hubsContainer: { marginTop: 24, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.muted, gap: 16, paddingBottom: 40 },
    hubsHeader: { fontSize: Math.round(20 * factor), fontWeight: '700', color: palette.text },
    hubsIntro: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85 },
    hubRegion: { gap: 12 },
    regionTitle: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginTop: 8 },
    hubCard: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, padding: 16, borderRadius: 10, gap: 8 },
    hubName: { fontSize: Math.round(15 * factor), fontWeight: '600', color: palette.text },
    hubDescription: { fontSize: Math.round(13 * factor), color: palette.text, opacity: 0.85, lineHeight: 18 },
    linksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    hubLinkPress: { paddingVertical: 4 },
    hubLinkText: { fontSize: Math.round(13 * factor), color: palette.primary, textDecorationLine: 'underline' },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tagChip: { backgroundColor: palette.card, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    tagText: { fontSize: 11, color: palette.text, opacity: 0.8 },
  });
}


