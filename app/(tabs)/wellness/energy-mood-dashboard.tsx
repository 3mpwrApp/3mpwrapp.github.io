/* eslint-disable no-restricted-syntax */
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { HIT_SLOP_12 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { useCognitiveDistortionScanner } from '../../../services/cognitiveDistortionScanner';
import { useEmotionalFirstAid } from '../../../services/emotionalFirstAid';
import { useEmotionalWeatherStation } from '../../../services/emotionalWeatherStation';
import { useEnergyAwareUI } from '../../../services/energyAwareUI';
import { useEnergyQuantumMechanics, type QuantumEnergyState } from '../../../services/energyQuantumMechanics';
import { useSpoonEconomist } from '../../../services/spoonEconomist';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

// Social interaction types
type InteractionType = 'conversation' | 'group_event' | 'video_call' | 'text' | 'work_meeting' | 'family' | 'date' | 'other';
type EnergyImpact = 'draining' | 'neutral' | 'energizing';

interface SocialInteraction {
  id: string;
  type: InteractionType;
  person: string;
  duration: number; // minutes
  energyBefore: number;
  energyAfter: number;
  impact: EnergyImpact;
  notes?: string;
  timestamp: string;
}

interface TemporalShift {
  id: string;
  amount: number;
  fromDate: string;
  toDate: string;
  reason: string;
  repaid: boolean;
  interestAccrued: number;
}

// ============================================================================
// REAL-TIME BIOFEEDBACK UI - NEVER BEEN DONE BEFORE
// ============================================================================

export default function EnergyMoodDashboard() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const quantum = useEnergyQuantumMechanics();
  const weather = useEmotionalWeatherStation();
  const spoonEconomist = useSpoonEconomist();
  const emotionalFirstAid = useEmotionalFirstAid();
  const cognitiveScanner = useCognitiveDistortionScanner();
  const energyAware = useEnergyAwareUI();

  const [quantumState, setQuantumState] = useState(quantum.getCurrentState());
  const [energyDebt, setEnergyDebt] = useState(quantum.getDebt());
  const [moodForecast, setMoodForecast] = useState(weather.forecastMood(24));
  const [currentWeather, setCurrentWeather] = useState(weather.currentMood);

  // ============================================================================
  // AI-POWERED STATE
  // ============================================================================
  const [biometrics, setBiometrics] = useState(energyAware.getLatestBiometrics());
  const [crashPrediction, setCrashPrediction] = useState(spoonEconomist.crashPrediction);
  const [crisisPrediction, setCrisisPrediction] = useState(emotionalFirstAid.crisisPrediction);
  const [thoughtPatterns, setThoughtPatterns] = useState(cognitiveScanner.patterns);

  // ============================================================================
  // SOCIAL INTERACTION & TEMPORAL SHIFT STATE
  // ============================================================================
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showTemporalModal, setShowTemporalModal] = useState(false);
  const [socialInteractions, setSocialInteractions] = useState<SocialInteraction[]>([]);
  const [temporalShifts, setTemporalShifts] = useState<TemporalShift[]>([]);

  const [socialFormData, setSocialFormData] = useState({
    type: 'conversation' as InteractionType,
    person: '',
    duration: 30,
    energyBefore: 50,
    energyAfter: 50,
    notes: '',
  });

  const [temporalFormData, setTemporalFormData] = useState({
    amount: 10,
    fromDaysAhead: 1,
    reason: '',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumState(quantum.getCurrentState());
      setEnergyDebt(quantum.getDebt());
      setMoodForecast(weather.forecastMood(24));
      setCurrentWeather(weather.currentMood);
      // AI-powered updates
      setBiometrics(energyAware.getLatestBiometrics());
      setCrashPrediction(spoonEconomist.crashPrediction);
      setCrisisPrediction(emotionalFirstAid.crisisPrediction);
      setThoughtPatterns(cognitiveScanner.patterns);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const quantumColors: Record<string, string> = {
    excited: palette.warning,
    ground: palette.success,
    low_energy: palette.warning,
    depleted: palette.error,
    borrowed: palette.error,
    recovering: palette.info,
    superposition: palette.primary,
  };

  const weatherColors: Record<string, string> = {
    sunny: palette.warning,
    partly_cloudy: palette.info,
    overcast: palette.muted,
    rainy: palette.info,
    stormy: palette.muted,
    foggy: palette.muted,
    thunderstorm: palette.primary,
    scattered_showers: palette.info,
    high_pressure: palette.error,
    arctic_blast: palette.info,
  };

  const borrowEnergy = (amount: number) => {
    quantum.borrowEnergy(amount);
    setQuantumState(quantum.getCurrentState());
    setEnergyDebt(quantum.getDebt());
  };

  const shiftEnergy = () => {
    setShowTemporalModal(true);
  };

  const logSocialInteraction = () => {
    setShowSocialModal(true);
  };

  const saveSocialInteraction = () => {
    const impact: EnergyImpact = 
      socialFormData.energyAfter > socialFormData.energyBefore + 10 ? 'energizing' :
      socialFormData.energyAfter < socialFormData.energyBefore - 10 ? 'draining' : 'neutral';

    const interaction: SocialInteraction = {
      id: `social_${Date.now()}`,
      type: socialFormData.type,
      person: socialFormData.person || 'Someone',
      duration: socialFormData.duration,
      energyBefore: socialFormData.energyBefore,
      energyAfter: socialFormData.energyAfter,
      impact,
      notes: socialFormData.notes || undefined,
      timestamp: new Date().toISOString(),
    };

    setSocialInteractions([interaction, ...socialInteractions]);
    setShowSocialModal(false);
    setSocialFormData({
      type: 'conversation',
      person: '',
      duration: 30,
      energyBefore: quantum.getCurrentEnergy(),
      energyAfter: quantum.getCurrentEnergy(),
      notes: '',
    });

    // Update energy based on the interaction
    const energyChange = socialFormData.energyAfter - socialFormData.energyBefore;
    if (energyChange !== 0) {
      quantum.adjustEnergy(energyChange);
      setQuantumState(quantum.getCurrentState());
    }

    Alert.alert(
      'Interaction Logged',
      `${impact === 'energizing' ? '⚡' : impact === 'draining' ? '🔋' : '➖'} This interaction was ${impact}. Energy ${energyChange >= 0 ? '+' : ''}${energyChange}`,
    );
  };

  const executeTemporalShift = () => {
    const interestRate = 0.15; // 15% interest on borrowed energy
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + temporalFormData.fromDaysAhead);

    const shift: TemporalShift = {
      id: `shift_${Date.now()}`,
      amount: temporalFormData.amount,
      fromDate: futureDate.toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      reason: temporalFormData.reason || 'Needed extra energy today',
      repaid: false,
      interestAccrued: temporalFormData.amount * interestRate,
    };

    setTemporalShifts([shift, ...temporalShifts]);
    quantum.borrowEnergy(temporalFormData.amount);
    setQuantumState(quantum.getCurrentState());
    setEnergyDebt(quantum.getDebt());
    setShowTemporalModal(false);
    setTemporalFormData({ amount: 10, fromDaysAhead: 1, reason: '' });

    Alert.alert(
      '⏱️ Temporal Shift Complete',
      `Borrowed ${temporalFormData.amount} energy units from ${futureDate.toLocaleDateString()}.\n\nYou'll owe ${Math.round(temporalFormData.amount * (1 + interestRate))} units when it comes due.`,
    );
  };

  const getInteractionIcon = (type: InteractionType) => {
    const icons: Record<InteractionType, string> = {
      conversation: 'chatbubbles',
      group_event: 'people',
      video_call: 'videocam',
      text: 'phone-portrait',
      work_meeting: 'briefcase',
      family: 'home',
      date: 'heart',
      other: 'ellipse',
    };
    return icons[type] || 'ellipse';
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Energy & Mood Dashboard'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Quantum Energy State */}
        <View
          style={[
            styles.card,
            { backgroundColor: quantumColors[quantumState as QuantumEnergyState] + '20' },
          ]}
        >
          <View style={styles.quantumHeader}>
            <View
              style={[
                styles.stateIndicator,
                { backgroundColor: quantumColors[quantumState as QuantumEnergyState] },
              ]}
            >
              <Ionicons name="flash" size={32} color={palette.onPrimary} />
            </View>
            <View style={styles.stateInfo}>
              <Text style={[styles.stateTitle, { color: palette.text }]}>
                {quantumState.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={[styles.stateDescription, { color: palette.textSecondary }]}>
                Energy Level: {quantum.getCurrentEnergy()}/100
              </Text>
            </View>
          </View>

          <View style={styles.energyBar}>
            <View
              style={[
                styles.energyFill,
                {
                  width: `${quantum.getCurrentEnergy()}%`,
                  backgroundColor: quantumColors[quantumState as QuantumEnergyState],
                },
              ]}
            />
          </View>

        </View>

        {/* Energy Debt */}
        {energyDebt && energyDebt.currentBalance > 0 && (
          <View style={[styles.card, { backgroundColor: palette.errorBackground }]}>
            <View style={styles.debtHeader}>
              <Ionicons name="warning" size={24} color={palette.error} />
              <Text style={[styles.debtTitle, { color: palette.error }]}>Energy Debt</Text>
            </View>

            <Text style={[styles.debtAmount, { color: palette.error }]}>
              {energyDebt.currentBalance.toFixed(1)} units owed
            </Text>
            <Text style={[styles.debtRate, { color: palette.warning }]}>
              Compound interest: {(energyDebt.interestRate * 100).toFixed(0)}% per day
            </Text>

            <View style={styles.borrowSection}>
              <Text style={[styles.borrowLabel, { color: palette.error }]}>
                Borrow more energy (at {(energyDebt.interestRate * 100).toFixed(0)}% daily interest):
              </Text>
              <View style={styles.borrowButtons}>
                <Pressable
                  style={[styles.borrowButton, { backgroundColor: palette.error }]}
                  onPress={() => borrowEnergy(5)}
                >
                  <Text style={styles.borrowButtonText}>+5 units</Text>
                </Pressable>
                <Pressable
                  style={[styles.borrowButton, { backgroundColor: palette.error }]}
                  onPress={() => borrowEnergy(10)}
                >
                  <Text style={styles.borrowButtonText}>+10 units</Text>
                </Pressable>
                <Pressable
                  style={[styles.borrowButton, { backgroundColor: palette.error }]}
                  onPress={() => borrowEnergy(20)}
                >
                  <Text style={styles.borrowButtonText}>+20 units</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Current Emotional Weather */}
        {currentWeather && (
          <View
            style={[
              styles.card,
              { backgroundColor: weatherColors[currentWeather.weather] + '20' },
            ]}
          >
            <View style={styles.weatherHeader}>
              <View
                style={[
                  styles.weatherIcon,
                  { backgroundColor: weatherColors[currentWeather.weather] },
                ]}
              >
                <Ionicons
                  name={
                    currentWeather.weather === 'clear_skies' || currentWeather.weather === 'partly_cloudy'
                      ? 'sunny'
                      : currentWeather.weather === 'light_rain'
                      ? 'rainy'
                      : currentWeather.weather === 'thunderstorm' || currentWeather.weather === 'hurricane'
                      ? 'thunderstorm'
                      : 'cloud'
                  }
                  size={32}
                  color={palette.onPrimary}
                />
              </View>
              <View style={styles.weatherInfo}>
                <Text style={[styles.weatherTitle, { color: palette.text }]}>
                  {currentWeather.weather.replace(/_/g, ' ').toUpperCase()}
                </Text>
                <Text style={[styles.weatherIntensity, { color: palette.textSecondary }]}>
                  Intensity: {currentWeather.intensity}/5
                </Text>
              </View>
            </View>

            <Text style={[styles.weatherDescription, { color: palette.text }]}>
              {currentWeather.primaryEmotion}
            </Text>

            {currentWeather.triggers && currentWeather.triggers.length > 0 && (
              <View style={styles.triggersSection}>
                <Text style={[styles.triggersLabel, { color: palette.textSecondary }]}>
                  Possible triggers:
                </Text>
                {currentWeather.triggers.map((trigger, index) => (
                  <Text key={index} style={[styles.triggerText, { color: palette.text }]}>
                    • {trigger}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Mood Forecast */}
        {moodForecast && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              24-Hour Mood Forecast
            </Text>

            <View style={[styles.forecastCard, { borderColor: palette.border }]}>
              <View style={styles.forecastHeader}>
                <Text style={[styles.forecastTime, { color: palette.text }]}>
                  {moodForecast.hoursAhead} hours ahead
                </Text>
                <View
                  style={[
                    styles.forecastBadge,
                    { backgroundColor: weatherColors[moodForecast.predictedWeather] },
                  ]}
                >
                  <Text style={styles.forecastBadgeText}>
                    {moodForecast.predictedWeather.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${moodForecast.confidence}%`,
                      backgroundColor: palette.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.confidenceText, { color: palette.textSecondary }]}>
                {moodForecast.confidence.toFixed(0)}% confidence
              </Text>
            </View>
          </View>
        )}

        {/* Social Energy Economics */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            Social Energy Economics
          </Text>
          <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
            Track which social interactions drain or restore your energy
          </Text>

          <Pressable
            style={[styles.toolButton, { backgroundColor: palette.primary + '20', borderColor: palette.primary }]}
            onPress={logSocialInteraction}
          >
            <Ionicons name="people" size={24} color={palette.primary} />
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, { color: palette.text }]}>
                Log Social Interaction
              </Text>
              <Text style={[styles.toolDescription, { color: palette.textSecondary }]}>
                Record energy cost/gain from social events
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </Pressable>

          {/* Recent Interactions */}
          {socialInteractions.length > 0 && (
            <View style={styles.recentInteractions}>
              <Text style={[styles.recentLabel, { color: palette.textSecondary }]}>Recent:</Text>
              {socialInteractions.slice(0, 3).map((interaction) => (
                <View key={interaction.id} style={[styles.interactionItem, { backgroundColor: palette.background }]}>
                  <Ionicons
                    name={getInteractionIcon(interaction.type) as any}
                    size={18}
                    color={
                      interaction.impact === 'energizing' ? palette.success :
                      interaction.impact === 'draining' ? palette.error : palette.muted
                    }
                  />
                  <Text style={[styles.interactionPerson, { color: palette.text }]} numberOfLines={1}>
                    {interaction.person}
                  </Text>
                  <Text style={[
                    styles.interactionChange,
                    {
                      color: interaction.impact === 'energizing' ? palette.success :
                        interaction.impact === 'draining' ? palette.error : palette.muted
                    }
                  ]}>
                    {interaction.energyAfter - interaction.energyBefore >= 0 ? '+' : ''}
                    {interaction.energyAfter - interaction.energyBefore}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Temporal Energy Shifting */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            Temporal Energy Tools
          </Text>

          <Pressable
            style={[styles.toolButton, { backgroundColor: palette.primary + '20', borderColor: palette.primary }]}
            onPress={shiftEnergy}
          >
            <Ionicons name="time" size={24} color={palette.primary} />
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, { color: palette.text }]}>
                Shift Energy Timeline
              </Text>
              <Text style={[styles.toolDescription, { color: palette.textSecondary }]}>
                Borrow energy from future days (with interest)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </Pressable>
        </View>

        {/* ============================================================================ */}
        {/* AI-POWERED BIOFEEDBACK SECTION */}
        {/* ============================================================================ */}

        {/* Real-time Biometrics */}
        {biometrics && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <View style={styles.biofeedbackHeader}>
              <Ionicons name="heart" size={24} color={palette.error} />
              <Text style={[styles.sectionTitle, { color: palette.text, marginLeft: 8 }]}>
                Real-time Biofeedback
              </Text>
            </View>

            <View style={styles.biometricGrid}>
              <View style={[styles.biometricItem, { backgroundColor: palette.errorBackground }]}>
                <Ionicons name="pulse" size={20} color={palette.error} />
                <Text style={[styles.biometricValue, { color: palette.text }]}>
                  {biometrics.heartRate} BPM
                </Text>
                <Text style={[styles.biometricLabel, { color: palette.textSecondary }]}>
                  Heart Rate
                </Text>
              </View>

              <View style={[styles.biometricItem, { backgroundColor: palette.successBackground }]}>
                <Ionicons name="analytics" size={20} color={palette.success} />
                <Text style={[styles.biometricValue, { color: palette.text }]}>
                  {biometrics.hrv} ms
                </Text>
                <Text style={[styles.biometricLabel, { color: palette.textSecondary }]}>
                  HRV
                </Text>
              </View>

              <View style={[styles.biometricItem, { backgroundColor: palette.warningBackground }]}>
                <Ionicons name="flash" size={20} color={palette.warning} />
                <Text style={[styles.biometricValue, { color: palette.text }]}>
                  {biometrics.stressIndex}%
                </Text>
                <Text style={[styles.biometricLabel, { color: palette.textSecondary }]}>
                  Stress
                </Text>
              </View>

              <View style={[styles.biometricItem, { backgroundColor: palette.infoBackground }]}>
                <Ionicons name="moon" size={20} color={palette.info} />
                <Text style={[styles.biometricValue, { color: palette.text }]}>
                  {biometrics.sleepQuality}%
                </Text>
                <Text style={[styles.biometricLabel, { color: palette.textSecondary }]}>
                  Sleep Quality
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* AI Crash Prediction */}
        {crashPrediction && (
          <View style={[
            styles.card,
            {
              backgroundColor: crashPrediction.crashRisk === 'critical' ? palette.errorBackground :
                crashPrediction.crashRisk === 'high' ? palette.warningBackground :
                palette.surface
            }
          ]}>
            <View style={styles.predictionHeader}>
              <Ionicons
                name={crashPrediction.crashRisk === 'critical' ? 'alert-circle' : 'warning'}
                size={24}
                color={crashPrediction.crashRisk === 'critical' ? palette.error :
                  crashPrediction.crashRisk === 'high' ? palette.warning : palette.info}
              />
              <Text style={[styles.sectionTitle, { color: palette.text, marginLeft: 8 }]}>
                AI Energy Prediction
              </Text>
            </View>

            <View style={styles.crashRiskContainer}>
              <Text style={[styles.crashRiskLabel, { color: palette.textSecondary }]}>
                Crash Risk:
              </Text>
              <View style={[
                styles.crashRiskBadge,
                {
                  backgroundColor: crashPrediction.crashRisk === 'critical' ? palette.error :
                    crashPrediction.crashRisk === 'high' ? palette.warning :
                    crashPrediction.crashRisk === 'medium' ? palette.info : palette.success
                }
              ]}>
                <Text style={styles.crashRiskText}>
                  {crashPrediction.crashRisk.toUpperCase()} ({crashPrediction.crashProbability}%)
                </Text>
              </View>
            </View>

            <Text style={[styles.optimalRestText, { color: palette.textSecondary }]}>
              Optimal rest window: {crashPrediction.optimalRestTime}
            </Text>

            {crashPrediction.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={[styles.recommendationsLabel, { color: palette.text }]}>
                  AI Recommendations:
                </Text>
                {crashPrediction.recommendations.map((rec, index) => (
                  <Text key={index} style={[styles.recommendationText, { color: palette.textSecondary }]}>
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Crisis Risk Prediction */}
        {crisisPrediction && crisisPrediction.riskLevel !== 'low' && (
          <View style={[
            styles.card,
            {
              backgroundColor: crisisPrediction.riskLevel === 'imminent' ? palette.errorBackground :
                crisisPrediction.riskLevel === 'high' ? palette.warningBackground :
                palette.infoBackground
            }
          ]}>
            <View style={styles.crisisHeader}>
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={crisisPrediction.riskLevel === 'imminent' ? palette.error :
                  crisisPrediction.riskLevel === 'high' ? palette.warning : palette.info}
              />
              <Text style={[styles.sectionTitle, { color: palette.text, marginLeft: 8 }]}>
                Emotional Safety Check
              </Text>
            </View>

            <Text style={[styles.crisisRiskText, { color: palette.text }]}>
              Risk Level: {crisisPrediction.riskLevel.toUpperCase()}
            </Text>

            {crisisPrediction.preventiveActions.length > 0 && (
              <View style={styles.preventiveActions}>
                {crisisPrediction.preventiveActions.map((action, index) => (
                  <Text key={index} style={[styles.actionText, { color: palette.text }]}>
                    ⚡ {action}
                  </Text>
                ))}
              </View>
            )}

            <Pressable
              style={[styles.crisisButton, { backgroundColor: palette.primary }]}
              onPress={() => emotionalFirstAid.getPersonalizedIntervention()}
            >
              <Ionicons name="hand-left" size={20} color={palette.onPrimary} />
              <Text style={[styles.crisisButtonText, { color: palette.onPrimary }]}>
                Get Personalized Intervention
              </Text>
            </Pressable>
          </View>
        )}

        {/* Cognitive Pattern Awareness */}
        {thoughtPatterns.length > 0 && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <View style={styles.cognitiveHeader}>
              <Ionicons name="flash-outline" size={24} color={palette.primary} />
              <Text style={[styles.sectionTitle, { color: palette.text, marginLeft: 8 }]}>
                Cognitive Patterns
              </Text>
            </View>

            {thoughtPatterns.slice(0, 3).map((pattern, index) => (
              <View key={index} style={styles.patternItem}>
                <View style={styles.patternInfo}>
                  <Text style={[styles.patternType, { color: palette.text }]}>
                    {pattern.distortionType.replace(/_/g, ' ')}
                  </Text>
                  <Text style={[styles.patternTrend, { color: pattern.trend === 'decreasing' ? palette.success : pattern.trend === 'increasing' ? palette.error : palette.textSecondary }]}>
                    {pattern.trend === 'decreasing' ? '↓ Improving' : pattern.trend === 'increasing' ? '↑ Watch this' : '→ Stable'}
                  </Text>
                </View>
                <View style={[styles.patternFrequency, { backgroundColor: palette.primary + '20' }]}>
                  <Text style={[styles.frequencyText, { color: palette.primary }]}>
                    {pattern.frequency}x
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Social Interaction Modal */}
      <Modal
        visible={showSocialModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSocialModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Log Social Interaction</Text>
              <Pressable 
                onPress={() => setShowSocialModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Interaction Type */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>Type of Interaction</Text>
                <View style={styles.typeGrid}>
                  {(['conversation', 'video_call', 'work_meeting', 'group_event', 'family', 'date', 'text', 'other'] as InteractionType[]).map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: socialFormData.type === type ? palette.primary : palette.background,
                          borderColor: palette.border,
                        },
                      ]}
                      onPress={() => setSocialFormData({ ...socialFormData, type })}
                    >
                      <Ionicons
                        name={getInteractionIcon(type) as any}
                        size={20}
                        color={socialFormData.type === type ? palette.onPrimary : palette.text}
                      />
                      <Text
                        style={{
                          color: socialFormData.type === type ? palette.onPrimary : palette.text,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {type.replace(/_/g, ' ')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Person */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>Who were you with?</Text>
                <TextInput
                  style={[styles.textInput, { color: palette.text, borderColor: palette.border }]}
                  value={socialFormData.person}
                  onChangeText={(v) => setSocialFormData({ ...socialFormData, person: v })}
                  placeholder="Name or description"
                  placeholderTextColor={palette.muted}
                />
              </View>

              {/* Duration */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>Duration: {socialFormData.duration} min</Text>
                <View style={styles.durationRow}>
                  {[15, 30, 60, 120, 180].map((dur) => (
                    <Pressable
                      key={dur}
                      style={[
                        styles.durationButton,
                        {
                          backgroundColor: socialFormData.duration === dur ? palette.primary : palette.background,
                          borderColor: palette.border,
                        },
                      ]}
                      onPress={() => setSocialFormData({ ...socialFormData, duration: dur })}
                    >
                      <Text style={{ color: socialFormData.duration === dur ? palette.onPrimary : palette.text, fontSize: 13 }}>
                        {dur < 60 ? `${dur}m` : `${dur / 60}h`}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Energy Before */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>
                  Energy BEFORE: {socialFormData.energyBefore}%
                </Text>
                <View style={styles.energySlider}>
                  {[0, 25, 50, 75, 100].map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        styles.energyLevelButton,
                        {
                          backgroundColor: Math.abs(socialFormData.energyBefore - level) <= 12 ? palette.warning : palette.background,
                          borderColor: palette.warning,
                        },
                      ]}
                      onPress={() => setSocialFormData({ ...socialFormData, energyBefore: level })}
                    >
                      <Text style={{ color: Math.abs(socialFormData.energyBefore - level) <= 12 ? '#fff' : palette.text }}>
                        {level}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Energy After */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>
                  Energy AFTER: {socialFormData.energyAfter}%
                </Text>
                <View style={styles.energySlider}>
                  {[0, 25, 50, 75, 100].map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        styles.energyLevelButton,
                        {
                          backgroundColor: Math.abs(socialFormData.energyAfter - level) <= 12 ? palette.success : palette.background,
                          borderColor: palette.success,
                        },
                      ]}
                      onPress={() => setSocialFormData({ ...socialFormData, energyAfter: level })}
                    >
                      <Text style={{ color: Math.abs(socialFormData.energyAfter - level) <= 12 ? '#fff' : palette.text }}>
                        {level}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>Notes (optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, { color: palette.text, borderColor: palette.border }]}
                  value={socialFormData.notes}
                  onChangeText={(v) => setSocialFormData({ ...socialFormData, notes: v })}
                  placeholder="What affected your energy?"
                  placeholderTextColor={palette.muted}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: palette.muted }]}
                onPress={() => setShowSocialModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: palette.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: palette.primary }]}
                onPress={saveSocialInteraction}
              >
                <Text style={[styles.modalButtonText, { color: palette.onPrimary }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Temporal Energy Shift Modal */}
      <Modal
        visible={showTemporalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemporalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>⏱️ Temporal Energy Shift</Text>
              <Pressable 
                onPress={() => setShowTemporalModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            <Text style={[styles.temporalDescription, { color: palette.textSecondary }]}>
              Borrow energy from your future self. Warning: There's a 15% interest rate!
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: palette.text }]}>
                Amount to borrow: {temporalFormData.amount} units
              </Text>
              <View style={styles.amountRow}>
                {[5, 10, 15, 20, 25].map((amt) => (
                  <Pressable
                    key={amt}
                    style={[
                      styles.amountButton,
                      {
                        backgroundColor: temporalFormData.amount === amt ? palette.primary : palette.background,
                        borderColor: palette.primary,
                      },
                    ]}
                    onPress={() => setTemporalFormData({ ...temporalFormData, amount: amt })}
                  >
                    <Text style={{ color: temporalFormData.amount === amt ? palette.onPrimary : palette.text }}>
                      {amt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: palette.text }]}>
                Borrow from {temporalFormData.fromDaysAhead} day(s) ahead
              </Text>
              <View style={styles.daysRow}>
                {[1, 2, 3, 5, 7].map((days) => (
                  <Pressable
                    key={days}
                    style={[
                      styles.daysButton,
                      {
                        backgroundColor: temporalFormData.fromDaysAhead === days ? palette.warning : palette.background,
                        borderColor: palette.warning,
                      },
                    ]}
                    onPress={() => setTemporalFormData({ ...temporalFormData, fromDaysAhead: days })}
                  >
                    <Text style={{ color: temporalFormData.fromDaysAhead === days ? '#fff' : palette.text }}>
                      {days}d
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: palette.text }]}>Why do you need this energy?</Text>
              <TextInput
                style={[styles.textInput, { color: palette.text, borderColor: palette.border }]}
                value={temporalFormData.reason}
                onChangeText={(v) => setTemporalFormData({ ...temporalFormData, reason: v })}
                placeholder="Important event, deadline, etc."
                placeholderTextColor={palette.muted}
              />
            </View>

            <View style={[styles.warningBox, { backgroundColor: palette.warningBackground }]}>
              <Ionicons name="warning" size={20} color={palette.warning} />
              <View style={styles.warningContent}>
                <Text style={[styles.warningText, { color: palette.warning }]}>
                  You'll owe {Math.round(temporalFormData.amount * 1.15)} energy units on{' '}
                  {new Date(Date.now() + temporalFormData.fromDaysAhead * 86400000).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: palette.muted }]}
                onPress={() => setShowTemporalModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: palette.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: palette.warning }]}
                onPress={executeTemporalShift}
              >
                <Ionicons name="time" size={18} color="#fff" />
                <Text style={[styles.modalButtonText, { color: '#fff', marginLeft: 6 }]}>Borrow Energy</Text>
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
  quantumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stateIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateInfo: {
    marginLeft: 16,
    flex: 1,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stateDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  energyBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  energyFill: {
    height: '100%',
  },
  halfLifeText: {
    fontSize: 12,
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
    marginBottom: 8,
  },
  debtRate: {
    fontSize: 14,
    marginBottom: 16,
  },
  borrowSection: {
    marginTop: 12,
  },
  borrowLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  borrowButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  borrowButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  borrowButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherInfo: {
    marginLeft: 16,
    flex: 1,
  },
  weatherTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weatherIntensity: {
    fontSize: 14,
    marginTop: 4,
  },
  weatherDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  triggersSection: {
    marginTop: 8,
  },
  triggersLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  triggerText: {
    fontSize: 13,
    marginLeft: 8,
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
  forecastCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forecastTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  forecastBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  forecastBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidenceBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
  },
  confidenceText: {
    fontSize: 11,
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
  // ============================================================================
  // AI BIOFEEDBACK STYLES
  // ============================================================================
  biofeedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  biometricItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  biometricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  biometricLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  crashRiskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  crashRiskLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  crashRiskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  crashRiskText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  optimalRestText: {
    fontSize: 13,
    marginBottom: 12,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 2,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  crisisRiskText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  preventiveActions: {
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    marginBottom: 4,
  },
  crisisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  crisisButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cognitiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  patternInfo: {
    flex: 1,
  },
  patternType: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  patternTrend: {
    fontSize: 12,
    marginTop: 2,
  },
  patternFrequency: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // ============================================================================
  // SOCIAL INTERACTION STYLES
  // ============================================================================
  recentInteractions: {
    marginTop: 12,
  },
  recentLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    gap: 8,
  },
  interactionPerson: {
    flex: 1,
    fontSize: 14,
  },
  interactionChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  // ============================================================================
  // MODAL STYLES
  // ============================================================================
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
  modalScroll: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    width: '23%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  energySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  energyLevelButton: {
    width: 50,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  temporalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    marginBottom: 8,
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

