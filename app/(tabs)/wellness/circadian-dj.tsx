import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { HIT_SLOP_12 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import {
    type CircadianAlignment,
    type DreamAIAnalysis,
    type LightTherapyPrescription,
    type MoonPhaseCorrelation,
    type SleepOptimizationPlan,
    type SleepQualityPrediction,
    type SleepStagePrediction,
    type SocialJetLagAnalysis,
    useCircadianRhythmDJ,
} from '../../../services/circadianRhythmDJ';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

// Feature Interlink Routes - where chronotype data enhances other features
const INTERLINK_FEATURES = [
  {
    id: 'daily-planner',
    name: 'Daily Planner',
    description: 'Schedule tasks during YOUR peak energy hours',
    icon: 'calendar' as const,
    route: '/wellness/daily-planner' as const,
    benefit: 'AI-optimized task scheduling based on your chronotype',
  },
  {
    id: 'energy-hub',
    name: 'Energy Command Center',
    description: 'Track energy aligned with your natural rhythm',
    icon: 'flash' as const,
    route: '/wellness/energy-command-center' as const,
    benefit: 'Predict energy dips before they happen',
  },
  {
    id: 'spoon-economist',
    name: 'Spoon Economist',
    description: 'Pace your day with circadian awareness',
    icon: 'analytics' as const,
    route: '/wellness/spoon-economist' as const,
    benefit: 'Smart spoon budgeting for your body clock',
  },
  {
    id: 'movement',
    name: 'Movement Hub',
    description: 'Exercise when your body is naturally ready',
    icon: 'fitness' as const,
    route: '/wellness/exercise-hub' as const,
    benefit: 'Optimal workout timing for your chronotype',
  },
];

// Quiz questions for chronotype determination
// Based on Dr. Michael Breus's chronotype research and MEQ (Morningness-Eveningness Questionnaire)
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "If you had no obligations, what time would you naturally wake up?",
    options: [
      { text: "Before 6am", score: { lion: 4, bear: 1, wolf: 0, dolphin: 2 } },
      { text: "6am-7:30am", score: { lion: 3, bear: 3, wolf: 0, dolphin: 1 } },
      { text: "7:30am-9am", score: { lion: 1, bear: 4, wolf: 2, dolphin: 1 } },
      { text: "9am-11am", score: { lion: 0, bear: 1, wolf: 4, dolphin: 2 } },
      { text: "After 11am", score: { lion: 0, bear: 0, wolf: 4, dolphin: 1 } },
    ],
  },
  {
    id: 2,
    question: "When do you feel most mentally alert and productive?",
    options: [
      { text: "5am-9am (early morning)", score: { lion: 4, bear: 1, wolf: 0, dolphin: 1 } },
      { text: "9am-12pm (mid-morning)", score: { lion: 2, bear: 4, wolf: 1, dolphin: 2 } },
      { text: "12pm-4pm (afternoon)", score: { lion: 1, bear: 3, wolf: 2, dolphin: 3 } },
      { text: "4pm-9pm (evening)", score: { lion: 0, bear: 1, wolf: 4, dolphin: 2 } },
      { text: "9pm-2am (late night)", score: { lion: 0, bear: 0, wolf: 4, dolphin: 1 } },
    ],
  },
  {
    id: 3,
    question: "How easily do you fall asleep at night?",
    options: [
      { text: "Very easily, often before I want to", score: { lion: 4, bear: 2, wolf: 0, dolphin: 0 } },
      { text: "Within 15-20 minutes, no problem", score: { lion: 2, bear: 4, wolf: 1, dolphin: 0 } },
      { text: "Takes 30+ minutes, mind is active", score: { lion: 0, bear: 1, wolf: 3, dolphin: 2 } },
      { text: "Very difficult, often lie awake for hours", score: { lion: 0, bear: 0, wolf: 2, dolphin: 4 } },
    ],
  },
  {
    id: 4,
    question: "How do you typically feel in the first 30 minutes after waking?",
    options: [
      { text: "Alert and energized, ready to start", score: { lion: 4, bear: 2, wolf: 0, dolphin: 1 } },
      { text: "Okay after coffee or some movement", score: { lion: 2, bear: 4, wolf: 1, dolphin: 1 } },
      { text: "Groggy and slow, need time to wake up", score: { lion: 0, bear: 1, wolf: 4, dolphin: 1 } },
      { text: "Anxious or already thinking about the day", score: { lion: 1, bear: 0, wolf: 1, dolphin: 4 } },
    ],
  },
  {
    id: 5,
    question: "How would you describe your overall sleep?",
    options: [
      { text: "Deep and consistent, rarely wake at night", score: { lion: 3, bear: 4, wolf: 2, dolphin: 0 } },
      { text: "Generally good but wake up early", score: { lion: 4, bear: 2, wolf: 0, dolphin: 1 } },
      { text: "Irregular, better on weekends when I sleep late", score: { lion: 0, bear: 1, wolf: 4, dolphin: 2 } },
      { text: "Light and fragmented, sensitive to noise", score: { lion: 0, bear: 0, wolf: 1, dolphin: 4 } },
    ],
  },
  {
    id: 6,
    question: "If you had to do a mentally demanding task, when would you prefer?",
    options: [
      { text: "First thing in the morning (6-9am)", score: { lion: 4, bear: 2, wolf: 0, dolphin: 2 } },
      { text: "Late morning (9am-12pm)", score: { lion: 2, bear: 4, wolf: 1, dolphin: 2 } },
      { text: "Afternoon (2-5pm)", score: { lion: 1, bear: 2, wolf: 3, dolphin: 3 } },
      { text: "Evening or night (after 6pm)", score: { lion: 0, bear: 0, wolf: 4, dolphin: 1 } },
    ],
  },
  {
    id: 7,
    question: "What is your energy pattern throughout the day?",
    options: [
      { text: "Highest in morning, steadily decreases", score: { lion: 4, bear: 2, wolf: 0, dolphin: 1 } },
      { text: "Peaks mid-morning, dips after lunch, recovers", score: { lion: 1, bear: 4, wolf: 1, dolphin: 2 } },
      { text: "Slow start, builds through day, peaks evening", score: { lion: 0, bear: 1, wolf: 4, dolphin: 1 } },
      { text: "Unpredictable, varies day to day", score: { lion: 0, bear: 0, wolf: 2, dolphin: 4 } },
    ],
  },
  {
    id: 8,
    question: "On weekends or days off, do you sleep differently?",
    options: [
      { text: "No, I wake up at the same time naturally", score: { lion: 4, bear: 2, wolf: 0, dolphin: 2 } },
      { text: "Maybe 30-60 minutes later", score: { lion: 2, bear: 4, wolf: 1, dolphin: 1 } },
      { text: "1-2 hours later, I need to catch up", score: { lion: 0, bear: 2, wolf: 3, dolphin: 2 } },
      { text: "2+ hours later, very different schedule", score: { lion: 0, bear: 0, wolf: 4, dolphin: 2 } },
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

  // === NEW STATE FOR ADVANCED FEATURES ===
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'advanced' | 'interlink'>('overview');
  const [sleepPrediction, setSleepPrediction] = useState<SleepQualityPrediction | null>(null);
  const [alignment, setAlignment] = useState<CircadianAlignment | null>(null);
  const [optimizationPlan, setOptimizationPlan] = useState<SleepOptimizationPlan | null>(null);
  const [lightTherapy, setLightTherapy] = useState<LightTherapyPrescription | null>(null);
  const [socialJetLag, setSocialJetLag] = useState<SocialJetLagAnalysis | null>(null);
  const [moonCorrelations, setMoonCorrelations] = useState<MoonPhaseCorrelation[]>([]);
  const [_stagePrediction, setStagePrediction] = useState<SleepStagePrediction | null>(null);
  const [showStagePredictionModal, setShowStagePredictionModal] = useState(false);
  const [stagePredictionData, setStagePredictionData] = useState<SleepStagePrediction | null>(null);
  const [stageInputBedtime, setStageInputBedtime] = useState('22:30');
  const [stageInputWakeTime, setStageInputWakeTime] = useState('07:00');
  const [showDreamAnalysisModal, setShowDreamAnalysisModal] = useState(false);
  const [dreamInput, setDreamInput] = useState('');
  const [dreamEmotions, setDreamEmotions] = useState<string[]>([]);
  const [dreamAnalysis, setDreamAnalysis] = useState<DreamAIAnalysis | null>(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const alignmentPulse = new Animated.Value(1);

  // Load AI insights when chronotype exists
  const loadInsights = useCallback(async () => {
    if (!chronotype) return;
    setIsLoadingInsights(true);
    try {
      const [pred, align, plan, light, jetLag, moon] = await Promise.all([
        circadian.predictTonightQuality(),
        circadian.analyzeAlignment(),
        circadian.generateOptimizationPlan(),
        circadian.prescribeLightTherapy(),
        circadian.calculateSocialJetLag(),
        circadian.analyzeMoonPhase(),
      ]);
      setSleepPrediction(pred);
      setAlignment(align);
      setOptimizationPlan(plan);
      setLightTherapy(light);
      setSocialJetLag(jetLag);
      setMoonCorrelations(moon);
    } catch (e) {
      console.error('Failed to load insights:', e);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [chronotype, circadian]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Pulse animation for alignment score
  useEffect(() => {
    if (alignment) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(alignmentPulse, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(alignmentPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [alignment]);

  const predictSleepStages = async () => {
    try {
      const prediction = await circadian.predictSleepStages(stageInputBedtime, stageInputWakeTime);
      setStagePrediction(prediction);
      setStagePredictionData(prediction);
    } catch {
      Alert.alert('Error', 'Failed to predict sleep stages');
    }
  };

  const openStagePredictionModal = () => {
    setStagePredictionData(null);
    setShowStagePredictionModal(true);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'awake': return palette.warning;
      case 'light': return palette.info;
      case 'deep': return palette.primary;
      case 'rem': return palette.success;
      default: return palette.muted;
    }
  };

  const getStageEmoji = (stage: string) => {
    switch (stage) {
      case 'awake': return '👁️';
      case 'light': return '🌙';
      case 'deep': return '🌊';
      case 'rem': return '💭';
      default: return '😴';
    }
  };

  const analyzeDreamWithAI = async () => {
    if (!dreamInput.trim()) {
      Alert.alert('Enter Dream', 'Please describe your dream first');
      return;
    }
    try {
      const analysis = await circadian.analyzeDream(dreamInput, dreamEmotions);
      setDreamAnalysis(analysis);
    } catch {
      Alert.alert('Error', 'Failed to analyze dream');
    }
  };

  const toggleEmotion = (emotion: string) => {
    setDreamEmotions(prev => 
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

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
    // Determine winning chronotype with improved algorithm
    const scoreArray = [
      { type: 'lion' as const, score: scores.lion },
      { type: 'bear' as const, score: scores.bear },
      { type: 'wolf' as const, score: scores.wolf },
      { type: 'dolphin' as const, score: scores.dolphin },
    ];
    
    // Sort by score descending
    scoreArray.sort((a, b) => b.score - a.score);
    const winningType = scoreArray[0].type;
    const maxScore = scoreArray[0].score;
    const secondScore = scoreArray[1].score;
    const totalScore = scores.lion + scores.bear + scores.wolf + scores.dolphin;
    
    // Calculate confidence based on how much the winner leads
    // Higher gap between 1st and 2nd = higher confidence
    // Max possible per question is 4, with 8 questions = 32 max per type
    const maxPossible = QUIZ_QUESTIONS.length * 4;
    const scoreDifferential = maxScore - secondScore;
    const dominanceRatio = scoreDifferential / maxPossible;
    const baseConfidence = (maxScore / totalScore) * 100;
    
    // Blend base confidence with dominance (how clearly one type won)
    const confidence = Math.min(95, Math.round(baseConfidence + (dominanceRatio * 30)));
    
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
    
    // Build a more detailed result message
    const secondType = scoreArray[1].type;
    const secondEmoji = chronotypeInfo[secondType].icon;
    const hasSecondary = scoreDifferential < 4 && secondScore > 0;
    const secondaryMsg = hasSecondary 
      ? `\n\nYou also show some ${secondType} ${secondEmoji} traits.`
      : '';
    
    try {
      await circadian.setChronotype(newChronotype);
      setChronotype(newChronotype);
      setShowQuizModal(false);
      
      Alert.alert(
        `You're a ${winningType.toUpperCase()}! ${chronotypeInfo[winningType].icon}`,
        `${chronotypeInfo[winningType].description}${secondaryMsg}`,
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
        {/* Chronotype Card - Always visible */}
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
              {/* Circadian Alignment Score Badge */}
              {alignment && (
                <Animated.View 
                  style={[
                    styles.alignmentBadge, 
                    { 
                      backgroundColor: alignment.score >= 70 ? palette.success + '20' : 
                                       alignment.score >= 40 ? palette.warning + '20' : palette.error + '20',
                      borderColor: alignment.score >= 70 ? palette.success : 
                                   alignment.score >= 40 ? palette.warning : palette.error,
                      transform: [{ scale: alignmentPulse }],
                    }
                  ]}
                >
                  <Text style={[styles.alignmentScore, { 
                    color: alignment.score >= 70 ? palette.success : 
                           alignment.score >= 40 ? palette.warning : palette.error 
                  }]}>
                    {alignment.score}%
                  </Text>
                  <Text style={[styles.alignmentLabel, { color: palette.textSecondary }]}>
                    Aligned
                  </Text>
                </Animated.View>
              )}
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

            {/* Retake Quiz Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retake chronotype quiz"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.retakeButton, { borderColor: palette.primary }]}
              onPress={takeChronotypeQuiz}
            >
              <Ionicons name="refresh" size={18} color={palette.primary} />
              <Text style={[styles.retakeButtonText, { color: palette.primary }]}>Retake Quiz</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              Take the chronotype quiz to discover your sleep-wake pattern and unlock AI-powered insights
            </Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.quizButton, { backgroundColor: palette.primary }]}
              onPress={takeChronotypeQuiz}
            >
              <Ionicons name="help-circle" size={20} color={palette.onPrimary} />
              <Text style={[styles.quizButtonText, { color: palette.onPrimary }]}>Take Chronotype Quiz</Text>
            </Pressable>
          </View>
        )}

        {/* === TAB NAVIGATION === */}
        {chronotype && (
          <View style={[styles.tabContainer, { backgroundColor: palette.surface }]}>
            {(['overview', 'insights', 'advanced', 'interlink'] as const).map(tab => (
              <Pressable
                key={tab}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === tab }}
                style={[
                  styles.tab,
                  activeTab === tab && { borderBottomColor: palette.primary, borderBottomWidth: 2 }
                ]}
                onPress={() => setActiveTab(tab)}
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons
                  name={
                    tab === 'overview' ? 'home' :
                    tab === 'insights' ? 'bulb' :
                    tab === 'advanced' ? 'flask' : 'link'
                  }
                  size={18}
                  color={activeTab === tab ? palette.primary : palette.textSecondary}
                />
                <Text style={[
                  styles.tabText,
                  { color: activeTab === tab ? palette.primary : palette.textSecondary }
                ]}>
                  {tab === 'overview' ? 'Overview' :
                   tab === 'insights' ? 'AI Insights' :
                   tab === 'advanced' ? 'Advanced' : 'Interlink'}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
          <>
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
              </View>
            )}

            {/* Tonight's Prediction Card */}
            {sleepPrediction && (
              <View style={[styles.card, { backgroundColor: palette.surface }]}>
                <View style={styles.predictionHeader}>
                  <Text style={styles.predictionEmoji}>🔮</Text>
                  <View>
                    <Text style={[styles.sectionTitle, { color: palette.text, marginBottom: 0 }]}>
                      Tonight's Sleep Prediction
                    </Text>
                    <Text style={[styles.predictionConfidence, { color: palette.textSecondary }]}>
                      {Math.round(sleepPrediction.confidence * 100)}% confidence
                    </Text>
                  </View>
                </View>
                <View style={styles.predictionScore}>
                  <Text style={[styles.predictionValue, { color: 
                    sleepPrediction.predictedQuality >= 4 ? palette.success :
                    sleepPrediction.predictedQuality >= 3 ? palette.warning : palette.error
                  }]}>
                    {sleepPrediction.predictedQuality.toFixed(1)}/5
                  </Text>
                  <Text style={[styles.predictionLabel, { color: palette.textSecondary }]}>
                    Expected Quality
                  </Text>
                </View>
                {sleepPrediction.factors.length > 0 && (
                  <View style={styles.factorsList}>
                    {sleepPrediction.factors.slice(0, 4).map((factor, i) => (
                      <View key={i} style={[styles.factorItem, { 
                        backgroundColor: factor.impact === 'positive' ? palette.success + '15' : palette.error + '15' 
                      }]}>
                        <Ionicons 
                          name={factor.impact === 'positive' ? 'arrow-up' : 'arrow-down'} 
                          size={14} 
                          color={factor.impact === 'positive' ? palette.success : palette.error} 
                        />
                        <Text style={[styles.factorText, { color: palette.text }]}>
                          {factor.factor}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Tools */}
            <View style={[styles.card, { backgroundColor: palette.surface }]}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Sleep Optimization Tools</Text>

              <Pressable
                accessibilityRole="button"
                hitSlop={HIT_SLOP_12}
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
                accessibilityRole="button"
                hitSlop={HIT_SLOP_12}
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
                accessibilityRole="button"
                hitSlop={HIT_SLOP_12}
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
          </>
        )}

        {/* === AI INSIGHTS TAB === */}
        {activeTab === 'insights' && chronotype && (
          <>
            {isLoadingInsights ? (
              <View style={[styles.card, { backgroundColor: palette.surface }]}>
                <Text style={[styles.loadingText, { color: palette.textSecondary }]}>
                  🧠 Analyzing your circadian data...
                </Text>
              </View>
            ) : (
              <>
                {/* Sleep Stage Prediction */}
                <View style={[styles.card, { backgroundColor: palette.surface }]}>
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>
                    🧬 AI Sleep Stage Predictor
                  </Text>
                  <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
                    Visualize your night: Light, Deep, and REM sleep cycles with optimal wake times
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    style={[styles.actionButton, { backgroundColor: palette.primary }]}
                    onPress={openStagePredictionModal}
                    hitSlop={HIT_SLOP_12}
                  >
                    <Ionicons name="analytics" size={20} color={palette.onPrimary} />
                    <Text style={[styles.actionButtonText, { color: palette.onPrimary }]}>
                      Predict Tonight's Stages
                    </Text>
                  </Pressable>
                </View>

                {/* Light Therapy */}
                {lightTherapy && (
                  <View style={[styles.card, { backgroundColor: palette.surface }]}>
                    <View style={styles.therapyHeader}>
                      <Text style={styles.therapyEmoji}>☀️</Text>
                      <Text style={[styles.sectionTitle, { color: palette.text, marginBottom: 0 }]}>
                        Light Therapy Prescription
                      </Text>
                    </View>
                    <View style={[styles.therapyBadge, { backgroundColor: palette.warning + '20' }]}>
                      <Text style={[styles.therapyType, { color: palette.warning }]}>
                        {lightTherapy.type.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.therapyDetails}>
                      <View style={styles.therapyRow}>
                        <Ionicons name="time-outline" size={16} color={palette.textSecondary} />
                        <Text style={[styles.therapyText, { color: palette.text }]}>
                          {lightTherapy.duration} mins at {lightTherapy.idealTime}
                        </Text>
                      </View>
                      <View style={styles.therapyRow}>
                        <Ionicons name="sunny-outline" size={16} color={palette.textSecondary} />
                        <Text style={[styles.therapyText, { color: palette.text }]}>
                          {lightTherapy.intensity > 0 ? `${lightTherapy.intensity} lux` : 'Avoid bright light'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.therapyBenefit, { color: palette.success }]}>
                      ✨ {lightTherapy.expectedBenefit}
                    </Text>
                  </View>
                )}

                {/* Social Jet Lag */}
                {socialJetLag && (
                  <View style={[styles.card, { backgroundColor: palette.surface }]}>
                    <View style={styles.jetLagHeader}>
                      <Text style={styles.jetLagEmoji}>✈️</Text>
                      <View>
                        <Text style={[styles.sectionTitle, { color: palette.text, marginBottom: 0 }]}>
                          Social Jet Lag
                        </Text>
                        <Text style={[styles.jetLagSubtitle, { color: palette.textSecondary }]}>
                          Weekday vs Weekend difference
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.jetLagScore, { 
                      backgroundColor: socialJetLag.impact === 'minimal' ? palette.success + '20' :
                                       socialJetLag.impact === 'moderate' ? palette.warning + '20' : palette.error + '20'
                    }]}>
                      <Text style={[styles.jetLagValue, { 
                        color: socialJetLag.impact === 'minimal' ? palette.success :
                               socialJetLag.impact === 'moderate' ? palette.warning : palette.error
                      }]}>
                        {socialJetLag.jetLagHours.toFixed(1)}h
                      </Text>
                      <Text style={[styles.jetLagImpact, { color: palette.textSecondary }]}>
                        {socialJetLag.impact.toUpperCase()} impact
                      </Text>
                    </View>
                    {socialJetLag.recoveryStrategies.length > 0 && (
                      <View style={styles.strategiesList}>
                        <Text style={[styles.strategiesTitle, { color: palette.text }]}>
                          Recovery Strategies:
                        </Text>
                        {socialJetLag.recoveryStrategies.map((strategy, i) => (
                          <Text key={i} style={[styles.strategyText, { color: palette.textSecondary }]}>
                            • {strategy}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Dream AI Analysis */}
                <View style={[styles.card, { backgroundColor: palette.surface }]}>
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>
                    💭 Dream AI Interpreter
                  </Text>
                  <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
                    Analyze your dreams for insights, patterns, and psychological themes
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    style={[styles.actionButton, { backgroundColor: palette.info }]}
                    onPress={() => setShowDreamAnalysisModal(true)}
                    hitSlop={HIT_SLOP_12}
                  >
                    <Ionicons name="cloud" size={20} color={palette.onPrimary} />
                    <Text style={[styles.actionButtonText, { color: palette.onPrimary }]}>
                      Analyze a Dream
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}

        {/* === ADVANCED TAB === */}
        {activeTab === 'advanced' && chronotype && (
          <>
            {/* Moon Phase Correlations */}
            <View style={[styles.card, { backgroundColor: palette.surface }]}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>
                🌙 Moon Phase Sleep Patterns
              </Text>
              {moonCorrelations.length > 0 ? (
                <View style={styles.moonGrid}>
                  {moonCorrelations.map((moon, i) => (
                    <View key={i} style={[styles.moonCard, { backgroundColor: palette.background }]}>
                      <Text style={styles.moonEmoji}>
                        {moon.phase === 'full' ? '🌕' : 
                         moon.phase === 'new' ? '🌑' :
                         moon.phase.includes('waxing') ? '🌓' : '🌗'}
                      </Text>
                      <Text style={[styles.moonPhase, { color: palette.text }]}>
                        {moon.phase.replace(/_/g, ' ')}
                      </Text>
                      <Text style={[styles.moonQuality, { color: palette.textSecondary }]}>
                        Quality: {moon.avgSleepQuality.toFixed(1)}/5
                      </Text>
                      {moon.personalImpact !== 'none' && (
                        <View style={[styles.moonImpactBadge, { 
                          backgroundColor: moon.personalImpact === 'significant' ? palette.error + '20' : palette.warning + '20'
                        }]}>
                          <Text style={[styles.moonImpactText, { 
                            color: moon.personalImpact === 'significant' ? palette.error : palette.warning 
                          }]}>
                            {moon.personalImpact}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                  Log more sleep to see moon phase patterns
                </Text>
              )}
            </View>

            {/* Sleep Optimization Plan */}
            {optimizationPlan && (
              <View style={[styles.card, { backgroundColor: palette.surface }]}>
                <View style={styles.planHeader}>
                  <Text style={styles.planEmoji}>📋</Text>
                  <View>
                    <Text style={[styles.sectionTitle, { color: palette.text, marginBottom: 0 }]}>
                      AI Optimization Plan
                    </Text>
                    <Text style={[styles.planFocus, { color: palette.primary }]}>
                      Focus: {optimizationPlan.weeklyGoals.focusArea}
                    </Text>
                  </View>
                </View>
                <View style={styles.planGoals}>
                  <View style={styles.goalRow}>
                    <Ionicons name="bed" size={18} color={palette.textSecondary} />
                    <Text style={[styles.goalText, { color: palette.text }]}>
                      Target bedtime: {optimizationPlan.weeklyGoals.targetBedtime}
                    </Text>
                  </View>
                  <View style={styles.goalRow}>
                    <Ionicons name="alarm" size={18} color={palette.textSecondary} />
                    <Text style={[styles.goalText, { color: palette.text }]}>
                      Target wake: {optimizationPlan.weeklyGoals.targetWakeTime}
                    </Text>
                  </View>
                  <View style={styles.goalRow}>
                    <Ionicons name="hourglass" size={18} color={palette.textSecondary} />
                    <Text style={[styles.goalText, { color: palette.text }]}>
                      Target duration: {optimizationPlan.weeklyGoals.targetDuration}h
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  style={[styles.actionButton, { backgroundColor: palette.success }]}
                  onPress={() => setShowOptimizationModal(true)}
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="list" size={20} color={palette.onPrimary} />
                  <Text style={[styles.actionButtonText, { color: palette.onPrimary }]}>
                    View Full Plan
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Dream Interference Patterns */}
            {dreamPatterns && dreamPatterns.length > 0 && (
              <View style={[styles.card, { backgroundColor: palette.surface }]}>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>
                  😰 Dream Interference Patterns
                </Text>
                {dreamPatterns.slice(0, 3).map((pattern, index) => (
                  <View key={index} style={[styles.dreamCard, { borderColor: palette.border }]}>
                    <View style={styles.dreamHeader}>
                      <Ionicons
                        name={pattern.pattern === 'recurring' ? 'repeat' : 'alert-circle'}
                        size={20}
                        color={
                          pattern.pattern === 'recurring' ? palette.error :
                          pattern.pattern === 'clustered' ? palette.warning : palette.textSecondary
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
          </>
        )}

        {/* === INTERLINK TAB === */}
        {activeTab === 'interlink' && chronotype && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              🔗 Your Chronotype Powers Other Features
            </Text>
            <Text style={[styles.cardDescription, { color: palette.textSecondary, marginBottom: 16 }]}>
              Your {chronotype.type} chronotype unlocks personalized optimizations across the app
            </Text>
            {INTERLINK_FEATURES.map(feature => (
              <Link key={feature.id} href={feature.route as any} asChild>
                <Pressable
                  accessibilityRole="link"
                  style={[styles.interlinkCard, { backgroundColor: palette.background, borderColor: palette.border }]}
                  hitSlop={HIT_SLOP_12}
                >
                  <View style={[styles.interlinkIcon, { backgroundColor: palette.primary + '20' }]}>
                    <Ionicons name={feature.icon} size={24} color={palette.primary} />
                  </View>
                  <View style={styles.interlinkContent}>
                    <Text style={[styles.interlinkTitle, { color: palette.text }]}>
                      {feature.name}
                    </Text>
                    <Text style={[styles.interlinkDesc, { color: palette.textSecondary }]}>
                      {feature.description}
                    </Text>
                    <View style={[styles.interlinkBenefit, { backgroundColor: palette.success + '15' }]}>
                      <Ionicons name="sparkles" size={12} color={palette.success} />
                      <Text style={[styles.interlinkBenefitText, { color: palette.success }]}>
                        {feature.benefit}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
                </Pressable>
              </Link>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sleep Stage Prediction Modal */}
      <Modal
        visible={showStagePredictionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStagePredictionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>🧬 Sleep Stage Predictor</Text>
              <Pressable 
                onPress={() => setShowStagePredictionModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            {!stagePredictionData ? (
              <>
                <Text style={[styles.modalSubtitle, { color: palette.textSecondary }]}>
                  Enter your planned sleep times to see predicted sleep stages and optimal wake times
                </Text>
                
                <View style={styles.stageInputSection}>
                  <Text style={[styles.stageInputLabel, { color: palette.text }]}>
                    🛏️ Bedtime
                  </Text>
                  <TextInput
                    style={[styles.stageTimeInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.background }]}
                    value={stageInputBedtime}
                    onChangeText={setStageInputBedtime}
                    placeholder="22:30"
                    placeholderTextColor={palette.muted}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                
                <View style={styles.stageInputSection}>
                  <Text style={[styles.stageInputLabel, { color: palette.text }]}>
                    ⏰ Wake Time
                  </Text>
                  <TextInput
                    style={[styles.stageTimeInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.background }]}
                    value={stageInputWakeTime}
                    onChangeText={setStageInputWakeTime}
                    placeholder="07:00"
                    placeholderTextColor={palette.muted}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={[styles.actionButton, { backgroundColor: palette.primary, marginTop: 20 }]}
                  onPress={predictSleepStages}
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="pulse" size={20} color={palette.onPrimary} />
                  <Text style={[styles.actionButtonText, { color: palette.onPrimary }]}>
                    Generate Prediction
                  </Text>
                </Pressable>
              </>
            ) : (
              <ScrollView style={styles.stageResultsContainer}>
                {/* Quality Score */}
                <View style={[styles.stageQualityCard, { 
                  backgroundColor: stagePredictionData.predictedQuality >= 4 ? palette.success + '15' :
                                   stagePredictionData.predictedQuality >= 3 ? palette.warning + '15' : palette.error + '15'
                }]}>
                  <Text style={[styles.stageQualityValue, { 
                    color: stagePredictionData.predictedQuality >= 4 ? palette.success :
                           stagePredictionData.predictedQuality >= 3 ? palette.warning : palette.error
                  }]}>
                    {stagePredictionData.predictedQuality.toFixed(1)}/5
                  </Text>
                  <Text style={[styles.stageQualityLabel, { color: palette.textSecondary }]}>
                    Predicted Quality
                  </Text>
                  <Text style={[styles.stageConfidence, { color: palette.textSecondary }]}>
                    {Math.round(stagePredictionData.confidence * 100)}% confidence
                  </Text>
                </View>

                {/* Sleep Cycles Count */}
                <View style={[styles.stageCyclesCard, { backgroundColor: palette.background }]}>
                  <Text style={[styles.stageCyclesValue, { color: palette.primary }]}>
                    {Math.floor(stagePredictionData.stages.length / 3)}
                  </Text>
                  <Text style={[styles.stageCyclesLabel, { color: palette.text }]}>
                    Complete Sleep Cycles
                  </Text>
                </View>

                {/* Visual Sleep Timeline */}
                <Text style={[styles.stageSectionTitle, { color: palette.text }]}>
                  🌙 Sleep Stage Timeline
                </Text>
                <View style={styles.stageTimeline}>
                  {stagePredictionData.stages.map((stage, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.stageBar,
                        { 
                          backgroundColor: getStageColor(stage.stage),
                          flex: stage.duration,
                          opacity: 0.7 + (stage.quality * 0.3),
                        }
                      ]}
                    >
                      <Text style={styles.stageBarEmoji}>{getStageEmoji(stage.stage)}</Text>
                    </View>
                  ))}
                </View>
                
                {/* Stage Legend */}
                <View style={styles.stageLegend}>
                  {['light', 'deep', 'rem'].map(stage => (
                    <View key={stage} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: getStageColor(stage) }]} />
                      <Text style={[styles.legendText, { color: palette.textSecondary }]}>
                        {getStageEmoji(stage)} {stage.toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Stage Breakdown */}
                <Text style={[styles.stageSectionTitle, { color: palette.text, marginTop: 20 }]}>
                  📊 Stage Breakdown
                </Text>
                <View style={styles.stageBreakdown}>
                  {['light', 'deep', 'rem'].map(stageType => {
                    const stagesOfType = stagePredictionData.stages.filter(s => s.stage === stageType);
                    const totalMins = stagesOfType.reduce((sum, s) => sum + s.duration, 0);
                    const avgQuality = stagesOfType.length > 0 
                      ? stagesOfType.reduce((sum, s) => sum + s.quality, 0) / stagesOfType.length 
                      : 0;
                    return (
                      <View key={stageType} style={[styles.stageBreakdownItem, { backgroundColor: palette.background }]}>
                        <Text style={styles.stageBreakdownEmoji}>{getStageEmoji(stageType)}</Text>
                        <View style={styles.stageBreakdownInfo}>
                          <Text style={[styles.stageBreakdownType, { color: palette.text }]}>
                            {stageType.toUpperCase()}
                          </Text>
                          <Text style={[styles.stageBreakdownDuration, { color: palette.textSecondary }]}>
                            {totalMins} mins
                          </Text>
                        </View>
                        <View style={[styles.stageBreakdownQuality, { backgroundColor: getStageColor(stageType) + '30' }]}>
                          <Text style={[styles.stageBreakdownQualityText, { color: getStageColor(stageType) }]}>
                            {Math.round(avgQuality * 100)}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Optimal Wake Times */}
                <Text style={[styles.stageSectionTitle, { color: palette.text, marginTop: 20 }]}>
                  ⏰ Optimal Wake Times
                </Text>
                <Text style={[styles.stageOptimalDesc, { color: palette.textSecondary }]}>
                  Wake at these times to feel refreshed (end of REM cycles)
                </Text>
                <View style={styles.optimalTimesGrid}>
                  {stagePredictionData.optimalWakeTimes.map((time, i) => (
                    <View key={i} style={[styles.optimalTimeCard, { 
                      backgroundColor: i === stagePredictionData.optimalWakeTimes.length - 1 ? palette.success + '20' : palette.background,
                      borderColor: i === stagePredictionData.optimalWakeTimes.length - 1 ? palette.success : palette.border,
                    }]}>
                      <Ionicons 
                        name="alarm" 
                        size={18} 
                        color={i === stagePredictionData.optimalWakeTimes.length - 1 ? palette.success : palette.textSecondary} 
                      />
                      <Text style={[styles.optimalTimeText, { 
                        color: i === stagePredictionData.optimalWakeTimes.length - 1 ? palette.success : palette.text 
                      }]}>
                        {time}
                      </Text>
                      {i === stagePredictionData.optimalWakeTimes.length - 1 && (
                        <Text style={[styles.optimalTimeBest, { color: palette.success }]}>BEST</Text>
                      )}
                    </View>
                  ))}
                </View>

                {/* Warnings */}
                {stagePredictionData.warnings.length > 0 && (
                  <View style={[styles.stageWarnings, { backgroundColor: palette.warning + '15' }]}>
                    <Ionicons name="warning" size={20} color={palette.warning} />
                    <View style={styles.stageWarningsList}>
                      {stagePredictionData.warnings.map((warning, i) => (
                        <Text key={i} style={[styles.stageWarningText, { color: palette.warning }]}>
                          • {warning}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Reset Button */}
                <Pressable
                  accessibilityRole="button"
                  style={[styles.actionButton, { backgroundColor: palette.muted, marginTop: 20 }]}
                  onPress={() => setStagePredictionData(null)}
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="refresh" size={20} color={palette.text} />
                  <Text style={[styles.actionButtonText, { color: palette.text }]}>
                    Try Different Times
                  </Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Dream Analysis Modal */}
      <Modal
        visible={showDreamAnalysisModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDreamAnalysisModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>💭 Dream AI Analysis</Text>
              <Pressable 
                onPress={() => { setShowDreamAnalysisModal(false); setDreamAnalysis(null); }}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            {!dreamAnalysis ? (
              <>
                <Text style={[styles.modalSubtitle, { color: palette.textSecondary }]}>
                  Describe your dream and we'll analyze it for themes, symbols, and insights
                </Text>
                <TextInput
                  style={[styles.dreamInputLarge, { color: palette.text, borderColor: palette.border, backgroundColor: palette.background }]}
                  value={dreamInput}
                  onChangeText={setDreamInput}
                  placeholder="I dreamed that I was..."
                  placeholderTextColor={palette.muted}
                  multiline
                  numberOfLines={5}
                />
                <Text style={[styles.emotionLabel, { color: palette.text }]}>
                  How did you feel in the dream?
                </Text>
                <View style={styles.emotionGrid}>
                  {['Fear', 'Anxiety', 'Joy', 'Sad', 'Anger', 'Confusion', 'Peace', 'Excitement'].map(emotion => (
                    <Pressable
                      key={emotion}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: dreamEmotions.includes(emotion.toLowerCase()) }}
                      style={[
                        styles.emotionChip,
                        { 
                          backgroundColor: dreamEmotions.includes(emotion.toLowerCase()) ? palette.primary : palette.background,
                          borderColor: palette.border 
                        }
                      ]}
                      onPress={() => toggleEmotion(emotion.toLowerCase())}
                      hitSlop={HIT_SLOP_12}
                    >
                      <Text style={{ color: dreamEmotions.includes(emotion.toLowerCase()) ? palette.onPrimary : palette.text }}>
                        {emotion}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  accessibilityRole="button"
                  style={[styles.analyzeButton, { backgroundColor: palette.primary }]}
                  onPress={analyzeDreamWithAI}
                >
                  <Ionicons name="sparkles" size={20} color={palette.onPrimary} />
                  <Text style={[styles.analyzeButtonText, { color: palette.onPrimary }]}>
                    Analyze Dream
                  </Text>
                </Pressable>
              </>
            ) : (
              <ScrollView style={styles.analysisResults}>
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: palette.text }]}>
                    🎭 Themes Detected
                  </Text>
                  <View style={styles.themeChips}>
                    {dreamAnalysis.themes.map((theme, i) => (
                      <View key={i} style={[styles.themeChip, { backgroundColor: palette.primary + '20' }]}>
                        <Text style={[styles.themeChipText, { color: palette.primary }]}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                {dreamAnalysis.symbols.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={[styles.analysisSectionTitle, { color: palette.text }]}>
                      🔮 Symbols & Meanings
                    </Text>
                    {dreamAnalysis.symbols.map((symbol, i) => (
                      <View key={i} style={[styles.symbolCard, { backgroundColor: palette.background }]}>
                        <Text style={[styles.symbolName, { color: palette.text }]}>{symbol.symbol}</Text>
                        <Text style={[styles.symbolMeaning, { color: palette.textSecondary }]}>
                          {symbol.possibleMeaning}
                        </Text>
                        <Text style={[styles.symbolFrequency, { color: palette.info }]}>
                          ({symbol.frequency})
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: palette.text }]}>
                    🧠 Processing Type
                  </Text>
                  <View style={[styles.processingBadge, { backgroundColor: palette.info + '20' }]}>
                    <Text style={[styles.processingText, { color: palette.info }]}>
                      {dreamAnalysis.processingType.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>
                {dreamAnalysis.insights.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={[styles.analysisSectionTitle, { color: palette.text }]}>
                      💡 Insights
                    </Text>
                    {dreamAnalysis.insights.map((insight, i) => (
                      <Text key={i} style={[styles.insightText, { color: palette.textSecondary }]}>
                        • {insight}
                      </Text>
                    ))}
                  </View>
                )}
                {dreamAnalysis.actionableAdvice.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={[styles.analysisSectionTitle, { color: palette.text }]}>
                      ✨ Recommended Actions
                    </Text>
                    {dreamAnalysis.actionableAdvice.map((advice, i) => (
                      <Text key={i} style={[styles.adviceText, { color: palette.success }]}>
                        ✓ {advice}
                      </Text>
                    ))}
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  style={[styles.analyzeButton, { backgroundColor: palette.muted, marginTop: 16 }]}
                  onPress={() => { setDreamAnalysis(null); setDreamInput(''); setDreamEmotions([]); }}
                  hitSlop={HIT_SLOP_12}
                >
                  <Text style={[styles.analyzeButtonText, { color: palette.text }]}>
                    Analyze Another Dream
                  </Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Optimization Plan Modal */}
      <Modal
        visible={showOptimizationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptimizationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>📋 Sleep Optimization Plan</Text>
              <Pressable 
                onPress={() => setShowOptimizationModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            {optimizationPlan && (
              <ScrollView>
                <View style={[styles.planSection, { backgroundColor: palette.background }]}>
                  <Text style={[styles.planSectionTitle, { color: palette.text }]}>
                    📅 Daily Actions
                  </Text>
                  {optimizationPlan.dailyActions.map((action, i) => (
                    <View key={i} style={styles.dailyAction}>
                      <View style={[styles.actionTime, { backgroundColor: palette.primary + '20' }]}>
                        <Text style={[styles.actionTimeText, { color: palette.primary }]}>{action.time}</Text>
                      </View>
                      <View style={styles.actionDetails}>
                        <Text style={[styles.actionText, { color: palette.text }]}>{action.action}</Text>
                        <Text style={[styles.actionImportance, { 
                          color: action.importance === 'required' ? palette.error : palette.textSecondary 
                        }]}>
                          {action.importance.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={[styles.planSection, { backgroundColor: palette.background }]}>
                  <Text style={[styles.planSectionTitle, { color: palette.text }]}>
                    🎯 Weekly Milestones
                  </Text>
                  {optimizationPlan.weeklyMilestones.map((milestone, i) => (
                    <View key={i} style={styles.milestone}>
                      <View style={[styles.weekBadge, { backgroundColor: palette.success + '20' }]}>
                        <Text style={[styles.weekText, { color: palette.success }]}>Week {milestone.week}</Text>
                      </View>
                      <Text style={[styles.milestoneGoal, { color: palette.text }]}>{milestone.goal}</Text>
                      <Text style={[styles.milestoneMetric, { color: palette.textSecondary }]}>{milestone.metric}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.planSection, { backgroundColor: palette.success + '10' }]}>
                  <Text style={[styles.planSectionTitle, { color: palette.success }]}>
                    📈 Expected Improvements
                  </Text>
                  <Text style={[styles.improvementText, { color: palette.text }]}>
                    • Quality increase: +{optimizationPlan.estimatedImprovement.qualityIncrease.toFixed(1)} points
                  </Text>
                  <Text style={[styles.improvementText, { color: palette.text }]}>
                    • Debt repayment: ~{optimizationPlan.estimatedImprovement.debtRepaymentWeeks} weeks
                  </Text>
                  <Text style={[styles.improvementText, { color: palette.text }]}>
                    • Energy boost: +{optimizationPlan.estimatedImprovement.energyImprovement}%
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                      accessibilityRole="button"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                      accessibilityRole="button"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                    accessibilityRole="button"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[
                      styles.dreamButton,
                      { backgroundColor: sleepLogData.dreams ? palette.primary : palette.background },
                    ]}
                    onPress={() => setSleepLogData({ ...sleepLogData, dreams: true })}
                  >
                    <Text style={{ color: sleepLogData.dreams ? palette.onPrimary : palette.text }}>Yes</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[styles.sleepLogButton, { backgroundColor: palette.muted }]}
                  onPress={() => setSleepLogStep(sleepLogStep - 1)}
                >
                  <Text style={[styles.sleepLogButtonText, { color: palette.text }]}>Back</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
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
  // === NEW STYLES FOR EXPANDED FEATURES ===
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  alignmentBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: 'auto',
  },
  alignmentScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alignmentLabel: {
    fontSize: 10,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  predictionEmoji: {
    fontSize: 32,
  },
  predictionConfidence: {
    fontSize: 12,
  },
  predictionScore: {
    alignItems: 'center',
    marginBottom: 16,
  },
  predictionValue: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  predictionLabel: {
    fontSize: 14,
  },
  factorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  factorText: {
    fontSize: 12,
  },
  loadingText: {
    textAlign: 'center',
    padding: 24,
    fontSize: 16,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  therapyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  therapyEmoji: {
    fontSize: 28,
  },
  therapyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  therapyType: {
    fontSize: 12,
    fontWeight: '700',
  },
  therapyDetails: {
    gap: 8,
    marginBottom: 12,
  },
  therapyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  therapyText: {
    fontSize: 14,
  },
  therapyBenefit: {
    fontSize: 14,
    fontWeight: '500',
  },
  jetLagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  jetLagEmoji: {
    fontSize: 28,
  },
  jetLagSubtitle: {
    fontSize: 12,
  },
  jetLagScore: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  jetLagValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  jetLagImpact: {
    fontSize: 12,
    fontWeight: '600',
  },
  strategiesList: {
    marginTop: 8,
  },
  strategiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  strategyText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  moonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moonCard: {
    width: '48%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  moonEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moonPhase: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  moonQuality: {
    fontSize: 11,
  },
  moonImpactBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  moonImpactText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  planEmoji: {
    fontSize: 28,
  },
  planFocus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  planGoals: {
    gap: 10,
    marginBottom: 16,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalText: {
    fontSize: 14,
  },
  interlinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  interlinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interlinkContent: {
    flex: 1,
    marginLeft: 12,
  },
  interlinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  interlinkDesc: {
    fontSize: 13,
    marginBottom: 6,
  },
  interlinkBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  interlinkBenefitText: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  dreamInputLarge: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  emotionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  emotionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  analysisResults: {
    maxHeight: 400,
  },
  analysisSection: {
    marginBottom: 20,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  themeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  themeChipText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  symbolCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  symbolName: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  symbolMeaning: {
    fontSize: 13,
    lineHeight: 18,
  },
  symbolFrequency: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  processingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  processingText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  planSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  planSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dailyAction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionTime: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionTimeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  actionImportance: {
    fontSize: 10,
    fontWeight: '600',
  },
  milestone: {
    marginBottom: 14,
  },
  weekBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  weekText: {
    fontSize: 12,
    fontWeight: '600',
  },
  milestoneGoal: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  milestoneMetric: {
    fontSize: 12,
  },
  improvementText: {
    fontSize: 14,
    marginBottom: 6,
  },
  // === SLEEP STAGE PREDICTION STYLES ===
  stageInputSection: {
    marginBottom: 16,
  },
  stageInputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  stageTimeInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  stageResultsContainer: {
    maxHeight: 500,
  },
  stageQualityCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  stageQualityValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  stageQualityLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  stageConfidence: {
    fontSize: 12,
    marginTop: 4,
  },
  stageCyclesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  stageCyclesValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  stageCyclesLabel: {
    fontSize: 16,
  },
  stageSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  stageTimeline: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  stageBar: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
  },
  stageBarEmoji: {
    fontSize: 16,
  },
  stageLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
  stageBreakdown: {
    gap: 10,
  },
  stageBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  stageBreakdownEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  stageBreakdownInfo: {
    flex: 1,
  },
  stageBreakdownType: {
    fontSize: 14,
    fontWeight: '600',
  },
  stageBreakdownDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  stageBreakdownQuality: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stageBreakdownQualityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stageOptimalDesc: {
    fontSize: 13,
    marginBottom: 12,
  },
  optimalTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optimalTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  optimalTimeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  optimalTimeBest: {
    fontSize: 10,
    fontWeight: '700',
  },
  stageWarnings: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 10,
  },
  stageWarningsList: {
    flex: 1,
  },
  stageWarningText: {
    fontSize: 13,
    lineHeight: 20,
  },
});


