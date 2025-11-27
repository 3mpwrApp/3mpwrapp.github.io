import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { GapView } from "../../../components/GapView";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { getCachedJSON, setCachedJSON } from "../../../services/cache";
import { useAppPalette } from "../../../theme/usePalette";
import { announce } from "../../../utils/announce";

type TimelineEntry = { id: string; date: string; title: string; details?: string };

export default function CaseTimelineTracker() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const router = useRouter();
  useAnnounceOnMount(t('templates.timeline.title','Case Timeline Tracker'));
  useFocusOnRefOnMount(titleRef);
  const [showInfo, setShowInfo] = React.useState(true);
  const [entries, setEntries] = React.useState<TimelineEntry[]>([]);
  const [newDate] = React.useState(new Date().toISOString().slice(0,10));
  const [newTitle, setNewTitle] = React.useState('');
  const [newDetails, setNewDetails] = React.useState('');

  React.useEffect(()=> { (async()=> { const saved = await getCachedJSON<TimelineEntry[]>('case_timeline'); if (saved) setEntries(saved); })(); }, []);
  React.useEffect(()=> { setCachedJSON('case_timeline', entries); }, [entries]);

  const addEntry = () => {
    if (!newTitle.trim()) { Alert.alert(t('templates.timeline.missingTitle','Missing title'), t('templates.timeline.missingTitleBody','Please enter a title for this event.')); return; }
    const item: TimelineEntry = { id: String(Date.now()), date: newDate, title: newTitle.trim(), details: newDetails.trim()||undefined };
  setEntries(prev => [item, ...prev]);
  announce(t('templates.timeline.entryAdded','Timeline entry added'));
    setNewTitle(''); setNewDetails('');
  };

  const buildPlain = () => entries.slice().reverse().map(e => `${e.date} — ${e.title}${e.details? '\n'+e.details: ''}`).join('\n\n');

  const copyAll = async () => {
    try { const Clipboard = await import('expo-clipboard'); await Clipboard.setStringAsync(buildPlain()); Alert.alert(t('templates.timeline.copied','Copied'), t('templates.timeline.copiedBody','Timeline copied to clipboard.')); }
    catch { Alert.alert(t('templates.timeline.copyFailed','Copy failed'), t('templates.timeline.copyFailedBody','Clipboard unavailable.')); }
  };
  const shareAll = async () => {
    try { await Share.share({ message: buildPlain(), title: t('templates.timeline.shareTitle','Case Timeline') }); }
    catch {}
  };
  const exportDoc = async () => {
    try { const FS = await import('expo-file-system'); const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family:system-ui; white-space:pre-wrap;\">${buildPlain().replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre></body></html>`; const path = FS.cacheDirectory + `case_timeline_${Date.now()}.doc`; await FS.writeAsStringAsync(path, html, { encoding: FS.EncodingType.UTF8 }); await Share.share({ url: path, title: t('templates.timeline.shareTitle','Case Timeline') }); }
    catch { Alert.alert(t('templates.timeline.exportFailed','Export failed'), t('templates.timeline.exportFailedBody','.doc file could not be created.')); }
  };
  const reset = () => { Alert.alert(t('templates.timeline.resetTitle','Reset timeline?'), t('templates.timeline.resetBody','This will remove all entries.'), [ { text: t('common.cancel','Cancel') }, { text: t('common.ok','OK'), style:'destructive', onPress: ()=> setEntries([]) } ]); };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }} accessibilityLabel={t('templates.timeline.screenLabel','Case timeline screen')}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('templates.timeline.title','Case Timeline Tracker')}
      </Text>
      <DisclaimerBanner type="legal" compact={true} />
      <View style={styles.actionsRow}>
  <A11yPressable onPress={()=>{ setShowInfo(v=>!v); announce(showInfo? t('common.hidden','Hidden'): t('common.shown','Shown')); }} style={styles.secondaryBtn} accessibilityLabel={t('templates.timeline.toggleInfo','Toggle instructions')}><Text style={styles.secondaryBtnText}>{showInfo? t('common.hide','Hide'): t('common.show','Show')}</Text></A11yPressable>
        <A11yPressable onPress={copyAll} style={styles.secondaryBtn}><Text style={styles.secondaryBtnText}>{t('common.copyAll','Copy All')}</Text></A11yPressable>
        <A11yPressable onPress={shareAll} style={styles.secondaryBtn}><Text style={styles.secondaryBtnText}>{t('common.share','Share')}</Text></A11yPressable>
        <A11yPressable onPress={exportDoc} style={styles.secondaryBtn}><Text style={styles.secondaryBtnText}>{t('common.exportDoc','Export .DOC')}</Text></A11yPressable>
        {entries.length>0 && <A11yPressable onPress={reset} style={[styles.secondaryBtn,{ borderColor: palette.error }]} accessibilityLabel={t('templates.timeline.resetTimeline','Reset timeline')}><Text style={[styles.secondaryBtnText,{ color: palette.error }]}>{t('common.reset','Reset')}</Text></A11yPressable>}
      </View>
      {showInfo && (
        <View style={styles.infoCard} accessibilityRole='summary'>
          <Text style={styles.infoTitle}>{t('templates.timeline.infoTitle','Track Your Case')}</Text>
          <Text style={styles.infoLine}>{t('templates.timeline.infoLine1','Log events like forms sent, medical visits, calls, hearings, and decisions.')}</Text>
          <Text style={styles.infoLine}>{t('templates.timeline.infoLine2','Use this timeline when drafting letters, appeals, or preparing meetings.')}</Text>
          <Text style={styles.infoLine}>{t('templates.timeline.infoLine3','Export or copy to share with representatives or support workers.')}</Text>
        </View>
      )}
      <Text style={styles.subtitle}>{t('templates.timeline.subtitle','Organize documents, deadlines, hearings, and appointments. Export timelines for your case file or representative.')}</Text>
      <GapView gap={8}>
        <A11yPressable onPress={() => router.push("/(tabs)/resources/deadlines" as any)} style={styles.cta} accessibilityLabel={t('templates.timeline.openDeadlines','Open Deadline Calculator')}>
          <Text style={styles.ctaText}>{t('templates.timeline.openDeadlines','Open Deadline Calculator')}</Text>
        </A11yPressable>
        <A11yPressable
          style={styles.ctaSecondary}
          accessibilityLabel={t('templates.timeline.addDocuments','Add documents to Evidence Locker')}
          onPress={async () => {
            try {
              const Doc = await import('expo-document-picker');
              const res = await Doc.getDocumentAsync({ multiple: true });
              if (res.canceled || !res.assets?.length) return;
              const files = res.assets.map((f:any)=> ({ name: f.name || 'file', uri: f.uri }));
              let AsyncStorage: any; try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}
              const note = { id: String(Date.now()), text: t('templates.timeline.caseDocuments','Case documents'), date: new Date().toISOString(), tags: ['timeline','document'], files } as any;
              const raw = (await AsyncStorage?.getItem?.('evidence:notes:v1')) || '[]';
              const arr = JSON.parse(raw); arr.unshift(note); await AsyncStorage?.setItem?.('evidence:notes:v1', JSON.stringify(arr));
              announce(t('templates.timeline.addedToLocker','Added to locker'));
              try { const { router } = require('expo-router'); router.push('/(tabs)/resources/evidence-locker'); } catch {}
            } catch { Alert.alert(t('templates.timeline.addFailed','Add failed'), t('templates.timeline.addFailedBody','Could not add documents.')); }
          }}
        >
          <Text style={styles.ctaSecondaryText}>{t('templates.timeline.addDocsBtn','Add Documents to Locker')}</Text>
        </A11yPressable>
      </GapView>
      <View style={{ marginTop:16 }}>
        <Text style={styles.entryLabel}>{t('templates.timeline.newEntry','New Entry')}</Text>
        <Text style={styles.fieldLabel}>{t('templates.timeline.date','Date')}</Text>
        <Text style={styles.readOnlyField}>{newDate}</Text>
        <Text style={styles.fieldLabel}>{t('templates.timeline.titleField','Title')}</Text>
        <Text style={styles.entryInput} accessibilityLabel={t('templates.timeline.titleField','Title')}>{newTitle}</Text>
        <Text style={styles.fieldLabel}>{t('templates.timeline.detailsField','Details')}</Text>
        <Text style={[styles.entryInput,{ minHeight:60 }]} accessibilityLabel={t('templates.timeline.detailsField','Details')}>{newDetails}</Text>
        <GapView gap={8} style={styles.entryActions}>
          <A11yPressable onPress={addEntry} style={styles.addBtn}><Text style={styles.addBtnText}>{t('templates.timeline.addEntry','Add')}</Text></A11yPressable>
        </GapView>
      </View>
      {entries.length>0 && (
        <View style={{ marginTop:24 }}>
          <Text style={styles.entryLabel}>{t('templates.timeline.entriesTitle','Timeline Entries')}</Text>
          {entries.map(e => (
            <View key={e.id} style={styles.entryCard}>
              <Text style={styles.entryCardTitle}>{e.date} — {e.title}</Text>
              {!!e.details && <Text style={styles.entryCardText}>{e.details}</Text>}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    cta: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
    ctaSecondary: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    ctaSecondaryText: { color: palette.text, fontWeight: "600" },
    actionsRow: { flexDirection:'row', flexWrap:'wrap', marginBottom:8 },
    secondaryBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal:12, paddingVertical:8, borderRadius:6 },
    secondaryBtnText: { color: palette.text, fontWeight:'600', fontSize:13 },
    infoCard: { backgroundColor: palette.card, borderRadius:8, padding:12, borderWidth:1, borderColor:palette.muted, marginBottom:12 },
    infoTitle: { fontWeight:'700', color: palette.text, marginBottom:4 },
    infoLine: { color: palette.text, opacity:0.85, marginBottom:2, fontSize:13 },
    entryLabel: { color: palette.text, fontWeight:'700', marginBottom:4 },
    fieldLabel: { color: palette.text, fontWeight:'600', marginTop:8, marginBottom:4 },
    readOnlyField: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:6, padding:8, color: palette.text },
    entryInput: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:6, padding:8, color: palette.text, backgroundColor: palette.surface },
    entryActions: { flexDirection:'row', marginTop:8 },
    addBtn: { backgroundColor: palette.primary, paddingVertical:10, paddingHorizontal:16, borderRadius:8 },
    addBtnText: { color: palette.onPrimary, fontWeight:'700' },
    entryCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, padding:12, marginTop:8, backgroundColor: palette.surface },
    entryCardTitle: { color: palette.text, fontWeight:'700', marginBottom:4 },
    entryCardText: { color: palette.text, opacity:0.95 },
  });
}
