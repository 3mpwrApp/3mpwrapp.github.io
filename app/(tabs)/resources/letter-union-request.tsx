import * as Clipboard from "expo-clipboard";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import LetterActionsBar from "../../../components/letters/LetterActionsBar";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { logEvent } from "../../../services/analytics";
import { buildSymptomSummary } from "../../../services/insights";
import { useProfileLocal } from "../../../store/profileLocal";
import { useTextScale } from "../../../theme/typography";
import { useAppPalette } from "../../../theme/usePalette";

export const options = { href: null };

export default function UnionRequestLetter() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t("templates.letters.union.title","Union Representation/Request Letter"));
  useFocusOnRefOnMount(titleRef);
  const { profile } = useProfileLocal();
  const [name, setName] = React.useState(profile.name ?? "");
  const [position, setPosition] = React.useState("");
  const [workplace, setWorkplace] = React.useState("");
  const [issue, setIssue] = React.useState("");
  const [accommodation, setAccommodation] = React.useState("");
  const [evidence, setEvidence] = React.useState("");
  const [contact, setContact] = React.useState(profile.contact ?? "");
  const [showInfo, setShowInfo] = React.useState(false);
  const preview = React.useMemo(() => (
    `Re: Request for Union Support and Representation\n\n` +
    `Dear Union Representative/Steward,\n\n` +
    `My name is ${name || "[Your Name]"}, employed as ${position || "[Position]"} at ${workplace || "[Workplace]"}. ` +
    `I am requesting union support and representation regarding the following issue: ${issue || "[briefly describe issue]"}.\n\n` +
    (accommodation ? `I am requesting the following accommodations or remedies: ${accommodation}.\n\n` : "") +
    (evidence ? `I can provide supporting documentation, including: ${evidence}.\n\n` : "") +
    `Please advise next steps and any information you require.\n\n` +
    `Sincerely,\n${name || "[Your Name]"}\n${contact || "[Phone/Email]"}`
  ), [name, position, workplace, issue, accommodation, evidence, contact]);
  const placeholderColor = palette.text + "88";
  const copyLetter = async () => { try { await Clipboard.setStringAsync(preview); Alert.alert(t("templates.letters.common.copied","Copied"), t("templates.letters.common.copiedBody","Letter copied to clipboard.")); } catch { Alert.alert(t("templates.letters.common.clipboardNA","Clipboard not available"), t("templates.letters.common.clipboardNABody","Install expo-clipboard in a dev build to enable copy.")); } };
  const exportPdf = async () => { try { const mod = await import("expo-print"); const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${preview.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre>`; const { uri } = await mod.printToFileAsync({ html }); const Share = await import("expo-sharing").catch(()=>null); if (Share?.isAvailableAsync) { if (await Share.isAvailableAsync()) await Share.shareAsync(uri); else Alert.alert(t("templates.letters.common.shareUnavailable","Share unavailable"), t("templates.letters.common.shareUnavailableBody","System share sheet not available.")); } } catch { Alert.alert(t("templates.letters.common.pdfNA","PDF not available"), t("templates.letters.common.pdfNABody","Install expo-print in a dev build to export PDFs.")); } };
  const exportDoc = async () => { try { const FS = await import("expo-file-system"); const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${preview.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre></body></html>`; const path = FS.cacheDirectory + `union_request_${Date.now()}.doc`; await FS.writeAsStringAsync(path, html, { encoding: FS.EncodingType.UTF8 }); const Share = await import("expo-sharing").catch(()=>null); if (Share?.isAvailableAsync) { if (await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t("templates.letters.common.shareUnavailable","Share unavailable"), t("templates.letters.common.shareUnavailableBody","System share sheet not available.")); } } catch { Alert.alert(t("templates.letters.common.exportFailed","Export failed"), t("templates.letters.common.exportFailedBody","Could not create file.")); } };
  const insertTrackers = async () => { const ins = await buildSymptomSummary(); logEvent("letter_insert_from_trackers", { type: "union" }); setEvidence(p=> (p? p+"\n\n":"")+ins); };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }} accessibilityLabel={t("templates.letters.union.screenLabel","Union request letter screen")}>      
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("templates.letters.union.title","Union Representation/Request Letter")}</Text>
      <LetterActionsBar
        showInfo={showInfo}
        onToggleInfo={() => setShowInfo(v=>!v)}
        onCopy={copyLetter}
        onInsertTrackers={insertTrackers}
        onExportPdf={exportPdf}
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
      <Field label={t("templates.letters.union.name","Your Name")} value={name} onChangeText={setName} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.union.position","Position/Role")} value={position} onChangeText={setPosition} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.union.workplace","Workplace/Department")} value={workplace} onChangeText={setWorkplace} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.union.issue","Issue Summary")} value={issue} onChangeText={setIssue} multiline placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.union.accommodation","Requested Accommodation/Remedy")} value={accommodation} onChangeText={setAccommodation} multiline placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.union.evidence","Evidence/Docs (optional)")} value={evidence} onChangeText={setEvidence} multiline placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.union.contact","Contact (email/phone)")} value={contact} onChangeText={setContact} placeholderColor={placeholderColor} />
      <Text style={[s.sectionTitle,{ marginTop:12 }]}>{t("common.preview","Preview")}</Text>
      <View style={s.previewBox}><Text style={s.previewText}>{preview}</Text></View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholderColor,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholderColor: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: "#000", opacity: 0.9, marginBottom: 4 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: "#000",
          minHeight: 44,
        }}
        placeholder={label}
        placeholderTextColor={placeholderColor}
        multiline={multiline}
      />
    </View>
  );
}

function createStyles(palette: any, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    sectionTitle: { color: palette.text, fontWeight: "700" },
    previewBox: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginBottom: 12 },
    previewText: { color: palette.text, opacity: 0.95, lineHeight: 20 },
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
