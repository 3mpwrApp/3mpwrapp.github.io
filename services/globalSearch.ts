/**
 * Global Search Service
 * 
 * Provides unified search across all app features with smart recommendations
 */

import type { Href } from 'expo-router';
import { useMemo, useState } from 'react';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: SearchCategory;
  route: Href;
  icon: string;
  keywords: string[];
  relevanceScore?: number;
}

export type SearchCategory = 
  | 'wellness'
  | 'resources'
  | 'advocacy'
  | 'community'
  | 'campaigns'
  | 'events'
  | 'research'
  | 'settings'
  | 'tools';

// Complete index of searchable content
const SEARCH_INDEX: SearchResult[] = [
  // Wellness Features
  {
    id: 'wellness-micro-movement',
    title: 'Micro-Movements Coach',
    description: 'Gentle, chair-friendly movement ideas',
    category: 'wellness',
    route: '/wellness/micro-movement' as Href,
    icon: '🏃',
    keywords: ['movement', 'exercise', 'gentle', 'chair', 'micro', 'mobility', 'stretching'],
  },
  {
    id: 'wellness-cbt',
    title: 'CBT Virtual Coach',
    description: 'Reframe thoughts with evidence-based cognitive behavioral therapy',
    category: 'wellness',
    route: '/wellness/cbt-coach' as Href,
    icon: '🧠',
    keywords: ['cbt', 'cognitive', 'therapy', 'thoughts', 'mental', 'anxiety', 'depression'],
  },
  {
    id: 'wellness-mood',
    title: 'Mood Tracker',
    description: 'Log and track your mood patterns over time',
    category: 'wellness',
    route: '/(tabs)/wellness.mood' as Href,
    icon: '🫀',
    keywords: ['mood', 'feelings', 'emotions', 'tracking', 'mental health'],
  },
  {
    id: 'wellness-symptom-tracker',
    title: 'Symptom & Pain Tracker',
    description: 'Log symptoms and pain trends',
    category: 'wellness',
    route: '/wellness/symptom-tracker' as Href,
    icon: '📊',
    keywords: ['pain', 'symptoms', 'tracking', 'chronic', 'health', 'monitor'],
  },
  {
    id: 'wellness-daily-planner',
    title: 'Adaptive Daily Planner',
    description: 'Plan tasks with your energy in mind',
    category: 'wellness',
    route: '/wellness/daily-planner' as Href,
    icon: '📅',
    keywords: ['planner', 'schedule', 'energy', 'tasks', 'daily', 'organize'],
  },
  {
    id: 'wellness-pacing',
    title: 'Pacing Partner',
    description: 'Right-size activities to avoid crashes',
    category: 'wellness',
    route: '/wellness/pacing-partner' as Href,
    icon: '⚖️',
    keywords: ['pacing', 'energy', 'balance', 'avoid crash', 'manage'],
  },
  {
    id: 'wellness-sleep',
    title: 'Sleep & Energy Tracker',
    description: 'Track rest, energy, and patterns',
    category: 'wellness',
    route: '/wellness/sleep-energy-tracker' as Href,
    icon: '😴',
    keywords: ['sleep', 'rest', 'energy', 'fatigue', 'tracking'],
  },
  {
    id: 'wellness-meditation',
    title: 'Adaptive Meditation',
    description: 'Meditations tuned to your state',
    category: 'wellness',
    route: '/wellness/adaptive-meditation' as Href,
    icon: '🧘',
    keywords: ['meditation', 'mindfulness', 'calm', 'relaxation', 'breathing'],
  },
  {
    id: 'wellness-dbt',
    title: 'DBT Skill Matcher',
    description: 'Instant skill suggestions for current emotion',
    category: 'wellness',
    route: '/wellness/dbt' as Href,
    icon: '🎯',
    keywords: ['dbt', 'dialectical', 'therapy', 'emotion', 'skills', 'coping'],
  },
  {
    id: 'wellness-self-care',
    title: 'Self-Care Library',
    description: 'Curated self-care practices',
    category: 'wellness',
    route: '/wellness/self-care-library' as Href,
    icon: '🛁',
    keywords: ['self-care', 'self care', 'wellness', 'relaxation', 'comfort'],
  },

  // Resources
  {
    id: 'resources-hub',
    title: 'Resources Hub',
    description: 'Access tools, letters, and evidence resources',
    category: 'resources',
    route: '/(tabs)/resources' as Href,
    icon: '💼',
    keywords: ['resources', 'tools', 'help', 'support', 'documents'],
  },
  {
    id: 'resources-letter-builder',
    title: 'Letter Builder',
    description: 'Create professional letters for disability claims',
    category: 'resources',
    route: '/resources/letter-builder' as Href,
    icon: '📝',
    keywords: ['letter', 'write', 'appeal', 'claim', 'document'],
  },
  {
    id: 'resources-evidence-locker',
    title: 'Evidence Locker',
    description: 'Securely store your medical evidence',
    category: 'resources',
    route: '/resources/evidence-locker' as Href,
    icon: '🔒',
    keywords: ['evidence', 'documents', 'medical', 'records', 'storage', 'secure'],
  },

  // Advocacy
  {
    id: 'advocacy-ask',
    title: 'Ask an Advocate',
    description: 'Get help from experienced advocates',
    category: 'advocacy',
    route: '/(tabs)/advocacy/ask' as Href,
    icon: '💬',
    keywords: ['ask', 'help', 'advocate', 'question', 'support', 'advice'],
  },
  {
    id: 'advocacy-lawyer-finder',
    title: 'Lawyer & Advocate Finder',
    description: 'Find legal representation for your case',
    category: 'advocacy',
    route: '/(tabs)/advocacy/lawyer-finder' as Href,
    icon: '⚖️',
    keywords: ['lawyer', 'attorney', 'legal', 'representation', 'advocate', 'find'],
  },
  {
    id: 'advocacy-rep-tracker',
    title: 'Rep Tracker',
    description: 'Find and contact your representatives',
    category: 'advocacy',
    route: '/advocacy/rep-tracker' as Href,
    icon: '🗳️',
    keywords: ['representative', 'mp', 'mpp', 'government', 'politician', 'contact'],
  },
  {
    id: 'advocacy-accountability',
    title: 'Accountability Network',
    description: 'Search and review employers, insurers, and providers',
    category: 'advocacy',
    route: '/advocacy/accountability-network' as Href,
    icon: '🔍',
    keywords: ['accountability', 'review', 'employer', 'insurer', 'provider', 'rating'],
  },
  {
    id: 'advocacy-assistant',
    title: 'Assistant Hub',
    description: 'AI-powered advocacy assistance',
    category: 'advocacy',
    route: '/(tabs)/advocacy/assistant-hub' as Href,
    icon: '🤖',
    keywords: ['ai', 'assistant', 'help', 'automated', 'smart'],
  },

  // Community
  {
    id: 'community-channels',
    title: 'Community Channels',
    description: 'Join conversations and connect with peers',
    category: 'community',
    route: '/(tabs)/community' as Href,
    icon: '👥',
    keywords: ['community', 'chat', 'forum', 'discussion', 'peer', 'support'],
  },
  {
    id: 'community-mutual-aid',
    title: 'Mutual Aid Network',
    description: 'Give and receive community support',
    category: 'community',
    route: '/(tabs)/community/mutual-aid' as Href,
    icon: '🤝',
    keywords: ['mutual aid', 'help', 'support', 'give', 'receive', 'community'],
  },
  {
    id: 'community-media-studio',
    title: 'Media Studio',
    description: 'Create and share memes, posters, graphics',
    category: 'community',
    route: '/(tabs)/community/media-studio' as Href,
    icon: '🎨',
    keywords: ['media', 'meme', 'poster', 'graphic', 'create', 'share', 'art'],
  },

  // Campaigns
  {
    id: 'campaigns-hub',
    title: 'Campaigns Hub',
    description: 'Join and organize advocacy campaigns',
    category: 'campaigns',
    route: '/(tabs)/campaigns' as Href,
    icon: '📢',
    keywords: ['campaign', 'organize', 'activism', 'advocacy', 'action'],
  },

  // Events
  {
    id: 'events-calendar',
    title: 'Events Calendar',
    description: 'Discover and join community events',
    category: 'events',
    route: '/(tabs)/events' as Href,
    icon: '📅',
    keywords: ['events', 'calendar', 'meetup', 'gathering', 'workshop'],
  },

  // Research
  {
    id: 'research-hub',
    title: 'Research Hub',
    description: 'Access studies, reports, and articles',
    category: 'research',
    route: '/(tabs)/research' as Href,
    icon: '🔬',
    keywords: ['research', 'study', 'studies', 'report', 'article', 'evidence', 'data'],
  },
  {
    id: 'research-master-index',
    title: 'Master Index',
    description: 'Comprehensive searchable research database',
    category: 'research',
    route: '/research/master-index' as Href,
    icon: '📚',
    keywords: ['index', 'database', 'search', 'comprehensive', 'all'],
  },

  // Settings & Tools
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize your app experience',
    category: 'settings',
    route: '/(tabs)/settings' as Href,
    icon: '⚙️',
    keywords: ['settings', 'preferences', 'customize', 'configure', 'options'],
  },
  {
    id: 'saved',
    title: 'Saved Items',
    description: 'Access your bookmarked content',
    category: 'tools',
    route: '/(tabs)/saved' as Href,
    icon: '⭐',
    keywords: ['saved', 'bookmark', 'favorite', 'starred'],
  },
  {
    id: 'faqs',
    title: 'FAQs',
    description: 'Frequently asked questions',
    category: 'tools',
    route: '/(tabs)/faqs' as Href,
    icon: '❓',
    keywords: ['faq', 'help', 'question', 'answer', 'support'],
  },
];

/**
 * Calculate relevance score for a search result
 */
function calculateRelevance(result: SearchResult, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;
  const titleLower = result.title.toLowerCase();
  const descLower = result.description.toLowerCase();

  // Exact title match - highest score
  if (titleLower === q) score += 100;
  // Title starts with query
  else if (titleLower.startsWith(q)) score += 50;
  // Title contains query
  else if (titleLower.includes(q)) score += 30;

  // Description contains query
  if (descLower.includes(q)) score += 20;

  // Keyword matches
  result.keywords.forEach(keyword => {
    if (keyword === q) score += 40;
    else if (keyword.startsWith(q)) score += 25;
    else if (keyword.includes(q)) score += 15;
  });

  return score;
}

/**
 * Search across all app content
 */
export function searchGlobal(query: string, options?: {
  categories?: SearchCategory[];
  limit?: number;
}): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  let results = SEARCH_INDEX.filter(item => {
    // Filter by category if specified
    if (options?.categories && !options.categories.includes(item.category)) {
      return false;
    }

    // Calculate relevance
    const relevance = calculateRelevance(item, q);
    return relevance > 0;
  });

  // Sort by relevance
  results = results.map(r => ({
    ...r,
    relevanceScore: calculateRelevance(r, q),
  })).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  // Limit results if specified
  if (options?.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

/**
 * Get popular/recommended searches
 */
export function getPopularSearches(): string[] {
  return [
    'mood tracker',
    'ask advocate',
    'lawyer finder',
    'pain tracker',
    'letter builder',
    'events',
    'community',
    'campaigns',
  ];
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return getPopularSearches();

  const suggestions = new Set<string>();
  
  SEARCH_INDEX.forEach(item => {
    // Add title if matches
    if (item.title.toLowerCase().includes(q)) {
      suggestions.add(item.title);
    }
    // Add matching keywords
    item.keywords.forEach(keyword => {
      if (keyword.includes(q)) {
        suggestions.add(keyword);
      }
    });
  });

  return Array.from(suggestions).slice(0, 8);
}

/**
 * React hook for global search
 */
export function useGlobalSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory | undefined>();

  const results = useMemo(() => {
    return searchGlobal(query, {
      categories: selectedCategory ? [selectedCategory] : undefined,
    });
  }, [query, selectedCategory]);

  const suggestions = useMemo(() => {
    return getSearchSuggestions(query);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    suggestions,
    selectedCategory,
    setSelectedCategory,
  };
}
