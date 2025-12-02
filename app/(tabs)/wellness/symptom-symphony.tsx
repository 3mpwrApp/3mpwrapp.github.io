/**
 * Symptom Symphony Screen
 * 
 * Multi-modal symptom tracking that finds hidden correlations
 * and creates a "symphony" of symptom data for medical professionals.
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useSymptomSymphony, type SymptomDefinition, type SymptomSeverity } from '../../../services/symptomSymphony';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function SymptomSymphonyScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const symphony = useSymptomSymphony();

  // Use state from hook directly
  const definitions = symphony.getDefinitions();
  const recentEntries = symphony.state.entries.slice(-7);
  const correlations = symphony.state.correlations;
  
  const [flarePrediction, setFlarePrediction] = useState<{ probability: number; predictedPhase: string } | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomDefinition | null>(null);

  const [logData, setLogData] = useState({
    severity: 5 as SymptomSeverity,
    qualities: [] as string[],
    location: '',
    triggers: '',
    relievedBy: '',
    notes: '',
  });

  // Load flare prediction on mount
  async function loadPrediction() {
    try {
      const prediction = await symphony.predictFlare();
      setFlarePrediction({ probability: prediction.probability, predictedPhase: prediction.predictedPhase });
    } catch {
      // Prediction not available yet
    }
  }

  async function handleLogSymptom() {
    if (!selectedSymptom) return;

    try {
      await symphony.logSymptom({
        symptomId: selectedSymptom.id,
        name: selectedSymptom.name,
        category: selectedSymptom.category,
        severity: logData.severity,
        qualities: logData.qualities as any[],
        location: logData.location || undefined,
        triggers: logData.triggers ? logData.triggers.split(',').map(t => t.trim()) : undefined,
        relievedBy: logData.relievedBy ? logData.relievedBy.split(',').map(r => r.trim()) : undefined,
        notes: logData.notes || undefined,
        contextual: {},
      });

      setShowLogModal(false);
      setSelectedSymptom(null);
      setLogData({
        severity: 5,
        qualities: [],
        location: '',
        triggers: '',
        relievedBy: '',
        notes: '',
      });
      Alert.alert('Success', 'Symptom logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to log symptom');
    }
  }

  function openLogModal(symptom: SymptomDefinition) {
    setSelectedSymptom(symptom);
    setShowLogModal(true);
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return palette.success;
    if (severity <= 6) return palette.warning;
    return palette.error;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pain': return 'flash';
      case 'fatigue': return 'battery-dead';
      case 'cognitive': return 'cloud';
      case 'digestive': return 'restaurant';
      case 'neurological': return 'pulse';
      case 'cardiovascular': return 'heart';
      case 'respiratory': return 'cloud';
      case 'musculoskeletal': return 'body';
      case 'emotional': return 'happy';
      case 'sleep': return 'moon';
      case 'autonomic': return 'git-branch';
      case 'immune': return 'shield';
      case 'sensory': return 'eye';
      default: return 'medical';
    }
  };

  const getCorrelationColor = (strength: number) => {
    const abs = Math.abs(strength);
    if (abs >= 0.7) return palette.primary;
    if (abs >= 0.4) return palette.info;
    return palette.muted;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Symptom Symphony'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Flare Prediction */}
        {flarePrediction && flarePrediction.probability > 0.3 && (
          <View style={[
            styles.card,
            {
              backgroundColor: flarePrediction.probability > 0.7 ? palette.errorBackground :
                flarePrediction.probability > 0.5 ? palette.warningBackground : palette.surface,
            },
          ]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="warning"
                size={24}
                color={flarePrediction.probability > 0.7 ? palette.error : palette.warning}
              />
              <Text style={[styles.cardTitle, { color: palette.text }]}>Flare Prediction</Text>
            </View>

            <View style={styles.predictionContent}>
              <View style={styles.predictionGauge}>
                <Text style={[styles.predictionPercent, { color: getSeverityColor(flarePrediction.probability * 10) }]}>
                  {Math.round(flarePrediction.probability * 100)}%
                </Text>
                <Text style={[styles.predictionLabel, { color: palette.textSecondary }]}>
                  likelihood
                </Text>
              </View>
              <View style={styles.predictionInfo}>
                <Text style={[styles.predictionPhase, { color: palette.text }]}>
                  Current Phase: {flarePrediction.predictedPhase}
                </Text>
                <Text style={[styles.predictionAdvice, { color: palette.textSecondary }]}>
                  Consider pacing activities and increasing rest periods
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Log */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="add-circle" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>Quick Log</Text>
          </View>

          <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
            Tap a symptom to log how you're feeling right now
          </Text>

          <View style={styles.symptomGrid}>
            {definitions.slice(0, 12).map((symptom) => (
              <Pressable
                key={symptom.id}
                style={[styles.symptomButton, { backgroundColor: palette.background }]}
                onPress={() => openLogModal(symptom)}
              >
                <Ionicons
                  name={getCategoryIcon(symptom.category) as any}
                  size={24}
                  color={palette.primary}
                />
                <Text style={[styles.symptomName, { color: palette.text }]} numberOfLines={1}>
                  {symptom.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.viewAllButton, { borderColor: palette.border }]}
            onPress={() => Alert.alert('Coming Soon', 'Full symptom library and custom symptom creation')}
          >
            <Text style={[styles.viewAllText, { color: palette.primary }]}>
              View All Symptoms
            </Text>
            <Ionicons name="chevron-forward" size={18} color={palette.primary} />
          </Pressable>
        </View>

        {/* Recent Entries */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>Recent Entries</Text>
          </View>

          {recentEntries.length > 0 ? (
            recentEntries.slice(0, 5).map((entry) => (
              <View key={entry.id} style={[styles.entryItem, { borderColor: palette.border }]}>
                <View style={styles.entryHeader}>
                  <View style={styles.entrySymptom}>
                    <Ionicons
                      name={getCategoryIcon(entry.category) as any}
                      size={18}
                      color={palette.primary}
                    />
                    <Text style={[styles.entryName, { color: palette.text }]}>{entry.name}</Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(entry.severity) }]}>
                    <Text style={styles.severityText}>{entry.severity}/10</Text>
                  </View>
                </View>
                <View style={styles.entryMeta}>
                  <Text style={[styles.entryTime, { color: palette.textSecondary }]}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </Text>
                  {entry.qualities && entry.qualities.length > 0 && (
                    <Text style={[styles.entryQualities, { color: palette.textSecondary }]}>
                      {entry.qualities.join(', ')}
                    </Text>
                  )}
                </View>
                {entry.notes && (
                  <Text style={[styles.entryNotes, { color: palette.textSecondary }]}>
                    {entry.notes}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard" size={48} color={palette.muted} />
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No symptoms logged recently
              </Text>
              <Text style={[styles.emptyHint, { color: palette.textSecondary }]}>
                Start tracking to discover patterns
              </Text>
            </View>
          )}
        </View>

        {/* Correlations */}
        {correlations.length > 0 && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="git-merge" size={24} color={palette.primary} />
              <Text style={[styles.cardTitle, { color: palette.text }]}>Discovered Correlations</Text>
            </View>

            <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
              AI-detected patterns between your symptoms
            </Text>

            {correlations.slice(0, 5).map((correlation, index) => (
              <View key={index} style={[styles.correlationItem, { borderColor: palette.border }]}>
                <View style={styles.correlationSymptoms}>
                  <Text style={[styles.correlationSymptom, { color: palette.text }]}>
                    {correlation.symptomA}
                  </Text>
                  <Ionicons
                    name={correlation.correlationStrength > 0 ? 'arrow-forward' : 'swap-horizontal'}
                    size={18}
                    color={getCorrelationColor(correlation.correlationStrength)}
                  />
                  <Text style={[styles.correlationSymptom, { color: palette.text }]}>
                    {correlation.symptomB}
                  </Text>
                </View>
                <View style={styles.correlationMeta}>
                  <View style={[
                    styles.correlationStrength,
                    { backgroundColor: getCorrelationColor(correlation.correlationStrength) + '30' },
                  ]}>
                    <Text style={[styles.correlationStrengthText, { color: getCorrelationColor(correlation.correlationStrength) }]}>
                      {Math.round(Math.abs(correlation.correlationStrength) * 100)}% {correlation.relationship}
                    </Text>
                  </View>
                  <Text style={[styles.correlationConfidence, { color: palette.textSecondary }]}>
                    {correlation.confidence}% confidence ({correlation.sampleSize} samples)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Export */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>Medical Export</Text>
          </View>

          <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
            Generate a professional symptom report for your healthcare provider
          </Text>

          <Pressable
            style={[styles.exportButton, { backgroundColor: palette.primary }]}
            onPress={() => Alert.alert('Coming Soon', 'PDF export for medical professionals')}
          >
            <Ionicons name="download" size={20} color={palette.onPrimary} />
            <Text style={[styles.exportButtonText, { color: palette.onPrimary }]}>
              Export Medical Timeline
            </Text>
          </Pressable>
        </View>

        {/* Log Modal */}
        <Modal
          visible={showLogModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLogModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: palette.text }]}>
                  Log: {selectedSymptom?.name}
                </Text>
                <Pressable onPress={() => setShowLogModal(false)}>
                  <Ionicons name="close" size={24} color={palette.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll}>
                {/* Severity */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: palette.text }]}>
                    Severity (0-10)
                  </Text>
                  <View style={styles.severitySlider}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <Pressable
                        key={level}
                        style={[
                          styles.severityButton,
                          {
                            backgroundColor: logData.severity === level
                              ? getSeverityColor(level)
                              : palette.background,
                            borderColor: getSeverityColor(level),
                          },
                        ]}
                        onPress={() => setLogData({ ...logData, severity: level as SymptomSeverity })}
                      >
                        <Text
                          style={[
                            styles.severityButtonText,
                            { color: logData.severity === level ? '#fff' : palette.text },
                          ]}
                        >
                          {level}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Qualities */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: palette.text }]}>Quality</Text>
                  <View style={styles.qualitiesGrid}>
                    {selectedSymptom?.commonQualities.map((quality) => (
                      <Pressable
                        key={quality}
                        style={[
                          styles.qualityChip,
                          {
                            backgroundColor: logData.qualities.includes(quality)
                              ? palette.primary
                              : palette.background,
                            borderColor: palette.border,
                          },
                        ]}
                        onPress={() => {
                          const newQualities = logData.qualities.includes(quality)
                            ? logData.qualities.filter(q => q !== quality)
                            : [...logData.qualities, quality];
                          setLogData({ ...logData, qualities: newQualities });
                        }}
                      >
                        <Text
                          style={{
                            color: logData.qualities.includes(quality) ? palette.onPrimary : palette.text,
                            fontSize: 13,
                          }}
                        >
                          {quality}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Location */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: palette.text }]}>Location</Text>
                  <TextInput
                    style={[styles.input, { color: palette.text, borderColor: palette.border }]}
                    value={logData.location}
                    onChangeText={(v) => setLogData({ ...logData, location: v })}
                    placeholder="e.g., Lower back, left side"
                    placeholderTextColor={palette.muted}
                  />
                </View>

                {/* Triggers */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: palette.text }]}>
                    Possible Triggers (comma-separated)
                  </Text>
                  <TextInput
                    style={[styles.input, { color: palette.text, borderColor: palette.border }]}
                    value={logData.triggers}
                    onChangeText={(v) => setLogData({ ...logData, triggers: v })}
                    placeholder="e.g., stress, weather, poor sleep"
                    placeholderTextColor={palette.muted}
                  />
                </View>

                {/* What Helped */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: palette.text }]}>
                    What Helped (comma-separated)
                  </Text>
                  <TextInput
                    style={[styles.input, { color: palette.text, borderColor: palette.border }]}
                    value={logData.relievedBy}
                    onChangeText={(v) => setLogData({ ...logData, relievedBy: v })}
                    placeholder="e.g., rest, heat, medication"
                    placeholderTextColor={palette.muted}
                  />
                </View>

                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: palette.text }]}>Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, { color: palette.text, borderColor: palette.border }]}
                    value={logData.notes}
                    onChangeText={(v) => setLogData({ ...logData, notes: v })}
                    placeholder="Additional details..."
                    placeholderTextColor={palette.muted}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: palette.muted }]}
                  onPress={() => setShowLogModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: palette.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: palette.primary }]}
                  onPress={handleLogSymptom}
                >
                  <Text style={[styles.modalButtonText, { color: palette.onPrimary }]}>Save</Text>
                </Pressable>
              </View>
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
  predictionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  predictionGauge: {
    alignItems: 'center',
  },
  predictionPercent: {
    fontSize: 32,
    fontWeight: '700',
  },
  predictionLabel: {
    fontSize: 12,
  },
  predictionInfo: {
    flex: 1,
  },
  predictionPhase: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  predictionAdvice: {
    fontSize: 13,
    lineHeight: 18,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  symptomButton: {
    width: '31%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  symptomName: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '500',
  },
  entryItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  entrySymptom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  entryMeta: {
    marginBottom: 4,
  },
  entryTime: {
    fontSize: 12,
  },
  entryQualities: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  entryNotes: {
    fontSize: 13,
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 13,
    marginTop: 4,
  },
  correlationItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  correlationSymptoms: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  correlationSymptom: {
    fontSize: 14,
    fontWeight: '500',
  },
  correlationMeta: {
    gap: 4,
  },
  correlationStrength: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  correlationStrengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  correlationConfidence: {
    fontSize: 11,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
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
  severitySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  qualitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  qualityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  bottomSpacer: {
    height: 32,
  },
});
