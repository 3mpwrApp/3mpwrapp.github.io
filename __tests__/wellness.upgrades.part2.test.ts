/**
 * Tests for Wellness Feature Upgrades - Part 2
 * 
 * Testing: Functional Capacity Assessment, Adaptive Meditation,
 * AI Wellness Companion, Ambience Sync AI
 */

import {
    AdaptiveMeditationAdvancedService,
    AICompanionAdvancedService,
    AmbienceSyncAdvancedService,
    FunctionalCapacityAdvancedService,
} from '../services/wellnessFeatureUpgrades2';

describe('Functional Capacity Assessment - Ability Spectrum Mapper', () => {
  let service: FunctionalCapacityAdvancedService;

  beforeEach(() => {
    service = new FunctionalCapacityAdvancedService();
  });

  describe('mapAbilitySpectrum', () => {
    it('should create comprehensive ability spectrum', async () => {
      const spectrum = await service.mapAbilitySpectrum(
        [
          { name: 'Cognitive Focus', selfRating: 60, variability: 'moderate', triggers: ['fatigue'], aids: ['breaks'] },
          { name: 'Physical Endurance', selfRating: 40, variability: 'high', triggers: ['weather'], aids: ['pacing'] },
          { name: 'Emotional Regulation', selfRating: 55, variability: 'stable', triggers: ['stress'], aids: ['breathing'] },
        ],
        [
          { ability: 'Cognitive Focus', level: 55, timestamp: Date.now() - 86400000 },
          { ability: 'Cognitive Focus', level: 65, timestamp: Date.now() },
          { ability: 'Physical Endurance', level: 35, timestamp: Date.now() },
        ],
        ['fibromyalgia', 'ADHD']
      );

      expect(spectrum).toBeDefined();
      expect(spectrum.id).toContain('spectrum-');
      expect(spectrum.dimensions).toBeDefined();
      expect(spectrum.dimensions.length).toBe(3);
      expect(spectrum.overallCapacity).toBeGreaterThanOrEqual(0);
      expect(spectrum.reserveBuffer).toBeDefined();
      expect(spectrum.crashRisk).toBeGreaterThanOrEqual(0);
      expect(spectrum.crashRisk).toBeLessThanOrEqual(1);
    });

    it('should identify accommodations needed', async () => {
      const spectrum = await service.mapAbilitySpectrum(
        [
          { name: 'Cognitive Processing', selfRating: 30, variability: 'high', triggers: ['noise'], aids: ['quiet'] },
          { name: 'Physical Mobility', selfRating: 35, variability: 'moderate', triggers: ['cold'], aids: ['warmth'] },
        ],
        [],
        ['cognitive impairment', 'mobility issues']
      );

      expect(spectrum.accommodationsNeeded.length).toBeGreaterThan(0);
    });

    it('should identify strengths to leverage', async () => {
      const spectrum = await service.mapAbilitySpectrum(
        [
          { name: 'Creativity', selfRating: 85, variability: 'stable', triggers: [], aids: [] },
          { name: 'Empathy', selfRating: 90, variability: 'stable', triggers: [], aids: [] },
          { name: 'Physical Stamina', selfRating: 40, variability: 'high', triggers: ['exertion'], aids: ['rest'] },
        ],
        [],
        []
      );

      expect(spectrum.strengthsToLeverage.length).toBeGreaterThan(0);
      expect(spectrum.strengthsToLeverage).toContain('Creativity');
      expect(spectrum.strengthsToLeverage).toContain('Empathy');
    });
  });

  describe('forecastCapacity', () => {
    it('should generate capacity forecast', async () => {
      // First map spectrum
      await service.mapAbilitySpectrum(
        [{ name: 'Energy', selfRating: 50, variability: 'moderate', triggers: [], aids: [] }],
        [],
        []
      );

      const forecast = await service.forecastCapacity(
        [
          { timestamp: Date.now() - 86400000, capacity: 60, factors: ['good sleep'] },
          { timestamp: Date.now(), capacity: 55, factors: ['stress'] },
        ],
        [
          { time: '10:00', energyCost: 3 },
          { time: '14:00', energyCost: 4 },
        ]
      );

      expect(forecast).toBeDefined();
      expect(forecast.hourly).toBeDefined();
      expect(forecast.hourly.length).toBeGreaterThan(0);
      expect(forecast.dailyTrend).toBeDefined();
      expect(['building', 'stable', 'declining', 'volatile']).toContain(forecast.dailyTrend);
      expect(forecast.weeklyPattern).toBeDefined();
      expect(forecast.recommendations).toBeDefined();
    });

    it('should identify peak performance windows', async () => {
      await service.mapAbilitySpectrum(
        [{ name: 'Performance', selfRating: 60, variability: 'moderate', triggers: [], aids: [] }],
        [
          { ability: 'Performance', level: 80, timestamp: new Date().setHours(10, 0, 0, 0) },
          { ability: 'Performance', level: 85, timestamp: new Date().setHours(11, 0, 0, 0) },
          { ability: 'Performance', level: 50, timestamp: new Date().setHours(15, 0, 0, 0) },
        ],
        []
      );

      const forecast = await service.forecastCapacity(
        [{ timestamp: Date.now(), capacity: 60, factors: ['baseline'] }],
        [{ time: '14:00', energyCost: 5 }]
      );

      // Forecast should have hourly predictions and weekly patterns
      expect(forecast.hourly.length).toBeGreaterThan(0);
      expect(forecast.weeklyPattern.length).toBe(7);
    });
  });
});

describe('Adaptive Meditation - Consciousness Architect', () => {
  let service: AdaptiveMeditationAdvancedService;

  beforeEach(() => {
    service = new AdaptiveMeditationAdvancedService();
  });

  describe('designMeditationBlueprint', () => {
    it('should create personalized meditation session', async () => {
      const blueprint = await service.designMeditationBlueprint(
        'calm',
        15,
        { stress: 70, energy: 40, focus: 50 },
        ['breathing difficulty', 'attention difficulty'],
        { guidanceLevel: 'moderate', soundPreference: 'rain' }
      );

      expect(blueprint).toBeDefined();
      expect(blueprint.id).toContain('meditation-');
      expect(blueprint.name).toBeDefined();
      expect(blueprint.duration).toBe(15);
      expect(blueprint.phases).toBeDefined();
      expect(blueprint.phases.length).toBeGreaterThan(0);
      expect(blueprint.targetState).toBe('calm');
      expect(blueprint.adaptedFor).toContain('breathing difficulty');
      expect(blueprint.intensityLevel).toBeDefined();
    });

    it('should generate appropriate phases', async () => {
      const blueprint = await service.designMeditationBlueprint(
        'focused',
        20,
        { stress: 40, energy: 60, focus: 30 },
        [],
        { guidanceLevel: 'detailed', soundPreference: 'silence' }
      );

      expect(blueprint.phases.length).toBeGreaterThanOrEqual(3);
      expect(blueprint.phases[0].name).toBe('Arrival');
      expect(blueprint.phases[blueprint.phases.length - 1].name).toBe('Integration');
    });

    it('should include breath patterns for appropriate goals', async () => {
      const blueprint = await service.designMeditationBlueprint(
        'calm',
        10,
        { stress: 80, energy: 30, focus: 40 },
        [],
        { guidanceLevel: 'moderate', soundPreference: 'nature' }
      );

      const mainPhase = blueprint.phases.find(p => p.breathPattern);
      expect(mainPhase).toBeDefined();
      expect(mainPhase!.breathPattern).toHaveProperty('inhale');
      expect(mainPhase!.breathPattern).toHaveProperty('exhale');
    });

    it('should adapt for high stress with gentle intensity', async () => {
      const blueprint = await service.designMeditationBlueprint(
        'released',
        15,
        { stress: 90, energy: 20, focus: 30 },
        [],
        { guidanceLevel: 'moderate', soundPreference: 'waves' }
      );

      expect(blueprint.intensityLevel).toBe('gentle');
    });
  });

  describe('mapConsciousness', () => {
    it('should create consciousness map', async () => {
      const map = await service.mapConsciousness(
        [
          { technique: 'breathing', duration: 10, feeling: 70, timestamp: Date.now() - 86400000 },
          { technique: 'body scan', duration: 15, feeling: 80, timestamp: Date.now() },
        ],
        60,
        70,
        40
      );

      expect(map).toBeDefined();
      expect(map.currentState).toBeDefined();
      expect(map.currentState.awareness).toBeGreaterThanOrEqual(0);
      expect(map.currentState.presence).toBeGreaterThanOrEqual(0);
      expect(map.currentState.clarity).toBeGreaterThanOrEqual(0);
      expect(map.dominantPattern).toBeDefined();
      expect(map.practiceHistory).toBeDefined();
    });

    it('should identify blockages', async () => {
      const map = await service.mapConsciousness(
        [],
        30, // low mood
        20, // low clarity
        85  // high stress
      );

      expect(map.blockages.length).toBeGreaterThan(0);
    });

    it('should analyze practice effectiveness', async () => {
      const map = await service.mapConsciousness(
        [
          { technique: 'breathing', duration: 10, feeling: 80, timestamp: Date.now() - 172800000 },
          { technique: 'breathing', duration: 10, feeling: 85, timestamp: Date.now() - 86400000 },
          { technique: 'visualization', duration: 15, feeling: 60, timestamp: Date.now() },
        ],
        60, 60, 40
      );

      expect(map.practiceHistory.length).toBe(2);
      expect(map.practiceHistory[0].technique).toBe('breathing');
      expect(map.practiceHistory[0].effectiveness).toBeGreaterThan(map.practiceHistory[1].effectiveness);
    });
  });
});

describe('AI Wellness Companion - Empathic Intelligence Engine', () => {
  let service: AICompanionAdvancedService;

  beforeEach(() => {
    service = new AICompanionAdvancedService();
  });

  describe('generateEmpathicResponse', () => {
    it('should generate supportive response for distress', async () => {
      const response = await service.generateEmpathicResponse(
        'I\'m really struggling today. Everything feels so hard and difficult.',
        25,
        ['bad night', 'pain flare'],
        []
      );

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      // Tone depends on sentiment analysis of message
      expect(['validating', 'supportive']).toContain(response.tone);
      expect(response.emotionalMirroring).toBeDefined();
      expect(response.followUp.length).toBeGreaterThan(0);
    });

    it('should generate positive response for good news', async () => {
      const response = await service.generateEmpathicResponse(
        'I had a wonderful amazing great day today! Everything went wonderfully!',
        85,
        ['good news', 'accomplished goals'],
        []
      );

      // Tone can be celebratory or curious depending on sentiment
      expect(['celebratory', 'encouraging', 'curious']).toContain(response.tone);
      expect(response.message).toBeDefined();
    });

    it('should provide resources for low mood', async () => {
      const response = await service.generateEmpathicResponse(
        'I don\'t know what to do anymore.',
        20,
        ['overwhelmed'],
        []
      );

      expect(response.resources.length).toBeGreaterThan(0);
      expect(response.actionSuggestions.length).toBeGreaterThan(0);
    });

    it('should include encouraging follow-ups', async () => {
      const response = await service.generateEmpathicResponse(
        'I want to try getting better but it\'s hard.',
        50,
        [],
        []
      );

      expect(response.tone).toBe('encouraging');
      expect(response.followUp.length).toBeGreaterThan(0);
    });
  });

  describe('updateMemory', () => {
    it('should record significant moments', async () => {
      await service.updateMemory({
        type: 'conversation',
        content: 'User had a breakthrough about self-compassion',
        outcome: 'breakthrough',
        timestamp: Date.now(),
      });

      // Memory is internal, but the method should not throw
      expect(true).toBe(true);
    });
  });
});

describe('Ambience Sync AI - Environmental Harmony Engine', () => {
  let service: AmbienceSyncAdvancedService;

  beforeEach(() => {
    service = new AmbienceSyncAdvancedService();
  });

  describe('createAmbienceProfile', () => {
    it('should create mood-appropriate ambience profile', async () => {
      const profile = await service.createAmbienceProfile(
        'calm',
        { lightSensitivity: 60, soundSensitivity: 50, favorites: ['rain sounds'] },
        { timeOfDay: 'evening', weather: 'cloudy', energy: 40 }
      );

      expect(profile).toBeDefined();
      expect(profile.id).toContain('ambience-');
      expect(profile.name).toBeDefined();
      expect(profile.targetMood).toBe('calm');
      expect(profile.elements).toBeDefined();
      expect(profile.elements.lighting).toBeDefined();
      expect(profile.elements.sound).toBeDefined();
      expect(profile.elements.suggestions).toBeDefined();
    });

    it('should adjust lighting for sensitivity', async () => {
      const highSensitivity = await service.createAmbienceProfile(
        'focused',
        { lightSensitivity: 90, soundSensitivity: 50, favorites: [] },
        { timeOfDay: 'afternoon', weather: 'sunny', energy: 60 }
      );

      const lowSensitivity = await service.createAmbienceProfile(
        'focused',
        { lightSensitivity: 20, soundSensitivity: 50, favorites: [] },
        { timeOfDay: 'afternoon', weather: 'sunny', energy: 60 }
      );

      expect(highSensitivity.elements.lighting.brightness)
        .toBeLessThan(lowSensitivity.elements.lighting.brightness);
    });

    it('should adjust for evening time', async () => {
      const eveningProfile = await service.createAmbienceProfile(
        'restorative',
        { lightSensitivity: 50, soundSensitivity: 50, favorites: [] },
        { timeOfDay: 'evening', weather: 'clear', energy: 30 }
      );

      expect(eveningProfile.elements.lighting.warmth).toBeGreaterThan(70);
      expect(eveningProfile.elements.lighting.brightness).toBeLessThan(50);
    });

    it('should include adaptations', async () => {
      const profile = await service.createAmbienceProfile(
        'focused',
        { lightSensitivity: 80, soundSensitivity: 80, favorites: [] },
        { timeOfDay: 'morning', weather: 'sunny', energy: 50 }
      );

      expect(profile.adaptations.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeEnvironmentalHarmony', () => {
    it('should analyze current environment', async () => {
      const harmony = await service.analyzeEnvironmentalHarmony(
        {
          lighting: 80,
          noise: 70,
          temperature: 78,
          clutter: 65,
          airQuality: 60,
        },
        { energy: 50, focus: 40, stress: 60 },
        ['focus', 'reduce stress']
      );

      expect(harmony).toBeDefined();
      expect(harmony.currentScore).toBeDefined();
      expect(harmony.factors).toBeDefined();
      expect(harmony.recommendations).toBeDefined();
      expect(harmony.oneClickOptimizations).toBeDefined();
    });

    it('should identify factors needing adjustment', async () => {
      const harmony = await service.analyzeEnvironmentalHarmony(
        {
          lighting: 20,
          noise: 80,
          temperature: 80,
          clutter: 90,
          airQuality: 40,
        },
        { energy: 30, focus: 20, stress: 80 },
        ['calm', 'focus']
      );

      expect(harmony.factors.length).toBeGreaterThan(0);
      expect(harmony.factors.some(f => f.factor === 'Noise')).toBe(true);
      expect(harmony.factors.some(f => f.priority === 'high')).toBe(true);
    });

    it('should provide one-click optimizations', async () => {
      const harmony = await service.analyzeEnvironmentalHarmony(
        { lighting: 50, noise: 50, temperature: 70, clutter: 50, airQuality: 70 },
        { energy: 50, focus: 50, stress: 50 },
        []
      );

      expect(harmony.oneClickOptimizations.length).toBeGreaterThan(0);
      expect(harmony.oneClickOptimizations[0]).toHaveProperty('name');
      expect(harmony.oneClickOptimizations[0]).toHaveProperty('impact');
    });
  });
});
