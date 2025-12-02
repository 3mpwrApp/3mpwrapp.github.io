/**
 * Energy-Aware UI System
 * 
 * Dynamically adapts interface complexity based on user's current energy state.
 * Detects low-energy periods and automatically simplifies UI, enables voice input,
 * and provides resume-later functionality for multi-day tasks.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Platform } from 'react-native';

import { logError } from '../utils/errorLogger';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type EnergyState = 'crashed' | 'depleted' | 'conserving' | 'baseline' | 'energized' | 'hyperfocus' | 'manic_warning';
export type UIComplexity = 'minimal' | 'simplified' | 'standard' | 'advanced';

export interface EnergyAwareConfig {
  currentEnergyState: EnergyState;
  uiComplexity: UIComplexity;
  voiceInputEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  autoSaveEnabled: boolean;
  reducedAnimations: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  buttonSize: 'compact' | 'normal' | 'large' | 'touch-friendly';
  colorScheme: 'default' | 'high-contrast' | 'low-stimulation';
}

export interface UsagePattern {
  timestamp: number;
  screenTime: number; // seconds
  tapsPerMinute: number;
  scrollSpeed: number; // pixels/second
  typingSpeed: number; // characters/minute
  errorRate: number; // misclicks/minute
  taskCompletionRate: number; // 0-1
  timeOfDay: number; // 0-23
}

export interface TaskState {
  taskId: string;
  taskType: string;
  startedAt: number;
  lastActiveAt: number;
  progress: number; // 0-1
  formData: Record<string, any>;
  estimatedTimeRemaining: number; // minutes
  canResumeFrom: number; // timestamp
}

// ============================================================================
// BIOMETRIC INTEGRATION - NEVER BEEN DONE BEFORE
// ============================================================================

export interface BiometricData {
  heartRate: number; // bpm
  hrv: number; // ms (heart rate variability)
  sleepQuality: number; // 0-100 from last night
  stepCount: number; // today's steps
  stressIndex: number; // 0-100 from wearable
  skinTemperature?: number;
  bloodOxygen?: number;
  timestamp: number;
}

export interface WearableDevice {
  id: string;
  type: 'apple_watch' | 'fitbit' | 'garmin' | 'samsung_health' | 'oura' | 'whoop';
  name: string;
  connected: boolean;
  lastSync: number;
  capabilities: string[];
}

export interface BiometricEnergyCorrelation {
  hrvToEnergy: number; // correlation coefficient
  sleepToEnergy: number;
  stepsToEnergy: number;
  heartRateToEnergy: number;
  sampleSize: number;
}

export interface PredictiveEnergyModel {
  predictedEnergy: number; // 0-100
  confidence: number; // 0-100
  factors: Array<{ name: string; contribution: number }>;
  recommendation: string;
  optimalActivityWindow: { start: number; end: number }; // hours
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  ENERGY_HISTORY: 'energyAware:history:v1',
  USAGE_PATTERNS: 'energyAware:usagePatterns:v1',
  TASK_STATES: 'energyAware:taskStates:v1',
  CONFIG: 'energyAware:config:v1',
  LOW_ENERGY_TIMES: 'energyAware:lowEnergyTimes:v1',
  BIOMETRIC_DATA: 'energyAware:biometricData:v1',
  WEARABLES: 'energyAware:wearables:v1',
  CORRELATIONS: 'energyAware:correlations:v1',
} as const;

const ENERGY_THRESHOLDS = {
  crashed: { tapsPerMinute: 5, errorRate: 0.4, scrollSpeed: 50 },
  depleted: { tapsPerMinute: 15, errorRate: 0.3, scrollSpeed: 100 },
  conserving: { tapsPerMinute: 25, errorRate: 0.2, scrollSpeed: 150 },
  baseline: { tapsPerMinute: 40, errorRate: 0.1, scrollSpeed: 250 },
  energized: { tapsPerMinute: 60, errorRate: 0.05, scrollSpeed: 400 },
  hyperfocus: { tapsPerMinute: 80, errorRate: 0.02, scrollSpeed: 600 },
  manic_warning: { tapsPerMinute: 120, errorRate: 0.35, scrollSpeed: 1000 },
} as const;

// ============================================================================
// Energy State Detection
// ============================================================================

class EnergyAwareUIManager {
  private static instance: EnergyAwareUIManager;
  private currentConfig: EnergyAwareConfig;
  private usageHistory: UsagePattern[] = [];
  private taskStates: Map<string, TaskState> = new Map();
  private listeners: Set<(config: EnergyAwareConfig) => void> = new Set();

  private constructor() {
    this.currentConfig = this.getDefaultConfig();
    this.loadPersistedState();
    this.startPatternDetection();
  }

  static getInstance(): EnergyAwareUIManager {
    if (!EnergyAwareUIManager.instance) {
      EnergyAwareUIManager.instance = new EnergyAwareUIManager();
    }
    return EnergyAwareUIManager.instance;
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  private getDefaultConfig(): EnergyAwareConfig {
    return {
      currentEnergyState: 'baseline',
      uiComplexity: 'standard',
      voiceInputEnabled: false,
      hapticFeedbackEnabled: true,
      autoSaveEnabled: true,
      reducedAnimations: false,
      fontSize: 'medium',
      buttonSize: 'normal',
      colorScheme: 'default',
    };
  }

  async loadPersistedState(): Promise<void> {
    try {
      // Skip on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') return;
      
      const [configStr, patternsStr, tasksStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONFIG),
        AsyncStorage.getItem(STORAGE_KEYS.USAGE_PATTERNS),
        AsyncStorage.getItem(STORAGE_KEYS.TASK_STATES),
      ]);

      if (configStr) {
        this.currentConfig = { ...this.currentConfig, ...JSON.parse(configStr) };
      }
      if (patternsStr) {
        this.usageHistory = JSON.parse(patternsStr);
      }
      if (tasksStr) {
        const tasksObj = JSON.parse(tasksStr);
        this.taskStates = new Map(Object.entries(tasksObj));
      }
    } catch (err) {
      logError('energyAwareUI', 'Failed to load energy-aware state', err);
    }
  }

  async persistState(): Promise<void> {
    try {
      const tasksObj = Object.fromEntries(this.taskStates.entries());
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.currentConfig)),
        AsyncStorage.setItem(STORAGE_KEYS.USAGE_PATTERNS, JSON.stringify(this.usageHistory.slice(-100))),
        AsyncStorage.setItem(STORAGE_KEYS.TASK_STATES, JSON.stringify(tasksObj)),
      ]);
    } catch (err) {
      logError('energyAwareUI', 'Failed to persist energy-aware state', err);
    }
  }

  // ============================================================================
  // Usage Pattern Tracking
  // ============================================================================

  trackUsagePattern(pattern: Partial<UsagePattern>): void {
    const fullPattern: UsagePattern = {
      timestamp: Date.now(),
      screenTime: pattern.screenTime || 0,
      tapsPerMinute: pattern.tapsPerMinute || 0,
      scrollSpeed: pattern.scrollSpeed || 0,
      typingSpeed: pattern.typingSpeed || 0,
      errorRate: pattern.errorRate || 0,
      taskCompletionRate: pattern.taskCompletionRate || 0,
      timeOfDay: new Date().getHours(),
    };

    this.usageHistory.push(fullPattern);
    
    // Keep only last 1000 patterns
    if (this.usageHistory.length > 1000) {
      this.usageHistory = this.usageHistory.slice(-1000);
    }

    // Detect energy state change
    this.detectEnergyState(fullPattern);
  }

  private detectEnergyState(pattern: UsagePattern): void {
    // Multi-factor energy state detection
    let score = 0;

    for (const [state, thresholds] of Object.entries(ENERGY_THRESHOLDS)) {
      let stateScore = 0;
      
      if (pattern.tapsPerMinute <= thresholds.tapsPerMinute) stateScore++;
      if (pattern.errorRate >= thresholds.errorRate) stateScore++;
      if (pattern.scrollSpeed <= thresholds.scrollSpeed) stateScore++;
      
      if (stateScore > score) {
        score = stateScore;
        this.updateEnergyState(state as EnergyState);
      }
    }

    // Also check time-of-day patterns (learned behavior)
    this.checkLearnedLowEnergyTimes(pattern.timeOfDay);
  }

  private async checkLearnedLowEnergyTimes(hour: number): Promise<void> {
    try {
      const lowEnergyTimesStr = await AsyncStorage.getItem(STORAGE_KEYS.LOW_ENERGY_TIMES);
      if (!lowEnergyTimesStr) return;

      const lowEnergyTimes: Record<number, number> = JSON.parse(lowEnergyTimesStr);
      
      // If this hour has historically been low-energy, preemptively simplify UI
      if (lowEnergyTimes[hour] && lowEnergyTimes[hour] > 5) {
        this.updateUIComplexity('simplified');
      }
    } catch (err) {
      logError('energyAwareUI', 'Failed to check learned low-energy times', err);
    }
  }

  // ============================================================================
  // Energy State Management
  // ============================================================================

  private updateEnergyState(newState: EnergyState): void {
    if (this.currentConfig.currentEnergyState === newState) return;

    this.currentConfig.currentEnergyState = newState;

    // Auto-adjust UI based on energy state
    switch (newState) {
      case 'crashed':
      case 'depleted':
        this.updateUIComplexity('minimal');
        this.currentConfig.voiceInputEnabled = true;
        this.currentConfig.buttonSize = 'touch-friendly';
        this.currentConfig.fontSize = 'xlarge';
        this.currentConfig.colorScheme = 'low-stimulation';
        this.currentConfig.reducedAnimations = true;
        break;

      case 'conserving':
        this.updateUIComplexity('simplified');
        this.currentConfig.voiceInputEnabled = true;
        this.currentConfig.buttonSize = 'large';
        this.currentConfig.fontSize = 'large';
        break;

      case 'baseline':
        this.updateUIComplexity('standard');
        this.currentConfig.voiceInputEnabled = false;
        this.currentConfig.buttonSize = 'normal';
        this.currentConfig.fontSize = 'medium';
        this.currentConfig.colorScheme = 'default';
        this.currentConfig.reducedAnimations = false;
        break;

      case 'energized':
      case 'hyperfocus':
        this.updateUIComplexity('advanced');
        this.currentConfig.voiceInputEnabled = false;
        this.currentConfig.buttonSize = 'compact';
        this.currentConfig.fontSize = 'medium';
        break;

      case 'manic_warning':
        // Suggest taking a break, reduce stimulation
        this.updateUIComplexity('simplified');
        this.currentConfig.colorScheme = 'low-stimulation';
        this.currentConfig.reducedAnimations = true;
        break;
    }

    this.notifyListeners();
    this.persistState();
  }

  private updateUIComplexity(complexity: UIComplexity): void {
    this.currentConfig.uiComplexity = complexity;
  }

  // ============================================================================
  // Task State Management (Resume Later)
  // ============================================================================

  saveTaskState(taskId: string, taskType: string, formData: Record<string, any>, progress: number): void {
    const taskState: TaskState = {
      taskId,
      taskType,
      startedAt: this.taskStates.get(taskId)?.startedAt || Date.now(),
      lastActiveAt: Date.now(),
      progress,
      formData,
      estimatedTimeRemaining: this.estimateTimeRemaining(taskType, progress),
      canResumeFrom: Date.now(),
    };

    this.taskStates.set(taskId, taskState);
    this.persistState();
  }

  async getResumableTasks(): Promise<TaskState[]> {
    const tasks = Array.from(this.taskStates.values());
    
    // Filter out completed tasks and very old tasks
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return tasks.filter(task => 
      task.progress < 1 && 
      task.lastActiveAt > oneDayAgo
    ).sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  }

  async resumeTask(taskId: string): Promise<TaskState | null> {
    return this.taskStates.get(taskId) || null;
  }

  clearTaskState(taskId: string): void {
    this.taskStates.delete(taskId);
    this.persistState();
  }

  private estimateTimeRemaining(taskType: string, progress: number): number {
    // Estimated completion times for different task types
    const taskDurations: Record<string, number> = {
      'letter_wizard': 15,
      'evidence_upload': 10,
      'appeal_form': 30,
      'benefit_application': 45,
      'case_documentation': 20,
      'default': 10,
    };

    const totalTime = taskDurations[taskType] || taskDurations.default;
    return Math.max(0, totalTime * (1 - progress));
  }

  // ============================================================================
  // UI Adaptation Helpers
  // ============================================================================

  getConfig(): EnergyAwareConfig {
    return { ...this.currentConfig };
  }

  shouldShowFeature(complexity: UIComplexity): boolean {
    const complexityLevels: UIComplexity[] = ['minimal', 'simplified', 'standard', 'advanced'];
    const currentLevel = complexityLevels.indexOf(this.currentConfig.uiComplexity);
    const requiredLevel = complexityLevels.indexOf(complexity);
    
    return currentLevel >= requiredLevel;
  }

  getButtonSize(): { width: number; height: number; minHeight: number } {
    switch (this.currentConfig.buttonSize) {
      case 'compact':
        return { width: 100, height: 36, minHeight: 36 };
      case 'normal':
        return { width: 140, height: 44, minHeight: 44 };
      case 'large':
        return { width: 180, height: 54, minHeight: 54 };
      case 'touch-friendly':
        return { width: 220, height: 64, minHeight: 64 };
      default:
        return { width: 140, height: 44, minHeight: 44 };
    }
  }

  getFontScale(): number {
    switch (this.currentConfig.fontSize) {
      case 'small': return 0.9;
      case 'medium': return 1.0;
      case 'large': return 1.2;
      case 'xlarge': return 1.5;
      default: return 1.0;
    }
  }

  // ============================================================================
  // Pattern Learning
  // ============================================================================

  private startPatternDetection(): void {
    // Learn when user typically has low energy
    setInterval(() => {
      this.learnLowEnergyPatterns();
    }, 60 * 60 * 1000); // Every hour
  }

  private async learnLowEnergyPatterns(): Promise<void> {
    if (this.usageHistory.length < 50) return;

    try {
      const hourlyLowEnergyCount: Record<number, number> = {};

      // Count how many times each hour has shown low-energy patterns
      this.usageHistory.forEach(pattern => {
        if (pattern.tapsPerMinute < 20 || pattern.errorRate > 0.25) {
          hourlyLowEnergyCount[pattern.timeOfDay] = (hourlyLowEnergyCount[pattern.timeOfDay] || 0) + 1;
        }
      });

      await AsyncStorage.setItem(STORAGE_KEYS.LOW_ENERGY_TIMES, JSON.stringify(hourlyLowEnergyCount));
    } catch (err) {
      logError('energyAwareUI', 'Failed to learn low-energy patterns', err);
    }
  }

  // ============================================================================
  // Listener Management
  // ============================================================================

  subscribe(listener: (config: EnergyAwareConfig) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.currentConfig);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentConfig));
  }

  // ============================================================================
  // Public API
  // ============================================================================

  async getEnergyInsights(): Promise<{
    currentState: EnergyState;
    prediction: string;
    suggestions: string[];
    lowEnergyHours: number[];
  }> {
    const lowEnergyTimesStr = await AsyncStorage.getItem(STORAGE_KEYS.LOW_ENERGY_TIMES);
    const lowEnergyTimes: Record<number, number> = lowEnergyTimesStr ? JSON.parse(lowEnergyTimesStr) : {};
    
    const lowEnergyHours = Object.entries(lowEnergyTimes)
      .filter(([_, count]) => count > 5)
      .map(([hour, _]) => parseInt(hour))
      .sort((a, b) => a - b);

    const currentHour = new Date().getHours();
    let prediction = 'Your energy levels are stable.';
    
    if (lowEnergyHours.includes(currentHour)) {
      prediction = 'You typically have lower energy at this time of day.';
    } else if (lowEnergyHours.includes((currentHour + 1) % 24)) {
      prediction = 'Your energy may decline in the next hour based on past patterns.';
    }

    const suggestions: string[] = [];
    
    if (this.currentConfig.currentEnergyState === 'crashed' || this.currentConfig.currentEnergyState === 'depleted') {
      suggestions.push('Voice input is now enabled to reduce typing strain');
      suggestions.push('UI has been simplified - fewer choices, bigger buttons');
      suggestions.push('Tasks can be saved and resumed later');
      suggestions.push('Consider taking a 10-minute break');
    }

    return {
      currentState: this.currentConfig.currentEnergyState,
      prediction,
      suggestions,
      lowEnergyHours,
    };
  }

  // ============================================================================
  // BIOMETRIC INTEGRATION - WEARABLE SYNC
  // ============================================================================

  private biometricHistory: BiometricData[] = [];
  private connectedWearables: WearableDevice[] = [];
  private correlations: BiometricEnergyCorrelation | null = null;

  async syncWearable(device: WearableDevice): Promise<{ success: boolean; message: string }> {
    try {
      // Simulated wearable connection (would use actual SDKs in production)
      const existingIndex = this.connectedWearables.findIndex(w => w.id === device.id);
      
      if (existingIndex >= 0) {
        this.connectedWearables[existingIndex] = { ...device, connected: true, lastSync: Date.now() };
      } else {
        this.connectedWearables.push({ ...device, connected: true, lastSync: Date.now() });
      }

      await AsyncStorage.setItem(STORAGE_KEYS.WEARABLES, JSON.stringify(this.connectedWearables));

      return { success: true, message: `Connected to ${device.name}` };
    } catch (err) {
      logError('energyAwareUI', 'Failed to sync wearable', err);
      return { success: false, message: 'Failed to connect wearable' };
    }
  }

  async receiveBiometricData(data: BiometricData): Promise<void> {
    this.biometricHistory.push(data);

    // Keep last 1000 readings
    if (this.biometricHistory.length > 1000) {
      this.biometricHistory = this.biometricHistory.slice(-1000);
    }

    // Update energy state based on biometrics
    await this.updateEnergyFromBiometrics(data);

    // Learn correlations
    if (this.biometricHistory.length >= 50) {
      await this.learnBiometricCorrelations();
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_DATA, JSON.stringify(this.biometricHistory.slice(-200)));
    } catch (err) {
      logError('energyAwareUI', 'Failed to save biometric data', err);
    }
  }

  private async updateEnergyFromBiometrics(data: BiometricData): Promise<void> {
    // Multi-factor biometric energy detection
    let energyScore = 50; // Baseline

    // HRV is the strongest indicator of energy/recovery
    if (data.hrv < 20) energyScore -= 30;
    else if (data.hrv < 40) energyScore -= 15;
    else if (data.hrv > 60) energyScore += 15;
    else if (data.hrv > 80) energyScore += 25;

    // Sleep quality impact
    if (data.sleepQuality < 30) energyScore -= 20;
    else if (data.sleepQuality < 50) energyScore -= 10;
    else if (data.sleepQuality > 80) energyScore += 15;

    // Stress index (inverse)
    if (data.stressIndex > 80) energyScore -= 25;
    else if (data.stressIndex > 60) energyScore -= 15;
    else if (data.stressIndex < 30) energyScore += 10;

    // Heart rate (look for elevated resting heart rate = fatigue)
    if (data.heartRate > 90) energyScore -= 10;
    else if (data.heartRate < 60) energyScore += 5;

    // Convert score to energy state
    energyScore = Math.max(0, Math.min(100, energyScore));

    let newState: EnergyState;
    if (energyScore < 15) newState = 'crashed';
    else if (energyScore < 30) newState = 'depleted';
    else if (energyScore < 45) newState = 'conserving';
    else if (energyScore < 65) newState = 'baseline';
    else if (energyScore < 85) newState = 'energized';
    else newState = 'hyperfocus';

    this.updateEnergyState(newState);
  }

  private async learnBiometricCorrelations(): Promise<void> {
    if (this.biometricHistory.length < 50) return;

    // Calculate correlations between biometrics and energy states
    const energyScores = this.usageHistory.slice(-50).map(u => {
      if (u.tapsPerMinute < 10) return 20;
      if (u.tapsPerMinute < 25) return 40;
      if (u.tapsPerMinute < 50) return 60;
      return 80;
    });

    const recentBio = this.biometricHistory.slice(-50);

    // Simple correlation calculation
    const calcCorrelation = (bioValues: number[], energyValues: number[]): number => {
      const n = Math.min(bioValues.length, energyValues.length);
      if (n < 10) return 0;

      const avgBio = bioValues.reduce((s, v) => s + v, 0) / n;
      const avgEnergy = energyValues.reduce((s, v) => s + v, 0) / n;

      let numerator = 0;
      let denomBio = 0;
      let denomEnergy = 0;

      for (let i = 0; i < n; i++) {
        const diffBio = bioValues[i] - avgBio;
        const diffEnergy = energyValues[i] - avgEnergy;
        numerator += diffBio * diffEnergy;
        denomBio += diffBio * diffBio;
        denomEnergy += diffEnergy * diffEnergy;
      }

      const denom = Math.sqrt(denomBio * denomEnergy);
      return denom === 0 ? 0 : numerator / denom;
    };

    this.correlations = {
      hrvToEnergy: calcCorrelation(recentBio.map(b => b.hrv), energyScores),
      sleepToEnergy: calcCorrelation(recentBio.map(b => b.sleepQuality), energyScores),
      stepsToEnergy: calcCorrelation(recentBio.map(b => b.stepCount), energyScores),
      heartRateToEnergy: calcCorrelation(recentBio.map(b => -b.heartRate), energyScores), // Inverse
      sampleSize: Math.min(recentBio.length, energyScores.length),
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CORRELATIONS, JSON.stringify(this.correlations));
    } catch (err) {
      logError('energyAwareUI', 'Failed to save correlations', err);
    }
  }

  async getPredictiveEnergyModel(): Promise<PredictiveEnergyModel> {
    const latestBio = this.biometricHistory[this.biometricHistory.length - 1];
    const correlations = this.correlations;

    if (!latestBio || !correlations) {
      return {
        predictedEnergy: 50,
        confidence: 20,
        factors: [],
        recommendation: 'Connect a wearable device for personalized energy predictions',
        optimalActivityWindow: { start: 10, end: 14 },
      };
    }

    // Weighted prediction based on learned correlations
    const factors: Array<{ name: string; contribution: number }> = [];
    let predictedEnergy = 50;

    // HRV contribution
    const hrvContribution = (latestBio.hrv / 100) * 30 * Math.abs(correlations.hrvToEnergy);
    factors.push({ name: 'Heart Rate Variability', contribution: hrvContribution });
    predictedEnergy += hrvContribution - 15;

    // Sleep contribution
    const sleepContribution = (latestBio.sleepQuality / 100) * 25 * Math.abs(correlations.sleepToEnergy);
    factors.push({ name: 'Sleep Quality', contribution: sleepContribution });
    predictedEnergy += sleepContribution - 12.5;

    // Stress contribution (inverse)
    const stressContribution = ((100 - latestBio.stressIndex) / 100) * 20;
    factors.push({ name: 'Stress Level', contribution: -stressContribution + 10 });
    predictedEnergy += stressContribution - 10;

    predictedEnergy = Math.max(0, Math.min(100, predictedEnergy));

    // Determine optimal activity window based on historical patterns
    const lowEnergyTimesStr = await AsyncStorage.getItem(STORAGE_KEYS.LOW_ENERGY_TIMES);
    const lowEnergyTimes: Record<number, number> = lowEnergyTimesStr ? JSON.parse(lowEnergyTimesStr) : {};
    
    let optimalStart = 10;
    let optimalEnd = 14;
    let lowestCount = Infinity;

    for (let h = 8; h <= 18; h++) {
      const count = (lowEnergyTimes[h] || 0) + (lowEnergyTimes[h + 1] || 0);
      if (count < lowestCount) {
        lowestCount = count;
        optimalStart = h;
        optimalEnd = h + 4;
      }
    }

    // Generate recommendation
    let recommendation = '';
    if (predictedEnergy < 30) {
      recommendation = 'Low energy predicted. Schedule rest or light tasks only.';
    } else if (predictedEnergy < 50) {
      recommendation = 'Moderate energy. Good for routine tasks, avoid demanding activities.';
    } else if (predictedEnergy < 70) {
      recommendation = 'Good energy levels. Suitable for most activities.';
    } else {
      recommendation = 'High energy window! Tackle your most challenging tasks now.';
    }

    return {
      predictedEnergy: Math.round(predictedEnergy),
      confidence: Math.min(90, 40 + correlations.sampleSize),
      factors: factors.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
      recommendation,
      optimalActivityWindow: { start: optimalStart, end: optimalEnd },
    };
  }

  getConnectedWearables(): WearableDevice[] {
    return [...this.connectedWearables];
  }

  getLatestBiometrics(): BiometricData | null {
    return this.biometricHistory[this.biometricHistory.length - 1] || null;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const energyAwareUI = EnergyAwareUIManager.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useEnergyAwareUI(): {
  config: EnergyAwareConfig;
  shouldShowFeature: (complexity: UIComplexity) => boolean;
  getButtonSize: () => { width: number; height: number; minHeight: number };
  getFontScale: () => number;
  saveTaskProgress: (taskId: string, taskType: string, data: Record<string, any>, progress: number) => void;
  getResumableTasks: () => Promise<TaskState[]>;
  trackUsage: (pattern: Partial<UsagePattern>) => void;
  // Biometric integration
  syncWearable: (device: WearableDevice) => Promise<{ success: boolean; message: string }>;
  receiveBiometrics: (data: BiometricData) => Promise<void>;
  getPredictiveModel: () => Promise<PredictiveEnergyModel>;
  getConnectedWearables: () => WearableDevice[];
  getLatestBiometrics: () => BiometricData | null;
} {
  const [config, setConfig] = React.useState<EnergyAwareConfig>(energyAwareUI.getConfig());
  const [biometrics, setBiometrics] = React.useState<BiometricData | null>(null);

  React.useEffect(() => {
    const unsubscribe = energyAwareUI.subscribe(setConfig);
    return unsubscribe;
  }, []);

  // Poll biometrics every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setBiometrics(energyAwareUI.getLatestBiometrics());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    config,
    shouldShowFeature: (complexity) => energyAwareUI.shouldShowFeature(complexity),
    getButtonSize: () => energyAwareUI.getButtonSize(),
    getFontScale: () => energyAwareUI.getFontScale(),
    saveTaskProgress: (taskId, taskType, data, progress) => energyAwareUI.saveTaskState(taskId, taskType, data, progress),
    getResumableTasks: () => energyAwareUI.getResumableTasks(),
    trackUsage: (pattern) => energyAwareUI.trackUsagePattern(pattern),
    // =========== BIOMETRIC INTEGRATION ===========
    syncWearable: (device) => energyAwareUI.syncWearable(device),
    receiveBiometrics: (data) => energyAwareUI.receiveBiometricData(data),
    getPredictiveModel: () => energyAwareUI.getPredictiveEnergyModel(),
    getConnectedWearables: () => energyAwareUI.getConnectedWearables(),
    getLatestBiometrics: () => energyAwareUI.getLatestBiometrics(),
  };
}

// Also export for non-React usage
export { EnergyAwareUIManager };

