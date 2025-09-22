import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import React from 'react';
import { Alert, Share, StyleSheet, Text, View } from "react-native";

import A11yPressable from '../../../components/A11yPressable';
import SettingsLink from "../../../components/SettingsLink";
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { events } from "../../../data/events";
import { isScheduled, removeReminder, scheduleForEvent } from "../../../services/eventReminders";
import { useSettings } from "../../../store/settings";
import { useAppPalette } from "../../../theme/usePalette";
import { useTranslation } from "../../../i18n";

function createICS(
  title: string,
  start: string,
  description?: string,
  location?: string,
) {
  // Minimal ICS text (UTC naive for demo). Real apps should format correctly.
  const dt = start.replace(/[-: ]/g, "");
  const uid = `${dt}-${title}`;
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${uid}\nDTSTART:${dt}\nSUMMARY:${title}\nDESCRIPTION:${description ?? ""}\nLOCATION:${location ?? ""}\nEND:VEVENT\nEND:VCALENDAR`;
}

export const options = { href: null };

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const styles = createStyles(palette);

  const event = events.find((e) => e.id === id);
  const { eventReminders } = useSettings();
  const [scheduled, setScheduled] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!event?.id) return;
    isScheduled(event.id).then(setScheduled).catch(()=>{});
  }, [event?.id]);

  const addToCalendar = async () => {
    if (!event) return;
    try {
      // Open Google Calendar template as a simple cross-platform path
      const start = new Date(event.date);
      const toCalTime = (d: Date) =>
        `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}00Z`;
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const dates = `${toCalTime(start)}/${toCalTime(end)}`;
      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        details: event.description ?? "",
        location: event.isVirtual ? "Virtual" : (event.location ?? ""),
        dates,
      });
      const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else
        {await Share.share({
          message: createICS(
            event.title,
            event.date,
            event.description,
            event.location,
          ),
          title: "Event",
        });}
    } catch {
      await Share.share({
        message: createICS(
          event.title,
          event.date,
          event.description,
          event.location,
        ),
        title: "Event",
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: event?.title ?? "Event" }} />
      <View style={styles.container}>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        <Text style={styles.title}>{event?.title ?? "Event"}</Text>
        <Text style={styles.text}>
          {event?.description ?? "Details unavailable."}
        </Text>
        <Text style={styles.text}>When: {event?.date}</Text>
        <Text style={styles.text}>
          Where: {event?.isVirtual ? "Virtual" : (event?.location ?? "TBD")}
        </Text>
        {!!event && (
          <>
            <A11yPressable
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.8 },
              ]}
              onPress={async () => {
                if (!event) return;
                if (!eventReminders) {
                  Alert.alert('Reminders Disabled', 'Enable Event Reminders in Settings to schedule local notifications.');
                  return;
                }
                if (scheduled) {
                  await removeReminder(event.id);
                  setScheduled(false);
                  Alert.alert('Removed', 'Event reminder removed.');
                  return;
                }
                const res = await scheduleForEvent(event, 60);
                if (res.ok) {
                  setScheduled(true);
                  Alert.alert('Scheduled', 'Reminder set for 60 minutes before start.');
                } else if (res.reason === 'too-soon') {
                  Alert.alert('Too Soon', 'Event is starting too soon for a reminder.');
                } else if (res.reason === 'invalid-date') {
                  Alert.alert('Invalid Date', 'Cannot parse event date.');
                } else if (res.reason === 'no-permission') {
                  Alert.alert('Permission Needed', 'Enable notification permissions in system settings to schedule reminders.');
                } else {
                  Alert.alert('Failed', 'Unable to schedule reminder.');
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={scheduled ? t('a11y.removeEventReminder') : t('a11y.scheduleEventReminder')}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={styles.buttonText}>{scheduled ? 'Remove Reminder' : 'Add Reminder'}</Text>
            </A11yPressable>
            <View style={{ height: 8 }} />
            <A11yPressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={addToCalendar}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.addToCalendar')}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={styles.secondaryButtonText}>Add to Calendar</Text>
            </A11yPressable>
          </>
        )}
      </View>
    </>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    text: { fontSize: 16, color: palette.text, opacity: 0.95, marginBottom: 8 },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
      marginTop: 12,
    },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
    secondaryButton: {
      backgroundColor: palette.surface,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    secondaryButtonText: { color: palette.text, fontSize: 16, fontWeight: '700' },
  });
}
