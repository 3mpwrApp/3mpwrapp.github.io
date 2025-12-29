/**
 * Feature Catalog - Crisis-First Design
 *
 * Defines which features are visible in each complexity mode:
 * - Simple: 5 essential tools (Crisis-Ready - for immediate needs)
 * - Standard: 15 tools (Advocacy-Ready - for ongoing case building)
 * - Power User: All 150+ features (Full Power - advanced users)
 */

export type FeatureId = string;
export type ComplexityTier = 'simple' | 'standard' | 'power_user';

/**
 * SIMPLE MODE - 5 Essential Tools (Crisis-Ready)
 *
 * "I just got denied and need help NOW"
 *
 * For users in crisis, with brain fog, or who need focused tools without overwhelm.
 * These are the absolute core tools needed when facing an immediate challenge.
 */
export const SIMPLE_MODE_FEATURES: FeatureId[] = [
  // 1. Evidence Command Center - Collect and organize evidence fast
  'evidence-locker',
  'evidence-command-center',

  // 2. Letter Wizard - Generate letters from evidence
  'letter-wizard',
  'letter-wizard-basic',

  // 3. Pacing Partner - Energy management for advocacy work
  'pacing-partner',
  'energy-mood-hub',

  // 4. Quick Search - Find resources fast
  'quick-search',
  'resource-search',

  // 5. Crisis Resources - 211, hotlines, emergency info
  'crisis-resources',
  'sos-button',
  '211-finder',
  'crisis-hotlines',
];

/**
 * STANDARD MODE - 15 Tools (Advocacy-Ready)
 *
 * "I'm building my case over time"
 *
 * Includes all Simple tools PLUS tools for ongoing advocacy, tracking, and community.
 * Default mode for most users - balances power with usability.
 */
export const STANDARD_MODE_FEATURES: FeatureId[] = [
  ...SIMPLE_MODE_FEATURES,

  // Health & Wellness Tracking
  'health-tracker-pro',
  'unified-health-hub',
  'symptom-tracker',

  // Deadlines & Case Management
  'deadlines',
  'deadlines-manager',
  'master-tracker-hub',

  // Community Evidence (from collective task)
  'collective-evidence-dashboard',
  'community-evidence',

  // Advocacy & Support
  'advocacy-finder',
  'advocate-directory',
  'ai-advocate-translator',

  // Campaigns & Events
  'campaigns',
  'events',
  'community-campaigns',

  // Community & Forums
  'community-beta-chat',
  'community-forums',
  'peer-support',

  // Bookmarks & Quick Access
  'bookmarks',
  'saved-resources',

  // Voice Notes (for accessibility)
  'voice-notes',
  'audio-notes',

  // Support Directory
  'support-directory',
  'resource-directory',
];

/**
 * ADVANCED MODE FEATURES (Power User Only)
 *
 * "I want all the tools, I know what I'm doing"
 *
 * These features are ONLY visible in Power User mode.
 * Power users also see all Simple + Standard features.
 */
export const ADVANCED_MODE_FEATURES: FeatureId[] = [
  // AI & Automation
  'ai-assistant',
  'ai-companion',
  'ai-advocate-pro',

  // Advanced Security
  'advanced-security-settings',
  'encryption-settings',
  'security-audit',

  // BYOC (Bring Your Own Cloud)
  'byoc-configuration',
  'webdav-sync',
  'gdrive-sync',

  // Jurisdiction-specific forms
  'jurisdiction-forms',
  'state-specific-templates',
  'legal-automation',

  // Advanced wellness (for those who want them)
  'mental-wellness-toolkit',
  'movement-rehab-hub',
  'work-balance-ai',
  'functional-capacity',
  'trigger-detector',
  'harm-reduction',
  'grief-support',
  'adaptive-meditation',
  'sleep-reframe',
  'cbt-mini-games',
  'dbt-tools',
  'opposite-action',
  'radical-acceptance',
  'distress-tolerance',
  'belief-meter',

  // Advanced tracking
  'pain-forecast',
  'sleep-energy-tracker',
  'daily-planner',
  'exercise-hub',
  'reflections-calendar',
  'rehab-games',
  'nutrition-guides',
  'dreams-journal',

  // Developer & Admin
  'admin-panel',
  'feature-flags',
  'analytics-dashboard',
  'whats-new',
];

/**
 * POWER USER MODE - All Features
 * Shows everything, no filtering
 */
export const isPowerUserMode = (mode: ComplexityTier): boolean => mode === 'power_user';

/**
 * Get all features for a given mode (for display purposes)
 */
export function getFeaturesForMode(mode: ComplexityTier): FeatureId[] {
  if (mode === 'simple') return SIMPLE_MODE_FEATURES;
  if (mode === 'standard') return STANDARD_MODE_FEATURES;
  // Power user sees everything
  return [...STANDARD_MODE_FEATURES, ...ADVANCED_MODE_FEATURES];
}

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
    'evidence-command-center',
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
    'health-tracker-pro',
    'unified-health-hub',
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
    'community-forums',
    'support-directory',
    'campaigns',
    'events',
    'allyship-playbook',
    'collective-evidence-dashboard',
  ],

  CRISIS: [
    'sos-button',
    'crisis-resources',
    '211-finder',
    'crisis-hotlines',
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
  if (mode === 'simple') return 5;
  if (mode === 'standard') return 15;
  return '150+';
}

/**
 * Get description for mode
 */
export function getModeDescription(mode: ComplexityTier): string {
  switch (mode) {
    case 'simple':
      return '5 essential tools. Fast, focused, no overwhelm.';
    case 'standard':
      return '15 power tools for ongoing advocacy and case building.';
    case 'power_user':
      return 'Every feature. Full control, maximum power.';
    default:
      return '';
  }
}

/**
 * Get tagline for mode
 */
export function getModeTagline(mode: ComplexityTier): string {
  switch (mode) {
    case 'simple':
      return 'Crisis-Ready';
    case 'standard':
      return 'Advocacy-Ready';
    case 'power_user':
      return 'Full Power';
    default:
      return '';
  }
}

/**
 * Get best-for description for mode
 */
export function getModeBestFor(mode: ComplexityTier): string {
  switch (mode) {
    case 'simple':
      return 'I just got denied and need help NOW';
    case 'standard':
      return 'I\'m building my case over time';
    case 'power_user':
      return 'I want all the tools, I know what I\'m doing';
    default:
      return '';
  }
}

/**
 * Get feature list summary for mode (for display in mode selector)
 */
export function getModeFeatureSummary(mode: ComplexityTier): string[] {
  switch (mode) {
    case 'simple':
      return [
        'Evidence Command Center',
        'Letter Wizard',
        'Pacing Partner',
        'Quick Search',
        'Crisis Resources',
      ];
    case 'standard':
      return [
        'All Simple tools, plus:',
        'Health Tracker Pro',
        'Deadlines Manager',
        'Collective Evidence Dashboard',
        'Advocacy Finder',
        'Campaigns & Events',
        'Community Forums',
        'Bookmarks',
        'Voice Notes',
        'Support Directory',
      ];
    case 'power_user':
      return [
        'All Standard tools, plus:',
        'AI Assistant',
        'Master Tracker Hub',
        'Advanced Security',
        'BYOC Configuration',
        'Jurisdiction-specific forms',
        'Legal automation tools',
        'All wellness features',
        'Developer tools',
      ];
    default:
      return [];
  }
}

/**
 * Simple Mode Welcome Message by Tab
 */
export const SIMPLE_MODE_WELCOME_MESSAGES: Record<string, { available: string[]; hidden: number }> = {
  resources: {
    available: ['Evidence Command Center', 'Letter Wizard', 'Crisis Resources', 'Quick Search'],
    hidden: 35,
  },
  wellness: {
    available: ['Pacing Partner', 'Energy & Mood Hub'],
    hidden: 20,
  },
  advocacy: {
    available: ['Evidence Command Center', 'Letter Wizard'],
    hidden: 25,
  },
  community: {
    available: ['Crisis Resources'],
    hidden: 15,
  },
  campaigns: {
    available: [],
    hidden: 30,
  },
};
