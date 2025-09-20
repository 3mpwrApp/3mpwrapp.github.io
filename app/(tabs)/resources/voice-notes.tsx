import React from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { getCachedJSON, setCachedJSON } from "../../../services/cache";
import { transcribeAudio } from "../../../services/stt";
import { useAppPalette } from "../../../theme/usePalette";
import { announce } from '../../../utils/announce';

type Note = { id: string; date: string; who?: string; topic?: string; summary?: string; audioUri?: string };
export const options = { href: null };

export default function VoiceNotes() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('templates.voice.title','Voice-to-Case Notes'));
  useFocusOnRefOnMount(titleRef);

  const [date, setDate] = React.useState(new Date().toISOString().slice(0,10));
  const [who, setWho] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [recording, setRecording] = React.useState<any>(null);
  const [audioUri, setAudioUri] = React.useState<string | undefined>();

  React.useEffect(()=> { (async()=> { const saved = await getCachedJSON<Note[]>('voice_notes'); if (saved) setNotes(saved); })(); }, []);
  React.useEffect(()=> { setCachedJSON('voice_notes', notes); }, [notes]);

  const start = async () => {
    try {
      const { Audio } = await import('expo-av');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
  announce(t('templates.voice.recording','Recording...'));
    } catch { Alert.alert(t('templates.voice.recordUnavailable','Recording unavailable'), t('templates.voice.recordUnavailableBody','Rebuild with expo-av to enable.')); }
  };
  const stop = async () => { try { await recording.stopAndUnloadAsync(); const uri = recording.getURI(); setAudioUri(uri||undefined); setRecording(null); announce(t('templates.voice.recordingStopped','Recording stopped')); } catch {} };

  const save = () => {
    const n: Note = { id: String(Date.now()), date, who, topic, summary, audioUri };
    setNotes(prev => [n, ...prev]);
    setWho(''); setTopic(''); setSummary(''); setAudioUri(undefined);
  announce(t('templates.voice.noteSaved','Voice note saved'));
  };

  const caseLog = (n: Note) => `${t('templates.voice.date','Date')}: ${n.date}\n${t('templates.voice.who','Who')}: ${n.who || '-'}\n${t('templates.voice.topic','Topic')}: ${n.topic || '-'}\n${t('templates.voice.summary','Summary')}: ${n.summary || '-'}${n.audioUri? `\n${t('templates.voice.audio','Audio')}: ${n.audioUri}`:''}`;
  const copyNote = async (n: Note) => { try { const Clipboard = await import('expo-clipboard'); await Clipboard.setStringAsync(caseLog(n)); Alert.alert(t('common.copied','Copied'), t('templates.voice.copiedBody','Log copied to clipboard.')); } catch {} };
  const shareNote = async (n: Note) => { try { await Share.share({ message: caseLog(n), title: t('templates.voice.shareTitle','Case Log') }); } catch {} };
  const pdfNote = async (n: Note) => { try { const Print = await import('expo-print'); const html = `<pre style=\"font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; white-space:pre-wrap;\">${caseLog(n).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>`; const { uri } = await Print.printToFileAsync({ html }); await Share.share({ url: uri, title: t('templates.voice.shareTitle','Case Log') }); } catch { Alert.alert(t('templates.voice.pdfUnavailable','PDF not available'), t('templates.voice.pdfUnavailableBody','Install expo-print in a dev build.')); } };
  const docNote = async (n: Note) => { try { const FS = await import('expo-file-system'); const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family:Arial; white-space:pre-wrap;\">${caseLog(n).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre></body></html>`; const path = FS.cacheDirectory + `case_log_${n.id}.doc`; await FS.writeAsStringAsync(path, html, { encoding: FS.EncodingType.UTF8 }); await Share.share({ url: path, title: t('templates.voice.shareTitleDoc','Case Log (.doc)') }); } catch { Alert.alert(t('templates.voice.exportFailed','Export failed'), t('templates.voice.exportFailedBody','Could not create .doc file.')); } };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:16 }}>
      <Text ref={titleRef} accessibilityRole='header' style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('templates.voice.title','Voice-to-Case Notes')}</Text>
      <View style={s.infoCard} accessibilityRole='summary'>
        <Text style={s.infoTitle}>{t('templates.voice.infoTitle','Capture and Transcribe')}</Text>
        <Text style={s.infoLine}>{t('templates.voice.info1','Record conversations or notes and add quick context (who, topic).')}</Text>
        <Text style={s.infoLine}>{t('templates.voice.info2','Transcribe audio (if enabled) and export/share formatted logs.')}</Text>
        <Text style={s.infoLine}>{t('templates.voice.info3','Use logs for medical visits, HR calls, or hearings.')}</Text>
      </View>
      <Text style={s.subtitle}>{t('templates.voice.subtitle','Record audio notes and convert them into formatted case logs for doctors or tribunals.')}</Text>
      <Text style={s.label}>{t('templates.voice.date','Date')}</Text>
      <TextInput style={s.input} value={date} onChangeText={setDate} accessibilityLabel={t('templates.voice.date','Date')} />
      <Text style={s.label}>{t('templates.voice.whoField','Who (doctor, case mgr, HR)')}</Text>
      <TextInput style={s.input} value={who} onChangeText={setWho} accessibilityLabel={t('templates.voice.whoField','Who (doctor, case mgr, HR)')} />
      <Text style={s.label}>{t('templates.voice.topic','Topic')}</Text>
      <TextInput style={s.input} value={topic} onChangeText={setTopic} accessibilityLabel={t('templates.voice.topic','Topic')} />
      <Text style={s.label}>{t('templates.voice.summaryField','Summary / Transcript')}</Text>
      <TextInput style={[s.input,{ minHeight:100 }]} multiline value={summary} onChangeText={setSummary} accessibilityLabel={t('templates.voice.summaryField','Summary / Transcript')} />
      {!recording ? (
        <A11yPressable onPress={start} style={s.button} accessibilityLabel={t('templates.voice.record','Record audio')}><Text style={s.buttonText}>{t('templates.voice.record','Record audio')}</Text></A11yPressable>
      ) : (
        <A11yPressable onPress={stop} style={[s.button,{ backgroundColor:'#b00020' }]} accessibilityLabel={t('templates.voice.stop','Stop recording')}><Text style={s.buttonText}>{t('templates.voice.stop','Stop recording')}</Text></A11yPressable>
      )}
      {!!audioUri && (
        <A11yPressable onPress={async()=>{ const text = await transcribeAudio(audioUri); if (text) setSummary(prev=> (prev? prev+'\n\n':'') + text); }} style={[s.button,{ marginTop:8 }]} accessibilityLabel={t('templates.voice.transcribe','Transcribe')}><Text style={s.buttonText}>{t('templates.voice.transcribe','Transcribe')}</Text></A11yPressable>
      )}
      <A11yPressable onPress={save} style={[s.button,{ marginTop:8 }]} accessibilityLabel={t('templates.voice.saveNote','Save Note')}><Text style={s.buttonText}>{t('templates.voice.saveNote','Save Note')}</Text></A11yPressable>
      <Text style={[s.subtitle,{ marginTop:12 }]}>{t('templates.voice.savedNotes','Saved notes')}</Text>
      {notes.length===0 ? <Text style={s.tip}>{t('templates.voice.none','No notes yet.')}</Text> : notes.map(n => (
        <View key={n.id} style={s.card}>
          <Text style={s.cardTitle}>{n.date} — {n.topic || t('templates.voice.note','Note')}</Text>
          <Text style={s.cardText}>{caseLog(n)}</Text>
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
            <A11yPressable onPress={()=>copyNote(n)} style={s.smallBtn}><Text style={s.smallBtnText}>{t('common.copy','Copy')}</Text></A11yPressable>
            <A11yPressable onPress={()=>shareNote(n)} style={s.smallBtn}><Text style={s.smallBtnText}>{t('common.share','Share')}</Text></A11yPressable>
            <A11yPressable onPress={()=>pdfNote(n)} style={s.smallBtn}><Text style={s.smallBtnText}>{t('common.pdf','PDF')}</Text></A11yPressable>
            <A11yPressable onPress={()=>docNote(n)} style={s.smallBtn}><Text style={s.smallBtnText}>{t('common.doc','DOC')}</Text></A11yPressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    subtitle: { color: palette.text, opacity:0.9, marginBottom:8 },
    label: { color: palette.text, opacity:0.95, marginBottom:4, marginTop:4 },
    input: { borderWidth:1, borderColor: palette.muted, borderRadius:8, padding:10, color: palette.text, marginBottom:8 },
    button: { backgroundColor: palette.primary, paddingVertical:10, borderRadius:8, alignItems:'center', marginTop:4 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    tip: { color: palette.text, opacity:0.8 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, padding:12, marginTop:8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700', marginBottom:6 },
    cardText: { color: palette.text, opacity:0.95, marginBottom:6 },
    smallBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, paddingHorizontal:10, paddingVertical:6 },
    smallBtnText: { color: palette.text, fontWeight:'700' },
    infoCard: { backgroundColor: palette.card, borderRadius:8, padding:12, borderWidth:1, borderColor:palette.muted, marginBottom:12 },
    infoTitle: { fontWeight:'700', color: palette.text, marginBottom:4 },
    infoLine: { color: palette.text, opacity:0.85, marginBottom:2, fontSize:13 },
  });
}
