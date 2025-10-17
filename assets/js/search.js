/**
 * 3mpwrApp Search Engine
 * 
 * Client-side full-text search using the generated search index.
 * No server required - all searching happens in the browser.
 * 
 * Features:
 * - Full-text search across all documents
 * - Filter by tag, category, source
 * - Sort by date, relevance
 * - Fuzzy matching for typos
 * - Real-time results
 * 
 * Usage:
 * const search = new SearchEngine();
 * const results = search.find('accessibility');
 * const filtered = search.filter({ category: 'policy', source: 'blog' });
 */

class SearchEngine {
  constructor() {
    this.index = null;
    this.documents = [];
    this.loaded = false;
  }

  /**
   * Load the search index from the JSON file
   */
  async load() {
    if (this.loaded) return;

    try {
      const response = await fetch('/search-index.json');
      if (!response.ok) {
        console.error('Failed to load search index');
        return false;
      }

      this.index = await response.json();
      this.documents = this.index.documents || [];
      this.loaded = true;
      console.log(`Search index loaded: ${this.documents.length} documents`);
      return true;
    } catch (e) {
      console.error('Error loading search index:', e);
      return false;
    }
  }

  /**
   * Calculate similarity between two strings (for fuzzy matching)
   * Uses Levenshtein distance
   */
  similarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Search all documents for a query
   * Returns results sorted by relevance
   */
  find(query, options = {}) {
    if (!this.loaded) {
      console.warn('Search index not loaded');
      return [];
    }

    if (!query || query.trim() === '') {
      return [];
    }

    const q = query.toLowerCase().trim();
    const results = [];

    // Search all documents
    for (const doc of this.documents) {
      let score = 0;

      // Title match (highest weight)
      if (doc.title.toLowerCase().includes(q)) {
        score += 50;
      } else {
        // Fuzzy match on title
        const titleSimilarity = this.similarity(doc.title.toLowerCase(), q);
        if (titleSimilarity > 0.7) {
          score += titleSimilarity * 40;
        }
      }

      // Excerpt/content match
      if (doc.excerpt.toLowerCase().includes(q)) {
        score += 20;
      }
      if (doc.content.toLowerCase().includes(q)) {
        score += 10;
      }

      // Tag match
      for (const tag of doc.tags) {
        if (tag.toLowerCase().includes(q)) {
          score += 15;
        }
      }

      // Category match
      for (const category of doc.categories) {
        if (category.toLowerCase().includes(q)) {
          score += 10;
        }
      }

      if (score > 0) {
        results.push({ ...doc, score });
      }
    }

    // Sort by relevance (score) and then by date
    results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.date) - new Date(a.date);
    });

    // Limit results if specified
    const limit = options.limit || 50;
    return results.slice(0, limit);
  }

  /**
   * Filter documents by criteria
   */
  filter(criteria = {}) {
    if (!this.loaded) {
      console.warn('Search index not loaded');
      return [];
    }

    let results = [...this.documents];

    // Filter by source
    if (criteria.source) {
      results = results.filter(doc => doc.source === criteria.source);
    }

    // Filter by category
    if (criteria.category) {
      const category = criteria.category.toLowerCase();
      results = results.filter(doc =>
        doc.categories.some(c => c.toLowerCase() === category)
      );
    }

    // Filter by tag
    if (criteria.tag) {
      const tag = criteria.tag.toLowerCase();
      results = results.filter(doc =>
        doc.tags.some(t => t.toLowerCase() === tag)
      );
    }

    // Filter by date range
    if (criteria.after) {
      const afterDate = new Date(criteria.after);
      results = results.filter(doc => new Date(doc.date) >= afterDate);
    }

    if (criteria.before) {
      const beforeDate = new Date(criteria.before);
      results = results.filter(doc => new Date(doc.date) <= beforeDate);
    }

    // Sort by date (newest first)
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit results if specified
    const limit = criteria.limit || 50;
    return results.slice(0, limit);
  }

  /**
   * Get all unique tags
   */
  getTags() {
    if (!this.loaded) return [];

    const tags = new Set();
    for (const doc of this.documents) {
      for (const tag of doc.tags) {
        tags.add(tag);
      }
    }

    return Array.from(tags).sort();
  }

  /**
   * Get all unique categories
   */
  getCategories() {
    if (!this.loaded) return [];

    return Object.keys(this.index.categoryIndex || {}).sort();
  }

  /**
   * Get statistics about the index
   */
  getStats() {
    if (!this.loaded) {
      return { loaded: false };
    }

    return {
      loaded: true,
      totalDocuments: this.documents.length,
      generated: this.index.generated,
      version: this.index.version,
      sources: this.index.sources || {},
      categories: Object.keys(this.index.categoryIndex || {}),
      topTags: this.index.topTags || [],
    };
  }

  /**
   * Get documents by source
   */
  getBySource(source) {
    return this.filter({ source });
  }

  /**
   * Get documents by category
   */
  getByCategory(category) {
    return this.filter({ category });
  }

  /**
   * Get documents by tag
   */
  getByTag(tag) {
    return this.filter({ tag });
  }

  /**
   * Get recent documents
   */
  getRecent(limit = 10) {
    const results = [...this.documents].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return results.slice(0, limit);
  }

  /**
   * Get documents matching multiple criteria
   */
  findAdvanced(query, criteria = {}) {
    // First do full-text search
    const queryResults = query ? this.find(query, criteria) : this.documents;

    // Then apply additional filters
    let results = queryResults;

    if (criteria.source) {
      results = results.filter(doc => doc.source === criteria.source);
    }

    if (criteria.category) {
      const category = criteria.category.toLowerCase();
      results = results.filter(doc =>
        doc.categories.some(c => c.toLowerCase() === category)
      );
    }

    if (criteria.before) {
      const beforeDate = new Date(criteria.before);
      results = results.filter(doc => new Date(doc.date) <= beforeDate);
    }

    if (criteria.after) {
      const afterDate = new Date(criteria.after);
      results = results.filter(doc => new Date(doc.date) >= afterDate);
    }

    const limit = criteria.limit || 50;
    return results.slice(0, limit);
  }
}

// Export for use in Node.js/modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchEngine;
}
