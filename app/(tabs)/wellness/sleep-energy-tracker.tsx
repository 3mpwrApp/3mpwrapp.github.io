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
  date: string;
  sleepHours: string;
  sleepQuality: string;
  energy: string;
  notes: string;
  tags?: string;
};

export const options = { href: null };

export default function SleepEnergyTracker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Sleep & Energy Tracker");
  useFocusOnRefOnMount(titleRef);

  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [date, setDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [sleepHours, setSleepHours] = React.useState<string>("");
  const [sleepQuality, setSleepQuality] = React.useState<string>(""); // 1-5
  const [energy, setEnergy] = React.useState<string>(""); // 1-5
  const [notes, setNotes] = React.useState<string>("");
  const [tags, setTags] = React.useState<string>("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [filterStart, setFilterStart] = React.useState<string>("");
  const [filterEnd, setFilterEnd] = React.useState<string>("");
  const [filterMinHours, setFilterMinHours] = React.useState<string>("");
  const [filterTag, setFilterTag] = React.useState<string>("");

  const add = React.useCallback(() => {
    const e: Entry = {
      id: String(Date.now()),
      date,
      sleepHours,
      sleepQuality,
      energy,
      notes,
      tags,
    };
    setEntries((prev) => [e, ...prev]);
    try {
  require("../../../services/analyticsClient").trackEvent("tracker_add_entry", {
        kind: "sleep",
      });
    } catch {}
    setSleepHours("");
    setSleepQuality("");
    setEnergy("");
    setNotes("");
    setTags("");
  }, [date, sleepHours, sleepQuality, energy, notes, tags]);

  const startEdit = React.useCallback((e: Entry) => {
    setEditingId(e.id);
    setDate(e.date);
    setSleepHours(e.sleepHours || "");
    setSleepQuality(e.sleepQuality || "");
    setEnergy(e.energy || "");
    setNotes(e.notes || "");
    setTags(e.tags || "");
  }, []);

  const saveEdit = React.useCallback(() => {
    if (!editingId) return;
    setEntries((prev) =>
      prev.map((x) =>
        x.id === editingId
          ? { ...x, date, sleepHours, sleepQuality, energy, notes, tags }
          : x,
      ),
    );
    setEditingId(null);
    setSleepHours("");
    setSleepQuality("");
    setEnergy("");
    setNotes("");
    setTags("");
  }, [editingId, date, sleepHours, sleepQuality, energy, notes, tags]);

  const cancelEdit = React.useCallback(() => {
    setEditingId(null);
    setSleepHours("");
    setSleepQuality("");
    setEnergy("");
    setNotes("");
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
      const saved = await getCachedJSON<Entry[]>("wellness_sleep_entries");
      if (saved && Array.isArray(saved)) setEntries(saved);
    })();
  }, []);
  // Persist on change
  React.useEffect(() => {
    setCachedJSON("wellness_sleep_entries", entries);
  }, [entries]);

  const filtered = React.useMemo(() => {
    const minH = filterMinHours ? parseFloat(filterMinHours) : null;
    return entries.filter((e) => {
      if (filterStart && e.date < filterStart) return false;
      if (filterEnd && e.date > filterEnd) return false;
      const h = parseFloat(e.sleepHours || "0");
      if (minH !== null && !isNaN(minH) && (isNaN(h) || h < minH)) return false;
      if (
        filterTag &&
        !(e.tags || "").toLowerCase().includes(filterTag.toLowerCase())
      )
        {return false;}
      return true;
    });
  }, [entries, filterStart, filterEnd, filterMinHours, filterTag]);

  const summary = React.useMemo(() => {
  if (filtered.length === 0) return "No entries (check filters).";
    const hours = filtered
      .map((e) => parseFloat(e.sleepHours || "0"))
      .filter((n) => !isNaN(n));
    const q = filtered
      .map((e) => parseFloat(e.sleepQuality || "0"))
      .filter((n) => !isNaN(n));
    const en = filtered
      .map((e) => parseFloat(e.energy || "0"))
      .filter((n) => !isNaN(n));
    const avg = (arr: number[]) =>
      arr.length
        ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
        : "0";
    const lines: string[] = [];
    lines.push("Sleep & Energy Summary for Claim Support");
    lines.push("");
    lines.push(`Entries: ${filtered.length}`);
    lines.push(`Sleep hours/day (avg): ${avg(hours)}`);
    lines.push(`Sleep quality 1Ã¢â‚¬â€œ5 (avg): ${avg(q)}`);
    lines.push(`Energy 1Ã¢â‚¬â€œ5 (avg): ${avg(en)}`);
    lines.push("");
    filtered.slice(0, 30).forEach((e) => {
      lines.push(
        `Ã¢â‚¬Â¢ ${e.date}: ${e.sleepHours || "?"}h; quality ${e.sleepQuality || "?"}; energy ${e.energy || "?"}${e.notes ? "; notes: " + e.notes : ""}`,
      );
    });
    lines.push("");
    lines.push("Summary for medical/legal use:");
    lines.push(
      "- Persistent fatigue/insomnia patterns may affect work capacity and attendance.",
    );
    lines.push(
      "- Consider accommodations (flexible hours, rest breaks) and clinical followÃ¢â‚¬â€˜up for sleep issues.",
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
        <Text style={[styles.title, { color: palette.primary }]}>How to Use Sleep & Energy Tracker</Text>
        <Text style={styles.previewText}>
          Track your sleep and energy daily. Add notes and tags for patterns. Export summaries for clinicians or claims, and learn more about sleep health.
        </Text>
        <A11yPressable
          onPress={() => require('react-native').Linking.openURL('https://empowrapp.com/sleep-energy-info')}
          style={[styles.button, { backgroundColor: palette.primary, marginBottom: 6 }]}
          accessibilityRole="link"
          accessibilityLabel="Learn more about sleep and energy tracking"
          accessibilityHint="Opens a page with more information about sleep health."
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
        Sleep & Energy Tracker
      </Text>
      <Text style={styles.subtitle}>
        Track sleep and energy; export summaries for clinicians or claims.
      </Text>

      <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} accessibilityLabel="Date input" accessibilityHint="Enter the date for your sleep entry." />
      <Field label="Sleep hours" value={sleepHours} onChangeText={setSleepHours} keyboardType="numeric" accessibilityLabel="Sleep hours input" accessibilityHint="Enter the number of hours you slept." />
      <Field label="Sleep quality (1-5)" value={sleepQuality} onChangeText={setSleepQuality} keyboardType="numeric" accessibilityLabel="Sleep quality input" accessibilityHint="Enter your sleep quality from 1 to 5." />
      <Field label="Energy (1-5)" value={energy} onChangeText={setEnergy} keyboardType="numeric" accessibilityLabel="Energy input" accessibilityHint="Enter your energy level from 1 to 5." />
      <Field label="Notes (insomnia, naps, pain, etc.)" value={notes} onChangeText={setNotes} multiline accessibilityLabel="Notes input" accessibilityHint="Add any notes about your sleep, naps, pain, or other factors." />
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
        {["insomnia", "nap", "fatigue", "pain", "stress"].map((tg) => (
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
            >{`${e.date} Ã¢â‚¬â€ ${e.sleepHours || "?"}h, q${e.sleepQuality || "?"}, e${e.energy || "?"}`}</Text>
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
                <Text style={[styles.smallBtnText, { color: palette.text }]}>
                  Edit
                </Text>
              </A11yPressable>
              <A11yPressable
                onPress={() => remove(e.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete entry dated ${e.date}`}
                style={[styles.smallBtn, { backgroundColor: "#b00020" }]}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={[styles.smallBtnText, { color: "#fff" }]}>
                  Delete
                </Text>
              </A11yPressable>
            </View>
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
        Sleep hours trend
      </Text>
      <View style={{ marginBottom: 8 }}>
        {filtered
          .slice(0, 10)
          .reverse()
          .map((e) => {
            const v = Math.max(
              0,
              Math.min(12, parseFloat(e.sleepHours || "0")),
            );
            const pct = isNaN(v) ? 0 : (v / 12) * 100;
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
                  {e.sleepHours || "?"}h
                </Text>
              </View>
            );
          })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Summary</Text>
      <View style={styles.preview}>
        <Text style={styles.previewText}>{summary}</Text>
      </View>

      <A11yPressable
        style={styles.button}
        onPress={() => {
          try {
            require("../../../services/analyticsClient").trackEvent("tracker_share", {
              kind: "sleep",
            });
          } catch {}
          Share.share({
            message: summary,
            title: "Sleep & Energy Summary",
          }).catch(() => {});
        }}
        accessibilityRole="button"
        accessibilityLabel="Share sleep and energy summary"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>Share</Text>
      </A11yPressable>
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const mod = await import("expo-clipboard");
            await mod.setStringAsync(summary);
            Alert.alert("Copied", "Summary copied to clipboard.");
          } catch {
            Alert.alert(
              "Clipboard not available",
              "Install expo-clipboard in a dev build to enable copy.",
            );
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="Copy summary to clipboard"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>Copy to clipboard</Text>
      </A11yPressable>
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const { default: FileSystem } = await import("expo-file-system");
            const dir =
              (FileSystem as any).cacheDirectory ||
              (FileSystem as any).documentDirectory;
            if (!dir) throw new Error("No writable directory");
            const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${summary.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre></body></html>`;
            const path = `${dir}sleep_energy_${Date.now()}.doc`;
            // Use augmented types (EncodingType.UTF8) for consistency across platforms
            await FileSystem.writeAsStringAsync(path, html, {
              encoding: FileSystem.EncodingType.UTF8,
            });
            await Share.share({
              url: path,
              title: "Sleep & Energy Summary (.doc)",
            });
          } catch {
            Alert.alert("Export failed", "Could not create .doc file.");
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="Export summary as Word document"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>Export as .doc</Text>
      </A11yPressable>
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={() => {
          const rows = [
            ["date", "sleep_hours", "sleep_quality", "energy", "notes", "tags"],
            ...filtered.map((e) => [
              e.date,
              e.sleepHours,
              e.sleepQuality,
              e.energy,
              e.notes,
              e.tags || "",
            ]),
          ];
          const csv = rows
            .map((r) =>
              r.map((x) => `"${(x || "").replace(/"/g, '""')}"`).join(","),
            )
            .join("\n");
          Share.share({ message: csv, title: "Sleep & Energy CSV" }).catch(
            () => {},
          );
        }}
        accessibilityRole="button"
        accessibilityLabel="Export summary as CSV text"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>Export CSV</Text>
      </A11yPressable>
      <A11yPressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const rows = [
              ["date", "sleep_hours", "sleep_quality", "energy", "notes"],
              ...filtered.map((e) => [
                e.date,
                e.sleepHours,
                e.sleepQuality,
                e.energy,
                e.notes,
              ]),
            ];
            const csv = rows
              .map((r) =>
                r.map((x) => `"${(x || "").replace(/"/g, '""')}"`).join(","),
              )
              .join("\n");
            const { default: FileSystem } = await import("expo-file-system");
            const baseDir =
              (FileSystem as any).cacheDirectory ||
              (FileSystem as any).documentDirectory;
            if (!baseDir) throw new Error("No writable directory");
            const path = `${baseDir}sleep_energy_${Date.now()}.csv`;
            await FileSystem.writeAsStringAsync(path, csv, {
              encoding: FileSystem.EncodingType.UTF8,
            });
            await Share.share({ url: path, title: "Sleep & Energy CSV" });
          } catch {
            Alert.alert(
              "Export failed",
              "Could not create CSV file. Share text export instead.",
            );
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="Export summary as downloadable CSV file"
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
        label="Min sleep hours"
        value={filterMinHours}
        onChangeText={setFilterMinHours}
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
          setFilterMinHours("");
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
            const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${summary.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
            const { uri } = await mod.printToFileAsync({ html });
            await Share.share({ url: uri, title: "Sleep & Energy Summary" });
          } catch {
            Alert.alert(
              "PDF not available",
              "Install expo-print in a dev build to export PDFs.",
            );
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="Export summary as PDF"
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

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  keyboardType,
  accessibilityLabel,
  accessibilityHint,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboardType?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
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
