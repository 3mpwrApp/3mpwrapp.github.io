#!/usr/bin/env node
/**
 * HASHTAG OPTIMIZER
 * 
 * AI-powered hashtag performance tracking and optimization:
 * - Track engagement metrics per hashtag
 * - A/B test hashtag combinations
 * - Auto-select best performing hashtags
 * - Learn patterns from successful posts
 * - Generate performance reports
 * 
 * Integrates with: hashtag-tracker.js, agent-feedback-system.js
 */

const fs = require('fs');
const path = require('path');

class HashtagOptimizer {
  constructor(config = {}) {
    this.config = {
      performanceFile: config.performanceFile || path.join(process.cwd(), 'public', 'hashtag-performance.json'),
      trackingFile: config.trackingFile || path.join(process.cwd(), 'public', 'hashtag-tracking.json'),
      trendsFile: config.trendsFile || path.join(process.cwd(), 'public', 'social-trends.json'),
      outputFile: config.outputFile || path.join(process.cwd(), '_data', 'optimized-hashtags.json'),
      minSampleSize: config.minSampleSize || 5,
      abTestDuration: config.abTestDuration || 7, // days
      ...config
    };

    this.performance = this.loadPerformanceData();
    this.tracking = this.loadTrackingData();
    this.trends = this.loadTrendsData();
  }

  /**
   * Load performance data
   */
  loadPerformanceData() {
    const defaultData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      hashtags: {},
      combinations: {},
      abTests: [],
      recommendations: []
    };

    if (fs.existsSync(this.config.performanceFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.config.performanceFile, 'utf8'));
        return { ...defaultData, ...data };
      } catch (err) {
        console.warn(`⚠️ Performance data load error: ${err.message}`);
      }
    }

    return defaultData;
  }

  /**
   * Load hashtag tracking data
   */
  loadTrackingData() {
    if (fs.existsSync(this.config.trackingFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.config.trackingFile, 'utf8'));
      } catch (err) {
        console.warn(`⚠️ Tracking data load error: ${err.message}`);
      }
    }
    return { hashtags: {}, mentions: [] };
  }

  /**
   * Load social trends data
   */
  loadTrendsData() {
    if (fs.existsSync(this.config.trendsFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.config.trendsFile, 'utf8'));
      } catch (err) {
        console.warn(`⚠️ Trends data load error: ${err.message}`);
      }
    }
    return { hashtags: {}, emergingTopics: [] };
  }

  /**
   * Save performance data
   */
  savePerformanceData() {
    try {
      this.performance.lastUpdated = new Date().toISOString();
      const dir = path.dirname(this.config.performanceFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.config.performanceFile, JSON.stringify(this.performance, null, 2));
      console.log(`✅ Saved performance data to ${this.config.performanceFile}`);
    } catch (err) {
      console.error(`❌ Failed to save performance data: ${err.message}`);
    }
  }

  /**
   * MAIN: Analyze and optimize hashtags
   */
  async optimize() {
    console.log('\n📊 HASHTAG OPTIMIZER - Starting Analysis\n');

    // Step 1: Update performance metrics from tracking data
    this.updatePerformanceMetrics();

    // Step 2: Analyze hashtag effectiveness
    this.analyzeHashtagEffectiveness();

    // Step 3: Test hashtag combinations
    this.analyzeCombinations();

    // Step 4: Integrate trending hashtags
    this.integrateTrendingHashtags();

    // Step 5: Run active A/B tests
    this.processABTests();

    // Step 6: Generate recommendations
    this.generateRecommendations();

    // Step 7: Save results
    this.savePerformanceData();
    this.saveOptimizedHashtags();

    console.log('\n✅ Hashtag optimization complete!\n');
    this.printSummary();
  }

  /**
   * Update performance metrics from tracking data
   */
  updatePerformanceMetrics() {
    console.log('📈 Updating performance metrics...');

    if (!this.tracking.mentions || this.tracking.mentions.length === 0) {
      console.log('   No new mentions to process');
      return;
    }

    // Process each mention
    this.tracking.mentions.forEach(mention => {
      const hashtags = this.extractHashtags(mention.text || mention.content || '');
      
      hashtags.forEach(tag => {
        if (!this.performance.hashtags[tag]) {
          this.performance.hashtags[tag] = {
            tag,
            totalUses: 0,
            totalReach: 0,
            totalEngagement: 0,
            avgEngagementRate: 0,
            bestPerformingPost: null,
            lastUsed: null,
            platforms: {}
          };
        }

        const data = this.performance.hashtags[tag];
        data.totalUses++;
        data.totalReach += mention.reach || 0;
        data.totalEngagement += mention.engagement || 0;
        data.lastUsed = mention.timestamp || new Date().toISOString();

        // Track platform performance
        const platform = mention.platform || 'unknown';
        if (!data.platforms[platform]) {
          data.platforms[platform] = { uses: 0, reach: 0, engagement: 0 };
        }
        data.platforms[platform].uses++;
        data.platforms[platform].reach += mention.reach || 0;
        data.platforms[platform].engagement += mention.engagement || 0;

        // Update best performing post
        if (!data.bestPerformingPost || 
            (mention.engagement || 0) > data.bestPerformingPost.engagement) {
          data.bestPerformingPost = {
            id: mention.id,
            engagement: mention.engagement || 0,
            reach: mention.reach || 0,
            platform: platform,
            timestamp: mention.timestamp
          };
        }
      });

      // Track hashtag combinations
      if (hashtags.length > 1) {
        const combo = hashtags.sort().join('+');
        if (!this.performance.combinations[combo]) {
          this.performance.combinations[combo] = {
            hashtags,
            uses: 0,
            totalEngagement: 0,
            avgEngagement: 0,
            posts: []
          };
        }
        
        const comboData = this.performance.combinations[combo];
        comboData.uses++;
        comboData.totalEngagement += mention.engagement || 0;
        comboData.posts.push({
          id: mention.id,
          engagement: mention.engagement || 0,
          timestamp: mention.timestamp
        });
      }
    });

    // Calculate averages
    Object.values(this.performance.hashtags).forEach(data => {
      if (data.totalUses > 0) {
        data.avgEngagementRate = data.totalEngagement / data.totalUses;
      }
    });

    Object.values(this.performance.combinations).forEach(combo => {
      if (combo.uses > 0) {
        combo.avgEngagement = combo.totalEngagement / combo.uses;
      }
    });

    console.log(`   ✓ Processed ${this.tracking.mentions.length} mentions`);
  }

  /**
   * Extract hashtags from text
   */
  extractHashtags(text) {
    const matches = text.match(/#[a-zA-Z0-9_]+/g) || [];
    return matches.map(tag => tag.substring(1)); // Remove #
  }

  /**
   * Analyze hashtag effectiveness
   */
  analyzeHashtagEffectiveness() {
    console.log('🎯 Analyzing hashtag effectiveness...');

    const hashtags = Object.values(this.performance.hashtags);
    
    // Sort by engagement rate
    const topPerformers = hashtags
      .filter(h => h.totalUses >= this.config.minSampleSize)
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
      .slice(0, 10);

    const lowPerformers = hashtags
      .filter(h => h.totalUses >= this.config.minSampleSize)
      .sort((a, b) => a.avgEngagementRate - b.avgEngagementRate)
      .slice(0, 10);

    console.log(`   ✓ Top performers: ${topPerformers.map(h => '#' + h.tag).join(', ')}`);
    console.log(`   ✓ Low performers: ${lowPerformers.map(h => '#' + h.tag).join(', ')}`);

    this.performance.topPerformers = topPerformers.map(h => h.tag);
    this.performance.lowPerformers = lowPerformers.map(h => h.tag);
  }

  /**
   * Analyze hashtag combinations
   */
  analyzeCombinations() {
    console.log('🔗 Analyzing hashtag combinations...');

    const combos = Object.values(this.performance.combinations)
      .filter(c => c.uses >= this.config.minSampleSize)
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    if (combos.length > 0) {
      console.log(`   ✓ Best combination: ${combos[0].hashtags.map(h => '#' + h).join(' ')} (${combos[0].avgEngagement.toFixed(1)} avg engagement)`);
      this.performance.bestCombination = combos[0];
    } else {
      console.log('   ℹ️ Not enough data for combination analysis');
    }
  }

  /**
   * Integrate trending hashtags from social monitoring
   */
  integrateTrendingHashtags() {
    console.log('🔥 Integrating trending hashtags...');

    const trending = [];

    // Get trending from social trends
    if (this.trends.hashtags) {
      Object.entries(this.trends.hashtags).forEach(([tag, data]) => {
        if (data.mentions && data.mentions > 10) {
          trending.push({
            tag,
            mentions: data.mentions,
            source: 'social-trends'
          });
        }
      });
    }

    // Get emerging topics
    if (this.trends.emergingTopics && Array.isArray(this.trends.emergingTopics)) {
      this.trends.emergingTopics.slice(0, 5).forEach(topic => {
        trending.push({
          tag: topic.keyword || topic.tag,
          mentions: topic.count || topic.mentions || 0,
          source: 'emerging'
        });
      });
    }

    this.performance.currentTrending = trending
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 10);

    console.log(`   ✓ Found ${trending.length} trending hashtags`);
  }

  /**
   * Process active A/B tests
   */
  processABTests() {
    console.log('🧪 Processing A/B tests...');

    const now = new Date();
    const activeTests = this.performance.abTests.filter(test => {
      const endDate = new Date(test.endDate);
      return now < endDate && test.status === 'active';
    });

    activeTests.forEach(test => {
      // Check if test has enough data
      const variantA = this.performance.combinations[test.variantA];
      const variantB = this.performance.combinations[test.variantB];

      if (variantA && variantB && 
          variantA.uses >= test.minSampleSize && 
          variantB.uses >= test.minSampleSize) {
        
        // Determine winner
        const winner = variantA.avgEngagement > variantB.avgEngagement ? 'A' : 'B';
        const winnerData = winner === 'A' ? variantA : variantB;
        
        test.status = 'completed';
        test.winner = winner;
        test.winnerEngagement = winnerData.avgEngagement;
        test.completedDate = now.toISOString();

        console.log(`   ✓ Test completed: ${test.name} - Winner: Variant ${winner}`);
      }
    });

    console.log(`   ✓ Active tests: ${activeTests.filter(t => t.status === 'active').length}`);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating recommendations...');

    this.performance.recommendations = [];

    // Recommendation 1: Use top performers
    if (this.performance.topPerformers && this.performance.topPerformers.length > 0) {
      this.performance.recommendations.push({
        type: 'use-top-performers',
        priority: 'high',
        action: 'Include these high-performing hashtags in upcoming posts',
        hashtags: this.performance.topPerformers.slice(0, 5),
        expectedImpact: 'High engagement'
      });
    }

    // Recommendation 2: Avoid low performers
    if (this.performance.lowPerformers && this.performance.lowPerformers.length > 0) {
      this.performance.recommendations.push({
        type: 'avoid-low-performers',
        priority: 'medium',
        action: 'Consider replacing these underperforming hashtags',
        hashtags: this.performance.lowPerformers.slice(0, 3),
        expectedImpact: 'Improved engagement'
      });
    }

    // Recommendation 3: Test trending
    if (this.performance.currentTrending && this.performance.currentTrending.length > 0) {
      this.performance.recommendations.push({
        type: 'test-trending',
        priority: 'high',
        action: 'Test these trending hashtags in next posts',
        hashtags: this.performance.currentTrending.slice(0, 3).map(t => t.tag),
        expectedImpact: 'Increased reach'
      });
    }

    // Recommendation 4: Best combination
    if (this.performance.bestCombination) {
      this.performance.recommendations.push({
        type: 'use-best-combo',
        priority: 'high',
        action: 'Use this proven hashtag combination',
        hashtags: this.performance.bestCombination.hashtags,
        expectedImpact: `${this.performance.bestCombination.avgEngagement.toFixed(1)} avg engagement`
      });
    }

    console.log(`   ✓ Generated ${this.performance.recommendations.length} recommendations`);
  }

  /**
   * Save optimized hashtags for use by other systems
   */
  saveOptimizedHashtags() {
    const optimized = {
      version: '1.0',
      generated: new Date().toISOString(),
      recommended: [],
      trending: [],
      proven: []
    };

    // Top 10 recommended hashtags
    if (this.performance.topPerformers) {
      optimized.recommended = this.performance.topPerformers.slice(0, 10);
    }

    // Trending hashtags
    if (this.performance.currentTrending) {
      optimized.trending = this.performance.currentTrending.map(t => t.tag);
    }

    // Proven combinations
    if (this.performance.bestCombination) {
      optimized.proven = this.performance.bestCombination.hashtags;
    }

    // Default fallback
    if (optimized.recommended.length === 0) {
      optimized.recommended = [
        '3mpwrApp',
        'DisabilityRights',
        'Accessibility',
        'DisabilityJustice',
        'ChronicIllness'
      ];
    }

    const dir = path.dirname(this.config.outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.config.outputFile, JSON.stringify(optimized, null, 2));
    console.log(`✅ Saved optimized hashtags to ${this.config.outputFile}`);
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('━'.repeat(70));
    console.log('📊 HASHTAG PERFORMANCE SUMMARY');
    console.log('━'.repeat(70));
    
    console.log('\n🏆 Top Performers:');
    if (this.performance.topPerformers && this.performance.topPerformers.length > 0) {
      this.performance.topPerformers.slice(0, 5).forEach((tag, i) => {
        const data = this.performance.hashtags[tag];
        console.log(`   ${i + 1}. #${tag} - ${data.avgEngagementRate.toFixed(1)} avg engagement (${data.totalUses} uses)`);
      });
    } else {
      console.log('   No data yet - keep posting!');
    }

    console.log('\n🔥 Currently Trending:');
    if (this.performance.currentTrending && this.performance.currentTrending.length > 0) {
      this.performance.currentTrending.slice(0, 5).forEach((trend, i) => {
        console.log(`   ${i + 1}. #${trend.tag} - ${trend.mentions} mentions`);
      });
    } else {
      console.log('   No trending data available');
    }

    console.log('\n💡 Recommendations:');
    if (this.performance.recommendations && this.performance.recommendations.length > 0) {
      this.performance.recommendations.forEach(rec => {
        console.log(`   [${rec.priority.toUpperCase()}] ${rec.action}`);
        console.log(`      → ${rec.hashtags.map(h => '#' + h).join(', ')}`);
      });
    } else {
      console.log('   No recommendations yet');
    }

    console.log('\n');
  }

  /**
   * Create A/B test
   */
  createABTest(name, variantA, variantB, options = {}) {
    const test = {
      id: `ab-test-${Date.now()}`,
      name,
      variantA: variantA.sort().join('+'),
      variantB: variantB.sort().join('+'),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + this.config.abTestDuration * 24 * 60 * 60 * 1000).toISOString(),
      minSampleSize: options.minSampleSize || this.config.minSampleSize,
      status: 'active',
      winner: null
    };

    this.performance.abTests.push(test);
    console.log(`🧪 Created A/B test: ${name}`);
    console.log(`   Variant A: ${variantA.join(', ')}`);
    console.log(`   Variant B: ${variantB.join(', ')}`);
    console.log(`   Duration: ${this.config.abTestDuration} days`);

    return test;
  }
}

// Run if called directly
if (require.main === module) {
  const optimizer = new HashtagOptimizer();
  optimizer.optimize()
    .then(() => {
      console.log('✅ Hashtag optimization complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Hashtag optimization failed:', err);
      process.exit(1);
    });
}

module.exports = HashtagOptimizer;
