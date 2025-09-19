import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, AccessibilityInfo } from "react-native";
import * as Clipboard from "expo-clipboard";
import A11yPressable from "../../../components/A11yPressable";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useProfileLocal } from "../../../store/profileLocal";
import { buildCombinedEvidenceSummary } from "../../../services/insights";
import { logEvent } from "../../../services/analytics";
import { useTranslation } from "../../../i18n";

export const options = { href: null };

export default function AppealLetter() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t("templates.letters.appeal.title","Appeal Letter"));
  useFocusOnRefOnMount(titleRef);
  const { profile } = useProfileLocal();
  const [name, setName] = React.useState(profile.name ?? "");
  const [claim, setClaim] = React.useState("");
  const [decisionDate, setDecisionDate] = React.useState("");
  const [reasons, setReasons] = React.useState("");
  const [appealArgs, setAppealArgs] = React.useState("");
  const [contact, setContact] = React.useState(profile.contact ?? "");
  const [showInfo, setShowInfo] = React.useState(false);
  const placeholderColor = palette.text + "88";
  const preview = React.useMemo(() => (
    `Re: Appeal of Decision (Claim ${claim || "[number]"})\n\n` +
    `Dear Appeals Officer,\n\n` +
    `I am appealing the decision dated ${decisionDate || "[date]"} regarding my workers' compensation/disability claim. ` +
    `The decision states: ${reasons || "[summarize reasons]"}. I believe this is incorrect because: ${appealArgs || "[state key arguments and evidence]"}.\n\n` +
    `I request that this decision be reconsidered and overturned. I can provide any additional documentation required. Please confirm receipt of this appeal and advise of next steps.\n\n` +
    `Sincerely,\n${name || "[Your Name]"}\n${contact || "[Phone/Email]"}`
  ), [claim, decisionDate, reasons, appealArgs, name, contact]);

  const copyLetter = async () => { try { await Clipboard.setStringAsync(preview); Alert.alert(t("templates.letters.common.copied","Copied"), t("templates.letters.common.copiedBody","Letter copied to clipboard.")); } catch { Alert.alert(t("templates.letters.common.clipboardNA","Clipboard not available"), t("templates.letters.common.clipboardNABody","Install expo-clipboard in a dev build to enable copy.")); } };
  const insertTrackers = async () => { const ins = await buildCombinedEvidenceSummary(); logEvent("letter_insert_from_trackers", { type: "appeal" }); setAppealArgs(p=> (p? p+"\n\n":"")+ins); };
  const exportPdf = async () => { try { const mod = await import("expo-print"); const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${preview.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre>`; const { uri } = await mod.printToFileAsync({ html }); const Share = await import("expo-sharing").catch(()=>null); if (Share?.isAvailableAsync) { if (await Share.isAvailableAsync()) await Share.shareAsync(uri); else Alert.alert(t("templates.letters.common.shareUnavailable","Share unavailable"), t("templates.letters.common.shareUnavailableBody","System share sheet not available.")); } } catch { Alert.alert(t("templates.letters.common.pdfNA","PDF not available"), t("templates.letters.common.pdfNABody","Install expo-print in a dev build to export PDFs.")); } };
  const exportDoc = async () => { try { const FS = await import("expo-file-system"); const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${preview.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre></body></html>`; const path = FS.cacheDirectory + `appeal_${Date.now()}.doc`; await FS.writeAsStringAsync(path, html, { encoding: FS.EncodingType.UTF8 }); const Share = await import("expo-sharing").catch(()=>null); if (Share?.isAvailableAsync) { if (await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t("templates.letters.common.shareUnavailable","Share unavailable"), t("templates.letters.common.shareUnavailableBody","System share sheet not available.")); } } catch { Alert.alert(t("templates.letters.common.exportFailed","Export failed"), t("templates.letters.common.exportFailedBody","Could not create file.")); } };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }} accessibilityLabel={t("templates.letters.appeal.screenLabel","Appeal letter screen")}>      
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("templates.letters.appeal.title","Appeal Letter")}</Text>
      <View style={s.actionsRow}>
        <A11yPressable onPress={() => { setShowInfo(v=>!v); AccessibilityInfo.announceForAccessibility?.(showInfo ? t("common.hide","Hide") : t("templates.letters.common.toggleInfo","Toggle instructions")); }} style={s.infoBtn} accessibilityRole="button" accessibilityLabel={t("templates.letters.common.toggleInfo","Toggle instructions")}>
          <Text style={s.infoBtnText}>{showInfo ? t("common.hide","Hide") : t("common.show","Show")}</Text>
        </A11yPressable>
        <A11yPressable onPress={copyLetter} style={s.secondaryBtn} accessibilityRole="button" accessibilityLabel={t("templates.letters.common.copy","Copy")}> <Text style={s.secondaryBtnText}>{t("templates.letters.common.copy","Copy")}</Text></A11yPressable>
        <A11yPressable onPress={insertTrackers} style={s.secondaryBtn} accessibilityRole="button" accessibilityLabel={t("templates.letters.common.insertTrackers","Insert from trackers")}> <Text style={s.secondaryBtnText}>{t("templates.letters.common.insertTrackers","Insert from trackers")}</Text></A11yPressable>
        <A11yPressable onPress={exportPdf} style={s.secondaryBtn} accessibilityRole="button" accessibilityLabel={t("templates.letters.common.exportPdf","Export as PDF")}> <Text style={s.secondaryBtnText}>{t("templates.letters.common.exportPdf","Export as PDF")}</Text></A11yPressable>
        <A11yPressable onPress={exportDoc} style={s.secondaryBtn} accessibilityRole="button" accessibilityLabel={t("templates.letters.common.exportDoc","Export as .doc")}> <Text style={s.secondaryBtnText}>{t("templates.letters.common.exportDoc","Export as .doc")}</Text></A11yPressable>
      </View>
      {showInfo && (
        <View style={s.infoCard} accessibilityRole="summary">
          <Text style={s.infoTitle}>{t("templates.letters.common.infoTitle","How to Use")}</Text>
          <Text style={s.infoLine}>{t("templates.letters.common.infoLine1","Fill in the fields below; placeholders will update live.")}</Text>
          <Text style={s.infoLine}>{t("templates.letters.common.infoLine2","You can copy, share, export, or insert into your Evidence Locker.")}</Text>
          <Text style={s.infoLine}>{t("templates.letters.common.infoLine3","Adapt wording to your facts; this is not legal advice.")}</Text>
        </View>
      )}
      <Text style={s.subtitle}>{t("templates.letters.appeal.subtitle","Fill in your details, review the preview, then share or export.")}</Text>
      <Field label={t("templates.letters.appeal.title","Your Name")} value={name} onChangeText={setName} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.appeal.claim","Claim Number")} value={claim} onChangeText={setClaim} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.appeal.decisionDate","Decision Date")} value={decisionDate} onChangeText={setDecisionDate} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.appeal.decisionSummary","Decision Summary")} value={reasons} onChangeText={setReasons} multiline placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.appeal.arguments","Your Arguments/Evidence")} value={appealArgs} onChangeText={setAppealArgs} multiline placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.appeal.contact","Contact (email/phone)")} value={contact} onChangeText={setContact} placeholderColor={placeholderColor} />
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
    actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    infoBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
    infoBtnText: { color: palette.text, fontWeight: '600', fontSize: 13 },
    secondaryBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
    secondaryBtnText: { color: palette.text, fontWeight: '600' },
    infoCard: { backgroundColor: palette.card, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: palette.muted, marginBottom: 12 },
    infoTitle: { fontWeight: '700', color: palette.text, marginBottom: 4 },
    infoLine: { color: palette.text, opacity: 0.85, marginBottom: 2, fontSize: 13 },
  });
}
