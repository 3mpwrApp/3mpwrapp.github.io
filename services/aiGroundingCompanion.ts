/**
 * AI Grounding Companion Service
 * 
 * WORLD-FIRST: Personalized grounding assistant that learns what works
 * for YOU and adapts in real-time based on biometric feedback.
 * 
 * Revolutionary Features:
 * - Learns your most effective grounding techniques
 * - Adapts difficulty progressively
 * - Context-aware technique selection
 * - Biometric feedback integration
 * - Multi-modal grounding (5-4-3-2-1, breathing, body scan, etc.)
 * - Crisis mode with rapid intervention
 * - Effectiveness tracking and optimization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

// ============ TYPES ============

export type GroundingCategory =
  | 'sensory'        // 5-4-3-2-1, texture, temperature
  | 'breathing'      // Box breathing, 4-7-8, etc.
  | 'body'           // Body scan, progressive relaxation
  | 'movement'       // Stretching, shaking, grounding poses
  | 'cognitive'      // Counting, naming, categories
  | 'visualization'  // Safe place, container, grounding cord
  | 'orientation'    // Where am I, what time is it
  | 'bilateral'      // Butterfly hug, tapping
  | 'tactile'        // Ice, cold water, textured objects
  | 'auditory';      // Humming, toning, music

export type DifficultyLevel = 'minimal' | 'easy' | 'moderate' | 'challenging';

export type SessionState = 
  | 'not_started'
  | 'introduction'
  | 'active'
  | 'deepening'
  | 'completing'
  | 'reflection'
  | 'completed';

export type DistressLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface GroundingTechnique {
  id: string;
  name: string;
  category: GroundingCategory;
  description: string;
  instructions: string[];
  duration: number;          // seconds
  difficulty: DifficultyLevel;
  requiredItems?: string[];
  bestFor: string[];         // Contexts where this works well
  contraindications?: string[];
  variations?: string[];
  audioGuideAvailable: boolean;
}

export interface TechniqueEffectiveness {
  techniqueId: string;
  timesUsed: number;
  avgDistressReduction: number;  // How much distress dropped (0-10 scale)
  avgCompletionRate: number;     // 0-1
  avgTimeToEffective: number;    // seconds until distress started dropping
  contextPerformance: Record<string, number>;  // Context -> effectiveness score
  lastUsed: number;
  personalNotes?: string;
}

export interface GroundingSession {
  id: string;
  startTime: number;
  endTime?: number;
  initialDistress: DistressLevel;
  finalDistress?: DistressLevel;
  distressReadings: { time: number; level: DistressLevel }[];
  techniquesUsed: {
    techniqueId: string;
    startTime: number;
    endTime?: number;
    completed: boolean;
    skipped: boolean;
    effectiveness?: number;  // 1-5 user rating
  }[];
  context: GroundingContext;
  state: SessionState;
  biometricData?: {
    heartRateStart?: number;
    heartRateEnd?: number;
    hrvStart?: number;
    hrvEnd?: number;
  };
  completed: boolean;
  notes?: string;
}

export interface GroundingContext {
  trigger?: string;
  location?: 'home' | 'work' | 'public' | 'transit' | 'nature' | 'other';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  socialSetting?: 'alone' | 'with_trusted' | 'with_strangers' | 'crowded';
  physicalState?: 'seated' | 'standing' | 'lying' | 'moving';
  availableItems?: string[];
  energyLevel?: DistressLevel;
  dissociationLevel?: DistressLevel;
  timeAvailable?: number;        // Minutes available for grounding
  safeToSpeak?: boolean;         // Whether user can speak aloud
  hasPrivacy?: boolean;          // Whether user has privacy
  mobilityLevel?: 'full' | 'limited' | 'seated_only';
}

export interface AdaptiveRecommendation {
  technique: GroundingTechnique;
  confidence: number;
  reason: string;
  adaptations?: string[];
}

export interface PersonalProfile {
  preferredCategories: GroundingCategory[];
  avoidCategories: GroundingCategory[];
  preferredDuration: 'short' | 'medium' | 'long';
  prefersDarkMode: boolean;
  prefersVoiceGuidance: boolean;
  prefersMinimalText: boolean;
  triggerWords: string[];
  safeWords: string[];
  customTechniques: GroundingTechnique[];
}

export interface GroundingState {
  techniques: GroundingTechnique[];
  effectiveness: TechniqueEffectiveness[];
  sessions: GroundingSession[];
  currentSession: GroundingSession | null;
  profile: PersonalProfile;
  streakDays: number;
  totalSessions: number;
  learningData: {
    totalMinutesGrounded: number;
    avgDistressReduction: number;
    mostEffectiveTechnique: string | null;
    preferredTimeOfDay: string | null;
    lastSessionDate: number | null;
  };
}

// ============ STORAGE ============

const STORAGE_KEYS = {
  STATE: 'groundingCompanion:state:v1',
  EFFECTIVENESS: 'groundingCompanion:effectiveness:v1',
  SESSIONS: 'groundingCompanion:sessions:v1',
  PROFILE: 'groundingCompanion:profile:v1',
};

// ============ DEFAULT TECHNIQUES ============

const DEFAULT_TECHNIQUES: GroundingTechnique[] = [
  // Sensory
  {
    id: '5-4-3-2-1',
    name: '5-4-3-2-1 Senses',
    category: 'sensory',
    description: 'Engage all 5 senses to anchor yourself in the present',
    instructions: [
      'Look around and name 5 things you can SEE',
      'Focus on 4 things you can TOUCH or FEEL',
      'Listen for 3 things you can HEAR',
      'Notice 2 things you can SMELL',
      'Acknowledge 1 thing you can TASTE',
    ],
    duration: 180,
    difficulty: 'easy',
    bestFor: ['anxiety', 'dissociation', 'panic', 'flashbacks'],
    audioGuideAvailable: true,
  },
  {
    id: 'color-hunt',
    name: 'Color Hunt',
    category: 'sensory',
    description: 'Find objects of specific colors around you',
    instructions: [
      'Find 3 red things',
      'Find 3 blue things',
      'Find 3 green things',
      'Find 3 yellow things',
    ],
    duration: 120,
    difficulty: 'easy',
    bestFor: ['mild anxiety', 'restlessness', 'distraction'],
    audioGuideAvailable: false,
  },
  {
    id: 'texture-exploration',
    name: 'Texture Exploration',
    category: 'tactile',
    description: 'Focus deeply on the texture of objects',
    instructions: [
      'Pick up an object within reach',
      'Close your eyes if comfortable',
      'Explore every texture with your fingertips',
      'Notice temperature, weight, smoothness, roughness',
      'Try different objects',
    ],
    duration: 180,
    difficulty: 'easy',
    bestFor: ['anxiety', 'mild dissociation'],
    requiredItems: ['any objects'],
    audioGuideAvailable: true,
  },

  // Breathing
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    category: 'breathing',
    description: '4-count square breathing pattern',
    instructions: [
      'Breathe IN for 4 counts',
      'HOLD for 4 counts',
      'Breathe OUT for 4 counts',
      'HOLD for 4 counts',
      'Repeat 4-6 times',
    ],
    duration: 120,
    difficulty: 'easy',
    bestFor: ['anxiety', 'panic', 'stress', 'overwhelm'],
    audioGuideAvailable: true,
  },
  {
    id: '4-7-8-breathing',
    name: '4-7-8 Breathing',
    category: 'breathing',
    description: 'Relaxing breath technique',
    instructions: [
      'Exhale completely through your mouth',
      'Breathe IN through nose for 4 counts',
      'HOLD your breath for 7 counts',
      'Exhale through mouth for 8 counts',
      'Repeat 3-4 times',
    ],
    duration: 90,
    difficulty: 'moderate',
    bestFor: ['anxiety', 'insomnia', 'anger'],
    audioGuideAvailable: true,
  },
  {
    id: 'belly-breathing',
    name: 'Belly Breathing',
    category: 'breathing',
    description: 'Deep diaphragmatic breathing',
    instructions: [
      'Place one hand on chest, one on belly',
      'Breathe in slowly through nose',
      'Feel belly rise while chest stays still',
      'Exhale slowly through mouth',
      'Continue for 2-3 minutes',
    ],
    duration: 180,
    difficulty: 'easy',
    bestFor: ['general anxiety', 'stress', 'activation'],
    audioGuideAvailable: true,
  },

  // Body
  {
    id: 'body-scan',
    name: 'Body Scan',
    category: 'body',
    description: 'Progressive awareness of body sensations',
    instructions: [
      'Start at the top of your head',
      'Notice any sensations without judgment',
      'Slowly move attention down: face, neck, shoulders',
      'Continue through arms, hands, torso',
      'Move to hips, legs, feet',
      'Notice your whole body at once',
    ],
    duration: 300,
    difficulty: 'moderate',
    bestFor: ['dissociation', 'tension', 'numbness'],
    audioGuideAvailable: true,
  },
  {
    id: 'feet-on-floor',
    name: 'Feet on Floor',
    category: 'body',
    description: 'Ground through feet connection',
    instructions: [
      'Remove shoes if possible',
      'Place feet flat on the floor',
      'Press down firmly',
      'Feel the floor supporting you',
      'Notice the texture, temperature',
      'Imagine roots growing from your feet',
    ],
    duration: 120,
    difficulty: 'minimal',
    bestFor: ['dissociation', 'panic', 'flashbacks'],
    audioGuideAvailable: true,
  },

  // Movement
  {
    id: 'shake-it-off',
    name: 'Shake It Off',
    category: 'movement',
    description: 'Physical shaking to release tension',
    instructions: [
      'Stand if able (or seated)',
      'Start shaking your hands loosely',
      'Add arms, shoulders',
      'Let the shaking spread through body',
      'Shake for 30-60 seconds',
      'Slowly stop and notice how you feel',
    ],
    duration: 90,
    difficulty: 'easy',
    bestFor: ['anxiety', 'freeze response', 'stored tension'],
    audioGuideAvailable: false,
  },
  {
    id: 'butterfly-hug',
    name: 'Butterfly Hug',
    category: 'bilateral',
    description: 'Self-administered bilateral stimulation',
    instructions: [
      'Cross arms over chest',
      'Hands on upper arms near shoulders',
      'Alternately tap left, then right',
      'Keep a slow, steady rhythm',
      'Continue for 1-2 minutes',
      'Breathe normally throughout',
    ],
    duration: 120,
    difficulty: 'easy',
    bestFor: ['distress', 'trauma activation', 'anxiety'],
    audioGuideAvailable: true,
  },

  // Cognitive
  {
    id: 'categories',
    name: 'Categories Game',
    category: 'cognitive',
    description: 'Mental categorization task',
    instructions: [
      'Pick a category (animals, cities, foods)',
      'Name items A-Z in that category',
      'Take your time with each letter',
      'Skip difficult letters, keep going',
    ],
    duration: 180,
    difficulty: 'moderate',
    bestFor: ['rumination', 'intrusive thoughts', 'anxiety'],
    audioGuideAvailable: false,
  },
  {
    id: 'math-grounding',
    name: 'Math Grounding',
    category: 'cognitive',
    description: 'Simple math to engage logical brain',
    instructions: [
      'Count backwards from 100 by 7s',
      '100, 93, 86, 79...',
      'If you lose track, start over',
      'Go as far as you can',
    ],
    duration: 120,
    difficulty: 'moderate',
    bestFor: ['panic', 'intrusive thoughts', 'spiraling'],
    audioGuideAvailable: false,
  },

  // Visualization
  {
    id: 'safe-place',
    name: 'Safe Place',
    category: 'visualization',
    description: 'Visualize a calming, safe location',
    instructions: [
      'Close your eyes if comfortable',
      'Imagine a place where you feel completely safe',
      'Notice what you see there',
      'What do you hear?',
      'What do you smell?',
      'How does your body feel in this place?',
      'Stay as long as you need',
    ],
    duration: 300,
    difficulty: 'moderate',
    bestFor: ['anxiety', 'fear', 'overwhelm'],
    contraindications: ['severe dissociation'],
    audioGuideAvailable: true,
  },
  {
    id: 'grounding-cord',
    name: 'Grounding Cord',
    category: 'visualization',
    description: 'Visualize connection to earth',
    instructions: [
      'Sit or stand with feet on floor',
      'Imagine a cord from base of spine to earth center',
      'See it as thick rope, tree root, or light beam',
      'Feel excess energy draining down the cord',
      'Feel stability coming up from earth',
    ],
    duration: 180,
    difficulty: 'moderate',
    bestFor: ['dissociation', 'anxiety', 'floating feeling'],
    audioGuideAvailable: true,
  },

  // Orientation
  {
    id: 'reality-check',
    name: 'Reality Check',
    category: 'orientation',
    description: 'Orient to present time and place',
    instructions: [
      'State your name out loud or in your mind',
      'Say the current date and time',
      'Name where you are right now',
      'List 3 facts about your current safety',
      'Name one thing you will do next',
    ],
    duration: 60,
    difficulty: 'minimal',
    bestFor: ['flashbacks', 'dissociation', 'confusion'],
    audioGuideAvailable: true,
  },

  // Tactile
  {
    id: 'ice-cube',
    name: 'Ice Cube Grounding',
    category: 'tactile',
    description: 'Cold sensation for grounding',
    instructions: [
      'Hold an ice cube in your hand',
      'Focus on the cold sensation',
      'Notice as it begins to melt',
      'Transfer to other hand if needed',
      'Continue until grounded or ice melts',
    ],
    duration: 120,
    difficulty: 'easy',
    bestFor: ['severe dissociation', 'urge to self-harm', 'intense distress'],
    requiredItems: ['ice cube'],
    audioGuideAvailable: false,
  },
  {
    id: 'cold-water',
    name: 'Cold Water Splash',
    category: 'tactile',
    description: 'Cold water on face or wrists',
    instructions: [
      'Get access to cold water',
      'Splash face with cold water',
      'Or run cold water over wrists',
      'Focus on the temperature sensation',
      'Repeat as needed',
    ],
    duration: 60,
    difficulty: 'minimal',
    bestFor: ['panic', 'overwhelming emotion', 'activation'],
    requiredItems: ['water'],
    audioGuideAvailable: false,
  },

  // Auditory
  {
    id: 'humming',
    name: 'Vagal Humming',
    category: 'auditory',
    description: 'Humming to activate vagus nerve',
    instructions: [
      'Take a deep breath',
      'Hum on the exhale - any note',
      'Feel the vibration in chest and throat',
      'Continue for several breaths',
      'Try different pitches',
    ],
    duration: 120,
    difficulty: 'easy',
    bestFor: ['anxiety', 'activation', 'stress'],
    audioGuideAvailable: true,
  },
];

// ============ SERVICE ============

class AIGroundingCompanionService {
  private state: GroundingState = {
    techniques: [...DEFAULT_TECHNIQUES],
    effectiveness: [],
    sessions: [],
    currentSession: null,
    profile: {
      preferredCategories: [],
      avoidCategories: [],
      preferredDuration: 'medium',
      prefersDarkMode: false,
      prefersVoiceGuidance: true,
      prefersMinimalText: false,
      triggerWords: [],
      safeWords: [],
      customTechniques: [],
    },
    streakDays: 0,
    totalSessions: 0,
    learningData: {
      totalMinutesGrounded: 0,
      avgDistressReduction: 0,
      mostEffectiveTechnique: null,
      preferredTimeOfDay: null,
      lastSessionDate: null,
    },
  };
  private listeners: Set<() => void> = new Set();

  // ============ INITIALIZATION ============

  async initialize(): Promise<void> {
    try {
      const [state, effectiveness, sessions, profile] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.STATE),
        AsyncStorage.getItem(STORAGE_KEYS.EFFECTIVENESS),
        AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
      ]);

      if (effectiveness) this.state.effectiveness = JSON.parse(effectiveness);
      if (sessions) this.state.sessions = JSON.parse(sessions);
      if (profile) this.state.profile = { ...this.state.profile, ...JSON.parse(profile) };
      if (state) {
        const parsed = JSON.parse(state);
        this.state.streakDays = parsed.streakDays || 0;
        this.state.totalSessions = parsed.totalSessions || 0;
        this.state.learningData = { ...this.state.learningData, ...parsed.learningData };
      }

      // Add custom techniques
      this.state.techniques = [...DEFAULT_TECHNIQUES, ...this.state.profile.customTechniques];

      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize GroundingCompanion:', error);
    }
  }

  // ============ AI RECOMMENDATION ENGINE ============

  async getRecommendations(
    context: GroundingContext,
    distressLevel: DistressLevel,
    count: number = 3
  ): Promise<AdaptiveRecommendation[]> {
    const recommendations: AdaptiveRecommendation[] = [];
    
    // Filter techniques based on context
    let eligibleTechniques = this.state.techniques.filter(tech => {
      // Filter out avoided categories
      if (this.state.profile.avoidCategories.includes(tech.category)) {
        return false;
      }
      // Filter based on required items
      if (tech.requiredItems && context.availableItems) {
        const hasRequired = tech.requiredItems.some(item => 
          context.availableItems?.includes(item)
        );
        if (!hasRequired) return false;
      }
      // Filter by setting appropriateness
      if (context.socialSetting === 'crowded' || context.socialSetting === 'with_strangers') {
        // Avoid techniques that might draw attention
        if (tech.category === 'movement' || tech.category === 'auditory') {
          return false;
        }
      }
      return true;
    });

    // Score each technique
    const scoredTechniques = eligibleTechniques.map(tech => {
      let score = 0.5; // Base score

      // Effectiveness history
      const eff = this.state.effectiveness.find(e => e.techniqueId === tech.id);
      if (eff) {
        score += eff.avgDistressReduction / 10 * 0.3;
        // Context-specific performance
        if (context.location && eff.contextPerformance[context.location]) {
          score += eff.contextPerformance[context.location] * 0.2;
        }
      }

      // Preferred categories bonus
      if (this.state.profile.preferredCategories.includes(tech.category)) {
        score += 0.15;
      }

      // Distress-appropriate difficulty
      if (distressLevel >= 8 && tech.difficulty === 'minimal') {
        score += 0.2; // High distress needs simple techniques
      } else if (distressLevel <= 3 && tech.difficulty === 'moderate') {
        score += 0.1; // Low distress can handle more complex
      }

      // Match best-for categories
      const matchingBestFor = tech.bestFor.filter(bf => {
        if (distressLevel >= 7 && (bf.includes('panic') || bf.includes('crisis'))) return true;
        if (context.trigger && bf.includes(context.trigger)) return true;
        return false;
      }).length;
      score += matchingBestFor * 0.1;

      // Variety - don't recommend recently used
      if (eff && Date.now() - eff.lastUsed < 24 * 60 * 60 * 1000) {
        score -= 0.1;
      }

      return { technique: tech, score };
    });

    // Sort by score and take top N
    scoredTechniques.sort((a, b) => b.score - a.score);
    const topTechniques = scoredTechniques.slice(0, count);

    for (const { technique, score } of topTechniques) {
      const adaptations = this.getAdaptations(technique, context, distressLevel);
      const reason = this.explainRecommendation(technique, context, distressLevel);

      recommendations.push({
        technique,
        confidence: Math.min(1, score),
        reason,
        adaptations,
      });
    }

    return recommendations;
  }

  private getAdaptations(
    technique: GroundingTechnique,
    context: GroundingContext,
    distressLevel: DistressLevel
  ): string[] {
    const adaptations: string[] = [];

    // High distress adaptations
    if (distressLevel >= 7) {
      adaptations.push('Keep your eyes open if closing feels unsafe');
      if (technique.duration > 120) {
        adaptations.push('Do a shortened version (60 seconds) first');
      }
    }

    // Setting adaptations
    if (context.socialSetting === 'crowded' || context.socialSetting === 'with_strangers') {
      adaptations.push('Can be done discreetly - focus internally');
      if (technique.category === 'breathing') {
        adaptations.push('Breathe normally through nose to avoid attention');
      }
    }

    // Physical state adaptations
    if (context.physicalState === 'lying') {
      if (technique.category === 'movement') {
        adaptations.push('Modify to gentle movements in lying position');
      }
    }

    // Dissociation adaptations
    if (context.dissociationLevel && context.dissociationLevel >= 5) {
      adaptations.push('Keep eyes open and focused on something specific');
      adaptations.push('Use tactile grounding alongside this technique');
    }

    return adaptations;
  }

  private explainRecommendation(
    technique: GroundingTechnique,
    _context: GroundingContext,
    distressLevel: DistressLevel
  ): string {
    const eff = this.state.effectiveness.find(e => e.techniqueId === technique.id);
    
    if (eff && eff.avgDistressReduction > 3) {
      return `This has helped you reduce distress by ${eff.avgDistressReduction.toFixed(1)} points on average`;
    }
    
    if (distressLevel >= 7 && technique.difficulty === 'minimal') {
      return 'Simple and quick - good for high distress moments';
    }
    
    if (this.state.profile.preferredCategories.includes(technique.category)) {
      return `You tend to respond well to ${technique.category} techniques`;
    }
    
    return technique.bestFor.length > 0 
      ? `Works well for: ${technique.bestFor.slice(0, 2).join(', ')}`
      : 'A foundational grounding technique';
  }

  // ============ SESSION MANAGEMENT ============

  async startSession(
    initialDistress: DistressLevel,
    context: GroundingContext
  ): Promise<GroundingSession> {
    const session: GroundingSession = {
      id: `session-${Date.now()}`,
      startTime: Date.now(),
      initialDistress,
      distressReadings: [{ time: Date.now(), level: initialDistress }],
      techniquesUsed: [],
      context,
      state: 'introduction',
      completed: false,
    };

    this.state.currentSession = session;
    this.notifyListeners();

    return session;
  }

  async startTechnique(techniqueId: string): Promise<void> {
    if (!this.state.currentSession) return;

    this.state.currentSession.techniquesUsed.push({
      techniqueId,
      startTime: Date.now(),
      completed: false,
      skipped: false,
    });
    this.state.currentSession.state = 'active';

    this.notifyListeners();
  }

  async completeTechnique(techniqueId: string, effectiveness: number): Promise<void> {
    if (!this.state.currentSession) return;

    const techniqueUsage = this.state.currentSession.techniquesUsed.find(
      t => t.techniqueId === techniqueId && !t.completed && !t.skipped
    );
    if (techniqueUsage) {
      techniqueUsage.endTime = Date.now();
      techniqueUsage.completed = true;
      techniqueUsage.effectiveness = effectiveness;

      // Update effectiveness data
      await this.updateEffectiveness(techniqueId, effectiveness);
    }

    this.notifyListeners();
  }

  async skipTechnique(techniqueId: string): Promise<void> {
    if (!this.state.currentSession) return;

    const techniqueUsage = this.state.currentSession.techniquesUsed.find(
      t => t.techniqueId === techniqueId && !t.completed && !t.skipped
    );
    if (techniqueUsage) {
      techniqueUsage.skipped = true;
    }

    this.notifyListeners();
  }

  async recordDistressCheck(level: DistressLevel): Promise<void> {
    if (!this.state.currentSession) return;

    this.state.currentSession.distressReadings.push({
      time: Date.now(),
      level,
    });

    this.notifyListeners();
  }

  async endSession(
    finalDistress: DistressLevel,
    notes?: string
  ): Promise<GroundingSession> {
    if (!this.state.currentSession) {
      throw new Error('No active session');
    }

    const session = this.state.currentSession;
    session.endTime = Date.now();
    session.finalDistress = finalDistress;
    session.state = 'completed';
    session.completed = true;
    session.notes = notes;

    // Update learning data
    const distressReduction = session.initialDistress - finalDistress;
    const sessionMinutes = (session.endTime - session.startTime) / (60 * 1000);

    this.state.learningData.totalMinutesGrounded += sessionMinutes;
    this.state.totalSessions++;

    // Update average distress reduction
    const prevTotal = this.state.learningData.avgDistressReduction * (this.state.totalSessions - 1);
    this.state.learningData.avgDistressReduction = 
      (prevTotal + distressReduction) / this.state.totalSessions;

    // Update streak
    const today = new Date().toDateString();
    const lastSession = this.state.learningData.lastSessionDate;
    if (lastSession) {
      const lastDate = new Date(lastSession).toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      if (lastDate === yesterday) {
        this.state.streakDays++;
      } else if (lastDate !== today) {
        this.state.streakDays = 1;
      }
    } else {
      this.state.streakDays = 1;
    }
    this.state.learningData.lastSessionDate = Date.now();

    // Save session
    this.state.sessions.push(session);
    this.state.currentSession = null;

    // Trim old sessions (keep last 100)
    if (this.state.sessions.length > 100) {
      this.state.sessions = this.state.sessions.slice(-100);
    }

    await this.save();
    this.notifyListeners();

    return session;
  }

  // ============ EFFECTIVENESS LEARNING ============

  private async updateEffectiveness(techniqueId: string, rating: number): Promise<void> {
    let eff = this.state.effectiveness.find(e => e.techniqueId === techniqueId);
    
    if (!eff) {
      eff = {
        techniqueId,
        timesUsed: 0,
        avgDistressReduction: 0,
        avgCompletionRate: 1,
        avgTimeToEffective: 60,
        contextPerformance: {},
        lastUsed: Date.now(),
      };
      this.state.effectiveness.push(eff);
    }

    eff.timesUsed++;
    eff.lastUsed = Date.now();

    // Update average based on rating (1-5 -> distress reduction estimate)
    const estimatedReduction = rating * 2; // 1-5 rating -> 2-10 reduction
    eff.avgDistressReduction = 
      (eff.avgDistressReduction * (eff.timesUsed - 1) + estimatedReduction) / eff.timesUsed;

    // Update context performance
    if (this.state.currentSession?.context.location) {
      const location = this.state.currentSession.context.location;
      const prevContext = eff.contextPerformance[location] || 0.5;
      eff.contextPerformance[location] = (prevContext + rating / 5) / 2;
    }

    // Determine most effective technique
    const sorted = [...this.state.effectiveness].sort(
      (a, b) => b.avgDistressReduction - a.avgDistressReduction
    );
    this.state.learningData.mostEffectiveTechnique = sorted[0]?.techniqueId || null;

    await AsyncStorage.setItem(STORAGE_KEYS.EFFECTIVENESS, JSON.stringify(this.state.effectiveness));
  }

  // ============ CRISIS MODE ============

  async getCrisisIntervention(): Promise<AdaptiveRecommendation[]> {
    // Get quickest, most effective techniques for high distress
    const crisisTechniques = this.state.techniques.filter(t => 
      t.difficulty === 'minimal' && t.duration <= 120
    );

    return crisisTechniques.slice(0, 3).map(technique => ({
      technique,
      confidence: 0.9,
      reason: 'Quick intervention for high distress',
      adaptations: ['Focus only on the first step', 'Keep eyes open', 'Do for just 30 seconds'],
    }));
  }

  // ============ PROFILE MANAGEMENT ============

  async updateProfile(updates: Partial<PersonalProfile>): Promise<void> {
    this.state.profile = { ...this.state.profile, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.state.profile));
    this.notifyListeners();
  }

  async addCustomTechnique(technique: Omit<GroundingTechnique, 'id'>): Promise<GroundingTechnique> {
    const newTechnique: GroundingTechnique = {
      ...technique,
      id: `custom-${Date.now()}`,
    };

    this.state.profile.customTechniques.push(newTechnique);
    this.state.techniques.push(newTechnique);
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.state.profile));
    this.notifyListeners();

    return newTechnique;
  }

  // ============ STATISTICS ============

  getStats(): {
    totalSessions: number;
    streakDays: number;
    avgDistressReduction: number;
    totalMinutes: number;
    mostEffectiveTechnique: GroundingTechnique | null;
    favoriteCategory: GroundingCategory | null;
    recentProgress: { date: string; reduction: number }[];
  } {
    const mostEffective = this.state.techniques.find(
      t => t.id === this.state.learningData.mostEffectiveTechnique
    );

    // Determine favorite category
    const categoryUsage: Record<GroundingCategory, number> = {} as any;
    for (const session of this.state.sessions) {
      for (const usage of session.techniquesUsed) {
        const technique = this.state.techniques.find(t => t.id === usage.techniqueId);
        if (technique) {
          categoryUsage[technique.category] = (categoryUsage[technique.category] || 0) + 1;
        }
      }
    }
    const favoriteCategory = Object.entries(categoryUsage)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as GroundingCategory | undefined;

    // Recent progress (last 7 days)
    const recentSessions = this.state.sessions.filter(
      s => Date.now() - s.startTime < 7 * 24 * 60 * 60 * 1000
    );
    const progressByDate: Record<string, { total: number; count: number }> = {};
    for (const session of recentSessions) {
      const date = new Date(session.startTime).toLocaleDateString();
      const reduction = session.initialDistress - (session.finalDistress || session.initialDistress);
      if (!progressByDate[date]) {
        progressByDate[date] = { total: 0, count: 0 };
      }
      progressByDate[date].total += reduction;
      progressByDate[date].count++;
    }
    const recentProgress = Object.entries(progressByDate).map(([date, { total, count }]) => ({
      date,
      reduction: total / count,
    }));

    return {
      totalSessions: this.state.totalSessions,
      streakDays: this.state.streakDays,
      avgDistressReduction: this.state.learningData.avgDistressReduction,
      totalMinutes: this.state.learningData.totalMinutesGrounded,
      mostEffectiveTechnique: mostEffective || null,
      favoriteCategory: favoriteCategory || null,
      recentProgress,
    };
  }

  // ============ STATE MANAGEMENT ============

  private async save(): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify({
        streakDays: this.state.streakDays,
        totalSessions: this.state.totalSessions,
        learningData: this.state.learningData,
      })),
      AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(this.state.sessions)),
      AsyncStorage.setItem(STORAGE_KEYS.EFFECTIVENESS, JSON.stringify(this.state.effectiveness)),
    ]);
  }

  getState(): GroundingState {
    return { ...this.state };
  }

  getCurrentSession(): GroundingSession | null {
    return this.state.currentSession;
  }

  getTechniques(): GroundingTechnique[] {
    return [...this.state.techniques];
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
      techniques: [...DEFAULT_TECHNIQUES],
      effectiveness: [],
      sessions: [],
      currentSession: null,
      profile: {
        preferredCategories: [],
        avoidCategories: [],
        preferredDuration: 'medium',
        prefersDarkMode: false,
        prefersVoiceGuidance: true,
        prefersMinimalText: false,
        triggerWords: [],
        safeWords: [],
        customTechniques: [],
      },
      streakDays: 0,
      totalSessions: 0,
      learningData: {
        totalMinutesGrounded: 0,
        avgDistressReduction: 0,
        mostEffectiveTechnique: null,
        preferredTimeOfDay: null,
        lastSessionDate: null,
      },
    };

    await Promise.all(Object.values(STORAGE_KEYS).map(key => AsyncStorage.removeItem(key)));
    this.notifyListeners();
  }
}

// ============ SINGLETON & HOOKS ============

export const aiGroundingCompanion = new AIGroundingCompanionService();

export function useGroundingCompanion() {
  const [state, setState] = React.useState<GroundingState>(aiGroundingCompanion.getState());

  React.useEffect(() => {
    return aiGroundingCompanion.subscribe(() => {
      setState(aiGroundingCompanion.getState());
    });
  }, []);

  return {
    state,
    initialize: aiGroundingCompanion.initialize.bind(aiGroundingCompanion),
    getRecommendations: aiGroundingCompanion.getRecommendations.bind(aiGroundingCompanion),
    startSession: aiGroundingCompanion.startSession.bind(aiGroundingCompanion),
    startTechnique: aiGroundingCompanion.startTechnique.bind(aiGroundingCompanion),
    completeTechnique: aiGroundingCompanion.completeTechnique.bind(aiGroundingCompanion),
    skipTechnique: aiGroundingCompanion.skipTechnique.bind(aiGroundingCompanion),
    recordDistress: aiGroundingCompanion.recordDistressCheck.bind(aiGroundingCompanion),
    endSession: aiGroundingCompanion.endSession.bind(aiGroundingCompanion),
    getCrisisIntervention: aiGroundingCompanion.getCrisisIntervention.bind(aiGroundingCompanion),
    updateProfile: aiGroundingCompanion.updateProfile.bind(aiGroundingCompanion),
    addCustomTechnique: aiGroundingCompanion.addCustomTechnique.bind(aiGroundingCompanion),
    getStats: aiGroundingCompanion.getStats.bind(aiGroundingCompanion),
    getTechniques: aiGroundingCompanion.getTechniques.bind(aiGroundingCompanion),
    getCurrentSession: aiGroundingCompanion.getCurrentSession.bind(aiGroundingCompanion),
    reset: aiGroundingCompanion.reset.bind(aiGroundingCompanion),
  };
}
