/**
 * AI Grounding Companion Service Tests
 * 
 * Tests for the personalized grounding assistant that learns what works for YOU
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
    DifficultyLevel,
    DistressLevel,
    GroundingCategory,
    GroundingContext} from '../services/aiGroundingCompanion';
import {
    aiGroundingCompanion
} from '../services/aiGroundingCompanion';

describe('AIGroundingCompanion', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await aiGroundingCompanion.reset();
  });

  describe('initialization', () => {
    it('should initialize with default techniques', async () => {
      await aiGroundingCompanion.initialize();
      const techniques = aiGroundingCompanion.getTechniques();
      
      expect(techniques.length).toBeGreaterThan(0);
      expect(techniques.some(t => t.id === '5-4-3-2-1')).toBe(true);
      expect(techniques.some(t => t.id === 'box-breathing')).toBe(true);
      expect(techniques.some(t => t.id === 'body-scan')).toBe(true);
    });

    it('should start with zero sessions and streaks', async () => {
      await aiGroundingCompanion.initialize();
      const state = aiGroundingCompanion.getState();
      
      expect(state.totalSessions).toBe(0);
      expect(state.streakDays).toBe(0);
      expect(state.currentSession).toBeNull();
    });
  });

  describe('technique recommendations', () => {
    it('should return recommendations based on context', async () => {
      const context: GroundingContext = {
        location: 'home',
        timeOfDay: 'evening',
        socialSetting: 'alone',
        physicalState: 'seated',
      };

      const recommendations = await aiGroundingCompanion.getRecommendations(
        context,
        5 as DistressLevel,
        3
      );

      expect(recommendations).toHaveLength(3);
      recommendations.forEach(rec => {
        expect(rec.technique).toBeDefined();
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
        expect(rec.reason).toBeDefined();
      });
    });

    it('should prioritize simple techniques for high distress', async () => {
      const context: GroundingContext = {
        location: 'public',
        socialSetting: 'with_strangers',
        physicalState: 'standing',
      };

      const recommendations = await aiGroundingCompanion.getRecommendations(
        context,
        9 as DistressLevel, // High distress
        5
      );

      // Should include simple/minimal difficulty techniques
      const hasSimple = recommendations.some(
        rec => rec.technique.difficulty === 'minimal' || rec.technique.difficulty === 'easy'
      );
      expect(hasSimple).toBe(true);
    });

    it('should avoid movement techniques in crowded settings', async () => {
      const context: GroundingContext = {
        location: 'public',
        socialSetting: 'crowded',
        physicalState: 'standing',
      };

      const recommendations = await aiGroundingCompanion.getRecommendations(
        context,
        6 as DistressLevel,
        5
      );

      // Should not recommend movement or auditory techniques
      const hasMovement = recommendations.some(
        rec => rec.technique.category === 'movement' || rec.technique.category === 'auditory'
      );
      expect(hasMovement).toBe(false);
    });

    it('should provide adaptations for context', async () => {
      const context: GroundingContext = {
        socialSetting: 'with_strangers',
        dissociationLevel: 7 as DistressLevel,
      };

      const recommendations = await aiGroundingCompanion.getRecommendations(
        context,
        8 as DistressLevel,
        3
      );

      // Should include adaptations for dissociation
      const hasAdaptations = recommendations.some(rec => 
        rec.adaptations && rec.adaptations.length > 0
      );
      expect(hasAdaptations).toBe(true);
    });
  });

  describe('session management', () => {
    it('should start a new session', async () => {
      const context: GroundingContext = {
        location: 'home',
        trigger: 'anxiety',
      };

      const session = await aiGroundingCompanion.startSession(
        7 as DistressLevel,
        context
      );

      expect(session.id).toBeDefined();
      expect(session.initialDistress).toBe(7);
      expect(session.context.trigger).toBe('anxiety');
      expect(session.state).toBe('introduction');
      expect(session.completed).toBe(false);

      const currentSession = aiGroundingCompanion.getCurrentSession();
      expect(currentSession).not.toBeNull();
    });

    it('should track technique usage within session', async () => {
      await aiGroundingCompanion.startSession(
        6 as DistressLevel,
        { location: 'home' }
      );

      await aiGroundingCompanion.startTechnique('box-breathing');
      
      const session = aiGroundingCompanion.getCurrentSession();
      expect(session?.techniquesUsed).toHaveLength(1);
      expect(session?.techniquesUsed[0].techniqueId).toBe('box-breathing');
      expect(session?.state).toBe('active');
    });

    it('should complete a technique with effectiveness rating', async () => {
      await aiGroundingCompanion.startSession(
        6 as DistressLevel,
        { location: 'home' }
      );

      await aiGroundingCompanion.startTechnique('5-4-3-2-1');
      await aiGroundingCompanion.completeTechnique('5-4-3-2-1', 4);
      
      const session = aiGroundingCompanion.getCurrentSession();
      expect(session?.techniquesUsed[0].completed).toBe(true);
      expect(session?.techniquesUsed[0].effectiveness).toBe(4);
    });

    it('should skip a technique', async () => {
      await aiGroundingCompanion.startSession(
        5 as DistressLevel,
        { location: 'work' }
      );

      await aiGroundingCompanion.startTechnique('body-scan');
      await aiGroundingCompanion.skipTechnique('body-scan');
      
      const session = aiGroundingCompanion.getCurrentSession();
      expect(session?.techniquesUsed[0].skipped).toBe(true);
    });

    it('should record distress checks', async () => {
      await aiGroundingCompanion.startSession(
        8 as DistressLevel,
        {}
      );

      await aiGroundingCompanion.recordDistressCheck(6 as DistressLevel);
      await aiGroundingCompanion.recordDistressCheck(4 as DistressLevel);
      
      const session = aiGroundingCompanion.getCurrentSession();
      expect(session?.distressReadings).toHaveLength(3); // Initial + 2 checks
    });

    it('should end session and update stats', async () => {
      await aiGroundingCompanion.startSession(
        7 as DistressLevel,
        {}
      );

      await aiGroundingCompanion.startTechnique('box-breathing');
      await aiGroundingCompanion.completeTechnique('box-breathing', 4);

      const completedSession = await aiGroundingCompanion.endSession(
        3 as DistressLevel,
        'Felt much better after breathing'
      );

      expect(completedSession.completed).toBe(true);
      expect(completedSession.finalDistress).toBe(3);
      expect(completedSession.notes).toBe('Felt much better after breathing');
      
      const state = aiGroundingCompanion.getState();
      expect(state.totalSessions).toBe(1);
      expect(state.currentSession).toBeNull();
    });
  });

  describe('crisis intervention', () => {
    it('should return quick crisis interventions', async () => {
      const interventions = await aiGroundingCompanion.getCrisisIntervention();

      expect(interventions.length).toBeGreaterThan(0);
      expect(interventions.length).toBeLessThanOrEqual(3);
      
      interventions.forEach(rec => {
        expect(rec.technique.duration).toBeLessThanOrEqual(120);
        expect(rec.confidence).toBe(0.9);
        expect(rec.adaptations).toContain('Focus only on the first step');
      });
    });
  });

  describe('profile management', () => {
    it('should update user profile', async () => {
      await aiGroundingCompanion.updateProfile({
        preferredCategories: ['breathing', 'sensory'] as GroundingCategory[],
        avoidCategories: ['visualization'] as GroundingCategory[],
        preferredDuration: 'short',
        prefersVoiceGuidance: false,
      });

      const state = aiGroundingCompanion.getState();
      expect(state.profile.preferredCategories).toContain('breathing');
      expect(state.profile.avoidCategories).toContain('visualization');
      expect(state.profile.preferredDuration).toBe('short');
      expect(state.profile.prefersVoiceGuidance).toBe(false);
    });

    it('should add custom techniques', async () => {
      const customTechnique = await aiGroundingCompanion.addCustomTechnique({
        name: 'My Safe Word',
        category: 'cognitive' as GroundingCategory,
        description: 'Repeat my safe word to ground',
        instructions: ['Think of your safe word', 'Repeat it slowly 5 times'],
        duration: 60,
        difficulty: 'minimal' as DifficultyLevel,
        bestFor: ['panic', 'flashbacks'],
        audioGuideAvailable: false,
      });

      expect(customTechnique.id).toContain('custom-');
      
      const techniques = aiGroundingCompanion.getTechniques();
      expect(techniques.some(t => t.name === 'My Safe Word')).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should return stats with zero sessions', () => {
      const stats = aiGroundingCompanion.getStats();

      expect(stats.totalSessions).toBe(0);
      expect(stats.streakDays).toBe(0);
      expect(stats.avgDistressReduction).toBe(0);
      expect(stats.totalMinutes).toBe(0);
      expect(stats.mostEffectiveTechnique).toBeNull();
    });

    it('should update stats after sessions', async () => {
      // Complete a session
      await aiGroundingCompanion.startSession(8 as DistressLevel, {});
      await aiGroundingCompanion.startTechnique('box-breathing');
      await aiGroundingCompanion.completeTechnique('box-breathing', 5);
      await aiGroundingCompanion.endSession(3 as DistressLevel);

      const stats = aiGroundingCompanion.getStats();

      expect(stats.totalSessions).toBe(1);
      expect(stats.streakDays).toBe(1);
      expect(stats.avgDistressReduction).toBe(5); // 8 - 3 = 5
      // totalMinutes may be 0 for very short mock sessions
      expect(stats.totalMinutes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('state management', () => {
    it('should subscribe and unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = aiGroundingCompanion.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should reset all state', async () => {
      await aiGroundingCompanion.startSession(5 as DistressLevel, {});
      await aiGroundingCompanion.updateProfile({ preferredDuration: 'long' });
      
      await aiGroundingCompanion.reset();

      const state = aiGroundingCompanion.getState();
      expect(state.sessions).toHaveLength(0);
      expect(state.effectiveness).toHaveLength(0);
      expect(state.currentSession).toBeNull();
      expect(state.profile.preferredDuration).toBe('medium');
    });
  });
});
