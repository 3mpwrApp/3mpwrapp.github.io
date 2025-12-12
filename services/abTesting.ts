/**
 * A/B Testing Framework
 * 
 * Simple, privacy-respecting A/B testing for UX experiments.
 * All data stays on device - no external tracking.
 * 
 * Features:
 * - Consistent variant assignment per user
 * - Experiment configuration
 * - Conversion tracking
 * - Analytics integration
 */

import React from 'react';

import { logEvent } from './analytics';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const AB_ASSIGNMENTS_KEY = 'ab:assignments';
const AB_CONVERSIONS_KEY = 'ab:conversions';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: Variant[];
  /** Weight distribution (must sum to 1.0) */
  weights?: number[];
  /** Is experiment currently active? */
  active: boolean;
  /** Start date */
  startDate?: string;
  /** End date */
  endDate?: string;
}

export interface Variant {
  id: string;
  name: string;
  /** Configuration for this variant */
  config?: Record<string, any>;
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: string;
}

// Active experiments configuration
export const EXPERIMENTS: Record<string, Experiment> = {
  // Onboarding flow experiment
  'onboarding-flow': {
    id: 'onboarding-flow',
    name: 'Onboarding Flow',
    description: 'Test simplified vs detailed onboarding',
    active: true,
    variants: [
      { id: 'control', name: 'Standard Onboarding' },
      { id: 'simplified', name: 'Simplified Onboarding', config: { skipTips: true } },
    ],
    weights: [0.5, 0.5],
  },
  
  // Power Tools discovery
  'power-tools-discovery': {
    id: 'power-tools-discovery',
    name: 'Power Tools Discovery',
    description: 'Test different ways to introduce Power Tools',
    active: true,
    variants: [
      { id: 'control', name: 'Standard (in tab)' },
      { id: 'featured', name: 'Featured Section', config: { showFeatured: true } },
      { id: 'tooltip', name: 'With Tooltip', config: { showTooltip: true } },
    ],
    weights: [0.34, 0.33, 0.33],
  },
  
  // CTA button copy
  'cta-copy': {
    id: 'cta-copy',
    name: 'CTA Button Copy',
    description: 'Test different call-to-action text',
    active: true,
    variants: [
      { id: 'control', name: 'Get Started', config: { text: 'Get Started' } },
      { id: 'action', name: 'Start Advocating', config: { text: 'Start Advocating' } },
      { id: 'personal', name: 'My Journey', config: { text: 'Begin My Journey' } },
    ],
    weights: [0.34, 0.33, 0.33],
  },
  
  // Complexity mode default
  'complexity-default': {
    id: 'complexity-default',
    name: 'Complexity Mode Default',
    description: 'Test which default complexity mode works best',
    active: true,
    variants: [
      { id: 'simple', name: 'Simple Mode Default', config: { default: 'simple' } },
      { id: 'standard', name: 'Standard Mode Default', config: { default: 'standard' } },
    ],
    weights: [0.5, 0.5],
  },
};

/**
 * Get a deterministic hash for consistent assignment
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get or create a device ID for consistent experiments
 */
async function getDeviceId(): Promise<string> {
  if (!AsyncStorage) return 'anonymous';
  
  try {
    let deviceId = await AsyncStorage.getItem('ab:deviceId');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      await AsyncStorage.setItem('ab:deviceId', deviceId);
    }
    return deviceId;
  } catch {
    return 'anonymous';
  }
}

/**
 * Get all current experiment assignments
 */
async function getAssignments(): Promise<Record<string, ExperimentAssignment>> {
  if (!AsyncStorage) return {};
  
  try {
    const data = await AsyncStorage.getItem(AB_ASSIGNMENTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Save experiment assignments
 */
async function saveAssignments(assignments: Record<string, ExperimentAssignment>): Promise<void> {
  if (!AsyncStorage) return;
  
  try {
    await AsyncStorage.setItem(AB_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  } catch {
    // Ignore errors
  }
}

/**
 * Get variant for an experiment (consistent per user)
 */
export async function getVariant(experimentId: string): Promise<Variant | null> {
  const experiment = EXPERIMENTS[experimentId];
  if (!experiment || !experiment.active) {
    return null;
  }
  
  // Check date bounds
  const now = new Date();
  if (experiment.startDate && new Date(experiment.startDate) > now) {
    return null;
  }
  if (experiment.endDate && new Date(experiment.endDate) < now) {
    return null;
  }
  
  // Check for existing assignment
  const assignments = await getAssignments();
  if (assignments[experimentId]) {
    const variantId = assignments[experimentId].variantId;
    return experiment.variants.find(v => v.id === variantId) || experiment.variants[0];
  }
  
  // Assign new variant
  const deviceId = await getDeviceId();
  const hash = hashCode(`${deviceId}-${experimentId}`);
  const weights = experiment.weights || experiment.variants.map(() => 1 / experiment.variants.length);
  
  let cumulative = 0;
  const random = (hash % 1000) / 1000;
  let selectedVariant = experiment.variants[0];
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      selectedVariant = experiment.variants[i];
      break;
    }
  }
  
  // Save assignment
  assignments[experimentId] = {
    experimentId,
    variantId: selectedVariant.id,
    assignedAt: new Date().toISOString(),
  };
  await saveAssignments(assignments);
  
  // Log assignment
  logEvent('ab_experiment_assigned', {
    experimentId,
    variantId: selectedVariant.id,
    variantName: selectedVariant.name,
  });
  
  return selectedVariant;
}

/**
 * Track a conversion event for an experiment
 */
export async function trackConversion(experimentId: string, conversionType: string): Promise<void> {
  const assignments = await getAssignments();
  const assignment = assignments[experimentId];
  
  if (!assignment) return;
  
  if (!AsyncStorage) return;
  
  try {
    const conversionsStr = await AsyncStorage.getItem(AB_CONVERSIONS_KEY);
    const conversions: Record<string, any[]> = conversionsStr ? JSON.parse(conversionsStr) : {};
    
    if (!conversions[experimentId]) {
      conversions[experimentId] = [];
    }
    
    conversions[experimentId].push({
      variantId: assignment.variantId,
      conversionType,
      timestamp: new Date().toISOString(),
    });
    
    await AsyncStorage.setItem(AB_CONVERSIONS_KEY, JSON.stringify(conversions));
    
    logEvent('ab_conversion', {
      experimentId,
      variantId: assignment.variantId,
      conversionType,
    });
  } catch {
    // Ignore errors
  }
}

/**
 * React hook for A/B testing
 */
export function useExperiment(experimentId: string): {
  variant: Variant | null;
  isLoading: boolean;
  trackConversion: (type: string) => void;
} {
  const [variant, setVariant] = React.useState<Variant | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    getVariant(experimentId)
      .then(setVariant)
      .finally(() => setIsLoading(false));
  }, [experimentId]);
  
  const track = React.useCallback((type: string) => {
    trackConversion(experimentId, type);
  }, [experimentId]);
  
  return { variant, isLoading, trackConversion: track };
}

/**
 * Get variant config value with type safety
 */
export function getVariantConfig<T>(variant: Variant | null, key: string, defaultValue: T): T {
  if (!variant?.config) return defaultValue;
  return (variant.config[key] as T) ?? defaultValue;
}

/**
 * Check if user is in a specific variant
 */
export async function isInVariant(experimentId: string, variantId: string): Promise<boolean> {
  const variant = await getVariant(experimentId);
  return variant?.id === variantId;
}

/**
 * Force a specific variant (for testing/debugging)
 */
export async function forceVariant(experimentId: string, variantId: string): Promise<void> {
  const experiment = EXPERIMENTS[experimentId];
  if (!experiment) return;
  
  const variant = experiment.variants.find(v => v.id === variantId);
  if (!variant) return;
  
  const assignments = await getAssignments();
  assignments[experimentId] = {
    experimentId,
    variantId,
    assignedAt: new Date().toISOString(),
  };
  await saveAssignments(assignments);
}

/**
 * Reset all experiment assignments (for testing)
 */
export async function resetAllExperiments(): Promise<void> {
  if (!AsyncStorage) return;
  
  try {
    await AsyncStorage.multiRemove([AB_ASSIGNMENTS_KEY, AB_CONVERSIONS_KEY]);
  } catch {
    // Ignore errors
  }
}
