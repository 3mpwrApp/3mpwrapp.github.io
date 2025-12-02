/**
 * Circadian Rhythm DJ
 * 
 * Sleep optimization system with chronotype detection, sleep debt amortization,
 * dream interference detection, wake-up timing optimizer, and nap prescription.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Platform } from 'react-native';

import { logError } from '../utils/errorLogger';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type Chronotype = 'lion' | 'bear' | 'wolf' | 'dolphin';

export interface ChronotypeProfile {
  type: Chronotype;
  confidence: number; // 0-100%
  peakEnergyHours: number[]; // 0-23
  idealSleepWindow: { start: number; end: number }; // hours (e.g., 22-6)
  socialJetLagHours: number; // Difference between weekday/weekend sleep
}

export interface SleepDebt {
  totalHoursOwed: number;
  accruedSince: number; // timestamp
  dailyDeficits: Array<{ date: string; deficit: number }>;
  repaymentPlan: SleepDebtRepaymentPlan;
}

export interface SleepDebtRepaymentPlan {
  targetDate: string; // When to be debt-free
  dailyExtraMinutes: number; // Extra sleep needed per night
  weeklyProgress: number; // Hours repaid this week
  estimatedWeeksRemaining: number;
}

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD
  bedtime: number; // Hours since midnight (can be negative for previous day)
  wakeTime: number; // Hours since midnight
  totalSleep: number; // Hours
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  nightmares: boolean;
  nightmareDetails?: string;
  medicationsTaken?: string[];
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  caffeineIntake?: number; // mg
  alcoholIntake?: number; // drinks
  exerciseMinutes?: number;
}

export interface DreamInterference {
  date: string;
  nightmareDescription: string;
  possibleTriggers: string[];
  medications?: string[];
  stressEvents?: string[];
  pattern: 'recurring' | 'isolated' | 'clustered';
}

export interface WakeUpOptimization {
  targetWakeTime: string; // HH:MM
  idealBedtimes: string[]; // Multiple options based on 90-min cycles
  recommendedBedtime: string; // Best option
  cyclesCompleted: number;
  totalSleepHours: number;
}

export interface NapPrescription {
  type: 'power' | 'recovery' | 'full_cycle';
  duration: number; // minutes
  idealTime: string; // HH:MM
  purpose: string;
  instructions: string[];
  avoidAfter: number; // Hour (e.g., 15 = 3pm)
}

export interface CircadianPreferences {
  targetSleepHours: number; // Ideal sleep per night
  wakeUpAlarmTime?: string; // HH:MM
  napPreference: 'never' | 'occasional' | 'daily';
  sleepDisorders?: string[];
  medicationsThatAffectSleep?: string[];
}

// ============================================================================
// SMART ENVIRONMENT INTEGRATION - NEVER BEEN DONE BEFORE
// ============================================================================

export interface SmartEnvironmentConfig {
  smartLightsEnabled: boolean;
  smartThermostatEnabled: boolean;
  whiteNoiseEnabled: boolean;
  sunriseAlarmEnabled: boolean;
  connectedDevices: SmartDevice[];
}

export interface SmartDevice {
  id: string;
  type: 'hue_lights' | 'nest_thermostat' | 'ecobee' | 'white_noise_machine' | 'smart_blinds';
  name: string;
  connected: boolean;
  capabilities: string[];
}

export interface SmartAlarmIntegration {
  alarmTime: string; // HH:MM
  sunriseSimulation: { startMinutesBefore: number; targetLux: number };
  temperatureRamp: { startTemp: number; endTemp: number };
  soundscape: 'birds' | 'ocean' | 'forest' | 'gentle_alarm' | 'custom';
  smartActions: Array<{ device: string; action: string; triggerTime: string }>;
}

export interface WeatherSleepCorrelation {
  conditions: string; // e.g., 'rainy', 'sunny', 'stormy'
  avgSleepQuality: number;
  avgSleepDuration: number;
  recommendation: string;
  sampleSize: number;
}

export interface SocialJetLagAnalysis {
  weekdayAvgBedtime: number; // hours
  weekdayAvgWakeTime: number;
  weekendAvgBedtime: number;
  weekendAvgWakeTime: number;
  jetLagHours: number;
  impact: 'minimal' | 'moderate' | 'significant' | 'severe';
  recoveryStrategies: string[];
}

export interface LightTherapyPrescription {
  type: 'morning_exposure' | 'evening_avoidance' | 'blue_light_filter' | 'sad_lamp';
  duration: number; // minutes
  idealTime: string; // HH:MM
  intensity: number; // lux
  frequency: 'daily' | 'as_needed';
  instructions: string[];
  expectedBenefit: string;
}

export interface MoonPhaseCorrelation {
  phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  avgSleepQuality: number;
  avgSleepDuration: number;
  nightmareFrequency: number;
  personalImpact: 'none' | 'mild' | 'moderate' | 'significant';
}

// ============================================================================
// AI SLEEP PREDICTION - NEVER BEEN DONE BEFORE
// ============================================================================

export interface SleepStagePrediction {
  stages: {
    stage: 'awake' | 'light' | 'deep' | 'rem';
    startMinute: number;
    duration: number;
    quality: number; // 0-1
  }[];
  predictedQuality: number; // 1-5
  optimalWakeTimes: string[]; // Times to wake feeling refreshed
  warnings: string[];
  confidence: number;
}

export interface DreamAIAnalysis {
  dreamId: string;
  themes: string[];
  emotions: string[];
  symbols: {
    symbol: string;
    possibleMeaning: string;
    frequency: 'first_time' | 'recurring' | 'frequent';
  }[];
  stressIndicators: number; // 0-10
  processingType: 'memory_consolidation' | 'emotional_processing' | 'threat_rehearsal' | 'creative_synthesis';
  connections: {
    toRecentEvents: string[];
    toRecurringThemes: string[];
    toSymptoms: string[];
  };
  insights: string[];
  actionableAdvice: string[];
}

export interface SleepQualityPrediction {
  predictedQuality: number; // 1-5
  factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
  recommendations: string[];
  confidence: number;
}

export interface CircadianAlignment {
  score: number; // 0-100
  naturalRhythm: {
    peakAlertness: string;
    naturalSleepiness: string;
    optimalBedtime: string;
    optimalWakeTime: string;
  };
  currentAlignment: {
    bedtimeVariance: number; // hours
    wakeTimeVariance: number;
    consistencyScore: number;
  };
  jetLagRisk: number; // 0-10
  recommendations: string[];
}

export interface SleepOptimizationPlan {
  weeklyGoals: {
    targetBedtime: string;
    targetWakeTime: string;
    targetDuration: number;
    focusArea: string;
  };
  dailyActions: {
    time: string;
    action: string;
    importance: 'required' | 'recommended' | 'optional';
  }[];
  weeklyMilestones: {
    week: number;
    goal: string;
    metric: string;
  }[];
  estimatedImprovement: {
    qualityIncrease: number;
    debtRepaymentWeeks: number;
    energyImprovement: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  SLEEP_LOGS: 'circadianDJ:sleepLogs:v1',
  CHRONOTYPE: 'circadianDJ:chronotype:v1',
  PREFERENCES: 'circadianDJ:preferences:v1',
  SLEEP_DEBT: 'circadianDJ:sleepDebt:v1',
  DREAM_PATTERNS: 'circadianDJ:dreamPatterns:v1',
  SMART_DEVICES: 'circadianDJ:smartDevices:v1',
  WEATHER_CORRELATIONS: 'circadianDJ:weatherCorrelations:v1',
  MOON_CORRELATIONS: 'circadianDJ:moonCorrelations:v1',
} as const;

const SLEEP_CYCLE_MINUTES = 90;
const POWER_NAP_MINUTES = 10;
const RECOVERY_NAP_MINUTES = 20;

const CHRONOTYPE_PROFILES: Record<Chronotype, Omit<ChronotypeProfile, 'confidence'>> = {
  lion: {
    type: 'lion',
    peakEnergyHours: [6, 7, 8, 9, 10, 11],
    idealSleepWindow: { start: 21, end: 5 }, // 9pm - 5am
    socialJetLagHours: 0.5,
  },
  bear: {
    type: 'bear',
    peakEnergyHours: [9, 10, 11, 12, 13, 14],
    idealSleepWindow: { start: 23, end: 7 }, // 11pm - 7am
    socialJetLagHours: 1,
  },
  wolf: {
    type: 'wolf',
    peakEnergyHours: [17, 18, 19, 20, 21, 22],
    idealSleepWindow: { start: 0, end: 8 }, // Midnight - 8am
    socialJetLagHours: 2,
  },
  dolphin: {
    type: 'dolphin',
    peakEnergyHours: [15, 16, 17, 18],
    idealSleepWindow: { start: 23.5, end: 6.5 }, // 11:30pm - 6:30am
    socialJetLagHours: 1.5,
  },
};

const CHRONOTYPE_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What time do you naturally wake up on weekends (without an alarm)?',
    answers: [
      { text: 'Before 6am', type: 'lion', weight: 3 },
      { text: '6am-8am', type: 'bear', weight: 3 },
      { text: '8am-10am', type: 'wolf', weight: 2 },
      { text: 'After 10am', type: 'wolf', weight: 3 },
    ],
  },
  {
    id: 2,
    question: 'When do you feel most productive?',
    answers: [
      { text: 'Early morning (6am-noon)', type: 'lion', weight: 3 },
      { text: 'Midday (10am-4pm)', type: 'bear', weight: 3 },
      { text: 'Evening (4pm-10pm)', type: 'wolf', weight: 3 },
      { text: 'Late night (after 10pm)', type: 'wolf', weight: 2 },
    ],
  },
  {
    id: 3,
    question: 'How do you feel about waking up early?',
    answers: [
      { text: 'Love it! I pop out of bed ready to go', type: 'lion', weight: 3 },
      { text: 'Fine after coffee/breakfast', type: 'bear', weight: 2 },
      { text: 'Struggle but can do it', type: 'wolf', weight: 1 },
      { text: 'Miserable, need hours to wake up', type: 'wolf', weight: 3 },
    ],
  },
  {
    id: 4,
    question: 'What time do you get hungry for dinner?',
    answers: [
      { text: '5pm-6pm', type: 'lion', weight: 2 },
      { text: '6pm-7pm', type: 'bear', weight: 3 },
      { text: '7pm-9pm', type: 'wolf', weight: 2 },
      { text: 'After 9pm', type: 'wolf', weight: 3 },
    ],
  },
  {
    id: 5,
    question: 'How well do you sleep?',
    answers: [
      { text: 'Like a rock, fall asleep fast, sleep through night', type: 'bear', weight: 2 },
      { text: 'Pretty well, occasional interruptions', type: 'lion', weight: 1 },
      { text: 'Variable, some nights good, some bad', type: 'wolf', weight: 1 },
      { text: 'Poorly, insomnia, light sleeper', type: 'dolphin', weight: 3 },
    ],
  },
  {
    id: 6,
    question: 'If you could choose, when would you exercise?',
    answers: [
      { text: '6am-9am', type: 'lion', weight: 3 },
      { text: '9am-noon', type: 'bear', weight: 2 },
      { text: 'Noon-5pm', type: 'bear', weight: 3 },
      { text: '5pm-10pm', type: 'wolf', weight: 3 },
    ],
  },
];

// ============================================================================
// Circadian Rhythm DJ Manager
// ============================================================================

class CircadianRhythmDJManager {
  private static instance: CircadianRhythmDJManager;
  private sleepLogs: SleepLog[] = [];
  private chronotype: ChronotypeProfile | null = null;
  private preferences: CircadianPreferences;
  private sleepDebt: SleepDebt | null = null;
  private dreamPatterns: DreamInterference[] = [];

  private constructor() {
    this.preferences = {
      targetSleepHours: 8,
      napPreference: 'occasional',
    };
    this.loadData();
  }

  static getInstance(): CircadianRhythmDJManager {
    if (!CircadianRhythmDJManager.instance) {
      CircadianRhythmDJManager.instance = new CircadianRhythmDJManager();
    }
    return CircadianRhythmDJManager.instance;
  }

  // ============================================================================
  // Data Management
  // ============================================================================

  private async loadData(): Promise<void> {
    try {
      // Skip on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') return;
      
      const [logsStr, chronoStr, prefsStr, debtStr, dreamsStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SLEEP_LOGS),
        AsyncStorage.getItem(STORAGE_KEYS.CHRONOTYPE),
        AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES),
        AsyncStorage.getItem(STORAGE_KEYS.SLEEP_DEBT),
        AsyncStorage.getItem(STORAGE_KEYS.DREAM_PATTERNS),
      ]);

      if (logsStr) this.sleepLogs = JSON.parse(logsStr);
      if (chronoStr) this.chronotype = JSON.parse(chronoStr);
      if (prefsStr) this.preferences = { ...this.preferences, ...JSON.parse(prefsStr) };
      if (debtStr) this.sleepDebt = JSON.parse(debtStr);
      if (dreamsStr) this.dreamPatterns = JSON.parse(dreamsStr);

      // Initialize sleep debt if not exists
      if (!this.sleepDebt) {
        this.sleepDebt = {
          totalHoursOwed: 0,
          accruedSince: Date.now(),
          dailyDeficits: [],
          repaymentPlan: {
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dailyExtraMinutes: 0,
            weeklyProgress: 0,
            estimatedWeeksRemaining: 0,
          },
        };
      }
    } catch (err) {
      logError('circadianRhythmDJ', 'Failed to load circadian rhythm data', err);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(this.sleepLogs.slice(-365))),
        AsyncStorage.setItem(STORAGE_KEYS.CHRONOTYPE, JSON.stringify(this.chronotype)),
        AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(this.preferences)),
        AsyncStorage.setItem(STORAGE_KEYS.SLEEP_DEBT, JSON.stringify(this.sleepDebt)),
        AsyncStorage.setItem(STORAGE_KEYS.DREAM_PATTERNS, JSON.stringify(this.dreamPatterns.slice(-100))),
      ]);
    } catch (err) {
      logError('circadianRhythmDJ', 'Failed to save circadian rhythm data', err);
    }
  }

  // ============================================================================
  // Chronotype Detection
  // ============================================================================

  getChronotypeQuiz() {
    return CHRONOTYPE_QUIZ_QUESTIONS;
  }

  async calculateChronotype(answers: Record<number, number>): Promise<ChronotypeProfile> {
    // Tally scores for each chronotype
    const scores: Record<Chronotype, number> = {
      lion: 0,
      bear: 0,
      wolf: 0,
      dolphin: 0,
    };

    Object.entries(answers).forEach(([questionId, answerIndex]) => {
      const question = CHRONOTYPE_QUIZ_QUESTIONS.find(q => q.id === parseInt(questionId));
      if (question && question.answers[answerIndex]) {
        const answer = question.answers[answerIndex];
        scores[answer.type as Chronotype] += answer.weight;
      }
    });

    // Find highest score
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const sortedTypes = (Object.entries(scores) as [Chronotype, number][])
      .sort((a, b) => b[1] - a[1]);

    const winningType = sortedTypes[0][0];
    const confidence = Math.round((sortedTypes[0][1] / totalScore) * 100);

    this.chronotype = {
      ...CHRONOTYPE_PROFILES[winningType],
      confidence,
    };

    await this.saveData();
    return this.chronotype;
  }

  getChronotype(): ChronotypeProfile | null {
    return this.chronotype;
  }

  async setChronotype(profile: ChronotypeProfile): Promise<void> {
    this.chronotype = profile;
    await this.saveData();
  }

  // ============================================================================
  // Sleep Logging
  // ============================================================================

  async logSleep(log: Omit<SleepLog, 'id'>): Promise<SleepLog> {
    const newLog: SleepLog = {
      ...log,
      id: `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.sleepLogs.push(newLog);

    // Update sleep debt
    await this.updateSleepDebt(newLog);

    // Check for nightmare patterns
    if (newLog.nightmares) {
      await this.analyzeDreamPattern(newLog);
    }

    await this.saveData();
    return newLog;
  }

  getSleepHistory(days: number = 30): SleepLog[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    return this.sleepLogs
      .filter(log => log.date >= cutoffStr)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  // ============================================================================
  // Sleep Debt Management
  // ============================================================================

  private async updateSleepDebt(log: SleepLog): Promise<void> {
    if (!this.sleepDebt) return;

    const target = this.preferences.targetSleepHours;
    const actual = log.totalSleep;
    const deficit = target - actual;

    if (deficit > 0) {
      this.sleepDebt.totalHoursOwed += deficit;
      this.sleepDebt.dailyDeficits.push({ date: log.date, deficit });
    } else if (deficit < 0) {
      // Extra sleep - repay debt
      const surplus = Math.abs(deficit);
      const repayment = Math.min(surplus, this.sleepDebt.totalHoursOwed);
      this.sleepDebt.totalHoursOwed -= repayment;
      
      if (this.sleepDebt.totalHoursOwed < 0) {
        this.sleepDebt.totalHoursOwed = 0;
      }
    }

    // Recalculate repayment plan
    await this.calculateRepaymentPlan();
  }

  private async calculateRepaymentPlan(): Promise<void> {
    if (!this.sleepDebt) return;

    const totalOwed = this.sleepDebt.totalHoursOwed;
    
    if (totalOwed === 0) {
      this.sleepDebt.repaymentPlan = {
        targetDate: new Date().toISOString().split('T')[0],
        dailyExtraMinutes: 0,
        weeklyProgress: 0,
        estimatedWeeksRemaining: 0,
      };
      return;
    }

    // 3-month repayment plan
    const targetDays = 90;
    const dailyExtraHours = totalOwed / targetDays;
    const dailyExtraMinutes = Math.ceil(dailyExtraHours * 60);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + targetDays);

    // Calculate weekly progress
    const lastWeek = this.sleepLogs.slice(-7);
    const weeklyRepayment = lastWeek.reduce((sum, log) => {
      const surplus = log.totalSleep - this.preferences.targetSleepHours;
      return sum + (surplus > 0 ? surplus : 0);
    }, 0);

    this.sleepDebt.repaymentPlan = {
      targetDate: targetDate.toISOString().split('T')[0],
      dailyExtraMinutes,
      weeklyProgress: Math.round(weeklyRepayment * 10) / 10,
      estimatedWeeksRemaining: Math.ceil(totalOwed / (weeklyRepayment || 1)),
    };
  }

  getSleepDebt(): SleepDebt | null {
    return this.sleepDebt;
  }

  // ============================================================================
  // Dream Interference Detection
  // ============================================================================

  private async analyzeDreamPattern(log: SleepLog): Promise<void> {
    if (!log.nightmares || !log.nightmareDetails) return;

    // Check recent nightmares (last 30 days)
    const recentNightmares = this.sleepLogs
      .filter(l => l.nightmares && l.date >= this.getDateDaysAgo(30))
      .slice(-10);

    let pattern: DreamInterference['pattern'] = 'isolated';
    
    if (recentNightmares.length >= 5) {
      pattern = 'recurring';
    } else if (recentNightmares.length >= 2) {
      const dates = recentNightmares.map(l => new Date(l.date).getTime());
      const gaps = dates.slice(1).map((d, i) => d - dates[i]);
      const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      
      if (avgGap < 3 * 24 * 60 * 60 * 1000) { // Within 3 days
        pattern = 'clustered';
      }
    }

    const interference: DreamInterference = {
      date: log.date,
      nightmareDescription: log.nightmareDetails,
      possibleTriggers: [],
      medications: log.medicationsTaken,
      stressEvents: log.stressLevel && log.stressLevel >= 4 ? ['High stress'] : [],
      pattern,
    };

    // Identify possible triggers
    if (log.caffeineIntake && log.caffeineIntake > 200) {
      interference.possibleTriggers.push('High caffeine intake');
    }
    if (log.alcoholIntake && log.alcoholIntake > 2) {
      interference.possibleTriggers.push('Alcohol consumption');
    }
    if (log.medicationsTaken && log.medicationsTaken.length > 0) {
      interference.possibleTriggers.push('Medications: ' + log.medicationsTaken.join(', '));
    }

    this.dreamPatterns.push(interference);
  }

  getDreamInterferencePatterns(): DreamInterference[] {
    return [...this.dreamPatterns].sort((a, b) => b.date.localeCompare(a.date));
  }

  // ============================================================================
  // Wake-Up Timing Optimizer
  // ============================================================================

  calculateOptimalBedtime(wakeUpTime: string): WakeUpOptimization {
    // Parse wake up time (HH:MM)
    const [wakeHour, wakeMin] = wakeUpTime.split(':').map(Number);
    const wakeMinutes = wakeHour * 60 + wakeMin;

    // Calculate bedtimes for 4-6 sleep cycles
    const idealBedtimes: string[] = [];
    const cycleCounts = [6, 5, 4]; // Prefer more cycles

    cycleCounts.forEach(cycles => {
      const sleepNeeded = cycles * SLEEP_CYCLE_MINUTES + 15; // +15 min to fall asleep
      let bedtimeMinutes = wakeMinutes - sleepNeeded;
      
      // Handle negative (previous day)
      if (bedtimeMinutes < 0) {
        bedtimeMinutes += 24 * 60;
      }

      const bedHour = Math.floor(bedtimeMinutes / 60);
      const bedMin = bedtimeMinutes % 60;
      idealBedtimes.push(`${String(bedHour).padStart(2, '0')}:${String(bedMin).padStart(2, '0')}`);
    });

    // Recommended is the one closest to user's chronotype
    let recommended = idealBedtimes[0];
    if (this.chronotype) {
      const targetHour = this.chronotype.idealSleepWindow.start;
      const distances = idealBedtimes.map(time => {
        const [h] = time.split(':').map(Number);
        return Math.abs(h - targetHour);
      });
      const minIndex = distances.indexOf(Math.min(...distances));
      recommended = idealBedtimes[minIndex];
    }

    return {
      targetWakeTime: wakeUpTime,
      idealBedtimes,
      recommendedBedtime: recommended,
      cyclesCompleted: cycleCounts[0],
      totalSleepHours: (cycleCounts[0] * SLEEP_CYCLE_MINUTES) / 60,
    };
  }

  // ============================================================================
  // Nap Prescription
  // ============================================================================

  prescribeNap(currentTime: string, sleepDeficit: number): NapPrescription {
    const [currentHour] = currentTime.split(':').map(Number);

    // Determine nap type based on sleep deficit
    let napType: NapPrescription['type'];
    let duration: number;
    let purpose: string;

    if (sleepDeficit < 1) {
      napType = 'power';
      duration = POWER_NAP_MINUTES;
      purpose = 'Quick energy boost without grogginess';
    } else if (sleepDeficit < 3) {
      napType = 'recovery';
      duration = RECOVERY_NAP_MINUTES;
      purpose = 'Short-term alertness improvement';
    } else {
      napType = 'full_cycle';
      duration = SLEEP_CYCLE_MINUTES;
      purpose = 'Deep recovery nap to partially repay sleep debt';
    }

    // Ideal nap time: early afternoon (1pm-3pm)
    const idealHour = currentHour < 13 ? 13 : Math.min(currentHour, 15);
    const idealTime = `${String(idealHour).padStart(2, '0')}:00`;

    const instructions = [
      'Find a quiet, dark place',
      'Set an alarm for exactly ' + duration + ' minutes',
      'Lie down or recline comfortably',
      'Close your eyes and try to relax',
      'Don\'t worry if you don\'t fall fully asleep - rest is beneficial',
    ];

    if (napType === 'power') {
      instructions.push('This short nap avoids deep sleep, preventing grogginess');
    } else if (napType === 'full_cycle') {
      instructions.push('This full cycle allows you to complete deep sleep stages');
    }

    return {
      type: napType,
      duration,
      idealTime,
      purpose,
      instructions,
      avoidAfter: 16, // No naps after 4pm
    };
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  async setPreferences(prefs: Partial<CircadianPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...prefs };
    await this.saveData();
  }

  getPreferences(): CircadianPreferences {
    return { ...this.preferences };
  }

  // ============================================================================
  // SMART ENVIRONMENT INTEGRATION
  // ============================================================================

  private smartDevices: SmartDevice[] = [];
  private weatherCorrelations: Map<string, WeatherSleepCorrelation> = new Map();
  private _moonCorrelations: Map<string, MoonPhaseCorrelation> = new Map();

  async connectSmartDevice(device: SmartDevice): Promise<{ success: boolean; message: string }> {
    try {
      const existingIndex = this.smartDevices.findIndex(d => d.id === device.id);
      
      if (existingIndex >= 0) {
        this.smartDevices[existingIndex] = { ...device, connected: true };
      } else {
        this.smartDevices.push({ ...device, connected: true });
      }

      await AsyncStorage.setItem(STORAGE_KEYS.SMART_DEVICES, JSON.stringify(this.smartDevices));

      return { success: true, message: `Connected to ${device.name}` };
    } catch (err) {
      logError('circadianRhythmDJ', 'Failed to connect smart device', err);
      return { success: false, message: 'Failed to connect device' };
    }
  }

  async configureSmartAlarm(alarmTime: string): Promise<SmartAlarmIntegration> {
    const chronotype = this.chronotype;
    const smartActions: Array<{ device: string; action: string; triggerTime: string }> = [];

    // Parse alarm time
    const [hours, minutes] = alarmTime.split(':').map(Number);
    const alarmMinutes = hours * 60 + minutes;

    // Configure sunrise simulation 30 mins before alarm
    const sunriseStart = alarmMinutes - 30;
    const sunriseStartTime = `${String(Math.floor(sunriseStart / 60)).padStart(2, '0')}:${String(sunriseStart % 60).padStart(2, '0')}`;

    // Find connected lights
    const lights = this.smartDevices.filter(d => d.type === 'hue_lights' || d.type === 'smart_blinds');
    lights.forEach(light => {
      smartActions.push({
        device: light.name,
        action: 'gradual_brighten',
        triggerTime: sunriseStartTime,
      });
    });

    // Configure thermostat
    const thermostat = this.smartDevices.find(d => d.type === 'nest_thermostat' || d.type === 'ecobee');
    if (thermostat) {
      const tempStart = alarmMinutes - 45;
      smartActions.push({
        device: thermostat.name,
        action: 'warm_to_70F',
        triggerTime: `${String(Math.floor(tempStart / 60)).padStart(2, '0')}:${String(tempStart % 60).padStart(2, '0')}`,
      });
    }

    // White noise fade out
    const whiteNoise = this.smartDevices.find(d => d.type === 'white_noise_machine');
    if (whiteNoise) {
      const fadeStart = alarmMinutes - 15;
      smartActions.push({
        device: whiteNoise.name,
        action: 'gradual_fade_out',
        triggerTime: `${String(Math.floor(fadeStart / 60)).padStart(2, '0')}:${String(fadeStart % 60).padStart(2, '0')}`,
      });
    }

    return {
      alarmTime,
      sunriseSimulation: { startMinutesBefore: 30, targetLux: 250 },
      temperatureRamp: { startTemp: 66, endTemp: 70 },
      soundscape: chronotype?.type === 'lion' ? 'birds' : 'gentle_alarm',
      smartActions,
    };
  }

  async analyzeWeatherImpact(weatherCondition: string): Promise<WeatherSleepCorrelation> {
    // Analyze sleep logs during this weather condition
    const logsWithWeather = this.sleepLogs.filter(_log => {
      // In production, would match actual weather data
      return true; // Simplified
    });

    const avgQuality = logsWithWeather.reduce((s, l) => s + l.sleepQuality, 0) / Math.max(1, logsWithWeather.length);
    const avgDuration = logsWithWeather.reduce((s, l) => s + l.totalSleep, 0) / Math.max(1, logsWithWeather.length);

    let recommendation = '';
    if (weatherCondition === 'rainy') {
      recommendation = 'Rain often improves sleep. Consider opening windows slightly for natural white noise.';
    } else if (weatherCondition === 'stormy') {
      recommendation = 'Storms may disrupt sleep. Use white noise to mask thunder. Consider earlier bedtime.';
    } else if (weatherCondition === 'hot') {
      recommendation = 'Heat impairs sleep. Cool room to 65-68°F. Use breathable bedding.';
    } else if (weatherCondition === 'cold') {
      recommendation = 'Cold weather often improves sleep. Warm bedroom to 67°F. Use extra blankets.';
    } else {
      recommendation = 'Maintain consistent sleep environment regardless of weather.';
    }

    const correlation: WeatherSleepCorrelation = {
      conditions: weatherCondition,
      avgSleepQuality: Math.round(avgQuality * 10) / 10,
      avgSleepDuration: Math.round(avgDuration * 10) / 10,
      recommendation,
      sampleSize: logsWithWeather.length,
    };

    this.weatherCorrelations.set(weatherCondition, correlation);
    await AsyncStorage.setItem(STORAGE_KEYS.WEATHER_CORRELATIONS, JSON.stringify(Object.fromEntries(this.weatherCorrelations)));

    return correlation;
  }

  async calculateSocialJetLag(): Promise<SocialJetLagAnalysis> {
    const recentLogs = this.sleepLogs.slice(-28); // Last 4 weeks

    // Separate weekday and weekend logs
    const weekdayLogs = recentLogs.filter(log => {
      const date = new Date(log.date);
      const day = date.getDay();
      return day >= 1 && day <= 5; // Mon-Fri
    });

    const weekendLogs = recentLogs.filter(log => {
      const date = new Date(log.date);
      const day = date.getDay();
      return day === 0 || day === 6; // Sat-Sun
    });

    const weekdayAvgBedtime = weekdayLogs.reduce((s, l) => s + l.bedtime, 0) / Math.max(1, weekdayLogs.length);
    const weekdayAvgWakeTime = weekdayLogs.reduce((s, l) => s + l.wakeTime, 0) / Math.max(1, weekdayLogs.length);
    const weekendAvgBedtime = weekendLogs.reduce((s, l) => s + l.bedtime, 0) / Math.max(1, weekendLogs.length);
    const weekendAvgWakeTime = weekendLogs.reduce((s, l) => s + l.wakeTime, 0) / Math.max(1, weekendLogs.length);

    // Calculate mid-sleep point difference (social jet lag)
    const weekdayMidSleep = (weekdayAvgBedtime + weekdayAvgWakeTime) / 2;
    const weekendMidSleep = (weekendAvgBedtime + weekendAvgWakeTime) / 2;
    const jetLagHours = Math.abs(weekendMidSleep - weekdayMidSleep);

    let impact: SocialJetLagAnalysis['impact'];
    if (jetLagHours < 1) impact = 'minimal';
    else if (jetLagHours < 2) impact = 'moderate';
    else if (jetLagHours < 3) impact = 'significant';
    else impact = 'severe';

    const recoveryStrategies: string[] = [];
    if (jetLagHours > 1) {
      recoveryStrategies.push('Gradually shift weekend bedtime earlier (15 min/day)');
      recoveryStrategies.push('Get morning light exposure on weekends');
      recoveryStrategies.push('Avoid sleeping in more than 1 hour on weekends');
    }
    if (jetLagHours > 2) {
      recoveryStrategies.push('Consider light therapy in the morning');
      recoveryStrategies.push('Maintain consistent meal times');
    }

    return {
      weekdayAvgBedtime: Math.round(weekdayAvgBedtime * 10) / 10,
      weekdayAvgWakeTime: Math.round(weekdayAvgWakeTime * 10) / 10,
      weekendAvgBedtime: Math.round(weekendAvgBedtime * 10) / 10,
      weekendAvgWakeTime: Math.round(weekendAvgWakeTime * 10) / 10,
      jetLagHours: Math.round(jetLagHours * 10) / 10,
      impact,
      recoveryStrategies,
    };
  }

  async prescribeLightTherapy(): Promise<LightTherapyPrescription> {
    const chronotype = this.chronotype;
    const sleepDebt = await this.getSleepDebt();

    let type: LightTherapyPrescription['type'];
    let duration: number;
    let idealTime: string;
    let intensity: number;
    let instructions: string[];
    let expectedBenefit: string;

    if (chronotype?.type === 'wolf') {
      // Night owls need morning light to shift earlier
      type = 'morning_exposure';
      duration = 30;
      idealTime = '07:00';
      intensity = 10000;
      instructions = [
        'Use 10,000 lux light therapy lamp',
        'Position lamp 16-24 inches from face',
        'Use within 30 minutes of waking',
        'Don\'t look directly at the light',
        'Continue for 2-3 weeks for full effect',
      ];
      expectedBenefit = 'Shift circadian rhythm earlier, easier morning wakeups';
    } else if (chronotype?.type === 'lion') {
      // Early birds may need evening light to stay up later
      type = 'evening_avoidance';
      duration = 120;
      idealTime = '19:00';
      intensity = 0;
      instructions = [
        'Dim indoor lights after 7pm',
        'Use blue light filtering glasses',
        'Enable night shift mode on devices',
        'Avoid bright screens 2 hours before bed',
      ];
      expectedBenefit = 'Delay sleep onset, avoid early morning awakening';
    } else {
      // Default SAD lamp therapy for energy
      type = 'sad_lamp';
      duration = 20;
      idealTime = '08:00';
      intensity = 10000;
      instructions = [
        'Use during breakfast or morning routine',
        'Consistent daily use is key',
        'Reduce duration if experiencing headaches',
      ];
      expectedBenefit = 'Improved energy, mood, and alertness';
    }

    if (sleepDebt && sleepDebt.totalHoursOwed > 5) {
      instructions.push('Address sleep debt alongside light therapy for best results');
    }

    return {
      type,
      duration,
      idealTime,
      intensity,
      frequency: 'daily',
      instructions,
      expectedBenefit,
    };
  }

  async analyzeMoonPhaseImpact(): Promise<MoonPhaseCorrelation[]> {
    // Simplified moon phase calculation
    const getMoonPhase = (date: Date): string => {
      const phases = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'];
      const lp = 2551443; // lunar period in seconds
      const new_moon = new Date(1970, 0, 7, 20, 35, 0).getTime() / 1000;
      const now = date.getTime() / 1000;
      const phase = ((now - new_moon) % lp) / lp;
      return phases[Math.floor(phase * 8)];
    };

    // Group sleep logs by moon phase
    const phaseGroups = new Map<string, SleepLog[]>();
    
    this.sleepLogs.forEach(log => {
      const phase = getMoonPhase(new Date(log.date));
      const existing = phaseGroups.get(phase) || [];
      existing.push(log);
      phaseGroups.set(phase, existing);
    });

    const correlations: MoonPhaseCorrelation[] = [];

    phaseGroups.forEach((logs, phase) => {
      const avgQuality = logs.reduce((s, l) => s + l.sleepQuality, 0) / logs.length;
      const avgDuration = logs.reduce((s, l) => s + l.totalSleep, 0) / logs.length;
      const nightmareCount = logs.filter(l => l.nightmares).length;

      let personalImpact: MoonPhaseCorrelation['personalImpact'] = 'none';
      if (phase === 'full' && avgQuality < 3) personalImpact = 'significant';
      else if (avgQuality < 3.5) personalImpact = 'moderate';
      else if (avgQuality < 4) personalImpact = 'mild';

      correlations.push({
        phase: phase as MoonPhaseCorrelation['phase'],
        avgSleepQuality: Math.round(avgQuality * 10) / 10,
        avgSleepDuration: Math.round(avgDuration * 10) / 10,
        nightmareFrequency: nightmareCount / logs.length,
        personalImpact,
      });
    });

    return correlations;
  }

  getConnectedDevices(): SmartDevice[] {
    return [...this.smartDevices];
  }

  // ============================================================================
  // AI SLEEP STAGE PREDICTION
  // ============================================================================

  async predictSleepStages(bedtime: string, wakeTime: string): Promise<SleepStagePrediction> {
    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    
    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;
    if (wakeMinutes < bedMinutes) wakeMinutes += 24 * 60;
    
    const totalMinutes = wakeMinutes - bedMinutes;
    const fallAsleepTime = 15; // minutes to fall asleep
    const sleepMinutes = totalMinutes - fallAsleepTime;
    const cycleLength = SLEEP_CYCLE_MINUTES;
    const numCycles = Math.floor(sleepMinutes / cycleLength);
    
    const stages: SleepStagePrediction['stages'] = [];
    let currentMinute = fallAsleepTime;
    
    // Build predicted sleep architecture
    for (let cycle = 0; cycle < numCycles; cycle++) {
      // Light sleep (N1/N2) - decreases through night
      const lightDuration = Math.round(25 - (cycle * 3));
      stages.push({
        stage: 'light',
        startMinute: currentMinute,
        duration: lightDuration,
        quality: 0.7 + (cycle * 0.05),
      });
      currentMinute += lightDuration;
      
      // Deep sleep (N3) - decreases through night
      const deepDuration = Math.max(5, Math.round(35 - (cycle * 8)));
      stages.push({
        stage: 'deep',
        startMinute: currentMinute,
        duration: deepDuration,
        quality: 0.9 - (cycle * 0.1),
      });
      currentMinute += deepDuration;
      
      // REM - increases through night
      const remDuration = Math.round(10 + (cycle * 8));
      stages.push({
        stage: 'rem',
        startMinute: currentMinute,
        duration: remDuration,
        quality: 0.6 + (cycle * 0.08),
      });
      currentMinute += remDuration;
    }
    
    // Calculate optimal wake times (end of REM cycles)
    const optimalWakeTimes: string[] = [];
    let cumulativeMinutes = bedMinutes + fallAsleepTime;
    for (let i = 0; i < numCycles; i++) {
      cumulativeMinutes += cycleLength;
      let wakeHour = Math.floor((cumulativeMinutes % (24 * 60)) / 60);
      let wakeMin = cumulativeMinutes % 60;
      optimalWakeTimes.push(`${String(wakeHour).padStart(2, '0')}:${String(wakeMin).padStart(2, '0')}`);
    }
    
    // Predict quality based on factors
    const qualityFactors = this.calculateQualityFactors();
    const predictedQuality = Math.min(5, Math.max(1, 
      3 + (numCycles >= 4 ? 1 : -1) + qualityFactors.netImpact
    ));
    
    // Generate warnings
    const warnings: string[] = [];
    if (numCycles < 4) {
      warnings.push('Insufficient sleep cycles - aim for at least 4 complete cycles');
    }
    if (sleepMinutes < 360) {
      warnings.push('Total sleep under 6 hours - expect reduced cognitive function');
    }
    if (this.sleepDebt && this.sleepDebt.totalHoursOwed > 5) {
      warnings.push('High sleep debt may affect REM and deep sleep quality');
    }
    
    return {
      stages,
      predictedQuality: Math.round(predictedQuality * 10) / 10,
      optimalWakeTimes: optimalWakeTimes.slice(-3),
      warnings,
      confidence: numCycles >= 4 ? 0.8 : 0.6,
    };
  }

  private calculateQualityFactors(): { factors: Array<{ name: string; impact: number }>; netImpact: number } {
    const factors: Array<{ name: string; impact: number }> = [];
    const recentLogs = this.sleepLogs.slice(-7);
    
    // Caffeine impact
    const avgCaffeine = recentLogs.reduce((s, l) => s + (l.caffeineIntake || 0), 0) / Math.max(1, recentLogs.length);
    if (avgCaffeine > 300) factors.push({ name: 'High caffeine', impact: -0.5 });
    else if (avgCaffeine > 150) factors.push({ name: 'Moderate caffeine', impact: -0.2 });
    
    // Alcohol impact
    const avgAlcohol = recentLogs.reduce((s, l) => s + (l.alcoholIntake || 0), 0) / Math.max(1, recentLogs.length);
    if (avgAlcohol > 2) factors.push({ name: 'Alcohol consumption', impact: -0.5 });
    
    // Exercise impact
    const avgExercise = recentLogs.reduce((s, l) => s + (l.exerciseMinutes || 0), 0) / Math.max(1, recentLogs.length);
    if (avgExercise > 30) factors.push({ name: 'Regular exercise', impact: 0.3 });
    
    // Stress impact
    const avgStress = recentLogs.reduce((s, l) => s + (l.stressLevel || 0), 0) / Math.max(1, recentLogs.length);
    if (avgStress > 3) factors.push({ name: 'High stress', impact: -0.4 });
    
    // Consistency impact
    const consistency = this.calculateSleepConsistency();
    if (consistency > 0.8) factors.push({ name: 'Consistent schedule', impact: 0.4 });
    else if (consistency < 0.5) factors.push({ name: 'Inconsistent schedule', impact: -0.3 });
    
    const netImpact = factors.reduce((s, f) => s + f.impact, 0);
    return { factors, netImpact };
  }

  private calculateSleepConsistency(): number {
    const recentLogs = this.sleepLogs.slice(-14);
    if (recentLogs.length < 3) return 0.5;
    
    const bedtimes = recentLogs.map(l => l.bedtime);
    const wakeTimes = recentLogs.map(l => l.wakeTime);
    
    const bedtimeVariance = this.calculateVariance(bedtimes);
    const wakeTimeVariance = this.calculateVariance(wakeTimes);
    
    // Lower variance = higher consistency
    const maxVariance = 4; // hours
    const bedtimeConsistency = 1 - Math.min(1, bedtimeVariance / maxVariance);
    const wakeTimeConsistency = 1 - Math.min(1, wakeTimeVariance / maxVariance);
    
    return (bedtimeConsistency + wakeTimeConsistency) / 2;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((s, d) => s + d, 0) / values.length);
  }

  // ============================================================================
  // DREAM AI ANALYSIS
  // ============================================================================

  async analyzeDream(dreamDescription: string, emotions: string[]): Promise<DreamAIAnalysis> {
    const dreamId = `dream_${Date.now()}`;
    
    // Extract themes using keyword matching (simplified AI)
    const themeKeywords: Record<string, string[]> = {
      anxiety: ['chase', 'running', 'escape', 'lost', 'late', 'unprepared', 'test', 'exam'],
      loss: ['death', 'dying', 'gone', 'missing', 'funeral', 'goodbye'],
      transformation: ['flying', 'floating', 'changing', 'growing', 'shrinking'],
      relationship: ['family', 'friend', 'partner', 'stranger', 'crowd', 'people'],
      control: ['driving', 'steering', 'falling', 'paralyzed', 'stuck'],
      identity: ['naked', 'exposed', 'mirror', 'reflection', 'disguise'],
      journey: ['traveling', 'road', 'path', 'destination', 'vehicle'],
      home: ['house', 'room', 'door', 'window', 'building'],
    };
    
    const lowerDesc = dreamDescription.toLowerCase();
    const themes: string[] = [];
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(kw => lowerDesc.includes(kw))) {
        themes.push(theme);
      }
    }
    
    // Extract symbols
    const symbolMeanings: Record<string, string> = {
      water: 'Emotions, subconscious mind, purification',
      flying: 'Freedom, ambition, overcoming obstacles',
      falling: 'Loss of control, fear, insecurity',
      teeth: 'Self-image, confidence, communication',
      snake: 'Transformation, hidden fears, healing',
      house: 'Self, psyche, different aspects of personality',
      car: 'Life direction, ambition, control',
      death: 'Endings, transformation, new beginnings',
      baby: 'New beginnings, vulnerability, potential',
      animal: 'Instincts, emotions, natural self',
    };
    
    const symbols: DreamAIAnalysis['symbols'] = [];
    for (const [symbol, meaning] of Object.entries(symbolMeanings)) {
      if (lowerDesc.includes(symbol)) {
        // Check frequency in dream history
        const frequency = this.checkSymbolFrequency(symbol);
        symbols.push({ symbol, possibleMeaning: meaning, frequency });
      }
    }
    
    // Determine processing type
    let processingType: DreamAIAnalysis['processingType'] = 'memory_consolidation';
    if (emotions.some(e => ['fear', 'anxiety', 'terror'].includes(e.toLowerCase()))) {
      processingType = 'threat_rehearsal';
    } else if (emotions.some(e => ['sad', 'grief', 'angry'].includes(e.toLowerCase()))) {
      processingType = 'emotional_processing';
    } else if (themes.includes('transformation') || symbols.length > 2) {
      processingType = 'creative_synthesis';
    }
    
    // Calculate stress indicators
    const stressWords = ['chase', 'attack', 'fall', 'drown', 'trapped', 'scream', 'run', 'hide', 'panic'];
    const stressCount = stressWords.filter(w => lowerDesc.includes(w)).length;
    const stressIndicators = Math.min(10, stressCount * 2 + (emotions.includes('fear') ? 3 : 0));
    
    // Find connections
    const connections = {
      toRecentEvents: this.findRecentEventConnections(themes),
      toRecurringThemes: this.findRecurringThemes(themes),
      toSymptoms: this.findSymptomConnections(stressIndicators),
    };
    
    // Generate insights
    const insights: string[] = [];
    if (processingType === 'threat_rehearsal') {
      insights.push('Your brain may be processing anxieties through this dream');
    }
    if (themes.includes('control')) {
      insights.push('Themes of control suggest focus on autonomy in waking life');
    }
    if (symbols.some(s => s.frequency === 'recurring')) {
      insights.push('Recurring symbols suggest unresolved issues seeking attention');
    }
    
    // Actionable advice
    const actionableAdvice: string[] = [];
    if (stressIndicators > 5) {
      actionableAdvice.push('Consider stress reduction techniques before bed');
      actionableAdvice.push('Journaling may help process anxious dream content');
    }
    if (processingType === 'emotional_processing') {
      actionableAdvice.push('Allow yourself time to process these emotions during waking hours');
    }
    
    return {
      dreamId,
      themes,
      emotions,
      symbols,
      stressIndicators,
      processingType,
      connections,
      insights,
      actionableAdvice,
    };
  }

  private checkSymbolFrequency(symbol: string): 'first_time' | 'recurring' | 'frequent' {
    const recentDreams = this.dreamPatterns.slice(-30);
    const occurrences = recentDreams.filter(d => 
      d.nightmareDescription?.toLowerCase().includes(symbol)
    ).length;
    
    if (occurrences === 0) return 'first_time';
    if (occurrences < 3) return 'recurring';
    return 'frequent';
  }

  private findRecentEventConnections(themes: string[]): string[] {
    const connections: string[] = [];
    
    // Check recent stress levels
    const recentStress = this.sleepLogs.slice(-7).filter(l => (l.stressLevel || 0) >= 4);
    if (recentStress.length > 0 && themes.includes('anxiety')) {
      connections.push('Recent high stress periods may be reflected in dream anxiety');
    }
    
    return connections;
  }

  private findRecurringThemes(themes: string[]): string[] {
    const recurring: string[] = [];
    const allThemes = this.dreamPatterns.flatMap(d => {
      // Extract themes from stored dreams
      return d.possibleTriggers || [];
    });
    
    for (const theme of themes) {
      const count = allThemes.filter(t => t.toLowerCase().includes(theme)).length;
      if (count >= 3) {
        recurring.push(`"${theme}" appears frequently in your dreams`);
      }
    }
    
    return recurring;
  }

  private findSymptomConnections(stressLevel: number): string[] {
    const connections: string[] = [];
    
    if (stressLevel > 7) {
      connections.push('High dream stress may correlate with daytime anxiety symptoms');
    }
    
    if (this.sleepDebt && this.sleepDebt.totalHoursOwed > 5) {
      connections.push('Sleep debt may intensify dream vividness and stress content');
    }
    
    return connections;
  }

  // ============================================================================
  // SLEEP QUALITY PREDICTION
  // ============================================================================

  async predictTonightsSleepQuality(): Promise<SleepQualityPrediction> {
    const factors: SleepQualityPrediction['factors'] = [];
    let baseQuality = 3.0;
    
    // Analyze recent patterns
    const recentLogs = this.sleepLogs.slice(-7);
     
    const _avgQuality2 = recentLogs.reduce((s, l) => s + l.sleepQuality, 0) / Math.max(1, recentLogs.length);
    
    // Chronotype alignment
    if (this.chronotype) {
      const now = new Date();
      const idealBedtime = this.chronotype.idealSleepWindow.start;
      const hoursUntilBed = (idealBedtime - now.getHours() + 24) % 24;
      
      if (hoursUntilBed < 2 || hoursUntilBed > 8) {
        factors.push({ factor: 'Good chronotype alignment', impact: 'positive', weight: 0.3 });
        baseQuality += 0.3;
      }
    }
    
    // Sleep debt impact
    if (this.sleepDebt) {
      if (this.sleepDebt.totalHoursOwed > 10) {
        factors.push({ factor: 'High sleep debt', impact: 'negative', weight: -0.5 });
        baseQuality -= 0.5;
      } else if (this.sleepDebt.totalHoursOwed < 3) {
        factors.push({ factor: 'Low sleep debt', impact: 'positive', weight: 0.3 });
        baseQuality += 0.3;
      }
    }
    
    // Consistency factor
    const consistency = this.calculateSleepConsistency();
    if (consistency > 0.7) {
      factors.push({ factor: 'Consistent sleep schedule', impact: 'positive', weight: 0.4 });
      baseQuality += 0.4;
    } else if (consistency < 0.4) {
      factors.push({ factor: 'Inconsistent schedule', impact: 'negative', weight: -0.3 });
      baseQuality -= 0.3;
    }
    
    // Day of week factor
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      factors.push({ factor: 'Weekend (potential for sleep-in)', impact: 'positive', weight: 0.2 });
      baseQuality += 0.2;
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (baseQuality < 3) {
      recommendations.push('Consider an earlier bedtime tonight');
      recommendations.push('Limit screen time 1 hour before bed');
      recommendations.push('Try a relaxation technique before sleep');
    }
    if (factors.some(f => f.factor.includes('caffeine'))) {
      recommendations.push('Avoid caffeine after 2pm');
    }
    
    return {
      predictedQuality: Math.min(5, Math.max(1, Math.round(baseQuality * 10) / 10)),
      factors,
      recommendations,
      confidence: recentLogs.length >= 7 ? 0.8 : 0.5,
    };
  }

  // ============================================================================
  // CIRCADIAN ALIGNMENT ANALYSIS
  // ============================================================================

  async analyzeCircadianAlignment(): Promise<CircadianAlignment> {
    const recentLogs = this.sleepLogs.slice(-14);
    
    // Calculate natural rhythm based on chronotype or observed patterns
    let naturalRhythm: CircadianAlignment['naturalRhythm'];
    
    if (this.chronotype) {
      const profile = CHRONOTYPE_PROFILES[this.chronotype.type];
      naturalRhythm = {
        peakAlertness: `${profile.peakEnergyHours[2]}:00`,
        naturalSleepiness: `${(profile.idealSleepWindow.start - 1 + 24) % 24}:00`,
        optimalBedtime: `${Math.floor(profile.idealSleepWindow.start)}:${String(Math.round((profile.idealSleepWindow.start % 1) * 60)).padStart(2, '0')}`,
        optimalWakeTime: `${Math.floor(profile.idealSleepWindow.end)}:${String(Math.round((profile.idealSleepWindow.end % 1) * 60)).padStart(2, '0')}`,
      };
    } else {
      // Infer from logs
      const avgBed = recentLogs.reduce((s, l) => s + l.bedtime, 0) / Math.max(1, recentLogs.length);
      const avgWake = recentLogs.reduce((s, l) => s + l.wakeTime, 0) / Math.max(1, recentLogs.length);
      
      naturalRhythm = {
        peakAlertness: `${Math.round(avgWake + 3)}:00`,
        naturalSleepiness: `${Math.round(avgBed - 1)}:00`,
        optimalBedtime: `${Math.floor(avgBed)}:${String(Math.round((avgBed % 1) * 60)).padStart(2, '0')}`,
        optimalWakeTime: `${Math.floor(avgWake)}:${String(Math.round((avgWake % 1) * 60)).padStart(2, '0')}`,
      };
    }
    
    // Calculate current alignment
    const bedtimes = recentLogs.map(l => l.bedtime);
    const wakeTimes = recentLogs.map(l => l.wakeTime);
    const bedtimeVariance = this.calculateVariance(bedtimes);
    const wakeTimeVariance = this.calculateVariance(wakeTimes);
    const consistencyScore = this.calculateSleepConsistency() * 100;
    
    // Calculate overall score
    const varianceScore = 100 - Math.min(100, (bedtimeVariance + wakeTimeVariance) * 20);
    const chronotypeMatchScore = this.chronotype ? this.chronotype.confidence : 50;
    const alignmentScore = Math.round((varianceScore + consistencyScore + chronotypeMatchScore) / 3);
    
    // Jet lag risk
    const socialJetLag = await this.calculateSocialJetLag();
    const jetLagRisk = Math.min(10, socialJetLag.jetLagHours * 3);
    
    // Recommendations
    const recommendations: string[] = [];
    if (alignmentScore < 50) {
      recommendations.push('Establish a consistent bedtime within 30 minutes each night');
    }
    if (jetLagRisk > 5) {
      recommendations.push('Reduce weekend sleep schedule variation');
    }
    if (bedtimeVariance > 1.5) {
      recommendations.push('Your bedtime varies significantly - aim for more consistency');
    }
    
    return {
      score: alignmentScore,
      naturalRhythm,
      currentAlignment: {
        bedtimeVariance: Math.round(bedtimeVariance * 10) / 10,
        wakeTimeVariance: Math.round(wakeTimeVariance * 10) / 10,
        consistencyScore: Math.round(consistencyScore),
      },
      jetLagRisk: Math.round(jetLagRisk * 10) / 10,
      recommendations,
    };
  }

  // ============================================================================
  // AI SLEEP OPTIMIZATION PLAN
  // ============================================================================

  async generateOptimizationPlan(): Promise<SleepOptimizationPlan> {
    const alignment = await this.analyzeCircadianAlignment();
    const sleepDebt = this.getSleepDebt();
    const qualityPrediction = await this.predictTonightsSleepQuality();
    
    // Calculate target times
    let targetBedtime = alignment.naturalRhythm.optimalBedtime;
    let targetWakeTime = alignment.naturalRhythm.optimalWakeTime;
    let targetDuration = this.preferences.targetSleepHours;
    
    // Adjust for sleep debt repayment
    if (sleepDebt && sleepDebt.totalHoursOwed > 3) {
      targetDuration += 0.5; // Extra 30 mins
      const [h, m] = targetBedtime.split(':').map(Number);
      const newBedMinutes = h * 60 + m - 30;
      targetBedtime = `${String(Math.floor(newBedMinutes / 60)).padStart(2, '0')}:${String(newBedMinutes % 60).padStart(2, '0')}`;
    }
    
    // Determine focus area
    let focusArea = 'consistency';
    if (sleepDebt && sleepDebt.totalHoursOwed > 5) {
      focusArea = 'debt repayment';
    } else if (alignment.score < 50) {
      focusArea = 'circadian alignment';
    } else if (qualityPrediction.predictedQuality < 3) {
      focusArea = 'sleep quality';
    }
    
    // Daily actions
    const dailyActions: SleepOptimizationPlan['dailyActions'] = [
      {
        time: '07:00',
        action: 'Get bright light exposure within 30 minutes of waking',
        importance: 'required',
      },
      {
        time: '14:00',
        action: 'No caffeine after this time',
        importance: 'required',
      },
      {
        time: '19:00',
        action: 'Dim indoor lights to signal evening',
        importance: 'recommended',
      },
      {
        time: targetBedtime,
        action: 'Begin wind-down routine',
        importance: 'required',
      },
    ];
    
    // Weekly milestones
    const weeklyMilestones: SleepOptimizationPlan['weeklyMilestones'] = [
      {
        week: 1,
        goal: 'Establish consistent bedtime (within 30 mins)',
        metric: 'Bedtime variance < 0.5 hours',
      },
      {
        week: 2,
        goal: 'Improve sleep quality score',
        metric: 'Average quality > 3.5',
      },
      {
        week: 3,
        goal: 'Reduce sleep debt by 30%',
        metric: `Debt < ${Math.round((sleepDebt?.totalHoursOwed || 0) * 0.7)} hours`,
      },
      {
        week: 4,
        goal: 'Achieve circadian alignment',
        metric: 'Alignment score > 70',
      },
    ];
    
    // Estimated improvement
    const estimatedImprovement = {
      qualityIncrease: Math.min(2, Math.max(0.5, (5 - qualityPrediction.predictedQuality) * 0.5)),
      debtRepaymentWeeks: sleepDebt ? Math.ceil(sleepDebt.totalHoursOwed / 3.5) : 0,
      energyImprovement: Math.round(alignment.score < 70 ? 25 : 10),
    };
    
    return {
      weeklyGoals: {
        targetBedtime,
        targetWakeTime,
        targetDuration,
        focusArea,
      },
      dailyActions,
      weeklyMilestones,
      estimatedImprovement,
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const circadianRhythmDJ = CircadianRhythmDJManager.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useCircadianRhythmDJ() {
  const [chronotype, setChronotype] = React.useState<ChronotypeProfile | null>(
    circadianRhythmDJ.getChronotype()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setChronotype(circadianRhythmDJ.getChronotype());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    // Chronotype
    chronotype,
    getQuiz: () => circadianRhythmDJ.getChronotypeQuiz(),
    calculateChronotype: (answers: Record<number, number>) => 
      circadianRhythmDJ.calculateChronotype(answers),
    setChronotype: (profile: ChronotypeProfile) =>
      circadianRhythmDJ.setChronotype(profile),
    
    // Sleep logging
    logSleep: (log: Omit<SleepLog, 'id'>) => circadianRhythmDJ.logSleep(log),
    getSleepHistory: (days?: number) => circadianRhythmDJ.getSleepHistory(days),
    
    // Sleep debt
    getSleepDebt: () => circadianRhythmDJ.getSleepDebt(),
    
    // Dreams
    getDreamPatterns: () => circadianRhythmDJ.getDreamInterferencePatterns(),
    
    // Optimization
    calculateBedtime: (wakeTime: string) => circadianRhythmDJ.calculateOptimalBedtime(wakeTime),
    prescribeNap: (currentTime: string, deficit: number) => 
      circadianRhythmDJ.prescribeNap(currentTime, deficit),
    
    // Preferences
    setPreferences: (prefs: Partial<CircadianPreferences>) => 
      circadianRhythmDJ.setPreferences(prefs),
    getPreferences: () => circadianRhythmDJ.getPreferences(),

    // =========== SMART ENVIRONMENT ===========
    connectSmartDevice: (device: SmartDevice) =>
      circadianRhythmDJ.connectSmartDevice(device),
    configureSmartAlarm: (alarmTime: string) =>
      circadianRhythmDJ.configureSmartAlarm(alarmTime),
    getConnectedDevices: () => circadianRhythmDJ.getConnectedDevices(),

    // =========== ENVIRONMENTAL CORRELATIONS ===========
    analyzeWeatherImpact: (condition: string) =>
      circadianRhythmDJ.analyzeWeatherImpact(condition),
    calculateSocialJetLag: () =>
      circadianRhythmDJ.calculateSocialJetLag(),
    prescribeLightTherapy: () =>
      circadianRhythmDJ.prescribeLightTherapy(),
    analyzeMoonPhase: () =>
      circadianRhythmDJ.analyzeMoonPhaseImpact(),

    // =========== AI SLEEP PREDICTION ===========
    predictSleepStages: (bedtime: string, wakeTime: string) =>
      circadianRhythmDJ.predictSleepStages(bedtime, wakeTime),
    analyzeDream: (description: string, emotions: string[]) =>
      circadianRhythmDJ.analyzeDream(description, emotions),
    predictTonightQuality: () =>
      circadianRhythmDJ.predictTonightsSleepQuality(),
    analyzeAlignment: () =>
      circadianRhythmDJ.analyzeCircadianAlignment(),
    generateOptimizationPlan: () =>
      circadianRhythmDJ.generateOptimizationPlan(),
  };
}
