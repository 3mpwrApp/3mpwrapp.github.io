import * as Clipboard from "expo-clipboard";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import LetterActionsBar from "../../../components/letters/LetterActionsBar";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { buildSymptomSummary } from "../../../services/insights";
import { useProfileLocal } from "../../../store/profileLocal";
import { useAppPalette } from "../../../theme/usePalette";

 
const { trackEvent } = require("../../../services/analyticsClient");

export const options = { href: null };

export default function RTWPlanLetter() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t("templates.letters.rtw.title","Return-to-Work Plan"));
  useFocusOnRefOnMount(titleRef);
  const { profile } = useProfileLocal();
  const [name, setName] = React.useState(profile.name ?? "");
  const [employer, setEmployer] = React.useState("");
  const [duties, setDuties] = React.useState("");
  const [accom, setAccom] = React.useState("");
  const [date, setDate] = React.useState("");
  const [showInfo, setShowInfo] = React.useState(false);
  const preview = `Date: ${date || new Date().toLocaleDateString()}\n\n${employer || "[Employer]"}\nRe: Return-to-Work Plan\n\nDear ${employer || "Employer"},\n\nI propose a staged return to work with the following duties: ${duties || "[duties]"} and accommodations: ${accom || "[accommodations]"}.\n\nSincerely,\n${name || "[Your Name]"}`;
  const placeholder = palette.text + '77';
  const copyLetter = async () => { try { await Clipboard.setStringAsync(preview); Alert.alert(t("templates.letters.common.copied","Copied"), t("templates.letters.common.copiedBody","Letter copied to clipboard.")); } catch { Alert.alert(t("templates.letters.common.clipboardNA","Clipboard not available"), t("templates.letters.common.clipboardNABody","Install expo-clipboard in a dev build to enable copy.")); } };
  const exportDoc = async () => { try { const FS: any = await import("expo-file-system"); const cacheDir: string = (FS && (FS.cacheDirectory || FS.default?.cacheDirectory)) || ""; const writeFn = FS?.writeAsStringAsync || FS?.default?.writeAsStringAsync; const encodingType = FS?.EncodingType?.UTF8 || FS?.default?.EncodingType?.UTF8; if (!cacheDir || !writeFn || !encodingType) throw new Error("fs module incomplete"); const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${preview.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre></body></html>`; const path = cacheDir + `rtw_plan_${Date.now()}.doc`; await writeFn(path, html, { encoding: encodingType }); const Share = await import("expo-sharing").catch(()=>null); if (Share?.isAvailableAsync) { if (await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t("templates.letters.common.shareUnavailable","Share unavailable"), t("templates.letters.common.shareUnavailableBody","System share sheet not available.")); } } catch { Alert.alert(t("templates.letters.common.exportFailed","Export failed"), t("templates.letters.common.exportFailedBody","Could not create file.")); } };
  const insertTrackers = async () => { const ins = await buildSymptomSummary(); try { trackEvent("letter_insert_from_trackers", { type: "rtw" }); } catch {} setAccom(p=> (p? p+"\n\n":"")+ins); };
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:20 }} accessibilityLabel={t("templates.letters.rtw.screenLabel","Return to work plan letter screen")}>      
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("templates.letters.rtw.title","Return-to-Work Plan")}</Text>
      <LetterActionsBar
        showInfo={showInfo}
        onToggleInfo={() => setShowInfo(v=>!v)}
        onCopy={copyLetter}
        onInsertTrackers={insertTrackers}
        onExportDoc={exportDoc}
        palette={palette}
      />
      {showInfo && (
        <View style={s.infoCard} accessibilityRole="summary">
          <Text style={s.infoTitle}>{t("templates.letters.common.infoTitle","How to Use")}</Text>
          <Text style={s.infoLine}>{t("templates.letters.common.infoLine1","Fill in the fields below; placeholders will update live.")}</Text>
          <Text style={s.infoLine}>{t("templates.letters.common.infoLine2","You can copy, share, export, or insert into your Evidence Locker.")}</Text>
          <Text style={s.infoLine}>{t("templates.letters.common.infoLine3","Adapt wording to your facts; this is not legal advice.")}</Text>
        </View>
      )}
      <TextInput placeholder={t("templates.letters.rtw.name","Your name")} placeholderTextColor={placeholder} value={name} onChangeText={setName} style={s.input} />
      <TextInput placeholder={t("templates.letters.rtw.employer","Employer")} placeholderTextColor={placeholder} value={employer} onChangeText={setEmployer} style={s.input} />
      <TextInput placeholder={t("templates.letters.rtw.duties","Proposed duties")} placeholderTextColor={placeholder} value={duties} onChangeText={setDuties} style={s.input} />
      <TextInput placeholder={t("templates.letters.rtw.accommodations","Accommodations")} placeholderTextColor={placeholder} value={accom} onChangeText={setAccom} style={s.input} />
      <TextInput placeholder={t("templates.letters.rtw.date","Date")} placeholderTextColor={placeholder} value={date} onChangeText={setDate} style={s.input} />
      <View style={s.preview}><Text style={{ color: palette.text }}>{preview}</Text></View>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 20, fontWeight: "700", color: palette.text, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: palette.text, marginBottom: 8 },
    preview: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8 },
    actionsRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:12 },
    infoBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
    infoBtnText: { color: palette.text, fontWeight: '600', fontSize: 13 },
    secondaryBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
    secondaryBtnText: { color: palette.text, fontWeight: '600' },
    infoCard: { backgroundColor: palette.card, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: palette.muted, marginBottom: 12 },
    infoTitle: { fontWeight: '700', color: palette.text, marginBottom: 4 },
    infoLine: { color: palette.text, opacity: 0.85, marginBottom: 2, fontSize: 13 },
  });
}
