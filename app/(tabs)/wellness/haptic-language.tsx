import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from '../../../i18n';
import type { HapticMessageType} from '../../../services/hapticLanguage';
import { useHapticLanguage } from '../../../services/hapticLanguage';

export default function HapticLanguageScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const haptic = useHapticLanguage();

  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [stats, setStats] = useState(haptic.getUsageStats());
  const [isTraining, setIsTraining] = useState(false);
  const [quietHours, setQuietHours] = useState(false);

  const PATTERN_INFO: Record<string, { icon: string; description: string; example: string; color: string }> = {
    urgent_deadline: { icon: 'alarm', description: 'Short urgent pulses', example: 'Task due in 1 hour', color: '#DC143C' },
    appointment_soon: { icon: 'calendar', description: 'Gentle reminder rhythm', example: 'Appointment in 30 min', color: '#FF8C00' },
    medication_reminder: { icon: 'medical', description: 'Double-tap pattern', example: 'Time for medication', color: '#1E90FF' },
    new_message: { icon: 'chatbubble', description: 'Single soft pulse', example: 'New chat message', color: '#32CD32' },
    emergency_alert: { icon: 'warning', description: 'SOS morse code', example: 'Emergency situation', color: '#8B0000' },
    achievement: { icon: 'trophy', description: 'Ascending celebration', example: 'Goal completed!', color: '#FFD700' },
    warning: { icon: 'alert', description: 'Triple-pulse warning', example: 'Low battery', color: '#FFA500' },
    energy_low: { icon: 'battery-charging', description: 'Fading pattern', example: 'Spoons depleting', color: '#FF4500' },
    task_complete: { icon: 'checkmark-circle', description: 'Success rhythm', example: 'Task finished', color: '#28A745' },
    spoon_depleted: { icon: 'restaurant', description: 'Empty pattern', example: 'No spoons left', color: '#DC143C' },
    mood_check: { icon: 'happy', description: 'Friendly reminder', example: 'How are you feeling?', color: '#9370DB' },
    crisis_contact: { icon: 'call', description: 'Urgent SOS', example: 'Emergency contact activated', color: '#B22222' },
    breathing_guide: { icon: 'fitness', description: '4-7-8 rhythm', example: 'Guided breathing', color: '#20B2AA' },
  };

  const playPattern = async (pattern: string) => {
    await haptic.play(pattern as HapticMessageType);
    setLastPlayed(pattern);
    setStats(haptic.getUsageStats());
  };

  const patterns = Object.keys(PATTERN_INFO);

  const startTraining = () => {
    setIsTraining(true);
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    playPattern(randomPattern);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Haptic Language'),
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pattern Library</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Tap any pattern to feel it
          </Text>

          {patterns.map((pattern) => {
            const info = PATTERN_INFO[pattern];
            const usageCount = stats[pattern as HapticMessageType] || 0;
            const isLast = lastPlayed === pattern;

            return (
              <Pressable
                key={pattern}
                style={[styles.patternCard, { borderColor: isLast ? colors.primary : colors.border }]}
                onPress={() => playPattern(pattern)}
              >
                <View style={[styles.iconContainer, { backgroundColor: info.color + '20' }]}>
                  <Ionicons name={info.icon as any} size={24} color={info.color} />
                </View>

                <View style={styles.patternInfo}>
                  <Text style={[styles.patternName, { color: colors.text }]}>
                    {pattern.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={[styles.patternDescription, { color: colors.textSecondary }]}>
                    {info.description}
                  </Text>
                  <Text style={[styles.patternExample, { color: colors.textSecondary }]}>
                    💡 {info.example}
                  </Text>
                  {usageCount > 0 && (
                    <Text style={[styles.usageCount, { color: colors.textSecondary }]}>
                      Used {usageCount} times
                    </Text>
                  )}
                </View>

                {isLast && (
                  <View style={[styles.playingBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.playingText}>PLAYING</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Training Mode</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Practice identifying patterns by feel
          </Text>

          <Pressable
            style={[styles.trainingButton, { backgroundColor: colors.primary }]}
            onPress={startTraining}
          >
            <Ionicons name="school" size={20} color="#FFF" />
            <Text style={styles.trainingButtonText}>Play Random Pattern</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

          <View style={styles.settingRow}>
            <Ionicons name={quietHours ? 'moon' : 'moon-outline'} size={24} color={colors.textSecondary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Quiet Hours</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Disable vibrations during sleep (10pm-7am)
              </Text>
            </View>
            <Switch value={quietHours} onValueChange={setQuietHours} />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, padding: 16, borderRadius: 12, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  sectionDescription: { fontSize: 14, marginBottom: 16 },
  patternCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 8, padding: 12, marginBottom: 12 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  patternInfo: { marginLeft: 12, flex: 1 },
  patternName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  patternDescription: { fontSize: 13, marginBottom: 2 },
  patternExample: { fontSize: 12, fontStyle: 'italic' },
  usageCount: { fontSize: 11, marginTop: 4 },
  playingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  playingText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  trainingButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8 },
  trainingButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  settingInfo: { marginLeft: 12, flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  settingDescription: { fontSize: 13 },
  bottomSpacer: { height: 32 },
});
