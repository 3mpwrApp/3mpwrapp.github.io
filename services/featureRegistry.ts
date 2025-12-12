/**
 * Feature Registry - Central definition of all features with complexity levels
 * 
 * This provides a single source of truth for:
 * - Which features exist
 * - What complexity level each belongs to
 * - Feature metadata (icon, description, route)
 */

export type FeatureLevel = 'simple' | 'standard' | 'power_user';

export type FeatureCategory = 'wellness' | 'resources' | 'advocacy' | 'community' | 'settings';

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  level: FeatureLevel;
  icon: string;
  route: string;
  tab: FeatureCategory;
  tags?: string[];
  badge?: 'new' | 'beta' | 'coming';
}

// ============================================
// SIMPLE MODE FEATURES (5 core features)
// Always visible in all modes
// ============================================
export const SIMPLE_FEATURES: FeatureDefinition[] = [
  {
    id: 'evidence-locker',
    name: 'Evidence Locker',
    description: 'Secure storage for medical records and documentation',
    level: 'simple',
    icon: '🔐',
    route: '/resources/evidence-locker',
    tab: 'resources',
  },
  {
    id: 'letter-wizard',
    name: 'Letter Wizard',
    description: 'Generate professional advocacy letters',
    level: 'simple',
    icon: '✍️',
    route: '/advocacy/letters',
    tab: 'advocacy',
  },
  {
    id: 'crisis-resources',
    name: 'Crisis Resources',
    description: 'Emergency contacts and support resources',
    level: 'simple',
    icon: '🆘',
    route: '/resources/crisis',
    tab: 'resources',
  },
  {
    id: 'mood-tracker',
    name: 'Mood Tracker',
    description: 'Track your daily mood and emotions',
    level: 'simple',
    icon: '😊',
    route: '/wellness/mood',
    tab: 'wellness',
  },
  {
    id: 'community-chat',
    name: 'Community Support',
    description: 'Connect with others who understand',
    level: 'simple',
    icon: '💬',
    route: '/community',
    tab: 'community',
  },
];

// ============================================
// STANDARD MODE FEATURES (adds 15 features)
// Visible in Standard and Power User modes
// ============================================
export const STANDARD_FEATURES: FeatureDefinition[] = [
  // Advocacy
  {
    id: 'ai-translator',
    name: 'AI Advocate Translator',
    description: 'Translate bureaucratic language to plain English',
    level: 'standard',
    icon: '🤖',
    route: '/advocacy/translator',
    tab: 'advocacy',
  },
  {
    id: 'ai-advocacy-suite',
    name: 'AI Advocacy Suite',
    description: 'Complete AI-powered advocacy tools',
    level: 'standard',
    icon: '⚡',
    route: '/advocacy/ai-advocacy-suite',
    tab: 'advocacy',
    badge: 'new',
  },
  
  // Wellness
  {
    id: 'energy-tracker',
    name: 'Energy Tracker',
    description: 'Monitor your energy levels with spoon theory',
    level: 'standard',
    icon: '🥄',
    route: '/wellness/energy',
    tab: 'wellness',
  },
  {
    id: 'pacing-tools',
    name: 'Pacing Tools',
    description: 'Manage activity to prevent crashes',
    level: 'standard',
    icon: '⏱️',
    route: '/wellness/pacing',
    tab: 'wellness',
  },
  {
    id: 'symptom-tracker',
    name: 'Symptom Tracker',
    description: 'Log and visualize symptoms over time',
    level: 'standard',
    icon: '📊',
    route: '/wellness/symptom-tracker',
    tab: 'wellness',
    badge: 'beta',
  },
  {
    id: 'energy-command-center',
    name: 'Energy Command Center',
    description: 'Complete energy, pacing, and mood management',
    level: 'standard',
    icon: '🎛️',
    route: '/wellness/energy-command-center',
    tab: 'wellness',
    badge: 'new',
  },
  
  // Resources
  {
    id: 'deadlines',
    name: 'Deadline Tracker',
    description: 'Never miss an important deadline',
    level: 'standard',
    icon: '📅',
    route: '/resources/deadlines',
    tab: 'resources',
  },
  {
    id: 'support-directory',
    name: 'Support Directory',
    description: 'Find advocates, lawyers, and support services',
    level: 'standard',
    icon: '📖',
    route: '/resources/directory',
    tab: 'resources',
  },
  {
    id: 'case-tracker-pro',
    name: 'Case Tracker Pro',
    description: 'Complete case and deadline management',
    level: 'standard',
    icon: '📋',
    route: '/resources/case-tracker-pro',
    tab: 'resources',
    badge: 'new',
  },
  
  // Community
  {
    id: 'campaigns',
    name: 'Campaigns',
    description: 'Join advocacy campaigns',
    level: 'standard',
    icon: '📣',
    route: '/campaigns',
    tab: 'community',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Community events and meetups',
    level: 'standard',
    icon: '🗓️',
    route: '/events',
    tab: 'community',
  },
  
  // Settings
  {
    id: 'profile',
    name: 'Profile Settings',
    description: 'Manage your account and preferences',
    level: 'standard',
    icon: '👤',
    route: '/settings/profile',
    tab: 'settings',
  },
];

// ============================================
// POWER USER FEATURES (adds 130+ features)
// Only visible in Power User mode
// ============================================
export const POWER_USER_FEATURES: FeatureDefinition[] = [
  // Power Tools (consolidated features)
  {
    id: 'health-tracker-pro',
    name: 'Health Tracker Pro',
    description: 'Complete symptom and health tracking',
    level: 'power_user',
    icon: '🏥',
    route: '/wellness/health-tracker-pro',
    tab: 'wellness',
    badge: 'new',
  },
  {
    id: 'health-management-hub',
    name: 'Health Management Hub',
    description: 'Medications, doctors, and health management',
    level: 'power_user',
    icon: '💊',
    route: '/resources/health-management-hub',
    tab: 'resources',
    badge: 'new',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    description: 'Rights, laws, and advocacy resources',
    level: 'power_user',
    icon: '📚',
    route: '/resources/knowledge-base',
    tab: 'resources',
    badge: 'new',
  },
  {
    id: 'document-factory',
    name: 'Document Factory',
    description: 'All letter templates and document generators',
    level: 'power_user',
    icon: '📝',
    route: '/resources/document-factory',
    tab: 'resources',
    badge: 'new',
  },
  {
    id: 'legal-action-hub',
    name: 'Legal Action Hub',
    description: 'Legal tools, complaints, and accountability',
    level: 'power_user',
    icon: '⚖️',
    route: '/advocacy/legal-action-hub',
    tab: 'advocacy',
    badge: 'new',
  },
  {
    id: 'evidence-command-center',
    name: 'Evidence Command Center',
    description: 'Advanced evidence management and timeline',
    level: 'power_user',
    icon: '🗂️',
    route: '/advocacy/evidence-command-center',
    tab: 'advocacy',
    badge: 'new',
  },
  {
    id: 'ally-support-network',
    name: 'Ally & Support Network',
    description: 'Directory, ratings, and support network',
    level: 'power_user',
    icon: '🤝',
    route: '/advocacy/ally-support-network',
    tab: 'advocacy',
    badge: 'new',
  },
  
  // Advanced Wellness
  {
    id: 'movement-power-tool',
    name: 'Movement Hub',
    description: 'Adaptive exercise and movement tools',
    level: 'power_user',
    icon: '🏃',
    route: '/wellness/movement-power-tool',
    tab: 'wellness',
    badge: 'new',
  },
  {
    id: 'mental-wellness-toolkit',
    name: 'Mental Wellness Toolkit',
    description: 'CBT, DBT, and mental health tools',
    level: 'power_user',
    icon: '🧠',
    route: '/wellness/mental-wellness-toolkit',
    tab: 'wellness',
    badge: 'new',
  },
  {
    id: 'ai-companion',
    name: 'AI Grounding Companion',
    description: 'Supportive AI for difficult moments',
    level: 'power_user',
    icon: '🤗',
    route: '/wellness/ai-companion',
    tab: 'wellness',
    badge: 'beta',
  },
  
  // Advanced Advocacy
  {
    id: 'negotiation-coach',
    name: 'Negotiation Coach',
    description: 'AI-powered negotiation strategies',
    level: 'power_user',
    icon: '🎯',
    route: '/advocacy/negotiation',
    tab: 'advocacy',
    badge: 'beta',
  },
  {
    id: 'self-advocacy-coach',
    name: 'Self-Advocacy Coach',
    description: 'Build your advocacy skills',
    level: 'power_user',
    icon: '💪',
    route: '/advocacy/self-advocacy',
    tab: 'advocacy',
  },
  
  // Developer/Admin
  {
    id: 'admin-panel',
    name: 'Admin Panel',
    description: 'Admin tools and A/B testing',
    level: 'power_user',
    icon: '⚙️',
    route: '/settings/admin',
    tab: 'settings',
  },
];

// ============================================
// COMBINED REGISTRY
// ============================================
export const ALL_FEATURES: FeatureDefinition[] = [
  ...SIMPLE_FEATURES,
  ...STANDARD_FEATURES,
  ...POWER_USER_FEATURES,
];

// Helper to get features by level
export function getFeaturesByLevel(level: FeatureLevel): FeatureDefinition[] {
  switch (level) {
    case 'simple':
      return SIMPLE_FEATURES;
    case 'standard':
      return [...SIMPLE_FEATURES, ...STANDARD_FEATURES];
    case 'power_user':
      return ALL_FEATURES;
    default:
      return SIMPLE_FEATURES;
  }
}

// Helper to get features by tab
export function getFeaturesByTab(tab: FeatureDefinition['tab'], level: FeatureLevel): FeatureDefinition[] {
  return getFeaturesByLevel(level).filter(f => f.tab === tab);
}

// Helper to check if a feature is visible at a given level
export function isFeatureVisibleAtLevel(featureId: string, level: FeatureLevel): boolean {
  const feature = ALL_FEATURES.find(f => f.id === featureId);
  if (!feature) return false;
  
  const visibleFeatures = getFeaturesByLevel(level);
  return visibleFeatures.some(f => f.id === featureId);
}

// Feature counts by mode
export const FEATURE_COUNTS = {
  simple: SIMPLE_FEATURES.length,
  standard: SIMPLE_FEATURES.length + STANDARD_FEATURES.length,
  power_user: ALL_FEATURES.length,
} as const;

/**
 * Get feature statistics for a given complexity level
 */
export function getFeatureStats(level: FeatureLevel) {
  const visibleFeatures = getFeaturesByLevel(level);
  const totalFeatures = ALL_FEATURES.length;
  
  // Count by category
  const byCategory: Record<FeatureCategory, number> = {
    wellness: 0,
    resources: 0,
    advocacy: 0,
    community: 0,
    settings: 0,
  };
  
  for (const feature of visibleFeatures) {
    byCategory[feature.tab]++;
  }
  
  return {
    visible: visibleFeatures.length,
    total: totalFeatures,
    hidden: totalFeatures - visibleFeatures.length,
    byCategory,
    percentVisible: Math.round((visibleFeatures.length / totalFeatures) * 100),
  };
}
