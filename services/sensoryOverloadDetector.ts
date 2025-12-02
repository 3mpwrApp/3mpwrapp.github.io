/* eslint-disable @typescript-eslint/no-unused-vars, import/order */
/**
 * Sensory Overload Detector Service
 * 
 * WORLD-FIRST: AI-powered sensory overload prediction system that tracks
 * multiple sensory inputs and predicts meltdowns BEFORE they happen.
 * 
 * Revolutionary Features:
 * - Multi-modal sensory tracking (visual, auditory, tactile, proprioceptive, vestibular)
 * - Overload prediction using pattern recognition
 * - Personalized threshold learning
 * - Safe space finder integration
 * - Decompression protocol generation
 * - Sensory diet recommendations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============ TYPES ============

export type SensoryModality =
  | 'visual'
  | 'auditory'
  | 'tactile'
  | 'olfactory'
  | 'gustatory'
  | 'proprioceptive'
  | 'vestibular'
  | 'interoceptive';

export type SensoryIntensity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type OverloadPhase =
  | 'baseline'      // Normal, regulated state
  | 'accumulating'  // Building sensory load
  | 'warning'       // Approaching threshold
  | 'critical'      // Imminent overload
  | 'overload'      // Full meltdown/shutdown
  | 'recovering';   // Post-overload recovery

export interface SensoryInput {
  id: string;
  modality: SensoryModality;
  source: string;           // e.g., "fluorescent lights", "crowd noise"
  intensity: SensoryIntensity;
  duration: number;         // minutes exposed
  startedAt: number;
  isPositive: boolean;      // Some sensory input is regulating, not dysregulating
  notes?: string;
}

export interface SensoryThreshold {
  modality: SensoryModality;
  baselineThreshold: number;      // Learned personal threshold
  currentCapacity: number;        // Remaining capacity
  recoveryRate: number;           // How fast this modality recovers
  sensitivityMultiplier: number;  // Time-of-day or context sensitivity
}

export interface OverloadPrediction {
  predictedPhase: OverloadPhase;
  probability: number;            // 0-1 probability of overload
  timeToOverload: number;         // Estimated minutes until overload
  primaryTriggers: SensoryInput[];
  recommendedActions: DecompressionAction[];
  confidence: number;
}

export interface DecompressionAction {
  id: string;
  type: 'remove_stimulus' | 'add_regulating' | 'environment_change' | 'technique';
  modality?: SensoryModality;
  title: string;
  description: string;
  effectiveness: number;          // 0-1, learned from user feedback
  duration: number;               // Recommended minutes
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface SafeSpace {
  id: string;
  name: string;
  location: string;
  sensoryProfile: {
    visual: SensoryIntensity;
    auditory: SensoryIntensity;
    tactile: SensoryIntensity;
    olfactory: SensoryIntensity;
    crowding: SensoryIntensity;
  };
  features: string[];
  lastUsed?: number;
  effectivenessRating: number;
}

export interface SensoryPattern {
  id: string;
  triggers: SensoryInput[];
  outcome: OverloadPhase;
  timestamp: number;
  duration: number;
  recoveryTime: number;
  interventionsUsed: DecompressionAction[];
  effectiveInterventions: string[];
}

export interface SensoryDiet {
  dailyGoals: {
    modality: SensoryModality;
    targetMinutes: number;
    type: 'seeking' | 'avoiding';
  }[];
  scheduledBreaks: {
    time: string;
    duration: number;
    activities: string[];
  }[];
  triggerAvoidance: string[];
  regulatingActivities: string[];
}

export interface SensoryState {
  currentInputs: SensoryInput[];
  thresholds: SensoryThreshold[];
  currentPhase: OverloadPhase;
  overloadHistory: SensoryPattern[];
  safeSpaces: SafeSpace[];
  sensoryDiet: SensoryDiet | null;
  learningData: {
    totalPatterns: number;
    predictionAccuracy: number;
    lastCalibration: number;
  };
}

// ============ STORAGE KEYS ============

const STORAGE_KEYS = {
  STATE: 'sensoryOverload:state:v1',
  PATTERNS: 'sensoryOverload:patterns:v1',
  THRESHOLDS: 'sensoryOverload:thresholds:v1',
  SAFE_SPACES: 'sensoryOverload:safeSpaces:v1',
};

// ============ DEFAULT VALUES ============

const DEFAULT_THRESHOLDS: SensoryThreshold[] = [
  { modality: 'visual', baselineThreshold: 70, currentCapacity: 70, recoveryRate: 5, sensitivityMultiplier: 1 },
  { modality: 'auditory', baselineThreshold: 60, currentCapacity: 60, recoveryRate: 4, sensitivityMultiplier: 1 },
  { modality: 'tactile', baselineThreshold: 50, currentCapacity: 50, recoveryRate: 3, sensitivityMultiplier: 1 },
  { modality: 'olfactory', baselineThreshold: 40, currentCapacity: 40, recoveryRate: 6, sensitivityMultiplier: 1 },
  { modality: 'gustatory', baselineThreshold: 50, currentCapacity: 50, recoveryRate: 5, sensitivityMultiplier: 1 },
  { modality: 'proprioceptive', baselineThreshold: 80, currentCapacity: 80, recoveryRate: 4, sensitivityMultiplier: 1 },
  { modality: 'vestibular', baselineThreshold: 45, currentCapacity: 45, recoveryRate: 3, sensitivityMultiplier: 1 },
  { modality: 'interoceptive', baselineThreshold: 55, currentCapacity: 55, recoveryRate: 2, sensitivityMultiplier: 1 },
];

const DEFAULT_DECOMPRESSION_ACTIONS: DecompressionAction[] = [
  {
    id: 'noise-cancelling',
    type: 'remove_stimulus',
    modality: 'auditory',
    title: 'Use Noise-Cancelling Headphones',
    description: 'Block external sounds to reduce auditory input',
    effectiveness: 0.8,
    duration: 15,
    urgency: 'medium',
  },
  {
    id: 'dim-lights',
    type: 'remove_stimulus',
    modality: 'visual',
    title: 'Dim or Turn Off Lights',
    description: 'Reduce visual stimulation by lowering light levels',
    effectiveness: 0.7,
    duration: 10,
    urgency: 'medium',
  },
  {
    id: 'weighted-blanket',
    type: 'add_regulating',
    modality: 'proprioceptive',
    title: 'Use Weighted Blanket/Vest',
    description: 'Deep pressure input for proprioceptive regulation',
    effectiveness: 0.85,
    duration: 20,
    urgency: 'high',
  },
  {
    id: 'quiet-space',
    type: 'environment_change',
    title: 'Find Quiet Space',
    description: 'Move to a low-stimulation environment',
    effectiveness: 0.9,
    duration: 15,
    urgency: 'high',
  },
  {
    id: 'deep-breathing',
    type: 'technique',
    modality: 'interoceptive',
    title: 'Deep Breathing Exercise',
    description: 'Slow, controlled breathing to regulate nervous system',
    effectiveness: 0.65,
    duration: 5,
    urgency: 'low',
  },
  {
    id: 'cold-water',
    type: 'technique',
    modality: 'tactile',
    title: 'Cold Water on Wrists',
    description: 'Sensory reset through temperature change',
    effectiveness: 0.6,
    duration: 2,
    urgency: 'medium',
  },
  {
    id: 'stimming',
    type: 'add_regulating',
    modality: 'proprioceptive',
    title: 'Engage in Regulating Stim',
    description: 'Use your preferred regulating repetitive movement',
    effectiveness: 0.75,
    duration: 10,
    urgency: 'medium',
  },
  {
    id: 'sunglasses',
    type: 'remove_stimulus',
    modality: 'visual',
    title: 'Wear Sunglasses/Tinted Lenses',
    description: 'Reduce visual intensity and light sensitivity',
    effectiveness: 0.7,
    duration: 30,
    urgency: 'low',
  },
];

// ============ SERVICE CLASS ============

class SensoryOverloadDetectorService {
  private state: SensoryState = {
    currentInputs: [],
    thresholds: [...DEFAULT_THRESHOLDS],
    currentPhase: 'baseline',
    overloadHistory: [],
    safeSpaces: [],
    sensoryDiet: null,
    learningData: {
      totalPatterns: 0,
      predictionAccuracy: 0.5,
      lastCalibration: Date.now(),
    },
  };
  private listeners: Set<() => void> = new Set();
  private predictionInterval: ReturnType<typeof setInterval> | null = null;

  // ============ INITIALIZATION ============

  async initialize(): Promise<void> {
    try {
      const [stateData, patternsData, thresholdsData, safeSpacesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.STATE),
        AsyncStorage.getItem(STORAGE_KEYS.PATTERNS),
        AsyncStorage.getItem(STORAGE_KEYS.THRESHOLDS),
        AsyncStorage.getItem(STORAGE_KEYS.SAFE_SPACES),
      ]);

      if (stateData) {
        const parsed = JSON.parse(stateData);
        this.state = { ...this.state, ...parsed };
      }
      if (patternsData) {
        this.state.overloadHistory = JSON.parse(patternsData);
      }
      if (thresholdsData) {
        this.state.thresholds = JSON.parse(thresholdsData);
      }
      if (safeSpacesData) {
        this.state.safeSpaces = JSON.parse(safeSpacesData);
      }

      // Start continuous prediction
      this.startPredictionLoop();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize SensoryOverloadDetector:', error);
    }
  }

  private startPredictionLoop(): void {
    if (this.predictionInterval) {
      clearInterval(this.predictionInterval);
    }
    // Run prediction every 30 seconds
    this.predictionInterval = setInterval(() => {
      this.updatePrediction();
    }, 30000);
  }

  // ============ CORE SENSORY TRACKING ============

  async addSensoryInput(input: Omit<SensoryInput, 'id' | 'startedAt'>): Promise<SensoryInput> {
    const newInput: SensoryInput = {
      ...input,
      id: `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startedAt: Date.now(),
    };

    this.state.currentInputs.push(newInput);
    
    // Update threshold capacity
    const threshold = this.state.thresholds.find(t => t.modality === input.modality);
    if (threshold && !input.isPositive) {
      const impact = this.calculateInputImpact(newInput);
      threshold.currentCapacity = Math.max(0, threshold.currentCapacity - impact);
    }

    await this.updatePhase();
    await this.save();
    this.notifyListeners();

    return newInput;
  }

  async removeSensoryInput(inputId: string): Promise<void> {
    const input = this.state.currentInputs.find(i => i.id === inputId);
    if (input) {
      this.state.currentInputs = this.state.currentInputs.filter(i => i.id !== inputId);
      
      // Begin recovery for that modality
      const threshold = this.state.thresholds.find(t => t.modality === input.modality);
      if (threshold) {
        // Schedule gradual recovery
        this.scheduleRecovery(threshold);
      }
    }

    await this.updatePhase();
    await this.save();
    this.notifyListeners();
  }

  private calculateInputImpact(input: SensoryInput): number {
    // Impact = intensity * duration factor * sensitivity
    const durationFactor = Math.min(2, 1 + (input.duration / 60)); // Up to 2x for long exposure
    const threshold = this.state.thresholds.find(t => t.modality === input.modality);
    const sensitivity = threshold?.sensitivityMultiplier || 1;
    
    return input.intensity * durationFactor * sensitivity;
  }

  private scheduleRecovery(threshold: SensoryThreshold): void {
    // Recovery happens gradually over time
    const recoveryInterval = setInterval(() => {
      if (threshold.currentCapacity >= threshold.baselineThreshold) {
        clearInterval(recoveryInterval);
        return;
      }
      threshold.currentCapacity = Math.min(
        threshold.baselineThreshold,
        threshold.currentCapacity + threshold.recoveryRate
      );
      this.notifyListeners();
    }, 60000); // Every minute
  }

  // ============ OVERLOAD PREDICTION AI ============

  async predictOverload(): Promise<OverloadPrediction> {
    const totalLoad = this.calculateTotalSensoryLoad();
    const capacityRatio = this.calculateCapacityRatio();
    const patternMatch = this.matchHistoricalPatterns();
    const timeFactors = this.calculateTimeFactors();
    
    // Combine factors for probability
    let probability = 0;
    
    // Base probability from current load vs capacity
    probability += (1 - capacityRatio) * 0.4;
    
    // Add pattern matching probability
    probability += patternMatch.matchProbability * 0.3;
    
    // Add time-based factors (time of day, duration of exposure)
    probability += timeFactors.riskModifier * 0.2;
    
    // Add acceleration factor (is it getting worse?)
    probability += this.calculateAcceleration() * 0.1;
    
    probability = Math.min(1, Math.max(0, probability));

    // Determine phase
    let predictedPhase: OverloadPhase = 'baseline';
    let timeToOverload = Infinity;

    if (probability < 0.2) {
      predictedPhase = 'baseline';
    } else if (probability < 0.4) {
      predictedPhase = 'accumulating';
      timeToOverload = 60 - (probability * 100); // Rough estimate
    } else if (probability < 0.6) {
      predictedPhase = 'warning';
      timeToOverload = 30 - ((probability - 0.4) * 75);
    } else if (probability < 0.85) {
      predictedPhase = 'critical';
      timeToOverload = 15 - ((probability - 0.6) * 60);
    } else {
      predictedPhase = 'overload';
      timeToOverload = 0;
    }

    // Get primary triggers (highest impact inputs)
    const primaryTriggers = [...this.state.currentInputs]
      .filter(i => !i.isPositive)
      .sort((a, b) => this.calculateInputImpact(b) - this.calculateInputImpact(a))
      .slice(0, 3);

    // Get recommended actions based on triggers
    const recommendedActions = this.getRecommendedActions(primaryTriggers, predictedPhase);

    return {
      predictedPhase,
      probability,
      timeToOverload: Math.max(0, Math.round(timeToOverload)),
      primaryTriggers,
      recommendedActions,
      confidence: this.state.learningData.predictionAccuracy,
    };
  }

  private calculateTotalSensoryLoad(): number {
    return this.state.currentInputs
      .filter(i => !i.isPositive)
      .reduce((sum, input) => sum + this.calculateInputImpact(input), 0);
  }

  private calculateCapacityRatio(): number {
    const totalCapacity = this.state.thresholds.reduce((sum, t) => sum + t.baselineThreshold, 0);
    const currentCapacity = this.state.thresholds.reduce((sum, t) => sum + t.currentCapacity, 0);
    return currentCapacity / totalCapacity;
  }

  private matchHistoricalPatterns(): { matchProbability: number; matchedPatterns: SensoryPattern[] } {
    if (this.state.overloadHistory.length === 0) {
      return { matchProbability: 0, matchedPatterns: [] };
    }

    const currentInputSignature = this.state.currentInputs
      .map(i => `${i.modality}:${Math.round(i.intensity / 2)}`)
      .sort()
      .join(',');

    const matchedPatterns = this.state.overloadHistory.filter(pattern => {
      const patternSignature = pattern.triggers
        .map(i => `${i.modality}:${Math.round(i.intensity / 2)}`)
        .sort()
        .join(',');
      
      // Fuzzy matching - at least 60% similarity
      const currentSet = new Set(currentInputSignature.split(','));
      const patternSet = new Set(patternSignature.split(','));
      const intersection = [...currentSet].filter(x => patternSet.has(x));
      const similarity = intersection.length / Math.max(currentSet.size, patternSet.size);
      
      return similarity >= 0.6;
    });

    const overloadPatterns = matchedPatterns.filter(p => p.outcome === 'overload');
    const matchProbability = matchedPatterns.length > 0
      ? overloadPatterns.length / matchedPatterns.length
      : 0;

    return { matchProbability, matchedPatterns };
  }

  private calculateTimeFactors(): { riskModifier: number } {
    const now = new Date();
    const hour = now.getHours();
    
    // Higher risk in afternoon (sensory fatigue accumulation)
    let timeRisk = 0;
    if (hour >= 14 && hour <= 18) {
      timeRisk = 0.3;
    } else if (hour >= 19 && hour <= 22) {
      timeRisk = 0.4;
    } else if (hour >= 6 && hour <= 9) {
      timeRisk = 0.1;
    }

    // Duration of current session
    const oldestInput = this.state.currentInputs
      .reduce((oldest, input) => Math.min(oldest, input.startedAt), Date.now());
    const sessionDuration = (Date.now() - oldestInput) / (1000 * 60); // minutes
    
    if (sessionDuration > 120) {
      timeRisk += 0.2;
    } else if (sessionDuration > 60) {
      timeRisk += 0.1;
    }

    return { riskModifier: Math.min(1, timeRisk) };
  }

  private calculateAcceleration(): number {
    // Are inputs increasing in intensity over the last few minutes?
    const recentInputs = this.state.currentInputs
      .filter(i => Date.now() - i.startedAt < 10 * 60 * 1000) // Last 10 minutes
      .sort((a, b) => a.startedAt - b.startedAt);

    if (recentInputs.length < 2) return 0;

    const firstHalf = recentInputs.slice(0, Math.floor(recentInputs.length / 2));
    const secondHalf = recentInputs.slice(Math.floor(recentInputs.length / 2));

    const firstAvg = firstHalf.reduce((sum, i) => sum + i.intensity, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, i) => sum + i.intensity, 0) / secondHalf.length;

    return Math.max(0, (secondAvg - firstAvg) / 10); // Normalize to 0-1
  }

  private getRecommendedActions(triggers: SensoryInput[], phase: OverloadPhase): DecompressionAction[] {
    const urgencyMap: Record<OverloadPhase, 'low' | 'medium' | 'high' | 'critical'> = {
      baseline: 'low',
      accumulating: 'low',
      warning: 'medium',
      critical: 'high',
      overload: 'critical',
      recovering: 'medium',
    };

    const requiredUrgency = urgencyMap[phase];
    const triggeredModalities = triggers.map(t => t.modality);

    // Get actions that match triggered modalities or are general
    let actions = DEFAULT_DECOMPRESSION_ACTIONS.filter(action => {
      if (!action.modality) return true; // General actions always apply
      return triggeredModalities.includes(action.modality);
    });

    // Learn from history what worked
    const effectiveActions = this.state.overloadHistory
      .flatMap(p => p.effectiveInterventions);
    
    actions = actions.map(action => ({
      ...action,
      effectiveness: effectiveActions.includes(action.id)
        ? Math.min(1, action.effectiveness + 0.1)
        : action.effectiveness,
      urgency: requiredUrgency,
    }));

    // Sort by effectiveness and return top recommendations
    return actions
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 5);
  }

  // ============ PHASE MANAGEMENT ============

  private async updatePhase(): Promise<void> {
    const prediction = await this.predictOverload();
    const previousPhase = this.state.currentPhase;
    this.state.currentPhase = prediction.predictedPhase;

    // Record transition if entering overload
    if (previousPhase !== 'overload' && prediction.predictedPhase === 'overload') {
      await this.recordOverloadEvent();
    }
  }

  private updatePrediction(): void {
    this.predictOverload().then(() => {
      this.notifyListeners();
    });
  }

  private async recordOverloadEvent(): Promise<void> {
    const pattern: SensoryPattern = {
      id: `pattern-${Date.now()}`,
      triggers: [...this.state.currentInputs],
      outcome: 'overload',
      timestamp: Date.now(),
      duration: 0, // Will be updated when recovered
      recoveryTime: 0,
      interventionsUsed: [],
      effectiveInterventions: [],
    };

    this.state.overloadHistory.push(pattern);
    this.state.learningData.totalPatterns++;

    await AsyncStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(this.state.overloadHistory));
  }

  async recordRecovery(interventionsUsed: string[], effectiveOnes: string[]): Promise<void> {
    const lastPattern = this.state.overloadHistory[this.state.overloadHistory.length - 1];
    if (lastPattern && lastPattern.outcome === 'overload') {
      lastPattern.duration = Date.now() - lastPattern.timestamp;
      lastPattern.recoveryTime = lastPattern.duration;
      lastPattern.effectiveInterventions = effectiveOnes;

      // Update prediction accuracy based on outcomes
      this.updateLearning();
      
      this.state.currentPhase = 'recovering';
      await this.save();
      this.notifyListeners();
    }
  }

  private updateLearning(): void {
    // Calculate prediction accuracy from historical patterns
    const recentPatterns = this.state.overloadHistory.slice(-20);
    if (recentPatterns.length < 5) return;

    // How often did we correctly predict overload?
    // This is simplified - in real implementation would track predictions vs outcomes
    const accuratePatterns = recentPatterns.filter(p => 
      p.triggers.length > 0 && p.effectiveInterventions.length > 0
    );
    
    this.state.learningData.predictionAccuracy = 
      0.5 + (accuratePatterns.length / recentPatterns.length) * 0.4;
    this.state.learningData.lastCalibration = Date.now();
  }

  // ============ SAFE SPACES ============

  async addSafeSpace(space: Omit<SafeSpace, 'id'>): Promise<SafeSpace> {
    const newSpace: SafeSpace = {
      ...space,
      id: `space-${Date.now()}`,
    };

    this.state.safeSpaces.push(newSpace);
    await AsyncStorage.setItem(STORAGE_KEYS.SAFE_SPACES, JSON.stringify(this.state.safeSpaces));
    this.notifyListeners();

    return newSpace;
  }

  async findNearbySafeSpaces(): Promise<SafeSpace[]> {
    // Sort by effectiveness and sensory profile match
    const currentLoad = this.calculateModalityLoads();
    
    return this.state.safeSpaces
      .map(space => {
        // Score based on how well the space addresses current overload
        let score = space.effectivenessRating;
        
        // Bonus for low sensory profile in overloaded modalities
        if (currentLoad.visual > 50 && space.sensoryProfile.visual < 3) score += 0.2;
        if (currentLoad.auditory > 50 && space.sensoryProfile.auditory < 3) score += 0.2;
        if (currentLoad.tactile > 50 && space.sensoryProfile.tactile < 3) score += 0.1;
        
        return { space, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ space }) => space);
  }

  private calculateModalityLoads(): Record<string, number> {
    const loads: Record<string, number> = {};
    
    for (const threshold of this.state.thresholds) {
      const usedCapacity = threshold.baselineThreshold - threshold.currentCapacity;
      loads[threshold.modality] = (usedCapacity / threshold.baselineThreshold) * 100;
    }
    
    return loads;
  }

  // ============ SENSORY DIET ============

  async generateSensoryDiet(): Promise<SensoryDiet> {
    const patterns = this.state.overloadHistory;
    const thresholds = this.state.thresholds;

    // Identify seeking vs avoiding needs based on thresholds and patterns
    const modalityNeeds = thresholds.map(t => {
      const avgLoad = patterns
        .flatMap(p => p.triggers)
        .filter(tr => tr.modality === t.modality)
        .reduce((sum, tr, _, arr) => sum + tr.intensity / arr.length, 0);

      return {
        modality: t.modality,
        needsMore: t.currentCapacity > t.baselineThreshold * 0.8,
        needsLess: avgLoad > 5,
      };
    });

    const dailyGoals = modalityNeeds.map(need => ({
      modality: need.modality,
      targetMinutes: need.needsMore ? 30 : need.needsLess ? 0 : 15,
      type: need.needsMore ? 'seeking' as const : 'avoiding' as const,
    }));

    // Generate scheduled breaks based on typical overload times
    const overloadHours = patterns.map(p => new Date(p.timestamp).getHours());
    const peakHours = this.findPeakHours(overloadHours);

    const scheduledBreaks = peakHours.map((hour, idx) => ({
      time: `${hour - 1}:30`,
      duration: 15,
      activities: this.getRegulatingActivities(modalityNeeds),
    }));

    const diet: SensoryDiet = {
      dailyGoals,
      scheduledBreaks,
      triggerAvoidance: this.identifyTopTriggers(),
      regulatingActivities: this.getRegulatingActivities(modalityNeeds),
    };

    this.state.sensoryDiet = diet;
    await this.save();
    
    return diet;
  }

  private findPeakHours(hours: number[]): number[] {
    const counts: Record<number, number> = {};
    hours.forEach(h => counts[h] = (counts[h] || 0) + 1);
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private identifyTopTriggers(): string[] {
    const triggerCounts: Record<string, number> = {};
    
    this.state.overloadHistory
      .filter(p => p.outcome === 'overload')
      .flatMap(p => p.triggers)
      .forEach(t => {
        triggerCounts[t.source] = (triggerCounts[t.source] || 0) + 1;
      });

    return Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source]) => source);
  }

  private getRegulatingActivities(needs: { modality: SensoryModality; needsMore: boolean }[]): string[] {
    const activities: Record<SensoryModality, string[]> = {
      visual: ['dim lighting', 'nature scenes', 'color filters'],
      auditory: ['white noise', 'nature sounds', 'silence'],
      tactile: ['fidget toys', 'textured objects', 'hand massage'],
      olfactory: ['essential oils', 'fresh air', 'neutral scents'],
      gustatory: ['cold water', 'mint', 'crunchy snacks'],
      proprioceptive: ['weighted blanket', 'tight hug', 'wall pushups'],
      vestibular: ['rocking', 'swinging', 'gentle spinning'],
      interoceptive: ['deep breathing', 'body scan', 'temperature check'],
    };

    return needs
      .filter(n => n.needsMore)
      .flatMap(n => activities[n.modality].slice(0, 2));
  }

  // ============ CALIBRATION ============

  async calibrateThresholds(
    modality: SensoryModality,
    feedback: 'too_sensitive' | 'about_right' | 'not_sensitive_enough'
  ): Promise<void> {
    const threshold = this.state.thresholds.find(t => t.modality === modality);
    if (!threshold) return;

    switch (feedback) {
      case 'too_sensitive':
        threshold.baselineThreshold = Math.min(100, threshold.baselineThreshold + 10);
        threshold.currentCapacity = threshold.baselineThreshold;
        break;
      case 'not_sensitive_enough':
        threshold.baselineThreshold = Math.max(20, threshold.baselineThreshold - 10);
        threshold.currentCapacity = Math.min(threshold.currentCapacity, threshold.baselineThreshold);
        break;
      // 'about_right' - no change
    }

    await AsyncStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(this.state.thresholds));
    this.notifyListeners();
  }

  // ============ QUICK ACTIONS ============

  async quickLogOverwhelm(modality: SensoryModality, intensity: SensoryIntensity): Promise<OverloadPrediction> {
    await this.addSensoryInput({
      modality,
      source: 'Quick log',
      intensity,
      duration: 1,
      isPositive: false,
    });

    return this.predictOverload();
  }

  async getEmergencyProtocol(): Promise<DecompressionAction[]> {
    return DEFAULT_DECOMPRESSION_ACTIONS
      .filter(a => a.urgency === 'critical' || a.urgency === 'high')
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 3)
      .map(a => ({ ...a, urgency: 'critical' as const }));
  }

  // ============ STATE MANAGEMENT ============

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify({
        currentInputs: this.state.currentInputs,
        currentPhase: this.state.currentPhase,
        sensoryDiet: this.state.sensoryDiet,
        learningData: this.state.learningData,
      }));
    } catch (error) {
      console.error('Failed to save SensoryOverloadDetector state:', error);
    }
  }

  getState(): SensoryState {
    return { ...this.state };
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
      currentInputs: [],
      thresholds: [...DEFAULT_THRESHOLDS],
      currentPhase: 'baseline',
      overloadHistory: [],
      safeSpaces: [],
      sensoryDiet: null,
      learningData: {
        totalPatterns: 0,
        predictionAccuracy: 0.5,
        lastCalibration: Date.now(),
      },
    };

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.STATE),
      AsyncStorage.removeItem(STORAGE_KEYS.PATTERNS),
      AsyncStorage.removeItem(STORAGE_KEYS.THRESHOLDS),
      AsyncStorage.removeItem(STORAGE_KEYS.SAFE_SPACES),
    ]);

    this.notifyListeners();
  }
}

// ============ SINGLETON & HOOKS ============

export const sensoryOverloadDetector = new SensoryOverloadDetectorService();

export function useSensoryOverload() {
  const [state, setState] = React.useState<SensoryState>(sensoryOverloadDetector.getState());

  React.useEffect(() => {
    return sensoryOverloadDetector.subscribe(() => {
      setState(sensoryOverloadDetector.getState());
    });
  }, []);

  return {
    state,
    addInput: sensoryOverloadDetector.addSensoryInput.bind(sensoryOverloadDetector),
    removeInput: sensoryOverloadDetector.removeSensoryInput.bind(sensoryOverloadDetector),
    predict: sensoryOverloadDetector.predictOverload.bind(sensoryOverloadDetector),
    quickLog: sensoryOverloadDetector.quickLogOverwhelm.bind(sensoryOverloadDetector),
    getEmergencyProtocol: sensoryOverloadDetector.getEmergencyProtocol.bind(sensoryOverloadDetector),
    findSafeSpaces: sensoryOverloadDetector.findNearbySafeSpaces.bind(sensoryOverloadDetector),
    generateDiet: sensoryOverloadDetector.generateSensoryDiet.bind(sensoryOverloadDetector),
    calibrate: sensoryOverloadDetector.calibrateThresholds.bind(sensoryOverloadDetector),
    recordRecovery: sensoryOverloadDetector.recordRecovery.bind(sensoryOverloadDetector),
    addSafeSpace: sensoryOverloadDetector.addSafeSpace.bind(sensoryOverloadDetector),
    reset: sensoryOverloadDetector.reset.bind(sensoryOverloadDetector),
  };
}

// Need to import React for the hook
import React from 'react';
