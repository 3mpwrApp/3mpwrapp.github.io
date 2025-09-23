// Central registry for tool metadata used across personalization & navigation
export interface ToolMeta {
  id: string;
  route: string;
  i18nLabelKey: string; // e.g. homeGuide.tool.coach
  category: 'advocacy' | 'wellness' | 'resources' | 'system';
}

const REGISTRY: Record<string, ToolMeta> = {
  coach: { id: 'coach', route: '/(tabs)/advocacy/self-advocacy-coach', i18nLabelKey: 'homeGuide.tool.coach', category: 'advocacy' },
  translator: { id: 'translator', route: '/(tabs)/advocacy/ai-advocate-translator', i18nLabelKey: 'homeGuide.tool.translator', category: 'advocacy' },
  policy_simplifier: { id: 'policy_simplifier', route: '/(tabs)/advocacy/policy-simple', i18nLabelKey: 'homeGuide.tool.policy_simplifier', category: 'advocacy' },
  wellness_mood: { id: 'wellness_mood', route: '/(tabs)/wellness.mood', i18nLabelKey: 'homeGuide.tool.wellness_mood', category: 'wellness' },
  resources_search: { id: 'resources_search', route: '/(tabs)/resources', i18nLabelKey: 'homeGuide.tool.resources_search', category: 'resources' },
};

export function getToolMeta(id: string): ToolMeta | undefined { return REGISTRY[id]; }
export function resolveToolRoute(id: string): string { return REGISTRY[id]?.route || '/'; }
export function listToolMeta(): ToolMeta[] { return Object.values(REGISTRY); }
