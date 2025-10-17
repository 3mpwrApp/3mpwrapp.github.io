/**
 * Phase 6 Tool Registry Extensions
 * Adds new tool categories and metadata for ML-driven features
 * 
 * New Tool Categories:
 * - predictive: ML-powered forecasting tools
 * - adaptive: Tools that learn from user behavior
 * - ml-enhanced: Tools with ML improvements
 * - energy-aware: Tools that respond to energy levels
 */

export type ToolCategory = 
  | 'wellness'
  | 'advocacy'
  | 'community'
  | 'resources'
  | 'predictive'
  | 'adaptive'
  | 'ml-enhanced'
  | 'energy-aware';

export type EnergyOptimal = 'low' | 'medium' | 'high' | 'any';

export interface ToolMetadata {
  /** Tool unique identifier */
  id: string;
  
  /** Human-readable tool name */
  name: string;
  
  /** Tool description */
  description: string;
  
  /** Primary category */
  category: ToolCategory;
  
  /** All applicable categories */
  categories: ToolCategory[];
  
  /** Icon name (Ionicons) */
  icon: string;
  
  /** Whether this tool requires user feedback to improve */
  requiresFeedback?: boolean;
  
  /** Which ML models power this tool */
  mlModels?: string[];
  
  /** Optimal energy level for this tool */
  energyOptimal?: EnergyOptimal;
  
  /** Version of the tool */
  version?: string;
  
  /** Whether tool is in beta */
  isBeta?: boolean;
  
  /** Tags for filtering */
  tags?: string[];
  
  /** Whether tool can be personalized */
  isPersonalizable?: boolean;
  
  /** Accessibility features supported */
  a11yFeatures?: string[];
}

/**
 * Phase 6 Tool Registry
 * Extends existing tools with new metadata and introduces new categories
 */
export const PHASE_6_TOOL_REGISTRY: ToolMetadata[] = [
  // Predictive Tools (Phase 6)
  {
    id: 'energy-forecast',
    name: 'Energy Forecast',
    description: 'AI-powered prediction of your energy levels for the next 24 hours',
    category: 'predictive',
    categories: ['predictive', 'wellness', 'ml-enhanced'],
    icon: 'flash',
    requiresFeedback: true,
    mlModels: ['energy-predictor-v1'],
    energyOptimal: 'any',
    version: '1.0',
    tags: ['ml', 'prediction', 'energy', 'personalized'],
    isPersonalizable: true,
    a11yFeatures: ['high-contrast', 'large-text', 'screen-reader'],
  },
  
  {
    id: 'mood-trend-analyzer',
    name: 'Mood Trend Analyzer',
    description: 'Analyze mood patterns and predict emotional cycles',
    category: 'predictive',
    categories: ['predictive', 'wellness', 'ml-enhanced'],
    icon: 'happy',
    requiresFeedback: true,
    mlModels: ['mood-analyzer-v1'],
    energyOptimal: 'any',
    version: '1.0',
    tags: ['ml', 'mood', 'patterns', 'insights'],
    isPersonalizable: true,
    a11yFeatures: ['screen-reader', 'captions'],
  },
  
  // Adaptive Tools (Phase 6)
  {
    id: 'personalized-suggestion-engine',
    name: 'Smart Suggestions',
    description: 'Get personalized tool recommendations based on your patterns',
    category: 'adaptive',
    categories: ['adaptive', 'ml-enhanced', 'wellness'],
    icon: 'bulb',
    requiresFeedback: true,
    mlModels: ['suggestion-engine-v1'],
    energyOptimal: 'any',
    version: '1.0',
    tags: ['ml', 'recommendations', 'adaptive', 'personalized'],
    isPersonalizable: true,
    a11yFeatures: ['keyboard-navigation', 'screen-reader'],
  },
  
  {
    id: 'activity-optimizer',
    name: 'Activity Optimizer',
    description: 'Adaptive suggestions for activities based on your energy and mood',
    category: 'adaptive',
    categories: ['adaptive', 'ml-enhanced', 'wellness', 'energy-aware'],
    icon: 'checkmark-circle',
    requiresFeedback: true,
    mlModels: ['activity-optimizer-v1'],
    energyOptimal: 'high',
    version: '1.0',
    tags: ['ml', 'activities', 'adaptive', 'energy-aware'],
    isPersonalizable: true,
    a11yFeatures: ['high-contrast', 'large-text'],
  },
  
  // Energy-Aware Tools (Phase 6)
  {
    id: 'energy-level-indicator',
    name: 'Energy Level Indicator',
    description: 'Real-time indicator of current energy level with smart recommendations',
    category: 'energy-aware',
    categories: ['energy-aware', 'wellness'],
    icon: 'battery-charging',
    energyOptimal: 'any',
    version: '1.0',
    tags: ['energy', 'real-time', 'indicator'],
    isPersonalizable: false,
    a11yFeatures: ['high-contrast', 'screen-reader'],
  },
  
  {
    id: 'low-energy-mode',
    name: 'Low Energy Mode',
    description: 'Simplified interface and reduced notifications during low energy periods',
    category: 'energy-aware',
    categories: ['energy-aware', 'wellness'],
    icon: 'power',
    energyOptimal: 'low',
    version: '1.0',
    tags: ['energy', 'accessibility', 'adaptive-ui'],
    isPersonalizable: true,
    a11yFeatures: ['reduced-motion', 'simplified-ui'],
  },
  
  // ML-Enhanced Existing Tools
  {
    id: 'wellness-dashboard',
    name: 'Wellness Dashboard',
    description: 'AI-enhanced dashboard showing wellness insights and recommendations',
    category: 'wellness',
    categories: ['wellness', 'ml-enhanced'],
    icon: 'stats-chart',
    requiresFeedback: true,
    mlModels: ['dashboard-insights-v1'],
    energyOptimal: 'medium',
    version: '1.0',
    tags: ['ml', 'insights', 'dashboard'],
    isPersonalizable: true,
    a11yFeatures: ['keyboard-navigation', 'screen-reader', 'high-contrast'],
  },
  
  {
    id: 'smart-notifications',
    name: 'Smart Notifications',
    description: 'Intelligent notifications delivered at optimal times based on your energy',
    category: 'wellness',
    categories: ['wellness', 'ml-enhanced', 'energy-aware'],
    icon: 'notifications',
    requiresFeedback: false,
    mlModels: ['notification-scheduler-v1'],
    energyOptimal: 'any',
    version: '1.0',
    tags: ['ml', 'notifications', 'energy-aware'],
    isPersonalizable: true,
    a11yFeatures: ['haptic-feedback', 'sound-cues'],
  },
  
  {
    id: 'ai-companion',
    name: 'AI Wellness Companion',
    description: 'Personalized AI assistant that learns your wellness patterns',
    category: 'wellness',
    categories: ['wellness', 'ml-enhanced', 'adaptive'],
    icon: 'chatbubbles',
    requiresFeedback: true,
    mlModels: ['companion-ai-v1', 'nlp-v1'],
    energyOptimal: 'medium',
    version: '1.0',
    tags: ['ml', 'ai', 'companion', 'adaptive'],
    isPersonalizable: true,
    a11yFeatures: ['screen-reader', 'captions', 'voice-input'],
  },
];

/**
 * Tool discovery and filtering utilities
 */
export function getToolsByCategory(category: ToolCategory): ToolMetadata[] {
  return PHASE_6_TOOL_REGISTRY.filter(tool => tool.categories.includes(category));
}

export function getToolsByEnergyLevel(energyLevel: EnergyOptimal): ToolMetadata[] {
  return PHASE_6_TOOL_REGISTRY.filter(
    tool =>
      tool.energyOptimal === 'any' || tool.energyOptimal === energyLevel
  );
}

export function getToolsRequiringFeedback(): ToolMetadata[] {
  return PHASE_6_TOOL_REGISTRY.filter(tool => tool.requiresFeedback);
}

export function getToolsByMLModel(modelName: string): ToolMetadata[] {
  return PHASE_6_TOOL_REGISTRY.filter(tool => tool.mlModels?.includes(modelName));
}

export function getPersonalizableTools(): ToolMetadata[] {
  return PHASE_6_TOOL_REGISTRY.filter(tool => tool.isPersonalizable);
}

export function getToolsByTag(tag: string): ToolMetadata[] {
  return PHASE_6_TOOL_REGISTRY.filter(tool => tool.tags?.includes(tag));
}

export function filterToolsByA11y(a11yFeature: string): ToolMetadata[] {
  return PHASE_6_TOOL_REGISTRY.filter(tool =>
    tool.a11yFeatures?.includes(a11yFeature)
  );
}

export function searchTools(query: string): ToolMetadata[] {
  const lowerQuery = query.toLowerCase();
  return PHASE_6_TOOL_REGISTRY.filter(
    tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get recommended tools based on current state
 */
export function getRecommendedTools(params: {
  currentEnergyLevel?: EnergyOptimal;
  category?: ToolCategory;
  userPreferences?: string[];
}): ToolMetadata[] {
  let tools = [...PHASE_6_TOOL_REGISTRY];
  
  if (params.currentEnergyLevel) {
    tools = tools.filter(
      tool =>
        tool.energyOptimal === 'any' ||
        tool.energyOptimal === params.currentEnergyLevel
    );
  }
  
  if (params.category) {
    tools = tools.filter(tool => tool.categories.includes(params.category!));
  }
  
  if (params.userPreferences?.length) {
    tools = tools.filter(tool =>
      tool.tags?.some(tag => params.userPreferences!.includes(tag))
    );
  }
  
  // Sort by relevance: personalizable first, then feedback-enabled
  return tools.sort((a, b) => {
    if (a.isPersonalizable !== b.isPersonalizable) {
      return a.isPersonalizable ? -1 : 1;
    }
    if (a.requiresFeedback !== b.requiresFeedback) {
      return a.requiresFeedback ? -1 : 1;
    }
    return 0;
  });
}

export default PHASE_6_TOOL_REGISTRY;
