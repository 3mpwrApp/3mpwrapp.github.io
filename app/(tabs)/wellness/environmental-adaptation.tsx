/**
 * Environmental Adaptation Screen
 * 
 * AI-powered environmental tracking that adapts recommendations
 * based on weather, air quality, and environmental triggers.
 */

/* eslint-disable no-restricted-syntax */ // Hex colors needed for static StyleSheet definitions

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useEnvironmentalAdaptation, type SensitivityProfile } from '../../../services/environmentalAdaptation';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function EnvironmentalAdaptationScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const env = useEnvironmentalAdaptation();

  // Use state from hook directly
  const currentReading = env.state.currentEnvironment;
  const alerts = env.state.alerts;
  const sensitivities = env.state.sensitivityProfiles;

  const [showManualInput, setShowManualInput] = useState(false);
  const [manualData, setManualData] = useState({
    temperature: '',
    humidity: '',
    pressure: '',
    airQuality: '',
  });

  async function handleManualSubmit() {
    try {
      await env.recordManual({
        temperature: parseFloat(manualData.temperature) || undefined,
        humidity: parseFloat(manualData.humidity) || undefined,
        barometricPressure: parseFloat(manualData.pressure) || undefined,
        airQualityIndex: parseFloat(manualData.airQuality) || undefined,
      });
      setShowManualInput(false);
      setManualData({ temperature: '', humidity: '', pressure: '', airQuality: '' });
      Alert.alert('Success', 'Environmental data recorded successfully!');
    } catch {
      Alert.alert('Error', 'Failed to record environmental data');
    }
  }

  const getWeatherIcon = (weather?: string) => {
    switch (weather) {
      case 'clear': return 'sunny';
      case 'partly_cloudy': return 'partly-sunny';
      case 'cloudy': return 'cloudy';
      case 'rain': return 'rainy';
      case 'thunderstorm': return 'thunderstorm';
      case 'snow': return 'snow';
      case 'fog': return 'cloud';
      default: return 'help-circle';
    }
  };

  const getSensitivityColor = (level?: string) => {
    switch (level) {
      case 'extreme': return palette.error;
      case 'severe': return palette.error;
      case 'moderate': return palette.warning;
      case 'mild': return palette.info;
      default: return palette.success;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Environmental Adaptation'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Current Conditions */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="earth" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>Current Conditions</Text>
          </View>

          {currentReading ? (
            <View style={styles.conditionsGrid}>
              <View style={[styles.conditionItem, { backgroundColor: palette.background }]}>
                <Ionicons name={getWeatherIcon(currentReading.weather)} size={28} color={palette.info} />
                <Text style={[styles.conditionValue, { color: palette.text }]}>
                  {currentReading.weather?.replace(/_/g, ' ') || 'Unknown'}
                </Text>
                <Text style={[styles.conditionLabel, { color: palette.textSecondary }]}>Weather</Text>
              </View>

              <View style={[styles.conditionItem, { backgroundColor: palette.background }]}>
                <Ionicons name="thermometer" size={28} color={palette.warning} />
                <Text style={[styles.conditionValue, { color: palette.text }]}>
                  {currentReading.factors.temperature?.toFixed(1) || '--'}°C
                </Text>
                <Text style={[styles.conditionLabel, { color: palette.textSecondary }]}>Temperature</Text>
              </View>

              <View style={[styles.conditionItem, { backgroundColor: palette.background }]}>
                <Ionicons name="water" size={28} color={palette.info} />
                <Text style={[styles.conditionValue, { color: palette.text }]}>
                  {currentReading.factors.humidity?.toFixed(0) || '--'}%
                </Text>
                <Text style={[styles.conditionLabel, { color: palette.textSecondary }]}>Humidity</Text>
              </View>

              <View style={[styles.conditionItem, { backgroundColor: palette.background }]}>
                <Ionicons name="speedometer" size={28} color={palette.primary} />
                <Text style={[styles.conditionValue, { color: palette.text }]}>
                  {currentReading.factors.barometricPressure?.toFixed(0) || '--'} hPa
                </Text>
                <Text style={[styles.conditionLabel, { color: palette.textSecondary }]}>Pressure</Text>
              </View>

              <View style={[styles.conditionItem, { backgroundColor: palette.background }]}>
                <Ionicons name="leaf" size={28} color={palette.success} />
                <Text style={[styles.conditionValue, { color: palette.text }]}>
                  {currentReading.factors.airQualityIndex || '--'}
                </Text>
                <Text style={[styles.conditionLabel, { color: palette.textSecondary }]}>Air Quality</Text>
              </View>

              <View style={[styles.conditionItem, { backgroundColor: palette.background }]}>
                <Ionicons name="sunny" size={28} color={palette.warning} />
                <Text style={[styles.conditionValue, { color: palette.text }]}>
                  {currentReading.factors.uvIndex?.toFixed(1) || '--'}
                </Text>
                <Text style={[styles.conditionLabel, { color: palette.textSecondary }]}>UV Index</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-offline" size={48} color={palette.muted} />
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No environmental data available
              </Text>
              <Text style={[styles.emptyHint, { color: palette.textSecondary }]}>
                Add manual readings or enable location services
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.actionButton, { backgroundColor: palette.primary }]}
            onPress={() => setShowManualInput(true)}
          >
            <Ionicons name="add-circle" size={20} color={palette.onPrimary} />
            <Text style={[styles.actionButtonText, { color: palette.onPrimary }]}>
              Add Manual Reading
            </Text>
          </Pressable>
        </View>

        {/* Active Alerts */}
        {alerts && alerts.length > 0 && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="notifications" size={24} color={palette.warning} />
              <Text style={[styles.cardTitle, { color: palette.text }]}>Active Alerts</Text>
            </View>

            {alerts.map((alert, index) => (
              <View
                key={alert.id || index}
                style={[
                  styles.alertItem,
                  {
                    backgroundColor: alert.type === 'critical' ? palette.errorBackground :
                      alert.type === 'warning' ? palette.warningBackground : palette.infoBackground,
                    borderColor: alert.type === 'critical' ? palette.error :
                      alert.type === 'warning' ? palette.warning : palette.info,
                  },
                ]}
              >
                <Ionicons
                  name={getAlertIcon(alert.type) as any}
                  size={24}
                  color={alert.type === 'critical' ? palette.error :
                    alert.type === 'warning' ? palette.warning : palette.info}
                />
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: palette.text }]}>{alert.title}</Text>
                  <Text style={[styles.alertMessage, { color: palette.textSecondary }]}>
                    {alert.message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sensitivity Profile */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics" size={24} color={palette.primary} />
            <Text style={[styles.cardTitle, { color: palette.text }]}>Your Sensitivities</Text>
          </View>

          <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
            Based on your symptom patterns, here are your environmental sensitivities:
          </Text>

          {sensitivities && sensitivities.length > 0 ? (
            sensitivities.map((sensitivity: SensitivityProfile, index: number) => (
              <View
                key={index}
                style={[styles.sensitivityItem, { borderColor: palette.border }]}
              >
                <View style={styles.sensitivityHeader}>
                  <Text style={[styles.sensitivityFactor, { color: palette.text }]}>
                    {sensitivity.factor.replace(/_/g, ' ')}
                  </Text>
                  <View
                    style={[
                      styles.sensitivityBadge,
                      { backgroundColor: getSensitivityColor(sensitivity.sensitivity) },
                    ]}
                  >
                    <Text style={styles.sensitivityBadgeText}>
                      {sensitivity.sensitivity?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.sensitivityDetails}>
                  <Text style={[styles.sensitivityRange, { color: palette.textSecondary }]}>
                    Optimal range: {sensitivity.optimalRange?.min} - {sensitivity.optimalRange?.max}
                  </Text>
                  <Text style={[styles.sensitivityConfidence, { color: palette.textSecondary }]}>
                    Confidence: {sensitivity.confidence}% ({sensitivity.dataPoints} data points)
                  </Text>
                </View>

                {sensitivity.symptomsTrigered && sensitivity.symptomsTrigered.length > 0 && (
                  <View style={styles.triggersList}>
                    <Text style={[styles.triggersLabel, { color: palette.textSecondary }]}>
                      Triggers:
                    </Text>
                    <View style={styles.triggersChips}>
                      {sensitivity.symptomsTrigered.map((symptom: string, i: number) => (
                        <View key={i} style={[styles.triggerChip, { backgroundColor: palette.background }]}>
                          <Text style={[styles.triggerChipText, { color: palette.text }]}>{symptom}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No sensitivity patterns detected yet
              </Text>
              <Text style={[styles.emptyHint, { color: palette.textSecondary }]}>
                Track symptoms alongside environmental data to learn your patterns
              </Text>
            </View>
          )}
        </View>

        {/* Patterns Detected */}
        {env.state.patterns && env.state.patterns.length > 0 && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={24} color={palette.success} />
              <Text style={[styles.cardTitle, { color: palette.text }]}>Patterns Detected</Text>
            </View>

            {env.state.patterns.map((pattern, index: number) => (
              <View
                key={pattern.id || index}
                style={[styles.recommendationItem, { borderColor: palette.border }]}
              >
                <Ionicons
                  name="analytics"
                  size={24}
                  color={palette.primary}
                />
                <View style={styles.recommendationContent}>
                  <Text style={[styles.recommendationTitle, { color: palette.text }]}>
                    {pattern.factor.replace(/_/g, ' ')} - {pattern.pattern}
                  </Text>
                  <Text style={[styles.recommendationDesc, { color: palette.textSecondary }]}>
                    Correlation: {(pattern.correlation * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Manual Input Modal */}
        <Modal
          visible={showManualInput}
          transparent
          animationType="slide"
          onRequestClose={() => setShowManualInput(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Add Environmental Reading</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>Temperature (°C)</Text>
                <TextInput
                  style={[styles.input, { color: palette.text, borderColor: palette.border }]}
                  value={manualData.temperature}
                  onChangeText={(v) => setManualData({ ...manualData, temperature: v })}
                  keyboardType="numeric"
                  placeholder="e.g., 22"
                  placeholderTextColor={palette.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>Humidity (%)</Text>
                <TextInput
                  style={[styles.input, { color: palette.text, borderColor: palette.border }]}
                  value={manualData.humidity}
                  onChangeText={(v) => setManualData({ ...manualData, humidity: v })}
                  keyboardType="numeric"
                  placeholder="e.g., 65"
                  placeholderTextColor={palette.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>Barometric Pressure (hPa)</Text>
                <TextInput
                  style={[styles.input, { color: palette.text, borderColor: palette.border }]}
                  value={manualData.pressure}
                  onChangeText={(v) => setManualData({ ...manualData, pressure: v })}
                  keyboardType="numeric"
                  placeholder="e.g., 1013"
                  placeholderTextColor={palette.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>Air Quality Index</Text>
                <TextInput
                  style={[styles.input, { color: palette.text, borderColor: palette.border }]}
                  value={manualData.airQuality}
                  onChangeText={(v) => setManualData({ ...manualData, airQuality: v })}
                  keyboardType="numeric"
                  placeholder="e.g., 50"
                  placeholderTextColor={palette.muted}
                />
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[styles.modalButton, { backgroundColor: palette.muted }]}
                  onPress={() => setShowManualInput(false)}
                >
                  <Text style={[styles.modalButtonText, { color: palette.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[styles.modalButton, { backgroundColor: palette.primary }]}
                  onPress={handleManualSubmit}
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
    marginBottom: 16,
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
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  conditionItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  conditionValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  conditionLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  sensitivityItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  sensitivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sensitivityFactor: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sensitivityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sensitivityBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  sensitivityDetails: {
    marginBottom: 8,
  },
  sensitivityRange: {
    fontSize: 13,
    marginBottom: 2,
  },
  sensitivityConfidence: {
    fontSize: 12,
  },
  triggersList: {
    marginTop: 8,
  },
  triggersLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  triggersChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  triggerChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  triggerChipText: {
    fontSize: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
