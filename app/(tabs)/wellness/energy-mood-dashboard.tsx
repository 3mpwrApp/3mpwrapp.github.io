import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useEmotionalWeatherStation } from '../../../services/emotionalWeatherStation';
import { useEnergyQuantumMechanics } from '../../../services/energyQuantumMechanics';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function EnergyMoodDashboard() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const quantum = useEnergyQuantumMechanics();
  const weather = useEmotionalWeatherStation();

  const [quantumState, setQuantumState] = useState(quantum.getCurrentState());
  const [energyDebt, setEnergyDebt] = useState(quantum.getEnergyDebt());
  const [moodForecast, setMoodForecast] = useState(weather.getForecast(24));
  const [currentWeather, setCurrentWeather] = useState(weather.getCurrentWeather());

  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumState(quantum.getCurrentState());
      setEnergyDebt(quantum.getEnergyDebt());
      setMoodForecast(weather.getForecast(24));
      setCurrentWeather(weather.getCurrentWeather());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const quantumColors: Record<string, string> = {
    excited: '#FFD700',
    ground: '#28A745',
    low_energy: '#FFC107',
    depleted: '#DC143C',
    borrowed: '#FF4500',
    recovering: '#87CEEB',
    superposition: '#9370DB',
  };

  const weatherColors: Record<string, string> = {
    sunny: '#FFD700',
    partly_cloudy: '#87CEEB',
    overcast: '#696969',
    rainy: '#4682B4',
    stormy: '#2F4F4F',
    foggy: '#A9A9A9',
    thunderstorm: '#191970',
    scattered_showers: '#5F9EA0',
    high_pressure: '#FF6347',
    arctic_blast: '#00CED1',
  };

  const borrowEnergy = (amount: number) => {
    quantum.borrowEnergy(amount);
    setQuantumState(quantum.getCurrentState());
    setEnergyDebt(quantum.getEnergyDebt());
  };

  const shiftEnergy = () => {
    alert('Temporal energy shifting coming soon! This will let you borrow energy from your future self.');
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
            { backgroundColor: quantumColors[quantumState.state] + '20' },
          ]}
        >
          <View style={styles.quantumHeader}>
            <View
              style={[
                styles.stateIndicator,
                { backgroundColor: quantumColors[quantumState.state] },
              ]}
            >
              <Ionicons name="flash" size={32} color="#FFF" />
            </View>
            <View style={styles.stateInfo}>
              <Text style={[styles.stateTitle, { color: palette.text }]}>
                {quantumState.state.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={[styles.stateDescription, { color: palette.textSecondary }]}>
                Energy Level: {quantumState.energyLevel}/{quantumState.maxEnergy}
              </Text>
            </View>
          </View>

          <View style={styles.energyBar}>
            <View
              style={[
                styles.energyFill,
                {
                  width: `${(quantumState.energyLevel / quantumState.maxEnergy) * 100}%`,
                  backgroundColor: quantumColors[quantumState.state],
                },
              ]}
            />
          </View>

          {quantumState.halfLife && (
            <Text style={[styles.halfLifeText, { color: palette.textSecondary }]}>
              State decay half-life: {quantumState.halfLife} minutes
            </Text>
          )}
        </View>

        {/* Energy Debt */}
        {energyDebt && energyDebt.totalOwed > 0 && (
          <View style={[styles.card, { backgroundColor: '#F8D7DA' }]}>
            <View style={styles.debtHeader}>
              <Ionicons name="warning" size={24} color="#721C24" />
              <Text style={[styles.debtTitle, { color: '#721C24' }]}>Energy Debt</Text>
            </View>

            <Text style={[styles.debtAmount, { color: '#721C24' }]}>
              {energyDebt.totalOwed.toFixed(1)} units owed
            </Text>
            <Text style={[styles.debtRate, { color: '#856404' }]}>
              Compound interest: {(energyDebt.interestRate * 100).toFixed(0)}% per day
            </Text>

            <View style={styles.borrowSection}>
              <Text style={[styles.borrowLabel, { color: '#721C24' }]}>
                Borrow more energy (at {(energyDebt.interestRate * 100).toFixed(0)}% daily interest):
              </Text>
              <View style={styles.borrowButtons}>
                <Pressable
                  style={[styles.borrowButton, { backgroundColor: '#DC143C' }]}
                  onPress={() => borrowEnergy(5)}
                >
                  <Text style={styles.borrowButtonText}>+5 units</Text>
                </Pressable>
                <Pressable
                  style={[styles.borrowButton, { backgroundColor: '#DC143C' }]}
                  onPress={() => borrowEnergy(10)}
                >
                  <Text style={styles.borrowButtonText}>+10 units</Text>
                </Pressable>
                <Pressable
                  style={[styles.borrowButton, { backgroundColor: '#DC143C' }]}
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
              { backgroundColor: weatherColors[currentWeather.weatherType] + '20' },
            ]}
          >
            <View style={styles.weatherHeader}>
              <View
                style={[
                  styles.weatherIcon,
                  { backgroundColor: weatherColors[currentWeather.weatherType] },
                ]}
              >
                <Ionicons
                  name={
                    currentWeather.weatherType === 'sunny'
                      ? 'sunny'
                      : currentWeather.weatherType === 'rainy'
                      ? 'rainy'
                      : currentWeather.weatherType === 'stormy'
                      ? 'thunderstorm'
                      : 'cloud'
                  }
                  size={32}
                  color="#FFF"
                />
              </View>
              <View style={styles.weatherInfo}>
                <Text style={[styles.weatherTitle, { color: palette.text }]}>
                  {currentWeather.weatherType.replace(/_/g, ' ').toUpperCase()}
                </Text>
                <Text style={[styles.weatherIntensity, { color: palette.textSecondary }]}>
                  Intensity: {currentWeather.intensity}/5
                </Text>
              </View>
            </View>

            <Text style={[styles.weatherDescription, { color: palette.text }]}>
              {currentWeather.description}
            </Text>

            {currentWeather.triggers.length > 0 && (
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
        {moodForecast && moodForecast.length > 0 && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              24-Hour Mood Forecast
            </Text>

            {moodForecast.slice(0, 6).map((forecast, index) => (
              <View key={index} style={[styles.forecastCard, { borderColor: palette.border }]}>
                <View style={styles.forecastHeader}>
                  <Text style={[styles.forecastTime, { color: palette.text }]}>
                    {new Date(forecast.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <View
                    style={[
                      styles.forecastBadge,
                      { backgroundColor: weatherColors[forecast.predictedWeather] },
                    ]}
                  >
                    <Text style={styles.forecastBadgeText}>
                      {forecast.predictedWeather.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${forecast.confidence * 100}%`,
                        backgroundColor: palette.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.confidenceText, { color: palette.textSecondary }]}>
                  {(forecast.confidence * 100).toFixed(0)}% confidence
                </Text>
              </View>
            ))}
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
            onPress={() => alert('Social energy tracking coming soon!')}
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
    backgroundColor: '#E0E0E0',
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
    color: '#FFF',
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
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
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
});

