import React from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import A11yPressable from "../../../components/A11yPressable";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { getCachedJSON, setCachedJSON } from "../../../services/cache";
import { addEvent } from "../../../services/calendar";
import { buildICSMany } from "../../../services/ics";
import { useAppPalette } from "../../../theme/usePalette";

type Appt = { id: string; time: string; title: string };

function makePlan(
  date: string,
  painAvg: number,
  energyAvg: number,
  appts: Appt[],
) {
  const lines: string[] = [];
  lines.push(`Plan for ${date}`);
  const pace =
    painAvg >= 6 || energyAvg <= 2
      ? "30/10"
      : painAvg >= 4 || energyAvg <= 3
        ? "50/10"
        : "90/10";
  lines.push(`Pacing: work/rest ${pace}`);
  lines.push("Rest after appointments and before tasks that require focus.");
  lines.push("");
  appts
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((a) => lines.push(`Ã¢â‚¬Â¢ ${a.time} Ã¢â‚¬â€ ${a.title}`));
  lines.push("");
  lines.push("Suggested rest blocks: 11:00, 14:30");
  return lines.join("\n");
}

export const options = { href: null };

export default function DailyPlanner() {
  // Info card for discoverability
  const openLearnMore = () => {
    require('react-native').Linking.openURL('https://empowrapp.com/daily-planner-info');
  };
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Adaptive Daily Planner");
  useFocusOnRefOnMount(titleRef);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [appts, setAppts] = React.useState<Appt[]>([]);
  const [time, setTime] = React.useState("09:00");
  const [title, setTitle] = React.useState("");
  const [plan, setPlan] = React.useState("");

  const [painAvg, setPainAvg] = React.useState(0);
  const [energyAvg, setEnergyAvg] = React.useState(3);

  React.useEffect(() => {
    (async () => {
      const sym =
        (await getCachedJSON<any[]>("wellness_symptom_entries")) || [];
      const slp = (await getCachedJSON<any[]>("wellness_sleep_entries")) || [];
      const pains = sym
        .slice(0, 7)
        .map((e) => parseFloat(e.pain || "0"))
        .filter((n) => !isNaN(n));
      setPainAvg(
        pains.length ? pains.reduce((a, b) => a + b, 0) / pains.length : 0,
      );
      const energies = slp
        .slice(0, 7)
        .map((e) => parseFloat(e.energy || "0"))
        .filter((n) => !isNaN(n));
      setEnergyAvg(
        energies.length
          ? energies.reduce((a, b) => a + b, 0) / energies.length
          : 3,
      );
      const saved = await getCachedJSON<Appt[]>(`daily_planner_${date}`);
      if (saved) setAppts(saved);
    })();
  }, [date]);

  React.useEffect(() => {
    setCachedJSON(`daily_planner_${date}`, appts);
  }, [appts, date]);

  const addAppt = () => {
    if (!title.trim()) return;
    setAppts((prev) => [
      ...prev,
      { id: String(Date.now()), time, title: title.trim() },
    ]);
    setTitle("");
  };

  const build = () => setPlan(makePlan(date, painAvg, energyAvg, appts));

  const sharePlan = () => {
    const p = plan || makePlan(date, painAvg, energyAvg, appts);
    Share.share({ message: p, title: "Daily Plan" }).catch(() => {});
  };

  const addRestToCalendar = async () => {
    try {
      const d = new Date(date + "T11:00:00");
      const ok = await addEvent({
        title: "Rest break",
        notes: "Adaptive Daily Planner",
        startISO: d.toISOString(),
        durationMinutes: 15,
      });
      Alert.alert(
        ok ? "Added" : "Not added",
        ok ? "Rest break added to calendar." : "Unable to add event.",
      );
    } catch {
      Alert.alert("Not available", "Calendar permission or module missing.");
    }
  };
  const addAllRests = async () => {
    try {
      const d1 = new Date(date + "T11:00:00");
      const d2 = new Date(date + "T14:30:00");
      const ok1 = await addEvent({
        title: "Rest break",
        notes: "Adaptive Daily Planner",
        startISO: d1.toISOString(),
        durationMinutes: 15,
      });
      const ok2 = await addEvent({
        title: "Rest break",
        notes: "Adaptive Daily Planner",
        startISO: d2.toISOString(),
        durationMinutes: 15,
      });
      Alert.alert(
        ok1 && ok2 ? "Added" : "Partial",
        ok1 && ok2 ? "Rest breaks added." : "Some events could not be added.",
      );
    } catch {
      Alert.alert("Not available", "Calendar permission or module missing.");
    }
  };

  const morningTemplate = () => {
    setTime("09:00");
    setTitle("Stretch + hydration");
    addAppt();
    setTime("11:00");
    setTitle("Rest break");
    addAppt();
  };
  const afternoonTemplate = () => {
    setTime("13:30");
    setTitle("Admin task (15m)");
    addAppt();
    setTime("14:30");
    setTitle("Rest break");
    addAppt();
  };

  const exportRestsICS = async () => {
    try {
      const events = ["11:00", "14:30"].map((t) => ({
        title: "Rest break",
        startISO: new Date(date + "T" + t + ":00").toISOString(),
        durationMinutes: 15,
      }));
      const ics = buildICSMany(events);
      const FS = await import("expo-file-system");
      const path = FS.cacheDirectory + `rests_${date}.ics`;
      await FS.writeAsStringAsync(path, ics, {
        encoding: FS.EncodingType.UTF8,
      });
      const Sharing = await import("expo-sharing");
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
      else Alert.alert("Exported", "ICS saved to cache.");
    } catch {
      Alert.alert("Export failed", "Could not create ICS.");
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <View style={[s.card, { backgroundColor: palette.surface, marginBottom: 12 }]}> 
        <Text style={[s.title, { color: palette.primary }]}>How to Use the Daily Planner</Text>
        <Text style={s.tip}>
          This planner helps you schedule your day with adaptive pacing, rest breaks, and appointment tracking. Add appointments, build your plan, and export or share as needed.
        </Text>
        <A11yPressable
          onPress={openLearnMore}
          style={[s.button, { backgroundColor: palette.primary, marginBottom: 6 }]}
          accessibilityRole="link"
          accessibilityLabel="Learn more about daily planner"
          accessibilityHint="Opens a page with more information about adaptive planning."
        >
          <Text style={[s.buttonText, { color: palette.onPrimary }]}>Learn More</Text>
        </A11yPressable>
      </View>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Adaptive Daily Planner
      </Text>
      <Text style={s.subtitle}>
        Smart scheduling that factors in fatigue, pain flares, and appointments,
        with suggested rest breaks.
      </Text>
      <Text style={s.label}>Date (YYYYÃ¢â‚¬â€˜MMÃ¢â‚¬â€˜DD)</Text>
      <TextInput style={s.input} value={date} onChangeText={setDate} />
      <TextInput
        style={s.input}
        value={date}
        onChangeText={setDate}
        accessibilityLabel="Date input"
        accessibilityHint="Enter the date for your daily plan in YYYY-MM-DD format."
      />
      <TextInput
        style={s.input}
        value={time}
        onChangeText={setTime}
        placeholder="09:00"
        accessibilityLabel="Time input"
        accessibilityHint="Enter the time for your appointment."
      />
      <TextInput
        style={s.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Physio / meeting / call"
        accessibilityLabel="Appointment title input"
        accessibilityHint="Enter the title or description for your appointment."
      />
      <Text style={s.tip}>
        Recent averages Ã¢â‚¬â€ Pain: {painAvg.toFixed(1)} / 10; Energy:{" "}
        {energyAvg.toFixed(1)} / 5
      </Text>
      <View style={{ height: 8 }} />
      <Text style={s.label}>Add appointment</Text>
      <TextInput
        style={s.input}
        value={time}
        onChangeText={setTime}
        placeholder="09:00"
      />
      <TextInput
        style={s.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Physio / meeting / call"
      />
      <A11yPressable onPress={addAppt} style={s.button}>
        <Text style={s.buttonText}>Add</Text>
      </A11yPressable>
      <A11yPressable
        onPress={addAppt}
        style={s.button}
        accessibilityRole="button"
        accessibilityLabel="Add appointment"
        accessibilityHint="Adds the appointment to your daily plan."
      >
      </A11yPressable>
      <View style={{ height: 8 }} />
      {appts
        .sort((a, b) => a.time.localeCompare(b.time))
        .map((a) => (
          <View key={a.id} style={s.row}>
            <Text style={s.rowText}>
              {a.time} Ã¢â‚¬â€ {a.title}
            </Text>
          </View>
        ))}
      <View style={{ height: 8 }} />
      <A11yPressable onPress={build} style={s.button}>
        <Text style={s.buttonText}>Build plan</Text>
      </A11yPressable>
      <A11yPressable
        onPress={build}
        style={s.button}
        accessibilityRole="button"
        accessibilityLabel="Build daily plan"
        accessibilityHint="Generates your adaptive daily plan based on appointments and averages."
      >
      </A11yPressable>
      <View style={{ height: 8 }} />
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <A11yPressable onPress={morningTemplate} style={s.button}>
          <Text style={s.buttonText}>Morning template</Text>
        </A11yPressable>
        <A11yPressable
          onPress={morningTemplate}
          style={s.button}
          accessibilityRole="button"
          accessibilityLabel="Add morning template"
          accessibilityHint="Adds a morning routine template to your appointments."
        >
        </A11yPressable>
        <A11yPressable onPress={afternoonTemplate} style={s.button}>
          <Text style={s.buttonText}>Afternoon template</Text>
        </A11yPressable>
        <A11yPressable
          onPress={afternoonTemplate}
          style={s.button}
          accessibilityRole="button"
          accessibilityLabel="Add afternoon template"
          accessibilityHint="Adds an afternoon routine template to your appointments."
        >
        </A11yPressable>
      </View>
      {!!plan && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Plan</Text>
          <Text style={s.cardText}>{plan}</Text>
          <A11yPressable onPress={sharePlan} style={[s.button, { marginTop: 8 }]}>
            <Text style={s.buttonText}>Share</Text>
          </A11yPressable>
          <A11yPressable
            onPress={sharePlan}
            style={[s.button, { marginTop: 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Share daily plan"
            accessibilityHint="Shares your daily plan using the system share dialog."
          >
          </A11yPressable>
          <A11yPressable
            onPress={addRestToCalendar}
            style={[s.button, { marginTop: 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Add rest break to calendar"
            accessibilityHint="Adds a rest break to your calendar for today."
          >
          </A11yPressable>
          <A11yPressable onPress={addAllRests} style={[s.button, { marginTop: 8 }]}>
            <Text style={s.buttonText}>Add all suggested rests</Text>
          </A11yPressable>
          <A11yPressable
            onPress={addAllRests}
            style={[s.button, { marginTop: 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Add all rest breaks to calendar"
            accessibilityHint="Adds all suggested rest breaks to your calendar for today."
          >
          </A11yPressable>
          <A11yPressable
            onPress={exportRestsICS}
            style={[s.button, { marginTop: 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Export rest breaks as ICS"
            accessibilityHint="Exports all rest breaks as an ICS calendar file for sharing or import."
          >
          </A11yPressable>
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
    label: { color: palette.text, opacity: 0.95, marginBottom: 4 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 10,
      color: palette.text,
      marginBottom: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    tip: { color: palette.text, opacity: 0.9 },
    row: {
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    rowText: { color: palette.text },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      backgroundColor: palette.surface,
      marginTop: 8,
    },
    cardTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95 },
  });
}
