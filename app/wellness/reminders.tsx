/**
 * Wellness Reminders Settings Screen
 * 
 * Configure customizable notifications for wellness features
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import DisclaimerBanner from '../../components/DisclaimerBanner';
import GapView from '../../components/GapView';
import ResponsiveScreenWrapper from '../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import {
    cancelAllReminders,
    scheduleAllReminders,
    useWellnessReminders,
    type WellnessReminder,
    type WellnessReminderType,
} from '../../services/wellnessReminders';
import { useAppPalette } from '../../theme/usePalette';

const REMINDER_ICONS: Record<WellnessReminderType, string> = {
  mood_checkin: 'heart',
  pacing_break: 'sync',
  medication: 'medkit',
  exercise: 'fitness',
  hydration: 'water',
  rest_time: 'bed',
  symptom_log: 'analytics',
  sleep_prep: 'moon',
  gratitude: 'heart-circle',
  breathing: 'body',
};

const REMINDER_DESCRIPTIONS: Record<WellnessReminderType, string> = {
  mood_checkin: 'Regular check-ins to track your emotional well-being',
  pacing_break: 'Automatic reminders to rest and preserve energy',
  medication: 'Never miss your medication schedule',
  exercise: 'Gentle prompts for movement and stretching',
  hydration: 'Stay hydrated throughout the day',
  rest_time: 'Scheduled rest breaks for recovery',
  symptom_log: 'Daily symptom tracking reminders',
  sleep_prep: 'Prepare for restful sleep',
  gratitude: 'Daily gratitude practice',
  breathing: 'Mindful breathing exercises',
};

export default function WellnessRemindersScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { reminders, loading, toggleReminder, refresh } = useWellnessReminders();
  const [syncing, setSyncing] = useState(false);

  const handleToggle = async (id: string, currentValue: boolean) => {
    try {
      await toggleReminder(id, !currentValue);
    } catch {
      Alert.alert(
        t('wellnessReminders.error.title', 'Error'),
        t('wellnessReminders.error.toggle', 'Could not update reminder')
      );
    }
  };

  const handleTestNotification = async (reminder: WellnessReminder) => {
    if (Platform.OS === 'web') {
      Alert.alert(
        t('wellnessReminders.notAvailable', 'Not Available'),
        t('wellnessReminders.webNotSupported', 'Notifications are not supported on web')
      );
      return;
    }

    try {
      const Notifications = await import('expo-notifications');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: reminder.sound === 'none' ? undefined : 'default',
        },
        trigger: { seconds: 2 } as any,
      });
      
      Alert.alert(
        t('wellnessReminders.test.title', 'Test Sent'),
        t('wellnessReminders.test.message', 'Notification will appear in 2 seconds')
      );
    } catch {
      Alert.alert(
        t('wellnessReminders.error.title', 'Error'),
        t('wellnessReminders.error.test', 'Could not send test notification')
      );
    }
  };

  const handleRescheduleAll = async () => {
    setSyncing(true);
    try {
      await cancelAllReminders();
      await scheduleAllReminders();
      await refresh();
      Alert.alert(
        t('wellnessReminders.reschedule.success', 'Success'),
        t('wellnessReminders.reschedule.message', 'All reminders have been rescheduled')
      );
    } catch {
      Alert.alert(
        t('wellnessReminders.error.title', 'Error'),
        t('wellnessReminders.error.reschedule', 'Could not reschedule reminders')
      );
    } finally {
      setSyncing(false);
    }
  };

  const enabledCount = reminders.filter(r => r.enabled).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: t('wellnessReminders.title', 'Wellness Reminders'),
          headerShown: true,
        }}
      />
      <ResponsiveScreenWrapper>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
        >
          <DisclaimerBanner type="general" compact={true} />

          <View style={[styles.header, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
            <Text
              style={[styles.headerTitle, { color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              📬 {t('wellnessReminders.subtitle', 'Customize Your Reminders')}
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t(
                'wellnessReminders.description',
                'Set up personalized reminders to support your wellness routine. All notifications respect your quiet hours.'
              )}
            </Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: palette.primary }]}>
                  {enabledCount}
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>
                  {t('wellnessReminders.active', 'Active')}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: palette.muted }]}>
                  {reminders.length - enabledCount}
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>
                  {t('wellnessReminders.inactive', 'Inactive')}
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.primary} />
              <Text style={[styles.loadingText, { color: palette.text }]}>
                {t('wellnessReminders.loading', 'Loading reminders...')}
              </Text>
            </View>
          ) : (
            <>
              {/* Web Warning */}
              {Platform.OS === 'web' && (
                <View style={[styles.webWarning, { backgroundColor: palette.warning + '20', borderColor: palette.warning }]}>
                  <Ionicons name="information-circle" size={20} color={palette.warning} />
                  <Text style={[styles.webWarningText, { color: palette.text }]}>
                    {t('wellnessReminders.webWarning', 'Notifications are not supported in web browsers. Please use the mobile app.')}
                  </Text>
                </View>
              )}

              {/* Reminders List */}
              <GapView gap={12} style={{ marginTop: 16 }}>
                {reminders.map(reminder => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    palette={palette}
                    onToggle={handleToggle}
                    onTest={handleTestNotification}
                  />
                ))}
              </GapView>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <A11yPressable
                  onPress={handleRescheduleAll}
                  disabled={syncing || Platform.OS === 'web'}
                  style={[
                    styles.actionButton,
                    { backgroundColor: palette.surface, borderColor: palette.muted }
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t('wellnessReminders.rescheduleAll', 'Reschedule all reminders')}
                  hitSlop={HIT_SLOP_8}
                >
                  {syncing ? (
                    <ActivityIndicator size="small" color={palette.primary} />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={20} color={palette.text} />
                      <Text style={[styles.actionButtonText, { color: palette.text }]}>
                        {t('wellnessReminders.rescheduleAll', 'Reschedule All')}
                      </Text>
                    </>
                  )}
                </A11yPressable>
              </View>

              {/* Info */}
              <View style={[styles.infoBox, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
                <Ionicons name="bulb-outline" size={24} color={palette.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoTitle, { color: palette.text }]}>
                    {t('wellnessReminders.tip.title', 'Tip')}
                  </Text>
                  <Text style={[styles.infoText, { color: palette.text }]}>
                    {t(
                      'wellnessReminders.tip.message',
                      'Reminders with adaptive frequency will reduce if you use the feature regularly. Quiet hours are respected for all notifications.'
                    )}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </ResponsiveScreenWrapper>
    </>
  );
}

// Reminder Card Component
const ReminderCard = React.memo<{
  reminder: WellnessReminder;
  palette: any;
  onToggle: (id: string, current: boolean) => void;
  onTest: (reminder: WellnessReminder) => void;
}>(({ reminder, palette, onToggle, onTest }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const scheduleText = 
    reminder.schedule === 'interval'
      ? `Every ${reminder.intervalMinutes} min`
      : reminder.schedule === 'specific_times'
        ? reminder.times?.join(', ')
        : 'Daily';

  return (
    <View
      style={[
        styles.reminderCard,
        {
          backgroundColor: reminder.enabled ? palette.surface : palette.background,
          borderColor: reminder.enabled ? palette.primary : palette.muted,
          borderWidth: reminder.enabled ? 2 : 1,
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.reminderHeader}
        accessibilityRole="button"
        accessibilityLabel={`${reminder.title}. ${reminder.enabled ? 'Enabled' : 'Disabled'}`}
      >
        <View style={styles.reminderIconContainer}>
          <Ionicons
            name={REMINDER_ICONS[reminder.type] as any}
            size={24}
            color={reminder.enabled ? palette.primary : palette.muted}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.reminderTitle, { color: palette.text }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {reminder.title}
          </Text>
          <Text
            style={[styles.reminderSchedule, { color: palette.textSecondary }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {scheduleText}
          </Text>
        </View>
        
        <Switch
          value={reminder.enabled}
          onValueChange={() => onToggle(reminder.id, reminder.enabled)}
          trackColor={{ false: palette.muted, true: palette.primary }}
          thumbColor={palette.onPrimary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.reminderDetails}>
          <Text style={[styles.detailText, { color: palette.text }]}>
            {REMINDER_DESCRIPTIONS[reminder.type]}
          </Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="volume-medium" size={16} color={palette.text} />
            <Text style={[styles.detailLabel, { color: palette.text }]}>
              {reminder.sound === 'none' ? 'Silent' : reminder.sound === 'gentle' ? 'Gentle' : 'Standard'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="moon" size={16} color={palette.text} />
            <Text style={[styles.detailLabel, { color: palette.text }]}>
              Quiet hours: {reminder.quietHours.start} - {reminder.quietHours.end}
            </Text>
          </View>
          
          {reminder.adaptiveFrequency && (
            <View style={styles.detailRow}>
              <Ionicons name="analytics" size={16} color={palette.text} />
              <Text style={[styles.detailLabel, { color: palette.text }]}>
                Adaptive frequency enabled
              </Text>
            </View>
          )}
          
          {Platform.OS !== 'web' && reminder.enabled && (
            <A11yPressable
              onPress={() => onTest(reminder)}
              style={[styles.testButton, { backgroundColor: palette.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Send test notification"
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="notifications" size={16} color={palette.onPrimary} />
              <Text style={[styles.testButtonText, { color: palette.onPrimary }]}>
                {t('wellnessReminders.test', 'Test Notification')}
              </Text>
            </A11yPressable>
          )}
        </View>
      )}
    </View>
  );
});
ReminderCard.displayName = 'ReminderCard';

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  webWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  webWarningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  reminderCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  reminderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  reminderSchedule: {
    fontSize: 13,
  },
  reminderDetails: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.8,
  },
});
