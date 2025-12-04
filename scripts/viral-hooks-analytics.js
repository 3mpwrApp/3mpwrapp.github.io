#!/usr/bin/env node
/**
 * VIRAL-HOOKS-ANALYTICS.JS
 * Analytics-driven hook performance tracking and auto-optimization
 * 
 * Features:
 * - Tracks engagement metrics for each hook used
 * - Rotates underperforming hooks out every 30 days
 * - Promotes high-performing hooks with higher weight
 * - Generates performance reports
 * - Auto-updates hook weights based on data
 * 
 * Runs: Weekly via GitHub Actions or manually
 */

const fs = require('fs');
const path = require('path');

const ANALYTICS_FILE = path.join(process.cwd(), 'public', 'viral-hooks-analytics.json');
const ROTATION_PERIOD_DAYS = 30;

class ViralHooksAnalytics {
  constructor() {
    this.data = this.loadAnalytics();
  }

  /**
   * Load existing analytics data or initialize new
   */
  loadAnalytics() {
    if (fs.existsSync(ANALYTICS_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
      } catch (err) {
        console.warn(`⚠️ Could not load analytics: ${err.message}`);
      }
    }
    
    return {
      version: '1.0.0',
      created: new Date().toISOString(),
      lastRotation: new Date().toISOString(),
      rotationCount: 0,
      hooks: {},
      monthlyReports: [],
      performance: {
        topHooks: [],
        underperformers: [],
        averageEngagement: 0
      }
    };
  }

  /**
   * Save analytics data
   */
  saveAnalytics() {
    const dir = path.dirname(ANALYTICS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(this.data, null, 2));
    console.log(`✅ Analytics saved: ${ANALYTICS_FILE}`);
  }

  /**
   * Track a hook usage with engagement data
   */
  trackHook(hookText, platform, metrics = {}) {
    const hookId = this.generateHookId(hookText);
    const now = new Date().toISOString();
    
    if (!this.data.hooks[hookId]) {
      this.data.hooks[hookId] = {
        text: hookText,
        firstUsed: now,
        lastUsed: now,
        usageCount: 0,
        platforms: {},
        totalEngagement: 0,
        averageEngagement: 0,
        weight: 1.0,
        status: 'active'
      };
    }
    
    const hook = this.data.hooks[hookId];
    hook.usageCount++;
    hook.lastUsed = now;
    
    // Track platform-specific data
    if (!hook.platforms[platform]) {
      hook.platforms[platform] = {
        uses: 0,
        impressions: 0,
        clicks: 0,
        reposts: 0,
        replies: 0,
        favorites: 0
      };
    }
    
    const platformData = hook.platforms[platform];
    platformData.uses++;
    
    // Add metrics
    if (metrics.impressions) platformData.impressions += metrics.impressions;
    if (metrics.clicks) platformData.clicks += metrics.clicks;
    if (metrics.reposts) platformData.reposts += metrics.reposts;
    if (metrics.replies) platformData.replies += metrics.replies;
    if (metrics.favorites) platformData.favorites += metrics.favorites;
    
    // Calculate engagement
    const totalMetrics = 
      (platformData.clicks || 0) + 
      (platformData.reposts || 0) * 2 + // Reposts weighted 2x
      (platformData.replies || 0) * 3 + // Replies weighted 3x
      (platformData.favorites || 0);
    
    const impressions = platformData.impressions || 1;
    const engagementRate = totalMetrics / impressions;
    
    // Update hook-level stats
    hook.totalEngagement = Object.values(hook.platforms).reduce((sum, p) => {
      const pMetrics = (p.clicks || 0) + (p.reposts || 0) * 2 + (p.replies || 0) * 3 + (p.favorites || 0);
      return sum + pMetrics;
    }, 0);
    
    const totalImpressions = Object.values(hook.platforms).reduce((sum, p) => sum + (p.impressions || 0), 0);
    hook.averageEngagement = totalImpressions > 0 ? hook.totalEngagement / totalImpressions : 0;
    
    this.saveAnalytics();
    
    return {
      hookId,
      engagementRate,
      status: hook.status
    };
  }

  /**
   * Generate consistent ID for hook text
   */
  generateHookId(text) {
    // Simple hash based on first 50 chars
    const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hook_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Check if rotation is due (every 30 days)
   */
  isRotationDue() {
    const lastRotation = new Date(this.data.lastRotation);
    const now = new Date();
    const daysSinceRotation = (now - lastRotation) / (1000 * 60 * 60 * 24);
    return daysSinceRotation >= ROTATION_PERIOD_DAYS;
  }

  /**
   * Perform monthly rotation - adjust hook weights based on performance
   */
  performRotation() {
    console.log('\n🔄 Starting 30-day hook rotation analysis...\n');
    
    const hooks = Object.entries(this.data.hooks);
    
    if (hooks.length === 0) {
      console.log('📊 No hooks tracked yet. Skipping rotation.');
      return null;
    }
    
    // Calculate performance metrics
    const performanceData = hooks.map(([id, hook]) => ({
      id,
      text: hook.text,
      usageCount: hook.usageCount,
      averageEngagement: hook.averageEngagement,
      weight: hook.weight,
      status: hook.status
    }));
    
    // Sort by engagement
    performanceData.sort((a, b) => b.averageEngagement - a.averageEngagement);
    
    // Define thresholds
    const avgEngagement = performanceData.reduce((sum, h) => sum + h.averageEngagement, 0) / performanceData.length;
    const highThreshold = avgEngagement * 1.5;
    const lowThreshold = avgEngagement * 0.5;
    
    // Categorize and adjust weights
    const topHooks = [];
    const underperformers = [];
    const neutral = [];
    
    performanceData.forEach(hook => {
      const hookData = this.data.hooks[hook.id];
      
      // Only adjust if we have enough samples
      if (hook.usageCount < 5) {
        neutral.push(hook);
        return;
      }
      
      if (hook.averageEngagement >= highThreshold) {
        // High performer - increase weight
        hookData.weight = Math.min(hookData.weight * 1.2, 2.0);
        topHooks.push({
          ...hook,
          newWeight: hookData.weight,
          reason: 'High engagement'
        });
      } else if (hook.averageEngagement <= lowThreshold) {
        // Underperformer - decrease weight
        hookData.weight = Math.max(hookData.weight * 0.7, 0.3);
        
        // Mark for retirement if weight drops too low
        if (hookData.weight <= 0.5) {
          hookData.status = 'retiring';
        }
        
        underperformers.push({
          ...hook,
          newWeight: hookData.weight,
          reason: hookData.status === 'retiring' ? 'Retiring due to low engagement' : 'Low engagement'
        });
      } else {
        neutral.push(hook);
      }
    });
    
    // Generate report
    const report = {
      date: new Date().toISOString(),
      rotationNumber: this.data.rotationCount + 1,
      totalHooksAnalyzed: hooks.length,
      averageEngagement: avgEngagement,
      thresholds: {
        high: highThreshold,
        low: lowThreshold
      },
      topPerformers: topHooks.slice(0, 5),
      underperformers: underperformers,
      neutral: neutral.length,
      recommendations: this.generateRecommendations(topHooks, underperformers)
    };
    
    // Update data
    this.data.lastRotation = new Date().toISOString();
    this.data.rotationCount++;
    this.data.monthlyReports.push(report);
    this.data.performance = {
      topHooks: topHooks.slice(0, 10),
      underperformers: underperformers,
      averageEngagement: avgEngagement
    };
    
    // Keep only last 12 reports
    if (this.data.monthlyReports.length > 12) {
      this.data.monthlyReports = this.data.monthlyReports.slice(-12);
    }
    
    this.saveAnalytics();
    
    console.log('\n📊 ROTATION REPORT\n');
    console.log(`🔢 Rotation #${report.rotationNumber}`);
    console.log(`📈 Hooks analyzed: ${report.totalHooksAnalyzed}`);
    console.log(`⭐ Top performers: ${topHooks.length}`);
    console.log(`⚠️ Underperformers: ${underperformers.length}`);
    console.log(`📊 Average engagement: ${(avgEngagement * 100).toFixed(2)}%`);
    console.log('\n✅ Top hooks promoted with higher weight');
    console.log('⬇️ Underperforming hooks demoted or retired\n');
    
    return report;
  }

  /**
   * Generate recommendations based on performance data
   */
  generateRecommendations(topHooks, underperformers) {
    const recommendations = [];
    
    // Analyze what makes top hooks successful
    if (topHooks.length > 0) {
      // Check for patterns in successful hooks
      const topTexts = topHooks.map(h => h.text.toLowerCase());
      
      // Check for question hooks
      const questionHooks = topTexts.filter(t => t.includes('?')).length;
      if (questionHooks > topTexts.length * 0.5) {
        recommendations.push('📌 Question-based hooks performing well - consider more thought-provoking questions');
      }
      
      // Check for number hooks
      const numberHooks = topTexts.filter(t => /\d+/.test(t)).length;
      if (numberHooks > topTexts.length * 0.4) {
        recommendations.push('📌 Hooks with numbers are resonating - use more specific statistics');
      }
      
      // Check for emoji usage
      const emojiHooks = topTexts.filter(t => /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u.test(t)).length;
      if (emojiHooks > topTexts.length * 0.6) {
        recommendations.push('📌 Emoji-rich hooks getting engagement - maintain visual appeal');
      }
    }
    
    // Analyze underperformers
    if (underperformers.length > 0) {
      const badTexts = underperformers.map(h => h.text.toLowerCase());
      
      // Check for generic hooks
      const genericTerms = ['check out', 'learn more', 'click here', 'new post'];
      const genericCount = badTexts.filter(t => genericTerms.some(term => t.includes(term))).length;
      if (genericCount > badTexts.length * 0.3) {
        recommendations.push('⚠️ Generic CTAs underperforming - be more specific and urgent');
      }
      
      // Check for length
      const longHooks = badTexts.filter(t => t.length > 150).length;
      if (longHooks > badTexts.length * 0.4) {
        recommendations.push('⚠️ Longer hooks underperforming - keep hooks punchy and concise');
      }
    }
    
    // Default recommendations if no patterns found
    if (recommendations.length === 0) {
      recommendations.push('💡 Continue A/B testing different hook styles');
      recommendations.push('💡 Try more validation-focused hooks ("You\'re not alone")');
      recommendations.push('💡 Experiment with urgency and FOMO hooks');
    }
    
    return recommendations;
  }

  /**
   * Get recommended hook based on current weights
   */
  getWeightedHook(hookOptions) {
    if (!hookOptions || hookOptions.length === 0) {
      return null;
    }
    
    // Calculate total weight
    const totalWeight = hookOptions.reduce((sum, hook) => {
      const hookId = this.generateHookId(hook);
      const trackData = this.data.hooks[hookId];
      const weight = trackData?.weight || 1.0;
      const status = trackData?.status || 'active';
      
      // Skip retired hooks
      if (status === 'retired') return sum;
      
      return sum + weight;
    }, 0);
    
    // Random weighted selection
    let random = Math.random() * totalWeight;
    
    for (const hook of hookOptions) {
      const hookId = this.generateHookId(hook);
      const trackData = this.data.hooks[hookId];
      const weight = trackData?.weight || 1.0;
      const status = trackData?.status || 'active';
      
      if (status === 'retired') continue;
      
      random -= weight;
      if (random <= 0) {
        return hook;
      }
    }
    
    // Fallback to random
    return hookOptions[Math.floor(Math.random() * hookOptions.length)];
  }

  /**
   * Generate performance summary for display
   */
  generateSummary() {
    const summary = {
      totalHooks: Object.keys(this.data.hooks).length,
      activeHooks: Object.values(this.data.hooks).filter(h => h.status === 'active').length,
      retiringHooks: Object.values(this.data.hooks).filter(h => h.status === 'retiring').length,
      retiredHooks: Object.values(this.data.hooks).filter(h => h.status === 'retired').length,
      lastRotation: this.data.lastRotation,
      rotationCount: this.data.rotationCount,
      daysUntilNextRotation: Math.max(0, ROTATION_PERIOD_DAYS - 
        Math.floor((new Date() - new Date(this.data.lastRotation)) / (1000 * 60 * 60 * 24))),
      topPerformers: this.data.performance.topHooks.slice(0, 3).map(h => ({
        preview: h.text.substring(0, 50) + '...',
        engagement: (h.averageEngagement * 100).toFixed(2) + '%'
      }))
    };
    
    return summary;
  }
}

// Run rotation check if called directly
if (require.main === module) {
  console.log('\n🔮 Viral Hooks Analytics System\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const analytics = new ViralHooksAnalytics();
  
  // Check if rotation is due
  if (analytics.isRotationDue()) {
    console.log('⏰ 30 days have passed - performing rotation...\n');
    const report = analytics.performRotation();
    
    if (report) {
      console.log('\n📋 RECOMMENDATIONS:\n');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
  } else {
    const summary = analytics.generateSummary();
    console.log('📊 Current Status:\n');
    console.log(`   Total hooks tracked: ${summary.totalHooks}`);
    console.log(`   Active hooks: ${summary.activeHooks}`);
    console.log(`   Retiring: ${summary.retiringHooks}`);
    console.log(`   Retired: ${summary.retiredHooks}`);
    console.log(`   Last rotation: ${new Date(summary.lastRotation).toLocaleDateString()}`);
    console.log(`   Days until next rotation: ${summary.daysUntilNextRotation}`);
    
    if (summary.topPerformers.length > 0) {
      console.log('\n⭐ Top Performers:\n');
      summary.topPerformers.forEach((h, i) => {
        console.log(`   ${i + 1}. "${h.preview}" (${h.engagement})`);
      });
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

module.exports = ViralHooksAnalytics;
