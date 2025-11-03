/**
 * Disability Wizard - Personalized guidance system for disability advocacy & wellness
 * 
 * This "super-brain" learns user preferences, disability needs, and context to surface
 * the most helpful features at the right time. Features daily rotation for variety
 * while respecting individual needs and usage patterns.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import { useCoachProgressOptional } from '../store/coachProgress';

import { pseudoRandom01 } from './session';
import { usage } from './usage';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface DisabilityProfile {
  // Disability categories (user self-reported)
  disabilityTypes: Array<'physical' | 'cognitive' | 'sensory' | 'mental_health' | 'chronic_illness' | 'neurodivergent' | 'multiple'>;
  
  // Specific conditions (optional for deeper personalization)
  conditions?: string[];
  
  // Daily patterns
  energyPeakHours: number[]; // 0-23, hours when user has most energy
  cognitiveLoadPreference: 'light' | 'moderate' | 'variable';
  
  // Accessibility needs
  screenReaderUser: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  simplifiedLanguage: boolean;
  
  // Communication preferences
  preferredFormats: Array<'text' | 'audio' | 'video' | 'asl' | 'easy-read'>;
  
  // Support level needed
  independenceLevel: 'full' | 'some_support' | 'significant_support';
  
  // Context
  lastUpdated: number;
}

export interface WizardSuggestion {
  toolId: string;
  category: 'advocacy' | 'wellness' | 'community' | 'resources' | 'legal';
  title: string;
  description: string;
  icon: string;
  route: string;
  score: number;
  
  // Why this suggestion?
  reasoning: ReasonChip[];
  
  // Accessibility info
  accessibilityFeatures: string[];
  estimatedTime: number; // minutes
  energyLevel: 'low' | 'medium' | 'high';
  cognitiveLoad: 'light' | 'moderate' | 'heavy';
  
  // Interconnections
  relatedTools: string[];
  flowsInto: string[]; // Natural next steps
  
  // Rotation info
  dayOfRotation?: number; // 0-6 for weekly rotation
  lastShown?: number;
  timesShown: number;
}

interface ReasonChip {
  type: 'disability_match' | 'energy_level' | 'time_of_day' | 'continuation' | 'new_feature' | 'daily_rotation' | 'user_pattern' | 'stress_relief' | 'accessibility_fit';
  label: string;
  confidence: number; // 0-1
}

export interface SuggestibleTool {
  id: string;
  category: 'advocacy' | 'wellness' | 'community' | 'resources' | 'legal';
  title: string;
  description: string;
  icon: string;
  route: string;
  importance: 1 | 2 | 3;
  
  // Accessibility characteristics
  energyLevel: 'low' | 'medium' | 'high';
  cognitiveLoad: 'light' | 'moderate' | 'heavy';
  estimatedTime: number; // minutes
  accessibilityFeatures: string[];
  
  // Disability relevance
  helpsWith: Array<'physical' | 'cognitive' | 'sensory' | 'mental_health' | 'chronic_illness' | 'neurodivergent' | 'all'>;
  
  // Timing preferences
  bestTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  
  // Interconnections
  relatedTools: string[];
  flowsInto: string[];
  
  // Rotation
  rotationDays?: number[]; // Days of week to emphasize (0=Sun, 6=Sat)
  
  // Prerequisites
  prereq?: () => boolean;
}

// ============================================================================
// Tool Registry - Enhanced with disability & interconnection info
// ============================================================================

const WIZARD_TOOLS: SuggestibleTool[] = [
  {
    id: 'assistant_hub',
    category: 'advocacy',
    title: 'AI Assistant Hub',
    description: 'Get help with any advocacy task - your all-in-one AI support center',
    icon: 'chatbubbles',
    route: '/(tabs)/advocacy/assistant-hub',
    importance: 3,
    energyLevel: 'low',
    cognitiveLoad: 'light',
    estimatedTime: 5,
    accessibilityFeatures: ['screen_reader', 'voice_input', 'simplified_interface'],
    helpsWith: ['cognitive', 'all'],
    bestTimeOfDay: 'anytime',
    relatedTools: ['coach', 'translator', 'policy_simplifier'],
    flowsInto: ['coach', 'translator', 'policy_simplifier', 'evidence_locker'],
    rotationDays: [0, 2, 4], // Sun, Tue, Thu
  },
  {
    id: 'coach',
    category: 'advocacy',
    title: 'AI Accountability Coach',
    description: 'Structured support for understanding your rights and building an action plan',
    icon: 'people',
    route: '/(tabs)/advocacy/accountability-coach',
    importance: 3,
    energyLevel: 'medium',
    cognitiveLoad: 'moderate',
    estimatedTime: 15,
    accessibilityFeatures: ['screen_reader', 'simplified_language', 'progress_tracking'],
    helpsWith: ['all'],
    bestTimeOfDay: 'morning',
    relatedTools: ['assistant_hub', 'translator', 'policy_simplifier', 'legal_workflow'],
    flowsInto: ['evidence_locker', 'letter_generator'],
    rotationDays: [1, 3, 5], // Mon, Wed, Fri
  },
  {
    id: 'translator',
    category: 'advocacy',
    title: 'AI Case Translator',
    description: 'Turn complex legal/medical jargon into plain language you can understand',
    icon: 'language',
    route: '/(tabs)/advocacy/ai-case-interpreter',
    importance: 3,
    energyLevel: 'low',
    cognitiveLoad: 'light',
    estimatedTime: 5,
    accessibilityFeatures: ['screen_reader', 'simplified_language', 'audio_output'],
    helpsWith: ['cognitive', 'all'],
    bestTimeOfDay: 'anytime',
    relatedTools: ['assistant_hub', 'policy_simplifier', 'coach'],
    flowsInto: ['coach', 'evidence_locker'],
    rotationDays: [0, 2, 4, 6], // Sun, Tue, Thu, Sat
  },
  {
    id: 'policy_simplifier',
    category: 'advocacy',
    title: 'Policy Simplifier',
    description: 'Break down government policies into simple, actionable steps',
    icon: 'document-text',
    route: '/(tabs)/advocacy/policy-simplifier',
    importance: 2,
    energyLevel: 'low',
    cognitiveLoad: 'light',
    estimatedTime: 10,
    accessibilityFeatures: ['screen_reader', 'plain_language', 'visual_aids'],
    helpsWith: ['cognitive', 'all'],
    bestTimeOfDay: 'afternoon',
    relatedTools: ['assistant_hub', 'translator', 'resources_search'],
    flowsInto: ['coach', 'evidence_locker'],
    rotationDays: [1, 4], // Mon, Thu
  },
  {
    id: 'wellness_mood',
    category: 'wellness',
    title: 'Mood Tracker',
    description: 'Track your emotional well-being and identify patterns',
    icon: 'heart',
    route: '/(tabs)/wellness/mood',
    importance: 2,
    energyLevel: 'low',
    cognitiveLoad: 'light',
    estimatedTime: 3,
    accessibilityFeatures: ['screen_reader', 'simplified_interface', 'emoji_support'],
    helpsWith: ['mental_health', 'chronic_illness', 'all'],
    bestTimeOfDay: 'evening',
    relatedTools: ['wellness_exercises', 'peer_support'],
    flowsInto: ['wellness_exercises', 'community'],
    rotationDays: [0, 1, 2, 3, 4, 5, 6], // Every day
  },
  {
    id: 'evidence_locker',
    category: 'legal',
    title: 'Evidence Locker',
    description: 'Securely document incidents and save evidence for your case',
    icon: 'folder',
    route: '/(tabs)/advocacy/evidence-locker',
    importance: 3,
    energyLevel: 'medium',
    cognitiveLoad: 'moderate',
    estimatedTime: 10,
    accessibilityFeatures: ['screen_reader', 'voice_input', 'photo_upload'],
    helpsWith: ['all'],
    bestTimeOfDay: 'anytime',
    relatedTools: ['coach', 'legal_workflow'],
    flowsInto: ['legal_workflow', 'advocate_finder'],
    rotationDays: [2, 5], // Tue, Fri
  },
  {
    id: 'resources_search',
    category: 'resources',
    title: 'Resource Hub',
    description: 'Find benefits, services, and support programs you qualify for',
    icon: 'search',
    route: '/(tabs)/resources',
    importance: 2,
    energyLevel: 'medium',
    cognitiveLoad: 'moderate',
    estimatedTime: 15,
    accessibilityFeatures: ['screen_reader', 'filters', 'bookmarks'],
    helpsWith: ['all'],
    bestTimeOfDay: 'afternoon',
    relatedTools: ['policy_simplifier', 'benefits_calculator'],
    flowsInto: ['coach', 'application_assistant'],
    rotationDays: [0, 3], // Sun, Wed
  },
  {
    id: 'peer_support',
    category: 'community',
    title: 'Peer Support Matching',
    description: 'Connect with others who understand your journey',
    icon: 'people',
    route: '/(tabs)/community/peer-support',
    importance: 2,
    energyLevel: 'medium',
    cognitiveLoad: 'moderate',
    estimatedTime: 20,
    accessibilityFeatures: ['screen_reader', 'text_chat', 'video_support'],
    helpsWith: ['mental_health', 'all'],
    bestTimeOfDay: 'evening',
    relatedTools: ['wellness_mood', 'community_hub'],
    flowsInto: ['community_hub', 'advocacy_groups'],
    rotationDays: [1, 4, 6], // Mon, Thu, Sat
  },
  {
    id: 'legal_workflow',
    category: 'legal',
    title: 'Legal Workflow Assistant',
    description: 'Step-by-step guidance through legal processes',
    icon: 'list',
    route: '/(tabs)/advocacy/legal-workflow',
    importance: 3,
    energyLevel: 'high',
    cognitiveLoad: 'heavy',
    estimatedTime: 30,
    accessibilityFeatures: ['screen_reader', 'simplified_steps', 'progress_saving'],
    helpsWith: ['cognitive', 'all'],
    bestTimeOfDay: 'morning',
    relatedTools: ['coach', 'evidence_locker', 'advocate_finder'],
    flowsInto: ['evidence_locker', 'advocate_finder'],
    rotationDays: [2, 4], // Tue, Thu
  },
  {
    id: 'wellness_exercises',
    category: 'wellness',
    title: 'Wellness Exercises',
    description: 'Adaptive exercises and breathing techniques for stress relief',
    icon: 'fitness',
    route: '/(tabs)/wellness',
    importance: 2,
    energyLevel: 'low',
    cognitiveLoad: 'light',
    estimatedTime: 10,
    accessibilityFeatures: ['screen_reader', 'audio_guidance', 'adaptive_difficulty'],
    helpsWith: ['physical', 'mental_health', 'chronic_illness'],
    bestTimeOfDay: 'morning',
    relatedTools: ['wellness_mood'],
    flowsInto: ['wellness_mood'],
    rotationDays: [1, 3, 5], // Mon, Wed, Fri
  },
  {
    id: 'advocate_finder',
    category: 'advocacy',
    title: 'Find an Advocate',
    description: 'Search for lawyers, advocates, and support professionals',
    icon: 'person-add',
    route: '/(tabs)/advocacy/advocate-directory',
    importance: 2,
    energyLevel: 'medium',
    cognitiveLoad: 'moderate',
    estimatedTime: 15,
    accessibilityFeatures: ['screen_reader', 'filters', 'ratings'],
    helpsWith: ['all'],
    bestTimeOfDay: 'afternoon',
    relatedTools: ['legal_workflow', 'coach'],
    flowsInto: ['legal_workflow'],
    rotationDays: [0, 3, 6], // Sun, Wed, Sat
  },
];

// ============================================================================
// Disability Profile Management
// ============================================================================

const PROFILE_KEY = 'disabilityWizard:profile:v1';

export async function getDisabilityProfile(): Promise<DisabilityProfile | null> {
  try {
    if (!AsyncStorage || typeof AsyncStorage.getItem !== 'function') {
      console.warn('[getDisabilityProfile] AsyncStorage not available');
      return null;
    }
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    logError('DisabilityWizard', 'Failed to load disability profile', e);
  }
  return null;
}

export async function updateDisabilityProfile(updates: Partial<DisabilityProfile>): Promise<DisabilityProfile> {
  const current = await getDisabilityProfile();
  const updated: DisabilityProfile = {
    ...current,
    ...updates,
    lastUpdated: Date.now(),
  } as DisabilityProfile;
  
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  } catch (e) {
    logError('DisabilityWizard', 'Failed to save disability profile', e);
  }
  
  return updated;
}

export async function initializeDisabilityProfile(): Promise<DisabilityProfile> {
  const defaultProfile: DisabilityProfile = {
    disabilityTypes: [],
    energyPeakHours: [9, 10, 11, 14, 15, 16], // Default 9am-12pm, 2pm-5pm
    cognitiveLoadPreference: 'moderate',
    screenReaderUser: false,
    reducedMotion: false,
    highContrast: false,
    simplifiedLanguage: false,
    preferredFormats: ['text'],
    independenceLevel: 'full',
    lastUpdated: Date.now(),
  };
  
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
}

// ============================================================================
// Context Detection
// ============================================================================

interface UserContext {
  hour: number; // 0-23
  dayOfWeek: number; // 0-6
  isWeekend: boolean;
  isInEnergyPeak: boolean;
  recentStressIndicators: number; // 0-1 based on app usage patterns
  consecutiveDaysUsed: number;
}

async function detectContext(profile: DisabilityProfile | null): Promise<UserContext> {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  const isInEnergyPeak = profile?.energyPeakHours.includes(hour) ?? true;
  
  // Detect stress from rapid app switching or many incomplete actions
  const buf = usage.getBuffer();
  const recentEvents = buf.filter(e => Date.now() - e.ts < 3600000); // Last hour
  const incompletions = recentEvents.filter(e => e.type === 'usage.start' && !recentEvents.some(f => f.type === 'usage.complete' && f.tool === e.tool)).length;
  const recentStressIndicators = Math.min(1, incompletions / 5);
  
  // Streak calculation
  const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    return day.getTime();
  });
  
  const usedDays = new Set(buf.map(e => {
    const d = new Date(e.ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }));
  
  let consecutiveDaysUsed = 0;
  for (const day of lastSevenDays) {
    if (usedDays.has(day)) consecutiveDaysUsed++;
    else break;
  }
  
  return {
    hour,
    dayOfWeek,
    isWeekend,
    isInEnergyPeak,
    recentStressIndicators,
    consecutiveDaysUsed,
  };
}

// ============================================================================
// Daily Rotation System
// ============================================================================

const ROTATION_KEY = 'disabilityWizard:rotation:v1';

interface RotationState {
  currentDay: string; // YYYY-MM-DD
  shownToday: string[];
  rotationSeed: number;
}

async function getRotationState(): Promise<RotationState> {
  try {
    const raw = await AsyncStorage.getItem(ROTATION_KEY);
    if (raw) {
      const state = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      
      // Reset if new day
      if (state.currentDay !== today) {
        return {
          currentDay: today,
          shownToday: [],
          rotationSeed: Math.random(),
        };
      }
      
      return state;
    }
  } catch (e) {
    logError('DisabilityWizard', 'Failed to load rotation state', e);
  }
  
  return {
    currentDay: new Date().toISOString().split('T')[0],
    shownToday: [],
    rotationSeed: Math.random(),
  };
}

async function markToolShown(toolId: string): Promise<void> {
  const state = await getRotationState();
  if (!state.shownToday.includes(toolId)) {
    state.shownToday.push(toolId);
    try {
      await AsyncStorage.setItem(ROTATION_KEY, JSON.stringify(state));
    } catch (e) {
      logError('DisabilityWizard', 'Failed to save rotation state', e);
    }
  }
}

// ============================================================================
// Scoring Engine - Enhanced for Disability Needs
// ============================================================================

function now() {
  return Date.now();
}

function recencyFactor(ts: number | undefined, halfLifeMinutes: number) {
  if (!ts) return 0;
  const deltaMin = (now() - ts) / 60000;
  return Math.exp(-deltaMin / halfLifeMinutes);
}

function lastEvent(tool: string, types: string[]) {
  const buf = usage.getBuffer();
  for (let i = buf.length - 1; i >= 0; i--) {
    const e = buf[i];
    if (e.tool === tool && types.includes(e.type)) return e;
  }
  return undefined;
}

function calculateDisabilityMatch(tool: SuggestibleTool, profile: DisabilityProfile | null): { score: number; reason: ReasonChip | null } {
  if (!profile || profile.disabilityTypes.length === 0) {
    return { score: 0, reason: null };
  }
  
  // Check if tool helps with user's disability types (excluding 'multiple' since it's not in helpsWith)
  const relevantTypes = profile.disabilityTypes.filter(type => 
    type !== 'multiple' && (tool.helpsWith.includes(type as any) || tool.helpsWith.includes('all'))
  );
  
  if (relevantTypes.length === 0) {
    return { score: 0, reason: null };
  }
  
  const matchScore = (relevantTypes.length / profile.disabilityTypes.length) * 0.8;
  
  return {
    score: matchScore,
    reason: {
      type: 'disability_match',
      label: `Designed for ${relevantTypes.join(', ')} support`,
      confidence: matchScore,
    },
  };
}

function calculateEnergyFit(tool: SuggestibleTool, context: UserContext, _profile: DisabilityProfile | null): { score: number; reason: ReasonChip | null } {
  if (!context.isInEnergyPeak && tool.energyLevel === 'high') {
    return {
      score: -0.5,
      reason: {
        type: 'energy_level',
        label: 'This requires high energy - save for peak hours',
        confidence: 0.8,
      },
    };
  }
  
  if (context.isInEnergyPeak && tool.energyLevel === 'low') {
    return {
      score: 0.3,
      reason: {
        type: 'energy_level',
        label: 'Great for current energy level',
        confidence: 0.7,
      },
    };
  }
  
  return { score: 0, reason: null };
}

function calculateTimeOfDayFit(tool: SuggestibleTool, context: UserContext): { score: number; reason: ReasonChip | null } {
  const { hour } = context;
  
  if (!tool.bestTimeOfDay || tool.bestTimeOfDay === 'anytime') {
    return { score: 0, reason: null };
  }
  
  const timeMatches = {
    morning: hour >= 6 && hour < 12,
    afternoon: hour >= 12 && hour < 17,
    evening: hour >= 17 && hour < 22,
    night: hour >= 22 || hour < 6,
  };
  
  if (timeMatches[tool.bestTimeOfDay]) {
    return {
      score: 0.4,
      reason: {
        type: 'time_of_day',
        label: `Perfect for ${tool.bestTimeOfDay} time`,
        confidence: 0.8,
      },
    };
  }
  
  return { score: 0, reason: null };
}

function calculateRotationBoost(tool: SuggestibleTool, context: UserContext, rotationState: RotationState): { score: number; reason: ReasonChip | null } {
  // Check if this is a featured day for this tool
  if (tool.rotationDays && tool.rotationDays.includes(context.dayOfWeek)) {
    // Add deterministic jitter based on rotation seed
    const dailyBoost = 0.5 + (pseudoRandom01(tool.id + rotationState.rotationSeed.toString()) * 0.3);
    
    return {
      score: dailyBoost,
      reason: {
        type: 'daily_rotation',
        label: "Today's featured tool",
        confidence: 0.9,
      },
    };
  }
  
  // Penalize if already shown today
  if (rotationState.shownToday.includes(tool.id)) {
    return {
      score: -0.6,
      reason: null,
    };
  }
  
  return { score: 0, reason: null };
}

function calculateStressReliefBonus(tool: SuggestibleTool, context: UserContext): { score: number; reason: ReasonChip | null } {
  if (context.recentStressIndicators > 0.5) {
    // Prioritize wellness and low-cognitive-load tools when stressed
    if (tool.category === 'wellness' || tool.cognitiveLoad === 'light') {
      return {
        score: 0.5,
        reason: {
          type: 'stress_relief',
          label: 'May help with stress relief',
          confidence: context.recentStressIndicators,
        },
      };
    }
  }
  
  return { score: 0, reason: null };
}

// ============================================================================
// Main Scoring Function
// ============================================================================

export async function getWizardSuggestions(extra?: { coachProgress?: number }): Promise<WizardSuggestion[]> {
  try {
    const profile = await getDisabilityProfile();
    const context = await detectContext(profile);
    const rotationState = await getRotationState();
    
    const suggestions: WizardSuggestion[] = [];
    
    for (const tool of WIZARD_TOOLS) {
      // Check prerequisites
      if (tool.prereq && !tool.prereq()) continue;
      
      let score = tool.importance;
      const reasoning: ReasonChip[] = [];
      
      // 1. Disability match
      const disabilityMatch = calculateDisabilityMatch(tool, profile);
      if (disabilityMatch.score > 0) {
        score += disabilityMatch.score;
        if (disabilityMatch.reason) reasoning.push(disabilityMatch.reason);
      }
      
      // 2. Energy fit
      const energyFit = calculateEnergyFit(tool, context, profile);
      score += energyFit.score;
      if (energyFit.reason) reasoning.push(energyFit.reason);
      
      // 3. Time of day fit
      const timeOfDayFit = calculateTimeOfDayFit(tool, context);
      score += timeOfDayFit.score;
      if (timeOfDayFit.reason) reasoning.push(timeOfDayFit.reason);
      
      // 4. Daily rotation
      const rotationBoost = calculateRotationBoost(tool, context, rotationState);
      score += rotationBoost.score;
      if (rotationBoost.reason) reasoning.push(rotationBoost.reason);
      
      // 5. Stress relief
      const stressRelief = calculateStressReliefBonus(tool, context);
      score += stressRelief.score;
      if (stressRelief.reason) reasoning.push(stressRelief.reason);
      
      // 6. Recency (discourage just-used tools)
      const lastComplete = lastEvent(tool.id, ['usage.complete']);
      const lastView = lastEvent(tool.id, ['usage.view', 'usage.start']);
      const recencyTs = lastView?.ts || lastComplete?.ts;
      const rf = recencyFactor(recencyTs, 720); // 12 hour half-life
      const recencyPenalty = rf * 0.6;
      if (recencyPenalty > 0) {
        score -= recencyPenalty;
      }
      
      // 7. Novelty bonus
      if (!lastView && !lastComplete) {
        score += 0.4;
        reasoning.push({
          type: 'new_feature',
          label: 'New feature to explore',
          confidence: 1.0,
        });
      }
      
      // 8. Continuation bonus (for partially completed tools)
      if (tool.id === 'coach' && typeof extra?.coachProgress === 'number' && extra.coachProgress > 0 && extra.coachProgress < 1) {
        const continuationBoost = (1 - extra.coachProgress) * 0.6;
        score += continuationBoost;
        reasoning.push({
          type: 'continuation',
          label: `Continue where you left off (${Math.round(extra.coachProgress * 100)}% complete)`,
          confidence: 0.9,
        });
      }
      
      // 9. User pattern learning (from personalization system)
      // TODO: Import and use existing feedback/preference data
      
      suggestions.push({
        toolId: tool.id,
        ...tool,
        score,
        reasoning,
        lastShown: rotationState.shownToday.includes(tool.id) ? Date.now() : undefined,
        timesShown: rotationState.shownToday.filter(id => id === tool.id).length,
        dayOfRotation: tool.rotationDays?.includes(context.dayOfWeek) ? context.dayOfWeek : undefined,
      });
    }
    
    // Sort by score
    suggestions.sort((a, b) => b.score - a.score);
    
    // Mark top suggestion as shown (for rotation tracking)
    if (suggestions[0]) {
      await markToolShown(suggestions[0].toolId);
    }
    
    return suggestions;
  } catch (error) {
    logError('DisabilityWizard', 'Failed to generate suggestions', error);
    // Return empty array on any error - this prevents app crashes
    return [];
  }
}

// ============================================================================
// Interconnection Helper - Find Natural Flow Paths
// ============================================================================

export function findNextSteps(currentToolId: string): WizardSuggestion[] {
  const currentTool = WIZARD_TOOLS.find(t => t.id === currentToolId);
  if (!currentTool) return [];
  
  const nextTools = WIZARD_TOOLS.filter(t => 
    currentTool.flowsInto.includes(t.id) ||
    currentTool.relatedTools.includes(t.id)
  );
  
  return nextTools.map(tool => ({
    toolId: tool.id,
    ...tool,
    score: currentTool.flowsInto.includes(tool.id) ? 0.9 : 0.7,
    reasoning: [{
      type: 'continuation',
      label: currentTool.flowsInto.includes(tool.id) 
        ? 'Recommended next step' 
        : 'Related feature',
      confidence: 0.9,
    }],
    timesShown: 0,
  }));
}

// ============================================================================
// AI Context Helper - Generate disability-aware context for LLM prompts
// ============================================================================

/**
 * Get a human-readable summary of the user's disability profile
 * to include as context in AI/LLM prompts for more personalized responses.
 * 
 * @returns A string describing the user's needs, or empty if no profile exists
 */
export async function getDisabilityContextForAI(): Promise<string> {
  const profile = await getDisabilityProfile();
  if (!profile) return '';
  
  const parts: string[] = [];
  
  // Disability types
  if (profile.disabilityTypes.length > 0) {
    const types = profile.disabilityTypes
      .filter(t => t !== 'multiple')
      .map(t => t.replace(/_/g, ' '))
      .join(', ');
    if (types) {
      parts.push(`User has: ${types}`);
    }
  }
  
  // Energy patterns
  if (profile.energyPeakHours.length > 0) {
    const hours = profile.energyPeakHours;
    const timeOfDay = 
      hours.some(h => h >= 6 && h <= 11) ? 'morning' :
      hours.some(h => h >= 12 && h <= 17) ? 'afternoon' :
      hours.some(h => h >= 18 && h <= 22) ? 'evening' : 'varies';
    parts.push(`Best energy: ${timeOfDay}`);
  }
  
  // Cognitive preferences
  if (profile.cognitiveLoadPreference) {
    parts.push(`Prefers ${profile.cognitiveLoadPreference} cognitive load tasks`);
  }
  
  // Accessibility needs
  const a11yNeeds: string[] = [];
  if (profile.screenReaderUser) a11yNeeds.push('screen reader');
  if (profile.simplifiedLanguage) a11yNeeds.push('plain language');
  if (profile.reducedMotion) a11yNeeds.push('reduced motion');
  if (profile.highContrast) a11yNeeds.push('high contrast');
  if (a11yNeeds.length > 0) {
    parts.push(`Accessibility: ${a11yNeeds.join(', ')}`);
  }
  
  // Communication preferences
  if (profile.preferredFormats.length > 0) {
    parts.push(`Prefers: ${profile.preferredFormats.join(', ')} communication`);
  }
  
  // Support level
  if (profile.independenceLevel !== 'full') {
    parts.push(`Needs ${profile.independenceLevel.replace(/_/g, ' ')}`);
  }
  
  return parts.length > 0 
    ? `[User context: ${parts.join('; ')}]`
    : '';
}

// ============================================================================
// React Hooks
// ============================================================================

export function useDisabilityWizard() {
  const progress = useCoachProgressOptional();
  const fraction = (progress?.percentComplete ?? 0) / 100;
  const [suggestions, setSuggestions] = React.useState<WizardSuggestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    setLoading(true);
    setError(null);
    getWizardSuggestions({ coachProgress: fraction })
      .then(setSuggestions)
      .catch((err) => {
        logError('DisabilityWizard', 'Error fetching suggestions', err);
        setError(err);
        setSuggestions([]); // Return empty array on error
      })
      .finally(() => setLoading(false));
  }, [fraction]);
  
  return { suggestions, loading, error };
}

export function useDisabilityProfile() {
  const [profile, setProfile] = React.useState<DisabilityProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    getDisabilityProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);
  
  const updateProfile = React.useCallback(async (updates: Partial<DisabilityProfile>) => {
    const updated = await updateDisabilityProfile(updates);
    setProfile(updated);
    return updated;
  }, []);
  
  return { profile, loading, updateProfile };
}
