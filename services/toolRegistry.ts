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
  // Advocacy tools
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
  ask_advocate: {
    id: 'ask_advocate', route: '/(tabs)/advocacy/ask', i18nLabelKey: 'homeGuide.tool.ask_advocate', category: 'advocacy',
    icon: 'ask', a11yLabelKey: 'a11y.tool.ask_advocate'
  },
  case_interpreter: {
    id: 'case_interpreter', route: '/(tabs)/advocacy/case-interpreter', i18nLabelKey: 'homeGuide.tool.case_interpreter', category: 'advocacy',
    icon: 'case', a11yLabelKey: 'a11y.tool.case_interpreter'
  },
  gov_navigator: {
    id: 'gov_navigator', route: '/(tabs)/advocacy/gov-navigator', i18nLabelKey: 'homeGuide.tool.gov_navigator', category: 'advocacy',
    icon: 'gov', a11yLabelKey: 'a11y.tool.gov_navigator'
  },
  lawyer_finder: {
    id: 'lawyer_finder', route: '/(tabs)/advocacy/lawyer-finder', i18nLabelKey: 'homeGuide.tool.lawyer_finder', category: 'advocacy',
    icon: 'lawyer', a11yLabelKey: 'a11y.tool.lawyer_finder'
  },
  ally_hub: {
    id: 'ally_hub', route: '/(tabs)/advocacy/ally-hub', i18nLabelKey: 'homeGuide.tool.ally_hub', category: 'advocacy',
    icon: 'ally', a11yLabelKey: 'a11y.tool.ally_hub'
  },
  
  // Wellness tools
  wellness_mood: {
    id: 'wellness_mood', route: '/(tabs)/wellness.mood', i18nLabelKey: 'homeGuide.tool.wellness_mood', category: 'wellness',
    icon: 'mood', a11yLabelKey: 'a11y.tool.wellness_mood'
  },
  wellness_exercise: {
    id: 'wellness_exercise', route: '/(tabs)/wellness/exercise', i18nLabelKey: 'homeGuide.tool.wellness_exercise', category: 'wellness',
    icon: 'exercise', a11yLabelKey: 'a11y.tool.wellness_exercise'
  },
  wellness_selfcare: {
    id: 'wellness_selfcare', route: '/(tabs)/wellness/self-care', i18nLabelKey: 'homeGuide.tool.wellness_selfcare', category: 'wellness',
    icon: 'selfcare', a11yLabelKey: 'a11y.tool.wellness_selfcare'
  },
  wellness_energy: {
    id: 'wellness_energy', route: '/(tabs)/wellness/energy-tracking', i18nLabelKey: 'homeGuide.tool.wellness_energy', category: 'wellness',
    icon: 'energy', a11yLabelKey: 'a11y.tool.wellness_energy'
  },
  
  // Resources tools
  resources_search: {
    id: 'resources_search', route: '/(tabs)/resources', i18nLabelKey: 'homeGuide.tool.resources_search', category: 'resources',
    icon: 'search', a11yLabelKey: 'a11y.tool.resources_search'
  },
  resources_articles: {
    id: 'resources_articles', route: '/(tabs)/resources/articles', i18nLabelKey: 'homeGuide.tool.resources_articles', category: 'resources',
    icon: 'articles', a11yLabelKey: 'a11y.tool.resources_articles'
  },
  resources_faq: {
    id: 'resources_faq', route: '/(tabs)/resources/faq', i18nLabelKey: 'homeGuide.tool.resources_faq', category: 'resources',
    icon: 'faq', a11yLabelKey: 'a11y.tool.resources_faq'
  },
  
  // Research tools (using 'resources' category as research is a subcategory)
  research_trials: {
    id: 'research_trials', route: '/(tabs)/research/trials', i18nLabelKey: 'homeGuide.tool.research_trials', category: 'resources',
    icon: 'research', a11yLabelKey: 'a11y.tool.research_trials'
  },
  research_hub: {
    id: 'research_hub', route: '/(tabs)/research', i18nLabelKey: 'homeGuide.tool.research_hub', category: 'resources',
    icon: 'research', a11yLabelKey: 'a11y.tool.research_hub'
  },
  
  // Community tools (using 'system' category as no community category exists)
  community_testers: {
    id: 'community_testers', route: '/(tabs)/community/testers-chat', i18nLabelKey: 'homeGuide.tool.community_testers', category: 'system',
    icon: 'community', a11yLabelKey: 'a11y.tool.community_testers'
  },
  community_threads: {
    id: 'community_threads', route: '/(tabs)/community/threads', i18nLabelKey: 'homeGuide.tool.community_threads', category: 'system',
    icon: 'threads', a11yLabelKey: 'a11y.tool.community_threads'
  },
  community_chat: {
    id: 'community_chat', route: '/(tabs)/community/chat', i18nLabelKey: 'homeGuide.tool.community_chat', category: 'system',
    icon: 'chat', a11yLabelKey: 'a11y.tool.community_chat'
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
