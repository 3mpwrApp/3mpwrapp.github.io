import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import type { AccCase } from '../../../services/accountabilityTracker';
import { listCases } from '../../../services/accountabilityTracker';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function AccountabilityCases() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  const router = useRouter();
  useAnnounceOnMount(t('accountability.casesTitle','Accountability Cases'));
  useFocusOnRefOnMount(titleRef);

  const [cases, setCases] = React.useState<AccCase[]>([]);
  React.useEffect(() => {
    let on = true;
    (async () => {
      try { const all = await listCases(); if (on) setCases(all); } catch {}
    })();
    return () => { on = false; };
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('accountability.casesTitle','Accountability Cases')}
      </Text>
      {!cases.length && (
        <Text style={s.subtitle}>{t('accountability.casesEmpty','No cases yet. Use the coach to create one.')}</Text>
      )}
      {cases.map(cs => (
        <A11yPressable key={cs.id} onPress={() => router.push({ pathname: '/(tabs)/advocacy/accountability-case', params: { id: cs.id } } as any)} style={s.card} accessibilityRole="button" accessibilityLabel={t('accountability.casesTitle','Accountability Cases')}>
          <Text style={s.cardTitle}>{cs.target || t('accountability.unknownTarget','Unknown target')}</Text>
          <Text style={s.cardMeta}>{new Date(cs.updatedAt).toLocaleString()}</Text>
          <Text style={s.cardIssue}>{cs.issue}</Text>
          {!!cs.events?.length && (
            <View style={{ marginTop: 6 }}>
              <Text style={s.cardMeta}>{t('accountability.latestEvent','Latest event')}:</Text>
              <Text style={s.cardEvent}>{cs.events[0].type.toUpperCase()}: {truncate(cs.events[0].text, 260)}</Text>
            </View>
          )}
        </A11yPressable>
      ))}
    </ScrollView>
  );
}

function truncate(s: string, n: number){ return s.length > n ? s.slice(0,n-1) + '…' : s; }

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface, borderRadius: 10, padding: 12, marginBottom: 12 },
    cardTitle: { color: palette.text, fontWeight: '700' },
    cardMeta: { color: palette.text, opacity: 0.8, fontSize: 12 },
    cardIssue: { color: palette.text, marginTop: 6 },
    cardEvent: { color: palette.text, marginTop: 4 },
  });
}
