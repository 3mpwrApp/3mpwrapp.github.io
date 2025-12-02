/**
 * Circadian Rhythm DJ AI Features Tests
 * 
 * Tests for the AI sleep prediction and dream analysis features
 */


// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import { circadianRhythmDJ } from '../services/circadianRhythmDJ';

describe('CircadianRhythmDJ AI Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AI sleep stage prediction', () => {
    it('should predict sleep stages with bedtime and wake time', async () => {
      const prediction = await circadianRhythmDJ.predictSleepStages('22:00', '06:00');

      expect(prediction).toBeDefined();
      expect(prediction.stages).toBeDefined();
      expect(Array.isArray(prediction.stages)).toBe(true);
    });

    it('should include multiple sleep stages in prediction', async () => {
      const prediction = await circadianRhythmDJ.predictSleepStages('23:00', '07:00');

      expect(prediction.stages.length).toBeGreaterThan(0);
    });

    it('should return confidence score for predictions', async () => {
      const prediction = await circadianRhythmDJ.predictSleepStages('22:30', '06:30');

      expect(prediction.confidence).toBeDefined();
      expect(typeof prediction.confidence).toBe('number');
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    it('should provide optimal wake times', async () => {
      const prediction = await circadianRhythmDJ.predictSleepStages('22:00', '06:00');

      expect(prediction.optimalWakeTimes).toBeDefined();
      expect(Array.isArray(prediction.optimalWakeTimes)).toBe(true);
    });

    it('should handle late bedtimes crossing midnight', async () => {
      const prediction = await circadianRhythmDJ.predictSleepStages('01:00', '09:00');

      expect(prediction).toBeDefined();
      expect(prediction.stages).toBeDefined();
      expect(prediction.stages.length).toBeGreaterThan(0);
    });
  });

  describe('dream analysis with AI', () => {
    it('should analyze dream with description and emotions', async () => {
      const analysis = await circadianRhythmDJ.analyzeDream(
        'I was flying over mountains and could see the ocean below',
        ['joy', 'freedom', 'excitement']
      );

      expect(analysis).toBeDefined();
      expect(analysis.symbols).toBeDefined();
      expect(analysis.themes).toBeDefined();
    });

    it('should extract dream symbols', async () => {
      const analysis = await circadianRhythmDJ.analyzeDream(
        'I was being chased through a dark forest',
        ['fear', 'anxiety']
      );

      expect(analysis.symbols).toBeDefined();
      expect(Array.isArray(analysis.symbols)).toBe(true);
    });

    it('should provide emotional context', async () => {
      const analysis = await circadianRhythmDJ.analyzeDream(
        'I saw water flooding my childhood home',
        ['nostalgia', 'sadness']
      );

      expect(analysis.emotions).toBeDefined();
      expect(Array.isArray(analysis.emotions)).toBe(true);
    });

    it('should suggest potential triggers', async () => {
      const analysis = await circadianRhythmDJ.analyzeDream(
        'I was at work but forgot all my presentations',
        ['stress', 'embarrassment']
      );

      // Uses connections.toRecentEvents instead
      expect(analysis.connections).toBeDefined();
      expect(analysis.connections.toRecentEvents).toBeDefined();
    });
  });

  describe('sleep quality prediction', () => {
    it('should predict tonight\'s sleep quality', async () => {
      const prediction = await circadianRhythmDJ.predictTonightsSleepQuality();

      expect(prediction).toBeDefined();
      expect(prediction.predictedQuality).toBeDefined();
      expect(typeof prediction.predictedQuality).toBe('number');
    });

    it('should include factors affecting sleep', async () => {
      const prediction = await circadianRhythmDJ.predictTonightsSleepQuality();

      expect(prediction.factors).toBeDefined();
      expect(Array.isArray(prediction.factors)).toBe(true);
    });
  });

  describe('circadian alignment analysis', () => {
    it('should analyze circadian alignment', async () => {
      const alignment = await circadianRhythmDJ.analyzeCircadianAlignment();

      expect(alignment).toBeDefined();
      expect(alignment.score).toBeDefined();
    });

    it('should provide natural rhythm info', async () => {
      const alignment = await circadianRhythmDJ.analyzeCircadianAlignment();

      expect(alignment.naturalRhythm).toBeDefined();
      expect(alignment.naturalRhythm.optimalBedtime).toBeDefined();
    });

    it('should suggest improvements', async () => {
      const alignment = await circadianRhythmDJ.analyzeCircadianAlignment();

      expect(alignment.recommendations).toBeDefined();
      expect(Array.isArray(alignment.recommendations)).toBe(true);
    });
  });

  describe('sleep optimization plan', () => {
    it('should generate an optimization plan', async () => {
      const plan = await circadianRhythmDJ.generateOptimizationPlan();

      expect(plan).toBeDefined();
      expect(plan.weeklyGoals).toBeDefined();
      expect(plan.dailyActions).toBeDefined();
    });

    it('should include weekly goals', async () => {
      const plan = await circadianRhythmDJ.generateOptimizationPlan();

      expect(plan.weeklyGoals.targetBedtime).toBeDefined();
    });

    it('should provide milestones for improvements', async () => {
      const plan = await circadianRhythmDJ.generateOptimizationPlan();

      expect(plan.weeklyMilestones).toBeDefined();
      expect(Array.isArray(plan.weeklyMilestones)).toBe(true);
    });
  });

  describe('existing functionality', () => {
    it('should get chronotype', () => {
      const chronotype = circadianRhythmDJ.getChronotype();

      // Can be null if not yet calculated
      expect(chronotype === null || typeof chronotype === 'object').toBe(true);
    });

    it('should get sleep debt', () => {
      const debt = circadianRhythmDJ.getSleepDebt();

      // Can be null if not enough data
      expect(debt === null || typeof debt === 'object').toBe(true);
    });

    it('should calculate optimal bedtime', () => {
      const optimization = circadianRhythmDJ.calculateOptimalBedtime('07:00');

      expect(optimization).toBeDefined();
      expect(optimization.recommendedBedtime).toBeDefined();
    });

    it('should prescribe naps', () => {
      const napPrescription = circadianRhythmDJ.prescribeNap('14:00', 2);

      expect(napPrescription).toBeDefined();
      expect(napPrescription.type).toBeDefined();
      expect(['power', 'recovery', 'full_cycle']).toContain(napPrescription.type);
    });
  });
});
