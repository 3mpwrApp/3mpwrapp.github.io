/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Environmental Adaptation Engine
 * 
 * WORLD-FIRST: AI that automatically adapts the app and provides recommendations
 * based on environmental factors that affect chronic illness and disability.
 * 
 * Revolutionary Features:
 * - Weather sensitivity tracking (barometric pressure, humidity, temperature)
 * - Air quality impact analysis
 * - Light/sound environment adaptation
 * - Location-based trigger patterns
 * - Circadian environment optimization
 * - Predictive alerts before weather changes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

// ============ TYPES ============

export type WeatherCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'wind'
  | 'extreme_heat'
  | 'extreme_cold';

export type SensitivityLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'extreme';

export type EnvironmentFactor =
  | 'barometric_pressure'
  | 'humidity'
  | 'temperature'
  | 'air_quality'
  | 'uv_index'
  | 'pollen'
  | 'light_level'
  | 'noise_level'
  | 'altitude'
  | 'moon_phase';

export interface EnvironmentReading {
  id: string;
  timestamp: number;
  factors: {
    barometricPressure?: number;     // hPa
    pressureChange?: number;         // hPa change per hour
    humidity?: number;               // percentage
    temperature?: number;            // Celsius
    temperatureChange?: number;      // change per hour
    airQualityIndex?: number;        // AQI 0-500
    uvIndex?: number;                // 0-11+
    pollenLevel?: number;            // 0-5
    lightLevel?: number;             // lux
    noiseLevel?: number;             // decibels
    altitude?: number;               // meters
    moonPhase?: number;              // 0-1 (0=new, 0.5=full)
  };
  weather: WeatherCondition;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  isManual: boolean;
}

export interface SensitivityProfile {
  factor: EnvironmentFactor;
  sensitivity: SensitivityLevel;
  optimalRange: {
    min: number;
    max: number;
  };
  symptomsTrigered: string[];
  adjustmentNeeded: number;         // How much to adjust for this sensitivity
  confidence: number;
  dataPoints: number;
}

export interface EnvironmentAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  factor: EnvironmentFactor;
  title: string;
  message: string;
  timestamp: number;
  validUntil: number;
  recommendations: EnvironmentRecommendation[];
  dismissed: boolean;
}

export interface EnvironmentRecommendation {
  id: string;
  category: 'preparation' | 'avoidance' | 'adaptation' | 'medication' | 'activity';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timing: 'now' | 'soon' | 'today' | 'tomorrow';
  effectiveness: number;
}

export interface LocationTrigger {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    radius: number;            // meters
  };
  triggers: string[];          // Symptoms triggered at this location
  frequency: number;           // Times triggered
  severity: number;            // Average severity
  avoidanceRecommended: boolean;
  notes?: string;
}

export interface EnvironmentPattern {
  id: string;
  factor: EnvironmentFactor;
  pattern: 'rising' | 'falling' | 'stable' | 'fluctuating';
  correlation: number;         // Correlation with symptoms
  typicalDelay: number;        // Minutes between trigger and symptoms
  affectedSymptoms: string[];
  seasonality?: {
    spring: number;
    summer: number;
    fall: number;
    winter: number;
  };
}

export interface AdaptiveSettings {
  autoAdjustBrightness: boolean;
  autoAdjustVolume: boolean;
  autoAdjustHaptics: boolean;
  lowEnergyMode: boolean;
  darkModeThreshold: number;    // lux level to trigger dark mode
  quietModeThreshold: number;   // decibel level to trigger quiet mode
  weatherAlerts: boolean;
  pressureAlerts: boolean;
  airQualityAlerts: boolean;
}

export interface EnvironmentAdaptationState {
  currentEnvironment: EnvironmentReading | null;
  readings: EnvironmentReading[];
  sensitivityProfiles: SensitivityProfile[];
  alerts: EnvironmentAlert[];
  locationTriggers: LocationTrigger[];
  patterns: EnvironmentPattern[];
  adaptiveSettings: AdaptiveSettings;
  predictions: {
    nextPressureDrop: number | null;
    nextWeatherChange: number | null;
    riskLevel24h: number;
  };
  learningData: {
    totalReadings: number;
    correlationAccuracy: number;
    lastCalibration: number;
  };
}

// ============ STORAGE ============

const STORAGE_KEYS = {
  STATE: 'envAdaptation:state:v1',
  READINGS: 'envAdaptation:readings:v1',
  PROFILES: 'envAdaptation:profiles:v1',
  LOCATIONS: 'envAdaptation:locations:v1',
  PATTERNS: 'envAdaptation:patterns:v1',
  SETTINGS: 'envAdaptation:settings:v1',
};

// ============ DEFAULTS ============

const DEFAULT_SETTINGS: AdaptiveSettings = {
  autoAdjustBrightness: true,
  autoAdjustVolume: true,
  autoAdjustHaptics: true,
  lowEnergyMode: false,
  darkModeThreshold: 50,
  quietModeThreshold: 70,
  weatherAlerts: true,
  pressureAlerts: true,
  airQualityAlerts: true,
};

const DEFAULT_SENSITIVITY_PROFILES: SensitivityProfile[] = [
  {
    factor: 'barometric_pressure',
    sensitivity: 'moderate',
    optimalRange: { min: 1010, max: 1020 },
    symptomsTrigered: ['headache', 'joint-pain', 'fatigue'],
    adjustmentNeeded: 0,
    confidence: 0.5,
    dataPoints: 0,
  },
  {
    factor: 'humidity',
    sensitivity: 'mild',
    optimalRange: { min: 40, max: 60 },
    symptomsTrigered: ['respiratory', 'fatigue'],
    adjustmentNeeded: 0,
    confidence: 0.5,
    dataPoints: 0,
  },
  {
    factor: 'temperature',
    sensitivity: 'moderate',
    optimalRange: { min: 18, max: 24 },
    symptomsTrigered: ['fatigue', 'pain-flare'],
    adjustmentNeeded: 0,
    confidence: 0.5,
    dataPoints: 0,
  },
  {
    factor: 'air_quality',
    sensitivity: 'mild',
    optimalRange: { min: 0, max: 50 },
    symptomsTrigered: ['respiratory', 'headache', 'fatigue'],
    adjustmentNeeded: 0,
    confidence: 0.5,
    dataPoints: 0,
  },
  {
    factor: 'light_level',
    sensitivity: 'moderate',
    optimalRange: { min: 200, max: 500 },
    symptomsTrigered: ['migraine', 'sensory-overload', 'fatigue'],
    adjustmentNeeded: 0,
    confidence: 0.5,
    dataPoints: 0,
  },
  {
    factor: 'noise_level',
    sensitivity: 'moderate',
    optimalRange: { min: 30, max: 55 },
    symptomsTrigered: ['sensory-overload', 'headache', 'anxiety'],
    adjustmentNeeded: 0,
    confidence: 0.5,
    dataPoints: 0,
  },
];

// ============ SERVICE ============

class EnvironmentalAdaptationService {
  private state: EnvironmentAdaptationState = {
    currentEnvironment: null,
    readings: [],
    sensitivityProfiles: [...DEFAULT_SENSITIVITY_PROFILES],
    alerts: [],
    locationTriggers: [],
    patterns: [],
    adaptiveSettings: { ...DEFAULT_SETTINGS },
    predictions: {
      nextPressureDrop: null,
      nextWeatherChange: null,
      riskLevel24h: 0,
    },
    learningData: {
      totalReadings: 0,
      correlationAccuracy: 0.5,
      lastCalibration: Date.now(),
    },
  };
  private listeners: Set<() => void> = new Set();
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;

  // ============ INITIALIZATION ============

  async initialize(): Promise<void> {
    try {
      const [state, readings, profiles, locations, patterns, settings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.STATE),
        AsyncStorage.getItem(STORAGE_KEYS.READINGS),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILES),
        AsyncStorage.getItem(STORAGE_KEYS.LOCATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PATTERNS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      if (readings) this.state.readings = JSON.parse(readings);
      if (profiles) this.state.sensitivityProfiles = JSON.parse(profiles);
      if (locations) this.state.locationTriggers = JSON.parse(locations);
      if (patterns) this.state.patterns = JSON.parse(patterns);
      if (settings) this.state.adaptiveSettings = JSON.parse(settings);
      if (state) {
        const parsed = JSON.parse(state);
        this.state.currentEnvironment = parsed.currentEnvironment;
        this.state.alerts = parsed.alerts || [];
        this.state.predictions = parsed.predictions || this.state.predictions;
        this.state.learningData = parsed.learningData || this.state.learningData;
      }

      // Start monitoring
      this.startMonitoring();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize EnvironmentalAdaptation:', error);
    }
  }

  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    // Check every 5 minutes
    this.monitoringInterval = setInterval(() => {
      this.checkForAlerts();
      this.updatePredictions();
    }, 5 * 60 * 1000);
  }

  // ============ ENVIRONMENT READING ============

  async recordEnvironment(reading: Omit<EnvironmentReading, 'id' | 'timestamp'>): Promise<EnvironmentReading> {
    const newReading: EnvironmentReading = {
      ...reading,
      id: `reading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.state.readings.push(newReading);
    this.state.currentEnvironment = newReading;
    this.state.learningData.totalReadings++;

    // Trim old readings (keep last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.state.readings = this.state.readings.filter(r => r.timestamp > thirtyDaysAgo);

    // Check for alerts
    await this.checkForAlerts();

    // Update patterns if enough data
    if (this.state.readings.length % 10 === 0) {
      await this.analyzePatterns();
    }

    await this.save();
    this.notifyListeners();

    return newReading;
  }

  async recordFromWeatherAPI(weatherData: {
    temperature: number;
    humidity: number;
    pressure: number;
    weather: WeatherCondition;
    aqi?: number;
    uvIndex?: number;
  }): Promise<EnvironmentReading> {
    // Calculate pressure change from last reading
    const lastReading = this.state.readings[this.state.readings.length - 1];
    const pressureChange = lastReading
      ? (weatherData.pressure - (lastReading.factors.barometricPressure || 0)) / 
        ((Date.now() - lastReading.timestamp) / (60 * 60 * 1000))
      : 0;

    return this.recordEnvironment({
      factors: {
        barometricPressure: weatherData.pressure,
        pressureChange,
        humidity: weatherData.humidity,
        temperature: weatherData.temperature,
        airQualityIndex: weatherData.aqi,
        uvIndex: weatherData.uvIndex,
      },
      weather: weatherData.weather,
      isManual: false,
    });
  }

  async recordManualReading(factors: Partial<EnvironmentReading['factors']>): Promise<EnvironmentReading> {
    return this.recordEnvironment({
      factors,
      weather: 'clear', // Default, user can update
      isManual: true,
    });
  }

  // ============ SENSITIVITY LEARNING ============

  async recordSymptomCorrelation(
    factor: EnvironmentFactor,
    symptom: string,
    severity: number
  ): Promise<void> {
    const profile = this.state.sensitivityProfiles.find(p => p.factor === factor);
    if (!profile) return;

    // Update symptoms triggered
    if (!profile.symptomsTrigered.includes(symptom)) {
      profile.symptomsTrigered.push(symptom);
    }

    // Update sensitivity based on severity
    if (severity >= 7) {
      profile.sensitivity = 'severe';
    } else if (severity >= 5 && profile.sensitivity !== 'severe' && profile.sensitivity !== 'extreme') {
      profile.sensitivity = 'moderate';
    }

    profile.dataPoints++;
    profile.confidence = Math.min(1, profile.dataPoints / 20);

    await this.saveProfiles();
    this.notifyListeners();
  }

  async calibrateSensitivity(
    factor: EnvironmentFactor,
    sensitivity: SensitivityLevel,
    optimalRange: { min: number; max: number }
  ): Promise<void> {
    const profile = this.state.sensitivityProfiles.find(p => p.factor === factor);
    if (!profile) return;

    profile.sensitivity = sensitivity;
    profile.optimalRange = optimalRange;
    profile.confidence = 0.8; // Manual calibration has high confidence
    this.state.learningData.lastCalibration = Date.now();

    await this.saveProfiles();
    this.notifyListeners();
  }

  // ============ ALERT SYSTEM ============

  private async checkForAlerts(): Promise<void> {
    if (!this.state.currentEnvironment) return;

    const newAlerts: EnvironmentAlert[] = [];
    const { factors } = this.state.currentEnvironment;

    // Check barometric pressure
    if (factors.barometricPressure && factors.pressureChange) {
      const pressureProfile = this.state.sensitivityProfiles.find(p => p.factor === 'barometric_pressure');
      if (pressureProfile && pressureProfile.sensitivity !== 'none') {
        // Rapid pressure drop
        if (factors.pressureChange < -2) {
          newAlerts.push(this.createAlert(
            'critical',
            'barometric_pressure',
            'Rapid Pressure Drop',
            `Barometric pressure is dropping rapidly (${Math.abs(factors.pressureChange).toFixed(1)} hPa/hr). This may trigger symptoms.`,
            this.getPressureRecommendations('dropping')
          ));
        } else if (factors.pressureChange < -1) {
          newAlerts.push(this.createAlert(
            'warning',
            'barometric_pressure',
            'Pressure Dropping',
            `Barometric pressure is falling. Prepare for potential symptom increase.`,
            this.getPressureRecommendations('dropping')
          ));
        }
        // Low pressure
        if (factors.barometricPressure < 1000) {
          newAlerts.push(this.createAlert(
            'warning',
            'barometric_pressure',
            'Low Pressure System',
            `Low atmospheric pressure (${factors.barometricPressure} hPa) may affect your symptoms.`,
            this.getPressureRecommendations('low')
          ));
        }
      }
    }

    // Check air quality
    if (factors.airQualityIndex !== undefined) {
      const aqiProfile = this.state.sensitivityProfiles.find(p => p.factor === 'air_quality');
      if (aqiProfile && aqiProfile.sensitivity !== 'none') {
        if (factors.airQualityIndex > 150) {
          newAlerts.push(this.createAlert(
            'critical',
            'air_quality',
            'Unhealthy Air Quality',
            `AQI is ${factors.airQualityIndex}. Avoid outdoor activities if possible.`,
            this.getAirQualityRecommendations('unhealthy')
          ));
        } else if (factors.airQualityIndex > 100) {
          newAlerts.push(this.createAlert(
            'warning',
            'air_quality',
            'Moderate Air Quality Concern',
            `AQI is ${factors.airQualityIndex}. Sensitive individuals may experience symptoms.`,
            this.getAirQualityRecommendations('moderate')
          ));
        }
      }
    }

    // Check temperature extremes
    if (factors.temperature !== undefined) {
      const tempProfile = this.state.sensitivityProfiles.find(p => p.factor === 'temperature');
      if (tempProfile && tempProfile.sensitivity !== 'none') {
        if (factors.temperature < tempProfile.optimalRange.min - 10) {
          newAlerts.push(this.createAlert(
            'warning',
            'temperature',
            'Cold Temperature Alert',
            `Temperature is ${factors.temperature}°C. Cold can worsen joint and muscle symptoms.`,
            this.getTemperatureRecommendations('cold')
          ));
        } else if (factors.temperature > tempProfile.optimalRange.max + 10) {
          newAlerts.push(this.createAlert(
            'warning',
            'temperature',
            'Heat Alert',
            `Temperature is ${factors.temperature}°C. Heat can increase fatigue and worsen symptoms.`,
            this.getTemperatureRecommendations('hot')
          ));
        }
      }
    }

    // Check humidity
    if (factors.humidity !== undefined) {
      const humidityProfile = this.state.sensitivityProfiles.find(p => p.factor === 'humidity');
      if (humidityProfile && humidityProfile.sensitivity !== 'none') {
        if (factors.humidity > 80) {
          newAlerts.push(this.createAlert(
            'info',
            'humidity',
            'High Humidity',
            `Humidity is ${factors.humidity}%. This may affect joint pain and breathing.`,
            []
          ));
        } else if (factors.humidity < 20) {
          newAlerts.push(this.createAlert(
            'info',
            'humidity',
            'Very Dry Conditions',
            `Humidity is ${factors.humidity}%. Stay hydrated and moisturize.`,
            []
          ));
        }
      }
    }

    // Remove old alerts and add new ones
    this.state.alerts = this.state.alerts.filter(a => 
      a.validUntil > Date.now() && !a.dismissed
    );
    
    // Don't duplicate alerts
    for (const alert of newAlerts) {
      const isDuplicate = this.state.alerts.some(a => 
        a.factor === alert.factor && a.type === alert.type
      );
      if (!isDuplicate) {
        this.state.alerts.push(alert);
      }
    }

    await this.saveState();
  }

  private createAlert(
    type: EnvironmentAlert['type'],
    factor: EnvironmentFactor,
    title: string,
    message: string,
    recommendations: EnvironmentRecommendation[]
  ): EnvironmentAlert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      factor,
      title,
      message,
      timestamp: Date.now(),
      validUntil: Date.now() + 4 * 60 * 60 * 1000, // 4 hours
      recommendations,
      dismissed: false,
    };
  }

  private getPressureRecommendations(condition: 'dropping' | 'low'): EnvironmentRecommendation[] {
    return [
      {
        id: 'hydrate',
        category: 'preparation',
        title: 'Increase Hydration',
        description: 'Drink extra water to help mitigate pressure-related symptoms',
        priority: 'high',
        timing: 'now',
        effectiveness: 0.7,
      },
      {
        id: 'medication',
        category: 'medication',
        title: 'Take Preventive Medication',
        description: 'If you have prescribed preventive medication, consider taking it now',
        priority: 'high',
        timing: 'now',
        effectiveness: 0.8,
      },
      {
        id: 'rest',
        category: 'adaptation',
        title: 'Plan for Rest',
        description: 'Clear schedule for next few hours if possible',
        priority: 'medium',
        timing: 'soon',
        effectiveness: 0.6,
      },
    ];
  }

  private getAirQualityRecommendations(level: 'moderate' | 'unhealthy'): EnvironmentRecommendation[] {
    const recs: EnvironmentRecommendation[] = [
      {
        id: 'stay-indoor',
        category: 'avoidance',
        title: 'Stay Indoors',
        description: 'Avoid outdoor activities, especially exercise',
        priority: level === 'unhealthy' ? 'urgent' : 'high',
        timing: 'now',
        effectiveness: 0.9,
      },
      {
        id: 'close-windows',
        category: 'adaptation',
        title: 'Close Windows',
        description: 'Keep windows and doors closed',
        priority: 'high',
        timing: 'now',
        effectiveness: 0.7,
      },
    ];

    if (level === 'unhealthy') {
      recs.push({
        id: 'air-purifier',
        category: 'adaptation',
        title: 'Run Air Purifier',
        description: 'If available, run an indoor air purifier',
        priority: 'high',
        timing: 'now',
        effectiveness: 0.8,
      });
    }

    return recs;
  }

  private getTemperatureRecommendations(condition: 'hot' | 'cold'): EnvironmentRecommendation[] {
    if (condition === 'hot') {
      return [
        {
          id: 'stay-cool',
          category: 'adaptation',
          title: 'Stay Cool',
          description: 'Stay in air-conditioned spaces when possible',
          priority: 'high',
          timing: 'now',
          effectiveness: 0.8,
        },
        {
          id: 'hydrate-heat',
          category: 'preparation',
          title: 'Extra Hydration',
          description: 'Drink more water than usual',
          priority: 'high',
          timing: 'now',
          effectiveness: 0.7,
        },
      ];
    } else {
      return [
        {
          id: 'layer-up',
          category: 'preparation',
          title: 'Dress Warmly',
          description: 'Wear extra layers, especially on joints',
          priority: 'high',
          timing: 'now',
          effectiveness: 0.7,
        },
        {
          id: 'warm-drinks',
          category: 'adaptation',
          title: 'Warm Beverages',
          description: 'Drink warm liquids to maintain body temperature',
          priority: 'medium',
          timing: 'soon',
          effectiveness: 0.5,
        },
      ];
    }
  }

  async dismissAlert(alertId: string): Promise<void> {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
      await this.saveState();
      this.notifyListeners();
    }
  }

  // ============ PATTERN ANALYSIS ============

  private async analyzePatterns(): Promise<void> {
    if (this.state.readings.length < 10) return;

    const patterns: EnvironmentPattern[] = [];

    for (const profile of this.state.sensitivityProfiles) {
      const pattern = this.analyzeFactorPattern(profile.factor);
      if (pattern) {
        patterns.push(pattern);
      }
    }

    this.state.patterns = patterns;
    await AsyncStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(patterns));
  }

  private analyzeFactorPattern(factor: EnvironmentFactor): EnvironmentPattern | null {
    const readings = this.state.readings;
    if (readings.length < 5) return null;

    // Get values for this factor over time
    const values: { timestamp: number; value: number }[] = [];
    
    for (const reading of readings) {
      let value: number | undefined;
      switch (factor) {
        case 'barometric_pressure':
          value = reading.factors.barometricPressure;
          break;
        case 'humidity':
          value = reading.factors.humidity;
          break;
        case 'temperature':
          value = reading.factors.temperature;
          break;
        case 'air_quality':
          value = reading.factors.airQualityIndex;
          break;
        case 'light_level':
          value = reading.factors.lightLevel;
          break;
        case 'noise_level':
          value = reading.factors.noiseLevel;
          break;
      }
      if (value !== undefined) {
        values.push({ timestamp: reading.timestamp, value });
      }
    }

    if (values.length < 5) return null;

    // Determine pattern type
    const recentValues = values.slice(-10);
    const avgRecent = recentValues.reduce((sum, v) => sum + v.value, 0) / recentValues.length;
    const olderValues = values.slice(0, -10);
    const avgOlder = olderValues.length > 0
      ? olderValues.reduce((sum, v) => sum + v.value, 0) / olderValues.length
      : avgRecent;

    let pattern: EnvironmentPattern['pattern'];
    if (avgRecent > avgOlder * 1.1) pattern = 'rising';
    else if (avgRecent < avgOlder * 0.9) pattern = 'falling';
    else pattern = 'stable';

    // Calculate variance for fluctuating
    const variance = recentValues.reduce((sum, v) => sum + Math.pow(v.value - avgRecent, 2), 0) / recentValues.length;
    if (variance > avgRecent * 0.3) pattern = 'fluctuating';

    const profile = this.state.sensitivityProfiles.find(p => p.factor === factor);

    return {
      id: `pattern-${factor}`,
      factor,
      pattern,
      correlation: profile?.confidence || 0.5,
      typicalDelay: 60, // Default 1 hour
      affectedSymptoms: profile?.symptomsTrigered || [],
    };
  }

  // ============ PREDICTIONS ============

  private async updatePredictions(): Promise<void> {
    const readings = this.state.readings.slice(-24); // Last 24 readings
    if (readings.length < 3) return;

    // Predict pressure drop
    const pressureReadings = readings
      .filter(r => r.factors.barometricPressure !== undefined)
      .map(r => ({ time: r.timestamp, value: r.factors.barometricPressure! }));

    if (pressureReadings.length >= 3) {
      const trend = this.calculateTrend(pressureReadings);
      if (trend < -0.5) { // Pressure dropping
        // Estimate when it will hit concerning level
        const currentPressure = pressureReadings[pressureReadings.length - 1].value;
        const concernLevel = 1000; // Low pressure concern
        if (currentPressure > concernLevel) {
          const hoursUntilConcern = (currentPressure - concernLevel) / Math.abs(trend);
          this.state.predictions.nextPressureDrop = Date.now() + hoursUntilConcern * 60 * 60 * 1000;
        }
      } else {
        this.state.predictions.nextPressureDrop = null;
      }
    }

    // Calculate 24h risk level
    let riskLevel = 0;
    for (const profile of this.state.sensitivityProfiles) {
      if (profile.sensitivity === 'none') continue;
      
      const currentReading = this.state.currentEnvironment;
      if (!currentReading) continue;

      let currentValue: number | undefined;
      switch (profile.factor) {
        case 'barometric_pressure':
          currentValue = currentReading.factors.barometricPressure;
          break;
        case 'humidity':
          currentValue = currentReading.factors.humidity;
          break;
        case 'temperature':
          currentValue = currentReading.factors.temperature;
          break;
        case 'air_quality':
          currentValue = currentReading.factors.airQualityIndex;
          break;
      }

      if (currentValue !== undefined) {
        const outOfRange = currentValue < profile.optimalRange.min || currentValue > profile.optimalRange.max;
        const sensitivityWeight = { none: 0, mild: 0.1, moderate: 0.2, severe: 0.3, extreme: 0.4 }[profile.sensitivity];
        if (outOfRange) {
          riskLevel += sensitivityWeight * profile.confidence;
        }
      }
    }

    this.state.predictions.riskLevel24h = Math.min(1, riskLevel);
    await this.saveState();
  }

  private calculateTrend(data: { time: number; value: number }[]): number {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = data.reduce((sum, d, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumXX = data.reduce((sum, d, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  // ============ LOCATION TRIGGERS ============

  async recordLocationTrigger(
    location: { latitude: number; longitude: number; name?: string },
    symptoms: string[],
    severity: number
  ): Promise<void> {
    // Find existing location trigger within 100 meters
    const existing = this.state.locationTriggers.find(lt => {
      const distance = this.calculateDistance(
        lt.location.latitude, lt.location.longitude,
        location.latitude, location.longitude
      );
      return distance < 100;
    });

    if (existing) {
      existing.frequency++;
      existing.severity = (existing.severity * (existing.frequency - 1) + severity) / existing.frequency;
      existing.triggers = [...new Set([...existing.triggers, ...symptoms])];
      if (existing.frequency > 3 && existing.severity > 5) {
        existing.avoidanceRecommended = true;
      }
    } else {
      this.state.locationTriggers.push({
        id: `location-${Date.now()}`,
        name: location.name || `Location at ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 100,
        },
        triggers: symptoms,
        frequency: 1,
        severity,
        avoidanceRecommended: false,
      });
    }

    await AsyncStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(this.state.locationTriggers));
    this.notifyListeners();
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // ============ ADAPTIVE UI ============

  getAdaptiveUISettings(): {
    reduceBrightness: boolean;
    reduceAnimations: boolean;
    quietMode: boolean;
    lowEnergyMode: boolean;
    darkModeRecommended: boolean;
  } {
    const current = this.state.currentEnvironment;
    const settings = this.state.adaptiveSettings;

    return {
      reduceBrightness: settings.autoAdjustBrightness && 
        (current?.factors.lightLevel || 0) < settings.darkModeThreshold,
      reduceAnimations: settings.lowEnergyMode || this.state.predictions.riskLevel24h > 0.5,
      quietMode: settings.autoAdjustVolume &&
        (current?.factors.noiseLevel || 0) > settings.quietModeThreshold,
      lowEnergyMode: settings.lowEnergyMode,
      darkModeRecommended: (current?.factors.lightLevel || Infinity) < settings.darkModeThreshold,
    };
  }

  async updateSettings(newSettings: Partial<AdaptiveSettings>): Promise<void> {
    this.state.adaptiveSettings = { ...this.state.adaptiveSettings, ...newSettings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.state.adaptiveSettings));
    this.notifyListeners();
  }

  // ============ STATE MANAGEMENT ============

  private async save(): Promise<void> {
    await Promise.all([
      this.saveState(),
      AsyncStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(this.state.readings)),
    ]);
  }

  private async saveState(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify({
      currentEnvironment: this.state.currentEnvironment,
      alerts: this.state.alerts,
      predictions: this.state.predictions,
      learningData: this.state.learningData,
    }));
  }

  private async saveProfiles(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(this.state.sensitivityProfiles));
  }

  getState(): EnvironmentAdaptationState {
    return { ...this.state };
  }

  getActiveAlerts(): EnvironmentAlert[] {
    return this.state.alerts.filter(a => !a.dismissed && a.validUntil > Date.now());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  async reset(): Promise<void> {
    this.state = {
      currentEnvironment: null,
      readings: [],
      sensitivityProfiles: [...DEFAULT_SENSITIVITY_PROFILES],
      alerts: [],
      locationTriggers: [],
      patterns: [],
      adaptiveSettings: { ...DEFAULT_SETTINGS },
      predictions: {
        nextPressureDrop: null,
        nextWeatherChange: null,
        riskLevel24h: 0,
      },
      learningData: {
        totalReadings: 0,
        correlationAccuracy: 0.5,
        lastCalibration: Date.now(),
      },
    };

    await Promise.all(Object.values(STORAGE_KEYS).map(key => AsyncStorage.removeItem(key)));
    this.notifyListeners();
  }
}

// ============ SINGLETON & HOOKS ============

export const environmentalAdaptation = new EnvironmentalAdaptationService();

export function useEnvironmentalAdaptation() {
  const [state, setState] = React.useState<EnvironmentAdaptationState>(environmentalAdaptation.getState());

  React.useEffect(() => {
    return environmentalAdaptation.subscribe(() => {
      setState(environmentalAdaptation.getState());
    });
  }, []);

  return {
    state,
    recordEnvironment: environmentalAdaptation.recordEnvironment.bind(environmentalAdaptation),
    recordFromAPI: environmentalAdaptation.recordFromWeatherAPI.bind(environmentalAdaptation),
    recordManual: environmentalAdaptation.recordManualReading.bind(environmentalAdaptation),
    recordCorrelation: environmentalAdaptation.recordSymptomCorrelation.bind(environmentalAdaptation),
    calibrateSensitivity: environmentalAdaptation.calibrateSensitivity.bind(environmentalAdaptation),
    dismissAlert: environmentalAdaptation.dismissAlert.bind(environmentalAdaptation),
    recordLocationTrigger: environmentalAdaptation.recordLocationTrigger.bind(environmentalAdaptation),
    getAdaptiveUI: environmentalAdaptation.getAdaptiveUISettings.bind(environmentalAdaptation),
    updateSettings: environmentalAdaptation.updateSettings.bind(environmentalAdaptation),
    getActiveAlerts: environmentalAdaptation.getActiveAlerts.bind(environmentalAdaptation),
    reset: environmentalAdaptation.reset.bind(environmentalAdaptation),
  };
}
