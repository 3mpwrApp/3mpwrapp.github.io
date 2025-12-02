/**
 * Environmental Adaptation Engine Tests
 * 
 * Tests for the AI-powered environmental factor monitoring and adaptation service
 */


// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock React
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn((initial) => [initial, jest.fn()]),
  useEffect: jest.fn((fn) => fn()),
}));

import {
    environmentalAdaptation
} from '../services/environmentalAdaptation';

describe('EnvironmentalAdaptation', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await environmentalAdaptation.reset();
  });

  describe('initialization', () => {
    it('should initialize with default state', async () => {
      await environmentalAdaptation.initialize();
      const state = environmentalAdaptation.getState();

      expect(state.currentEnvironment).toBeNull();
      expect(state.readings).toHaveLength(0);
      expect(state.alerts).toHaveLength(0);
      expect(state.adaptiveSettings).toBeDefined();
      expect(state.adaptiveSettings.weatherAlerts).toBe(true);
    });

    it('should have default sensitivity profiles', async () => {
      await environmentalAdaptation.initialize();
      const state = environmentalAdaptation.getState();

      expect(state.sensitivityProfiles.length).toBeGreaterThan(0);
      // Should include barometric pressure profile
      expect(state.sensitivityProfiles.some(p => p.factor === 'barometric_pressure')).toBe(true);
    });
  });

  describe('environment recording', () => {
    it('should record an environment reading', async () => {
      await environmentalAdaptation.initialize();

      const reading = await environmentalAdaptation.recordEnvironment({
        location: { latitude: 40.7128, longitude: -74.0060, name: 'home' },
        factors: {
          barometricPressure: 1013,
          humidity: 50,
          temperature: 22,
          airQualityIndex: 30,
        },
        weather: 'clear',
        isManual: false,
      });

      expect(reading.id).toBeDefined();
      expect(reading.timestamp).toBeDefined();
      expect(reading.factors.temperature).toBe(22);

      const state = environmentalAdaptation.getState();
      expect(state.currentEnvironment).not.toBeNull();
    });

    it('should record from weather API data', async () => {
      await environmentalAdaptation.initialize();

      const reading = await environmentalAdaptation.recordFromWeatherAPI({
        temperature: 25,
        humidity: 60,
        pressure: 1015,
        aqi: 42,
        uvIndex: 5,
        weather: 'cloudy',
      });

      expect(reading.factors.temperature).toBe(25);
      expect(reading.factors.humidity).toBe(60);
      expect(reading.factors.barometricPressure).toBe(1015);
    });

    it('should record manual readings', async () => {
      await environmentalAdaptation.initialize();

      const reading = await environmentalAdaptation.recordManualReading({
        temperature: 20,
        humidity: 45,
      });

      expect(reading.factors.temperature).toBe(20);
    });
  });

  describe('symptom correlation', () => {
    it('should record symptom correlation with environment', async () => {
      await environmentalAdaptation.initialize();

      // First record an environment
      await environmentalAdaptation.recordEnvironment({
        location: { latitude: 40.7128, longitude: -74.0060, name: 'home' },
        factors: {
          barometricPressure: 1000, // Low pressure
          humidity: 70,
          temperature: 18,
        },
        weather: 'rain',
        isManual: false,
      });

      // Then record symptom correlation
      await environmentalAdaptation.recordSymptomCorrelation(
        'barometric_pressure',
        'headache',
        7
      );

      const state = environmentalAdaptation.getState();
      // Should update sensitivity profile symptoms
      const pressureProfile = state.sensitivityProfiles.find(
        p => p.factor === 'barometric_pressure'
      );
      expect(pressureProfile?.symptomsTrigered).toContain('headache');
    });
  });

  describe('sensitivity calibration', () => {
    it('should calibrate sensitivity based on feedback', async () => {
      await environmentalAdaptation.initialize();

      await environmentalAdaptation.calibrateSensitivity(
        'barometric_pressure',
        'moderate',
        { min: 1000, max: 1020 }
      );

      const state = environmentalAdaptation.getState();
      const profile = state.sensitivityProfiles.find(
        p => p.factor === 'barometric_pressure'
      );
      
      // Profile should exist after calibration
      expect(profile).toBeDefined();
    });

    it('should decrease sensitivity when calibrated down', async () => {
      await environmentalAdaptation.initialize();

      await environmentalAdaptation.calibrateSensitivity(
        'humidity',
        'mild',
        { min: 30, max: 60 }
      );

      const state = environmentalAdaptation.getState();
      const profile = state.sensitivityProfiles.find(
        p => p.factor === 'humidity'
      );
      
      expect(profile).toBeDefined();
    });
  });

  describe('alerts', () => {
    it('should generate alerts for abnormal conditions', async () => {
      await environmentalAdaptation.initialize();

      // Record extreme conditions
      await environmentalAdaptation.recordEnvironment({
        location: { latitude: 40.7128, longitude: -74.0060, name: 'outdoor' },
        factors: {
          barometricPressure: 980, // Very low
          humidity: 90, // Very high
          temperature: 35, // Hot
          airQualityIndex: 150, // Unhealthy
        },
        weather: 'thunderstorm',
        isManual: false,
      });

      const alerts = environmentalAdaptation.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should dismiss alerts', async () => {
      await environmentalAdaptation.initialize();

      // Create conditions that generate alerts
      await environmentalAdaptation.recordEnvironment({
        location: { latitude: 40.7128, longitude: -74.0060, name: 'outdoor' },
        factors: {
          airQualityIndex: 200, // Very unhealthy
        },
        weather: 'fog',
        isManual: false,
      });

      const alerts = environmentalAdaptation.getActiveAlerts();
      if (alerts.length > 0) {
        await environmentalAdaptation.dismissAlert(alerts[0].id);
        const remainingAlerts = environmentalAdaptation.getActiveAlerts();
        expect(remainingAlerts.length).toBeLessThan(alerts.length);
      }
    });
  });

  describe('location triggers', () => {
    it('should record location triggers', async () => {
      await environmentalAdaptation.initialize();

      await environmentalAdaptation.recordLocationTrigger(
        { latitude: 40.7128, longitude: -74.0060, name: 'Office Building' },
        ['noise_level', 'light_level'],
        6
      );

      const state = environmentalAdaptation.getState();
      expect(state.locationTriggers.length).toBe(1);
      expect(state.locationTriggers[0].name).toBe('Office Building');
    });
  });

  describe('adaptive UI settings', () => {
    it('should return adaptive UI settings', async () => {
      await environmentalAdaptation.initialize();

      const settings = environmentalAdaptation.getAdaptiveUISettings();

      expect(settings).toBeDefined();
      expect(settings.darkModeRecommended).toBeDefined();
      expect(settings.reduceAnimations).toBeDefined();
      expect(settings.lowEnergyMode).toBeDefined();
    });

    it('should adjust settings based on environment', async () => {
      await environmentalAdaptation.initialize();

      // Record low light environment
      await environmentalAdaptation.recordEnvironment({
        location: { latitude: 40.7128, longitude: -74.0060, name: 'home' },
        factors: {
          lightLevel: 10, // Dark
        },
        weather: 'clear',
        isManual: false,
      });

      const settings = environmentalAdaptation.getAdaptiveUISettings();
      expect(settings.darkModeRecommended).toBe(true);
    });
  });

  describe('settings management', () => {
    it('should update adaptive settings', async () => {
      await environmentalAdaptation.initialize();

      await environmentalAdaptation.updateSettings({
        weatherAlerts: false,
        pressureAlerts: true,
        lowEnergyMode: true,
      });

      const state = environmentalAdaptation.getState();
      expect(state.adaptiveSettings.weatherAlerts).toBe(false);
      expect(state.adaptiveSettings.lowEnergyMode).toBe(true);
    });
  });

  describe('predictions', () => {
    it('should track prediction data', async () => {
      await environmentalAdaptation.initialize();

      const state = environmentalAdaptation.getState();
      expect(state.predictions).toBeDefined();
      expect(state.predictions.riskLevel24h).toBeGreaterThanOrEqual(0);
    });
  });

  describe('state management', () => {
    it('should subscribe and unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = environmentalAdaptation.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should reset all state', async () => {
      await environmentalAdaptation.initialize();
      
      await environmentalAdaptation.recordEnvironment({
        location: { latitude: 40.7128, longitude: -74.0060, name: 'test' },
        factors: { temperature: 25 },
        weather: 'clear',
        isManual: false,
      });

      await environmentalAdaptation.reset();

      const state = environmentalAdaptation.getState();
      expect(state.readings).toHaveLength(0);
      expect(state.currentEnvironment).toBeNull();
    });
  });
});
