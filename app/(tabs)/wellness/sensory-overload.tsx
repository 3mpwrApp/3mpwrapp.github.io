/**
 * Sensory Overload Detector Screen
 * 
 * Real-time sensory load tracking with prediction,
 * safe space finder, and guided decompression protocols.
 */

/* eslint-disable no-restricted-syntax */ // Hex colors needed for static StyleSheet definitions

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_12 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { useSensoryOverload, type DecompressionAction, type SensoryModality } from '../../../services/sensoryOverloadDetector';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function SensoryOverloadScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const sensory = useSensoryOverload();

  // Use state from hook directly
  const _currentPhase = sensory.state.currentPhase; // Stored for future UI integration
  const safeSpaces = sensory.state.safeSpaces;
  const _currentInputs = sensory.state.currentInputs; // Stored for future UI integration
  const thresholds = sensory.state.thresholds;

  const [prediction, setPrediction] = useState<{ timeToOverload: number; probability: number } | null>(null);
  const [protocols, setProtocols] = useState<DecompressionAction[]>([]);

  const [showInputModal, setShowInputModal] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<DecompressionAction | null>(null);
  const [_protocolStep, setProtocolStep] = useState(0); // Stored for step navigation UI

  const [sensoryInputs, setSensoryInputs] = useState<Record<SensoryModality, number>>({
    visual: 3,
    auditory: 3,
    tactile: 3,
    olfactory: 2,
    gustatory: 1,
    vestibular: 2,
    proprioceptive: 2,
    interoceptive: 3,
  });

  // Load prediction on demand
  async function _loadPrediction() {
    try {
      const pred = await sensory.predict();
      setPrediction({ timeToOverload: pred.timeToOverload, probability: pred.probability });
      setProtocols(pred.recommendedActions);
    } catch {
      // Prediction not available yet
    }
  }

  async function submitSensoryInput() {
    // Add input for each modality with intensity > 3
    try {
      for (const [modality, intensity] of Object.entries(sensoryInputs)) {
        if (intensity > 3) {
          await sensory.addInput({
            modality: modality as SensoryModality,
            source: 'manual_entry',
            intensity: intensity as any,
            duration: 30,
            isPositive: false,
          });
        }
      }
      setShowInputModal(false);
      Alert.alert('Logged', 'Sensory environment captured');
    } catch {
      Alert.alert('Error', 'Failed to log sensory input');
    }
  }

  function startProtocol(protocol: DecompressionAction) {
    setActiveProtocol(protocol);
    setProtocolStep(0);
    setShowProtocolModal(true);
  }

  function nextProtocolStep() {
    // Simple single-step protocol completion
    completeProtocol();
  }

  async function completeProtocol() {
    if (activeProtocol) {
      // Record recovery using the service
      await sensory.recordRecovery([activeProtocol.id], [activeProtocol.id]);
      setShowProtocolModal(false);
      setActiveProtocol(null);
      Alert.alert('Complete', 'Decompression protocol completed. Take your time returning to activities.');
    }
  }

  const getModalityIcon = (modality: SensoryModality): string => {
    const icons: Record<SensoryModality, string> = {
      visual: 'eye',
      auditory: 'ear',
      tactile: 'hand-left',
      olfactory: 'flower',
      gustatory: 'restaurant',
      vestibular: 'sync',
      proprioceptive: 'body',
      interoceptive: 'pulse',
    };
    return icons[modality] || 'ellipse';
  };

  const getLoadColor = (load: number): string => {
    if (load <= 30) return palette.success;
    if (load <= 50) return palette.info;
    if (load <= 70) return palette.warning;
    return palette.error;
  };

  const getLoadLabel = (load: number): string => {
    if (load <= 30) return 'Calm';
    if (load <= 50) return 'Manageable';
    if (load <= 70) return 'Elevated';
    if (load <= 85) return 'High Alert';
    return 'Overload';
  };

  // Calculate overall load from thresholds (100 - avg remaining capacity)
  const overallLoad = thresholds.length > 0 
    ? 100 - (thresholds.reduce((sum, t) => sum + t.currentCapacity, 0) / thresholds.length)
    : 40;

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Sensory Load Tracker'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Current Load Meter */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="speedometer" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>Current Sensory Load</Text>
          </View>

          <View style={styles.meterContainer}>
            <View style={styles.meterGauge}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${overallLoad}%`,
                    backgroundColor: getLoadColor(overallLoad),
                  },
                ]}
              />
            </View>
            <View style={styles.meterLabels}>
              <Text style={[styles.meterLabel, { color: palette.success }]}>Calm</Text>
              <Text style={[styles.meterLabel, { color: palette.warning }]}>Elevated</Text>
              <Text style={[styles.meterLabel, { color: palette.error }]}>Overload</Text>
            </View>
          </View>

          <View style={styles.loadInfo}>
            <View style={[styles.loadBadge, { backgroundColor: getLoadColor(overallLoad) }]}>
              <Text style={styles.loadBadgeText}>{Math.round(overallLoad)}%</Text>
            </View>
            <Text style={[styles.loadStatus, { color: palette.text }]}>
              Status: {getLoadLabel(overallLoad)}
            </Text>
          </View>

          {/* Prediction Alert */}
          {prediction && prediction.timeToOverload < 30 && (
            <View style={[styles.predictionAlert, { backgroundColor: palette.warningBackground }]}>
              <Ionicons name="alert-circle" size={20} color={palette.warning} />
              <View style={styles.predictionContent}>
                <Text style={[styles.predictionTitle, { color: palette.text }]}>
                  Potential Overload in {prediction.timeToOverload} minutes
                </Text>
                <Text style={[styles.predictionText, { color: palette.textSecondary }]}>
                  Based on current patterns. Consider reducing input or taking a break.
                </Text>
              </View>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.updateButton, { backgroundColor: palette.primary }]}
            onPress={() => setShowInputModal(true)}
          >
            <Ionicons name="refresh" size={18} color={palette.onPrimary} />
            <Text style={[styles.updateButtonText, { color: palette.onPrimary }]}>
              Update Sensory Environment
            </Text>
          </Pressable>
        </View>

        {/* Modality Breakdown */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>Modality Breakdown</Text>
          </View>

          {thresholds.length > 0 ? (
            <View style={styles.modalityGrid}>
              {thresholds.map((threshold) => (
                <View key={threshold.modality} style={[styles.modalityItem, { backgroundColor: palette.background }]}>
                  <Ionicons
                    name={getModalityIcon(threshold.modality) as any}
                    size={24}
                    color={getLoadColor(100 - threshold.currentCapacity)}
                  />
                  <Text style={[styles.modalityName, { color: palette.text }]}>
                    {threshold.modality.charAt(0).toUpperCase() + threshold.modality.slice(1)}
                  </Text>
                  <View style={styles.modalityBar}>
                    <View
                      style={[
                        styles.modalityFill,
                        { width: `${100 - threshold.currentCapacity}%`, backgroundColor: getLoadColor(100 - threshold.currentCapacity) },
                      ]}
                    />
                  </View>
                  <Text style={[styles.modalityPercent, { color: palette.textSecondary }]}>
                    {Math.round(100 - threshold.currentCapacity)}%
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="body" size={48} color={palette.muted} />
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                Log your environment to see breakdown
              </Text>
            </View>
          )}
        </View>

        {/* Safe Spaces */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>Safe Spaces</Text>
          </View>

          <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
            Low-stimulation areas you've identified
          </Text>

          {safeSpaces.length > 0 ? (
            safeSpaces.map((space) => (
              <View key={space.id} style={[styles.safeSpaceItem, { borderColor: palette.border }]}>
                <View style={styles.safeSpaceHeader}>
                  <Ionicons name="location" size={20} color={palette.success} />
                  <Text style={[styles.safeSpaceName, { color: palette.text }]}>{space.name}</Text>
                </View>
                <Text style={[styles.safeSpaceDesc, { color: palette.textSecondary }]}>
                  {space.location}
                </Text>
                <View style={styles.safeSpaceFeatures}>
                  {space.features.slice(0, 3).map((feature: string, idx: number) => (
                    <View key={idx} style={[styles.featureChip, { backgroundColor: palette.successBackground }]}>
                      <Text style={[styles.featureText, { color: palette.success }]}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.addSpaceButton, { borderColor: palette.border }]}
              onPress={() => Alert.alert('Coming Soon', 'Add your custom safe spaces')}
            >
              <Ionicons name="add-circle" size={24} color={palette.primary} />
              <Text style={[styles.addSpaceText, { color: palette.primary }]}>Add Safe Space</Text>
            </Pressable>
          )}
        </View>

        {/* Decompression Protocols */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="leaf" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>Decompression Protocols</Text>
          </View>

          <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
            Guided routines to reduce sensory load
          </Text>

          {protocols.map((protocol) => (
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              key={protocol.id}
              style={[styles.protocolItem, { backgroundColor: palette.background }]}
              onPress={() => startProtocol(protocol)}
            >
              <View style={styles.protocolInfo}>
                <Text style={[styles.protocolName, { color: palette.text }]}>{protocol.title}</Text>
                <Text style={[styles.protocolDuration, { color: palette.textSecondary }]}>
                  {protocol.duration} min
                </Text>
              </View>
              <View style={styles.protocolMeta}>
                <View style={[styles.intensityBadge, { backgroundColor: palette.infoBackground }]}>
                  <Text style={[styles.intensityText, { color: palette.info }]}>
                    {protocol.urgency}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={28} color={palette.primary} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Emergency Actions */}
        {overallLoad > 70 && (
          <View style={[styles.card, { backgroundColor: palette.errorBackground }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={24} color={palette.error} />
              <Text style={[styles.cardTitle, { color: palette.text }]}>Quick Relief</Text>
            </View>

            <View style={styles.emergencyActions}>
              <Pressable
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.emergencyButton, { backgroundColor: palette.surface }]}
                onPress={() => startProtocol(protocols[0])}
              >
                <Ionicons name="flash-off" size={24} color={palette.error} />
                <Text style={[styles.emergencyText, { color: palette.text }]}>Reduce Stimuli</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.emergencyButton, { backgroundColor: palette.surface }]}
                onPress={() => Alert.alert('Breathing', 'Starting calming breath exercise...')}
              >
                <Ionicons name="water" size={24} color={palette.info} />
                <Text style={[styles.emergencyText, { color: palette.text }]}>Deep Breaths</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.emergencyButton, { backgroundColor: palette.surface }]}
                onPress={() => Alert.alert('Safe Space', 'Locating nearest quiet space...')}
              >
                <Ionicons name="shield" size={24} color={palette.success} />
                <Text style={[styles.emergencyText, { color: palette.text }]}>Find Quiet</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Input Modal */}
        <Modal
          visible={showInputModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowInputModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: palette.text }]}>Log Environment</Text>
                <Pressable 
                  onPress={() => setShowInputModal(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="close" size={24} color={palette.text} />
                </Pressable>
              </View>

              <Text style={[styles.modalSubtitle, { color: palette.textSecondary }]}>
                Rate each sensory channel (0 = minimal, 10 = overwhelming)
              </Text>

              <ScrollView style={styles.modalScroll}>
                {(Object.keys(sensoryInputs) as SensoryModality[]).map((modality) => (
                  <View key={modality} style={styles.inputRow}>
                    <View style={styles.inputHeader}>
                      <Ionicons
                        name={getModalityIcon(modality) as any}
                        size={20}
                        color={palette.primary}
                      />
                      <Text style={[styles.inputLabel, { color: palette.text }]}>
                        {modality.charAt(0).toUpperCase() + modality.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.levelSelector}>
                      {[0, 2, 4, 6, 8, 10].map((level) => (
                        <Pressable
                          accessibilityRole="button"
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          key={level}
                          style={[
                            styles.levelButton,
                            {
                              backgroundColor: sensoryInputs[modality] >= level - 1 && sensoryInputs[modality] <= level + 1
                                ? getLoadColor(level * 10)
                                : palette.background,
                              borderColor: getLoadColor(level * 10),
                            },
                          ]}
                          onPress={() => setSensoryInputs({ ...sensoryInputs, [modality]: level })}
                        >
                          <Text
                            style={{
                              color: sensoryInputs[modality] >= level - 1 && sensoryInputs[modality] <= level + 1
                                ? '#fff'
                                : palette.text,
                              fontSize: 12,
                              fontWeight: '600',
                            }}
                          >
                            {level}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[styles.modalButton, { backgroundColor: palette.muted }]}
                  onPress={() => setShowInputModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: palette.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[styles.modalButton, { backgroundColor: palette.primary }]}
                  onPress={submitSensoryInput}
                >
                  <Text style={[styles.modalButtonText, { color: palette.onPrimary }]}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Protocol Modal */}
        <Modal
          visible={showProtocolModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProtocolModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.protocolModalContent, { backgroundColor: palette.surface }]}>
              {activeProtocol && (
                <>
                  <Text style={[styles.protocolModalTitle, { color: palette.text }]}>
                    {activeProtocol.title}
                  </Text>
                  <Text style={[styles.protocolProgress, { color: palette.textSecondary }]}>
                    {activeProtocol.duration} minute protocol
                  </Text>

                  <View style={styles.stepContent}>
                    <Ionicons
                      name="leaf"
                      size={48}
                      color={palette.primary}
                    />
                    <Text style={[styles.stepInstruction, { color: palette.text }]}>
                      {activeProtocol.description}
                    </Text>
                    <Text style={[styles.stepDuration, { color: palette.textSecondary }]}>
                      Take {activeProtocol.duration} minutes
                    </Text>
                  </View>

                  <View style={styles.protocolActions}>
                    <Pressable
                      accessibilityRole="button"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.skipButton, { borderColor: palette.border }]}
                      onPress={() => setShowProtocolModal(false)}
                    >
                      <Text style={{ color: palette.textSecondary }}>Skip</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.nextButton, { backgroundColor: palette.primary }]}
                      onPress={nextProtocolStep}
                    >
                      <Text style={{ color: palette.onPrimary, fontWeight: '600' }}>
                        Complete
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color={palette.onPrimary} />
                    </Pressable>
                  </View>
                </>
              )}
            </View>
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
  meterContainer: {
    marginBottom: 16,
  },
  meterGauge: {
    height: 24,
    backgroundColor: '#eee',
    borderRadius: 12,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 12,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meterLabel: {
    fontSize: 11,
  },
  loadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  loadBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loadBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  predictionAlert: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    marginBottom: 16,
  },
  predictionContent: {
    flex: 1,
  },
  predictionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  predictionText: {
    fontSize: 12,
    marginTop: 2,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalityGrid: {
    gap: 12,
  },
  modalityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  modalityName: {
    width: 100,
    fontSize: 13,
    fontWeight: '500',
  },
  modalityBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalityFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalityPercent: {
    width: 40,
    textAlign: 'right',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  safeSpaceItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  safeSpaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  safeSpaceName: {
    fontSize: 15,
    fontWeight: '600',
  },
  safeSpaceDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  safeSpaceFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 11,
  },
  addSpaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    gap: 8,
  },
  addSpaceText: {
    fontSize: 15,
    fontWeight: '500',
  },
  protocolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  protocolInfo: {
    flex: 1,
  },
  protocolName: {
    fontSize: 15,
    fontWeight: '600',
  },
  protocolDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  protocolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: 10,
  },
  emergencyButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  emergencyText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
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
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputRow: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  levelSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelButton: {
    width: 40,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  protocolModalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  protocolModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  protocolProgress: {
    fontSize: 14,
    marginBottom: 24,
  },
  stepContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepInstruction: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 26,
  },
  stepDuration: {
    fontSize: 14,
    marginTop: 8,
  },
  protocolActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  skipButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});
