import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert, Platform } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import * as Notifier from "../../../services/notifications";
import { buildICS } from "../../../services/ics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { addEvent } from "../../../services/calendar";

export const options = { href: null };

type Benefit = "WCB" | "LTD" | "CPP-D";

export default function Deadlines() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Deadline Calculator");
  useFocusOnRefOnMount(titleRef);

  const [benefit, setBenefit] = React.useState<Benefit>("WCB");
  const [decisionDate, setDecisionDate] = React.useState<string>(new Date().toISOString().slice(0,10));
  const [result, setResult] = React.useState<string>("");

  const calc = () => {
    const d = new Date(decisionDate);
    if (isNaN(d.getTime())) { Alert.alert("Invalid date", "Enter as YYYY-MM-DD."); return; }
    const map: Record<Benefit, number> = { WCB: 30, LTD: 60, "CPP-D": 90 };
    const days = map[benefit];
    const due = new Date(d.getTime() + days*24*60*60*1000);
    setResult(`Benefit: ${benefit}\nDecision date: ${decisionDate}\nEstimated deadline: ${due.toISOString().slice(0,10)} (${days} days)\n\nDisclaimer: Deadlines vary by jurisdiction/plan. Confirm with your board/insurer and policy.\nConsider submitting earlier to allow for delays.`);
  };

  const remind = async () => {
    if (!result) return;
    try {
      const ok = await Notifier.setupAsync();
      if (!ok) throw new Error("perm");
      await Notifier.scheduleLocal(`Appeal deadline — ${benefit}`, `Check requirements before deadline.`);
      Alert.alert("Reminder set", Platform.OS === 'android' ? "See notification channel 'Default'." : "A local reminder was scheduled.");
    } catch {
      Alert.alert("Reminder unavailable", "Enable notifications or add to your calendar.");
    }
  };

  const exportICS = async () => {
    if (!result) return;
    try {
      const d = new Date(decisionDate);
      const map: Record<Benefit, number> = { WCB: 30, LTD: 60, "CPP-D": 90 };
      const due = new Date(d.getTime() + map[benefit]*86400000);
      const ics = buildICS({ title: `Appeal deadline — ${benefit}`, description: result, startISO: due.toISOString(), durationMinutes: 30 });
      const path = FileSystem.cacheDirectory + `deadline_${Date.now()}.ics`;
      await FileSystem.writeAsStringAsync(path, ics, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Saved', 'ICS file saved to cache.');
      }
    } catch {
      Alert.alert('Export failed', 'Could not create ICS file.');
    }
  };

  return (
    <View style={styles.container}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Deadline Calculator</Text>
      <Text style={styles.subtitle}>Estimate reconsideration/appeal deadlines. Always verify with your board/insurer.</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {(["WCB","LTD","CPP-D"] as Benefit[]).map((b) => (
          <Pressable key={b} onPress={() => setBenefit(b)} style={[styles.chip, benefit===b && styles.chipActive]} accessibilityRole="button">
            <Text style={[styles.chipText, benefit===b && styles.chipTextActive]}>{b}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Decision date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={decisionDate} onChangeText={setDecisionDate} />
      <Pressable onPress={calc} style={styles.button}><Text style={styles.buttonText}>Calculate</Text></Pressable>
      {!!result && (
        <View style={styles.box}>
          <Text style={{ color: palette.text }}>{result}</Text>
          <Pressable onPress={remind} style={[styles.button, { marginTop: 8 }]}><Text style={styles.buttonText}>Set reminder</Text></Pressable>
          <Pressable onPress={async () => {
            const d = new Date(decisionDate);
            const map: Record<Benefit, number> = { WCB: 30, LTD: 60, "CPP-D": 90 };
            const due = new Date(d.getTime() + map[benefit]*86400000);
            const ok = await addEvent({ title: `Appeal deadline — ${benefit}`, notes: result, startISO: due.toISOString(), durationMinutes: 30 });
            Alert.alert(ok ? 'Added' : 'Not added', ok ? 'Event added to your calendar.' : 'Unable to add calendar event.');
          }} style={[styles.button, { marginTop: 8 }]}><Text style={styles.buttonText}>Add to calendar</Text></Pressable>
          <Pressable onPress={exportICS} style={[styles.button, { marginTop: 8 }]}><Text style={styles.buttonText}>Export ICS</Text></Pressable>
        </View>
      )}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    label: { color: palette.text, opacity: 0.95, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 10, color: palette.text, marginBottom: 8 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: '700' },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    box: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 12 },
  });
}
