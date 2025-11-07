import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";

// Lazy load Calendar to avoid crashes if expo-calendar is not available
let Calendar: any = null;
try {
  Calendar = require('expo-calendar');
} catch (err) {
  console.warn('[EventDetail] expo-calendar not available:', err);
}

import A11yPressable from '../../components/A11yPressable';
import { GapView } from "../../components/GapView";
import SettingsLink from "../../components/SettingsLink";
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { useAuth } from "../../context/AuthContext";
import { events } from "../../data/events";
import { useTranslation } from "../../i18n";
import { isScheduled, removeReminder, scheduleForEvent } from "../../services/eventReminders";
import { fsDeleteEvent, fsGetEvent, fsUpdateEvent } from "../../services/firestore";
import { deleteEventFromProduction, isFirestoreSyncAvailable, updateEventInProduction } from "../../services/firestoreEventSync";
import { useSettings } from "../../store/settings";
import { useAppPalette } from "../../theme/usePalette";
import { logError } from '../../utils/errorLogger';

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
  const router = useRouter();
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [event, setEvent] = React.useState<any>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [editData, setEditData] = React.useState<any>({});
  
  // Check if user is creator or admin
  const canEdit = React.useMemo(() => {
    if (isAdmin) return true;
    if (!event || !user) return false;
    return event.createdBy === user.uid;
  }, [isAdmin, event, user]);

  // Load event from Firestore or local data
  React.useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      try {
        // Try Firestore first
        const fsEvent = await fsGetEvent(id);
        if (fsEvent) {
          setEvent(fsEvent);
        } else {
          // Try local AsyncStorage cache for user-created events
          const cached = await AsyncStorage.getItem('events:local:v1');
          if (cached) {
            const localCreated = JSON.parse(cached);
            const cachedEvent = localCreated.find((e: any) => e.id === id);
            if (cachedEvent) {
              setEvent(cachedEvent);
              setLoading(false);
              return;
            }
          }
          
          // Fall back to static local events data
          const localEvent = events.find((e) => e.id === id);
          setEvent(localEvent || null);
        }
      } catch (error) {
        logError('EventDetail', 'Failed to load event', error);
        const localEvent = events.find((e) => e.id === id);
        setEvent(localEvent || null);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  const { eventReminders } = useSettings();
  const [scheduled, setScheduled] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!event?.id) return;
    isScheduled(event.id).then(setScheduled).catch(()=>{});
  }, [event?.id]);

  const handleEdit = () => {
    setEditData({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location || '',
      isVirtual: event.isVirtual || false,
      asl: event.asl || false,
      captions: event.captions || false,
      stepFree: event.stepFree || false,
      sensorySpace: event.sensorySpace || false,
    });
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      // First update in old Firestore collection (for backward compatibility)
      const fsSuccess = await fsUpdateEvent(id, editData);
      
      // Also sync to both production and preview collections
      let prodSuccess = false;
      let previewSuccess = false;
      
      if (user?.uid) {
        const isSyncAvailable = await isFirestoreSyncAvailable();
        if (isSyncAvailable) {
          try {
            // Update production collection
            prodSuccess = await updateEventInProduction(id, {
              title: editData.title,
              description: editData.description,
              date: editData.date ? new Date(editData.date) : undefined,
              location: editData.location,
              isVirtual: editData.isVirtual,
              asl: editData.asl,
              captions: editData.captions,
              stepFree: editData.stepFree,
              sensorySpace: editData.sensorySpace,
            }, user.uid, 'events_production');
            
            // Also update preview collection
            previewSuccess = await updateEventInProduction(id, {
              title: editData.title,
              description: editData.description,
              date: editData.date ? new Date(editData.date) : undefined,
              location: editData.location,
              isVirtual: editData.isVirtual,
              asl: editData.asl,
              captions: editData.captions,
              stepFree: editData.stepFree,
              sensorySpace: editData.sensorySpace,
            }, user.uid, 'events_preview');
          } catch (syncError) {
            console.warn('Firestore sync error during update:', syncError);
          }
        }
      }
      
      // Update local AsyncStorage cache if this is a locally-created event
      if (id?.startsWith('evt-')) {
        try {
          const cached = await AsyncStorage.getItem('events:local:v1');
          if (cached) {
            const localEvents = JSON.parse(cached);
            const updatedLocal = localEvents.map((e: any) =>
              e.id === id ? { ...e, ...editData } : e
            );
            await AsyncStorage.setItem('events:local:v1', JSON.stringify(updatedLocal));
          }
        } catch (err) {
          console.warn('Failed to update local cache:', err);
        }
      }
      
      if (fsSuccess) {
        setEvent({ ...event, ...editData });
        setEditMode(false);
        
        if (prodSuccess && previewSuccess) {
          Alert.alert(
            t('common.success', 'Success'),
            t('eventsFeature.edit.saved', 'Event updated successfully and synced to website')
          );
        } else if (prodSuccess || previewSuccess) {
          Alert.alert(
            t('common.success', 'Success'),
            'Event updated. Website sync may be partially unavailable.'
          );
        } else {
          Alert.alert(
            t('common.success', 'Success'),
            t('eventsFeature.edit.saved', 'Event updated successfully')
          );
        }
      } else {
        Alert.alert(t('common.error', 'Error'), t('eventsFeature.edit.failed', 'Failed to update event'));
      }
    } catch (error) {
      logError('EventDetail', 'Save failed', error);
      Alert.alert(t('common.error', 'Error'), t('eventsFeature.edit.failed', 'Failed to update event'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('eventsFeature.delete.confirmTitle', 'Delete Event'),
      t('eventsFeature.delete.confirmBody', 'Are you sure you want to delete this event? This cannot be undone.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from old Firestore collection
              const fsSuccess = await fsDeleteEvent(id);
              
              // Also delete from both events_production and events_preview
              let prodSuccess = false;
              let previewSuccess = false;
              
              if (user?.uid) {
                try {
                  prodSuccess = await deleteEventFromProduction(id, 'events_production');
                  previewSuccess = await deleteEventFromProduction(id, 'events_preview');
                } catch (syncError) {
                  console.warn('Firestore sync error during delete:', syncError);
                }
              }
              
              if (fsSuccess) {
                let message = t('eventsFeature.delete.success', 'Event deleted');
                if (prodSuccess && previewSuccess) {
                  message = 'Event deleted from all platforms';
                } else if (prodSuccess || previewSuccess) {
                  message = 'Event deleted. Some sync platforms may be unavailable.';
                }
                
                Alert.alert(
                  t('common.success', 'Success'),
                  message,
                  [{ text: t('common.ok', 'OK'), onPress: () => router.back() }]
                );
              } else {
                Alert.alert(t('common.error', 'Error'), t('eventsFeature.delete.failed', 'Failed to delete event'));
              }
            } catch (error) {
              logError('EventDetail', 'Delete failed', error);
              Alert.alert(t('common.error', 'Error'), t('eventsFeature.delete.failed', 'Failed to delete event'));
            }
          },
        },
      ]
    );
  };

  const shareToSocials = async () => {
    if (!event) return;
    const message = `📅 ${event.title}\n\n${event.description || ''}\n\n📍 ${event.isVirtual ? 'Virtual Event' : (event.location || 'TBD')}\n🗓️ ${event.date}\n\n✨ Powered by 3mpwr App\n🔗 https://3mpwrapp.pages.dev/events/`;
    
    try {
      await Share.share({
        message,
        title: event.title,
      });
    } catch (error) {
      logError('EventDetail', 'Share failed', error);
    }
  };

  const addToCalendar = async () => {
    if (!event) return;
    
    // Check if Calendar module is available
    if (!Calendar) {
      Alert.alert(
        t('common.permission', 'Permission Required'),
        'Calendar functionality is not available in this environment. Please try using the subscription calendar feature from the Events tab instead.'
      );
      return;
    }
    
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.permission', 'Permission Required'),
          t('eventsFeature.calendar.permissionDenied', 'Calendar permission is required to add events. Please enable it in your device settings.')
        );
        return;
      }

      // Get default calendar or create one
      let calendarId: string | undefined;
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Try to find default calendar
      const defaultCalendar = calendars.find((cal: any) => cal.allowsModifications && cal.source.name !== 'Holidays');
      
      if (defaultCalendar) {
        calendarId = defaultCalendar.id;
      } else {
        // Create a new calendar if no suitable one exists
        const defaultCalendarSource = Platform.OS === 'ios'
          ? await Calendar.getDefaultCalendarAsync()
          : { isLocalAccount: true, name: '3mpwr Events' };

        calendarId = await Calendar.createCalendarAsync({
          title: '3mpwr Events',
          color: palette.primary,
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: Platform.OS === 'ios' 
            ? (defaultCalendarSource as any).source.id 
            : undefined,
          source: Platform.OS === 'android'
            ? defaultCalendarSource as any
            : undefined,
          name: '3mpwr Events',
          ownerAccount: '3mpwr',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
      }

      // Parse event date
      const startDate = new Date(event.date);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

      // Create the event
      await Calendar.createEventAsync(calendarId, {
        title: event.title,
        startDate,
        endDate,
        location: event.isVirtual ? t('eventsFeature.chips.virtual','Virtual') : (event.location ?? ''),
        notes: event.description ?? '',
        timeZone: 'America/New_York', // You can make this dynamic based on user location
        alarms: [{ relativeOffset: -60 }], // Reminder 1 hour before
      });

      Alert.alert(
        t('common.success', 'Success'),
        t('eventsFeature.calendar.added', 'Event added to your calendar!')
      );
    } catch (error) {
      logError('EventDetail', 'Failed to add to calendar', error);
      
      // Fallback to Google Calendar web link
      try {
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
        if (supported) {
          await Linking.openURL(url);
        } else {
          throw new Error('Cannot open calendar');
        }
      } catch {
        // Last resort: share ICS file
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
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: event?.title ?? t('eventsFeature.detailTitle','Event') }} />
      <View style={styles.container}>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        
        {loading && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.text}>{t('common.loading', 'Loading...')}</Text>
          </View>
        )}
        
        {!loading && !event && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.title}>{t('common.notFound', 'Not Found')}</Text>
            <Text style={styles.text}>{t('eventsFeature.notFound', 'This event could not be found.')}</Text>
          </View>
        )}
        
        {!loading && event && !editMode && (
          <>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.text}>{event.description ?? t('eventsFeature.detailUnavailable','Details unavailable.')}</Text>
            <Text style={styles.text}>{t('eventsFeature.whenLabel','When:')} {event.date}</Text>
            <Text style={styles.text}>
              {t('eventsFeature.whereLabel','Where:')} {event.isVirtual ? t('eventsFeature.chips.virtual','Virtual') : (event.location ?? t('eventsFeature.tbd','TBD'))}
            </Text>
            <GapView gap={8} style={{ flexDirection:'row', flexWrap:'wrap', marginBottom: 8 }}>
              {event.isVirtual && <Chip label={t('eventsFeature.chips.virtual','Virtual')} />}
              {event.asl && <Chip label={t('eventsFeature.chips.asl','ASL')} />}
              {event.captions && <Chip label={t('eventsFeature.chips.captions','Captions')} />}
              {event.stepFree && <Chip label={t('eventsFeature.chips.stepFree','Step-free')} />}
              {event.sensorySpace && <Chip label={t('eventsFeature.chips.sensory','Sensory')} />}
            </GapView>

            {/* Admin Actions */}
            {canEdit && (
              <GapView gap={8} style={{ marginTop: 12, marginBottom: 12 }}>
                <A11yPressable
                  style={({ pressed }) => [
                    styles.adminButton,
                    { backgroundColor: palette.warning || palette.primary },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleEdit}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.edit', 'Edit')}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text style={styles.buttonText}>✏️ {t('common.edit', 'Edit')}</Text>
                </A11yPressable>
                <A11yPressable
                  style={({ pressed }) => [
                    styles.adminButton,
                    { backgroundColor: palette.destructive || palette.error },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleDelete}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.delete', 'Delete')}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text style={styles.buttonText}>🗑️ {t('common.delete', 'Delete')}</Text>
                </A11yPressable>
              </GapView>
            )}

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
                styles.shareButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={shareToSocials}
              accessibilityRole="button"
              accessibilityLabel={t('eventsFeature.shareToSocials', 'Share to social media')}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={styles.shareButtonText}>🔗 {t('eventsFeature.shareToSocials', 'Share to Socials')}</Text>
            </A11yPressable>
          </>
        )}

        {/* Edit Modal */}
        {!loading && event && editMode && (
          <Modal visible={editMode} animationType="slide" transparent={false}>
            <View style={[styles.container, { paddingTop: 60 }]}>
              <Text style={styles.title}>{t('eventsFeature.edit.title', 'Edit Event')}</Text>
              <ScrollView style={{ flex: 1 }}>
                <GapView gap={12}>
                  <View>
                    <Text style={styles.label}>{t('eventsFeature.create.titleLabel', 'Title')}</Text>
                    <TextInput
                      style={styles.input}
                      value={editData.title}
                      onChangeText={(text) => setEditData({ ...editData, title: text })}
                      placeholder={t('eventsFeature.create.titlePlaceholder', 'Event title')}
                      placeholderTextColor={palette.muted}
                    />
                  </View>
                  <View>
                    <Text style={styles.label}>{t('eventsFeature.create.descriptionLabel', 'Description')}</Text>
                    <TextInput
                      style={[styles.input, { minHeight: 100 }]}
                      value={editData.description}
                      onChangeText={(text) => setEditData({ ...editData, description: text })}
                      placeholder={t('eventsFeature.create.descriptionPlaceholder', 'Event description')}
                      placeholderTextColor={palette.muted}
                      multiline
                    />
                  </View>
                  <View>
                    <Text style={styles.label}>{t('eventsFeature.create.dateLabel', 'Date/Time')}</Text>
                    <TextInput
                      style={styles.input}
                      value={editData.date}
                      onChangeText={(text) => setEditData({ ...editData, date: text })}
                      placeholder="2025-12-31 18:00"
                      placeholderTextColor={palette.muted}
                    />
                  </View>
                  <View>
                    <Text style={styles.label}>{t('eventsFeature.create.locationLabel', 'Location')}</Text>
                    <TextInput
                      style={styles.input}
                      value={editData.location}
                      onChangeText={(text) => setEditData({ ...editData, location: text })}
                      placeholder={t('eventsFeature.create.locationPlaceholder', 'Address or online link')}
                      placeholderTextColor={palette.muted}
                    />
                  </View>
                </GapView>
                <View style={{ height: 80 }} />
              </ScrollView>
              <GapView gap={8} style={{ paddingBottom: 20 }}>
                <A11yPressable
                  style={[styles.button, { backgroundColor: palette.primary }]}
                  onPress={handleSaveEdit}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.save', 'Save')}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text style={styles.buttonText}>{t('common.save', 'Save')}</Text>
                </A11yPressable>
                <A11yPressable
                  style={[styles.secondaryButton]}
                  onPress={() => setEditMode(false)}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.cancel', 'Cancel')}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text style={styles.secondaryButtonText}>{t('common.cancel', 'Cancel')}</Text>
                </A11yPressable>
              </GapView>
            </View>
          </Modal>
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
    label: { fontSize: 14, fontWeight: '600', color: palette.text, marginBottom: 4 },
    input: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      fontSize: 16,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
      marginTop: 12,
    },
    buttonText: { color: palette.onPrimary, fontSize: 16, textAlign: 'center' },
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
    secondaryButtonText: { color: palette.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
    adminButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
    },
    shareButton: {
      backgroundColor: palette.card,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
      borderWidth: 2,
      borderColor: palette.primary,
    },
    shareButtonText: { color: palette.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
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
