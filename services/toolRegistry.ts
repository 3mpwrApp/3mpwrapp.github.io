// Central registry for tool metadata used across personalization & navigation
export interface ToolMeta {
  id: string;
  route: string;
  i18nLabelKey: string; // e.g. homeGuide.tool.coach
  category: 'advocacy' | 'wellness' | 'resources' | 'system';
  icon: string; // name for future icon component lookup
  a11yLabelKey: string; // i18n key for accessibility label
  featureFlag?: string; // optional flag controlling visibility
}

const REGISTRY: Record<string, ToolMeta> = {
  coach: {
    id: 'coach', route: '/(tabs)/advocacy/self-advocacy-coach', i18nLabelKey: 'homeGuide.tool.coach', category: 'advocacy',
    icon: 'coach', a11yLabelKey: 'a11y.tool.coach'
  },
  translator: {
    id: 'translator', route: '/(tabs)/advocacy/ai-advocate-translator', i18nLabelKey: 'homeGuide.tool.translator', category: 'advocacy',
    icon: 'translate', a11yLabelKey: 'a11y.tool.translator'
  },
  policy_simplifier: {
    id: 'policy_simplifier', route: '/(tabs)/advocacy/policy-simple', i18nLabelKey: 'homeGuide.tool.policy_simplifier', category: 'advocacy',
    icon: 'policy', a11yLabelKey: 'a11y.tool.policy_simplifier'
  },
  wellness_mood: {
    id: 'wellness_mood', route: '/(tabs)/wellness.mood', i18nLabelKey: 'homeGuide.tool.wellness_mood', category: 'wellness',
    icon: 'mood', a11yLabelKey: 'a11y.tool.wellness_mood'
  },
  resources_search: {
    id: 'resources_search', route: '/(tabs)/resources', i18nLabelKey: 'homeGuide.tool.resources_search', category: 'resources',
    icon: 'search', a11yLabelKey: 'a11y.tool.resources_search'
  },
};

export function getToolMeta(id: string): ToolMeta | undefined { return REGISTRY[id]; }
export function resolveToolRoute(id: string): string { return REGISTRY[id]?.route || '/'; }
export function listToolMeta(): ToolMeta[] { return Object.values(REGISTRY); }
export function filterToolsByFlags(enabled: Set<string> | undefined): ToolMeta[] {
  const all = listToolMeta();
  if (!enabled) return all.filter(t=> !t.featureFlag);
  return all.filter(t => !t.featureFlag || enabled.has(t.featureFlag));
}
