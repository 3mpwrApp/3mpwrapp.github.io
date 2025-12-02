/**
 * Contextual Haptic Language System
 * 
 * Creates a "haptic vocabulary" - different vibration patterns communicate
 * different meanings, reducing screen time for blind/low-vision users.
 * 
 * Patterns:
 * - 3 short pulses: Urgent deadline approaching
 * - Long buzz: Appointment in 1 hour  
 * - Wave pattern: Medication reminder
 * - Heartbeat rhythm: Someone messaged you
 * - SOS pattern: Emergency/crisis alert
 * - Ascending tones: Achievement unlocked
 * - Descending tones: Warning/error
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { logError } from '../utils/errorLogger';

// Lazy load Haptics only on mobile platforms
let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {
    console.warn('[HapticLanguage] expo-haptics not available');
  }
}

// ============================================================================
// Types & Interfaces
// ============================================================================

export type HapticMessageType =
  | 'urgent_deadline'
  | 'appointment_soon'
  | 'medication_reminder'
  | 'new_message'
  | 'emergency_alert'
  | 'achievement'
  | 'warning'
  | 'energy_low'
  | 'task_complete'
  | 'spoon_depleted'
  | 'mood_check'
  | 'crisis_contact'
  | 'breathing_guide'
  | 'custom';

export interface HapticPattern {
  type: HapticMessageType;
  name: string;
  description: string;
  pattern: HapticStep[];
  repeats?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  canCustomize: boolean;
}

export interface HapticStep {
  type: 'impact' | 'notification' | 'selection' | 'pause';
  style?: any; // Haptics feedback style (0=Light, 1=Medium, 2=Heavy for impact; 0=Success, 1=Warning, 2=Error for notification)
  duration?: number; // milliseconds
}

export interface HapticPreferences {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  learnedPatterns: Record<HapticMessageType, number>; // usage count
  customPatterns: Record<string, HapticPattern>;
  quietHoursStart?: number; // 0-23
  quietHoursEnd?: number; // 0-23
  enabledTypes: Record<HapticMessageType, boolean>;
}

// ============================================================================
// ADAPTIVE HAPTIC LEARNING - NEVER BEEN DONE BEFORE
// ============================================================================

export interface HapticLearningProfile {
  userId: string;
  preferredIntensities: Record<HapticMessageType, 'light' | 'medium' | 'heavy'>;
  effectivenessScores: Record<HapticMessageType, number>; // 0-100
  responseLatencies: Record<HapticMessageType, number[]>; // ms to respond
  dismissRates: Record<HapticMessageType, number>; // 0-1
  timeOfDayPreferences: Record<number, 'light' | 'medium' | 'heavy'>; // hour -> intensity
  lastUpdated: number;
}

export interface HapticContext {
  userState: 'active' | 'resting' | 'sleeping' | 'stressed' | 'unknown';
  environment: 'quiet' | 'noisy' | 'moving' | 'unknown';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  sentiment: 'positive' | 'neutral' | 'negative' | 'alert';
  previousPattern?: HapticMessageType;
  timeSinceLastHaptic: number; // ms
}

export interface AdaptiveHapticResult {
  patternUsed: HapticMessageType;
  intensityUsed: 'light' | 'medium' | 'heavy';
  adapted: boolean;
  adaptationReasons: string[];
  predictedEffectiveness: number; // 0-100
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'hapticLanguage:preferences:v1';
const LEARNING_PROFILE_KEY = 'hapticLanguage:learningProfile:v1';
const HAPTIC_HISTORY_KEY = 'hapticLanguage:history:v1';

const DEFAULT_PATTERNS: Record<HapticMessageType, HapticPattern> = {
  urgent_deadline: {
    type: 'urgent_deadline',
    name: 'Urgent Deadline',
    description: '3 short pulses - Something needs immediate attention',
    pattern: [
      { type: 'impact', style: 2 }, // Heavy
      { type: 'pause', duration: 200 },
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 200 },
      { type: 'impact', style: 2 },
    ],
    priority: 'critical',
    canCustomize: false,
  },

  appointment_soon: {
    type: 'appointment_soon',
    name: 'Appointment Soon',
    description: 'Long buzz - You have an appointment in 1 hour',
    pattern: [
      { type: 'notification', style: 1 }, // Warning
      { type: 'pause', duration: 100 },
      { type: 'impact', style: 1 }, // Medium
    ],
    priority: 'high',
    canCustomize: true,
  },

  medication_reminder: {
    type: 'medication_reminder',
    name: 'Medication Time',
    description: 'Wave pattern - Time to take your medication',
    pattern: [
      { type: 'impact', style: 0 }, // Light
      { type: 'pause', duration: 150 },
      { type: 'impact', style: 1 }, // Medium
      { type: 'pause', duration: 150 },
      { type: 'impact', style: 2 }, // Heavy
      { type: 'pause', duration: 150 },
      { type: 'impact', style: 1 },
      { type: 'pause', duration: 150 },
      { type: 'impact', style: 0 },
    ],
    priority: 'high',
    canCustomize: true,
  },

  new_message: {
    type: 'new_message',
    name: 'New Message',
    description: 'Heartbeat rhythm - Someone sent you a message',
    pattern: [
      { type: 'impact', style: 1 },
      { type: 'pause', duration: 100 },
      { type: 'impact', style: 0 },
      { type: 'pause', duration: 600 },
      { type: 'impact', style: 1 },
      { type: 'pause', duration: 100 },
      { type: 'impact', style: 0 },
    ],
    priority: 'medium',
    canCustomize: true,
  },

  emergency_alert: {
    type: 'emergency_alert',
    name: 'Emergency Alert',
    description: 'SOS pattern (· · · — — — · · ·) - Crisis or safety concern',
    pattern: [
      // S (· · ·)
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 150 },
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 150 },
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 300 },
      // O (— — —)
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 400 },
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 400 },
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 300 },
      // S (· · ·)
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 150 },
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 150 },
      { type: 'impact', style: 2 },
    ],
    repeats: 2,
    priority: 'critical',
    canCustomize: false,
  },

  achievement: {
    type: 'achievement',
    name: 'Achievement',
    description: 'Ascending tones - You completed something!',
    pattern: [
      { type: 'impact', style: 0 },
      { type: 'pause', duration: 100 },
      { type: 'impact', style: 1 },
      { type: 'pause', duration: 100 },
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 100 },
      { type: 'notification', style: 0 },
    ],
    priority: 'low',
    canCustomize: true,
  },

  warning: {
    type: 'warning',
    name: 'Warning',
    description: 'Descending tones - Something needs your attention',
    pattern: [
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 100 },
      { type: 'impact', style: 1 },
      { type: 'pause', duration: 100 },
      { type: 'impact', style: 0 },
      { type: 'pause', duration: 100 },
      { type: 'notification', style: 1 },
    ],
    priority: 'medium',
    canCustomize: true,
  },

  energy_low: {
    type: 'energy_low',
    name: 'Energy Low',
    description: 'Slow pulse - Your energy/spoons are running low',
    pattern: [
      { type: 'impact', style: 0 },
      { type: 'pause', duration: 500 },
      { type: 'impact', style: 0 },
      { type: 'pause', duration: 500 },
      { type: 'impact', style: 0 },
    ],
    priority: 'medium',
    canCustomize: true,
  },

  task_complete: {
    type: 'task_complete',
    name: 'Task Complete',
    description: 'Double tap - Task finished successfully',
    pattern: [
      { type: 'notification', style: 0 },
      { type: 'pause', duration: 150 },
      { type: 'notification', style: 0 },
    ],
    priority: 'low',
    canCustomize: true,
  },

  spoon_depleted: {
    type: 'spoon_depleted',
    name: 'Spoons Depleted',
    description: 'Fading pattern - You\'ve run out of spoons for today',
    pattern: [
      { type: 'impact', style: 1 },
      { type: 'pause', duration: 200 },
      { type: 'impact', style: 0 },
      { type: 'pause', duration: 300 },
      { type: 'impact', style: 0 },
    ],
    priority: 'medium',
    canCustomize: true,
  },

  mood_check: {
    type: 'mood_check',
    name: 'Mood Check-In',
    description: 'Gentle reminder - Time to log your mood',
    pattern: [
      { type: 'selection' },
      { type: 'pause', duration: 300 },
      { type: 'selection' },
    ],
    priority: 'low',
    canCustomize: true,
  },

  crisis_contact: {
    type: 'crisis_contact',
    name: 'Crisis Contact Ready',
    description: 'Ready pattern - Crisis contact has been notified',
    pattern: [
      { type: 'notification', style: 0 },
      { type: 'pause', duration: 100 },
      { type: 'impact', style: 2 },
      { type: 'pause', duration: 100 },
      { type: 'notification', style: 0 },
    ],
    priority: 'critical',
    canCustomize: false,
  },

  breathing_guide: {
    type: 'breathing_guide',
    name: 'Breathing Guide',
    description: '4-7-8 breathing rhythm - Inhale, hold, exhale',
    pattern: [
      // Inhale (4 seconds)
      { type: 'impact', style: 0 },
      { type: 'pause', duration: 4000 },
      // Hold (7 seconds)
      { type: 'impact', style: 1 },
      { type: 'pause', duration: 7000 },
      // Exhale (8 seconds)
      { type: 'impact', style: 0 },
      { type: 'pause', duration: 8000 },
    ],
    repeats: 3,
    priority: 'high',
    canCustomize: false,
  },

  custom: {
    type: 'custom',
    name: 'Custom Pattern',
    description: 'User-defined haptic pattern',
    pattern: [
      { type: 'selection' },
    ],
    priority: 'low',
    canCustomize: true,
  },
};

// ============================================================================
// Haptic Language Manager
// ============================================================================

class HapticLanguageManager {
  private static instance: HapticLanguageManager;
  private preferences: HapticPreferences;
  private isPlaying: boolean = false;

  private constructor() {
    this.preferences = this.getDefaultPreferences();
    this.loadPreferences();
  }

  static getInstance(): HapticLanguageManager {
    if (!HapticLanguageManager.instance) {
      HapticLanguageManager.instance = new HapticLanguageManager();
    }
    return HapticLanguageManager.instance;
  }

  // ============================================================================
  // Preferences Management
  // ============================================================================

  private getDefaultPreferences(): HapticPreferences {
    const enabledTypes: Record<HapticMessageType, boolean> = {} as any;
    Object.keys(DEFAULT_PATTERNS).forEach(key => {
      enabledTypes[key as HapticMessageType] = true;
    });

    return {
      enabled: true,
      intensity: 'medium',
      learnedPatterns: {} as any,
      customPatterns: {},
      enabledTypes,
    };
  }

  private async loadPreferences(): Promise<void> {
    try {
      // Skip on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') return;
      
      const prefsStr = await AsyncStorage.getItem(STORAGE_KEY);
      if (prefsStr) {
        this.preferences = { ...this.preferences, ...JSON.parse(prefsStr) };
      }
    } catch (_err) {
      logError('hapticLanguage', 'Failed to load haptic preferences', _err);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (_err) {
      logError('hapticLanguage', 'Failed to save haptic preferences', _err);
    }
  }

  // ============================================================================
  // Pattern Playback
  // ============================================================================

  async play(type: HapticMessageType, _message?: string): Promise<void> {
    if (!this.preferences.enabled) return;
    if (!this.preferences.enabledTypes[type]) return;
    if (this.isInQuietHours()) return;
    if (Platform.OS === 'web') return; // Haptics not supported on web

    // Don't interrupt critical patterns
    if (this.isPlaying && DEFAULT_PATTERNS[type].priority !== 'critical') {
      return;
    }

    this.isPlaying = true;
    const pattern = DEFAULT_PATTERNS[type];
    
    try {
      // Track usage for learning
      this.preferences.learnedPatterns[type] = (this.preferences.learnedPatterns[type] || 0) + 1;
      await this.savePreferences();

      // Play pattern
      const repeats = pattern.repeats || 1;
      for (let i = 0; i < repeats; i++) {
        await this.playPattern(pattern.pattern);
        if (i < repeats - 1) {
          await this.wait(500); // Pause between repeats
        }
      }
    } catch (_err) {
      logError('hapticLanguage', `Failed to play haptic pattern: ${type}`, _err);
    } finally {
      this.isPlaying = false;
    }
  }

  private async playPattern(steps: HapticStep[]): Promise<void> {
    // Skip haptics on web
    if (!Haptics || Platform.OS === 'web') {
      return;
    }
    
    for (const step of steps) {
      switch (step.type) {
        case 'impact':
          if (step.style && typeof step.style === 'number' && step.style <= 2) {
            await Haptics.impactAsync(step.style as any);
          } else {
            await Haptics.impactAsync(1);
          }
          break;
        case 'notification':
          if (step.style && typeof step.style === 'number' && step.style <= 2) {
            await Haptics.notificationAsync(step.style as any);
          } else {
            await Haptics.notificationAsync(0);
          }
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'pause':
          await this.wait(step.duration || 100);
          break;
      }
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Quiet Hours
  // ============================================================================

  private isInQuietHours(): boolean {
    if (!this.preferences.quietHoursStart || !this.preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date().getHours();
    const start = this.preferences.quietHoursStart;
    const end = this.preferences.quietHoursEnd;

    if (start < end) {
      return now >= start && now < end;
    } else {
      // Quiet hours span midnight
      return now >= start || now < end;
    }
  }

  // ============================================================================
  // Public API
  // ============================================================================

  async setEnabled(enabled: boolean): Promise<void> {
    this.preferences.enabled = enabled;
    await this.savePreferences();
  }

  async setIntensity(intensity: 'light' | 'medium' | 'heavy'): Promise<void> {
    this.preferences.intensity = intensity;
    await this.savePreferences();
  }

  async setQuietHours(start: number, end: number): Promise<void> {
    this.preferences.quietHoursStart = start;
    this.preferences.quietHoursEnd = end;
    await this.savePreferences();
  }

  async togglePatternType(type: HapticMessageType, enabled: boolean): Promise<void> {
    this.preferences.enabledTypes[type] = enabled;
    await this.savePreferences();
  }

  getPattern(type: HapticMessageType): HapticPattern {
    return DEFAULT_PATTERNS[type];
  }

  getAllPatterns(): HapticPattern[] {
    return Object.values(DEFAULT_PATTERNS);
  }

  async testPattern(type: HapticMessageType): Promise<void> {
    await this.play(type);
  }

  getUsageStats(): Record<HapticMessageType, number> {
    return { ...this.preferences.learnedPatterns };
  }

  async resetStats(): Promise<void> {
    this.preferences.learnedPatterns = {} as any;
    await this.savePreferences();
  }

  // ============================================================================
  // ADAPTIVE HAPTIC LEARNING
  // ============================================================================

  private learningProfile: HapticLearningProfile | null = null;
  private hapticHistory: Array<{ type: HapticMessageType; timestamp: number; responseTime?: number; dismissed?: boolean }> = [];
  private lastHapticTime: number = 0;

  async initLearningProfile(): Promise<void> {
    try {
      const profileStr = await AsyncStorage.getItem(LEARNING_PROFILE_KEY);
      const historyStr = await AsyncStorage.getItem(HAPTIC_HISTORY_KEY);

      if (profileStr) {
        this.learningProfile = JSON.parse(profileStr);
      } else {
        this.learningProfile = {
          userId: 'default',
          preferredIntensities: {} as any,
          effectivenessScores: {} as any,
          responseLatencies: {} as any,
          dismissRates: {} as any,
          timeOfDayPreferences: {},
          lastUpdated: Date.now(),
        };
      }

      if (historyStr) {
        this.hapticHistory = JSON.parse(historyStr);
      }
    } catch (err) {
      logError('hapticLanguage', 'Failed to load learning profile', err);
    }
  }

  async playAdaptive(type: HapticMessageType, context: HapticContext): Promise<AdaptiveHapticResult> {
    const adaptationReasons: string[] = [];
    let intensityUsed = this.preferences.intensity;
    let adapted = false;

    // Initialize learning profile if needed
    if (!this.learningProfile) {
      await this.initLearningProfile();
    }

    // Adaptive intensity based on context
    if (context.userState === 'sleeping' || context.userState === 'resting') {
      intensityUsed = 'light';
      adaptationReasons.push('Reduced intensity for resting state');
      adapted = true;
    } else if (context.userState === 'stressed') {
      intensityUsed = context.urgency === 'critical' ? 'heavy' : 'light';
      adaptationReasons.push('Adjusted for stressed state');
      adapted = true;
    }

    // Sentiment-based adaptation
    if (context.sentiment === 'positive' && type === 'achievement') {
      intensityUsed = 'heavy'; // Celebrate achievements!
      adaptationReasons.push('Enhanced for positive sentiment');
      adapted = true;
    } else if (context.sentiment === 'negative' && type !== 'emergency_alert') {
      intensityUsed = 'light';
      adaptationReasons.push('Softened for negative sentiment');
      adapted = true;
    }

    // Time-of-day learning
    const hour = new Date().getHours();
    if (this.learningProfile?.timeOfDayPreferences[hour]) {
      intensityUsed = this.learningProfile.timeOfDayPreferences[hour];
      adaptationReasons.push(`Learned preference for hour ${hour}`);
      adapted = true;
    }

    // Haptic fatigue detection
    if (context.timeSinceLastHaptic < 5000 && context.urgency !== 'critical') {
      intensityUsed = 'light';
      adaptationReasons.push('Reduced for haptic fatigue prevention');
      adapted = true;
    }

    // Apply learned preferences for this type
    if (this.learningProfile?.preferredIntensities[type]) {
      intensityUsed = this.learningProfile.preferredIntensities[type];
      adaptationReasons.push('Using learned preference for pattern type');
      adapted = true;
    }

    // Record haptic event
    this.lastHapticTime = Date.now();
    this.hapticHistory.push({
      type,
      timestamp: Date.now(),
    });

    // Play the haptic with adapted intensity
    const originalIntensity = this.preferences.intensity;
    this.preferences.intensity = intensityUsed;
    await this.play(type);
    this.preferences.intensity = originalIntensity;

    // Calculate predicted effectiveness
    const effectiveness = this.learningProfile?.effectivenessScores[type] || 70;

    // Keep history limited
    if (this.hapticHistory.length > 500) {
      this.hapticHistory = this.hapticHistory.slice(-500);
    }

    try {
      await AsyncStorage.setItem(HAPTIC_HISTORY_KEY, JSON.stringify(this.hapticHistory));
    } catch (err) {
      logError('hapticLanguage', 'Failed to save haptic history', err);
    }

    return {
      patternUsed: type,
      intensityUsed,
      adapted,
      adaptationReasons,
      predictedEffectiveness: effectiveness,
    };
  }

  async recordUserResponse(type: HapticMessageType, responseTimeMs: number, dismissed: boolean): Promise<void> {
    if (!this.learningProfile) await this.initLearningProfile();
    if (!this.learningProfile) return;

    // Update response latencies
    if (!this.learningProfile.responseLatencies[type]) {
      this.learningProfile.responseLatencies[type] = [];
    }
    this.learningProfile.responseLatencies[type].push(responseTimeMs);
    // Keep only last 20 responses
    if (this.learningProfile.responseLatencies[type].length > 20) {
      this.learningProfile.responseLatencies[type] = this.learningProfile.responseLatencies[type].slice(-20);
    }

    // Update dismiss rates
    const history = this.hapticHistory.filter(h => h.type === type);
    const dismissedCount = history.filter(h => h.dismissed).length;
    this.learningProfile.dismissRates[type] = dismissedCount / Math.max(1, history.length);

    // Calculate effectiveness (inverse of dismiss rate + response time factor)
    const avgResponseTime = this.learningProfile.responseLatencies[type].reduce((s, t) => s + t, 0) / 
      this.learningProfile.responseLatencies[type].length;
    const dismissRate = this.learningProfile.dismissRates[type];
    const effectiveness = Math.round((1 - dismissRate) * 70 + (1 - Math.min(1, avgResponseTime / 10000)) * 30);
    this.learningProfile.effectivenessScores[type] = effectiveness;

    // Learn intensity preference based on response
    if (responseTimeMs < 2000 && !dismissed) {
      // Quick, non-dismissed response = current intensity works
      this.learningProfile.preferredIntensities[type] = this.preferences.intensity;
    } else if (dismissed) {
      // Dismissed = might be too intrusive, reduce intensity
      this.learningProfile.preferredIntensities[type] = 'light';
    }

    // Time-of-day learning
    const hour = new Date().getHours();
    if (!dismissed && responseTimeMs < 3000) {
      this.learningProfile.timeOfDayPreferences[hour] = this.preferences.intensity;
    }

    // Update last haptic in history with response data
    const lastHistoryItem = this.hapticHistory.find(
      h => h.type === type && !h.responseTime
    );
    if (lastHistoryItem) {
      lastHistoryItem.responseTime = responseTimeMs;
      lastHistoryItem.dismissed = dismissed;
    }

    this.learningProfile.lastUpdated = Date.now();

    try {
      await AsyncStorage.setItem(LEARNING_PROFILE_KEY, JSON.stringify(this.learningProfile));
      await AsyncStorage.setItem(HAPTIC_HISTORY_KEY, JSON.stringify(this.hapticHistory));
    } catch (err) {
      logError('hapticLanguage', 'Failed to save learning profile', err);
    }
  }

  async getAdaptiveRecommendations(): Promise<{
    mostEffective: HapticMessageType[];
    leastEffective: HapticMessageType[];
    optimalIntensity: 'light' | 'medium' | 'heavy';
    suggestedQuietHours: { start: number; end: number } | null;
  }> {
    if (!this.learningProfile) await this.initLearningProfile();

    const effectivenessEntries = Object.entries(this.learningProfile?.effectivenessScores || {});
    const sorted = effectivenessEntries.sort((a, b) => b[1] - a[1]);

    const mostEffective = sorted.slice(0, 3).map(([type]) => type as HapticMessageType);
    const leastEffective = sorted.slice(-3).map(([type]) => type as HapticMessageType);

    // Find optimal intensity from preferences
    const intensityCounts = { light: 0, medium: 0, heavy: 0 };
    Object.values(this.learningProfile?.preferredIntensities || {}).forEach(intensity => {
      intensityCounts[intensity]++;
    });
    const optimalIntensity = Object.entries(intensityCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as 'light' | 'medium' | 'heavy';

    // Suggest quiet hours based on dismiss patterns
    let suggestedQuietHours: { start: number; end: number } | null = null;
    const hourlyDismissRates: Record<number, number> = {};
    this.hapticHistory.forEach(h => {
      const hour = new Date(h.timestamp).getHours();
      if (!hourlyDismissRates[hour]) hourlyDismissRates[hour] = 0;
      if (h.dismissed) hourlyDismissRates[hour]++;
    });

    const highDismissHours = Object.entries(hourlyDismissRates)
      .filter(([_, rate]) => rate > 3)
      .map(([hour]) => parseInt(hour))
      .sort((a, b) => a - b);

    if (highDismissHours.length >= 2) {
      suggestedQuietHours = {
        start: highDismissHours[0],
        end: highDismissHours[highDismissHours.length - 1],
      };
    }

    return {
      mostEffective,
      leastEffective,
      optimalIntensity,
      suggestedQuietHours,
    };
  }

  getLearningProfile(): HapticLearningProfile | null {
    return this.learningProfile ? { ...this.learningProfile } : null;
  }

  getTimeSinceLastHaptic(): number {
    return Date.now() - this.lastHapticTime;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const hapticLanguage = HapticLanguageManager.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useHapticLanguage() {
  return {
    play: (type: HapticMessageType, message?: string) => hapticLanguage.play(type, message),
    test: (type: HapticMessageType) => hapticLanguage.testPattern(type),
    setEnabled: (enabled: boolean) => hapticLanguage.setEnabled(enabled),
    getAllPatterns: () => hapticLanguage.getAllPatterns(),
    getUsageStats: () => hapticLanguage.getUsageStats(),
    // =========== ADAPTIVE HAPTIC LEARNING ===========
    playAdaptive: (type: HapticMessageType, context: HapticContext) =>
      hapticLanguage.playAdaptive(type, context),
    recordResponse: (type: HapticMessageType, responseTimeMs: number, dismissed: boolean) =>
      hapticLanguage.recordUserResponse(type, responseTimeMs, dismissed),
    getRecommendations: () => hapticLanguage.getAdaptiveRecommendations(),
    getLearningProfile: () => hapticLanguage.getLearningProfile(),
    getTimeSinceLastHaptic: () => hapticLanguage.getTimeSinceLastHaptic(),
  };
}


