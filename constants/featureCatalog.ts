/**
 * Feature Catalog
 * 
 * Defines which features are visible in each complexity mode:
 * - Simple: 5 core features (essential tools for users with cognitive disabilities, brain fog)
 * - Standard: 20 commonly-used features (default mode for most users)
 * - Power User: All 150+ features (advanced users, advocates, professionals)
 */

export type FeatureId = string;
export type ComplexityTier = 'simple' | 'standard' | 'power_user';

/**
 * SIMPLE MODE - 5 Core Features
 * For users with cognitive disabilities, brain fog, or during crisis/bad days
 */
export const SIMPLE_MODE_FEATURES: FeatureId[] = [
  // 1. Evidence Locker - Critical for legal cases
  'evidence-locker',
  
  // 2. Letter Wizard (Top 3 templates only)
  'letter-wizard-basic',
  
  // 3. Crisis Resources - SOS button + crisis directory
  'crisis-resources',
  'sos-button',
  
  // 4. Basic Mood Tracking
  'mood-tracker-basic',
  
  // 5. Community Beta Chat - Peer support
  'community-beta-chat',
];

/**
 * STANDARD MODE - 20 Features (includes all Simple + 15 more)
 * Default mode for most users
 */
export const STANDARD_MODE_FEATURES: FeatureId[] = [
  ...SIMPLE_MODE_FEATURES,
  
  // Advocacy Tools
  'ai-advocate-translator',
  'appeal-command-center',
  'master-tracker-hub',
  'deadlines',
  'denial-decoder',
  
  // Wellness
  'energy-mood-hub',
  'wellness-tracking',
  'pacing-partner',
  
  // Documentation
  'accommodation-request',
  'voice-notes',
  
  // Community & Support
  'support-directory',
  'campaigns',
  'events',
  
  // Profile & Settings
  'profile-settings',
  'self-care-library',
];

/**
 * POWER USER MODE - All Features
 * Shows everything, no filtering
 */
export const isPowerUserMode = (mode: ComplexityTier): boolean => mode === 'power_user';

/**
 * Check if a feature is visible in the current mode
 */
export function isFeatureVisibleInMode(featureId: FeatureId, mode: ComplexityTier): boolean {
  // Power users see everything
  if (mode === 'power_user') return true;
  
  // Standard mode users see standard features
  if (mode === 'standard') {
    return STANDARD_MODE_FEATURES.includes(featureId);
  }
  
  // Simple mode users see only simple features
  if (mode === 'simple') {
    return SIMPLE_MODE_FEATURES.includes(featureId);
  }
  
  return false;
}

/**
 * Tab-level visibility (which tabs show in main navigation)
 */
export const TAB_VISIBILITY: Record<string, ComplexityTier> = {
  // Always visible
  'home': 'simple',
  'resources': 'simple', // But content filtered
  'wellness': 'simple', // But content filtered
  
  // Standard and above
  'advocacy': 'standard',
  'campaigns': 'standard',
  'community': 'standard',
  'research': 'standard',
  
  // Power user only
  'settings': 'standard', // Settings visible to all who need to change modes
  'profile': 'standard',
  'whats-new': 'power_user',
};

/**
 * Feature categories for organization
 */
export const FEATURE_CATEGORIES = {
  ADVOCACY: [
    'evidence-locker',
    'appeal-command-center',
    'master-tracker-hub',
    'letter-wizard',
    'deadlines',
    'denial-decoder',
    'prepare-appeal',
    'evidence-checklist',
    'ai-advocate-translator',
    'case-timeline',
    'precedent-finder',
  ],
  
  WELLNESS: [
    'energy-mood-hub',
    'health-tracker',
    'mental-wellness-toolkit',
    'movement-rehab-hub',
    'mood-tracker',
    'wellness-tracking',
    'pacing-partner',
    'sleep-tracker',
    'symptom-tracker',
    'pain-forecast',
  ],
  
  COMMUNITY: [
    'community-beta-chat',
    'support-directory',
    'campaigns',
    'events',
    'allyship-playbook',
  ],
  
  CRISIS: [
    'sos-button',
    'crisis-resources',
    'safe-landing',
    'emotional-first-aid',
  ],
  
  DOCUMENTATION: [
    'letter-wizard',
    'accommodation-request',
    'voice-notes',
    'doctor-visit-prep',
    'accessibility-log',
  ],
} as const;

/**
 * Get user-friendly feature count for mode
 */
export function getFeatureCount(mode: ComplexityTier): number | string {
  if (mode === 'simple') return SIMPLE_MODE_FEATURES.length;
  if (mode === 'standard') return STANDARD_MODE_FEATURES.length;
  return '150+';
}

/**
 * Get description for mode
 */
export function getModeDescription(mode: ComplexityTier): string {
  switch (mode) {
    case 'simple':
      return 'Essential tools only. Perfect for bad days, brain fog, or when overwhelmed.';
    case 'standard':
      return 'Most commonly-used features. Great balance for daily advocacy work.';
    case 'power_user':
      return 'All features unlocked. For advanced users and professionals.';
    default:
      return '';
  }
}

/**
 * Simple Mode Welcome Message by Tab
 */
export const SIMPLE_MODE_WELCOME_MESSAGES: Record<string, { available: string[]; hidden: number }> = {
  resources: {
    available: ['Evidence Locker', 'Letter Wizard (Basic)', 'Crisis Resources'],
    hidden: 35,
  },
  wellness: {
    available: ['Mood Tracker', 'Energy Hub (Basic)'],
    hidden: 20,
  },
  advocacy: {
    available: ['AI Translator', 'Evidence Locker'],
    hidden: 25,
  },
  community: {
    available: ['Beta Chat', 'Crisis Resources'],
    hidden: 15,
  },
  campaigns: {
    available: ['Featured Campaigns Only'],
    hidden: 30,
  },
};
