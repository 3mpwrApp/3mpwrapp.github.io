// Clipboard is imported dynamically where used to avoid crashing dev clients without the native module.
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { MAX_FONT_SCALE, useAnnounceOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useAppPalette } from "../../../theme/usePalette";
import { announce } from '../../../utils/announce';
let AsyncStorage: any; try { AsyncStorage = require("@react-native-async-storage/async-storage").default; } catch {}

const EXAMPLES = [
  { title: "Accommodation Request (Sample)", body: "Re: Workplace Accommodation Request\n\nDear Employer,\n\nI am requesting reasonable accommodations..." },
  { title: "Appeal Letter (Sample)", body: "Re: Appeal of Decision (Claim [number])\n\nDear Appeals Officer,\n\nI am appealing the decision dated [date]..." },
  { title: "Reconsideration Letter (Sample)", body: "Re: Request for Reconsideration (Claim [ID])\n\nDear Claims Officer,\n\nI am requesting reconsideration..." },
  { title: "Union Request (Sample)", body: "Re: Request for Union Support and Representation\n\nDear Union Representative/Steward,\n\nMy name is [Your Name], employed as..." },
];

export const options = { href: null };

export default function TemplatesGallery() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t("templates.gallery.title", "Template Gallery"));

  const [showInfo, setShowInfo] = React.useState(false);
  const [vars, setVars] = React.useState({ name: "", contact: "", province: "", claim: "", date: "" });
  const [drafts, setDrafts] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try { const raw = await AsyncStorage?.getItem?.("templates:drafts"); if (raw) setDrafts(JSON.parse(raw)); } catch {}
    })();
  }, []);

  const applyVars = (body: string) =>
    body
      .replaceAll("[Your Name]", vars.name || "[Your Name]")
      .replaceAll("[name]", vars.name || "[name]")
      .replaceAll("[Contact]", vars.contact || "[Contact]")
      .replaceAll("[Province]", vars.province || "[Province]")
      .replaceAll("[Claim]", vars.claim || "[Claim]")
      .replaceAll("[number]", vars.claim || "[number]")
      .replaceAll("[ID]", vars.claim || "[ID]")
      .replaceAll("[date]", vars.date || "[date]");

  const copyText = async (text: string) => {
    try { const Clipboard = await import("expo-clipboard"); await Clipboard.setStringAsync(text); announce("Copied"); } catch {}
  };

  const saveDraft = async (title: string, body: string) => {
    try {
      const key = "templates:drafts";
      const raw = (await AsyncStorage?.getItem?.(key)) || "[]";
      const arr = JSON.parse(raw);
      arr.unshift({ id: String(Date.now()), title, body, vars });
      await AsyncStorage?.setItem?.(key, JSON.stringify(arr.slice(0, 50)));
      setDrafts(arr.slice(0, 50));
  announce("Draft saved");
    } catch {}
  };

  const shareText = async (title: string, body: string) => {
    try {
      const FS = await import("expo-file-system");
      const path = FS.cacheDirectory + `${title.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, body);
      try {
        const Share = await import("expo-sharing");
        if (await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t("templates.gallery.shareUnavailable","Share unavailable"), t("templates.gallery.shareUnavailableBody","System share sheet not available."));
      } catch { Alert.alert(t("templates.gallery.shareError","Share failed"), t("templates.gallery.shareErrorBody","Could not share templates file.")); }
    } catch { Alert.alert(t("templates.gallery.shareError","Share failed"), t("templates.gallery.shareErrorBody","Could not share templates file.")); }
  };

  const insertIntoLocker = async (body: string) => {
    try {
      const note = { id: String(Date.now()), text: body, date: new Date().toISOString(), tags: ["letter"] };
      const raw = (await AsyncStorage?.getItem?.("evidence:notes:v1")) || "[]";
      const arr = JSON.parse(raw); arr.unshift(note);
      await AsyncStorage?.setItem?.("evidence:notes:v1", JSON.stringify(arr.slice(0, 400)));
      Alert.alert(t("templates.gallery.inserted","Added"), t("templates.gallery.insertedBody","Inserted into Evidence Locker."));
    } catch { Alert.alert(t("templates.gallery.insertFailed","Not added"), t("templates.gallery.insertFailedBody","Unable to add to Evidence Locker.")); }
  };

  const exportAll = async () => {
    try {
      const all = EXAMPLES.map(ex => `# ${ex.title}\n\n${applyVars(ex.body)}`).join("\n\n---\n\n");
      const FS = await import("expo-file-system");
      const path = FS.cacheDirectory + `all_templates_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, all);
      try {
        const Share = await import("expo-sharing");
        if (await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t("templates.gallery.shareUnavailable","Share unavailable"), t("templates.gallery.shareUnavailableBody","System share sheet not available."));
      } catch { Alert.alert(t("templates.gallery.shareError","Share failed"), t("templates.gallery.shareErrorBody","Could not share templates file.")); }
    } catch { Alert.alert(t("templates.gallery.shareError","Share failed"), t("templates.gallery.shareErrorBody","Could not share templates file.")); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }} accessibilityLabel={t("templates.gallery.screenLabel","Templates gallery screen")}>      
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("templates.gallery.title","Template Gallery")}</Text>
      <DisclaimerBanner type="legal" compact />
      <View style={s.actionsRow}>
        <A11yPressable
          onPress={() => { setShowInfo(v => !v); announce(showInfo ? t("common.hide","Hide") : t("templates.gallery.toggleInfo","Toggle instructions")); }}
          style={s.infoBtn}
          accessibilityRole="button"
          accessibilityLabel={t("templates.gallery.toggleInfo","Toggle instructions")}
        >
          <Text style={s.infoBtnText}>{showInfo ? t("common.hide","Hide") : t("common.show","Show")}</Text>
        </A11yPressable>
        <A11yPressable
          onPress={exportAll}
          style={s.exportBtn}
          accessibilityRole="button"
          accessibilityLabel={t("templates.gallery.exportAllLabel","Export all templates")}
          accessibilityHint={t("templates.gallery.exportAllHint","Creates a text file with all templates.")}
        >
          <Text style={s.exportBtnText}>{t("templates.gallery.exportAll","Export All")}</Text>
        </A11yPressable>
      </View>
      {showInfo && (
        <View style={s.infoCard} accessibilityRole="summary" accessibilityLabel={t("templates.gallery.howToUse","How to use templates gallery")}>          
          <Text style={s.infoTitle}>{t("templates.gallery.infoTitle","How to Use")}</Text>
          <Text style={s.infoLine}>{t("templates.gallery.infoLine1","Fill in your details (name, claim, etc.) to auto‑populate placeholders.")}</Text>
          <Text style={s.infoLine}>{t("templates.gallery.infoLine2","Copy, save as draft, export, or insert into your Evidence Locker.")}</Text>
          <Text style={s.infoLine}>{t("templates.gallery.infoLine3","Adapt wording to your situation; this is not legal advice.")}</Text>
        </View>
      )}
      <Text style={s.subtitle}>{t("templates.gallery.subtitle","Example outputs to help you get started.")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <TextInput style={s.input} placeholder={t("templates.gallery.varName","Your name")} value={vars.name} onChangeText={v=>setVars({...vars,name:v})} />
        <TextInput style={s.input} placeholder={t("templates.gallery.varContact","Contact")} value={vars.contact} onChangeText={v=>setVars({...vars,contact:v})} />
        <TextInput style={s.input} placeholder={t("templates.gallery.varProvince","Province (e.g., ON)")} value={vars.province} onChangeText={v=>setVars({...vars,province:v})} />
        <TextInput style={s.input} placeholder={t("templates.gallery.varClaim","Claim ID")} value={vars.claim} onChangeText={v=>setVars({...vars,claim:v})} />
        <TextInput style={s.input} placeholder={t("templates.gallery.varDate","date (YYYY-MM-DD)")} value={vars.date} onChangeText={v=>setVars({...vars,date:v})} />
      </View>

      {EXAMPLES.map(ex => {
        const body = applyVars(ex.body);
        return (
          <View key={ex.title} style={s.card}>
            <Text style={s.cardTitle}>{t(`templates.gallery.example.${ex.title}` as any, ex.title)}</Text>
            <Text style={s.cardText}>{body}</Text>
            <A11yPressable onPress={() => copyText(body)} style={s.button} accessibilityRole="button" accessibilityLabel={t("templates.gallery.copyExample","Copy example")}> <Text style={s.buttonText}>{t("templates.gallery.copyExample","Copy example")}</Text></A11yPressable>
            <A11yPressable onPress={() => saveDraft(ex.title, body)} style={[s.secondary,{ marginTop: 8 }]} accessibilityRole="button" accessibilityLabel={t("templates.gallery.saveDraft","Save draft")}> <Text style={s.secondaryText}>{t("templates.gallery.saveDraft","Save draft")}</Text></A11yPressable>
            <A11yPressable onPress={() => shareText(ex.title, body)} style={[s.secondary,{ marginTop: 8 }]} accessibilityRole="button" accessibilityLabel={t("templates.gallery.shareLabel","Share template")}> <Text style={s.secondaryText}>{t("templates.gallery.share","Share")}</Text></A11yPressable>
            <A11yPressable onPress={() => insertIntoLocker(body)} style={[s.secondary,{ marginTop: 8 }]} accessibilityRole="button" accessibilityLabel={t("templates.gallery.insertLabel","Insert template into Evidence Locker")}> <Text style={s.secondaryText}>{t("templates.gallery.insert","Insert into Evidence Locker")}</Text></A11yPressable>
          </View>
        );
      })}

      {drafts.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>{t("templates.gallery.drafts","Drafts")}</Text>
          {drafts.map(d => (
            <View key={d.id} style={{ marginBottom: 10 }}>
              <Text style={s.cardTitle}>{d.title}</Text>
              <Text style={s.cardText}>{d.body}</Text>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
                <A11yPressable onPress={async()=>{ try { const arr = drafts.filter(x=>x.id!==d.id); setDrafts(arr); await AsyncStorage?.setItem?.('templates:drafts', JSON.stringify(arr)); } catch {} }} style={s.secondary} accessibilityRole="button" accessibilityLabel={t("templates.gallery.deleteDraft","Delete draft")}> <Text style={s.secondaryText}>{t("templates.gallery.delete","Delete")}</Text></A11yPressable>
                <A11yPressable onPress={()=>shareText(d.title,d.body)} style={s.secondary} accessibilityRole="button" accessibilityLabel={t("templates.gallery.shareDraft","Share draft")}> <Text style={s.secondaryText}>{t("templates.gallery.share","Share")}</Text></A11yPressable>
                <A11yPressable onPress={()=>insertIntoLocker(d.body)} style={s.secondary} accessibilityRole="button" accessibilityLabel={t("templates.gallery.toLocker","Add draft to Evidence Locker")}> <Text style={s.secondaryText}>{t("templates.gallery.toLockerShort","To Locker")}</Text></A11yPressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 8 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, color: palette.text, minWidth: 120 },
    button: { backgroundColor: palette.primary, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    secondary: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingVertical: 8, borderRadius: 8, alignItems: 'center', paddingHorizontal: 10 },
    secondaryText: { color: palette.text, fontWeight: '700' },
    actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 4 },
    infoBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
    infoBtnText: { color: palette.text, fontWeight: '600', fontSize: 13 },
    exportBtn: { backgroundColor: palette.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6 },
    exportBtnText: { color: palette.onPrimary, fontWeight: '700' },
    infoCard: { backgroundColor: palette.card, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: palette.muted, marginTop: 12, marginBottom: 4 },
    infoTitle: { fontWeight: '700', color: palette.text, marginBottom: 4 },
    infoLine: { color: palette.text, opacity: 0.85, marginBottom: 2, fontSize: 13 },
  });
}
