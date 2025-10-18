#!/usr/bin/env node
/**
 * CURATOR-TRENDING.JS
 * Trending topics detection and scoring boost
 * 
 * Features:
 * - Track keyword frequency over time
 * - Identify trending keywords
 * - Boost scores for trending topics
 * - Time-decay algorithm
 */

const fs = require('fs');
const path = require('path');

class TrendingTopics {
  constructor() {
    this.trendingPath = path.join(process.cwd(), 'public', 'trending-topics.json');
    this.trending = this.loadTrending();
    this.decayRate = 0.9; // 10% decay per day
    this.trendingThreshold = 3; // Minimum mentions to be "trending"
  }

  /**
   * Load existing trending data
   */
  loadTrending() {
    const defaultTrending = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      keywords: {},
      currentTrending: []
    };

    if (fs.existsSync(this.trendingPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.trendingPath, 'utf8'));
        return { ...defaultTrending, ...data };
      } catch (err) {
        console.warn(`⚠️ Trending data load error: ${err.message}`);
        return defaultTrending;
      }
    }

    return defaultTrending;
  }

  /**
   * Save trending data
   */
  saveTrending() {
    try {
      this.trending.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.trendingPath, JSON.stringify(this.trending, null, 2));
    } catch (err) {
      console.error(`❌ Failed to save trending data: ${err.message}`);
    }
  }

  /**
   * Apply time decay to all keywords
   */
  applyTimeDecay() {
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    Object.keys(this.trending.keywords).forEach(keyword => {
      const data = this.trending.keywords[keyword];
      const lastUpdate = new Date(data.lastSeen);
      const daysSince = (now - lastUpdate) / oneDayMs;

      // Apply exponential decay
      data.recentMentions = Math.max(0, data.recentMentions * Math.pow(this.decayRate, daysSince));
      
      // Clean up if too old
      if (data.recentMentions < 0.1) {
        delete this.trending.keywords[keyword];
      }
    });
  }

  /**
   * Update keyword mentions from curated items
   */
  updateFromItems(items, keywords) {
    const now = new Date().toISOString();

    // Apply decay first
    this.applyTimeDecay();

    // Track mentions from current curation
    const mentionCounts = {};

    items.forEach(item => {
      const text = `${item.title} ${item.description || ''}`.toLowerCase();
      
      // Check all configured keywords
      Object.values(keywords).forEach(category => {
        category.terms.forEach(term => {
          const termLower = term.toLowerCase();
          if (text.includes(termLower)) {
            mentionCounts[term] = (mentionCounts[term] || 0) + 1;
          }
        });
      });
    });

    // Update tracking data
    Object.entries(mentionCounts).forEach(([keyword, count]) => {
      if (!this.trending.keywords[keyword]) {
        this.trending.keywords[keyword] = {
          totalMentions: 0,
          recentMentions: 0,
          firstSeen: now,
          lastSeen: now,
          peakMentions: 0
        };
      }

      const data = this.trending.keywords[keyword];
      data.totalMentions += count;
      data.recentMentions += count;
      data.lastSeen = now;
      data.peakMentions = Math.max(data.peakMentions, data.recentMentions);
    });

    // Identify current trending keywords
    this.updateTrendingList();
    this.saveTrending();
  }

  /**
   * Update list of currently trending keywords
   */
  updateTrendingList() {
    this.trending.currentTrending = Object.entries(this.trending.keywords)
      .filter(([_, data]) => data.recentMentions >= this.trendingThreshold)
      .map(([keyword, data]) => ({
        keyword,
        mentions: Math.round(data.recentMentions * 10) / 10,
        velocity: this.calculateVelocity(data)
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 20); // Top 20 trending
  }

  /**
   * Calculate trend velocity (rate of change)
   */
  calculateVelocity(data) {
    const recentRatio = data.recentMentions / data.totalMentions;
    return recentRatio > 0.5 ? 'rising' : recentRatio > 0.2 ? 'steady' : 'declining';
  }

  /**
   * Get trending boost multiplier for a keyword
   */
  getTrendingBoost(keyword) {
    const data = this.trending.keywords[keyword.toLowerCase()];
    
    if (!data) return 1.0;

    // Boost based on recent mentions
    if (data.recentMentions >= 10) return 1.5;  // +50%
    if (data.recentMentions >= 5) return 1.3;   // +30%
    if (data.recentMentions >= 3) return 1.2;   // +20%
    
    return 1.0; // No boost
  }

  /**
   * Apply trending boosts to scored items
   */
  applyTrendingBoosts(scoredItems, keywords) {
    return scoredItems.map(item => {
      let trendingBoost = 0;
      const text = `${item.title} ${item.description || ''}`.toLowerCase();

      // Check all keywords for trending boost
      Object.values(keywords).forEach(category => {
        category.terms.forEach(term => {
          if (text.includes(term.toLowerCase())) {
            const boost = this.getTrendingBoost(term);
            if (boost > 1.0) {
              const additionalScore = (category.score || 1.0) * (boost - 1.0);
              trendingBoost += additionalScore;
            }
          }
        });
      });

      return {
        ...item,
        originalScore: item.score,
        trendingBoost: Math.round(trendingBoost * 10) / 10,
        score: item.score + trendingBoost
      };
    });
  }

  /**
   * Generate trending report
   */
  generateReport() {
    console.log('\n🔥 TRENDING TOPICS REPORT\n');
    console.log('═══════════════════════════════════════════════════════\n');

    if (this.trending.currentTrending.length === 0) {
      console.log('   No trending topics detected yet.\n');
      console.log('   (Requires at least 3 mentions in recent curations)\n');
    } else {
      console.log('📈 Currently Trending:\n');
      this.trending.currentTrending.forEach((item, idx) => {
        const arrow = item.velocity === 'rising' ? '📈' : 
                     item.velocity === 'steady' ? '➡️' : '📉';
        console.log(`   ${idx + 1}. ${arrow} ${item.keyword}`);
        console.log(`      Mentions: ${item.mentions} (${item.velocity})\n`);
      });
    }

    console.log('📊 All Tracked Keywords:');
    const allKeywords = Object.entries(this.trending.keywords)
      .sort(([, a], [, b]) => b.recentMentions - a.recentMentions)
      .slice(0, 10);

    if (allKeywords.length === 0) {
      console.log('   No keywords tracked yet.\n');
    } else {
      allKeywords.forEach(([keyword, data]) => {
        console.log(`   ${keyword}: ${Math.round(data.recentMentions * 10) / 10} recent, ${data.totalMentions} total`);
      });
      console.log();
    }

    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// Run if called directly
if (require.main === module) {
  const trending = new TrendingTopics();
  trending.generateReport();
}

module.exports = TrendingTopics;
