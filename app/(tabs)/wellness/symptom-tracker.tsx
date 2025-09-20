import React from "react";
import {
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import A11yPressable from "../../../components/A11yPressable";
import PrivacyGate from "../../../components/PrivacyGate";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { getCachedJSON, setCachedJSON } from "../../../services/cache";
import { usePrivacy } from "../../../store/privacy";
import { useAppPalette } from "../../../theme/usePalette";

type Entry = {
  id: string;
  date: string; // ISO date
  pain: string; // 0-10
  symptoms: string;
  impact: string; // work/daily function impact
  meds: string;
  tags?: string;
};

export const options = { href: null };

export default function SymptomTracker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Symptom & Pain Tracker");
  useFocusOnRefOnMount(titleRef);

  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [date, setDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [pain, setPain] = React.useState<string>("");
  const [symptoms, setSymptoms] = React.useState<string>("");
  const [impact, setImpact] = React.useState<string>("");
  const [meds, setMeds] = React.useState<string>("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [tags, setTags] = React.useState<string>("");
  const [filterStart, setFilterStart] = React.useState<string>("");
  const [filterEnd, setFilterEnd] = React.useState<string>("");
  const [filterMinPain, setFilterMinPain] = React.useState<string>("");
  const [filterTag, setFilterTag] = React.useState<string>("");

  const add = React.useCallback(() => {
    const e: Entry = {
      id: String(Date.now()),
      date,
      pain,
      symptoms,
      impact,
      meds,
      tags,
    };
    setEntries((prev) => [e, ...prev]);
    try {
      require("../../../services/analytics").logEvent?.("tracker_add_entry", {
        kind: "symptom",
      });
    } catch {}
    setPain("");
    setSymptoms("");
    setImpact("");
    setMeds("");
    setTags("");
  }, [date, pain, symptoms, impact, meds, tags]);

  const startEdit = React.useCallback((e: Entry) => {
    setEditingId(e.id);
    setDate(e.date);
    setPain(e.pain || "");
    setSymptoms(e.symptoms || "");
    setImpact(e.impact || "");
    setMeds(e.meds || "");
    setTags(e.tags || "");
  }, []);

  const saveEdit = React.useCallback(() => {
    if (!editingId) return;
    setEntries((prev) =>
      prev.map((x) =>
        x.id === editingId
          ? { ...x, date, pain, symptoms, impact, meds, tags }
          : x,
      ),
    );
    setEditingId(null);
    setPain("");
    setSymptoms("");
    setImpact("");
    setMeds("");
    setTags("");
  }, [editingId, date, pain, symptoms, impact, meds, tags]);

  const cancelEdit = React.useCallback(() => {
    setEditingId(null);
    setPain("");
    setSymptoms("");
    setImpact("");
    setMeds("");
    setTags("");
  }, []);

  const [undo, setUndo] = React.useState<{ entry: Entry } | null>(null);
  const remove = React.useCallback(
    (id: string) => {
      const deleted = entries.find((e) => e.id === id);
      Alert.alert(
        "Delete entry",
        "Are you sure you want to delete this entry?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setEntries((prev) => prev.filter((x) => x.id !== id));
              if (deleted) setUndo({ entry: deleted });
              setTimeout(() => setUndo(null), 8000);
            },
          },
        ],
      );
    },
    [entries],
  );

  // Load persisted entries
  React.useEffect(() => {
    (async () => {
      const saved = await getCachedJSON<Entry[]>("wellness_symptom_entries");
      if (saved && Array.isArray(saved)) setEntries(saved);
    })();
  }, []);
  // Persist on change
  React.useEffect(() => {
    setCachedJSON("wellness_symptom_entries", entries);
  }, [entries]);

  const filtered = React.useMemo(() => {
    const min = filterMinPain ? parseFloat(filterMinPain) : null;
    return entries.filter((e) => {
      if (filterStart && e.date < filterStart) return false;
      if (filterEnd && e.date > filterEnd) return false;
      const p = parseFloat(e.pain || "0");
      if (min !== null && !isNaN(min) && (!e.pain || isNaN(p) || p < min))
        {return false;}
      if (
        filterTag &&
        !(e.tags || "").toLowerCase().includes(filterTag.toLowerCase())
      )
        {return false;}
      return true;
    });
  }, [entries, filterStart, filterEnd, filterMinPain, filterTag]);

  const report = React.useMemo(() => {
    if (filtered.length === 0) return "No entries (check filters).";
    const pains = filtered
      .map((e) => parseFloat(e.pain || "0"))
      .filter((n) => !isNaN(n));
    const avg = pains.length
      ? (pains.reduce((a, b) => a + b, 0) / pains.length).toFixed(1)
      : "0";
    const min = pains.length ? Math.min(...pains) : 0;
    const max = pains.length ? Math.max(...pains) : 0;
    const lines: string[] = [];
    lines.push("Symptom & Pain Report");
    lines.push("");
    lines.push(`Entries: ${filtered.length}`);
    lines.push(`Pain (0Ã¢â‚¬â€œ10): avg ${avg}, range ${min}Ã¢â‚¬â€œ${max}`);
    lines.push("");
    filtered.slice(0, 30).forEach((e) => {
      lines.push(
        `Ã¢â‚¬Â¢ ${e.date}: pain ${e.pain || "?"}; symptoms: ${e.symptoms || "-"}; impact: ${e.impact || "-"}; meds: ${e.meds || "-"}`,
      );
    });
    lines.push("");
    lines.push("Advocacy summary:");
    lines.push(
      "- Functional impact reported across dates above (consider accommodations and pacing).",
    );
    lines.push(
      "- Correlate high-pain days with missed work/ADLs and provide medical notes as available.",
    );
    return lines.join("\n");
  }, [filtered]);

  const { state } = usePrivacy();
  const body = (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <View style={[styles.preview, { backgroundColor: palette.surface, borderRadius: 10, marginBottom: 12 }]}> 
        <Text style={[styles.title, { color: palette.primary }]}>How to Use Symptom Tracker</Text>
        <Text style={styles.previewText}>
          Log your symptoms, pain, and impact on daily life. Export reports for advocacy or clinical use, and learn more about symptom tracking.
        </Text>
        <A11yPressable
          onPress={() => require('react-native').Linking.openURL('https://empowrapp.com/symptom-tracker-info')}
          style={[styles.button, { backgroundColor: palette.primary, marginBottom: 6 }]}
          accessibilityRole="link"
          accessibilityLabel="Learn more about symptom tracking"
          accessibilityHint="Opens a page with more information about symptom tracking."
          hitSlop={HIT_SLOP_8}
        >
          <Text style={[styles.buttonText, { color: palette.onPrimary }]}>Learn More</Text>
        </A11yPressable>
      </View>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Symptom & Pain Tracker
      </Text>
      <Text style={styles.subtitle}>
        Log entries and generate an exportable, advocacy-oriented report.
      </Text>

      <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} accessibilityLabel="Date input" accessibilityHint="Enter the date for your symptom entry." />
      <Field label="Pain (0-10)" value={pain} onChangeText={setPain} keyboardType="numeric" accessibilityLabel="Pain input" accessibilityHint="Enter your pain level from 0 to 10." />
      <Field label="Symptoms" value={symptoms} onChangeText={setSymptoms} multiline accessibilityLabel="Symptoms input" accessibilityHint="Describe your symptoms for this entry." />
      <Field label="Impact on work/daily life" value={impact} onChangeText={setImpact} multiline accessibilityLabel="Impact input" accessibilityHint="Describe how symptoms affected your work or daily life." />
      <Field label="Meds taken / changes" value={meds} onChangeText={setMeds} multiline accessibilityLabel="Meds input" accessibilityHint="List any medications taken or changes." />
      <Field label="Tags (comma-separated)" value={tags} onChangeText={setTags} accessibilityLabel="Tags input" accessibilityHint="Add tags to help categorize your entry." />

      {editingId ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <A11yPressable
            style={[styles.button, { flex: 1 }]}
            onPress={saveEdit}
            accessibilityRole="button"
            accessibilityLabel="Save edits"
            hitSlop={HIT_SLOP_8}
          >
            <Text style={styles.buttonText}>Save</Text>
          </A11yPressable>
          <A11yPressable
            style={[styles.button, { flex: 1, backgroundColor: "#777" }]}
            onPress={cancelEdit}
            accessibilityRole="button"
            accessibilityLabel="Cancel edits"
            hitSlop={HIT_SLOP_8}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </A11yPressable>
        </View>
      ) : (
        <A11yPressable
          style={styles.button}
          onPress={add}
          accessibilityRole="button"
          accessibilityLabel="Add entry"
          hitSlop={HIT_SLOP_8}
        >
          <Text style={styles.buttonText}>Add Entry</Text>
        </A11yPressable>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
        Recent entries
      </Text>
      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Quick tags</Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {["flare", "med-change", "work", "sleep", "stress"].map((tg) => (
          <A11yPressable
            key={tg}
            onPress={() => {
              const arr = (tags || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              const has = arr.includes(tg);
              const next = has ? arr.filter((x) => x !== tg) : [...arr, tg];
              setTags(next.join(", "));
            }}
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: palette.muted,
              borderRadius: 16,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: (tags || "").includes(tg)
                ? palette.primary
                : "transparent",
            }}
            accessibilityRole="button"
            accessibilityLabel={`Toggle tag ${tg}`}
            accessibilityState={{ selected: (tags || "").includes(tg) }}
            hitSlop={HIT_SLOP_8}
          >
            <Text
              style={{
                color: (tags || "").includes(tg)
                  ? palette.onPrimary
                  : palette.text,
              }}
            >
              {tg}
            </Text>
          </A11yPressable>
        ))}
      </View>
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No entries yet.</Text>
      ) : (
        filtered.map((e) => (
          <View key={e.id} style={styles.entryRow}>
            <Text
              style={styles.entryText}
            >{`${e.date} Ã¢â‚¬â€ pain ${e.pain || "?"}`}</Text>
            {!!e.symptoms && (
              <Text style={styles.entryNote}>Ã¢â‚¬Â¢ {e.symptoms}</Text>
            )}
            {!!e.tags && <Text style={styles.entryNote}>tags: {e.tags}</Text>}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <A11yPressable
                onPress={() => startEdit(e)}
                accessibilityRole="button"
                accessibilityLabel={`Edit entry dated ${e.date}`}
                style={[
                  styles.smallBtn,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.muted,
                    borderWidth: StyleSheet.hairlineWidth,
                  },
                ]}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={[styles.smallBtnText, { color: palette.text }]}>Edit</Text>
              </A11yPressable>
              <A11yPressable
                onPress={() => remove(e.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete entry dated ${e.date}`}
                style={[styles.smallBtn, { backgroundColor: "#b00020" }]}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={[styles.smallBtnText, { color: "#fff" }]}>Delete</Text>
              </A11yPressable>
            </View>
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Pain trend</Text>
      <View style={{ marginBottom: 8 }}>
        {filtered
          .slice(0, 10)
          .reverse()
          .map((e) => {
            const v = Math.max(0, Math.min(10, parseFloat(e.pain || "0")));
            const pct = isNaN(v) ? 0 : (v / 10) * 100;
            return (
              <View
                key={e.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: palette.text, width: 90 }}>{e.date}</Text>
                <View
                  style={{
                    height: 8,
                    backgroundColor: palette.muted,
                    borderRadius: 4,
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: `${pct}%`,
                      height: 8,
                      backgroundColor: palette.primary,
                      borderRadius: 4,
                    }}
                  />
                </View>
                <Text style={{ color: palette.text, marginLeft: 6 }}>
                  {e.pain || "?"}
                </Text>
              </View>
            );
          })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Report</Text>
      <View style={styles.preview}>
        <Text style={styles.previewText}>{report}</Text>
      </View>

      <A11yPressable
        style={styles.button}
        onPress={() => {
          try {
            require("../../../services/analytics").logEvent?.("tracker_share", {
              kind: "symptom",
            });
          } catch {}
          Share.share({
            message: report,
            title: "Symptom & Pain Report",
          }).catch(() => {});
        }}
        accessibilityRole="button"
        accessibilityLabel="Share symptom and pain report"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>Share</Text>
      </A11yPressable>
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const mod = await import("expo-clipboard");
            await mod.setStringAsync(report);
            Alert.alert("Copied", "Report copied to clipboard.");
          } catch {
            Alert.alert(
              "Clipboard not available",
              "Install expo-clipboard in a dev build to enable copy.",
            );
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="Copy report to clipboard"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>Copy to clipboard</Text>
      </A11yPressable>
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const FS = await import("expo-file-system");
            const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${report.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre></body></html>`;
            const path = FS.cacheDirectory + `symptom_report_${Date.now()}.doc`;
            await FS.writeAsStringAsync(path, html, {
              encoding: FS.EncodingType.UTF8,
            });
            await Share.share({
              url: path,
              title: "Symptom & Pain Report (.doc)",
            });
          } catch {
            Alert.alert("Export failed", "Could not create .doc file.");
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="Export report as Word document"
        hitSlop={HIT_SLOP_8}
      >
          <Text style={styles.buttonText}>Export as .doc</Text>
      </A11yPressable>
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={() => {
          const rows = [
            ["date", "pain", "symptoms", "impact", "meds", "tags"],
            ...filtered.map((e) => [
              e.date,
              e.pain,
              e.symptoms,
              e.impact,
              e.meds,
              e.tags || "",
            ]),
          ];
          const csv = rows
            .map((r) =>
              r.map((x) => `"${(x || "").replace(/"/g, '""')}"`).join(","),
            )
            .join("\n");
          Share.share({ message: csv, title: "Symptom & Pain CSV" }).catch(
            () => {},
          );
        }}
        accessibilityRole="button"
        accessibilityLabel="Export report as CSV text"
        hitSlop={HIT_SLOP_8}
      >
          <Text style={styles.buttonText}>Export CSV</Text>
      </A11yPressable>
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const rows = [
              ["date", "pain", "symptoms", "impact", "meds"],
              ...filtered.map((e) => [
                e.date,
                e.pain,
                e.symptoms,
                e.impact,
                e.meds,
              ]),
            ];
            const csv = rows
              .map((r) =>
                r.map((x) => `"${(x || "").replace(/"/g, '""')}"`).join(","),
              )
              .join("\n");
            const FS = await import("expo-file-system");
            const path = FS.cacheDirectory + `symptom_pain_${Date.now()}.csv`;
            await FS.writeAsStringAsync(path, csv, {
              encoding: FS.EncodingType.UTF8,
            });
            await Share.share({ url: path, title: "Symptom & Pain CSV" });
          } catch {
            Alert.alert(
              "Export failed",
              "Could not create CSV file. Share text export instead.",
            );
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="Export report as downloadable CSV file"
        hitSlop={HIT_SLOP_8}
      >
          <Text style={styles.buttonText}>Export CSV File</Text>
      </A11yPressable>

      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
        Filters (optional)
      </Text>
      <Field
        label="Start date (YYYY-MM-DD)"
        value={filterStart}
        onChangeText={setFilterStart}
      />
      <Field
        label="End date (YYYY-MM-DD)"
        value={filterEnd}
        onChangeText={setFilterEnd}
      />
      <Field
        label="Min pain (0Ã¢â‚¬â€œ10)"
        value={filterMinPain}
        onChangeText={setFilterMinPain}
        keyboardType="numeric"
      />
      <Field
        label="Tag contains"
        value={filterTag}
        onChangeText={setFilterTag}
      />
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={() => {
          setFilterStart("");
            setFilterEnd("");
            setFilterMinPain("");
            setFilterTag("");
        }}
        accessibilityRole="button"
        accessibilityLabel="Clear all filters"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>Clear filters</Text>
      </A11yPressable>
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const mod = await import("expo-print");
            const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${report.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
            const { uri } = await mod.printToFileAsync({ html });
            await Share.share({ url: uri, title: "Symptom & Pain Report" });
          } catch {
            Alert.alert(
              "PDF not available",
              "Install expo-print in a dev build to export PDFs.",
            );
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="Export report as PDF"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>Export as PDF</Text>
      </A11yPressable>
      {!!undo && (
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            backgroundColor: palette.surface,
            borderRadius: 10,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.muted,
            padding: 10,
          }}
        >
          <Text style={{ color: palette.text, marginBottom: 6 }}>
            Entry deleted
          </Text>
          <A11yPressable
            onPress={() => {
              setEntries((prev) => [undo.entry, ...prev]);
              setUndo(null);
            }}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Undo delete entry"
            hitSlop={HIT_SLOP_8}
          >
            <Text style={styles.buttonText}>Undo</Text>
          </A11yPressable>
        </View>
      )}
    </ScrollView>
  );
  return state.lockWellness ? <PrivacyGate>{body}</PrivacyGate> : body;
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboardType?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  keyboardType,
  accessibilityLabel,
  accessibilityHint,
}: FieldProps) {
  const palette = useAppPalette();
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: palette.text, opacity: 0.95, marginBottom: 4 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: palette.muted,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: palette.text,
          minHeight: 44,
        }}
        multiline={multiline}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    sectionTitle: { color: palette.text, fontWeight: "700" },
    empty: { color: palette.text, opacity: 0.8 },
    entryRow: { paddingVertical: 6 },
    entryText: { color: palette.text, fontWeight: "600" },
    entryNote: { color: palette.text, opacity: 0.9 },
    preview: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      backgroundColor: palette.surface,
      marginBottom: 12,
    },
    previewText: { color: palette.text, opacity: 0.95 },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    smallBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    smallBtnText: { fontWeight: "700" },
  });
}
