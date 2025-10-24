import { Link, Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import ContrastToggle from '../../components/ContrastToggle';
import SettingsLink from '../../components/SettingsLink';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

export default function UNCRPDInfoScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('uncrpd.screenLabel'));
  useFocusOnRefOnMount(titleRef);

  return (
    <>
      <Stack.Screen options={{ title: t('uncrpd.title') }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SettingsLink style={{ position: 'absolute', right: 20, top: 20 }} />
        <ContrastToggle style={{ position: 'absolute', right: 56, top: 20 }} />
        <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('uncrpd.title')}</Text>
        <Text style={styles.intro}>{t('uncrpd.intro')}</Text>
        <View style={styles.section} accessibilityRole="summary">
          <Text style={styles.sectionTitle}>{t('uncrpd.quickAccess')}</Text>
          {[
            { label: t('uncrpd.actions.openArticles'), href: '/(tabs)/research/master-index?filter=uncrpd' },
            { label: t('uncrpd.sections.canada'), href: '/(tabs)/research/master-index?filter=uncrpd' },
            { label: t('uncrpd.actions.gcEmployment'), href: '/(tabs)/research/master-index?filter=uncrpd' },
            { label: t('uncrpd.actions.gcLegalCapacity'), href: '/(tabs)/research/master-index?filter=uncrpd' },
            { label: t('uncrpd.actions.gcAccessibility'), href: '/(tabs)/research/master-index?filter=uncrpd' },
          ].map(item => (
            <Link key={item.label} href={item.href as any} asChild>
              <A11yPressable style={styles.linkPress} accessibilityRole="link" accessibilityLabel={item.label} hitSlop={HIT_SLOP_8}>
                <Text style={styles.linkText}>{item.label}</Text>
              </A11yPressable>
            </Link>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('uncrpd.workflow.heading')}</Text>
          <Text style={styles.body}>
            {t('uncrpd.workflow.step1') + '\n'}
            {t('uncrpd.workflow.step2') + '\n'}
            {t('uncrpd.workflow.step3') + '\n'}
            {t('uncrpd.workflow.step4') + '\n'}
            {t('uncrpd.workflow.step5') + '\n'}
            {t('uncrpd.workflow.step6')}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('uncrpd.indicator.title')}</Text>
          <Text style={styles.body}>{t('uncrpd.indicator.body')}</Text>
        </View>
      </ScrollView>
    </>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    content: { padding: 20, paddingBottom: 120, gap: 24 },
    title: { fontSize: Math.round(24 * factor), fontWeight: '700', color: palette.text, marginBottom: 8 },
    intro: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20 },
    section: { backgroundColor: palette.surface, padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, gap: 8 },
    sectionTitle: { fontSize: Math.round(16 * factor), fontWeight: '600', color: palette.text },
    body: { fontSize: Math.round(13 * factor), color: palette.text, lineHeight: 19 },
    linkPress: { marginBottom: 6 },
    linkText: { fontSize: Math.round(13 * factor), color: palette.primary, textDecorationLine: 'underline' }
  });
}
