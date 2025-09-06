import { View, Text, StyleSheet, useColorScheme, Pressable, Platform, Share } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, Stack } from "expo-router";
import { useAppPalette } from "../../../theme/usePalette";
import SettingsLink from "../../../components/SettingsLink";
import { events } from "../../../data/events";

export const options = { href: null };

function createICS(title: string, start: string, description?: string, location?: string) {
  // Minimal ICS text (UTC naive for demo). Real apps should format correctly.
  const dt = start.replace(/[-: ]/g, "");
  const uid = `${dt}-${title}`;
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${uid}\nDTSTART:${dt}\nSUMMARY:${title}\nDESCRIPTION:${description ?? ""}\nLOCATION:${location ?? ""}\nEND:VEVENT\nEND:VCALENDAR`;
}

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = useAppPalette();
  const styles = createStyles(palette);

  const event = events.find((e) => e.id === id);

  const addToCalendar = async () => {
    if (!event) return;
    try {
      // Open Google Calendar template as a simple cross-platform path
      const start = new Date(event.date);
      const toCalTime = (d: Date) =>
        `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}00Z`;
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const dates = `${toCalTime(start)}/${toCalTime(end)}`;
      const params = new URLSearchParams({ action: "TEMPLATE", text: event.title, details: event.description ?? "", location: event.isVirtual ? "Virtual" : (event.location ?? ""), dates });
      const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else await Share.share({ message: createICS(event.title, event.date, event.description, event.location), title: "Event" });
    } catch {
      await Share.share({ message: createICS(event.title, event.date, event.description, event.location), title: "Event" });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: event?.title ?? "Event" }} />
      <View style={styles.container}>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        <Text style={styles.title}>{event?.title ?? "Event"}</Text>
        <Text style={styles.text}>{event?.description ?? "Details unavailable."}</Text>
        <Text style={styles.text}>When: {event?.date}</Text>
        <Text style={styles.text}>Where: {event?.isVirtual ? "Virtual" : (event?.location ?? "TBD")}</Text>
        {!!event && (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={addToCalendar}
            accessibilityRole="button"
            accessibilityLabel="Add to calendar"
          >
            <Text style={styles.buttonText}>Add Reminder</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: palette.text },
    text: { fontSize: 16, color: palette.text, opacity: 0.95, marginBottom: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, minHeight: 44, minWidth: 44, marginTop: 12 },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  });
}


