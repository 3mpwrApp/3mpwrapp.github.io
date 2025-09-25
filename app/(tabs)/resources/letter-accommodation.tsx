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

export default function AccommodationLetter() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t("templates.letters.accommodation.title","Accommodation Request"));
  useFocusOnRefOnMount(titleRef);
  const { profile } = useProfileLocal();
  const [name, setName] = React.useState(profile.name ?? "");
  const [employer, setEmployer] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [limitations, setLimitations] = React.useState("");
  const [accom, setAccom] = React.useState("");
  const [date, setDate] = React.useState("");
  const [showInfo, setShowInfo] = React.useState(false);

  const preview = React.useMemo(() => (
    `Date: ${date || new Date().toLocaleDateString()}\n\n` +
    `${employer || "[Employer Name]"}\n` +
    `Re: Workplace Accommodation Request\n\n` +
    `Dear ${employer || "Employer"},\n\n` +
    `I am writing to request reasonable workplace accommodations under applicable human rights and accessibility laws. I am employed as ${jobTitle || "[Job Title]"}. Due to disability-related limitations (${limitations || "[briefly describe limitations]"}), I am requesting the following accommodations: ${accom || "[list requested accommodations]"}.\n\n` +
    `These accommodations will help me perform the essential duties of my role. I would welcome a discussion to explore options and provide any supporting documentation if needed.\n\n` +
    `Sincerely,\n${name || "[Your Name]"}`
  ), [date, employer, jobTitle, limitations, accom, name]);

  const placeholderColor = palette.text + "88";

  const copyLetter = async () => {
    try { await Clipboard.setStringAsync(preview); Alert.alert(t("templates.letters.common.copied","Copied"), t("templates.letters.common.copiedBody","Letter copied to clipboard.")); }
    catch { Alert.alert(t("templates.letters.common.clipboardNA","Clipboard not available"), t("templates.letters.common.clipboardNABody","Install expo-clipboard in a dev build to enable copy.")); }
  };

  const exportPdf = async () => {
    try {
      const mod = await import("expo-print");
      const html = `<pre style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;">${preview.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre>`;
      const { uri } = await mod.printToFileAsync({ html });
      const Share = await import("expo-sharing").catch(()=>null);
      if (Share?.isAvailableAsync) {
        if (await Share.isAvailableAsync()) await Share.shareAsync(uri); else Alert.alert(t("templates.letters.common.shareUnavailable","Share unavailable"), t("templates.letters.common.shareUnavailableBody","System share sheet not available."));
      }
    } catch { Alert.alert(t("templates.letters.common.pdfNA","PDF not available"), t("templates.letters.common.pdfNABody","Install expo-print in a dev build to export PDFs.")); }
  };

  const exportDoc = async () => {
    try {
    const FSmod: any = await import("expo-file-system");
    const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${preview.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre></body></html>`;
    const cacheDir: string = (FSmod && (FSmod.cacheDirectory || FSmod.default?.cacheDirectory)) || "";
    const writeFn = FSmod?.writeAsStringAsync || FSmod?.default?.writeAsStringAsync;
    const encodingType = FSmod?.EncodingType?.UTF8 || FSmod?.default?.EncodingType?.UTF8;
    if (!cacheDir || !writeFn || !encodingType) throw new Error("fs module incomplete");
    const path = cacheDir + `accommodation_${Date.now()}.doc`;
    await writeFn(path, html, { encoding: encodingType });
      const Share = await import("expo-sharing").catch(()=>null);
      if (Share?.isAvailableAsync) {
        if (await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t("templates.letters.common.shareUnavailable","Share unavailable"), t("templates.letters.common.shareUnavailableBody","System share sheet not available."));
      }
    } catch { Alert.alert(t("templates.letters.common.exportFailed","Export failed"), t("templates.letters.common.exportFailedBody","Could not create file.")); }
  };

  const insertFromTrackers = async () => {
    const ins = await buildSymptomSummary();
  try { trackEvent("letter_insert_from_trackers", { type: "accommodation" }); } catch {}
    setLimitations(p => (p ? p + "\n\n" : "") + ins);
    Alert.alert(t("templates.letters.common.inserted","Added"), t("templates.letters.common.insertedBody","Inserted into Evidence Locker."));
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }} accessibilityLabel={t("templates.letters.accommodation.screenLabel","Accommodation letter screen")}>      
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("templates.letters.accommodation.title","Accommodation Request")}</Text>
      <LetterActionsBar
        showInfo={showInfo}
        onToggleInfo={() => setShowInfo(v=>!v)}
        onCopy={copyLetter}
        onInsertTrackers={insertFromTrackers}
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
      <Text style={s.subtitle}>{t("templates.letters.accommodation.subtitle","Fill in your details, review the preview, then share or copy.")}</Text>
      <Field label={t("templates.letters.accommodation.title","Your Name")} value={name} onChangeText={setName} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.accommodation.employer","Employer")} value={employer} onChangeText={setEmployer} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.accommodation.jobTitle","Job Title")} value={jobTitle} onChangeText={setJobTitle} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.accommodation.date","Date (optional)")} value={date} onChangeText={setDate} placeholderColor={placeholderColor} />
      <Field label={t("templates.letters.accommodation.limitations","Limitations (brief)")} value={limitations} onChangeText={setLimitations} placeholderColor={placeholderColor} multiline />
      <Field label={t("templates.letters.accommodation.accommodations","Requested Accommodations")} value={accom} onChangeText={setAccom} placeholderColor={placeholderColor} multiline />
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

function createStyles(palette: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
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
