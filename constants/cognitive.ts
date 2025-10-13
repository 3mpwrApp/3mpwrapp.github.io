/**
 * Cognitive Accessibility Constants
 * 
 * Configurations for users with ADHD, autism, learning disabilities,
 * and other cognitive differences that affect information processing.
 * 
 * Based on:
 * - WCAG 2.2 Cognitive Accessibility Guidelines
 * - W3C Cognitive and Learning Disabilities Accessibility Task Force
 * - User research with ADHD/autism community
 */

export const COGNITIVE_MODES = {
  /**
   * Standard Mode - Default experience
   * For users without cognitive accessibility needs
   */
  standard: {
    name: 'Standard',
    description: 'Full feature set with standard navigation',
    maxItemsPerScreen: 10,
    hideSecondaryActions: false,
    useSimpleLanguage: false,
    showProgressIndicators: false,
    showBreadcrumbs: false,
    autoSaveFrequency: 300000, // 5 minutes
    reminderFrequency: 0, // No reminders
    highlightFocus: false,
    animationSpeed: 'normal',
    allowMultitasking: true,
  },

  /**
   * Simplified Mode - Reduced cognitive load
   * For users with ADHD, autism, learning disabilities
   */
  simplified: {
    name: 'Simplified',
    description: 'Fewer choices, clearer navigation, frequent saves',
    maxItemsPerScreen: 5,
    hideSecondaryActions: true,
    useSimpleLanguage: true,
    showProgressIndicators: true,
    showBreadcrumbs: true,
    autoSaveFrequency: 30000, // 30 seconds
    reminderFrequency: 300000, // 5 minutes for incomplete tasks
    highlightFocus: true,
    animationSpeed: 'slow',
    allowMultitasking: false,
  },

  /**
   * Minimal Mode - Extreme simplification
   * For users with significant cognitive challenges
   */
  minimal: {
    name: 'Minimal',
    description: 'One task at a time, maximum guidance',
    maxItemsPerScreen: 3,
    hideSecondaryActions: true,
    useSimpleLanguage: true,
    showProgressIndicators: true,
    showBreadcrumbs: true,
    autoSaveFrequency: 15000, // 15 seconds
    reminderFrequency: 180000, // 3 minutes
    highlightFocus: true,
    animationSpeed: 'slow',
    allowMultitasking: false,
  },
} as const;

export type CognitiveMode = keyof typeof COGNITIVE_MODES;

/**
 * User-specific cognitive preferences
 * Stored in AsyncStorage and applied globally
 */
export interface CognitivePreferences {
  // Mode selection
  mode: CognitiveMode;
  
  // Memory support
  showRecentLocations: boolean; // "You were here last"
  saveScrollPosition: boolean; // Restore scroll position
  rememberFormData: boolean; // Remember partially filled forms
  
  // Attention support
  minimizeDistractions: boolean; // Hide non-essential elements
  singleTaskMode: boolean; // One screen at a time
  disableNotifications: boolean; // No interruptions
  
  // Processing support
  extraTimeForReading: boolean; // Don't auto-advance
  pauseableContent: boolean; // Pause videos/audio
  repeatableInstructions: boolean; // "Show me again" button
  
  // Organization support
  showProgressBars: boolean; // Visual progress
  showStepNumbers: boolean; // "Step 2 of 5"
  showTimeEstimates: boolean; // "Takes about 5 minutes"
  
  // Language support
  useSimpleLanguage: boolean; // Plain language mode
  defineComplexTerms: boolean; // Inline definitions
  showExamples: boolean; // Visual examples
  
  // Visual support
  reduceVisualClutter: boolean; // Minimal UI
  increaseSpacing: boolean; // More whitespace
  useIcons: boolean; // Visual cues
  highlightCurrentItem: boolean; // Show where you are
  
  // Interaction support
  confirmBeforeLeaving: boolean; // Warn about losing work
  undoAvailable: boolean; // Undo last action
  explainActions: boolean; // "What does this do?"
}

/**
 * Default cognitive preferences
 */
export const DEFAULT_COGNITIVE_PREFERENCES: CognitivePreferences = {
  mode: 'standard',
  showRecentLocations: false,
  saveScrollPosition: true,
  rememberFormData: true,
  minimizeDistractions: false,
  singleTaskMode: false,
  disableNotifications: false,
  extraTimeForReading: false,
  pauseableContent: true,
  repeatableInstructions: false,
  showProgressBars: false,
  showStepNumbers: false,
  showTimeEstimates: false,
  useSimpleLanguage: false,
  defineComplexTerms: false,
  showExamples: false,
  reduceVisualClutter: false,
  increaseSpacing: false,
  useIcons: true,
  highlightCurrentItem: false,
  confirmBeforeLeaving: true,
  undoAvailable: true,
  explainActions: false,
};

/**
 * Auto-save intervals based on mode
 */
export const AUTO_SAVE_INTERVALS = {
  disabled: 0,
  frequent: 15000, // 15 seconds
  moderate: 30000, // 30 seconds
  standard: 60000, // 1 minute
  occasional: 300000, // 5 minutes
} as const;

/**
 * Task complexity indicators
 * Help users understand cognitive load of tasks
 */
export interface TaskComplexity {
  level: 'simple' | 'moderate' | 'complex';
  estimatedMinutes: number;
  steps: number;
  requiresDecisions: number;
  requiresReading: 'light' | 'moderate' | 'heavy';
  requiresWriting: boolean;
}

/**
 * Complexity indicators
 */
export const COMPLEXITY_INDICATORS = {
  simple: {
    label: 'Quick & Easy',
    icon: '⚡',
    color: '#4CAF50',
    description: 'Takes 5 minutes or less',
  },
  moderate: {
    label: 'Medium Task',
    icon: '📋',
    color: '#FF9800',
    description: 'Takes 10-15 minutes',
  },
  complex: {
    label: 'Needs Focus',
    icon: '🎯',
    color: '#F44336',
    description: 'Takes 20+ minutes, multiple steps',
  },
} as const;

/**
 * Cognitive load scoring for features
 * Used by Disability Wizard and throughout app
 */
export interface CognitiveLoadScore {
  overall: number; // 0-10, lower is better
  factors: {
    steps: number; // Number of steps required
    decisions: number; // Number of choices to make
    reading: number; // Amount of text to read
    writing: number; // Amount of text to write
    memory: number; // Amount to remember
    attention: number; // Sustained attention required
  };
}

/**
 * Calculate cognitive load score
 */
export function calculateCognitiveLoad(
  steps: number,
  decisions: number,
  reading: 'light' | 'moderate' | 'heavy',
  writing: boolean,
  memory: 'low' | 'medium' | 'high',
  attentionMinutes: number
): CognitiveLoadScore {
  const readingScore = reading === 'light' ? 1 : reading === 'moderate' ? 2 : 3;
  const writingScore = writing ? 2 : 0;
  const memoryScore = memory === 'low' ? 1 : memory === 'medium' ? 2 : 3;
  const attentionScore = Math.min(3, Math.floor(attentionMinutes / 5));

  const overall = Math.min(10, 
    steps * 0.3 + 
    decisions * 0.4 + 
    readingScore * 0.8 + 
    writingScore * 0.8 + 
    memoryScore * 0.6 + 
    attentionScore * 0.5
  );

  return {
    overall,
    factors: {
      steps,
      decisions,
      reading: readingScore,
      writing: writingScore,
      memory: memoryScore,
      attention: attentionScore,
    },
  };
}

/**
 * Cognitive-friendly text simplification rules
 */
export const SIMPLIFICATION_RULES = {
  // Replace complex words with simpler alternatives
  wordReplacements: {
    'utilize': 'use',
    'facilitate': 'help',
    'implement': 'do',
    'additional': 'more',
    'sufficient': 'enough',
    'terminate': 'end',
    'commence': 'start',
    'approximately': 'about',
    'consequently': 'so',
    'nevertheless': 'but',
  },
  
  // Sentence length targets
  maxSentenceLength: 20, // words
  maxParagraphLength: 4, // sentences
  
  // Reading level targets
  targetReadingLevel: 8, // Grade level
};

/**
 * Progress indicator styles
 */
export const PROGRESS_STYLES = {
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    fillColor: '#4CAF50',
  },
  step: {
    size: 32,
    spacing: 12,
    activeColor: '#4CAF50',
    inactiveColor: '#E0E0E0',
    completedColor: '#2196F3',
  },
  circular: {
    size: 60,
    thickness: 6,
    color: '#4CAF50',
  },
};

/**
 * Breadcrumb navigation constants
 */
export const BREADCRUMB_CONFIG = {
  maxVisible: 4, // Show max 4 levels
  separator: ' › ',
  homeName: 'Home',
  backLabel: 'Back',
};

/**
 * Task reminder configuration
 */
export interface TaskReminder {
  taskId: string;
  taskName: string;
  lastInteraction: number;
  reminderInterval: number;
  maxReminders: number;
  reminderCount: number;
}

/**
 * Storage keys for cognitive features
 */
export const COGNITIVE_STORAGE_KEYS = {
  preferences: 'cognitive:preferences:v1',
  lastLocation: 'cognitive:lastLocation:v1',
  scrollPosition: 'cognitive:scrollPosition:v1',
  incompleteTasks: 'cognitive:incompleteTasks:v1',
  formData: 'cognitive:formData:v1',
} as const;

/**
 * Accessibility announcements for cognitive features
 */
export const COGNITIVE_ANNOUNCEMENTS = {
  autoSaved: 'Your work has been automatically saved',
  taskReminder: 'You have an incomplete task: {taskName}',
  progressUpdate: 'You are on step {current} of {total}',
  locationSaved: 'Your place has been saved. You can come back anytime.',
  complexityWarning: 'This task is complex and may take {minutes} minutes',
  focusMode: 'Focus mode enabled. Distractions minimized.',
  simplifiedMode: 'Simplified mode enabled. Showing fewer options.',
};
