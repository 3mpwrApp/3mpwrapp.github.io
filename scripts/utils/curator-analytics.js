#!/usr/bin/env node
/**
 * CURATOR-ANALYTICS.JS
 * Analytics and A/B testing for curator system
 * 
 * Features:
 * - Track feature highlight engagement
 * - Log time slot performance
 * - Measure platform-specific metrics
 * - A/B testing framework
 */

const fs = require('fs');
const path = require('path');

class CuratorAnalytics {
  constructor() {
    this.analyticsPath = path.join(process.cwd(), 'public', 'curator-analytics.json');
    this.analytics = this.loadAnalytics();
  }

  /**
   * Load existing analytics data
   */
  loadAnalytics() {
    const defaultAnalytics = {
      version: '1.0',
      startDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      featureHighlights: {},
      timeSlots: {},
      platforms: {
        mastodon: { posts: 0, successes: 0, failures: 0 },
        bluesky: { posts: 0, successes: 0, failures: 0 },
        x: { posts: 0, successes: 0, failures: 0 }
      },
      totalPosts: 0,
      successRate: 0
    };

    if (fs.existsSync(this.analyticsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.analyticsPath, 'utf8'));
        return { ...defaultAnalytics, ...data };
      } catch (err) {
        console.warn(`⚠️ Analytics load error: ${err.message}, using defaults`);
        return defaultAnalytics;
      }
    }

    return defaultAnalytics;
  }

  /**
   * Save analytics data
   */
  saveAnalytics() {
    try {
      this.analytics.lastUpdated = new Date().toISOString();
      
      // Calculate success rate
      const totalAttempts = Object.values(this.analytics.platforms)
        .reduce((sum, p) => sum + p.posts, 0);
      const totalSuccesses = Object.values(this.analytics.platforms)
        .reduce((sum, p) => sum + p.successes, 0);
      
      this.analytics.successRate = totalAttempts > 0 
        ? (totalSuccesses / totalAttempts * 100).toFixed(2)
        : 0;

      fs.writeFileSync(this.analyticsPath, JSON.stringify(this.analytics, null, 2));
      console.log(`✅ Analytics saved to ${this.analyticsPath}`);
    } catch (err) {
      console.error(`❌ Failed to save analytics: ${err.message}`);
    }
  }

  /**
   * Track feature highlight usage
   */
  trackFeatureHighlight(feature, timeSlot, platform) {
    const featureKey = feature.split(':')[0]; // e.g., "Benefits Navigator"
    
    if (!this.analytics.featureHighlights[featureKey]) {
      this.analytics.featureHighlights[featureKey] = {
        uses: 0,
        platforms: { mastodon: 0, bluesky: 0, x: 0 },
        timeSlots: { morning: 0, midday: 0, evening: 0, night: 0 },
        firstUsed: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
    }

    const fh = this.analytics.featureHighlights[featureKey];
    fh.uses++;
    fh.platforms[platform]++;
    fh.timeSlots[timeSlot]++;
    fh.lastUsed = new Date().toISOString();
  }

  /**
   * Track time slot performance
   */
  trackTimeSlot(timeSlot, itemCount, platforms) {
    if (!this.analytics.timeSlots[timeSlot]) {
      this.analytics.timeSlots[timeSlot] = {
        posts: 0,
        avgItems: 0,
        platforms: { mastodon: 0, bluesky: 0, x: 0 },
        successRate: 0,
        totalItems: 0
      };
    }

    const ts = this.analytics.timeSlots[timeSlot];
    ts.posts++;
    ts.totalItems += itemCount;
    ts.avgItems = (ts.totalItems / ts.posts).toFixed(1);
    
    platforms.forEach(platform => {
      ts.platforms[platform]++;
    });
  }

  /**
   * Track posting result
   */
  trackPostingResult(platform, success) {
    if (!this.analytics.platforms[platform]) {
      this.analytics.platforms[platform] = {
        posts: 0,
        successes: 0,
        failures: 0
      };
    }

    const p = this.analytics.platforms[platform];
    p.posts++;
    
    if (success) {
      p.successes++;
    } else {
      p.failures++;
    }

    this.analytics.totalPosts++;
  }

  /**
   * Get performance report
   */
  getReport() {
    const report = {
      summary: {
        totalPosts: this.analytics.totalPosts,
        successRate: this.analytics.successRate,
        timeRange: {
          start: this.analytics.startDate,
          end: this.analytics.lastUpdated
        }
      },
      topFeatures: this.getTopFeatures(),
      bestTimeSlots: this.getBestTimeSlots(),
      platformPerformance: this.getPlatformPerformance()
    };

    return report;
  }

  /**
   * Get top performing features
   */
  getTopFeatures() {
    const features = Object.entries(this.analytics.featureHighlights)
      .map(([name, data]) => ({
        name,
        uses: data.uses,
        platforms: data.platforms,
        timeSlots: data.timeSlots
      }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 5);

    return features;
  }

  /**
   * Get best performing time slots
   */
  getBestTimeSlots() {
    const slots = Object.entries(this.analytics.timeSlots)
      .map(([name, data]) => ({
        name,
        posts: data.posts,
        avgItems: parseFloat(data.avgItems),
        platforms: data.platforms
      }))
      .sort((a, b) => b.posts - a.posts);

    return slots;
  }

  /**
   * Get platform performance
   */
  getPlatformPerformance() {
    return Object.entries(this.analytics.platforms).map(([name, data]) => ({
      name,
      posts: data.posts,
      successes: data.successes,
      failures: data.failures,
      successRate: data.posts > 0 
        ? ((data.successes / data.posts) * 100).toFixed(2)
        : 0
    }));
  }

  /**
   * Generate analytics report
   */
  generateReport() {
    const report = this.getReport();
    
    console.log('\n📊 CURATOR ANALYTICS REPORT\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📈 Summary:');
    console.log(`   Total Posts: ${report.summary.totalPosts}`);
    console.log(`   Success Rate: ${report.summary.successRate}%`);
    console.log(`   Time Range: ${new Date(report.summary.timeRange.start).toLocaleDateString()} - ${new Date(report.summary.timeRange.end).toLocaleDateString()}\n`);
    
    console.log('🌟 Top Feature Highlights:');
    report.topFeatures.forEach((f, idx) => {
      console.log(`   ${idx + 1}. ${f.name}: ${f.uses} uses`);
      console.log(`      Platforms: M:${f.platforms.mastodon} B:${f.platforms.bluesky} X:${f.platforms.x}`);
    });
    console.log();
    
    console.log('⏰ Best Time Slots:');
    report.bestTimeSlots.forEach(ts => {
      console.log(`   ${ts.name}: ${ts.posts} posts, ${ts.avgItems} avg items`);
    });
    console.log();
    
    console.log('📱 Platform Performance:');
    report.platformPerformance.forEach(p => {
      console.log(`   ${p.name}: ${p.successes}/${p.posts} (${p.successRate}%)`);
    });
    console.log('\n═══════════════════════════════════════════════════════\n');

    // Save report to file
    const reportPath = path.join(process.cwd(), 'public', 'curator-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Full report saved to: ${reportPath}\n`);

    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const analytics = new CuratorAnalytics();
  analytics.generateReport();
}

module.exports = CuratorAnalytics;
