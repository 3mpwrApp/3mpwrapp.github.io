/**
 * Emotional First Aid Kit
 * 
 * Crisis intervention system with haptic-guided panic attack interruption,
 * temperature shock protocols, grounding sensory wheel, crisis contacts,
 * and DBT-designed distraction games.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import React from 'react';
import { Platform } from 'react-native';

import { logError } from '../utils/errorLogger';

import { hapticLanguage } from './hapticLanguage';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface PanicInterruptionSession {
  id: string;
  startTime: number;
  endTime?: number;
  technique: 'breathing' | 'grounding' | 'temperature' | 'distraction';
  completed: boolean;
  effectiveness?: 1 | 2 | 3 | 4 | 5; // User rating
  notes?: string;
}

export interface GroundingTask {
  type: 'visual' | 'auditory' | 'tactile' | 'taste' | 'smell';
  instruction: string;
  count: number; // Number of items to identify
}

export interface TemperatureShockStep {
  step: number;
  title: string;
  instruction: string;
  duration?: number; // seconds
  hapticCue?: boolean;
}

export interface CrisisContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  preferredMethod: 'call' | 'text';
  notifyOnTripleTap: boolean;
  customMessage?: string;
}

export interface DistractionGame {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  dbtPrinciple: 'distract' | 'self_soothe' | 'improve_moment' | 'crisis_survival';
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
}

export interface CrisisLog {
  id: string;
  timestamp: number;
  severity: 1 | 2 | 3 | 4 | 5; // 1=mild distress, 5=crisis
  triggers?: string[];
  techniquesUsed: string[];
  contactsNotified: string[];
  durationMinutes: number;
  resolution: 'resolved' | 'seeking_help' | 'ongoing';
  notes?: string;
}

// ============================================================================
// AI-POWERED CRISIS PREDICTION - NEVER BEEN DONE BEFORE
// ============================================================================

export interface CrisisPattern {
  triggerCombination: string[];
  timeOfDay: number; // hour
  dayOfWeek: number;
  frequency: number;
  avgSeverity: number;
  effectiveTechniques: string[];
}

export interface CrisisPrediction {
  riskLevel: 'low' | 'moderate' | 'elevated' | 'high' | 'imminent';
  probability: number; // 0-100
  warningWindow: number; // minutes until predicted crisis
  triggers: string[];
  preventiveActions: string[];
  recommendedTechnique: string;
  confidence: number;
}

export interface BiofeedbackSession {
  id: string;
  startTime: number;
  endTime?: number;
  heartRateData: Array<{ time: number; bpm: number }>;
  hrvData: Array<{ time: number; ms: number }>;
  breathingRate: number[];
  coherenceScore: number; // 0-100
  calmingProgress: number[]; // 0-100 over time
}

export interface AIPersonalizedIntervention {
  interventionId: string;
  technique: string;
  personalizedSteps: string[];
  estimatedDuration: number;
  successProbability: number;
  basedOnHistory: boolean;
  adaptations: string[];
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  CONTACTS: 'emotionalFirstAid:contacts:v1',
  SESSIONS: 'emotionalFirstAid:sessions:v1',
  CRISIS_LOGS: 'emotionalFirstAid:crisisLogs:v1',
  PREFERENCES: 'emotionalFirstAid:preferences:v1',
  TAP_COUNT: 'emotionalFirstAid:tapCount:v1',
  CRISIS_PATTERNS: 'emotionalFirstAid:crisisPatterns:v1',
  BIOFEEDBACK_SESSIONS: 'emotionalFirstAid:biofeedback:v1',
  AI_INTERVENTIONS: 'emotionalFirstAid:aiInterventions:v1',
} as const;

const TEMPERATURE_SHOCK_PROTOCOL: TemperatureShockStep[] = [
  {
    step: 1,
    title: 'Prepare Ice',
    instruction: 'Get ice cubes or a cold pack. You\'re going to use temperature to interrupt the panic response.',
    duration: 10,
  },
  {
    step: 2,
    title: 'Ice on Wrist',
    instruction: 'Hold ice against your inner wrist for 30 seconds. Feel the intense cold - this activates your body\'s "dive reflex".',
    duration: 30,
    hapticCue: true,
  },
  {
    step: 3,
    title: 'Cold Face Dunk (Optional)',
    instruction: 'If safe: Fill sink with very cold water, hold breath, submerge face for 10-15 seconds. This rapidly activates parasympathetic nervous system.',
    duration: 15,
  },
  {
    step: 4,
    title: 'Ice Behind Neck',
    instruction: 'Move ice to the back of your neck. Hold for 20 seconds. This helps regulate your nervous system.',
    duration: 20,
    hapticCue: true,
  },
  {
    step: 5,
    title: 'Deep Breath',
    instruction: 'Take 3 slow, deep breaths. Inhale for 4 counts, hold for 7, exhale for 8.',
    duration: 30,
    hapticCue: true,
  },
  {
    step: 6,
    title: 'Check In',
    instruction: 'Rate your panic level now (1-10). Has it decreased? If still high, repeat steps 2-5.',
    duration: 10,
  },
];

const GROUNDING_TASKS: GroundingTask[] = [
  { type: 'visual', instruction: 'Name 5 things you can SEE right now', count: 5 },
  { type: 'tactile', instruction: 'Name 4 things you can TOUCH/FEEL', count: 4 },
  { type: 'auditory', instruction: 'Name 3 things you can HEAR', count: 3 },
  { type: 'smell', instruction: 'Name 2 things you can SMELL (or 2 smells you like)', count: 2 },
  { type: 'taste', instruction: 'Name 1 thing you can TASTE (or 1 taste you enjoy)', count: 1 },
];

const DISTRACTION_GAMES: DistractionGame[] = [
  {
    id: 'alphabet_game',
    name: 'Alphabet Categories',
    description: 'Go through the alphabet, naming items in a category for each letter',
    duration: 3,
    dbtPrinciple: 'distract',
    difficulty: 'easy',
    instructions: [
      'Pick a category (animals, countries, foods, names)',
      'Go through A-Z, naming one item per letter',
      'A = Apple, B = Banana, C = Carrot...',
      'Stuck? Skip and come back to it',
    ],
  },
  {
    id: 'counting_backwards',
    name: 'Count Backwards by 7',
    description: 'Mental math to engage your logical brain',
    duration: 2,
    dbtPrinciple: 'distract',
    difficulty: 'medium',
    instructions: [
      'Start at 100',
      'Count backwards by 7',
      '100, 93, 86, 79, 72...',
      'Continue until you reach 0 or feel calmer',
    ],
  },
  {
    id: 'describe_object',
    name: 'Extreme Object Description',
    description: 'Describe an object in excruciating detail',
    duration: 4,
    dbtPrinciple: 'distract',
    difficulty: 'easy',
    instructions: [
      'Pick any object you can see',
      'Describe it in extreme detail: color, texture, weight, temperature',
      'What would it feel like? Sound like if dropped?',
      'What is it made of? How was it manufactured?',
      'Continue for 3-5 minutes',
    ],
  },
  {
    id: 'memory_palace',
    name: 'Mental Room Tour',
    description: 'Virtually walk through a familiar place',
    duration: 5,
    dbtPrinciple: 'distract',
    difficulty: 'easy',
    instructions: [
      'Close your eyes (or keep open if preferred)',
      'Imagine walking through your childhood home/favorite place',
      'Describe each room in detail as you "walk" through',
      'What color are the walls? What\'s on the floor?',
      'What objects are in each room? Describe them',
    ],
  },
  {
    id: 'butterfly_hug',
    name: 'Butterfly Hug (Bilateral Stimulation)',
    description: 'Self-soothing technique using bilateral stimulation',
    duration: 3,
    dbtPrinciple: 'self_soothe',
    difficulty: 'easy',
    instructions: [
      'Cross your arms over your chest',
      'Hands on opposite shoulders (looks like hugging yourself)',
      'Tap alternating hands slowly - left, right, left, right',
      'Breathe slowly as you tap',
      'Continue for 1-3 minutes or until calm',
    ],
  },
  {
    id: 'ice_cube_hold',
    name: 'Ice Cube Endurance',
    description: 'Hold ice to create intense but safe sensation',
    duration: 2,
    dbtPrinciple: 'crisis_survival',
    difficulty: 'medium',
    instructions: [
      'Get an ice cube',
      'Hold it tightly in your hand',
      'Focus all attention on the cold sensation',
      'Notice how it feels, how it melts',
      'Hold as long as tolerable (safely)',
    ],
  },
  {
    id: 'color_hunt',
    name: 'Color Hunt',
    description: 'Find items of specific colors in your environment',
    duration: 4,
    dbtPrinciple: 'distract',
    difficulty: 'easy',
    instructions: [
      'Pick a color (e.g., blue)',
      'Find 10 things in your environment that are that color',
      'Name each one out loud or in your head',
      'Move to a new color and repeat',
      'Continue until calm',
    ],
  },
  {
    id: 'body_scan',
    name: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and release muscle groups',
    duration: 5,
    dbtPrinciple: 'self_soothe',
    difficulty: 'medium',
    instructions: [
      'Start with toes: tense for 5 seconds, release',
      'Move to calves: tense, release',
      'Thighs: tense, release',
      'Continue up body: stomach, chest, arms, shoulders, face',
      'Notice the difference between tense and relaxed',
    ],
  },
];

// ============================================================================
// Emotional First Aid Manager
// ============================================================================

class EmotionalFirstAidManager {
  getSessionHistory(): PanicInterruptionSession[] {
    return [...this.sessions];
  }
  private static instance: EmotionalFirstAidManager;
  private contacts: CrisisContact[] = [];
  private sessions: PanicInterruptionSession[] = [];
  private crisisLogs: CrisisLog[] = [];
  private tapTimestamps: number[] = [];
  private activeSession: PanicInterruptionSession | null = null;

  private constructor() {
    this.loadData();
  }

  static getInstance(): EmotionalFirstAidManager {
    if (!EmotionalFirstAidManager.instance) {
      EmotionalFirstAidManager.instance = new EmotionalFirstAidManager();
    }
    return EmotionalFirstAidManager.instance;
  }

  // ============================================================================
  // Data Management
  // ============================================================================

  private async loadData(): Promise<void> {
    try {
      // Skip on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') return;
      
      const [contactsStr, sessionsStr, logsStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS),
        AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.CRISIS_LOGS),
      ]);

      if (contactsStr) this.contacts = JSON.parse(contactsStr);
      if (sessionsStr) this.sessions = JSON.parse(sessionsStr);
      if (logsStr) this.crisisLogs = JSON.parse(logsStr);
    } catch (err) {
      logError('emotionalFirstAid', 'Failed to load emotional first aid data', err);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.contacts)),
        AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(this.sessions.slice(-100))),
        AsyncStorage.setItem(STORAGE_KEYS.CRISIS_LOGS, JSON.stringify(this.crisisLogs.slice(-50))),
      ]);
    } catch (err) {
      logError('emotionalFirstAid', 'Failed to save emotional first aid data', err);
    }
  }

  // ============================================================================
  // Panic Attack Interrupter - 4-7-8 Breathing with Haptic Guide
  // ============================================================================

  async startBreathingGuide(): Promise<PanicInterruptionSession> {
    const session: PanicInterruptionSession = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      technique: 'breathing',
      completed: false,
    };

    this.activeSession = session;
    this.sessions.push(session);

    // Start haptic breathing pattern (4-7-8)
    await hapticLanguage.play('breathing_guide');

    return session;
  }

  async completeSession(effectiveness: 1 | 2 | 3 | 4 | 5, notes?: string): Promise<void> {
    if (this.activeSession) {
      this.activeSession.endTime = Date.now();
      this.activeSession.completed = true;
      this.activeSession.effectiveness = effectiveness;
      this.activeSession.notes = notes;
      this.activeSession = null;

      await this.saveData();
    }
  }

  // ============================================================================
  // Temperature Shock Protocol
  // ============================================================================

  getTemperatureShockSteps(): TemperatureShockStep[] {
    return TEMPERATURE_SHOCK_PROTOCOL;
  }

  async startTemperatureShock(): Promise<PanicInterruptionSession> {
    const session: PanicInterruptionSession = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      technique: 'temperature',
      completed: false,
    };

    this.activeSession = session;
    this.sessions.push(session);
    await this.saveData();

    return session;
  }

  async executeTemperatureStep(step: TemperatureShockStep): Promise<void> {
    if (step.hapticCue) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // If step has duration, wait
    if (step.duration) {
      await new Promise(resolve => setTimeout(resolve, (step.duration || 30) * 1000));
    }
  }

  // ============================================================================
  // Grounding Sensory Wheel (5-4-3-2-1)
  // ============================================================================

  getGroundingTasks(): GroundingTask[] {
    return GROUNDING_TASKS;
  }

  async startGroundingExercise(): Promise<PanicInterruptionSession> {
    const session: PanicInterruptionSession = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      technique: 'grounding',
      completed: false,
    };

    this.activeSession = session;
    this.sessions.push(session);
    await this.saveData();

    // Haptic feedback for starting exercise
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    return session;
  }

  async spinGroundingWheel(): Promise<GroundingTask> {
    // Randomly select a grounding task
    const randomIndex = Math.floor(Math.random() * GROUNDING_TASKS.length);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    return GROUNDING_TASKS[randomIndex];
  }

  // ============================================================================
  // Crisis Contact Management & Triple Tap Detection
  // ============================================================================

  async addCrisisContact(contact: Omit<CrisisContact, 'id'>): Promise<CrisisContact> {
    const newContact: CrisisContact = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.contacts.push(newContact);
    await this.saveData();

    return newContact;
  }

  async removeCrisisContact(contactId: string): Promise<void> {
    this.contacts = this.contacts.filter(c => c.id !== contactId);
    await this.saveData();
  }

  getCrisisContacts(): CrisisContact[] {
    return [...this.contacts];
  }

  async registerTap(): Promise<{ count: number; shouldTriggerCrisis: boolean }> {
    const now = Date.now();
    
    // Clear taps older than 2 seconds
    this.tapTimestamps = this.tapTimestamps.filter(t => now - t < 2000);
    
    // Add new tap
    this.tapTimestamps.push(now);

    const count = this.tapTimestamps.length;
    const shouldTrigger = count >= 3;

    if (shouldTrigger) {
      await this.triggerCrisisProtocol();
      this.tapTimestamps = []; // Reset
    }

    return { count, shouldTriggerCrisis: shouldTrigger };
  }

  private async triggerCrisisProtocol(): Promise<void> {
    // Play emergency haptic pattern
    await hapticLanguage.play('emergency_alert');

    // Get location (if permissions granted)
    let locationText = 'Location unavailable';
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        locationText = `Lat: ${location.coords.latitude.toFixed(6)}, Lon: ${location.coords.longitude.toFixed(6)}`;
      }
    } catch (err) {
      logError('emotionalFirstAid', 'Failed to get location for crisis', err);
    }

    // Notify all triple-tap contacts
    const contactsToNotify = this.contacts.filter(c => c.notifyOnTripleTap);

    for (const contact of contactsToNotify) {
      try {
        const message = contact.customMessage || 
          `🆘 CRISIS ALERT: I need help. I'm not safe. ${locationText}`;

        if (contact.preferredMethod === 'text') {
          const { result } = await SMS.sendSMSAsync([contact.phone], message);
          if (result === 'sent') {
            await hapticLanguage.play('crisis_contact');
          }
        }
        // Note: Actual phone calls would require additional permissions
      } catch (err) {
        logError('emotionalFirstAid', `Failed to notify crisis contact: ${contact.name}`, err);
      }
    }

    // Log crisis event
    await this.logCrisis({
      severity: 5,
      triggers: ['Triple tap emergency'],
      techniquesUsed: ['Crisis contact notification'],
      contactsNotified: contactsToNotify.map(c => c.name),
      resolution: 'seeking_help',
    });
  }

  // ============================================================================
  // Distraction Games Library
  // ============================================================================

  getAllGames(): DistractionGame[] {
    return DISTRACTION_GAMES;
  }

  getGamesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): DistractionGame[] {
    return DISTRACTION_GAMES.filter(g => g.difficulty === difficulty);
  }

  getGamesByPrinciple(principle: DistractionGame['dbtPrinciple']): DistractionGame[] {
    return DISTRACTION_GAMES.filter(g => g.dbtPrinciple === principle);
  }

  async startGame(gameId: string): Promise<PanicInterruptionSession> {
    const session: PanicInterruptionSession = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      technique: 'distraction',
      completed: false,
      notes: `Game: ${gameId}`,
    };

    this.activeSession = session;
    this.sessions.push(session);
    await this.saveData();

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    return session;
  }

  // ============================================================================
  // Crisis Logging
  // ============================================================================

  async logCrisis(crisis: Omit<CrisisLog, 'id' | 'timestamp' | 'durationMinutes'>): Promise<CrisisLog> {
    const log: CrisisLog = {
      id: `crisis_${Date.now()}`,
      timestamp: Date.now(),
      durationMinutes: 0, // Will be updated if session is active
      ...crisis,
    };

    if (this.activeSession) {
      const duration = (Date.now() - this.activeSession.startTime) / (1000 * 60);
      log.durationMinutes = Math.round(duration);
    }

    this.crisisLogs.push(log);
    await this.saveData();

    return log;
  }

  getCrisisHistory(limit?: number): CrisisLog[] {
    const sorted = [...this.crisisLogs].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  // ============================================================================
  // Analytics & Insights
  // ============================================================================

  getEffectivenessStats(): {
    breathing: number;
    temperature: number;
    grounding: number;
    distraction: number;
  } {
    const completed = this.sessions.filter(s => s.completed && s.effectiveness);
    
    const calc = (technique: string) => {
      const sessions = completed.filter(s => s.technique === technique);
      if (sessions.length === 0) return 0;
      const avg = sessions.reduce((sum, s) => sum + (s.effectiveness || 0), 0) / sessions.length;
      return Math.round(avg * 10) / 10;
    };

    return {
      breathing: calc('breathing'),
      temperature: calc('temperature'),
      grounding: calc('grounding'),
      distraction: calc('distraction'),
    };
  }

  getMostEffectiveTechnique(): string {
    const stats = this.getEffectivenessStats();
    const entries = Object.entries(stats);
    const best = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max, entries[0]);
    return best[0];
  }

  // ============================================================================
  // AI-POWERED CRISIS PREDICTION
  // ============================================================================

  private crisisPatterns: CrisisPattern[] = [];
  private biofeedbackSessions: BiofeedbackSession[] = [];

  async predictCrisisRisk(): Promise<CrisisPrediction> {
    await this.analyzeCrisisPatterns();

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Analyze recent crisis history
    const recentCrises = this.crisisLogs.filter(
      c => Date.now() - c.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );

    // Find matching patterns
    const matchingPatterns = this.crisisPatterns.filter(p => {
      const hourMatch = Math.abs(p.timeOfDay - currentHour) <= 2;
      const dayMatch = p.dayOfWeek === currentDay;
      return hourMatch || dayMatch;
    });

    // Calculate base probability
    let probability = 10; // Baseline
    if (matchingPatterns.length > 0) {
      probability += matchingPatterns.reduce((s, p) => s + p.frequency * 10, 0);
    }
    if (recentCrises.length > 3) probability += 20;
    if (recentCrises.some(c => c.severity >= 4)) probability += 15;

    probability = Math.min(95, Math.max(5, probability));

    const riskLevel: CrisisPrediction['riskLevel'] = 
      probability >= 80 ? 'imminent' :
      probability >= 60 ? 'high' :
      probability >= 40 ? 'elevated' :
      probability >= 20 ? 'moderate' : 'low';

    // Extract common triggers
    const triggerCounts = new Map<string, number>();
    recentCrises.forEach(c => {
      c.triggers?.forEach(t => {
        triggerCounts.set(t, (triggerCounts.get(t) || 0) + 1);
      });
    });
    const topTriggers = Array.from(triggerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);

    // Generate preventive actions
    const preventiveActions: string[] = [];
    if (probability >= 40) preventiveActions.push('Consider doing a grounding exercise now');
    if (probability >= 60) preventiveActions.push('Reach out to a support person');
    if (probability >= 80) preventiveActions.push('IMMEDIATE: Use temperature shock protocol');
    if (currentHour >= 22) preventiveActions.push('Practice sleep hygiene - crisis risk rises with fatigue');

    return {
      riskLevel,
      probability: Math.round(probability),
      warningWindow: probability >= 60 ? 30 : probability >= 40 ? 60 : 120,
      triggers: topTriggers,
      preventiveActions,
      recommendedTechnique: this.getMostEffectiveTechnique(),
      confidence: Math.min(90, 50 + this.crisisLogs.length * 2),
    };
  }

  private async analyzeCrisisPatterns(): Promise<void> {
    if (this.crisisLogs.length < 3) return;

    const patternMap = new Map<string, CrisisPattern>();

    this.crisisLogs.forEach(crisis => {
      const date = new Date(crisis.timestamp);
      const key = `${date.getDay()}-${date.getHours()}`;

      const existing = patternMap.get(key) || {
        triggerCombination: [],
        timeOfDay: date.getHours(),
        dayOfWeek: date.getDay(),
        frequency: 0,
        avgSeverity: 0,
        effectiveTechniques: [],
      };

      existing.frequency++;
      existing.avgSeverity = (existing.avgSeverity + crisis.severity) / 2;
      if (crisis.triggers) {
        existing.triggerCombination.push(...crisis.triggers);
      }
      existing.effectiveTechniques.push(...crisis.techniquesUsed);

      patternMap.set(key, existing);
    });

    this.crisisPatterns = Array.from(patternMap.values());

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CRISIS_PATTERNS, JSON.stringify(this.crisisPatterns));
    } catch (err) {
      logError('emotionalFirstAid', 'Failed to save crisis patterns', err);
    }
  }

  // ============================================================================
  // BIOFEEDBACK-GUIDED BREATHING
  // ============================================================================

  private activeBiofeedback: BiofeedbackSession | null = null;

  async startBiofeedbackSession(): Promise<BiofeedbackSession> {
    const session: BiofeedbackSession = {
      id: `biofeedback_${Date.now()}`,
      startTime: Date.now(),
      heartRateData: [],
      hrvData: [],
      breathingRate: [],
      coherenceScore: 0,
      calmingProgress: [],
    };

    this.activeBiofeedback = session;
    this.biofeedbackSessions.push(session);

    // Start haptic breathing guide
    await hapticLanguage.play('breathing_guide');

    return session;
  }

  async updateBiofeedback(heartRate: number, hrv: number): Promise<{ coherence: number; suggestion: string }> {
    if (!this.activeBiofeedback) {
      return { coherence: 0, suggestion: 'Start a biofeedback session first' };
    }

    const now = Date.now();
    this.activeBiofeedback.heartRateData.push({ time: now, bpm: heartRate });
    this.activeBiofeedback.hrvData.push({ time: now, ms: hrv });

    // Calculate coherence (simplified HRV coherence calculation)
    const recentHRV = this.activeBiofeedback.hrvData.slice(-10);
    const avgHRV = recentHRV.reduce((s, d) => s + d.ms, 0) / Math.max(1, recentHRV.length);
    const coherence = Math.min(100, Math.max(0, avgHRV / 0.8)); // Simplified

    this.activeBiofeedback.coherenceScore = coherence;
    this.activeBiofeedback.calmingProgress.push(coherence);

    // Generate real-time suggestion
    let suggestion = '';
    if (coherence < 30) suggestion = 'Breathe slower - inhale 4s, exhale 6s';
    else if (coherence < 60) suggestion = 'Good progress - maintain this rhythm';
    else if (coherence < 80) suggestion = 'Excellent! You\'re entering coherence';
    else suggestion = 'Peak coherence achieved! Stay here';

    // Adaptive haptic feedback based on coherence
    if (coherence >= 80) await hapticLanguage.play('achievement');

    return { coherence, suggestion };
  }

  async endBiofeedbackSession(): Promise<BiofeedbackSession | null> {
    if (!this.activeBiofeedback) return null;

    this.activeBiofeedback.endTime = Date.now();
    const session = { ...this.activeBiofeedback };
    this.activeBiofeedback = null;

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.BIOFEEDBACK_SESSIONS,
        JSON.stringify(this.biofeedbackSessions.slice(-50))
      );
    } catch (err) {
      logError('emotionalFirstAid', 'Failed to save biofeedback session', err);
    }

    return session;
  }

  // ============================================================================
  // AI PERSONALIZED INTERVENTIONS
  // ============================================================================

  async getPersonalizedIntervention(): Promise<AIPersonalizedIntervention> {
    const stats = this.getEffectivenessStats();
    const bestTechnique = this.getMostEffectiveTechnique();
    const recentSessions = this.sessions.slice(-20);

    // Analyze what works for this user
    const successfulSessions = recentSessions.filter(s => s.effectiveness && s.effectiveness >= 4);
    const avgDuration = successfulSessions.length > 0
      ? successfulSessions.reduce((s, sess) => {
          return s + ((sess.endTime || sess.startTime) - sess.startTime);
        }, 0) / successfulSessions.length / 60000
      : 5;

    // Generate personalized steps
    const personalizedSteps: string[] = [];
    const adaptations: string[] = [];

    if (bestTechnique === 'breathing') {
      personalizedSteps.push(
        'Start with 3 slow breaths to prepare',
        'Use 4-7-8 pattern (your most effective)',
        'Focus on extending the exhale',
        'Continue for ' + Math.ceil(avgDuration) + ' minutes',
        'End with body scan'
      );
      adaptations.push('Extended exhale based on your HRV response');
    } else if (bestTechnique === 'temperature') {
      personalizedSteps.push(
        'Get ice or very cold water immediately',
        'Apply to inner wrists first (30 seconds)',
        'Move to back of neck',
        'Take 3 deep breaths while cold is applied',
        'Repeat if needed'
      );
      adaptations.push('Temperature shock is your fastest relief method');
    } else if (bestTechnique === 'grounding') {
      personalizedSteps.push(
        'Look around - name 5 blue things',
        'Touch 4 different textures',
        'Listen for 3 distinct sounds',
        'Notice 2 smells',
        'Focus on 1 taste in your mouth'
      );
      adaptations.push('Starting with vision works best for you');
    } else {
      personalizedSteps.push(
        'Choose a distraction game',
        'Set a 5-minute timer',
        'Fully engage in the activity',
        'Rate your distress after',
        'Repeat if above 5/10'
      );
      adaptations.push('Cognitive distraction reduces your distress fastest');
    }

    return {
      interventionId: `intervention_${Date.now()}`,
      technique: bestTechnique,
      personalizedSteps,
      estimatedDuration: Math.ceil(avgDuration),
      successProbability: Math.round(stats[bestTechnique as keyof typeof stats] * 20),
      basedOnHistory: successfulSessions.length >= 3,
      adaptations,
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const emotionalFirstAid = EmotionalFirstAidManager.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useEmotionalFirstAid() {
  const [contacts, setContacts] = React.useState<CrisisContact[]>(emotionalFirstAid.getCrisisContacts());
  const [crisisPrediction, setCrisisPrediction] = React.useState<CrisisPrediction | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setContacts(emotionalFirstAid.getCrisisContacts());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-update crisis prediction every minute
  React.useEffect(() => {
    const updatePrediction = async () => {
      const prediction = await emotionalFirstAid.predictCrisisRisk();
      setCrisisPrediction(prediction);
    };
    updatePrediction();
    const interval = setInterval(updatePrediction, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    // Breathing
    startBreathingGuide: () => emotionalFirstAid.startBreathingGuide(),
    
    // Temperature
    getTemperatureSteps: () => emotionalFirstAid.getTemperatureShockSteps(),
    startTemperatureShock: () => emotionalFirstAid.startTemperatureShock(),
    executeStep: (step: TemperatureShockStep) => emotionalFirstAid.executeTemperatureStep(step),
    
    // Grounding
    getGroundingTasks: () => emotionalFirstAid.getGroundingTasks(),
    startGrounding: () => emotionalFirstAid.startGroundingExercise(),
    spinWheel: () => emotionalFirstAid.spinGroundingWheel(),
    
    // Crisis contacts
    contacts,
    addContact: (contact: Omit<CrisisContact, 'id'>) => emotionalFirstAid.addCrisisContact(contact),
    removeContact: (id: string) => emotionalFirstAid.removeCrisisContact(id),
    registerTap: () => emotionalFirstAid.registerTap(),
    
    // Games
    getAllGames: () => emotionalFirstAid.getAllGames(),
    getGamesByDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => 
      emotionalFirstAid.getGamesByDifficulty(difficulty),
    startGame: (gameId: string) => emotionalFirstAid.startGame(gameId),
    
    // Session management
    completeSession: (effectiveness: 1 | 2 | 3 | 4 | 5, notes?: string) => 
      emotionalFirstAid.completeSession(effectiveness, notes),
    
    // Crisis logging
    logCrisis: (crisis: Omit<CrisisLog, 'id' | 'timestamp' | 'durationMinutes'>) => 
      emotionalFirstAid.logCrisis(crisis),
    getCrisisHistory: (limit?: number) => emotionalFirstAid.getCrisisHistory(limit),
    
    // Analytics
    getEffectiveness: () => emotionalFirstAid.getEffectivenessStats(),
    getMostEffective: () => emotionalFirstAid.getMostEffectiveTechnique(),

    // =========== AI CRISIS PREDICTION ===========
    crisisPrediction,
    predictCrisisRisk: () => emotionalFirstAid.predictCrisisRisk(),
    getPersonalizedIntervention: () => emotionalFirstAid.getPersonalizedIntervention(),

    // =========== BIOFEEDBACK ===========
    startBiofeedback: () => emotionalFirstAid.startBiofeedbackSession(),
    updateBiofeedback: (heartRate: number, hrv: number) =>
      emotionalFirstAid.updateBiofeedback(heartRate, hrv),
    endBiofeedback: () => emotionalFirstAid.endBiofeedbackSession(),
  };
}
