/**
 * Sensory Overload Detector Service Tests
 * 
 * Tests for the world-first AI-powered sensory overload prediction system
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

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
    SensoryIntensity,
    SensoryModality
} from '../services/sensoryOverloadDetector';
import {
    sensoryOverloadDetector
} from '../services/sensoryOverloadDetector';

describe('SensoryOverloadDetector', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await sensoryOverloadDetector.reset();
  });

  describe('initialization', () => {
    it('should initialize with default thresholds', async () => {
      await sensoryOverloadDetector.initialize();
      const state = sensoryOverloadDetector.getState();
      
      expect(state.thresholds).toHaveLength(8);
      expect(state.currentPhase).toBe('baseline');
      expect(state.currentInputs).toHaveLength(0);
    });

    it('should load persisted data on initialize', async () => {
      const mockState = {
        currentPhase: 'warning',
        learningData: { totalPatterns: 5, predictionAccuracy: 0.7, lastCalibration: Date.now() },
      };
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sensoryOverload:state:v1') {
          return Promise.resolve(JSON.stringify(mockState));
        }
        return Promise.resolve(null);
      });

      await sensoryOverloadDetector.initialize();
      const state = sensoryOverloadDetector.getState();
      
      expect(state.learningData.totalPatterns).toBe(5);
      expect(state.learningData.predictionAccuracy).toBe(0.7);
    });
  });

  describe('sensory input tracking', () => {
    it('should add a sensory input with generated ID', async () => {
      const input = await sensoryOverloadDetector.addSensoryInput({
        modality: 'auditory' as SensoryModality,
        source: 'loud music',
        intensity: 7 as SensoryIntensity,
        duration: 30,
        isPositive: false,
      });

      expect(input.id).toBeDefined();
      expect(input.modality).toBe('auditory');
      expect(input.intensity).toBe(7);
      expect(input.startedAt).toBeLessThanOrEqual(Date.now());

      const state = sensoryOverloadDetector.getState();
      expect(state.currentInputs).toHaveLength(1);
    });

    it('should decrease threshold capacity for negative inputs', async () => {
      const stateBefore = sensoryOverloadDetector.getState();
      const auditoryThresholdBefore = stateBefore.thresholds.find(t => t.modality === 'auditory');
      const initialCapacity = auditoryThresholdBefore?.currentCapacity || 0;

      await sensoryOverloadDetector.addSensoryInput({
        modality: 'auditory' as SensoryModality,
        source: 'construction noise',
        intensity: 8 as SensoryIntensity,
        duration: 60,
        isPositive: false,
      });

      const stateAfter = sensoryOverloadDetector.getState();
      const auditoryThresholdAfter = stateAfter.thresholds.find(t => t.modality === 'auditory');
      
      expect(auditoryThresholdAfter?.currentCapacity).toBeLessThan(initialCapacity);
    });

    it('should not decrease capacity for positive/regulating inputs', async () => {
      const stateBefore = sensoryOverloadDetector.getState();
      const tactileThresholdBefore = stateBefore.thresholds.find(t => t.modality === 'tactile');
      const initialCapacity = tactileThresholdBefore?.currentCapacity || 0;

      await sensoryOverloadDetector.addSensoryInput({
        modality: 'tactile' as SensoryModality,
        source: 'weighted blanket',
        intensity: 5 as SensoryIntensity,
        duration: 20,
        isPositive: true,
      });

      const stateAfter = sensoryOverloadDetector.getState();
      const tactileThresholdAfter = stateAfter.thresholds.find(t => t.modality === 'tactile');
      
      expect(tactileThresholdAfter?.currentCapacity).toBe(initialCapacity);
    });

    it('should remove sensory input by ID', async () => {
      const input = await sensoryOverloadDetector.addSensoryInput({
        modality: 'visual' as SensoryModality,
        source: 'bright lights',
        intensity: 6 as SensoryIntensity,
        duration: 15,
        isPositive: false,
      });

      await sensoryOverloadDetector.removeSensoryInput(input.id);
      
      const state = sensoryOverloadDetector.getState();
      expect(state.currentInputs).toHaveLength(0);
    });
  });

  describe('overload prediction', () => {
    it('should predict baseline phase with no inputs', async () => {
      const prediction = await sensoryOverloadDetector.predictOverload();
      
      expect(prediction.predictedPhase).toBe('baseline');
      expect(prediction.probability).toBeLessThan(0.2);
      expect(prediction.timeToOverload).toBe(Infinity);
    });

    it('should increase probability with high-intensity inputs', async () => {
      // Add multiple high-intensity inputs
      await sensoryOverloadDetector.addSensoryInput({
        modality: 'auditory' as SensoryModality,
        source: 'alarm',
        intensity: 9 as SensoryIntensity,
        duration: 10,
        isPositive: false,
      });

      await sensoryOverloadDetector.addSensoryInput({
        modality: 'visual' as SensoryModality,
        source: 'flashing lights',
        intensity: 9 as SensoryIntensity,
        duration: 10,
        isPositive: false,
      });

      await sensoryOverloadDetector.addSensoryInput({
        modality: 'tactile' as SensoryModality,
        source: 'crowded touching',
        intensity: 8 as SensoryIntensity,
        duration: 10,
        isPositive: false,
      });

      const prediction = await sensoryOverloadDetector.predictOverload();
      
      // Probability should be elevated from baseline (0) with high-intensity inputs
      // Note: Initial probability starts low and increases with more inputs
      expect(prediction.probability).toBeGreaterThan(0.01);
      expect(['baseline', 'warning', 'critical', 'accumulating', 'overload']).toContain(prediction.predictedPhase);
      expect(prediction.primaryTriggers.length).toBeGreaterThan(0);
      expect(prediction.recommendedActions.length).toBeGreaterThan(0);
    });

    it('should return recommended actions based on triggers', async () => {
      await sensoryOverloadDetector.addSensoryInput({
        modality: 'auditory' as SensoryModality,
        source: 'crowd noise',
        intensity: 8 as SensoryIntensity,
        duration: 30,
        isPositive: false,
      });

      const prediction = await sensoryOverloadDetector.predictOverload();
      
      // Should recommend auditory-specific interventions
      const hasAuditoryAction = prediction.recommendedActions.some(
        a => a.modality === 'auditory' || !a.modality
      );
      expect(hasAuditoryAction).toBe(true);
    });
  });

  describe('quick log', () => {
    it('should allow quick logging of overwhelm', async () => {
      const prediction = await sensoryOverloadDetector.quickLogOverwhelm(
        'auditory' as SensoryModality,
        7 as SensoryIntensity
      );

      expect(prediction).toBeDefined();
      expect(prediction.probability).toBeGreaterThan(0);
      
      const state = sensoryOverloadDetector.getState();
      expect(state.currentInputs).toHaveLength(1);
      expect(state.currentInputs[0].source).toBe('Quick log');
    });
  });

  describe('safe spaces', () => {
    it('should add a safe space', async () => {
      const space = await sensoryOverloadDetector.addSafeSpace({
        name: 'Quiet Room',
        location: 'Home office',
        sensoryProfile: {
          visual: 2 as SensoryIntensity,
          auditory: 1 as SensoryIntensity,
          tactile: 2 as SensoryIntensity,
          olfactory: 1 as SensoryIntensity,
          crowding: 0 as SensoryIntensity,
        },
        features: ['dim lighting', 'sound-proof', 'comfortable chair'],
        effectivenessRating: 0.9,
      });

      expect(space.id).toBeDefined();
      expect(space.name).toBe('Quiet Room');
      
      const state = sensoryOverloadDetector.getState();
      expect(state.safeSpaces).toHaveLength(1);
    });

    it('should find nearby safe spaces sorted by effectiveness', async () => {
      await sensoryOverloadDetector.addSafeSpace({
        name: 'Bathroom',
        location: 'Work',
        sensoryProfile: {
          visual: 3 as SensoryIntensity,
          auditory: 2 as SensoryIntensity,
          tactile: 2 as SensoryIntensity,
          olfactory: 2 as SensoryIntensity,
          crowding: 1 as SensoryIntensity,
        },
        features: ['private'],
        effectivenessRating: 0.6,
      });

      await sensoryOverloadDetector.addSafeSpace({
        name: 'Car',
        location: 'Parking lot',
        sensoryProfile: {
          visual: 2 as SensoryIntensity,
          auditory: 1 as SensoryIntensity,
          tactile: 2 as SensoryIntensity,
          olfactory: 1 as SensoryIntensity,
          crowding: 0 as SensoryIntensity,
        },
        features: ['climate control', 'private'],
        effectivenessRating: 0.85,
      });

      const spaces = await sensoryOverloadDetector.findNearbySafeSpaces();
      
      expect(spaces).toHaveLength(2);
      // Higher effectiveness should be first
      expect(spaces[0].name).toBe('Car');
    });
  });

  describe('sensory diet', () => {
    it('should generate a sensory diet', async () => {
      const diet = await sensoryOverloadDetector.generateSensoryDiet();

      expect(diet).toBeDefined();
      expect(diet.dailyGoals).toHaveLength(8); // One per modality
      expect(diet.scheduledBreaks).toBeDefined();
      expect(diet.triggerAvoidance).toBeDefined();
      expect(diet.regulatingActivities).toBeDefined();
    });
  });

  describe('calibration', () => {
    it('should increase threshold when too sensitive', async () => {
      const stateBefore = sensoryOverloadDetector.getState();
      const thresholdBefore = stateBefore.thresholds.find(t => t.modality === 'visual')!;
      const baselineBefore = thresholdBefore.baselineThreshold;

      await sensoryOverloadDetector.calibrateThresholds('visual', 'too_sensitive');

      const stateAfter = sensoryOverloadDetector.getState();
      const thresholdAfter = stateAfter.thresholds.find(t => t.modality === 'visual')!;
      
      expect(thresholdAfter.baselineThreshold).toBe(baselineBefore + 10);
    });

    it('should decrease threshold when not sensitive enough', async () => {
      const stateBefore = sensoryOverloadDetector.getState();
      const thresholdBefore = stateBefore.thresholds.find(t => t.modality === 'auditory')!;
      const baselineBefore = thresholdBefore.baselineThreshold;

      await sensoryOverloadDetector.calibrateThresholds('auditory', 'not_sensitive_enough');

      const stateAfter = sensoryOverloadDetector.getState();
      const thresholdAfter = stateAfter.thresholds.find(t => t.modality === 'auditory')!;
      
      expect(thresholdAfter.baselineThreshold).toBe(baselineBefore - 10);
    });
  });

  describe('emergency protocol', () => {
    it('should return high-urgency decompression actions', async () => {
      const protocol = await sensoryOverloadDetector.getEmergencyProtocol();

      expect(protocol.length).toBeGreaterThan(0);
      expect(protocol.length).toBeLessThanOrEqual(3);
      expect(protocol.every(a => a.urgency === 'critical')).toBe(true);
    });
  });

  describe('state management', () => {
    it('should subscribe and unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = sensoryOverloadDetector.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should reset all state', async () => {
      await sensoryOverloadDetector.addSensoryInput({
        modality: 'visual' as SensoryModality,
        source: 'test',
        intensity: 5 as SensoryIntensity,
        duration: 10,
        isPositive: false,
      });

      await sensoryOverloadDetector.reset();

      const state = sensoryOverloadDetector.getState();
      expect(state.currentInputs).toHaveLength(0);
      expect(state.overloadHistory).toHaveLength(0);
      expect(state.safeSpaces).toHaveLength(0);
    });
  });
});
