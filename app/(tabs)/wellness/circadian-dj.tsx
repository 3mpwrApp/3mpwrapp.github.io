import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { HIT_SLOP_12 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { useCircadianRhythmDJ } from '../../../services/circadianRhythmDJ';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

// Quiz questions for chronotype determination
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "If you had no obligations, what time would you naturally wake up?",
    options: [
      { text: "Before 6am", score: { lion: 3, bear: 1, wolf: 0, dolphin: 1 } },
      { text: "6am-8am", score: { lion: 2, bear: 3, wolf: 0, dolphin: 2 } },
      { text: "8am-10am", score: { lion: 0, bear: 2, wolf: 3, dolphin: 1 } },
      { text: "After 10am", score: { lion: 0, bear: 0, wolf: 3, dolphin: 0 } },
    ],
  },
  {
    id: 2,
    question: "When do you feel most alert and focused?",
    options: [
      { text: "Early morning (6-9am)", score: { lion: 3, bear: 1, wolf: 0, dolphin: 1 } },
      { text: "Mid-morning to early afternoon", score: { lion: 1, bear: 3, wolf: 1, dolphin: 2 } },
      { text: "Late afternoon to evening", score: { lion: 0, bear: 1, wolf: 3, dolphin: 2 } },
      { text: "Late at night", score: { lion: 0, bear: 0, wolf: 3, dolphin: 1 } },
    ],
  },
  {
    id: 3,
    question: "How would you describe your sleep quality?",
    options: [
      { text: "I fall asleep easily and sleep deeply", score: { lion: 2, bear: 3, wolf: 1, dolphin: 0 } },
      { text: "Generally good but wake early", score: { lion: 3, bear: 1, wolf: 0, dolphin: 1 } },
      { text: "Hard to fall asleep, hard to wake", score: { lion: 0, bear: 0, wolf: 3, dolphin: 1 } },
      { text: "Light sleeper, often restless", score: { lion: 0, bear: 0, wolf: 1, dolphin: 3 } },
    ],
  },
  {
    id: 4,
    question: "How do you feel when you wake up?",
    options: [
      { text: "Refreshed and ready to go", score: { lion: 3, bear: 2, wolf: 0, dolphin: 0 } },
      { text: "Need some time but generally okay", score: { lion: 1, bear: 3, wolf: 1, dolphin: 1 } },
      { text: "Groggy, takes a while to feel awake", score: { lion: 0, bear: 1, wolf: 3, dolphin: 1 } },
      { text: "Often anxious or restless", score: { lion: 0, bear: 0, wolf: 0, dolphin: 3 } },
    ],
  },
  {
    id: 5,
    question: "How would you describe your appetite pattern?",
    options: [
      { text: "Hungry first thing in the morning", score: { lion: 3, bear: 2, wolf: 0, dolphin: 1 } },
      { text: "Ready for breakfast within an hour of waking", score: { lion: 1, bear: 3, wolf: 1, dolphin: 1 } },
      { text: "Not hungry until late morning/noon", score: { lion: 0, bear: 1, wolf: 3, dolphin: 1 } },
      { text: "Appetite is inconsistent", score: { lion: 0, bear: 0, wolf: 1, dolphin: 3 } },
    ],
  },
];

export default function CircadianDJScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const circadian = useCircadianRhythmDJ();

  const [chronotype, setChronotype] = useState(circadian.chronotype);
  const [sleepDebt, setSleepDebt] = useState(circadian.getSleepDebt());
  const [dreamPatterns, setDreamPatterns] = useState(circadian.getDreamPatterns());

  // Quiz state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScores, setQuizScores] = useState({ lion: 0, bear: 0, wolf: 0, dolphin: 0 });

  // Sleep log state
  const [showSleepLogModal, setShowSleepLogModal] = useState(false);
  const [sleepLogStep, setSleepLogStep] = useState(0);
  const [sleepLogData, setSleepLogData] = useState({
    bedtime: '22:30',
    wakeTime: '07:00',
    quality: 3,
    interruptions: 0,
    dreams: false,
    dreamContent: '',
    notes: '',
  });

  const chronotypeInfo: Record<
    string,
    { icon: string; color: string; peakTimes: string; bedtime: string; description: string }
  > = {
    lion: {
      icon: '🦁',
      color: palette.warning,
      peakTimes: '6am-12pm',
      bedtime: '9pm-5am',
      description: 'Early risers who are most productive in the morning. About 15% of people are lions.',
    },
    bear: {
      icon: '🐻',
      color: palette.text,
      peakTimes: '10am-4pm',
      bedtime: '11pm-7am',
      description: 'Follow the solar cycle and make up about 55% of the population.',
    },
    wolf: {
      icon: '🐺',
      color: palette.primary,
      peakTimes: '5pm-11pm',
      bedtime: '12am-8am',
      description: 'Night owls who come alive in the evening. About 15% of people are wolves.',
    },
    dolphin: {
      icon: '🐬',
      color: palette.info,
      peakTimes: '3pm-6pm',
      bedtime: '11:30pm-6:30am',
      description: 'Light sleepers who may have difficulty with regular sleep patterns. About 10% of people.',
    },
  };

  const startQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
    setQuizScores({ lion: 0, bear: 0, wolf: 0, dolphin: 0 });
    setShowQuizModal(true);
  };

  const answerQuiz = (optionIndex: number) => {
    const question = QUIZ_QUESTIONS[quizStep];
    const option = question.options[optionIndex];
    
    // Update scores
    const newScores = { ...quizScores };
    newScores.lion += option.score.lion;
    newScores.bear += option.score.bear;
    newScores.wolf += option.score.wolf;
    newScores.dolphin += option.score.dolphin;
    setQuizScores(newScores);
    
    // Record answer
    const newAnswers = [...quizAnswers, optionIndex];
    setQuizAnswers(newAnswers);

    // Move to next question or finish
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      finishQuiz(newScores);
    }
  };

  const finishQuiz = async (scores: typeof quizScores) => {
    // Determine winning chronotype
    const maxScore = Math.max(scores.lion, scores.bear, scores.wolf, scores.dolphin);
    const totalScore = scores.lion + scores.bear + scores.wolf + scores.dolphin;
    const confidence = Math.round((maxScore / totalScore) * 100);
    
    let winningType: 'lion' | 'bear' | 'wolf' | 'dolphin' = 'bear';
    if (scores.lion === maxScore) winningType = 'lion';
    else if (scores.wolf === maxScore) winningType = 'wolf';
    else if (scores.dolphin === maxScore) winningType = 'dolphin';
    
    // Get peak energy hours and sleep window based on chronotype
    const chronotypeData = {
      lion: { peakHours: [6, 7, 8, 9, 10, 11], sleepStart: 21, sleepEnd: 5 },
      bear: { peakHours: [10, 11, 12, 13, 14, 15], sleepStart: 23, sleepEnd: 7 },
      wolf: { peakHours: [17, 18, 19, 20, 21, 22], sleepStart: 0, sleepEnd: 8 },
      dolphin: { peakHours: [15, 16, 17, 18], sleepStart: 23.5, sleepEnd: 6.5 },
    };

    const data = chronotypeData[winningType];
    const newChronotype = {
      type: winningType,
      confidence,
      peakEnergyHours: data.peakHours,
      idealSleepWindow: { start: data.sleepStart, end: data.sleepEnd },
      socialJetLagHours: 0,
    };
    
    try {
      await circadian.setChronotype(newChronotype);
      setChronotype(newChronotype);
      setShowQuizModal(false);
      
      Alert.alert(
        `You're a ${winningType.toUpperCase()}! ${chronotypeInfo[winningType].icon}`,
        chronotypeInfo[winningType].description,
        [{ text: 'Got it!' }]
      );
    } catch {
      Alert.alert('Error', 'Failed to save chronotype');
    }
  };

  const startSleepLog = () => {
    setSleepLogStep(0);
    setSleepLogData({
      bedtime: '22:30',
      wakeTime: '07:00',
      quality: 3,
      interruptions: 0,
      dreams: false,
      dreamContent: '',
      notes: '',
    });
    setShowSleepLogModal(true);
  };

  const nextSleepLogStep = () => {
    if (sleepLogStep < 3) {
      setSleepLogStep(sleepLogStep + 1);
    } else {
      finishSleepLog();
    }
  };

  const finishSleepLog = async () => {
    try {
      // Convert time strings to hours since midnight
      const parseTimeToHours = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours + minutes / 60;
      };

      const bedtimeHours = parseTimeToHours(sleepLogData.bedtime);
      const wakeTimeHours = parseTimeToHours(sleepLogData.wakeTime);
      
      // Calculate total sleep (handle crossing midnight)
      let totalSleep = wakeTimeHours - bedtimeHours;
      if (totalSleep < 0) totalSleep += 24;

      await circadian.logSleep({
        date: new Date().toISOString().split('T')[0],
        bedtime: bedtimeHours,
        wakeTime: wakeTimeHours,
        totalSleep,
        sleepQuality: sleepLogData.quality as 1 | 2 | 3 | 4 | 5,
        nightmares: sleepLogData.dreams && sleepLogData.dreamContent.toLowerCase().includes('nightmare'),
        nightmareDetails: sleepLogData.dreamContent || undefined,
      });
      
      setSleepDebt(circadian.getSleepDebt());
      setDreamPatterns(circadian.getDreamPatterns());
      setShowSleepLogModal(false);
      
      Alert.alert('Sleep Logged', `Logged ${totalSleep.toFixed(1)} hours of sleep. Keep tracking for better insights!`);
    } catch {
      Alert.alert('Error', 'Failed to log sleep data');
    }
  };

  const takeChronotypeQuiz = () => {
    startQuiz();
  };

  const logSleep = () => {
    startSleepLog();
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
              <Ionicons name="help-circle" size={20} color={palette.onPrimary} />
              <Text style={[styles.quizButtonText, { color: palette.onPrimary }]}>Take Chronotype Quiz</Text>
            </Pressable>
          </View>
        )}

        {/* Sleep Debt */}
        {sleepDebt && sleepDebt.totalHoursOwed > 0 && (
          <View style={[styles.card, { backgroundColor: palette.warningBackground }]}>
            <View style={styles.debtHeader}>
              <Ionicons name="warning" size={24} color={palette.warning} />
              <Text style={[styles.debtTitle, { color: palette.warning }]}>Sleep Debt</Text>
            </View>

            <Text style={[styles.debtAmount, { color: palette.error }]}>
              {sleepDebt.totalHoursOwed.toFixed(1)} hours owed
            </Text>

            <Text style={[styles.debtDescription, { color: palette.warning }]}>
              Repayment plan: +{sleepDebt.repaymentPlan.dailyExtraMinutes} minutes per night
            </Text>
            <Text style={[styles.debtDescription, { color: palette.warning }]}>
              Target debt-free date: {sleepDebt.repaymentPlan.targetDate}
            </Text>
            <Text style={[styles.debtDescription, { color: palette.warning }]}>
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
                        ? palette.error
                        : pattern.pattern === 'clustered'
                        ? palette.warning
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

      {/* Chronotype Quiz Modal */}
      <Modal
        visible={showQuizModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuizModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Chronotype Quiz</Text>
              <Pressable 
                onPress={() => setShowQuizModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            <View style={styles.quizProgress}>
              <Text style={[styles.quizProgressText, { color: palette.textSecondary }]}>
                Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
              </Text>
              <View style={[styles.progressBar, { backgroundColor: palette.background }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: palette.primary,
                      width: `${((quizStep + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.quizQuestion, { color: palette.text }]}>
              {QUIZ_QUESTIONS[quizStep].question}
            </Text>

            <View style={styles.quizOptions}>
              {QUIZ_QUESTIONS[quizStep].options.map((option, index) => (
                <Pressable
                  key={index}
                  style={[styles.quizOption, { backgroundColor: palette.background, borderColor: palette.border }]}
                  onPress={() => answerQuiz(index)}
                >
                  <Text style={[styles.quizOptionText, { color: palette.text }]}>{option.text}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Sleep Log Modal */}
      <Modal
        visible={showSleepLogModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSleepLogModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Log Sleep</Text>
              <Pressable 
                onPress={() => setShowSleepLogModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            <View style={styles.quizProgress}>
              <Text style={[styles.quizProgressText, { color: palette.textSecondary }]}>
                Step {sleepLogStep + 1} of 4
              </Text>
              <View style={[styles.progressBar, { backgroundColor: palette.background }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: palette.primary, width: `${((sleepLogStep + 1) / 4) * 100}%` },
                  ]}
                />
              </View>
            </View>

            {sleepLogStep === 0 && (
              <View style={styles.sleepLogSection}>
                <Text style={[styles.sleepLogLabel, { color: palette.text }]}>What time did you go to bed?</Text>
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={[styles.timeInput, { color: palette.text, borderColor: palette.border }]}
                    value={sleepLogData.bedtime}
                    onChangeText={(v) => setSleepLogData({ ...sleepLogData, bedtime: v })}
                    placeholder="22:30"
                    placeholderTextColor={palette.muted}
                  />
                </View>
                <Text style={[styles.sleepLogLabel, { color: palette.text, marginTop: 20 }]}>
                  What time did you wake up?
                </Text>
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={[styles.timeInput, { color: palette.text, borderColor: palette.border }]}
                    value={sleepLogData.wakeTime}
                    onChangeText={(v) => setSleepLogData({ ...sleepLogData, wakeTime: v })}
                    placeholder="07:00"
                    placeholderTextColor={palette.muted}
                  />
                </View>
              </View>
            )}

            {sleepLogStep === 1 && (
              <View style={styles.sleepLogSection}>
                <Text style={[styles.sleepLogLabel, { color: palette.text }]}>
                  How would you rate your sleep quality?
                </Text>
                <View style={styles.qualityRow}>
                  {[1, 2, 3, 4, 5].map((q) => (
                    <Pressable
                      key={q}
                      style={[
                        styles.qualityButton,
                        {
                          backgroundColor: sleepLogData.quality === q ? palette.primary : palette.background,
                          borderColor: palette.primary,
                        },
                      ]}
                      onPress={() => setSleepLogData({ ...sleepLogData, quality: q })}
                    >
                      <Text style={{ color: sleepLogData.quality === q ? palette.onPrimary : palette.text }}>
                        {q === 1 ? '😫' : q === 2 ? '😟' : q === 3 ? '😐' : q === 4 ? '🙂' : '😴'}
                      </Text>
                      <Text
                        style={[
                          styles.qualityLabel,
                          { color: sleepLogData.quality === q ? palette.onPrimary : palette.textSecondary },
                        ]}
                      >
                        {q === 1 ? 'Poor' : q === 2 ? 'Fair' : q === 3 ? 'OK' : q === 4 ? 'Good' : 'Great'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={[styles.sleepLogLabel, { color: palette.text, marginTop: 20 }]}>
                  How many times did you wake up during the night?
                </Text>
                <View style={styles.interruptionRow}>
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <Pressable
                      key={n}
                      style={[
                        styles.interruptionButton,
                        {
                          backgroundColor: sleepLogData.interruptions === n ? palette.primary : palette.background,
                          borderColor: palette.border,
                        },
                      ]}
                      onPress={() => setSleepLogData({ ...sleepLogData, interruptions: n })}
                    >
                      <Text style={{ color: sleepLogData.interruptions === n ? palette.onPrimary : palette.text }}>
                        {n === 5 ? '5+' : n}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {sleepLogStep === 2 && (
              <View style={styles.sleepLogSection}>
                <Text style={[styles.sleepLogLabel, { color: palette.text }]}>Did you remember any dreams?</Text>
                <View style={styles.dreamToggle}>
                  <Pressable
                    style={[
                      styles.dreamButton,
                      { backgroundColor: sleepLogData.dreams ? palette.primary : palette.background },
                    ]}
                    onPress={() => setSleepLogData({ ...sleepLogData, dreams: true })}
                  >
                    <Text style={{ color: sleepLogData.dreams ? palette.onPrimary : palette.text }}>Yes</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.dreamButton,
                      { backgroundColor: !sleepLogData.dreams ? palette.primary : palette.background },
                    ]}
                    onPress={() => setSleepLogData({ ...sleepLogData, dreams: false, dreamContent: '' })}
                  >
                    <Text style={{ color: !sleepLogData.dreams ? palette.onPrimary : palette.text }}>No</Text>
                  </Pressable>
                </View>
                {sleepLogData.dreams && (
                  <>
                    <Text style={[styles.sleepLogLabel, { color: palette.text, marginTop: 16 }]}>
                      Describe your dream (optional)
                    </Text>
                    <TextInput
                      style={[styles.dreamInput, { color: palette.text, borderColor: palette.border }]}
                      value={sleepLogData.dreamContent}
                      onChangeText={(v) => setSleepLogData({ ...sleepLogData, dreamContent: v })}
                      placeholder="What do you remember?"
                      placeholderTextColor={palette.muted}
                      multiline
                      numberOfLines={3}
                    />
                  </>
                )}
              </View>
            )}

            {sleepLogStep === 3 && (
              <View style={styles.sleepLogSection}>
                <Text style={[styles.sleepLogLabel, { color: palette.text }]}>Any additional notes?</Text>
                <TextInput
                  style={[styles.dreamInput, { color: palette.text, borderColor: palette.border }]}
                  value={sleepLogData.notes}
                  onChangeText={(v) => setSleepLogData({ ...sleepLogData, notes: v })}
                  placeholder="e.g., caffeine late, exercise, stress..."
                  placeholderTextColor={palette.muted}
                  multiline
                  numberOfLines={3}
                />

                <View style={[styles.sleepSummary, { backgroundColor: palette.background }]}>
                  <Text style={[styles.summaryTitle, { color: palette.text }]}>Summary</Text>
                  <Text style={[styles.summaryText, { color: palette.textSecondary }]}>
                    🛏️ Bedtime: {sleepLogData.bedtime}
                  </Text>
                  <Text style={[styles.summaryText, { color: palette.textSecondary }]}>
                    ⏰ Wake time: {sleepLogData.wakeTime}
                  </Text>
                  <Text style={[styles.summaryText, { color: palette.textSecondary }]}>
                    ⭐ Quality: {sleepLogData.quality}/5
                  </Text>
                  <Text style={[styles.summaryText, { color: palette.textSecondary }]}>
                    🌙 Interruptions: {sleepLogData.interruptions}
                  </Text>
                  <Text style={[styles.summaryText, { color: palette.textSecondary }]}>
                    💭 Dreams: {sleepLogData.dreams ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.sleepLogActions}>
              {sleepLogStep > 0 && (
                <Pressable
                  style={[styles.sleepLogButton, { backgroundColor: palette.muted }]}
                  onPress={() => setSleepLogStep(sleepLogStep - 1)}
                >
                  <Text style={[styles.sleepLogButtonText, { color: palette.text }]}>Back</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.sleepLogButton, { backgroundColor: palette.primary, flex: sleepLogStep === 0 ? 1 : undefined }]}
                onPress={nextSleepLogStep}
              >
                <Text style={[styles.sleepLogButtonText, { color: palette.onPrimary }]}>
                  {sleepLogStep < 3 ? 'Next' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  quizProgress: {
    marginBottom: 20,
  },
  quizProgressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 24,
  },
  quizOptions: {
    gap: 12,
  },
  quizOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  quizOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  sleepLogSection: {
    marginBottom: 20,
  },
  sleepLogLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 20,
    textAlign: 'center',
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    width: '18%',
  },
  qualityLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  interruptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interruptionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dreamToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  dreamButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  dreamInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sleepSummary: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 6,
  },
  sleepLogActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  sleepLogButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  sleepLogButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


