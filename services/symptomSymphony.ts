/**
 * Symptom Symphony Service
 * 
 * WORLD-FIRST: Multi-modal symptom tracking that finds hidden correlations
 * and creates a "symphony" of symptom data for medical professionals.
 * 
 * Revolutionary Features:
 * - Multi-symptom correlation AI that finds hidden connections
 * - Flare prediction using pattern recognition
 * - Trigger identification across symptoms
 * - Medical timeline export for providers
 * - Symptom cluster analysis
 * - Cross-condition pattern matching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

// ============ TYPES ============

export type SymptomCategory =
  | 'pain'
  | 'fatigue'
  | 'cognitive'
  | 'digestive'
  | 'neurological'
  | 'cardiovascular'
  | 'respiratory'
  | 'musculoskeletal'
  | 'emotional'
  | 'sleep'
  | 'autonomic'
  | 'immune'
  | 'sensory';

export type SymptomSeverity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type SymptomQuality =
  | 'sharp' | 'dull' | 'burning' | 'throbbing' | 'aching'
  | 'stabbing' | 'tingling' | 'numbness' | 'pressure' | 'cramping'
  | 'constant' | 'intermittent' | 'wave' | 'sudden' | 'gradual';

export type FlarePhase =
  | 'baseline'
  | 'prodrome'    // Early warning signs
  | 'escalating'
  | 'peak'
  | 'plateau'
  | 'descending'
  | 'recovery'
  | 'post-exertional';

export interface SymptomEntry {
  id: string;
  symptomId: string;
  name: string;
  category: SymptomCategory;
  severity: SymptomSeverity;
  qualities: SymptomQuality[];
  location?: string;
  timestamp: number;
  duration?: number;         // minutes
  triggers?: string[];
  relievedBy?: string[];
  notes?: string;
  contextual: {
    weather?: {
      temperature: number;
      humidity: number;
      pressure: number;
    };
    activity?: string;
    foodEaten?: string[];
    sleepHours?: number;
    stressLevel?: SymptomSeverity;
    menstrualPhase?: string;
  };
}

export interface SymptomDefinition {
  id: string;
  name: string;
  category: SymptomCategory;
  commonQualities: SymptomQuality[];
  commonLocations: string[];
  isCustom: boolean;
  trackingFrequency: 'always' | 'when_present' | 'scheduled';
}

export interface SymptomCorrelation {
  symptomA: string;
  symptomB: string;
  correlationStrength: number;  // -1 to 1
  timeOffset: number;            // A precedes B by X minutes (negative = B precedes A)
  confidence: number;
  sampleSize: number;
  relationship: 'triggers' | 'co-occurs' | 'precedes' | 'follows' | 'inverse';
}

export interface FlarePattern {
  id: string;
  name: string;
  prodromeSigns: string[];
  peakSymptoms: string[];
  typicalDuration: number;
  recoveryDuration: number;
  knownTriggers: string[];
  successfulInterventions: string[];
  occurrences: number;
  lastOccurred: number;
}

export interface FlarePrediction {
  probability: number;
  predictedPhase: FlarePhase;
  timeToFlare: number;
  confidence: number;
  warningSymptoms: SymptomEntry[];
  recommendedActions: FlareAction[];
  matchedPattern?: FlarePattern;
}

export interface FlareAction {
  id: string;
  type: 'preventive' | 'management' | 'recovery';
  title: string;
  description: string;
  effectiveness: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface SymptomCluster {
  id: string;
  name: string;
  symptoms: string[];
  frequency: number;
  averageSeverity: number;
  typicalTriggers: string[];
  possibleConditions: string[];
}

export interface MedicalTimeline {
  patientId?: string;
  generatedAt: number;
  dateRange: {
    start: number;
    end: number;
  };
  summary: {
    totalEntries: number;
    avgDailySeverity: number;
    mostFrequentSymptoms: { name: string; count: number }[];
    identifiedTriggers: string[];
    effectiveInterventions: string[];
  };
  entries: SymptomEntry[];
  correlations: SymptomCorrelation[];
  flarePatterns: FlarePattern[];
  clusters: SymptomCluster[];
  recommendations: string[];
}

export interface TriggerAnalysis {
  trigger: string;
  affectedSymptoms: string[];
  averageDelayMinutes: number;
  severityIncrease: number;
  frequency: number;
  confidence: number;
}

export interface SymptomSymphonyState {
  definitions: SymptomDefinition[];
  entries: SymptomEntry[];
  correlations: SymptomCorrelation[];
  flarePatterns: FlarePattern[];
  clusters: SymptomCluster[];
  currentFlarePhase: FlarePhase;
  triggers: TriggerAnalysis[];
  learningData: {
    totalEntries: number;
    correlationAccuracy: number;
    predictionAccuracy: number;
    lastAnalysis: number;
  };
}

// ============ STORAGE ============

const STORAGE_KEYS = {
  DEFINITIONS: 'symptomSymphony:definitions:v1',
  ENTRIES: 'symptomSymphony:entries:v1',
  CORRELATIONS: 'symptomSymphony:correlations:v1',
  PATTERNS: 'symptomSymphony:patterns:v1',
  CLUSTERS: 'symptomSymphony:clusters:v1',
  STATE: 'symptomSymphony:state:v1',
};

// ============ DEFAULT SYMPTOMS ============

const DEFAULT_SYMPTOMS: SymptomDefinition[] = [
  // Pain
  { id: 'headache', name: 'Headache', category: 'pain', commonQualities: ['throbbing', 'pressure', 'sharp'], commonLocations: ['forehead', 'temples', 'back of head'], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'joint-pain', name: 'Joint Pain', category: 'pain', commonQualities: ['aching', 'sharp', 'throbbing'], commonLocations: ['knees', 'hips', 'shoulders', 'wrists'], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'muscle-pain', name: 'Muscle Pain', category: 'pain', commonQualities: ['aching', 'cramping', 'burning'], commonLocations: ['legs', 'back', 'arms', 'neck'], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'nerve-pain', name: 'Nerve Pain', category: 'pain', commonQualities: ['burning', 'tingling', 'stabbing', 'numbness'], commonLocations: ['extremities', 'back', 'face'], isCustom: false, trackingFrequency: 'when_present' },
  
  // Fatigue
  { id: 'physical-fatigue', name: 'Physical Fatigue', category: 'fatigue', commonQualities: ['constant', 'wave'], commonLocations: [], isCustom: false, trackingFrequency: 'always' },
  { id: 'mental-fatigue', name: 'Mental Fatigue', category: 'fatigue', commonQualities: ['constant', 'wave'], commonLocations: [], isCustom: false, trackingFrequency: 'always' },
  { id: 'pem', name: 'Post-Exertional Malaise', category: 'fatigue', commonQualities: ['sudden', 'wave'], commonLocations: [], isCustom: false, trackingFrequency: 'when_present' },
  
  // Cognitive
  { id: 'brain-fog', name: 'Brain Fog', category: 'cognitive', commonQualities: ['constant', 'wave'], commonLocations: [], isCustom: false, trackingFrequency: 'always' },
  { id: 'memory-issues', name: 'Memory Problems', category: 'cognitive', commonQualities: ['intermittent'], commonLocations: [], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'concentration', name: 'Difficulty Concentrating', category: 'cognitive', commonQualities: ['constant', 'intermittent'], commonLocations: [], isCustom: false, trackingFrequency: 'when_present' },
  
  // Digestive
  { id: 'nausea', name: 'Nausea', category: 'digestive', commonQualities: ['wave', 'constant'], commonLocations: ['stomach'], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'bloating', name: 'Bloating', category: 'digestive', commonQualities: ['pressure'], commonLocations: ['abdomen'], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'ibs-symptoms', name: 'IBS Symptoms', category: 'digestive', commonQualities: ['cramping', 'pressure'], commonLocations: ['abdomen'], isCustom: false, trackingFrequency: 'when_present' },
  
  // Autonomic
  { id: 'dizziness', name: 'Dizziness', category: 'autonomic', commonQualities: ['sudden', 'wave'], commonLocations: [], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'pots-symptoms', name: 'POTS Symptoms', category: 'autonomic', commonQualities: ['sudden'], commonLocations: ['heart', 'head'], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'temperature-dysregulation', name: 'Temperature Dysregulation', category: 'autonomic', commonQualities: ['wave'], commonLocations: [], isCustom: false, trackingFrequency: 'when_present' },
  
  // Sleep
  { id: 'insomnia', name: 'Insomnia', category: 'sleep', commonQualities: ['constant'], commonLocations: [], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'unrefreshing-sleep', name: 'Unrefreshing Sleep', category: 'sleep', commonQualities: ['constant'], commonLocations: [], isCustom: false, trackingFrequency: 'always' },
  
  // Sensory
  { id: 'light-sensitivity', name: 'Light Sensitivity', category: 'sensory', commonQualities: ['constant', 'wave'], commonLocations: ['eyes'], isCustom: false, trackingFrequency: 'when_present' },
  { id: 'sound-sensitivity', name: 'Sound Sensitivity', category: 'sensory', commonQualities: ['constant', 'wave'], commonLocations: ['ears'], isCustom: false, trackingFrequency: 'when_present' },
  
  // Emotional
  { id: 'anxiety', name: 'Anxiety', category: 'emotional', commonQualities: ['wave', 'constant'], commonLocations: [], isCustom: false, trackingFrequency: 'always' },
  { id: 'depression', name: 'Low Mood', category: 'emotional', commonQualities: ['constant', 'wave'], commonLocations: [], isCustom: false, trackingFrequency: 'always' },
];

// ============ SERVICE ============

class SymptomSymphonyService {
  private state: SymptomSymphonyState = {
    definitions: [...DEFAULT_SYMPTOMS],
    entries: [],
    correlations: [],
    flarePatterns: [],
    clusters: [],
    currentFlarePhase: 'baseline',
    triggers: [],
    learningData: {
      totalEntries: 0,
      correlationAccuracy: 0.5,
      predictionAccuracy: 0.5,
      lastAnalysis: Date.now(),
    },
  };
  private listeners: Set<() => void> = new Set();

  // ============ INITIALIZATION ============

  async initialize(): Promise<void> {
    try {
      const [definitions, entries, correlations, patterns, clusters, state] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DEFINITIONS),
        AsyncStorage.getItem(STORAGE_KEYS.ENTRIES),
        AsyncStorage.getItem(STORAGE_KEYS.CORRELATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PATTERNS),
        AsyncStorage.getItem(STORAGE_KEYS.CLUSTERS),
        AsyncStorage.getItem(STORAGE_KEYS.STATE),
      ]);

      if (definitions) this.state.definitions = JSON.parse(definitions);
      if (entries) this.state.entries = JSON.parse(entries);
      if (correlations) this.state.correlations = JSON.parse(correlations);
      if (patterns) this.state.flarePatterns = JSON.parse(patterns);
      if (clusters) this.state.clusters = JSON.parse(clusters);
      if (state) {
        const parsed = JSON.parse(state);
        this.state.currentFlarePhase = parsed.currentFlarePhase || 'baseline';
        this.state.triggers = parsed.triggers || [];
        this.state.learningData = parsed.learningData || this.state.learningData;
      }

      // Run analysis if enough data
      if (this.state.entries.length > 10) {
        await this.runCorrelationAnalysis();
      }

      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize SymptomSymphony:', error);
    }
  }

  // ============ SYMPTOM LOGGING ============

  async logSymptom(entry: Omit<SymptomEntry, 'id' | 'timestamp'>): Promise<SymptomEntry> {
    const newEntry: SymptomEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.state.entries.push(newEntry);
    this.state.learningData.totalEntries++;

    // Update flare phase
    await this.updateFlarePhase();

    // Trigger incremental learning
    if (this.state.entries.length % 5 === 0) {
      await this.runCorrelationAnalysis();
    }

    await this.saveEntries();
    this.notifyListeners();

    return newEntry;
  }

  async logMultipleSymptoms(entries: Omit<SymptomEntry, 'id' | 'timestamp'>[]): Promise<SymptomEntry[]> {
    const timestamp = Date.now();
    const newEntries = entries.map((entry, idx) => ({
      ...entry,
      id: `entry-${timestamp}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
    }));

    this.state.entries.push(...newEntries);
    this.state.learningData.totalEntries += newEntries.length;

    await this.updateFlarePhase();
    await this.runCorrelationAnalysis();
    await this.saveEntries();
    this.notifyListeners();

    return newEntries;
  }

  async addCustomSymptom(symptom: Omit<SymptomDefinition, 'id' | 'isCustom'>): Promise<SymptomDefinition> {
    const newSymptom: SymptomDefinition = {
      ...symptom,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };

    this.state.definitions.push(newSymptom);
    await AsyncStorage.setItem(STORAGE_KEYS.DEFINITIONS, JSON.stringify(this.state.definitions));
    this.notifyListeners();

    return newSymptom;
  }

  // ============ CORRELATION AI ============

  async runCorrelationAnalysis(): Promise<SymptomCorrelation[]> {
    const entries = this.state.entries;
    if (entries.length < 10) return [];

    const correlations: SymptomCorrelation[] = [];
    const symptomIds = [...new Set(entries.map(e => e.symptomId))];

    // Analyze each pair of symptoms
    for (let i = 0; i < symptomIds.length; i++) {
      for (let j = i + 1; j < symptomIds.length; j++) {
        const correlation = this.calculateCorrelation(symptomIds[i], symptomIds[j], entries);
        if (correlation && Math.abs(correlation.correlationStrength) > 0.3) {
          correlations.push(correlation);
        }
      }
    }

    // Sort by correlation strength
    correlations.sort((a, b) => Math.abs(b.correlationStrength) - Math.abs(a.correlationStrength));
    this.state.correlations = correlations.slice(0, 50); // Keep top 50

    // Identify clusters
    await this.identifyClusters();

    // Analyze triggers
    await this.analyzeTriggers();

    this.state.learningData.lastAnalysis = Date.now();
    await this.saveAnalysis();

    return this.state.correlations;
  }

  private calculateCorrelation(
    symptomA: string,
    symptomB: string,
    entries: SymptomEntry[]
  ): SymptomCorrelation | null {
    const entriesA = entries.filter(e => e.symptomId === symptomA);
    const entriesB = entries.filter(e => e.symptomId === symptomB);

    if (entriesA.length < 3 || entriesB.length < 3) return null;

    // Find co-occurrences (within 24 hours)
    const WINDOW = 24 * 60 * 60 * 1000; // 24 hours
    let coOccurrences = 0;
    let totalOffsets: number[] = [];

    for (const a of entriesA) {
      for (const b of entriesB) {
        const offset = b.timestamp - a.timestamp;
        if (Math.abs(offset) <= WINDOW) {
          coOccurrences++;
          totalOffsets.push(offset / (60 * 1000)); // Convert to minutes
        }
      }
    }

    if (coOccurrences === 0) return null;

    // Calculate correlation strength (simplified Jaccard-like)
    const expectedCoOccurrence = (entriesA.length * entriesB.length) / entries.length;
    const observedRatio = coOccurrences / Math.min(entriesA.length, entriesB.length);
    const correlationStrength = Math.min(1, observedRatio - (expectedCoOccurrence / 10));

    // Calculate average time offset
    const avgOffset = totalOffsets.reduce((a, b) => a + b, 0) / totalOffsets.length;

    // Determine relationship type
    let relationship: SymptomCorrelation['relationship'] = 'co-occurs';
    if (avgOffset > 60) relationship = 'precedes';
    else if (avgOffset < -60) relationship = 'follows';
    else if (correlationStrength < 0) relationship = 'inverse';

    return {
      symptomA,
      symptomB,
      correlationStrength,
      timeOffset: Math.round(avgOffset),
      confidence: Math.min(1, coOccurrences / 10),
      sampleSize: coOccurrences,
      relationship,
    };
  }

  private async identifyClusters(): Promise<void> {
    // Find symptoms that frequently occur together
    const clusters: SymptomCluster[] = [];
    const symptomGroups: Map<string, Set<string>> = new Map();

    // Group strongly correlated symptoms
    for (const corr of this.state.correlations) {
      if (corr.correlationStrength > 0.5 && corr.relationship === 'co-occurs') {
        if (!symptomGroups.has(corr.symptomA)) {
          symptomGroups.set(corr.symptomA, new Set([corr.symptomA]));
        }
        symptomGroups.get(corr.symptomA)!.add(corr.symptomB);
      }
    }

    // Merge overlapping groups
    const mergedGroups: Set<string>[] = [];
    for (const group of symptomGroups.values()) {
      let merged = false;
      for (const existing of mergedGroups) {
        if ([...group].some(s => existing.has(s))) {
          group.forEach(s => existing.add(s));
          merged = true;
          break;
        }
      }
      if (!merged && group.size >= 2) {
        mergedGroups.push(new Set(group));
      }
    }

    // Create cluster objects
    for (let i = 0; i < mergedGroups.length; i++) {
      const symptoms = [...mergedGroups[i]];
      const clusterEntries = this.state.entries.filter(e => symptoms.includes(e.symptomId));
      
      const avgSeverity = clusterEntries.reduce((sum, e) => sum + e.severity, 0) / clusterEntries.length;
      const allTriggers = clusterEntries.flatMap(e => e.triggers || []);
      const triggerCounts: Record<string, number> = {};
      allTriggers.forEach(t => triggerCounts[t] = (triggerCounts[t] || 0) + 1);

      clusters.push({
        id: `cluster-${i}`,
        name: `Cluster ${i + 1}: ${symptoms.slice(0, 2).map(s => 
          this.state.definitions.find(d => d.id === s)?.name || s
        ).join(' + ')}`,
        symptoms,
        frequency: clusterEntries.length,
        averageSeverity: Math.round(avgSeverity * 10) / 10,
        typicalTriggers: Object.entries(triggerCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([t]) => t),
        possibleConditions: this.suggestConditions(symptoms),
      });
    }

    this.state.clusters = clusters;
    await AsyncStorage.setItem(STORAGE_KEYS.CLUSTERS, JSON.stringify(clusters));
  }

  private suggestConditions(symptoms: string[]): string[] {
    // Simplified condition suggestion based on symptom patterns
    const conditions: string[] = [];
    
    const hasSymptom = (id: string) => symptoms.includes(id);
    
    if (hasSymptom('pem') && hasSymptom('physical-fatigue') && hasSymptom('brain-fog')) {
      conditions.push('ME/CFS');
    }
    if (hasSymptom('joint-pain') && hasSymptom('physical-fatigue')) {
      conditions.push('Fibromyalgia');
    }
    if (hasSymptom('dizziness') && hasSymptom('pots-symptoms')) {
      conditions.push('POTS/Dysautonomia');
    }
    if (hasSymptom('headache') && hasSymptom('light-sensitivity') && hasSymptom('sound-sensitivity')) {
      conditions.push('Migraine');
    }
    if (hasSymptom('ibs-symptoms') && hasSymptom('bloating')) {
      conditions.push('IBS');
    }

    return conditions;
  }

  private async analyzeTriggers(): Promise<void> {
    const triggerMap: Map<string, TriggerAnalysis> = new Map();

    for (const entry of this.state.entries) {
      if (!entry.triggers) continue;

      for (const trigger of entry.triggers) {
        if (!triggerMap.has(trigger)) {
          triggerMap.set(trigger, {
            trigger,
            affectedSymptoms: [],
            averageDelayMinutes: 0,
            severityIncrease: 0,
            frequency: 0,
            confidence: 0,
          });
        }

        const analysis = triggerMap.get(trigger)!;
        analysis.frequency++;
        if (!analysis.affectedSymptoms.includes(entry.symptomId)) {
          analysis.affectedSymptoms.push(entry.symptomId);
        }
        analysis.severityIncrease += entry.severity;
      }
    }

    // Normalize values
    for (const analysis of triggerMap.values()) {
      analysis.severityIncrease = Math.round((analysis.severityIncrease / analysis.frequency) * 10) / 10;
      analysis.confidence = Math.min(1, analysis.frequency / 10);
    }

    this.state.triggers = [...triggerMap.values()]
      .filter(t => t.frequency >= 2)
      .sort((a, b) => b.frequency - a.frequency);
  }

  // ============ FLARE PREDICTION ============

  async predictFlare(): Promise<FlarePrediction> {
    const recentEntries = this.state.entries
      .filter(e => Date.now() - e.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
      .sort((a, b) => a.timestamp - b.timestamp);

    if (recentEntries.length === 0) {
      return {
        probability: 0,
        predictedPhase: 'baseline',
        timeToFlare: Infinity,
        confidence: 0.5,
        warningSymptoms: [],
        recommendedActions: [],
      };
    }

    // Calculate severity trend
    const avgSeverity = recentEntries.reduce((sum, e) => sum + e.severity, 0) / recentEntries.length;
    const recentSeverity = recentEntries.slice(-5).reduce((sum, e) => sum + e.severity, 0) / Math.min(5, recentEntries.length);
    const trend = recentSeverity - avgSeverity;

    // Match against known patterns
    const matchedPattern = this.matchFlarePattern(recentEntries);

    // Calculate probability
    let probability = 0;
    probability += Math.max(0, trend / 5) * 0.3; // Severity trend
    probability += Math.min(1, recentEntries.length / 10) * 0.2; // Volume of symptoms
    probability += (matchedPattern ? matchedPattern.occurrences / 20 : 0) * 0.3; // Pattern match
    probability += (avgSeverity / 10) * 0.2; // Base severity level

    probability = Math.min(1, Math.max(0, probability));

    // Determine phase
    let phase: FlarePhase = 'baseline';
    let timeToFlare = Infinity;

    if (probability < 0.2) phase = 'baseline';
    else if (probability < 0.35) phase = 'prodrome';
    else if (probability < 0.5) phase = 'escalating';
    else if (probability < 0.7) phase = 'peak';
    else if (probability < 0.85) phase = 'plateau';
    else phase = 'peak';

    if (phase === 'prodrome') timeToFlare = 120;
    else if (phase === 'escalating') timeToFlare = 60;
    else if (phase === 'peak' || phase === 'plateau') timeToFlare = 0;

    // Warning symptoms (high severity recent ones)
    const warningSymptoms = recentEntries
      .filter(e => e.severity >= 5)
      .slice(-3);

    // Recommended actions
    const actions = this.getFlareActions(phase, matchedPattern);

    this.state.currentFlarePhase = phase;

    return {
      probability,
      predictedPhase: phase,
      timeToFlare,
      confidence: this.state.learningData.predictionAccuracy,
      warningSymptoms,
      recommendedActions: actions,
      matchedPattern: matchedPattern || undefined,
    };
  }

  private matchFlarePattern(recentEntries: SymptomEntry[]): FlarePattern | null {
    if (this.state.flarePatterns.length === 0) return null;

    const currentSymptoms = new Set(recentEntries.map(e => e.symptomId));

    for (const pattern of this.state.flarePatterns) {
      const prodromMatch = pattern.prodromeSigns.filter(s => currentSymptoms.has(s)).length / pattern.prodromeSigns.length;
      const peakMatch = pattern.peakSymptoms.filter(s => currentSymptoms.has(s)).length / pattern.peakSymptoms.length;

      if (prodromMatch > 0.5 || peakMatch > 0.5) {
        return pattern;
      }
    }

    return null;
  }

  private getFlareActions(phase: FlarePhase, pattern: FlarePattern | null): FlareAction[] {
    const actions: FlareAction[] = [];

    if (phase === 'prodrome' || phase === 'escalating') {
      actions.push({
        id: 'pace-immediately',
        type: 'preventive',
        title: 'Reduce Activity Immediately',
        description: 'Stop non-essential activities and rest proactively',
        effectiveness: 0.8,
        urgency: 'high',
      });
      actions.push({
        id: 'cancel-plans',
        type: 'preventive',
        title: 'Cancel Upcoming Commitments',
        description: 'Clear schedule for next 24-48 hours if possible',
        effectiveness: 0.7,
        urgency: 'medium',
      });
    }

    if (phase === 'peak' || phase === 'plateau') {
      actions.push({
        id: 'complete-rest',
        type: 'management',
        title: 'Complete Rest Mode',
        description: 'Minimize all stimulation and activity',
        effectiveness: 0.9,
        urgency: 'critical',
      });
      actions.push({
        id: 'track-duration',
        type: 'management',
        title: 'Track Flare Duration',
        description: 'Document this for medical records',
        effectiveness: 0.5,
        urgency: 'low',
      });
    }

    if (pattern?.successfulInterventions) {
      for (const intervention of pattern.successfulInterventions.slice(0, 2)) {
        actions.push({
          id: `pattern-${intervention}`,
          type: 'management',
          title: intervention,
          description: 'Previously effective for similar flares',
          effectiveness: 0.75,
          urgency: 'high',
        });
      }
    }

    return actions;
  }

  async recordFlarePattern(
    prodromeSigns: string[],
    peakSymptoms: string[],
    triggers: string[],
    successfulInterventions: string[]
  ): Promise<FlarePattern> {
    const pattern: FlarePattern = {
      id: `pattern-${Date.now()}`,
      name: `Flare Pattern ${this.state.flarePatterns.length + 1}`,
      prodromeSigns,
      peakSymptoms,
      typicalDuration: 0,
      recoveryDuration: 0,
      knownTriggers: triggers,
      successfulInterventions,
      occurrences: 1,
      lastOccurred: Date.now(),
    };

    this.state.flarePatterns.push(pattern);
    await AsyncStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(this.state.flarePatterns));
    this.notifyListeners();

    return pattern;
  }

  // ============ MEDICAL EXPORT ============

  async generateMedicalTimeline(
    startDate: number,
    endDate: number
  ): Promise<MedicalTimeline> {
    const entries = this.state.entries.filter(
      e => e.timestamp >= startDate && e.timestamp <= endDate
    );

    // Calculate summary statistics
    const symptomCounts: Record<string, number> = {};
    let totalSeverity = 0;
    const allTriggers: string[] = [];
    const allRelief: string[] = [];

    for (const entry of entries) {
      symptomCounts[entry.name] = (symptomCounts[entry.name] || 0) + 1;
      totalSeverity += entry.severity;
      if (entry.triggers) allTriggers.push(...entry.triggers);
      if (entry.relievedBy) allRelief.push(...entry.relievedBy);
    }

    const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000)) || 1;

    const timeline: MedicalTimeline = {
      generatedAt: Date.now(),
      dateRange: { start: startDate, end: endDate },
      summary: {
        totalEntries: entries.length,
        avgDailySeverity: Math.round((totalSeverity / days) * 10) / 10,
        mostFrequentSymptoms: Object.entries(symptomCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count })),
        identifiedTriggers: [...new Set(allTriggers)].slice(0, 10),
        effectiveInterventions: [...new Set(allRelief)].slice(0, 10),
      },
      entries: entries.sort((a, b) => a.timestamp - b.timestamp),
      correlations: this.state.correlations,
      flarePatterns: this.state.flarePatterns,
      clusters: this.state.clusters,
      recommendations: this.generateRecommendations(),
    };

    return timeline;
  }

  private generateRecommendations(): string[] {
    const recs: string[] = [];

    // Based on correlations
    const strongCorrelations = this.state.correlations.filter(c => c.correlationStrength > 0.6);
    if (strongCorrelations.length > 0) {
      recs.push(`Strong symptom correlations identified between ${strongCorrelations[0].symptomA} and ${strongCorrelations[0].symptomB}. Managing one may help the other.`);
    }

    // Based on triggers
    if (this.state.triggers.length > 0) {
      const topTrigger = this.state.triggers[0];
      recs.push(`"${topTrigger.trigger}" appears to trigger symptoms ${topTrigger.frequency} times. Consider avoidance strategies.`);
    }

    // Based on clusters
    for (const cluster of this.state.clusters.slice(0, 2)) {
      if (cluster.possibleConditions.length > 0) {
        recs.push(`Symptom cluster suggests possible ${cluster.possibleConditions.join(' or ')}. Consider discussing with healthcare provider.`);
      }
    }

    return recs;
  }

  // ============ PHASE MANAGEMENT ============

  private async updateFlarePhase(): Promise<void> {
    const prediction = await this.predictFlare();
    this.state.currentFlarePhase = prediction.predictedPhase;
    await this.saveState();
  }

  // ============ STATE MANAGEMENT ============

  private async saveEntries(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(this.state.entries));
  }

  private async saveAnalysis(): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.CORRELATIONS, JSON.stringify(this.state.correlations)),
      AsyncStorage.setItem(STORAGE_KEYS.CLUSTERS, JSON.stringify(this.state.clusters)),
      this.saveState(),
    ]);
  }

  private async saveState(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify({
      currentFlarePhase: this.state.currentFlarePhase,
      triggers: this.state.triggers,
      learningData: this.state.learningData,
    }));
  }

  getState(): SymptomSymphonyState {
    return { ...this.state };
  }

  getSymptomDefinitions(): SymptomDefinition[] {
    return [...this.state.definitions];
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
      definitions: [...DEFAULT_SYMPTOMS],
      entries: [],
      correlations: [],
      flarePatterns: [],
      clusters: [],
      currentFlarePhase: 'baseline',
      triggers: [],
      learningData: {
        totalEntries: 0,
        correlationAccuracy: 0.5,
        predictionAccuracy: 0.5,
        lastAnalysis: Date.now(),
      },
    };

    await Promise.all(Object.values(STORAGE_KEYS).map(key => AsyncStorage.removeItem(key)));
    this.notifyListeners();
  }
}

// ============ SINGLETON & HOOKS ============

export const symptomSymphony = new SymptomSymphonyService();

export function useSymptomSymphony() {
  const [state, setState] = React.useState<SymptomSymphonyState>(symptomSymphony.getState());

  React.useEffect(() => {
    return symptomSymphony.subscribe(() => {
      setState(symptomSymphony.getState());
    });
  }, []);

  return {
    state,
    logSymptom: symptomSymphony.logSymptom.bind(symptomSymphony),
    logMultiple: symptomSymphony.logMultipleSymptoms.bind(symptomSymphony),
    addCustomSymptom: symptomSymphony.addCustomSymptom.bind(symptomSymphony),
    predictFlare: symptomSymphony.predictFlare.bind(symptomSymphony),
    runAnalysis: symptomSymphony.runCorrelationAnalysis.bind(symptomSymphony),
    recordPattern: symptomSymphony.recordFlarePattern.bind(symptomSymphony),
    exportTimeline: symptomSymphony.generateMedicalTimeline.bind(symptomSymphony),
    getDefinitions: symptomSymphony.getSymptomDefinitions.bind(symptomSymphony),
    reset: symptomSymphony.reset.bind(symptomSymphony),
  };
}
