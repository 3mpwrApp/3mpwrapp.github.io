import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useEmotionalFirstAid } from '../../../services/emotionalFirstAid';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function EmotionalFirstAidScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const firstAid = useEmotionalFirstAid();

  const [_activeSession, _setActiveSession] = useState<any>(null);
  const [contacts, _setContacts] = useState(firstAid.contacts);

  useEffect(() => {
    // Session history tracking removed - use analytics instead
  }, []);

  const startBreathing = async () => {
    const session = await firstAid.startBreathingGuide();
    _setActiveSession(session);
  };

  const startTemperatureShock = async () => {
    const session = await firstAid.startTemperatureShock();
    _setActiveSession(session);
  };

  const spinGroundingWheel = async () => {
    const task = await firstAid.spinWheel();
    alert(`Grounding Task: ${task.instruction}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Emotional First Aid'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Emergency Actions */}
        <View style={[styles.emergencyCard, { backgroundColor: palette.error }]}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="medical" size={32} color={palette.onPrimary} />
            <Text style={styles.emergencyTitle}>Crisis Intervention</Text>
          </View>
          <Text style={styles.emergencySubtitle}>
            Immediate tools for panic attacks & emotional crisis
          </Text>

          <Pressable
            style={[styles.emergencyButton, { backgroundColor: palette.surface }]}
            onPress={startBreathing}
          >
            <Ionicons name="fitness" size={24} color={palette.error} />
            <Text style={[styles.emergencyButtonText, { color: palette.error }]}>
              4-7-8 Breathing Guide
            </Text>
          </Pressable>

          <Pressable
            style={[styles.emergencyButton, { backgroundColor: palette.surface }]}
            onPress={startTemperatureShock}
          >
            <Ionicons name="snow" size={24} color={palette.error} />
            <Text style={[styles.emergencyButtonText, { color: palette.error }]}>
              Temperature Shock Protocol
            </Text>
          </Pressable>

          <Pressable
            style={[styles.emergencyButton, { backgroundColor: palette.surface }]}
            onPress={spinGroundingWheel}
          >
            <Ionicons name="disc" size={24} color={palette.error} />
            <Text style={[styles.emergencyButtonText, { color: palette.error }]}>
              5-4-3-2-1 Grounding Wheel
            </Text>
          </Pressable>
        </View>

        {/* Triple-Tap Crisis Contact */}
        <View style={[styles.card, { backgroundColor: palette.error }]}>
          <View style={styles.crisisHeader}>
            <Ionicons name="call" size={24} color={palette.onPrimary} />
            <Text style={styles.crisisTitle}>Triple-Tap Emergency</Text>
          </View>
          <Text style={styles.crisisDescription}>
            Tap this button 3 times within 2 seconds to auto-send crisis SMS with your location to
            emergency contacts
          </Text>

          <Pressable
            style={[styles.crisisButton, { backgroundColor: palette.surface }]}
            onPress={() => firstAid.registerTap()}
          >
            <Ionicons name="warning" size={32} color={palette.error} />
            <Text style={[styles.crisisButtonText, { color: palette.error }]}>
              CRISIS CONTACT
            </Text>
          </Pressable>

          <Text style={styles.crisisNote}>
            Set up emergency contacts in Settings first
          </Text>
        </View>

        {/* Distraction Games */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            DBT Distraction Games
          </Text>
          <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
            8 evidence-based games to interrupt crisis state
          </Text>

          {firstAid.getAllGames().map(game => (
            <Pressable
              key={game.id}
              style={[styles.gameCard, { borderColor: palette.border }]}
              onPress={() => alert(`Starting ${game.name}...\n\n${game.instructions}`)}
            >
              <View style={styles.gameHeader}>
                <Text style={[styles.gameName, { color: palette.text }]}>{game.name}</Text>
                <Text style={[styles.gameDuration, { color: palette.textSecondary }]}>
                  {game.duration}min
                </Text>
              </View>
              <Text style={[styles.gameDescription, { color: palette.textSecondary }]}>
                {game.instructions}
              </Text>
              <View style={styles.gameTags}>
                <View style={[styles.tag, { backgroundColor: palette.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: palette.primary }]}>
                    {game.dbtPrinciple}
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: palette.border }]}>
                  <Text style={[styles.tagText, { color: palette.textSecondary }]}>
                    {game.difficulty}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Session History */}
        {/* Session history removed - use analytics/crisis logs instead
        {sessionHistory.length > 0 && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent Sessions</Text>

            {sessionHistory.slice(0, 5).map((session: any, index: number) => (
              <View key={index} style={[styles.sessionCard, { borderColor: palette.border }]}>
                <View style={styles.sessionHeader}>
                  <Text style={[styles.sessionType, { color: palette.text }]}>
                    {session.type}
                  </Text>
                  <Text style={[styles.sessionDate, { color: palette.textSecondary }]}>
                    {new Date(session.startTime).toLocaleString()}
                  </Text>
                </View>
                {session.effectiveness && (
                  <Text style={[styles.sessionEffectiveness, { color: palette.textSecondary }]}>
                    Effectiveness: {session.effectiveness}/5 ⭐
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
        */}

        {/* Emergency Contacts */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Emergency Contacts</Text>

          {contacts.length === 0 ? (
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No emergency contacts set. Add contacts in Settings.
            </Text>
          ) : (
            contacts.map((contact, index) => (
              <View key={index} style={[styles.contactCard, { borderColor: palette.border }]}>
                <Ionicons name="person-circle" size={32} color={palette.primary} />
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: palette.text }]}>
                    {contact.name}
                  </Text>
                  <Text style={[styles.contactPhone, { color: palette.textSecondary }]}>
                    {contact.phone}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emergencyCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    ...createShadow({
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  emergencySubtitle: {
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.9,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  crisisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  crisisDescription: {
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.9,
    lineHeight: 20,
  },
  crisisButton: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  crisisButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  crisisNote: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  gameCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
  },
  gameDuration: {
    fontSize: 14,
  },
  gameDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  gameTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sessionDate: {
    fontSize: 12,
  },
  sessionEffectiveness: {
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contactInfo: {
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
  },
  bottomSpacer: {
    height: 32,
  },
});


