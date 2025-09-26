import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { HIT_SLOP_8 } from '../../../constants/a11y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import type { AccCase } from '../../../services/accountability.tracker';
import { addEvent, deleteEvent, getCaseById, updateEvent } from '../../../services/accountability.tracker';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function AccountabilityCase() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('accountability.casesTitle','Accountability Cases'));
  useFocusOnRefOnMount(titleRef);

  const [caze, setCase] = React.useState<AccCase | null>(null);
  const [note, setNote] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [working, setWorking] = React.useState(false);

  React.useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      try { const found = id ? await getCaseById(String(id)) : undefined; if (on) setCase(found || null); } finally { if (on) setLoading(false); }
    })();
    return () => { on = false; };
  }, [id]);

  const addResponse = React.useCallback(async () => {
    const text = note.trim();
    if (!caze || !text) return;
    setSaving(true);
    try {
      await addEvent(caze.id, 'response', text);
      const updated = await getCaseById(caze.id);
      setCase(updated || caze);
      setNote('');
    } finally {
      setSaving(false);
    }
  }, [caze, note]);

  const title = caze?.target || t('accountability.unknownTarget','Unknown target');

  const copyAll = React.useCallback(async () => {
    if (!caze) return;
    try {
      const body = renderCaseText(caze);
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(body);
      Alert.alert(t('common.copied','Copied'));
    } catch {}
  }, [caze, t]);

  const shareAll = React.useCallback(async () => {
    if (!caze) return;
    setWorking(true);
    try {
      const body = renderCaseText(caze);
      const FS = await import('expo-file-system');
      const path = FS.cacheDirectory + `accountability_case_${(caze.target||'case').replace(/[^a-z0-9]+/gi,'_').toLowerCase()}_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, body);
      const Share = await import('expo-sharing');
      if (await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t('translator.pdfUnavailableTitle','PDF unavailable'), t('translator.pdfUnavailableBody','Install expo-print in a dev build to export PDFs.'));
    } catch { Alert.alert(t('translator.exportFailedTitle','Export failed'), t('translator.exportFailedBody','Could not create file.')); }
    finally { setWorking(false); }
  }, [caze, t]);

  const insertLocker = React.useCallback(async () => {
    if (!caze) return;
    setWorking(true);
    try {
      const body = renderCaseText(caze);
      let AsyncStorage: any; try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}
      const note = { id: String(Date.now()), text: body, date: new Date().toISOString(), tags: ['accountability'] };
      const raw = (await AsyncStorage?.getItem?.('evidence:notes:v1')) || '[]';
      const arr = JSON.parse(raw); arr.unshift(note);
      await AsyncStorage?.setItem?.('evidence:notes:v1', JSON.stringify(arr.slice(0, 400)));
      Alert.alert(t('templates.gallery.inserted','Added'), t('templates.gallery.insertedBody','Inserted into Evidence Locker.'));
    } catch { Alert.alert(t('templates.gallery.insertFailed','Not added'), t('templates.gallery.insertFailedBody','Unable to add to Evidence Locker.')); }
    finally { setWorking(false); }
  }, [caze, t]);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
        <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
        {loading && <Text style={s.meta}>{t('common.loading','Loading...')}</Text>}
        {!!caze && (
          <>
            <Text style={s.meta}>{formatDate(caze.updatedAt)}</Text>
            <Text style={s.issue}>{caze.issue}</Text>

            <View style={[s.section,{ flexDirection:'row', gap:8, flexWrap:'wrap' }]}>
              <Pressable onPress={copyAll} disabled={working} style={[s.secondaryBtn, working && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={t('common.copy','Copy')} hitSlop={HIT_SLOP_8}>
                <Text style={s.secondaryBtnText}>{t('common.copy','Copy')}</Text>
              </Pressable>
              <Pressable onPress={shareAll} disabled={working} style={[s.secondaryBtn, working && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={t('common.share','Share')} hitSlop={HIT_SLOP_8}>
                <Text style={s.secondaryBtnText}>{t('common.share','Share')}</Text>
              </Pressable>
              <Pressable onPress={insertLocker} disabled={working} style={[s.secondaryBtn, working && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel={t('templates.letters.common.insertLocker','Insert into Evidence Locker')} hitSlop={HIT_SLOP_8}>
                <Text style={s.secondaryBtnText}>{t('templates.letters.common.insertLocker','Insert into Evidence Locker')}</Text>
              </Pressable>
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>{t('accountability.latestEvent','Latest event')}</Text>
              {!caze.events?.length && (
                <Text style={s.meta}>{t('accountability.casesEmpty','No cases yet. Use the coach to create one.')}</Text>
              )}
              {caze.events?.map(evt => (
                <View key={evt.id} style={s.eventRow}>
                  <Text style={s.eventMeta}>{formatDate(evt.ts)} • {evt.type.toUpperCase()}</Text>
                  <Text style={s.eventText}>{evt.text}</Text>
                  <View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
                    <Pressable onPress={async()=>{ const next = promptEdit(evt.text); if (next!=null) { await updateEvent(caze.id, evt.id, next); const updated = await getCaseById(caze.id); setCase(updated||caze); } }} style={s.linkBtn} accessibilityRole="button" accessibilityLabel={t('common.edit','Edit')} hitSlop={HIT_SLOP_8}><Text style={s.linkBtnText}>{t('common.edit','Edit')}</Text></Pressable>
                    <Pressable onPress={async()=>{ const ok = confirmDelete(); if (ok) { await deleteEvent(caze.id, evt.id); const updated = await getCaseById(caze.id); setCase(updated||caze); } }} style={s.linkBtn} accessibilityRole="button" accessibilityLabel={t('common.delete','Delete')} hitSlop={HIT_SLOP_8}><Text style={s.linkBtnText}>{t('common.delete','Delete')}</Text></Pressable>
                  </View>
                </View>
              ))}
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>{t('common.add','Add')}</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('accountability.track','Track response')}
                placeholderTextColor={palette.muted}
                style={s.input}
                multiline
              />
              <Pressable
                style={({ pressed }) => [s.button, pressed && { opacity: 0.8 }, saving && { opacity: 0.6 }]}
                onPress={addResponse}
                disabled={saving || !note.trim().length}
                accessibilityRole="button"
                accessibilityLabel={t('common.add','Add')}
              >
                <Text style={s.buttonText}>{saving ? t('common.working','Working...') : t('common.add','Add')}</Text>
              </Pressable>
            </View>
          </>
        )}
        {!loading && !caze && (
          <Text style={s.meta}>Not found</Text>
        )}
      </ScrollView>
    </>
  );
}

function formatDate(ts: number){ try { return new Date(ts).toLocaleString(); } catch { return String(ts); } }

function renderCaseText(c: AccCase){
  const header = `Target: ${c.target||'-'}\nIssue: ${c.issue}\nUpdated: ${new Date(c.updatedAt).toLocaleString()}\n`;
  const events = (c.events||[]).map(e=>`\n[${new Date(e.ts).toLocaleString()}] ${e.type.toUpperCase()}\n${e.text}`).join('\n');
  return `${header}\nEvents:${events || '\n(none)'}\n`;
}

function promptEdit(defaultText: string): string | null {
  // Placeholder: real UI should use a modal input
  return defaultText;
}
function confirmDelete(): boolean { return true; }

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    meta: { color: palette.text, opacity: 0.8, marginTop: 4 },
    issue: { color: palette.text, marginTop: 8 },
    section: { marginTop: 16 },
    sectionTitle: { color: palette.text, fontWeight: '700', marginBottom: 8 },
    eventRow: { paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.muted },
    eventMeta: { color: palette.text, opacity: 0.8, fontSize: 12 },
    eventText: { color: palette.text, marginTop: 4 },
    input: { minHeight: 80, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 10, color: palette.text, backgroundColor: palette.surface },
    button: { marginTop: 8, backgroundColor: palette.primary, borderRadius: 8, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
    buttonText: { color: palette.onPrimary, fontWeight: '600' },
    secondaryBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
    secondaryBtnText: { color: palette.text, fontWeight: '600' },
    linkBtn: { paddingHorizontal: 8, paddingVertical: 4 },
    linkBtnText: { color: palette.primary, fontWeight: '600' },
  });
}
