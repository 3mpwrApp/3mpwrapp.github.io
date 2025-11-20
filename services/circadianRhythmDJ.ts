/**
 * Circadian Rhythm DJ
 * 
 * Sleep optimization system with chronotype detection, sleep debt amortization,
 * dream interference detection, wake-up timing optimizer, and nap prescription.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

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
// Constants
// ============================================================================

const STORAGE_KEYS = {
  SLEEP_LOGS: 'circadianDJ:sleepLogs:v1',
  CHRONOTYPE: 'circadianDJ:chronotype:v1',
  PREFERENCES: 'circadianDJ:preferences:v1',
  SLEEP_DEBT: 'circadianDJ:sleepDebt:v1',
  DREAM_PATTERNS: 'circadianDJ:dreamPatterns:v1',
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
  };
}
