/**
 * Symptom Symphony Service Tests
 * 
 * Tests for the world-first multi-modal symptom correlation AI
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

import type {
    SymptomCategory,
    SymptomSeverity} from '../services/symptomSymphony';
import {
    symptomSymphony,
} from '../services/symptomSymphony';

describe('SymptomSymphony', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await symptomSymphony.reset();
  });

  describe('initialization', () => {
    it('should initialize with default symptom definitions', async () => {
      await symptomSymphony.initialize();
      const definitions = symptomSymphony.getSymptomDefinitions();
      
      expect(definitions.length).toBeGreaterThan(0);
      expect(definitions.some(d => d.id === 'headache')).toBe(true);
      expect(definitions.some(d => d.id === 'brain-fog')).toBe(true);
      expect(definitions.some(d => d.id === 'pem')).toBe(true);
    });

    it('should start with baseline flare phase', async () => {
      await symptomSymphony.initialize();
      const state = symptomSymphony.getState();
      
      expect(state.currentFlarePhase).toBe('baseline');
      expect(state.entries).toHaveLength(0);
    });
  });

  describe('symptom logging', () => {
    it('should log a symptom with generated ID and timestamp', async () => {
      const entry = await symptomSymphony.logSymptom({
        symptomId: 'headache',
        name: 'Headache',
        category: 'pain' as SymptomCategory,
        severity: 6 as SymptomSeverity,
        qualities: ['throbbing', 'pressure'],
        location: 'temples',
        contextual: {},
      });

      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeLessThanOrEqual(Date.now());
      expect(entry.severity).toBe(6);
      
      const state = symptomSymphony.getState();
      expect(state.entries).toHaveLength(1);
      expect(state.learningData.totalEntries).toBe(1);
    });

    it('should log multiple symptoms at once', async () => {
      const entries = await symptomSymphony.logMultipleSymptoms([
        {
          symptomId: 'headache',
          name: 'Headache',
          category: 'pain' as SymptomCategory,
          severity: 5 as SymptomSeverity,
          qualities: ['throbbing'],
          contextual: {},
        },
        {
          symptomId: 'fatigue',
          name: 'Physical Fatigue',
          category: 'fatigue' as SymptomCategory,
          severity: 7 as SymptomSeverity,
          qualities: ['constant'],
          contextual: {},
        },
      ]);

      expect(entries).toHaveLength(2);
      
      const state = symptomSymphony.getState();
      expect(state.entries).toHaveLength(2);
      expect(state.learningData.totalEntries).toBe(2);
    });

    it('should include triggers and relievers', async () => {
      const entry = await symptomSymphony.logSymptom({
        symptomId: 'joint-pain',
        name: 'Joint Pain',
        category: 'pain' as SymptomCategory,
        severity: 7 as SymptomSeverity,
        qualities: ['aching'],
        location: 'knees',
        triggers: ['weather change', 'standing too long'],
        relievedBy: ['rest', 'heat pack'],
        contextual: {
          weather: { temperature: 15, humidity: 80, pressure: 1005 },
        },
      });

      expect(entry.triggers).toContain('weather change');
      expect(entry.relievedBy).toContain('rest');
      expect(entry.contextual.weather).toBeDefined();
    });
  });

  describe('custom symptoms', () => {
    it('should add a custom symptom definition', async () => {
      const customSymptom = await symptomSymphony.addCustomSymptom({
        name: 'POTS Flare',
        category: 'autonomic' as SymptomCategory,
        commonQualities: ['sudden', 'wave'],
        commonLocations: ['heart', 'head'],
        trackingFrequency: 'when_present',
      });

      expect(customSymptom.id).toContain('custom-');
      expect(customSymptom.isCustom).toBe(true);
      
      const definitions = symptomSymphony.getSymptomDefinitions();
      expect(definitions.some(d => d.name === 'POTS Flare')).toBe(true);
    });
  });

  describe('flare prediction', () => {
    it('should predict baseline with no entries', async () => {
      const prediction = await symptomSymphony.predictFlare();
      
      expect(prediction.predictedPhase).toBe('baseline');
      expect(prediction.probability).toBe(0);
      expect(prediction.confidence).toBe(0.5);
    });

    it('should increase probability with high-severity recent symptoms', async () => {
      // Log several high-severity symptoms
      for (let i = 0; i < 5; i++) {
        await symptomSymphony.logSymptom({
          symptomId: 'headache',
          name: 'Headache',
          category: 'pain' as SymptomCategory,
          severity: 8 as SymptomSeverity,
          qualities: ['throbbing'],
          contextual: {},
        });
      }

      const prediction = await symptomSymphony.predictFlare();
      
      expect(prediction.probability).toBeGreaterThan(0);
      expect(prediction.warningSymptoms.length).toBeGreaterThan(0);
      expect(prediction.recommendedActions.length).toBeGreaterThan(0);
    });

    it('should recommend actions based on flare phase', async () => {
      // Log symptoms to trigger warning phase
      for (let i = 0; i < 8; i++) {
        await symptomSymphony.logSymptom({
          symptomId: 'fatigue',
          name: 'Fatigue',
          category: 'fatigue' as SymptomCategory,
          severity: 7 as SymptomSeverity,
          qualities: ['constant'],
          contextual: {},
        });
      }

      const prediction = await symptomSymphony.predictFlare();
      
      if (prediction.predictedPhase !== 'baseline') {
        expect(prediction.recommendedActions.some(a => a.type === 'preventive' || a.type === 'management')).toBe(true);
      }
    });
  });

  describe('correlation analysis', () => {
    it('should run correlation analysis with sufficient data', async () => {
      // Log multiple symptom types
      for (let i = 0; i < 15; i++) {
        await symptomSymphony.logSymptom({
          symptomId: i % 2 === 0 ? 'headache' : 'fatigue',
          name: i % 2 === 0 ? 'Headache' : 'Fatigue',
          category: i % 2 === 0 ? 'pain' as SymptomCategory : 'fatigue' as SymptomCategory,
          severity: (5 + (i % 4)) as SymptomSeverity,
          qualities: ['constant'],
          contextual: {},
        });
      }

      const correlations = await symptomSymphony.runCorrelationAnalysis();

      // Analysis should complete without error
      expect(Array.isArray(correlations)).toBe(true);
    });
  });

  describe('flare pattern recording', () => {
    it('should record a flare pattern', async () => {
      const pattern = await symptomSymphony.recordFlarePattern(
        ['fatigue', 'brain-fog'],
        ['headache', 'pem'],
        ['overexertion', 'stress'],
        ['rest', 'hydration']
      );

      expect(pattern.id).toBeDefined();
      expect(pattern.prodromeSigns).toContain('fatigue');
      expect(pattern.peakSymptoms).toContain('headache');
      expect(pattern.knownTriggers).toContain('overexertion');
      expect(pattern.successfulInterventions).toContain('rest');
      expect(pattern.occurrences).toBe(1);
    });
  });

  describe('medical timeline export', () => {
    it('should generate a medical timeline', async () => {
      // Log some symptoms
      await symptomSymphony.logSymptom({
        symptomId: 'headache',
        name: 'Headache',
        category: 'pain' as SymptomCategory,
        severity: 6 as SymptomSeverity,
        qualities: ['throbbing'],
        triggers: ['stress'],
        contextual: {},
      });

      const startDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const endDate = Date.now();

      const timeline = await symptomSymphony.generateMedicalTimeline(startDate, endDate);

      expect(timeline.generatedAt).toBeLessThanOrEqual(Date.now());
      expect(timeline.dateRange.start).toBe(startDate);
      expect(timeline.dateRange.end).toBe(endDate);
      expect(timeline.summary).toBeDefined();
      expect(timeline.summary.totalEntries).toBeGreaterThanOrEqual(0);
      expect(timeline.entries).toBeDefined();
      expect(timeline.recommendations).toBeDefined();
    });

    it('should include symptom frequency in summary', async () => {
      // Log same symptom multiple times
      for (let i = 0; i < 5; i++) {
        await symptomSymphony.logSymptom({
          symptomId: 'joint-pain',
          name: 'Joint Pain',
          category: 'pain' as SymptomCategory,
          severity: 5 as SymptomSeverity,
          qualities: ['aching'],
          contextual: {},
        });
      }

      const timeline = await symptomSymphony.generateMedicalTimeline(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
      );

      expect(timeline.summary.mostFrequentSymptoms.length).toBeGreaterThan(0);
      expect(timeline.summary.mostFrequentSymptoms[0].name).toBe('Joint Pain');
      expect(timeline.summary.mostFrequentSymptoms[0].count).toBe(5);
    });
  });

  describe('state management', () => {
    it('should subscribe and unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = symptomSymphony.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should reset all state', async () => {
      await symptomSymphony.logSymptom({
        symptomId: 'test',
        name: 'Test',
        category: 'pain' as SymptomCategory,
        severity: 5 as SymptomSeverity,
        qualities: [],
        contextual: {},
      });

      await symptomSymphony.reset();

      const state = symptomSymphony.getState();
      expect(state.entries).toHaveLength(0);
      expect(state.correlations).toHaveLength(0);
      expect(state.flarePatterns).toHaveLength(0);
    });
  });
});
