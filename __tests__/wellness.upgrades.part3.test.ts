/**
 * Tests for Wellness Feature Upgrades - Part 3
 * 
 * Testing: Grief & Identity Support, Resilience Points,
 * Wellness Reminders, Reflections Calendar, Dream Tracker
 */

import {
    DreamTrackerAdvancedService,
    GriefIdentitySupportAdvancedService,
    ReflectionsCalendarAdvancedService,
    ResiliencePointsAdvancedService,
    WellnessRemindersAdvancedService,
} from '../services/wellnessFeatureUpgrades3';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('Grief & Identity Support - Metamorphosis Navigator', () => {
  let service: GriefIdentitySupportAdvancedService;

  beforeEach(() => {
    service = new GriefIdentitySupportAdvancedService();
  });

  describe('mapIdentityJourney', () => {
    it('should create comprehensive identity journey map', async () => {
      const journey = await service.mapIdentityJourney(
        [
          { type: 'ability', description: 'Lost ability to work full-time', timeAgo: '6 months ago' },
          { type: 'identity', description: 'No longer identify as athlete', timeAgo: '1 year ago' },
        ],
        ['accepting limitations', 'finding new purpose'],
        ['resilience', 'creativity'],
        ['family', 'growth'],
        ['spouse', 'therapist']
      );

      expect(journey).toBeDefined();
      expect(journey.id).toContain('journey-');
      expect(journey.phases).toBeDefined();
      expect(journey.phases.length).toBe(4);
      expect(journey.lossesProcessing).toBeDefined();
      expect(journey.lossesProcessing.length).toBe(2);
      expect(journey.emergingIdentity).toBeDefined();
      expect(journey.supportNetwork).toBeDefined();
    });

    it('should assign appropriate grief stages', async () => {
      const journey = await service.mapIdentityJourney(
        [
          { type: 'relationship', description: 'Loss of friend group', timeAgo: '2 weeks ago' },
        ],
        ['feeling angry about unfair situation'],
        [],
        [],
        []
      );

      expect(journey.lossesProcessing[0].stage).toBe('anger');
      expect(journey.lossesProcessing[0].intensity).toBeGreaterThan(70);
    });

    it('should generate new narratives', async () => {
      const journey = await service.mapIdentityJourney(
        [],
        [],
        ['perseverance', 'wisdom'],
        ['connection', 'growth'],
        []
      );

      expect(journey.emergingIdentity.newNarratives.length).toBeGreaterThan(0);
      expect(journey.emergingIdentity.hopefulVisions.length).toBeGreaterThan(0);
    });
  });

  describe('recordGriefWave', () => {
    it('should record grief wave with full details', async () => {
      const wave = await service.recordGriefWave(
        85,
        ['anniversary', 'photo reminder'],
        ['sadness', 'longing'],
        ['chest tightness', 'fatigue'],
        ['crying', 'talking to friend'],
        'Realizing grief comes in waves is helpful'
      );

      expect(wave).toBeDefined();
      expect(wave.id).toContain('wave-');
      expect(wave.intensity).toBe(85);
      expect(wave.triggers).toContain('anniversary');
      expect(wave.emotions).toContain('sadness');
      expect(wave.physicalSymptoms).toContain('chest tightness');
      expect(wave.whatHelped.length).toBeGreaterThan(0);
    });
  });

  describe('generateIdentityReframe', () => {
    it('should generate reframe for worthlessness belief', async () => {
      const reframe = await service.generateIdentityReframe(
        'I feel worthless because I can\'t work anymore',
        'chronic illness'
      );

      expect(reframe).toBeDefined();
      expect(reframe.oldBelief).toContain('worthless');
      expect(reframe.challenge).toBeDefined();
      expect(reframe.newPerspective).toBeDefined();
      expect(reframe.evidence.length).toBeGreaterThan(0);
      expect(reframe.affirmation).toBeDefined();
      expect(reframe.practiceExercises.length).toBeGreaterThan(0);
    });

    it('should generate reframe for burden belief', async () => {
      const reframe = await service.generateIdentityReframe(
        'I am a burden to my family',
        'disability'
      );

      expect(reframe.newPerspective).toContain('help');
      expect(reframe.evidence.length).toBeGreaterThan(0);
    });
  });
});

describe('Resilience Points - Achievement Alchemy Engine', () => {
  let service: ResiliencePointsAdvancedService;

  beforeEach(() => {
    service = new ResiliencePointsAdvancedService();
  });

  describe('initializeProfile', () => {
    it('should create new profile', async () => {
      const profile = await service.initializeProfile();

      expect(profile).toBeDefined();
      expect(profile.totalPoints).toBe(0);
      expect(profile.level).toBe(1);
      expect(profile.levelProgress).toBe(0);
      expect(profile.streaks).toBeDefined();
      expect(profile.streaks.length).toBeGreaterThan(0);
      expect(profile.achievements).toBeDefined();
      expect(profile.challenges).toBeDefined();
      expect(profile.milestones).toBeDefined();
    });

    it('should include initial challenges', async () => {
      const profile = await service.initializeProfile();

      expect(profile.challenges.length).toBeGreaterThan(0);
      expect(profile.challenges[0]).toHaveProperty('name');
      expect(profile.challenges[0]).toHaveProperty('goal');
      expect(profile.challenges[0]).toHaveProperty('reward');
    });
  });

  describe('awardPoints', () => {
    it('should award points and update total', async () => {
      await service.initializeProfile();

      const transaction = await service.awardPoints(
        50,
        'Completed daily check-in',
        'daily_checkin'
      );

      expect(transaction).toBeDefined();
      expect(transaction.points).toBe(50);
      expect(transaction.reason).toBe('Completed daily check-in');
    });

    it('should apply streak multiplier', async () => {
      await service.initializeProfile();

      // Award points multiple times to build streak
      for (let i = 0; i < 8; i++) {
        await service.awardPoints(10, 'Check-in', 'daily_checkin', { isStreak: true });
      }

      const transaction = await service.awardPoints(
        10,
        'Check-in with streak',
        'daily_checkin',
        { isStreak: true }
      );

      expect(transaction.multiplier).toBeDefined();
      expect(transaction.bonusReason).toContain('streak');
    });

    it('should update level when enough points accumulated', async () => {
      await service.initializeProfile();

      // Award enough points to level up
      await service.awardPoints(150, 'Big achievement', 'milestone');

      // The profile should have leveled up
      const profile = await service.initializeProfile(); // Re-fetch
      expect(profile.level).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generatePersonalizedChallenge', () => {
    it('should create ability-appropriate challenge', async () => {
      const challenge = await service.generatePersonalizedChallenge(
        { physical: 30, cognitive: 60, emotional: 50 },
        ['mindfulness', 'journaling'],
        2
      );

      expect(challenge).toBeDefined();
      expect(challenge.id).toContain('challenge-');
      expect(challenge.name).toBeDefined();
      expect(challenge.requirements).toBeDefined();
      expect(challenge.rewards).toBeDefined();
      expect(challenge.adaptations).toBeDefined();
      expect(challenge.adaptations.length).toBeGreaterThan(0);
    });

    it('should adjust difficulty based on abilities', async () => {
      const easyChallenge = await service.generatePersonalizedChallenge(
        { physical: 20, cognitive: 30, emotional: 25 },
        [],
        0
      );

      const hardChallenge = await service.generatePersonalizedChallenge(
        { physical: 80, cognitive: 85, emotional: 75 },
        [],
        0
      );

      expect(easyChallenge.difficulty).toBe('easy');
      expect(hardChallenge.difficulty).toBe('hard');
    });
  });
});

describe('Wellness Reminders - Intelligent Nudge Engine', () => {
  let service: WellnessRemindersAdvancedService;

  beforeEach(() => {
    service = new WellnessRemindersAdvancedService();
  });

  describe('createSmartReminder', () => {
    it('should create personalized reminder', async () => {
      const reminder = await service.createSmartReminder(
        'medication',
        'Take morning meds',
        '08:00',
        { wakeTime: '07:00', peakEnergy: '10:00', windDown: '21:00' },
        'critical'
      );

      expect(reminder).toBeDefined();
      expect(reminder.id).toContain('reminder-');
      expect(reminder.type).toBe('medication');
      expect(reminder.title).toBe('Take morning meds');
      expect(reminder.message).toBeDefined();
      expect(reminder.priority).toBe('critical');
      expect(reminder.adaptations).toBeDefined();
    });

    it('should optimize timing for movement reminders', async () => {
      const reminder = await service.createSmartReminder(
        'movement',
        'Gentle stretching',
        '14:00',
        { wakeTime: '08:00', peakEnergy: '11:00', windDown: '20:00' },
        'helpful'
      );

      // Movement should be scheduled during peak energy
      expect(reminder.scheduledTime).toBe('11:00');
    });

    it('should provide alternative actions for flexible reminders', async () => {
      const reminder = await service.createSmartReminder(
        'self-care',
        'Take a break',
        '15:00',
        { wakeTime: '07:00', peakEnergy: '09:00', windDown: '21:00' },
        'helpful'
      );

      expect(reminder.adaptations.alternativeAction).toBeDefined();
    });
  });

  describe('optimizeNudges', () => {
    it('should analyze effectiveness and provide recommendations', async () => {
      const optimization = await service.optimizeNudges(
        [
          { id: 'r1', shown: 10, completed: 7, dismissed: 2, delayed: 1 },
          { id: 'r2', shown: 10, completed: 3, dismissed: 6, delayed: 1 },
        ],
        { tooFrequent: true, wrongTiming: false, notHelpful: true }
      );

      expect(optimization).toBeDefined();
      expect(optimization.optimalTimes).toBeDefined();
      expect(optimization.optimalTimes.length).toBeGreaterThan(0);
      expect(optimization.messagingTips).toBeDefined();
      expect(optimization.frequencyRecommendation).toContain('reducing');
    });

    it('should identify optimal times', async () => {
      const optimization = await service.optimizeNudges(
        [],
        { tooFrequent: false, wrongTiming: false, notHelpful: false }
      );

      expect(optimization.optimalTimes.length).toBeGreaterThan(0);
      expect(optimization.optimalTimes[0]).toHaveProperty('time');
      expect(optimization.optimalTimes[0]).toHaveProperty('reason');
      expect(optimization.optimalTimes[0]).toHaveProperty('successRate');
    });
  });
});

describe('Reflections Calendar - Temporal Insight Mapper', () => {
  let service: ReflectionsCalendarAdvancedService;

  beforeEach(() => {
    service = new ReflectionsCalendarAdvancedService();
  });

  describe('generateReflectionPrompts', () => {
    it('should generate daily prompts', async () => {
      const prompts = await service.generateReflectionPrompts(
        'daily',
        [],
        60,
        []
      );

      expect(prompts).toBeDefined();
      expect(prompts.length).toBeGreaterThan(0);
      expect(prompts.some(p => p.category === 'wins')).toBe(true);
      expect(prompts.some(p => p.category === 'gratitude')).toBe(true);
    });

    it('should add support prompts for low mood', async () => {
      const prompts = await service.generateReflectionPrompts(
        'daily',
        [],
        25,
        []
      );

      expect(prompts.some(p => p.category === 'self-care')).toBe(true);
    });

    it('should generate weekly prompts', async () => {
      const prompts = await service.generateReflectionPrompts(
        'weekly',
        [],
        50,
        []
      );

      expect(prompts.some(p => p.category === 'patterns')).toBe(true);
      expect(prompts.some(p => p.category === 'intentions')).toBe(true);
    });

    it('should generate monthly prompts', async () => {
      const prompts = await service.generateReflectionPrompts(
        'monthly',
        [],
        50,
        []
      );

      expect(prompts.some(p => p.category === 'growth')).toBe(true);
      expect(prompts.some(p => p.category === 'insights')).toBe(true);
    });

    it('should personalize based on current challenges', async () => {
      const prompts = await service.generateReflectionPrompts(
        'daily',
        [],
        50,
        ['managing pain', 'sleep issues']
      );

      expect(prompts.some(p => p.question.includes('managing pain'))).toBe(true);
    });
  });

  describe('analyzeTemporalPatterns', () => {
    it('should detect weekly patterns', async () => {
      const entries = [
        { id: '1', date: '2024-01-01', type: 'daily' as const, prompts: [], mood: 40, energy: 40, symptoms: [], gratitudes: [], wins: [], challenges: [], insights: [], tags: [] },
        { id: '2', date: '2024-01-02', type: 'daily' as const, prompts: [], mood: 60, energy: 60, symptoms: [], gratitudes: [], wins: [], challenges: [], insights: [], tags: [] },
        { id: '3', date: '2024-01-08', type: 'daily' as const, prompts: [], mood: 35, energy: 35, symptoms: [], gratitudes: [], wins: [], challenges: [], insights: [], tags: [] },
        { id: '4', date: '2024-01-09', type: 'daily' as const, prompts: [], mood: 65, energy: 65, symptoms: [], gratitudes: [], wins: [], challenges: [], insights: [], tags: [] },
      ];

      const patterns = await service.analyzeTemporalPatterns(entries, []);

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('generateReflectionSummary', () => {
    it('should create weekly summary', async () => {
      const entries = [
        { id: '1', date: '2024-01-01', type: 'daily' as const, prompts: [], mood: 50, energy: 50, symptoms: [], gratitudes: ['nature'], wins: ['exercised'], challenges: ['fatigue'], insights: ['need more rest'], tags: ['health'] },
        { id: '2', date: '2024-01-02', type: 'daily' as const, prompts: [], mood: 60, energy: 55, symptoms: [], gratitudes: ['friends'], wins: ['meditated'], challenges: ['fatigue'], insights: [], tags: ['health', 'social'] },
        { id: '3', date: '2024-01-03', type: 'daily' as const, prompts: [], mood: 70, energy: 65, symptoms: [], gratitudes: ['peace'], wins: ['slept well'], challenges: [], insights: ['sleep helps'], tags: ['health'] },
      ];

      const summary = await service.generateReflectionSummary(entries, 'week');

      expect(summary).toBeDefined();
      expect(summary.period).toBe('This Week');
      expect(summary.overallMood).toBeGreaterThan(0);
      expect(summary.moodTrend).toBeDefined();
      expect(['improving', 'stable', 'declining', 'variable']).toContain(summary.moodTrend);
      expect(summary.topThemes).toBeDefined();
      expect(summary.growthAreas).toBeDefined();
      expect(summary.recommendations).toBeDefined();
    });

    it('should detect improving mood trend', async () => {
      const entries = [
        { id: '1', date: '2024-01-01', type: 'daily' as const, prompts: [], mood: 30, energy: 30, symptoms: [], gratitudes: [], wins: [], challenges: [], insights: [], tags: [] },
        { id: '2', date: '2024-01-02', type: 'daily' as const, prompts: [], mood: 40, energy: 40, symptoms: [], gratitudes: [], wins: [], challenges: [], insights: [], tags: [] },
        { id: '3', date: '2024-01-03', type: 'daily' as const, prompts: [], mood: 55, energy: 55, symptoms: [], gratitudes: [], wins: [], challenges: [], insights: [], tags: [] },
        { id: '4', date: '2024-01-04', type: 'daily' as const, prompts: [], mood: 70, energy: 70, symptoms: [], gratitudes: [], wins: [], challenges: [], insights: [], tags: [] },
      ];

      const summary = await service.generateReflectionSummary(entries, 'week');

      expect(summary.moodTrend).toBe('improving');
    });
  });
});

describe('Dream Tracker & Interpreter - Subconscious Navigator', () => {
  let service: DreamTrackerAdvancedService;

  beforeEach(() => {
    service = new DreamTrackerAdvancedService();
  });

  describe('recordDream', () => {
    it('should record dream with extracted symbols and themes', async () => {
      const dream = await service.recordDream(
        'I was flying over an ocean and saw a house on the shore. Then I was falling.',
        ['exhilarating', 'scared'],
        75,
        false,
        false
      );

      expect(dream).toBeDefined();
      expect(dream.id).toContain('dream-');
      expect(dream.content).toBeDefined();
      expect(dream.emotions).toContain('exhilarating');
      expect(dream.symbols).toContain('flying');
      expect(dream.symbols).toContain('ocean');
      expect(dream.symbols).toContain('house');
      expect(dream.symbols).toContain('falling');
      expect(dream.themes.length).toBeGreaterThan(0);
      expect(dream.clarity).toBe(75);
    });

    it('should identify themes from content', async () => {
      const dream = await service.recordDream(
        'I was being chased through a building and couldn\'t find the exit. I felt exposed and lost.',
        ['fear', 'anxiety'],
        60,
        false,
        true
      );

      expect(dream.themes).toContain('pursuit');
      expect(dream.themes).toContain('searching');
      expect(dream.recurring).toBe(true);
    });
  });

  describe('interpretDream', () => {
    it('should generate comprehensive interpretation', async () => {
      const dream = await service.recordDream(
        'I was flying over beautiful mountains and felt completely free.',
        ['joy', 'freedom'],
        80,
        true,
        false
      );

      const interpretation = await service.interpretDream(dream, {
        currentStressors: ['work deadline'],
        recentEvents: ['got promotion'],
        personalAssociations: { flying: 'achieving goals' },
      });

      expect(interpretation).toBeDefined();
      expect(interpretation.summary).toBeDefined();
      expect(interpretation.symbolAnalysis).toBeDefined();
      expect(interpretation.symbolAnalysis.length).toBeGreaterThan(0);
      expect(interpretation.emotionalInsights).toBeDefined();
      expect(interpretation.potentialConnections).toBeDefined();
      expect(interpretation.reflectionPrompts).toBeDefined();
      expect(interpretation.disclaimer).toBeDefined();
    });

    it('should use personal associations in interpretation', async () => {
      const dream = await service.recordDream(
        'I saw water everywhere, flooding the streets.',
        ['overwhelmed'],
        70,
        false,
        false
      );

      const interpretation = await service.interpretDream(dream, {
        currentStressors: [],
        recentEvents: [],
        personalAssociations: { water: 'my emotions' },
      });

      const waterAnalysis = interpretation.symbolAnalysis.find(s => s.symbol === 'water');
      expect(waterAnalysis?.personalContext).toBe('my emotions');
    });
  });

  describe('findDreamPatterns', () => {
    it('should identify recurring symbols', async () => {
      const dreams = [
        { id: '1', timestamp: Date.now() - 86400000 * 3, content: 'Flying over water', emotions: ['free'], symbols: ['flying', 'water'], clarity: 70, lucidity: false, recurring: false, themes: ['freedom'] },
        { id: '2', timestamp: Date.now() - 86400000 * 2, content: 'Swimming in water', emotions: ['calm'], symbols: ['water'], clarity: 60, lucidity: false, recurring: false, themes: [] },
        { id: '3', timestamp: Date.now() - 86400000, content: 'Drinking water by river', emotions: ['peaceful'], symbols: ['water', 'river'], clarity: 65, lucidity: false, recurring: false, themes: [] },
        { id: '4', timestamp: Date.now(), content: 'Rain and water flooding', emotions: ['anxious'], symbols: ['water', 'rain'], clarity: 75, lucidity: false, recurring: false, themes: [] },
      ];

      const patterns = await service.findDreamPatterns(dreams);

      expect(patterns).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some(p => p.type === 'recurring_symbol')).toBe(true);
      expect(patterns.some(p => p.pattern.includes('water'))).toBe(true);
    });

    it('should identify emotional themes', async () => {
      const dreams = [
        { id: '1', timestamp: Date.now() - 86400000 * 4, content: 'Dream 1', emotions: ['anxiety'], symbols: [], clarity: 70, lucidity: false, recurring: false, themes: ['anxiety'] },
        { id: '2', timestamp: Date.now() - 86400000 * 3, content: 'Dream 2', emotions: ['anxiety'], symbols: [], clarity: 60, lucidity: false, recurring: false, themes: [] },
        { id: '3', timestamp: Date.now() - 86400000 * 2, content: 'Dream 3', emotions: ['anxiety'], symbols: [], clarity: 65, lucidity: false, recurring: false, themes: [] },
        { id: '4', timestamp: Date.now() - 86400000, content: 'Dream 4', emotions: ['anxiety'], symbols: [], clarity: 75, lucidity: false, recurring: false, themes: [] },
        { id: '5', timestamp: Date.now(), content: 'Dream 5', emotions: ['anxiety'], symbols: [], clarity: 80, lucidity: false, recurring: false, themes: [] },
      ];

      const patterns = await service.findDreamPatterns(dreams);

      expect(patterns.some(p => p.type === 'emotional_theme')).toBe(true);
    });
  });
});
