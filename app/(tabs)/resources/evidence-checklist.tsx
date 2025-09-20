import * as Clipboard from 'expo-clipboard';
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useAppPalette } from "../../../theme/usePalette";
import { announce } from "../../../utils/announce";

type Kind = "WCB" | "LTD" | "CPP-D" | "Accommodation";

const ITEMS: Record<Kind, string[]> = {
  WCB: [
    'Accident/incident report and dates',
    'Employer submission and response',
    'Medical notes emphasizing functional limits',
    'Return-to-work discussions and outcomes',
    'Prior decisions and reasons'
  ],
  LTD: [
    'Policy booklet and definition of disability',
    'Claim forms (own physician and insurer)',
    'Specialist letters with functional limits',
    'Employment description and essential duties',
    'Insurer decision and correspondence'
  ],
  'CPP-D': [
    'MSDPR/Service Canada forms',
    'Longitudinal medical records',
    'Work history and education',
    'Daily living impact statements',
    'Prior decisions and reconsideration letter'
  ],
  Accommodation: [
    'Job description and essential duties',
    'Accommodation requests and responses',
    'Medical notes with restrictions (no diagnosis required)',
    'Proposed accommodations and feasibility',
    'Union/HR correspondence (if applicable)'
  ]
};

export const options = { href: null };

export default function EvidenceChecklist() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('templates.checklist.title','Evidence Checklist'));
  useFocusOnRefOnMount(titleRef);
  const [kind, setKind] = React.useState<Kind>('WCB');
  const [showInfo, setShowInfo] = React.useState(true);
  const lines = ITEMS[kind];
  const completed = React.useRef<Set<number>>(new Set());
  const [, force] = React.useState(0);

  const toggleLine = (i:number) => { if(completed.current.has(i)) completed.current.delete(i); else completed.current.add(i); force(x=>x+1); announce(t('templates.checklist.progressAnnounce','Progress updated')); };
  const progressPct = Math.round((completed.current.size / lines.length) * 100);

  const buildSummary = () => {
    return `${t('templates.checklist.summaryHeader','Evidence Checklist Summary')}\nType: ${kind}\nCompleted: ${completed.current.size}/${lines.length} (${progressPct}%)\n\n` + lines.map((l,i)=>`[${completed.current.has(i)?'x':' '}] ${l}`).join("\n");
  };

  const copySummary = async () => { try { await Clipboard.setStringAsync(buildSummary()); Alert.alert(t('templates.checklist.copied','Copied'), t('templates.checklist.copiedBody','Checklist summary copied.')); } catch { Alert.alert(t('templates.checklist.clipboardNA','Clipboard not available'), t('templates.checklist.clipboardNABody','Install expo-clipboard in a dev build to enable copy.')); } };
  const exportSummary = async () => { try { const FS = await import('expo-file-system'); const Share = await import('expo-sharing').catch(()=>null); const path = FS.cacheDirectory + `evidence_checklist_${Date.now()}.txt`; await FS.writeAsStringAsync(path, buildSummary()); if(Share?.isAvailableAsync && await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t('templates.checklist.shareUnavailable','Share unavailable'), t('templates.checklist.shareUnavailableBody','System share sheet not available.')); } catch { Alert.alert(t('templates.checklist.shareError','Share failed'), t('templates.checklist.shareErrorBody','Could not share checklist file.')); } };
  const reset = () => { completed.current.clear(); force(x=>x+1); announce(t('templates.checklist.resetAnnounce','Checklist reset')); };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:16 }} accessibilityLabel={t('templates.checklist.screenLabel','Evidence checklist screen')}>
      <Text ref={titleRef} accessibilityRole='header' style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('templates.checklist.title','Evidence Checklist')}</Text>
      <View style={s.actionsRow}>
  <A11yPressable onPress={()=>{ setShowInfo(v=>!v); announce(showInfo? t('common.hide','Hide') : t('templates.checklist.toggleInfo','Toggle instructions')); }} style={s.infoBtn} accessibilityRole='button' accessibilityLabel={t('templates.checklist.toggleInfo','Toggle instructions')}><Text style={s.infoBtnText}>{showInfo ? t('common.hide','Hide') : t('common.show','Show')}</Text></A11yPressable>
        <A11yPressable onPress={copySummary} style={s.secondaryBtn} accessibilityRole='button' accessibilityLabel={t('templates.checklist.copy','Copy summary')}><Text style={s.secondaryBtnText}>{t('templates.checklist.copy','Copy summary')}</Text></A11yPressable>
        <A11yPressable onPress={exportSummary} style={s.secondaryBtn} accessibilityRole='button' accessibilityLabel={t('templates.checklist.export','Export')}><Text style={s.secondaryBtnText}>{t('templates.checklist.export','Export')}</Text></A11yPressable>
        <A11yPressable onPress={reset} style={s.secondaryBtn} accessibilityRole='button' accessibilityLabel={t('templates.checklist.reset','Reset')}><Text style={s.secondaryBtnText}>{t('templates.checklist.reset','Reset')}</Text></A11yPressable>
      </View>
      {showInfo && (
        <View style={s.infoCard} accessibilityRole='summary'>
          <Text style={s.infoTitle}>{t('templates.checklist.infoTitle','How to Use')}</Text>
          <Text style={s.infoLine}>{t('templates.checklist.infoLine1','Select a process type to load its suggested evidence items.')}</Text>
          <Text style={s.infoLine}>{t('templates.checklist.infoLine2','Tap items to mark them complete; progress updates are announced.')}</Text>
          <Text style={s.infoLine}>{t('templates.checklist.infoLine3','Use Copy or Export to reuse the summary. Reset clears progress.')}</Text>
        </View>
      )}
      <Text style={s.subtitle}>{t('templates.checklist.subtitle','Pick a process to view a tailored checklist.')}</Text>
      <View style={s.chipRow}>
        {(['WCB','LTD','CPP-D','Accommodation'] as Kind[]).map(k => (
          <A11yPressable hitSlop={HIT_SLOP_8} key={k} onPress={()=>{ setKind(k); announce(t('templates.checklist.kindChanged','Checklist type changed')); }} accessibilityRole='button' accessibilityState={{ selected: kind===k }} style={[s.chip, kind===k && s.chipActive]}>
            <Text style={[s.chipText, kind===k && s.chipTextActive]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{k}</Text>
          </A11yPressable>
        ))}
      </View>
  <Text style={s.progress} accessibilityLabel={t('templates.checklist.progressLabel','Checklist progress')} accessibilityValue={{ text: `${completed.current.size}/${lines.length}` }}>{t('templates.checklist.progress','Progress: {{done}} / {{total}} ({{pct}}%)').replace('{{done}}', String(completed.current.size)).replace('{{total}}', String(lines.length)).replace('{{pct}}', String(progressPct))}</Text>
      {lines.map((line,i)=>(
        <A11yPressable hitSlop={HIT_SLOP_8} key={i} onPress={()=>toggleLine(i)} accessibilityRole='checkbox' accessibilityState={{ checked: completed.current.has(i) }} style={s.itemRow}>
          <View style={[s.checkbox, completed.current.has(i) && s.checkboxChecked]} />
          <Text style={[s.itemText, completed.current.has(i) && s.itemTextDone]} maxFontSizeMultiplier={MAX_FONT_SCALE}>• {line}</Text>
        </A11yPressable>
      ))}
      <Text style={[s.tip,{ marginTop:12 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('templates.checklist.tip','Tip: Summaries from Wellness trackers can support your evidence.')}</Text>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    subtitle: { color: palette.text, opacity:0.9, marginBottom:8 },
    chipRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:8 },
    chip: { borderWidth:StyleSheet.hairlineWidth, borderColor:palette.muted, borderRadius:16, paddingHorizontal:12, paddingVertical:6 },
    chipActive: { backgroundColor:palette.primary, borderColor:palette.primary },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight:'700' },
    actionsRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:12 },
    infoBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal:12, paddingVertical:8, borderRadius:6 },
    infoBtnText: { color: palette.text, fontWeight:'600', fontSize:13 },
    secondaryBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal:10, paddingVertical:8, borderRadius:6 },
    secondaryBtnText: { color: palette.text, fontWeight:'600' },
    infoCard: { backgroundColor: palette.card, borderRadius:8, padding:12, borderWidth:1, borderColor: palette.muted, marginBottom:12 },
    infoTitle: { fontWeight:'700', color: palette.text, marginBottom:4 },
    infoLine: { color: palette.text, opacity:0.85, marginBottom:2, fontSize:13 },
    progress: { color: palette.text, fontWeight:'600', marginBottom:8 },
    itemRow: { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:6 },
    checkbox: { width:20, height:20, borderRadius:4, borderWidth:StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor:'transparent' },
    checkboxChecked: { backgroundColor: palette.primary, borderColor: palette.primary },
    itemText: { color: palette.text, flex:1 },
    itemTextDone: { textDecorationLine:'line-through', opacity:0.6 },
    tip: { color: palette.text, opacity:0.85 },
  });
}
