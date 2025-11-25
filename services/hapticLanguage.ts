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
  } catch (error) {
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
// Constants
// ============================================================================

const STORAGE_KEY = 'hapticLanguage:preferences:v1';

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
    } catch (err) {
      logError('hapticLanguage', 'Failed to load haptic preferences', err);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (err) {
      logError('hapticLanguage', 'Failed to save haptic preferences', err);
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
    } catch (err) {
      logError('hapticLanguage', `Failed to play haptic pattern: ${type}`, err);
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
  };
}


