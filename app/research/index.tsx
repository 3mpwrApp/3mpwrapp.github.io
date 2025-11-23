import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import ContrastToggle from '../../components/ContrastToggle';
import { GapView } from '../../components/GapView';
import ResponsiveScreenWrapper from '../../components/ResponsiveScreenWrapper';
import SettingsLink from '../../components/SettingsLink';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { researchHubs } from '../../data/research-hubs';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

export default function ResearchScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('research.landing.screenLabel','Research screen'));
  useFocusOnRefOnMount(titleRef);

  return (
    <ResponsiveScreenWrapper>
      <View style={styles.container}>
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
          {t('research.landing.subtitle','Access disability research, advocacy resources, and trusted data sources.')}
        </Text>

        <GapView gap={16} style={styles.sectionGrid}>
          {/* Research Library - Primary Feature */}
          <Link href="/research/library" asChild={true}>
            <A11yPressable
              style={[styles.sectionCard, styles.featuredCard]}
              accessibilityRole="button"
              accessibilityLabel={`${t('research.landing.libraryTitle','Research Library')} - ${t('research.landing.libraryDesc','Browse studies, reports, and articles with advanced filters')}`}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="library-outline" size={36} color={palette.primary} />
              <Text style={styles.sectionTitle}>{t('research.landing.libraryTitle','Research Library')}</Text>
              <Text style={styles.sectionDescription}>{t('research.landing.libraryDesc','Browse 100+ studies, reports, and articles with advanced filters')}</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            </A11yPressable>
          </Link>

          {/* Master Index */}
          <Link href="/research/master-index" asChild={true}>
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

          {/* UN CRPD Guide */}
          <Link href="/research/uncrpd-info" asChild={true}>
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

          {/* History Timeline */}
          <Link href="/research/history-timeline" asChild={true}>
            <A11yPressable
              style={styles.sectionCard}
              accessibilityRole="button"
              accessibilityLabel={`${t('research.landing.timelineTitle','History Timeline')} (Coming soon) - ${t('research.landing.timelineDesc','Track milestones in disability, worker, and injured worker rights')}`}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="time-outline" size={32} color={palette.primary} />
              <Text style={styles.sectionTitle}>{t('research.landing.timelineTitle','History Timeline')} (Coming soon)</Text>
              <Text style={styles.sectionDescription}>{t('research.landing.timelineDesc','Track milestones in disability, worker, and injured worker rights')}</Text>
            </A11yPressable>
          </Link>

          {/* Wait Times */}
          <Link href="/research/wait-times" asChild={true}>
            <A11yPressable
              style={styles.sectionCard}
              accessibilityRole="button"
              accessibilityLabel={`${t('research.landing.waitTitle','Case/File Wait-Times')} (Coming soon) - ${t('research.landing.waitDesc','Estimate how long processes may take')}`}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="time-outline" size={32} color={palette.primary} />
              <Text style={styles.sectionTitle}>{t('research.landing.waitTitle','Case/File Wait-Times')} (Coming soon)</Text>
              <Text style={styles.sectionDescription}>{t('research.landing.waitDesc','Estimate how long processes may take')}</Text>
            </A11yPressable>
          </Link>
        </GapView>

        {/* Research & Data Hubs */}
        <GapView gap={16} style={styles.hubsContainer} accessibilityRole="summary">
          <Text style={styles.hubsHeader} accessibilityRole="header">{t('research.landing.hubsHeader','Research & Data Hubs')}</Text>
          <Text style={styles.hubsIntro}>{t('research.landing.hubsIntro','Trusted national and global sources for disability, return-to-work, accessibility, assistive tech, and social protection evidence.')}</Text>
          {(['canada','world'] as const).map(region => {
            const hubs = researchHubs.filter(h => h.region === region);
            if (!hubs.length) return null;
            return (
              <GapView gap={12} key={region} style={styles.hubRegion} accessibilityRole="header" accessibilityLabel={region === 'canada' ? 'Canada hubs' : 'Worldwide hubs'}>
                <Text style={styles.regionTitle}>{region === 'canada' ? t('research.landing.regionCanada','Canada') : t('research.landing.regionWorldwide','Worldwide')}</Text>
                {hubs.map(h => (
                  <GapView gap={8} key={h.id} style={styles.hubCard} accessibilityRole="summary">
                    <Text style={styles.hubName}>{h.name}</Text>
                    <Text style={styles.hubDescription}>{h.description}</Text>
                    <GapView gap={12} style={styles.linksRow}>
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
                    </GapView>
                    {h.tags && (
                      <GapView gap={6} style={styles.tagRow}>
                        {h.tags.map(t => (
                          <View key={t} style={styles.tagChip}>
                            <Text style={styles.tagText}>{t}</Text>
                          </View>
                        ))}
                      </GapView>
                    )}
                  </GapView>
                ))}
              </GapView>
            );
          })}
        </GapView>
      </View>
    </ResponsiveScreenWrapper>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: '700', marginBottom: 8, color: palette.text },
    subtitle: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.9, marginBottom: 20 },
    sectionGrid: { paddingBottom: 20 },
    sectionCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, alignItems: 'center', minHeight: 140, justifyContent: 'center' },
    featuredCard: { borderWidth: 2, borderColor: palette.primary, position: 'relative' },
    sectionTitle: { fontSize: Math.round(18 * factor), fontWeight: '700', color: palette.text, marginTop: 12, marginBottom: 8, textAlign: 'center' },
    sectionDescription: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.8, textAlign: 'center' },
    newBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: palette.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    newBadgeText: { fontSize: 10, fontWeight: '700', color: palette.onPrimary, letterSpacing: 0.5 },
    hubsContainer: { marginTop: 24, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.muted, paddingBottom: 40 },
    hubsHeader: { fontSize: Math.round(20 * factor), fontWeight: '700', color: palette.text },
    hubsIntro: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85 },
    hubRegion: { },
    regionTitle: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginTop: 8 },
    hubCard: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, padding: 16, borderRadius: 10 },
    hubName: { fontSize: Math.round(15 * factor), fontWeight: '600', color: palette.text },
    hubDescription: { fontSize: Math.round(13 * factor), color: palette.text, opacity: 0.85, lineHeight: 18 },
    linksRow: { flexDirection: 'row', flexWrap: 'wrap' },
    hubLinkPress: { paddingVertical: 4 },
    hubLinkText: { fontSize: Math.round(13 * factor), color: palette.primary, textDecorationLine: 'underline' },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
    tagChip: { backgroundColor: palette.card, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    tagText: { fontSize: 11, color: palette.text, opacity: 0.8 },
  });
}


