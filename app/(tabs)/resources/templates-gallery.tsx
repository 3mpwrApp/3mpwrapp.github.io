import React from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import A11yPressable from "../../../components/A11yPressable";
let AsyncStorage: any;
try { AsyncStorage = require("@react-native-async-storage/async-storage").default; } catch {}
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

const EXAMPLES = [
  {
    title: "Accommodation Request (Sample)",
    body: "Re: Workplace Accommodation Request\n\nDear Employer,\n\nI am requesting reasonable accommodations...",
  },
  {
    title: "Appeal Letter (Sample)",
    body: "Re: Appeal of Decision (Claim [number])\n\nDear Appeals Officer,\n\nI am appealing the decision dated [date]...",
  },
  {
    title: "Reconsideration Letter (Sample)",
    body: "Re: Request for Reconsideration (Claim [ID])\n\nDear Claims Officer,\n\nI am requesting reconsideration...",
  },
  {
    title: "Union Request (Sample)",
    body: "Re: Request for Union Support and Representation\n\nDear Union Representative/Steward,\n\nMy name is [Your Name], employed as...",
  },
];

export const options = { href: null };

export default function TemplatesGallery() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Template Gallery");
  useFocusOnRefOnMount(titleRef);
  const { useProfileLocal } = require("../../../store/profileLocal");
  const { profile } = useProfileLocal();

  const copy = async (text: string) => {
    try {
      const mod = await import("expo-clipboard");
      await mod.setStringAsync(text);
    } catch {}
  };

  const [vars, setVars] = React.useState({ name: "", contact: "", province: "", claim: "", date: "" });
  React.useEffect(() => {
    setVars((v) => ({
      ...v,
      name: profile?.name || v.name,
      contact: profile?.contact || v.contact,
      province: profile?.province || v.province,
    }));
  }, [profile?.name, profile?.contact, profile?.province]);
  const applyVars = (body: string) =>
    body
      .replaceAll("[Your Name]", vars.name || "[Your Name]")
      .replaceAll("[Name]", vars.name || "[Name]")
      .replaceAll("[Contact]", vars.contact || "[Contact]")
      .replaceAll("[Province]", vars.province || "[Province]")
      .replaceAll("[Claim ID]", vars.claim || "[Claim ID]")
      .replaceAll("[date]", vars.date || "[date]");

  const saveDraft = async (title: string, body: string) => {
    try {
      const key = "templates:drafts";
      const raw = (await AsyncStorage?.getItem?.(key)) || "[]";
      const arr = JSON.parse(raw);
      arr.unshift({ id: String(Date.now()), title, body, vars });
      await AsyncStorage?.setItem?.(key, JSON.stringify(arr));
      Alert.alert("Saved", "Draft saved locally");
    } catch {}
  };

  const [drafts, setDrafts] = React.useState<any[]>([]);
  React.useEffect(() => {
    (async () => {
      try { const raw = await AsyncStorage?.getItem?.("templates:drafts"); if (raw) setDrafts(JSON.parse(raw)); } catch {}
    })();
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Template Gallery
      </Text>
      <Text style={s.subtitle}>Example outputs to help you get started.</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <TextInput style={s.input} placeholder="Your name" value={vars.name} onChangeText={(v)=>setVars({ ...vars, name: v })} />
        <TextInput style={s.input} placeholder="Contact" value={vars.contact} onChangeText={(v)=>setVars({ ...vars, contact: v })} />
        <TextInput style={s.input} placeholder="Province (e.g., ON)" value={vars.province} onChangeText={(v)=>setVars({ ...vars, province: v })} />
        <TextInput style={s.input} placeholder="Claim ID" value={vars.claim} onChangeText={(v)=>setVars({ ...vars, claim: v })} />
        <TextInput style={s.input} placeholder="date (YYYY-MM-DD)" value={vars.date} onChangeText={(v)=>setVars({ ...vars, date: v })} />
      </View>
      {EXAMPLES.map((ex) => (
        <View key={ex.title} style={s.card}>
          <Text style={s.cardTitle}>{ex.title}</Text>
          <Text style={s.cardText}>{applyVars(ex.body)}</Text>
          <A11yPressable onPress={() => copy(applyVars(ex.body))} style={s.button}>
            <Text style={s.buttonText}>Copy example</Text>
          </A11yPressable>
          <A11yPressable onPress={() => saveDraft(ex.title, applyVars(ex.body))} style={[s.button,{ marginTop: 8 }]}>
            <Text style={s.buttonText}>Save draft</Text>
          </A11yPressable>
          <A11yPressable
            onPress={async () => {
              try {
                const body = applyVars(ex.body);
                const FS = await import("expo-file-system");
                const p = FS.cacheDirectory + `letter_${Date.now()}.txt`;
                await FS.writeAsStringAsync(p, body);
                try { const Share = await import("expo-sharing"); if (await Share.isAvailableAsync()) await Share.shareAsync(p); else Alert.alert('Saved','File saved to cache.'); } catch { Alert.alert('Saved','File saved to cache.'); }
              } catch { Alert.alert('Share failed','Unable to create file.'); }
            }}
            style={[s.secondary,{ marginTop: 8 }]}
          >
            <Text style={s.secondaryText}>Share</Text>
          </A11yPressable>
          <A11yPressable
            onPress={async () => {
              try {
                const note = { id: String(Date.now()), text: applyVars(ex.body), date: new Date().toISOString(), tags: ['letter'] };
                const raw = (await AsyncStorage?.getItem?.('evidence:notes:v1')) || '[]';
                const arr = JSON.parse(raw);
                arr.unshift(note);
                await AsyncStorage?.setItem?.('evidence:notes:v1', JSON.stringify(arr));
                Alert.alert('Added', 'Inserted into Evidence Locker.');
              } catch { Alert.alert('Not added','Unable to add to Evidence Locker.'); }
            }}
            style={[s.secondary,{ marginTop: 8 }]}
          >
            <Text style={s.secondaryText}>Insert into Evidence Locker</Text>
          </A11yPressable>
        </View>
      ))}
      {drafts.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Drafts</Text>
          {drafts.map((d)=> (
            <View key={d.id} style={{ marginBottom: 10 }}>
              <Text style={s.cardTitle}>{d.title}</Text>
              <Text style={s.cardText}>{d.body}</Text>
              <View style={{ flexDirection:'row', gap:8 }}>
                <A11yPressable onPress={async()=>{ try { const arr = drafts.filter(x=>x.id!==d.id); setDrafts(arr); await AsyncStorage?.setItem?.('templates:drafts', JSON.stringify(arr)); } catch {} }} style={s.secondary}><Text style={s.secondaryText}>Delete</Text></A11yPressable>
                <A11yPressable onPress={async()=>{ try { const body = d.body; const FS = await import('expo-file-system'); const p = FS.cacheDirectory + `draft_${Date.now()}.txt`; await FS.writeAsStringAsync(p, body); const Share = await import('expo-sharing'); if (await Share.isAvailableAsync()) await Share.shareAsync(p); else Alert.alert('Saved','Draft saved to cache.'); } catch {} }} style={s.secondary}><Text style={s.secondaryText}>Share</Text></A11yPressable>
                <A11yPressable onPress={async()=>{ try { const note = { id: String(Date.now()), text: d.body, date: new Date().toISOString(), tags: ['letter'] }; const raw = (await AsyncStorage?.getItem?.('evidence:notes:v1')) || '[]'; const arr = JSON.parse(raw); arr.unshift(note); await AsyncStorage?.setItem?.('evidence:notes:v1', JSON.stringify(arr)); Alert.alert('Added','Inserted into Evidence Locker.'); } catch {} }} style={s.secondary}><Text style={s.secondaryText}>To Locker</Text></A11yPressable>
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
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      backgroundColor: palette.surface,
    },
    cardTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 8 },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      color: palette.text,
      minWidth: 120,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    secondary: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    secondaryText: { color: palette.text, fontWeight: '700' },
  });
}
