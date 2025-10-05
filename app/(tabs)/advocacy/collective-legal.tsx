// Clean single implementation file (all prior duplicate fragments removed)
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { getCachedJSON, setCachedJSON } from '../../../services/cache';
import { fsAddViolationReport } from '../../../services/violations';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type Report = { id: string; type: string; province?: string; details?: string; createdAt: number };
const TYPES: [string, string][] = [
  ['advocacy.collective.type.deniedModified', 'denied modified duties'],
  ['advocacy.collective.type.refusedAccommodation', 'refused accommodation'],
  ['advocacy.collective.type.retaliation', 'retaliation'],
  ['advocacy.collective.type.benefitDenial', 'benefit denial'],
];

export default function CollectiveLegal() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('advocacy.collective.title', 'Collective Legal Action Hub'));
  useFocusOnRefOnMount(titleRef);

  const [typeKey, setTypeKey] = React.useState<string>(TYPES[0][0]);
  const [province, setProvince] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [reports, setReports] = React.useState<Report[]>([]);

  React.useEffect(() => { (async () => { const saved = await getCachedJSON<Report[]>('advocacy:collective_reports:v1'); if (saved) setReports(saved); })(); }, []);
  React.useEffect(() => { setCachedJSON('advocacy:collective_reports:v1', reports); }, [reports]);

  const submit = async () => {
    const fallback = TYPES.find(([k]) => k === typeKey)?.[1] || typeKey;
    const r: Report = { id: String(Date.now()), type: t(typeKey, fallback), province, details, createdAt: Date.now() };
    setReports(prev => [r, ...prev]);
    fsAddViolationReport?.(r).catch(() => {});
    setDetails('');
    Alert.alert(t('advocacy.collective.submittedTitle', 'Submitted'), t('advocacy.collective.submittedBody', 'Report added anonymously. Aggregated counts help build leverage.'));
  };

  const byType = reports.reduce((acc: Record<string, number>, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole='header' style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('advocacy.collective.title', 'Collective Legal Action Hub')}</Text>
  <Text style={s.subtitle}>{t('advocacy.collective.subtitle', 'If multiple users report the same violation, 3mpwr App groups cases for union / class-action leverage.')}</Text>
      <Text style={s.label}>{t('advocacy.collective.typeLabel', 'Violation type')}</Text>
      <View style={s.typesWrap}>
        {TYPES.map(([k, fallback]) => { const active = k === typeKey; return (
          <A11yPressable key={k} onPress={() => setTypeKey(k)} accessibilityState={{ selected: active }} accessibilityLabel={t(k, fallback)} style={[s.typeChip, active && { backgroundColor: palette.primary, borderColor: palette.primary }]}>
            <Text style={{ color: active ? palette.onPrimary : palette.text }}>{t(k, fallback)}</Text>
          </A11yPressable>
        ); })}
      </View>
      <Text style={s.label}>{t('advocacy.collective.provinceLabel', 'Province (optional)')}</Text>
      <TextInput style={s.input} value={province} onChangeText={setProvince} placeholder={t('advocacy.collective.provincePlaceholder', 'ON, BC, ...')} accessibilityLabel={t('advocacy.collective.provinceLabel', 'Province (optional)')} />
      <Text style={s.label}>{t('advocacy.collective.detailsLabel', 'Details (optional)')}</Text>
      <TextInput style={[s.input,{minHeight:100}]} value={details} onChangeText={setDetails} multiline placeholder={t('advocacy.collective.detailsPlaceholder','Short summary; do not include identifiers.')} accessibilityLabel={t('advocacy.collective.detailsLabel', 'Details (optional)')} />
      <A11yPressable onPress={submit} style={s.button} accessibilityLabel={t('advocacy.collective.submit','Submit report')}><Text style={s.buttonText}>{t('advocacy.collective.submit','Submit report')}</Text></A11yPressable>
      <Text style={[s.subtitle,{marginTop:12}]}>{t('advocacy.collective.aggregatedHeader','Aggregated reports')}</Text>
      {Object.keys(byType).length === 0 ? <Text style={s.tip}>{t('advocacy.collective.none','No reports yet.')}</Text> : Object.entries(byType).map(([k,v]) => <Text key={k} style={s.tip} accessibilityLabel={`${k} ${v}`}>{k}: {v}</Text>)}
      <Text style={[s.tip,{marginTop:8}]}>{t('advocacy.collective.note','Note: Submissions are anonymous; contact details are not collected.')}</Text>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) { return StyleSheet.create({
  container:{ flex:1, backgroundColor:palette.background },
  title:{ fontSize:22, fontWeight:'700', color:palette.text },
  subtitle:{ color:palette.text, opacity:0.9, marginBottom:8 },
  label:{ color:palette.text, opacity:0.95, marginBottom:4 },
  input:{ borderWidth:1, borderColor:palette.muted, borderRadius:8, padding:10, color:palette.text, marginBottom:8 },
  button:{ backgroundColor:palette.primary, paddingVertical:10, borderRadius:8, alignItems:'center', marginTop:4 },
  buttonText:{ color:palette.onPrimary, fontWeight:'700' },
  tip:{ color:palette.text, opacity:0.9 },
  typesWrap:{ flexDirection:'row', flexWrap:'wrap' },
  typeChip:{ borderWidth:1, borderColor:palette.muted, borderRadius:16, paddingHorizontal:12, paddingVertical:6, marginRight:8, marginBottom:8, backgroundColor:'transparent' },
}); }
