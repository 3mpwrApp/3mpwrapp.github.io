/**
 * AI Grounding Companion Screen
 * 
 * Personalized grounding assistant that learns what works for YOU
 * and adapts in real-time based on context and biometric feedback.
 */

/* eslint-disable no-restricted-syntax */ // Hex colors needed for static StyleSheet definitions

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useGroundingCompanion, type DistressLevel, type GroundingContext, type GroundingSession, type GroundingTechnique } from '../../../services/aiGroundingCompanion';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function AIGroundingScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const grounding = useGroundingCompanion();

  const [techniques, setTechniques] = useState<GroundingTechnique[]>([]);
  const [currentSession, setCurrentSession] = useState<GroundingSession | null>(null);
  const [activeTechnique, setActiveTechnique] = useState<GroundingTechnique | null>(null);
  const [distressLevel, setDistressLevel] = useState<DistressLevel>(5);
  const [showContextModal, setShowContextModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [recommendations, setRecommendations] = useState<GroundingTechnique[]>([]);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [breathProgress] = useState(new Animated.Value(0));

  const [context, setContext] = useState<GroundingContext>({
    trigger: undefined,
    location: 'home',
    timeAvailable: 5,
    safeToSpeak: true,
    hasPrivacy: true,
    mobilityLevel: 'full',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await grounding.initialize();
    setTechniques(grounding.getTechniques());
    setCurrentSession(grounding.getCurrentSession());
  }

  async function startSession() {
    try {
      const session = await grounding.startSession(distressLevel, context);
      setCurrentSession(session);
      const recs = await grounding.getRecommendations(context, distressLevel as DistressLevel);
      setRecommendations(recs.map((r: { technique: GroundingTechnique }) => r.technique));
      setShowContextModal(false);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }

  async function startTechnique(technique: GroundingTechnique) {
    try {
      await grounding.startTechnique(technique.id);
      setActiveTechnique(technique);
      setShowTechniqueModal(true);
      
      if (technique.category === 'breathing') {
        startBreathingAnimation(technique);
      }
    } catch {
      console.error('Failed to start technique');
    }
  }

  function startBreathingAnimation(_technique: GroundingTechnique) {
    const cycle = () => {
      // 4-7-8 breathing pattern
      setBreathPhase('inhale');
      Animated.timing(breathProgress, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false,
      }).start(() => {
        setBreathPhase('hold');
        setTimeout(() => {
          setBreathPhase('exhale');
          Animated.timing(breathProgress, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: false,
          }).start(() => {
            setBreathPhase('rest');
            setTimeout(cycle, 1000);
          });
        }, 7000);
      });
    };
    cycle();
  }

  async function completeTechnique(effectiveness: number) {
    try {
      if (!activeTechnique) return;
      await grounding.completeTechnique(activeTechnique.id, effectiveness);
      setShowTechniqueModal(false);
      setActiveTechnique(null);
      
      // Update session
      setCurrentSession(grounding.getCurrentSession());
    } catch (error) {
      console.error('Failed to complete technique:', error);
    }
  }

  async function endSession(finalDistress: DistressLevel) {
    try {
      await grounding.endSession(finalDistress);
      setCurrentSession(null);
      setRecommendations([]);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  const getDistressColor = (level: number) => {
    if (level <= 3) return palette.success;
    if (level <= 6) return palette.warning;
    return palette.error;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sensory': return 'hand-left';
      case 'breathing': return 'cloud';
      case 'body': return 'body';
      case 'movement': return 'walk';
      case 'cognitive': return 'bulb';
      case 'visualization': return 'eye';
      case 'orientation': return 'compass';
      case 'bilateral': return 'swap-horizontal';
      case 'tactile': return 'finger-print';
      case 'auditory': return 'musical-notes';
      default: return 'heart';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('AI Grounding Companion'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Current State */}
        {!currentSession ? (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart" size={24} color={palette.primary} />
              <Text style={[styles.cardTitle, { color: palette.text }]}>How are you feeling?</Text>
            </View>

            <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
              Rate your current distress level from 0 (calm) to 10 (overwhelmed)
            </Text>

            <View style={styles.distressSlider}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.distressButton,
                    {
                      backgroundColor: distressLevel === level
                        ? getDistressColor(level)
                        : palette.background,
                      borderColor: getDistressColor(level),
                    },
                  ]}
                  onPress={() => setDistressLevel(level as DistressLevel)}
                >
                  <Text
                    style={[
                      styles.distressButtonText,
                      { color: distressLevel === level ? '#fff' : palette.text },
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.distressLabels}>
              <Text style={[styles.distressLabel, { color: palette.success }]}>Calm</Text>
              <Text style={[styles.distressLabel, { color: palette.warning }]}>Moderate</Text>
              <Text style={[styles.distressLabel, { color: palette.error }]}>Overwhelmed</Text>
            </View>

            <Pressable
              style={[styles.startButton, { backgroundColor: palette.primary }]}
              onPress={() => setShowContextModal(true)}
            >
              <Ionicons name="play" size={20} color={palette.onPrimary} />
              <Text style={[styles.startButtonText, { color: palette.onPrimary }]}>
                Start Grounding Session
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Active Session */}
            <View style={[styles.card, { backgroundColor: palette.primary + '15' }]}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionLabel, { color: palette.textSecondary }]}>
                    Session in Progress
                  </Text>
                  <Text style={[styles.sessionDistress, { color: palette.text }]}>
                    Started at distress level {currentSession.initialDistress}
                  </Text>
                </View>
                <Pressable
                  style={[styles.endButton, { backgroundColor: palette.error }]}
                  onPress={() => endSession(distressLevel)}
                >
                  <Text style={styles.endButtonText}>End Session</Text>
                </Pressable>
              </View>

              <View style={styles.currentDistress}>
                <Text style={[styles.distressNow, { color: palette.text }]}>
                  Current Distress:
                </Text>
                <View style={styles.miniSlider}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        styles.miniDistressButton,
                        {
                          backgroundColor: distressLevel === level
                            ? getDistressColor(level)
                            : 'transparent',
                        },
                      ]}
                      onPress={() => setDistressLevel(level as DistressLevel)}
                    >
                      <Text
                        style={[
                          styles.miniDistressText,
                          { color: distressLevel === level ? '#fff' : palette.textSecondary },
                        ]}
                      >
                        {level}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Recommendations */}
            <View style={[styles.card, { backgroundColor: palette.surface }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="sparkles" size={24} color={palette.success} />
                <Text style={[styles.cardTitle, { color: palette.text }]}>Recommended for You</Text>
              </View>

              {recommendations.length > 0 ? (
                recommendations.map((technique) => (
                  <Pressable
                    key={technique.id}
                    style={[styles.techniqueCard, { borderColor: palette.primary }]}
                    onPress={() => startTechnique(technique)}
                  >
                    <View style={[styles.techniqueIcon, { backgroundColor: palette.primary + '20' }]}>
                      <Ionicons
                        name={getCategoryIcon(technique.category) as any}
                        size={24}
                        color={palette.primary}
                      />
                    </View>
                    <View style={styles.techniqueInfo}>
                      <Text style={[styles.techniqueName, { color: palette.text }]}>
                        {technique.name}
                      </Text>
                      <Text style={[styles.techniqueDesc, { color: palette.textSecondary }]}>
                        {technique.description}
                      </Text>
                      <View style={styles.techniqueMeta}>
                        <Text style={[styles.techniqueDuration, { color: palette.textSecondary }]}>
                          {Math.round(technique.duration / 60)} min
                        </Text>
                        <Text style={[styles.techniqueDifficulty, { color: palette.textSecondary }]}>
                          • {technique.difficulty}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                  Loading recommendations...
                </Text>
              )}
            </View>
          </>
        )}

        {/* All Techniques */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="grid" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>All Techniques</Text>
          </View>

          <View style={styles.categoryGrid}>
            {['sensory', 'breathing', 'body', 'movement', 'cognitive', 'visualization'].map((category) => (
              <Pressable
                key={category}
                style={[styles.categoryButton, { backgroundColor: palette.background }]}
                onPress={() => {
                  const catTechniques = techniques.filter(t => t.category === category);
                  if (catTechniques.length > 0) {
                    startTechnique(catTechniques[0]);
                  }
                }}
              >
                <Ionicons
                  name={getCategoryIcon(category) as any}
                  size={28}
                  color={palette.primary}
                />
                <Text style={[styles.categoryLabel, { color: palette.text }]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Context Modal */}
        <Modal
          visible={showContextModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowContextModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Session Context</Text>
              <Text style={[styles.modalSubtitle, { color: palette.textSecondary }]}>
                Help me recommend the best techniques for your situation
              </Text>

              <View style={styles.contextOption}>
                <Text style={[styles.contextLabel, { color: palette.text }]}>Where are you?</Text>
                <View style={styles.contextButtons}>
                  {['home', 'work', 'public', 'car'].map((loc) => (
                    <Pressable
                      key={loc}
                      style={[
                        styles.contextBtn,
                        {
                          backgroundColor: context.location === loc ? palette.primary : palette.background,
                          borderColor: palette.border,
                        },
                      ]}
                      onPress={() => setContext({ ...context, location: loc as any })}
                    >
                      <Text style={{ color: context.location === loc ? palette.onPrimary : palette.text }}>
                        {loc.charAt(0).toUpperCase() + loc.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.contextOption}>
                <Text style={[styles.contextLabel, { color: palette.text }]}>Time available?</Text>
                <View style={styles.contextButtons}>
                  {[1, 3, 5, 10, 15].map((mins) => (
                    <Pressable
                      key={mins}
                      style={[
                        styles.contextBtn,
                        {
                          backgroundColor: context.timeAvailable === mins ? palette.primary : palette.background,
                          borderColor: palette.border,
                        },
                      ]}
                      onPress={() => setContext({ ...context, timeAvailable: mins })}
                    >
                      <Text style={{ color: context.timeAvailable === mins ? palette.onPrimary : palette.text }}>
                        {mins}m
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.contextOption}>
                <Text style={[styles.contextLabel, { color: palette.text }]}>Can you speak aloud?</Text>
                <View style={styles.contextButtons}>
                  <Pressable
                    style={[
                      styles.contextBtn,
                      {
                        backgroundColor: context.safeToSpeak ? palette.primary : palette.background,
                        borderColor: palette.border,
                      },
                    ]}
                    onPress={() => setContext({ ...context, safeToSpeak: true })}
                  >
                    <Text style={{ color: context.safeToSpeak ? palette.onPrimary : palette.text }}>Yes</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.contextBtn,
                      {
                        backgroundColor: !context.safeToSpeak ? palette.primary : palette.background,
                        borderColor: palette.border,
                      },
                    ]}
                    onPress={() => setContext({ ...context, safeToSpeak: false })}
                  >
                    <Text style={{ color: !context.safeToSpeak ? palette.onPrimary : palette.text }}>No</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.startSessionBtn, { backgroundColor: palette.primary }]}
                onPress={startSession}
              >
                <Text style={[styles.startSessionBtnText, { color: palette.onPrimary }]}>
                  Start Session
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Technique Modal */}
        <Modal
          visible={showTechniqueModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTechniqueModal(false)}
        >
          <View style={[styles.techniqueModalContent, { backgroundColor: palette.surface }]}>
            {activeTechnique && (
              <>
                <View style={styles.techniqueModalHeader}>
                  <Text style={[styles.techniqueModalTitle, { color: palette.text }]}>
                    {activeTechnique.name}
                  </Text>
                  <Pressable onPress={() => setShowTechniqueModal(false)}>
                    <Ionicons name="close" size={28} color={palette.text} />
                  </Pressable>
                </View>

                {activeTechnique.category === 'breathing' && (
                  <View style={styles.breathingVisual}>
                    <Animated.View
                      style={[
                        styles.breathCircle,
                        {
                          backgroundColor: palette.primary + '30',
                          borderColor: palette.primary,
                          transform: [{
                            scale: breathProgress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1],
                            }),
                          }],
                        },
                      ]}
                    >
                      <Text style={[styles.breathText, { color: palette.primary }]}>
                        {breathPhase.toUpperCase()}
                      </Text>
                    </Animated.View>
                  </View>
                )}

                <ScrollView style={styles.instructionsList}>
                  {activeTechnique.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <View style={[styles.instructionNumber, { backgroundColor: palette.primary }]}>
                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.instructionText, { color: palette.text }]}>
                        {instruction}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.effectivenessRating}>
                  <Text style={[styles.ratingLabel, { color: palette.text }]}>
                    How helpful was this?
                  </Text>
                  <View style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Pressable
                        key={rating}
                        style={[styles.ratingBtn, { backgroundColor: palette.primary + '20' }]}
                        onPress={() => completeTechnique(rating)}
                      >
                        <Ionicons
                          name="star"
                          size={24}
                          color={palette.primary}
                        />
                        <Text style={[styles.ratingBtnText, { color: palette.text }]}>{rating}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        </Modal>

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
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  distressSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  distressButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distressButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  distressLabel: {
    fontSize: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sessionDistress: {
    fontSize: 15,
    marginTop: 4,
  },
  endButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  currentDistress: {
    marginTop: 16,
  },
  distressNow: {
    fontSize: 14,
    marginBottom: 8,
  },
  miniSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniDistressButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDistressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  techniqueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  techniqueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techniqueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  techniqueName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  techniqueDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  techniqueMeta: {
    flexDirection: 'row',
    marginTop: 6,
  },
  techniqueDuration: {
    fontSize: 12,
  },
  techniqueDifficulty: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  contextOption: {
    marginBottom: 20,
  },
  contextLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
  },
  contextButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contextBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  startSessionBtn: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  startSessionBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  techniqueModalContent: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  techniqueModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  techniqueModalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  breathingVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 20,
  },
  breathCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathText: {
    fontSize: 24,
    fontWeight: '700',
  },
  instructionsList: {
    flex: 1,
    marginBottom: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  effectivenessRating: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  ratingBtn: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    minWidth: 50,
  },
  ratingBtnText: {
    fontSize: 12,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});
