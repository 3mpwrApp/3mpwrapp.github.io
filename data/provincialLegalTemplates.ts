/**
 * Provincial Legal Templates - Type definitions and lazy-loaded data
 * 
 * Data is now stored in JSON format and loaded on-demand to reduce bundle size.
 * This file provides type definitions and helper functions.
 */

export interface LegalTemplate {
  id: string;
  title: string;
  description: string;
  jurisdiction: string;
  category: 'accommodation' | 'appeal' | 'complaint' | 'employment' | 'housing' | 'healthcare' | 'education' | 'transportation' | 'government-services';
  complexity: 'basic' | 'intermediate' | 'advanced';
  timeToComplete: string;
  requiredInfo: string[];
  template: string;
  legalBasis: string[];
  relatedLaws: string[];
  deadlines?: {
    description: string;
    timeframe: string;
    consequences: string;
  }[];
  tips: string[];
  resources: {
    title: string;
    description: string;
    url?: string;
    phone?: string;
  }[];
}

// Cached data to avoid reloading
let cachedTemplates: LegalTemplate[] | null = null;

/**
 * Load templates from JSON asset file
 * This is lazy-loaded to reduce initial bundle size
 */
async function loadTemplates(): Promise<LegalTemplate[]> {
  if (cachedTemplates) {
    return cachedTemplates;
  }

  try {
    // Dynamic import of JSON data
    const data = await import('../assets/data/provincialLegalTemplates.json');
    cachedTemplates = data.default as LegalTemplate[];
    return cachedTemplates;
  } catch (error) {
    console.error('[provincialLegalTemplates] Failed to load templates:', error);
    return [];
  }
}

/**
 * Get all templates (lazy-loaded)
 */
export async function getProvincialLegalTemplates(): Promise<LegalTemplate[]> {
  return loadTemplates();
}

/**
 * Get templates by jurisdiction
 */
export async function getTemplatesByJurisdiction(jurisdiction: string): Promise<LegalTemplate[]> {
  const templates = await loadTemplates();
  return templates.filter(template => 
    template.jurisdiction === jurisdiction || template.jurisdiction === 'Federal'
  );
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(category: LegalTemplate['category']): Promise<LegalTemplate[]> {
  const templates = await loadTemplates();
  return templates.filter(template => template.category === category);
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string): Promise<LegalTemplate | undefined> {
  const templates = await loadTemplates();
  return templates.find(template => template.id === id);
}

/**
 * Search templates
 */
export async function searchTemplates(query: string): Promise<LegalTemplate[]> {
  const templates = await loadTemplates();
  const searchTerm = query.toLowerCase();
  return templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm) ||
    template.description.toLowerCase().includes(searchTerm) ||
    template.category.toLowerCase().includes(searchTerm) ||
    template.jurisdiction.toLowerCase().includes(searchTerm)
  );
}

// For backwards compatibility - export synchronous version with empty array
// Components should migrate to async functions above
export const provincialLegalTemplates: LegalTemplate[] = [];

// Initialize templates on module load (async)
loadTemplates().catch(err => {
  console.error('[provincialLegalTemplates] Failed to initialize templates:', err);
});
