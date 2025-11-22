/**
 * Emotional Weather Station
 * 
 * Advanced upgrade to Mood Tracker 2.0 with mood precipitation forecasting,
 * emotional isotherms, collective mood barometer, mood archaeology, and biometric fusion.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Platform } from 'react-native';

import { logError } from '../utils/errorLogger';

import { hapticLanguage } from './hapticLanguage';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type EmotionalWeatherType =
  | 'clear_skies' // Consistent positive mood
  | 'partly_cloudy' // Mixed emotions
  | 'overcast' // Low mood, no active symptoms
  | 'light_rain' // Mild sadness/anxiety
  | 'thunderstorm' // Intense emotional distress
  | 'hurricane' // Crisis-level emotions
  | 'fog' // Dissociation, numbness
  | 'heatwave' // Mania, hypomania
  | 'blizzard' // Shutdown, extreme fatigue
  | 'rainbow'; // Post-storm relief, hope

export interface MoodReading {
  id: string;
  timestamp: number;
  primaryEmotion: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  secondaryEmotions?: string[];
  triggers?: string[];
  physicalSensations?: string[];
  thoughts?: string;
  weather: EmotionalWeatherType;
  temperature: number; // 0-100 (emotional "heat")
  pressure: number; // 0-100 (emotional "pressure")
  humidity: number; // 0-100 (emotional "moisture" / tears)
}

export interface MoodForecast {
  hoursAhead: number;
  predictedWeather: EmotionalWeatherType;
  confidence: number; // 0-100
  precipitationChance: number; // 0-100 (chance of mood deterioration)
  warnings: string[];
  recommendations: string[];
}

export interface EmotionalIsotherm {
  emotion: string;
  avgIntensity: number;
  frequency: number;
  heatMapData: Array<{ hour: number; day: number; intensity: number }>; // hour 0-23, day 0-6
}

export interface CollectiveMoodData {
  timestamp: number;
  averageMood: number; // 0-100
  dominantWeather: EmotionalWeatherType;
  totalReadings: number;
  trendDirection: 'improving' | 'stable' | 'declining';
}

export interface MoodArchaeologyFindings {
  emotion: string;
  firstAppearance: number; // timestamp
  lastAppearance: number; // timestamp
  totalOccurrences: number;
  copingStrategiesThatWorked: Array<{ strategy: string; successRate: number }>;
  triggers: Array<{ trigger: string; frequency: number }>;
  associatedWeather: EmotionalWeatherType[];
}

export interface BiometricReading {
  timestamp: number;
  heartRate?: number;
  heartRateVariability?: number; // HRV
  steps?: number;
  sleepHours?: number;
  sleepQuality?: number; // 0-100
  source: 'apple_health' | 'google_fit' | 'fitbit' | 'manual';
}

export interface FusedMoodInsight {
  timestamp: number;
  reportedMood: MoodReading;
  biometrics?: BiometricReading;
  discrepancy: number; // 0-100 (how much biometrics disagree with reported mood)
  insights: string[];
}

export interface EmotionalClimate {
  period: 'week' | 'month' | 'year';
  averageWeather: EmotionalWeatherType;
  mostCommonWeather: EmotionalWeatherType;
  extremeEvents: Array<{ date: string; weather: EmotionalWeatherType; intensity: number }>;
  seasonalPatterns: string[];
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  MOOD_READINGS: 'emotionalWeather:moodReadings:v1',
  BIOMETRIC_READINGS: 'emotionalWeather:biometrics:v1',
  ARCHAEOLOGY: 'emotionalWeather:archaeology:v1',
  COLLECTIVE: 'emotionalWeather:collective:v1',
} as const;

const WEATHER_TYPE_CONFIGS: Record<
  EmotionalWeatherType,
  { tempRange: [number, number]; pressureRange: [number, number]; humidityRange: [number, number] }
> = {
  clear_skies: { tempRange: [60, 80], pressureRange: [70, 100], humidityRange: [0, 30] },
  partly_cloudy: { tempRange: [50, 70], pressureRange: [50, 70], humidityRange: [20, 50] },
  overcast: { tempRange: [40, 60], pressureRange: [40, 60], humidityRange: [30, 60] },
  light_rain: { tempRange: [30, 50], pressureRange: [30, 50], humidityRange: [50, 80] },
  thunderstorm: { tempRange: [20, 40], pressureRange: [10, 30], humidityRange: [70, 100] },
  hurricane: { tempRange: [0, 20], pressureRange: [0, 20], humidityRange: [80, 100] },
  fog: { tempRange: [40, 60], pressureRange: [20, 40], humidityRange: [60, 90] },
  heatwave: { tempRange: [80, 100], pressureRange: [60, 90], humidityRange: [0, 30] },
  blizzard: { tempRange: [0, 30], pressureRange: [0, 30], humidityRange: [50, 100] },
  rainbow: { tempRange: [60, 80], pressureRange: [60, 90], humidityRange: [30, 60] },
};

const EMOTION_TEMPERATURE_MAP: Record<string, number> = {
  joy: 75,
  excitement: 85,
  contentment: 65,
  calm: 55,
  sadness: 35,
  anger: 80,
  fear: 40,
  anxiety: 50,
  disgust: 45,
  shame: 30,
  guilt: 35,
  loneliness: 30,
  overwhelm: 70,
  numbness: 40,
};

// ============================================================================
// Emotional Weather Station Manager
// ============================================================================

class EmotionalWeatherStationManager {
  private static instance: EmotionalWeatherStationManager;
  private moodReadings: MoodReading[] = [];
  private biometricReadings: BiometricReading[] = [];
  private archaeology: Map<string, MoodArchaeologyFindings> = new Map();
  private collectiveData: CollectiveMoodData[] = [];

  private constructor() {
    this.loadData();
  }

  static getInstance(): EmotionalWeatherStationManager {
    if (!EmotionalWeatherStationManager.instance) {
      EmotionalWeatherStationManager.instance = new EmotionalWeatherStationManager();
    }
    return EmotionalWeatherStationManager.instance;
  }

  // ============================================================================
  // Data Management
  // ============================================================================

  private async loadData(): Promise<void> {
    try {
      // Skip on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') return;
      
      const [moodStr, bioStr, archStr, collectiveStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.MOOD_READINGS),
        AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_READINGS),
        AsyncStorage.getItem(STORAGE_KEYS.ARCHAEOLOGY),
        AsyncStorage.getItem(STORAGE_KEYS.COLLECTIVE),
      ]);

      if (moodStr) this.moodReadings = JSON.parse(moodStr);
      if (bioStr) this.biometricReadings = JSON.parse(bioStr);
      
      if (archStr) {
        const archArray: MoodArchaeologyFindings[] = JSON.parse(archStr);
        this.archaeology = new Map(archArray.map(a => [a.emotion, a]));
      }

      if (collectiveStr) this.collectiveData = JSON.parse(collectiveStr);

      // Update archaeology
      await this.updateArchaeology();
    } catch (err) {
      logError('emotionalWeatherStation', 'Failed to load emotional weather data', err);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.MOOD_READINGS, JSON.stringify(this.moodReadings.slice(-1000))),
        AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_READINGS, JSON.stringify(this.biometricReadings.slice(-500))),
        AsyncStorage.setItem(STORAGE_KEYS.ARCHAEOLOGY, JSON.stringify(Array.from(this.archaeology.values()))),
        AsyncStorage.setItem(STORAGE_KEYS.COLLECTIVE, JSON.stringify(this.collectiveData.slice(-100))),
      ]);
    } catch (err) {
      logError('emotionalWeatherStation', 'Failed to save emotional weather data', err);
    }
  }

  // ============================================================================
  // Mood Recording
  // ============================================================================

  async recordMood(
    primaryEmotion: string,
    intensity: 1 | 2 | 3 | 4 | 5,
    options?: {
      secondaryEmotions?: string[];
      triggers?: string[];
      physicalSensations?: string[];
      thoughts?: string;
    }
  ): Promise<MoodReading> {
    const temperature = this.calculateTemperature(primaryEmotion, intensity);
    const pressure = this.calculatePressure(intensity);
    const humidity = this.calculateHumidity(primaryEmotion, intensity);
    const weather = this.determineWeather(temperature, pressure, humidity);

    const reading: MoodReading = {
      id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      primaryEmotion,
      intensity,
      secondaryEmotions: options?.secondaryEmotions,
      triggers: options?.triggers,
      physicalSensations: options?.physicalSensations,
      thoughts: options?.thoughts,
      weather,
      temperature,
      pressure,
      humidity,
    };

    this.moodReadings.push(reading);

    // Trigger haptic feedback based on weather
    if (weather === 'thunderstorm' || weather === 'hurricane') {
      await hapticLanguage.play('warning');
    } else if (weather === 'rainbow' || weather === 'clear_skies') {
      await hapticLanguage.play('achievement');
    }

    // Update collective mood
    await this.updateCollectiveMood();

    // Update archaeology
    await this.updateArchaeology();

    await this.saveData();
    return reading;
  }

  private calculateTemperature(emotion: string, intensity: number): number {
    const baseTemp = EMOTION_TEMPERATURE_MAP[emotion.toLowerCase()] || 50;
    const intensityModifier = (intensity - 3) * 10; // -20 to +20
    return Math.max(0, Math.min(100, baseTemp + intensityModifier));
  }

  private calculatePressure(intensity: number): number {
    // Higher intensity = higher pressure
    return intensity * 20;
  }

  private calculateHumidity(emotion: string, intensity: number): number {
    // Emotions associated with tears have higher humidity
    const tearEmotions = ['sadness', 'grief', 'overwhelm', 'loneliness'];
    const isTearEmotion = tearEmotions.includes(emotion.toLowerCase());
    
    if (isTearEmotion) {
      return intensity * 20;
    }
    return intensity * 10;
  }

  private determineWeather(temp: number, pressure: number, humidity: number): EmotionalWeatherType {
    // Find best matching weather type
    let bestMatch: EmotionalWeatherType = 'partly_cloudy';
    let bestScore = Infinity;

    Object.entries(WEATHER_TYPE_CONFIGS).forEach(([weather, ranges]) => {
      const tempScore = Math.min(
        Math.abs(temp - ranges.tempRange[0]),
        Math.abs(temp - ranges.tempRange[1])
      );
      const pressureScore = Math.min(
        Math.abs(pressure - ranges.pressureRange[0]),
        Math.abs(pressure - ranges.pressureRange[1])
      );
      const humidityScore = Math.min(
        Math.abs(humidity - ranges.humidityRange[0]),
        Math.abs(humidity - ranges.humidityRange[1])
      );

      const totalScore = tempScore + pressureScore + humidityScore;
      
      if (totalScore < bestScore) {
        bestScore = totalScore;
        bestMatch = weather as EmotionalWeatherType;
      }
    });

    return bestMatch;
  }

  getMoodHistory(days: number = 30): MoodReading[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.moodReadings
      .filter(m => m.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // ============================================================================
  // Mood Forecasting
  // ============================================================================

  forecastMood(hoursAhead: number = 24): MoodForecast {
    const recentMoods = this.moodReadings.slice(-20);
    
    if (recentMoods.length < 3) {
      return {
        hoursAhead,
        predictedWeather: 'partly_cloudy',
        confidence: 20,
        precipitationChance: 50,
        warnings: ['Not enough data for accurate forecast'],
        recommendations: ['Continue tracking mood regularly'],
      };
    }

    // Analyze trends
    const recentIntensities = recentMoods.slice(-5).map(m => m.intensity);
    const avgIntensity = recentIntensities.reduce((sum, i) => sum + i, 0) / recentIntensities.length;
    
    const trend = this.calculateTrend(recentIntensities);

    // Predict future intensity
    const futureIntensity = Math.max(1, Math.min(5, avgIntensity + trend * (hoursAhead / 24)));

    // Check for patterns at this time
    const targetHour = (new Date().getHours() + hoursAhead) % 24;
    const historicalAtHour = this.moodReadings.filter(m => {
      const hour = new Date(m.timestamp).getHours();
      return Math.abs(hour - targetHour) <= 1;
    });

    let predictedWeather: EmotionalWeatherType = 'partly_cloudy';
    if (historicalAtHour.length > 3) {
      const weatherCounts = new Map<EmotionalWeatherType, number>();
      historicalAtHour.forEach(m => {
        weatherCounts.set(m.weather, (weatherCounts.get(m.weather) || 0) + 1);
      });
      
      const mostCommon = Array.from(weatherCounts.entries())
        .sort((a, b) => b[1] - a[1])[0];
      predictedWeather = mostCommon[0];
    } else {
      // Use recent trend
      if (futureIntensity >= 4) {
        predictedWeather = trend > 0 ? 'heatwave' : 'thunderstorm';
      } else if (futureIntensity <= 2) {
        predictedWeather = 'overcast';
      } else {
        predictedWeather = trend > 0.5 ? 'clear_skies' : 'partly_cloudy';
      }
    }

    const confidence = Math.min(80, historicalAtHour.length * 10 + 20);

    // Precipitation chance (chance mood will worsen)
    const negativeWeathers: EmotionalWeatherType[] = [
      'light_rain',
      'thunderstorm',
      'hurricane',
      'blizzard',
    ];
    const recentNegative = recentMoods.slice(-5).filter(m => 
      negativeWeathers.includes(m.weather)
    ).length;
    const precipitationChance = (recentNegative / 5) * 100;

    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (precipitationChance > 60) {
      warnings.push('High chance of mood deterioration');
      recommendations.push('Plan self-care activities');
      recommendations.push('Reach out to support network');
    }

    if (predictedWeather === 'thunderstorm' || predictedWeather === 'hurricane') {
      warnings.push('Severe emotional weather predicted');
      recommendations.push('Review crisis plan');
      recommendations.push('Consider contacting therapist');
    }

    if (trend < -0.5) {
      warnings.push('Downward mood trend detected');
    }

    return {
      hoursAhead,
      predictedWeather,
      confidence,
      precipitationChance: Math.round(precipitationChance),
      warnings,
      recommendations,
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  // ============================================================================
  // Emotional Isotherms
  // ============================================================================

  generateIsotherms(daysBack: number = 30): EmotionalIsotherm[] {
    const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
    const relevantMoods = this.moodReadings.filter(m => m.timestamp > cutoff);

    const emotionGroups = new Map<string, MoodReading[]>();
    relevantMoods.forEach(mood => {
      if (!emotionGroups.has(mood.primaryEmotion)) {
        emotionGroups.set(mood.primaryEmotion, []);
      }
      emotionGroups.get(mood.primaryEmotion)!.push(mood);
    });

    const isotherms: EmotionalIsotherm[] = [];

    emotionGroups.forEach((moods, emotion) => {
      const avgIntensity = moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length;
      
      // Build heat map
      const heatMap = new Map<string, number[]>();
      moods.forEach(mood => {
        const date = new Date(mood.timestamp);
        const hour = date.getHours();
        const day = date.getDay();
        const key = `${day}_${hour}`;
        
        if (!heatMap.has(key)) {
          heatMap.set(key, []);
        }
        heatMap.get(key)!.push(mood.intensity);
      });

      const heatMapData: EmotionalIsotherm['heatMapData'] = [];
      heatMap.forEach((intensities, key) => {
        const [day, hour] = key.split('_').map(Number);
        const avgIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
        heatMapData.push({ hour, day, intensity: avgIntensity });
      });

      isotherms.push({
        emotion,
        avgIntensity: Math.round(avgIntensity * 10) / 10,
        frequency: moods.length,
        heatMapData,
      });
    });

    return isotherms.sort((a, b) => b.frequency - a.frequency);
  }

  // ============================================================================
  // Collective Mood Barometer
  // ============================================================================

  private async updateCollectiveMood(): Promise<void> {
    const last24Hours = this.moodReadings.filter(
      m => m.timestamp > Date.now() - 24 * 60 * 60 * 1000
    );

    if (last24Hours.length === 0) return;

    const avgMood = last24Hours.reduce((sum, m) => sum + m.temperature, 0) / last24Hours.length;

    const weatherCounts = new Map<EmotionalWeatherType, number>();
    last24Hours.forEach(m => {
      weatherCounts.set(m.weather, (weatherCounts.get(m.weather) || 0) + 1);
    });

    const dominantWeather = Array.from(weatherCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    // Determine trend
    const last12Hours = last24Hours.filter(m => m.timestamp > Date.now() - 12 * 60 * 60 * 1000);
    const first12Hours = last24Hours.filter(m => m.timestamp <= Date.now() - 12 * 60 * 60 * 1000);

    const avgRecent = last12Hours.length > 0
      ? last12Hours.reduce((sum, m) => sum + m.temperature, 0) / last12Hours.length
      : avgMood;
    const avgOlder = first12Hours.length > 0
      ? first12Hours.reduce((sum, m) => sum + m.temperature, 0) / first12Hours.length
      : avgMood;

    let trendDirection: CollectiveMoodData['trendDirection'] = 'stable';
    if (avgRecent > avgOlder + 10) {
      trendDirection = 'improving';
    } else if (avgRecent < avgOlder - 10) {
      trendDirection = 'declining';
    }

    const collective: CollectiveMoodData = {
      timestamp: Date.now(),
      averageMood: Math.round(avgMood),
      dominantWeather,
      totalReadings: last24Hours.length,
      trendDirection,
    };

    this.collectiveData.push(collective);
  }

  getCollectiveMood(): CollectiveMoodData | null {
    return this.collectiveData[this.collectiveData.length - 1] || null;
  }

  // ============================================================================
  // Mood Archaeology
  // ============================================================================

  private async updateArchaeology(): Promise<void> {
    const emotionOccurrences = new Map<string, MoodReading[]>();

    this.moodReadings.forEach(mood => {
      if (!emotionOccurrences.has(mood.primaryEmotion)) {
        emotionOccurrences.set(mood.primaryEmotion, []);
      }
      emotionOccurrences.get(mood.primaryEmotion)!.push(mood);
    });

    emotionOccurrences.forEach((occurrences, emotion) => {
      const sorted = occurrences.sort((a, b) => a.timestamp - b.timestamp);
      
      const triggerCounts = new Map<string, number>();
      occurrences.forEach(mood => {
        mood.triggers?.forEach(trigger => {
          triggerCounts.set(trigger, (triggerCounts.get(trigger) || 0) + 1);
        });
      });

      const triggers = Array.from(triggerCounts.entries())
        .map(([trigger, frequency]) => ({ trigger, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);

      const weatherTypes = [...new Set(occurrences.map(m => m.weather))];

      const findings: MoodArchaeologyFindings = {
        emotion,
        firstAppearance: sorted[0].timestamp,
        lastAppearance: sorted[sorted.length - 1].timestamp,
        totalOccurrences: occurrences.length,
        copingStrategiesThatWorked: [], // TODO: Integrate with coping strategy tracker
        triggers,
        associatedWeather: weatherTypes,
      };

      this.archaeology.set(emotion, findings);
    });
  }

  excavateMoodHistory(emotion: string): MoodArchaeologyFindings | null {
    return this.archaeology.get(emotion) || null;
  }

  getAllArchaeology(): MoodArchaeologyFindings[] {
    return Array.from(this.archaeology.values())
      .sort((a, b) => b.totalOccurrences - a.totalOccurrences);
  }

  // ============================================================================
  // Biometric Fusion
  // ============================================================================

  async recordBiometrics(data: Omit<BiometricReading, 'timestamp'>): Promise<void> {
    const reading: BiometricReading = {
      ...data,
      timestamp: Date.now(),
    };

    this.biometricReadings.push(reading);
    await this.saveData();
  }

  fuseMoodWithBiometrics(moodId: string): FusedMoodInsight | null {
    const mood = this.moodReadings.find(m => m.id === moodId);
    if (!mood) return null;

    // Find closest biometric reading (within 2 hours)
    const twoHours = 2 * 60 * 60 * 1000;
    const nearbyBiometrics = this.biometricReadings.filter(
      b => Math.abs(b.timestamp - mood.timestamp) < twoHours
    );

    if (nearbyBiometrics.length === 0) {
      return {
        timestamp: mood.timestamp,
        reportedMood: mood,
        discrepancy: 0,
        insights: ['No biometric data available for this period'],
      };
    }

    const closest = nearbyBiometrics.sort(
      (a, b) => Math.abs(a.timestamp - mood.timestamp) - Math.abs(b.timestamp - mood.timestamp)
    )[0];

    const insights: string[] = [];
    let discrepancy = 0;

    // Analyze HRV (high HRV = good stress resilience)
    if (closest.heartRateVariability !== undefined) {
      if (closest.heartRateVariability < 30 && mood.temperature > 60) {
        insights.push('Low HRV suggests stress, despite positive mood report');
        discrepancy += 30;
      } else if (closest.heartRateVariability > 70 && mood.temperature < 40) {
        insights.push('High HRV suggests calm physiology, despite negative mood report');
        discrepancy += 20;
      }
    }

    // Analyze sleep
    if (closest.sleepHours !== undefined) {
      if (closest.sleepHours < 6 && mood.intensity >= 4) {
        insights.push('Sleep deprivation may be amplifying emotions');
      }
      if (closest.sleepQuality !== undefined && closest.sleepQuality < 40) {
        insights.push('Poor sleep quality may be affecting mood');
      }
    }

    // Analyze heart rate
    if (closest.heartRate !== undefined) {
      if (closest.heartRate > 90 && mood.primaryEmotion.toLowerCase() === 'calm') {
        insights.push('Elevated heart rate conflicts with reported calmness');
        discrepancy += 25;
      }
    }

    return {
      timestamp: mood.timestamp,
      reportedMood: mood,
      biometrics: closest,
      discrepancy: Math.min(100, discrepancy),
      insights,
    };
  }

  // ============================================================================
  // Emotional Climate
  // ============================================================================

  getEmotionalClimate(period: 'week' | 'month' | 'year'): EmotionalClimate {
    const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000;
    const relevantMoods = this.moodReadings.filter(m => m.timestamp > cutoff);

    if (relevantMoods.length === 0) {
      return {
        period,
        averageWeather: 'partly_cloudy',
        mostCommonWeather: 'partly_cloudy',
        extremeEvents: [],
        seasonalPatterns: [],
      };
    }

    const avgTemp = relevantMoods.reduce((sum, m) => sum + m.temperature, 0) / relevantMoods.length;
    const avgPressure = relevantMoods.reduce((sum, m) => sum + m.pressure, 0) / relevantMoods.length;
    const avgHumidity = relevantMoods.reduce((sum, m) => sum + m.humidity, 0) / relevantMoods.length;
    const averageWeather = this.determineWeather(avgTemp, avgPressure, avgHumidity);

    const weatherCounts = new Map<EmotionalWeatherType, number>();
    relevantMoods.forEach(m => {
      weatherCounts.set(m.weather, (weatherCounts.get(m.weather) || 0) + 1);
    });
    const mostCommonWeather = Array.from(weatherCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    const extremeWeathers: EmotionalWeatherType[] = ['hurricane', 'thunderstorm', 'heatwave', 'blizzard'];
    const extremeEvents = relevantMoods
      .filter(m => extremeWeathers.includes(m.weather))
      .map(m => ({
        date: new Date(m.timestamp).toISOString().split('T')[0],
        weather: m.weather,
        intensity: m.intensity,
      }))
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 10);

    const seasonalPatterns: string[] = [];
    // TODO: Implement seasonal pattern detection

    return {
      period,
      averageWeather,
      mostCommonWeather,
      extremeEvents,
      seasonalPatterns,
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const emotionalWeatherStation = EmotionalWeatherStationManager.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useEmotionalWeatherStation() {
  const [currentMood, setCurrentMood] = React.useState<MoodReading | null>(null);

  React.useEffect(() => {
    const history = emotionalWeatherStation.getMoodHistory(1);
    setCurrentMood(history[0] || null);

    const interval = setInterval(() => {
      const updated = emotionalWeatherStation.getMoodHistory(1);
      setCurrentMood(updated[0] || null);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    // Recording
    recordMood: (emotion: string, intensity: 1 | 2 | 3 | 4 | 5, options?: any) =>
      emotionalWeatherStation.recordMood(emotion, intensity, options),
    recordBiometrics: (data: Omit<BiometricReading, 'timestamp'>) =>
      emotionalWeatherStation.recordBiometrics(data),
    
    // History
    currentMood,
    getMoodHistory: (days?: number) => emotionalWeatherStation.getMoodHistory(days),
    
    // Forecasting
    forecastMood: (hoursAhead?: number) => emotionalWeatherStation.forecastMood(hoursAhead),
    
    // Isotherms
    generateIsotherms: (daysBack?: number) => emotionalWeatherStation.generateIsotherms(daysBack),
    
    // Collective
    getCollectiveMood: () => emotionalWeatherStation.getCollectiveMood(),
    
    // Archaeology
    excavate: (emotion: string) => emotionalWeatherStation.excavateMoodHistory(emotion),
    getAllArchaeology: () => emotionalWeatherStation.getAllArchaeology(),
    
    // Biometric fusion
    fuseMood: (moodId: string) => emotionalWeatherStation.fuseMoodWithBiometrics(moodId),
    
    // Climate
    getClimate: (period: 'week' | 'month' | 'year') =>
      emotionalWeatherStation.getEmotionalClimate(period),
  };
}
