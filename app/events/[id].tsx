import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import React from 'react';
import { Alert, Share, StyleSheet, Text, View } from "react-native";

import A11yPressable from '../../components/A11yPressable';
import SettingsLink from "../../components/SettingsLink";
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { events } from "../../data/events";
import { useTranslation } from "../../i18n";
import { isScheduled, removeReminder, scheduleForEvent } from "../../services/eventReminders";
import { useSettings } from "../../store/settings";
import { useAppPalette } from "../../theme/usePalette";

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
        location: event.isVirtual ? t('eventsFeature.chips.virtual','Virtual') : (event.location ?? ""),
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
          title: t('eventsFeature.shareTitle','Event'),
        });}
    } catch {
      await Share.share({
        message: createICS(
          event.title,
          event.date,
          event.description,
          event.location,
        ),
        title: t('eventsFeature.shareTitle','Event'),
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: event?.title ?? t('eventsFeature.detailTitle','Event') }} />
      <View style={styles.container}>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        <Text style={styles.title}>{event?.title ?? t('eventsFeature.detailTitle','Event')}</Text>
        <Text style={styles.text}>
          {event?.description ?? t('eventsFeature.detailUnavailable','Details unavailable.')}
        </Text>
        <Text style={styles.text}>{t('eventsFeature.whenLabel','When:')} {event?.date}</Text>
        <Text style={styles.text}>
          {t('eventsFeature.whereLabel','Where:')} {event?.isVirtual ? t('eventsFeature.chips.virtual','Virtual') : (event?.location ?? t('eventsFeature.tbd','TBD'))}
        </Text>
        {!!event && (
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom: 8 }}>
            {event.isVirtual && (
              <Chip label={t('eventsFeature.chips.virtual','Virtual')} />
            )}
            {event.asl && (
              <Chip label={t('eventsFeature.chips.asl','ASL')} />
            )}
            {event.captions && (
              <Chip label={t('eventsFeature.chips.captions','Captions')} />
            )}
            {event.stepFree && (
              <Chip label={t('eventsFeature.chips.stepFree','Step-free')} />
            )}
            {event.sensorySpace && (
              <Chip label={t('eventsFeature.chips.sensory','Sensory')} />
            )}
          </View>
        )}
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
                  Alert.alert(t('eventsFeature.reminders.disabledTitle','Reminders Disabled'), t('eventsFeature.reminders.disabledBody','Enable Event Reminders in Settings to schedule local notifications.'));
                  return;
                }
                if (scheduled) {
                  await removeReminder(event.id);
                  setScheduled(false);
                  Alert.alert(t('common.success','Success'), t('eventsFeature.reminders.removed','Event reminder removed.'));
                  return;
                }
                const res = await scheduleForEvent(event, 60);
                if (res.ok) {
                  setScheduled(true);
                  Alert.alert(t('common.success','Success'), t('eventsFeature.reminders.scheduled','Reminder set for 60 minutes before start.'));
                } else if (res.reason === 'too-soon') {
                  Alert.alert(t('common.error','Error'), t('eventsFeature.reminders.tooSoon','Event is starting too soon for a reminder.'));
                } else if (res.reason === 'invalid-date') {
                  Alert.alert(t('common.error','Error'), t('eventsFeature.reminders.invalidDate','Cannot parse event date.'));
                } else if (res.reason === 'no-permission') {
                  Alert.alert(t('common.error','Error'), t('eventsFeature.reminders.disabledBody','Enable Event Reminders in Settings to schedule local notifications.'));
                } else {
                  Alert.alert(t('common.error','Error'), t('eventsFeature.reminders.failed','Unable to schedule reminder.'));
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={scheduled ? t('a11y.removeEventReminder') : t('a11y.scheduleEventReminder')}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={styles.buttonText}>{scheduled ? t('eventsFeature.reminders.remove','Remove Reminder') : t('eventsFeature.reminders.add','Add Reminder')}</Text>
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
              <Text style={styles.secondaryButtonText}>{t('eventsFeature.reminders.addCalendar','Add to Calendar')}</Text>
            </A11yPressable>
            {!!event.location && !event.isVirtual && (
              <View style={{ height: 8 }} />
            )}
            {!!event.location && !event.isVirtual && (
              <A11yPressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={async () => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || '')}`;
                  const can = await Linking.canOpenURL(url);
                  if (can) await Linking.openURL(url);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${t('home.guide.open','Open')} Maps`}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={styles.secondaryButtonText}>{`${t('home.guide.open','Open')} Maps`}</Text>
              </A11yPressable>
            )}
            <View style={{ height: 8 }} />
            <A11yPressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={async () => {
                try {
                  await Share.share({
                    message: `${event.title}\n${event.date}\n${event.isVirtual? t('eventsFeature.chips.virtual','Virtual'): (event.location||t('eventsFeature.tbd','TBD'))}\n\n${event.description || ''}`.trim(),
                    title: event.title,
                  });
                } catch {}
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t('common.share','Share')} ${event?.title ?? ''}`}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={styles.secondaryButtonText}>{t('common.share','Share')}</Text>
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

function Chip({ label }: { label: string }) {
  const palette = useAppPalette();
  return (
    <View style={{ backgroundColor: palette.card, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
      <Text style={{ color: palette.text, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
