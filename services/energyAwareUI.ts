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
// Constants
// ============================================================================

const STORAGE_KEYS = {
  ENERGY_HISTORY: 'energyAware:history:v1',
  USAGE_PATTERNS: 'energyAware:usagePatterns:v1',
  TASK_STATES: 'energyAware:taskStates:v1',
  CONFIG: 'energyAware:config:v1',
  LOW_ENERGY_TIMES: 'energyAware:lowEnergyTimes:v1',
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
    let __matchCount = 0;

    for (const [state, thresholds] of Object.entries(ENERGY_THRESHOLDS)) {
      let stateScore = 0;
      
      if (pattern.tapsPerMinute <= thresholds.tapsPerMinute) stateScore++;
      if (pattern.errorRate >= thresholds.errorRate) stateScore++;
      if (pattern.scrollSpeed <= thresholds.scrollSpeed) stateScore++;
      
      if (stateScore > score) {
        score = stateScore;
        __matchCount = 1;
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
} {
  const [config, setConfig] = React.useState<EnergyAwareConfig>(energyAwareUI.getConfig());

  React.useEffect(() => {
    const unsubscribe = energyAwareUI.subscribe(setConfig);
    return unsubscribe;
  }, []);

  return {
    config,
    shouldShowFeature: (complexity) => energyAwareUI.shouldShowFeature(complexity),
    getButtonSize: () => energyAwareUI.getButtonSize(),
    getFontScale: () => energyAwareUI.getFontScale(),
    saveTaskProgress: (taskId, taskType, data, progress) => energyAwareUI.saveTaskState(taskId, taskType, data, progress),
    getResumableTasks: () => energyAwareUI.getResumableTasks(),
    trackUsage: (pattern) => energyAwareUI.trackUsagePattern(pattern),
  };
}

// Also export for non-React usage
export { EnergyAwareUIManager };

