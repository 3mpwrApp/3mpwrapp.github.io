import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { HIT_SLOP_12 } from "../constants/A11Y";
import { MAX_FONT_SCALE } from "../hooks/useA11y";
import { useTranslation } from "../i18n";
import {
    getNotificationPreferences,
    setNotificationPreferences,
    type NotificationPreferences as PushPrefsType,
} from "../services/notificationPreferences";
import { sendTestLocal, setupAsync } from "../services/notifications";
import { useSettings } from "../store/settings";
import { useTextScale } from "../theme/typography";
import { useAppPalette } from "../theme/usePalette";

import AccessibilityToggle from "./AccessibilityToggle";

export default function NotificationPreferences() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const { t } = useTranslation();
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    notificationSound,
    setNotificationSound,
    notificationVibration,
    setNotificationVibration,
    emergencyAlerts,
    setEmergencyAlerts,
    wellnessReminders,
    setWellnessReminders,
    eventReminders,
    setEventReminders,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
    setQuietHoursEnabled,
    setQuietHoursStart,
    setQuietHoursEnd,
  } = useSettings();

  // Push notification preferences state
  const [pushPrefs, setPushPrefs] = React.useState<PushPrefsType>({
    events: true,
    campaigns: true,
    reminders: true,
    rsvpConfirmations: true,
    capacityAlerts: true,
    cancellations: true,
  });

  React.useEffect(() => {
    // Setup notifications when component mounts
    if (notificationsEnabled) {
      setupAsync();
    }
    // Load push preferences
    loadPushPreferences();
  }, [notificationsEnabled]);

  const loadPushPreferences = async () => {
    try {
      const stored = await getNotificationPreferences();
      setPushPrefs(stored);
    } catch (error) {
      console.warn('[NotificationPreferences] Failed to load push prefs:', error);
    }
  };

  const updatePushPref = async (key: keyof PushPrefsType, value: boolean) => {
    const updated = { ...pushPrefs, [key]: value };
    setPushPrefs(updated);
    await setNotificationPreferences({ [key]: value });
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await setupAsync();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive alerts from 3mpwr App.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    setNotificationsEnabled(enabled);
  };

  const testNotification = async () => {
    try {
      await sendTestLocal();
      Alert.alert("Test Sent", "If you don't see a notification, check your device notification settings.");
  } catch {
      Alert.alert("Test Failed", "Unable to send test notification. Please check your settings.");
    }
  };

  const suggestQuietHours = () => {
    // Simple heuristic: prefer 22:00–07:00 by default; if current start is later than 22:00, pick 23:00–06:00
    const start = quietHoursStart || '22:00';
    let newStart = '22:00';
    let newEnd = '07:00';
    if (start >= '22:30' || start === '23:00' || start === '00:00') {
      newStart = '23:00';
      newEnd = '06:00';
    }
    setQuietHoursStart(newStart);
    setQuietHoursEnd(newEnd);
    setQuietHoursEnabled(true);
    Alert.alert(t('common.success','Success'), t('quietHours.applied','Quiet hours updated'));
  };

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel={t("settings.notifications.title", "Notification preferences")}
    >
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t("settings.notifications.title", "Notifications")}
      </Text>
      <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t("settings.notifications.subtitle", "Choose what alerts you receive")}
      </Text>

      <AccessibilityToggle
        title={t("settings.notifications.enabled", "Enable Notifications")}
        description={t("settings.notifications.enabledDesc", "Receive app notifications")}
        value={notificationsEnabled}
        onValueChange={handleNotificationsToggle}
        icon="notifications"
        testID="notifications-enabled-toggle"
      />

      {notificationsEnabled && (
        <>
          <AccessibilityToggle
            title={t('settings.notifications.quietHoursEnabled', 'Quiet Hours Enabled')}
            description={t('settings.notifications.quietHoursEnabledDesc', 'Silence push notifications during configured hours')}
            value={quietHoursEnabled !== false}
            onValueChange={setQuietHoursEnabled}
            icon="moon"
            testID="quiet-hours-enabled-toggle"
          />
          {quietHoursEnabled !== false && (
            <View style={{ marginLeft: 12, marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>{t('settings.notifications.quietHoursWindow', 'Quiet Hours Window')}</Text>
              <Text style={styles.testDescription}>{t('settings.notifications.quietHoursWindowDesc', 'Current window')}: {quietHoursStart || '22:00'} - {quietHoursEnd || '07:00'}</Text>
              <AccessibilityToggle
                title={t('quietHours.suggest','Suggest quiet hours')}
                description={t('quietHours.suggestHint','Pick a window based on your recent app usage times')}
                value={false}
                onValueChange={suggestQuietHours}
                icon="bulb"
                testID="quiet-hours-suggest"
              />
              {/* Time selection buttons - tap to cycle through preset times */}
              <View style={styles.timePickerRow}>
                <Pressable
                  style={[styles.timePickerButton, { backgroundColor: palette.card, borderColor: palette.primary }]}
                  onPress={() => {
                    const presets = ['21:00','22:00','23:00','00:00'];
                    const idx = presets.indexOf(quietHoursStart || '22:00');
                    setQuietHoursStart(presets[(idx+1)%presets.length]);
                  }}
                  hitSlop={HIT_SLOP_12}
                  accessibilityRole="button"
                  accessibilityLabel={t('settings.notifications.quietHoursStart', 'Start Hour')}
                  accessibilityHint={t('settings.notifications.quietHoursStartHint', 'Tap to change. Current: ') + (quietHoursStart || '22:00')}
                  testID="quiet-hours-start-toggle"
                >
                  <Ionicons name="moon" size={20} color={palette.primary} />
                  <Text style={[styles.timePickerLabel, { color: palette.textSecondary }]}>{t('settings.notifications.startLabel', 'Start')}</Text>
                  <Text style={[styles.timePickerValue, { color: palette.text }]}>{quietHoursStart || '22:00'}</Text>
                  <Ionicons name="chevron-forward" size={16} color={palette.textSecondary} />
                </Pressable>
                
                <Pressable
                  style={[styles.timePickerButton, { backgroundColor: palette.card, borderColor: palette.primary }]}
                  onPress={() => {
                    const presets = ['06:00','07:00','08:00','09:00'];
                    const idx = presets.indexOf(quietHoursEnd || '07:00');
                    setQuietHoursEnd(presets[(idx+1)%presets.length]);
                  }}
                  hitSlop={HIT_SLOP_12}
                  accessibilityRole="button"
                  accessibilityLabel={t('settings.notifications.quietHoursEnd', 'End Hour')}
                  accessibilityHint={t('settings.notifications.quietHoursEndHint', 'Tap to change. Current: ') + (quietHoursEnd || '07:00')}
                  testID="quiet-hours-end-toggle"
                >
                  <Ionicons name="sunny" size={20} color={palette.warning} />
                  <Text style={[styles.timePickerLabel, { color: palette.textSecondary }]}>{t('settings.notifications.endLabel', 'End')}</Text>
                  <Text style={[styles.timePickerValue, { color: palette.text }]}>{quietHoursEnd || '07:00'}</Text>
                  <Ionicons name="chevron-forward" size={16} color={palette.textSecondary} />
                </Pressable>
              </View>
            </View>
          )}
          <AccessibilityToggle
            title={t("settings.notifications.sound", "Notification Sound")}
            description={t("settings.notifications.soundDesc", "Play sound with notifications")}
            value={notificationSound}
            onValueChange={setNotificationSound}
            icon="volume-high"
            testID="notification-sound-toggle"
          />

          <AccessibilityToggle
            title={t("settings.notifications.vibration", "Vibration")}
            description={t("settings.notifications.vibrationDesc", "Vibrate for notifications")}
            value={notificationVibration}
            onValueChange={setNotificationVibration}
            icon="phone-portrait"
            testID="notification-vibration-toggle"
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Alert Types
          </Text>

          <AccessibilityToggle
            title={t("settings.notifications.emergency", "Emergency Alerts")}
            description={t("settings.notifications.emergencyDesc", "Critical safety notifications")}
            value={emergencyAlerts}
            onValueChange={setEmergencyAlerts}
            icon="warning"
            testID="emergency-alerts-toggle"
          />

          <AccessibilityToggle
            title={t("settings.notifications.wellness", "Wellness Reminders")}
            description={t("settings.notifications.wellnessDesc", "Daily wellness check-ins")}
            value={wellnessReminders}
            onValueChange={setWellnessReminders}
            icon="heart"
            testID="wellness-reminders-toggle"
          />

          <AccessibilityToggle
            title={t("settings.notifications.events", "Event Reminders")}
            description={t("settings.notifications.eventsDesc", "Upcoming event notifications")}
            value={eventReminders}
            onValueChange={setEventReminders}
            icon="calendar"
            testID="event-reminders-toggle"
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Push Notification Types
          </Text>

          <View style={styles.pushPrefsContainer}>
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>New Events</Text>
                <Text style={styles.prefDescription}>
                  Get notified when new events are created
                </Text>
              </View>
              <Switch
                value={pushPrefs.events}
                onValueChange={(val) => updatePushPref('events', val)}
                trackColor={{ false: palette.muted, true: palette.primary }}
                thumbColor={pushPrefs.events ? palette.onPrimary : palette.surface}
                testID="push-events-toggle"
              />
            </View>

            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>New Campaigns</Text>
                <Text style={styles.prefDescription}>
                  Get notified when new campaigns are launched
                </Text>
              </View>
              <Switch
                value={pushPrefs.campaigns}
                onValueChange={(val) => updatePushPref('campaigns', val)}
                trackColor={{ false: palette.muted, true: palette.primary }}
                thumbColor={pushPrefs.campaigns ? palette.onPrimary : palette.surface}
                testID="push-campaigns-toggle"
              />
            </View>

            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>Event Reminders</Text>
                <Text style={styles.prefDescription}>
                  Reminders 24hr and 1hr before events you've RSVP'd to
                </Text>
              </View>
              <Switch
                value={pushPrefs.reminders}
                onValueChange={(val) => updatePushPref('reminders', val)}
                trackColor={{ false: palette.muted, true: palette.primary }}
                thumbColor={pushPrefs.reminders ? palette.onPrimary : palette.surface}
                testID="push-reminders-toggle"
              />
            </View>

            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>RSVP Confirmations</Text>
                <Text style={styles.prefDescription}>
                  Confirmation when you successfully RSVP to an event
                </Text>
              </View>
              <Switch
                value={pushPrefs.rsvpConfirmations}
                onValueChange={(val) => updatePushPref('rsvpConfirmations', val)}
                trackColor={{ false: palette.muted, true: palette.primary }}
                thumbColor={pushPrefs.rsvpConfirmations ? palette.onPrimary : palette.surface}
                testID="push-rsvp-toggle"
              />
            </View>

            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>Capacity Alerts</Text>
                <Text style={styles.prefDescription}>
                  Alert when events you're interested in are filling up
                </Text>
              </View>
              <Switch
                value={pushPrefs.capacityAlerts}
                onValueChange={(val) => updatePushPref('capacityAlerts', val)}
                trackColor={{ false: palette.muted, true: palette.primary }}
                thumbColor={pushPrefs.capacityAlerts ? palette.onPrimary : palette.surface}
                testID="push-capacity-toggle"
              />
            </View>

            <View style={[styles.prefRow, styles.lastPrefRow]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>Event Cancellations</Text>
                <Text style={styles.prefDescription}>
                  Important alerts when events are cancelled
                </Text>
              </View>
              <Switch
                value={pushPrefs.cancellations}
                onValueChange={(val) => updatePushPref('cancellations', val)}
                trackColor={{ false: palette.muted, true: palette.primary }}
                thumbColor={pushPrefs.cancellations ? palette.onPrimary : palette.surface}
                testID="push-cancellations-toggle"
              />
            </View>
          </View>
        </>
      )}

      {notificationsEnabled && (
        <View style={styles.testSection}>
          <Text style={styles.testTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Test Notifications
          </Text>
          <Text style={styles.testDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Send a test notification to verify your settings are working correctly.
          </Text>
          <AccessibilityToggle
            title="Send Test Notification"
            description="Verify notifications are working"
            value={false}
            onValueChange={testNotification}
            icon="send"
            testID="test-notification-button"
          />
        </View>
      )}

      <View style={styles.note}>
        <Text style={styles.noteText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          You can also manage notification settings from your device&apos;s system settings. 
          Emergency alerts are always enabled when notifications are on to ensure you receive critical safety information.
        </Text>
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    title: {
      fontSize: Math.round(18 * factor),
      fontWeight: "700",
      color: palette.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: Math.round(14 * factor),
      color: palette.textSecondary,
      marginBottom: 16,
      lineHeight: Math.round(20 * factor),
    },
    divider: {
      height: 1,
      backgroundColor: palette.muted,
      marginVertical: 16,
    },
    sectionTitle: {
      fontSize: Math.round(16 * factor),
      fontWeight: "600",
      color: palette.text,
      marginBottom: 12,
    },
    testSection: {
      marginTop: 16,
      padding: 16,
      backgroundColor: palette.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    testTitle: {
      fontSize: Math.round(16 * factor),
      fontWeight: "600",
      color: palette.text,
      marginBottom: 4,
    },
    testDescription: {
      fontSize: Math.round(13 * factor),
      color: palette.textSecondary,
      marginBottom: 12,
      lineHeight: Math.round(18 * factor),
    },
    note: {
      padding: 12,
      backgroundColor: palette.card,
      borderRadius: 8,
      marginTop: 16,
    },
    noteText: {
      fontSize: Math.round(12 * factor),
      color: palette.textSecondary,
      lineHeight: Math.round(16 * factor),
    },
    pushPrefsContainer: {
      backgroundColor: palette.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    prefRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    lastPrefRow: {
      borderBottomWidth: 0,
    },
    prefLabel: {
      fontSize: Math.round(15 * factor),
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    prefDescription: {
      fontSize: Math.round(12 * factor),
      color: palette.muted,
      lineHeight: Math.round(16 * factor),
    },
    timePickerRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    timePickerButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      gap: 8,
      minHeight: 48,
    },
    timePickerLabel: {
      fontSize: Math.round(12 * factor),
    },
    timePickerValue: {
      fontSize: Math.round(16 * factor),
      fontWeight: '600',
      flex: 1,
    },
  });
}