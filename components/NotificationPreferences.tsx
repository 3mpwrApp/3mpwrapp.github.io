import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { MAX_FONT_SCALE } from "../hooks/useA11y";
import { useTranslation } from "../i18n";
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
  } = useSettings();

  React.useEffect(() => {
    // Setup notifications when component mounts
    if (notificationsEnabled) {
      setupAsync();
    }
  }, [notificationsEnabled]);

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await setupAsync();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive alerts from Empowr.",
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
    } catch (error) {
      Alert.alert("Test Failed", "Unable to send test notification. Please check your settings.");
    }
  };

  return (
    <View 
      style={styles.container}
      accessible
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
      color: palette.text,
      opacity: 0.7,
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
      color: palette.text,
      opacity: 0.7,
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
      color: palette.text,
      opacity: 0.7,
      lineHeight: Math.round(16 * factor),
    },
  });
}