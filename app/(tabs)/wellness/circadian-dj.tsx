import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../../../theme/usePalette';
import { useTranslation } from '../../../i18n';
import { useCircadianRhythmDJ } from '../../../services/circadianRhythmDJ';

export default function CircadianDJScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const circadian = useCircadianRhythmDJ();

  const [chronotype, _setChronotype] = useState(circadian.chronotype);
  const [sleepDebt, _setSleepDebt] = useState(circadian.getSleepDebt());
  const [dreamPatterns, _setDreamPatterns] = useState(circadian.getDreamPatterns());

  const chronotypeInfo: Record<
    string,
    { icon: string; color: string; peakTimes: string; bedtime: string }
  > = {
    lion: {
      icon: '🦁',
      color: '#FFD700',
      peakTimes: '6am-12pm',
      bedtime: '9pm-5am',
    },
    bear: {
      icon: '🐻',
      color: '#8B4513',
      peakTimes: '10am-4pm',
      bedtime: '11pm-7am',
    },
    wolf: {
      icon: '🐺',
      color: '#4B0082',
      peakTimes: '5pm-11pm',
      bedtime: '12am-8am',
    },
    dolphin: {
      icon: '🐬',
      color: '#00CED1',
      peakTimes: '3pm-6pm',
      bedtime: '11:30pm-6:30am',
    },
  };

  const takeChronotypeQuiz = () => {
    alert('Chronotype quiz coming soon! This will determine if you\'re a lion, bear, wolf, or dolphin.');
  };

  const logSleep = () => {
    alert('Sleep logging wizard coming soon!');
  };

  const calculateOptimalBedtime = () => {
    const wakeTime = '7:00';
    const optimization = circadian.calculateBedtime(wakeTime);
    alert(
      `For a 7:00 AM wake-up:\n\nRecommended bedtime: ${optimization.recommendedBedtime}\n\nOther options:\n${optimization.idealBedtimes.join(', ')}\n\nThis gives you ${optimization.cyclesCompleted} complete sleep cycles (${optimization.totalSleepHours} hours).`
    );
  };

  const getNapPrescription = () => {
    const prescription = circadian.prescribeNap('14:00', sleepDebt?.totalHoursOwed || 0);
    alert(
      `Nap Prescription:\n\nType: ${prescription.type}\nDuration: ${prescription.duration} minutes\nIdeal Time: ${prescription.idealTime}\n\nPurpose: ${prescription.purpose}\n\nInstructions:\n${prescription.instructions.join('\n')}`
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Circadian Rhythm DJ'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Chronotype */}
        {chronotype ? (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <View style={styles.chronotypeHeader}>
              <Text style={styles.chronotypeIcon}>
                {chronotypeInfo[chronotype.type].icon}
              </Text>
              <View style={styles.chronotypeInfo}>
                <Text style={[styles.chronotypeTitle, { color: palette.text }]}>
                  {chronotype.type.toUpperCase()}
                </Text>
                <Text style={[styles.chronotypeConfidence, { color: palette.textSecondary }]}>
                  {chronotype.confidence}% confidence
                </Text>
              </View>
            </View>

            <View style={styles.chronotypeDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="sunny" size={20} color={palette.textSecondary} />
                <Text style={[styles.detailText, { color: palette.text }]}>
                  Peak Energy: {chronotypeInfo[chronotype.type].peakTimes}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="moon" size={20} color={palette.textSecondary} />
                <Text style={[styles.detailText, { color: palette.text }]}>
                  Ideal Sleep: {chronotypeInfo[chronotype.type].bedtime}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              Take the chronotype quiz to discover your sleep-wake pattern
            </Text>
            <Pressable
              style={[styles.quizButton, { backgroundColor: palette.primary }]}
              onPress={takeChronotypeQuiz}
            >
              <Ionicons name="help-circle" size={20} color="#FFF" />
              <Text style={styles.quizButtonText}>Take Chronotype Quiz</Text>
            </Pressable>
          </View>
        )}

        {/* Sleep Debt */}
        {sleepDebt && sleepDebt.totalHoursOwed > 0 && (
          <View style={[styles.card, { backgroundColor: '#FFF3CD' }]}>
            <View style={styles.debtHeader}>
              <Ionicons name="warning" size={24} color="#856404" />
              <Text style={[styles.debtTitle, { color: '#856404' }]}>Sleep Debt</Text>
            </View>

            <Text style={[styles.debtAmount, { color: '#721C24' }]}>
              {sleepDebt.totalHoursOwed.toFixed(1)} hours owed
            </Text>

            <Text style={[styles.debtDescription, { color: '#856404' }]}>
              Repayment plan: +{sleepDebt.repaymentPlan.dailyExtraMinutes} minutes per night
            </Text>
            <Text style={[styles.debtDescription, { color: '#856404' }]}>
              Target debt-free date: {sleepDebt.repaymentPlan.targetDate}
            </Text>
            <Text style={[styles.debtDescription, { color: '#856404' }]}>
              This week's progress: {sleepDebt.repaymentPlan.weeklyProgress.toFixed(1)} hours repaid
            </Text>
          </View>
        )}

        {/* Dream Interference */}
        {dreamPatterns && dreamPatterns.length > 0 && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Dream Interference Patterns
            </Text>

            {dreamPatterns.slice(0, 3).map((pattern, index) => (
              <View key={index} style={[styles.dreamCard, { borderColor: palette.border }]}>
                <View style={styles.dreamHeader}>
                  <Ionicons
                    name={pattern.pattern === 'recurring' ? 'repeat' : 'alert-circle'}
                    size={20}
                    color={
                      pattern.pattern === 'recurring'
                        ? '#DC143C'
                        : pattern.pattern === 'clustered'
                        ? '#FFA500'
                        : palette.textSecondary
                    }
                  />
                  <Text style={[styles.dreamPattern, { color: palette.text }]}>
                    {pattern.pattern.toUpperCase()}
                  </Text>
                  <Text style={[styles.dreamDate, { color: palette.textSecondary }]}>
                    {new Date(pattern.date).toLocaleDateString()}
                  </Text>
                </View>

                {pattern.possibleTriggers.length > 0 && (
                  <View style={styles.triggerSection}>
                    <Text style={[styles.triggerLabel, { color: palette.textSecondary }]}>
                      Possible triggers:
                    </Text>
                    {pattern.possibleTriggers.map((trigger, i) => (
                      <Text key={i} style={[styles.triggerText, { color: palette.text }]}>
                        • {trigger}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Tools */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Sleep Optimization Tools</Text>

          <Pressable
            style={[styles.toolButton, { backgroundColor: palette.primary + '20', borderColor: palette.primary }]}
            onPress={logSleep}
          >
            <Ionicons name="moon" size={24} color={palette.primary} />
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, { color: palette.text }]}>Log Sleep</Text>
              <Text style={[styles.toolDescription, { color: palette.textSecondary }]}>
                Record bedtime, wake time, and quality
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </Pressable>

          <Pressable
            style={[styles.toolButton, { backgroundColor: palette.primary + '20', borderColor: palette.primary }]}
            onPress={calculateOptimalBedtime}
          >
            <Ionicons name="time" size={24} color={palette.primary} />
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, { color: palette.text }]}>Wake-Up Optimizer</Text>
              <Text style={[styles.toolDescription, { color: palette.textSecondary }]}>
                Calculate ideal bedtime for complete sleep cycles
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </Pressable>

          <Pressable
            style={[styles.toolButton, { backgroundColor: palette.primary + '20', borderColor: palette.primary }]}
            onPress={getNapPrescription}
          >
            <Ionicons name="cafe" size={24} color={palette.primary} />
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, { color: palette.text }]}>Nap Prescription</Text>
              <Text style={[styles.toolDescription, { color: palette.textSecondary }]}>
                Get personalized nap recommendations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </Pressable>
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
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chronotypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chronotypeIcon: {
    fontSize: 48,
  },
  chronotypeInfo: {
    marginLeft: 16,
  },
  chronotypeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chronotypeConfidence: {
    fontSize: 14,
    marginTop: 4,
  },
  chronotypeDetails: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  quizButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  debtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  debtTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  debtAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  debtDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  dreamCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dreamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamPattern: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  dreamDate: {
    fontSize: 12,
  },
  triggerSection: {
    marginTop: 8,
  },
  triggerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  triggerText: {
    fontSize: 13,
    marginLeft: 8,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  toolInfo: {
    flex: 1,
    marginLeft: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  toolDescription: {
    fontSize: 13,
  },
  bottomSpacer: {
    height: 32,
  },
});


