#!/usr/bin/env node
/**
 * SOCIAL INTELLIGENCE ENGINE
 * 
 * Master orchestrator for AI-powered social media optimization:
 * - Coordinates hashtag optimization
 * - Integrates trending topics into content
 * - Applies agent feedback to improve quality
 * - Generates performance analytics
 * - Creates actionable insights
 * 
 * This is the main entry point for the social intelligence system.
 */

const HashtagOptimizer = require('./hashtag-optimizer');
const ContentFeedbackLoop = require('./content-feedback-loop');
const fs = require('fs');
const path = require('path');

class SocialIntelligenceEngine {
  constructor(config = {}) {
    this.config = {
      dashboardFile: config.dashboardFile || path.join(process.cwd(), '_data', 'social-analytics-dashboard.md'),
      performanceFile: config.performanceFile || path.join(process.cwd(), 'public', 'social-performance.json'),
      ...config
    };

    this.hashtagOptimizer = new HashtagOptimizer(config.hashtag || {});
    this.feedbackLoop = new ContentFeedbackLoop(config.feedback || {});
    
    this.insights = {
      timestamp: new Date().toISOString(),
      performance: {},
      recommendations: [],
      alerts: []
    };
  }

  /**
   * MAIN: Run complete social intelligence pipeline
   */
  async run() {
    console.log('\n' + '='.repeat(70));
    console.log('🧠 SOCIAL INTELLIGENCE ENGINE - Starting Full Pipeline');
    console.log('='.repeat(70) + '\n');

    try {
      // Phase 1: Optimize hashtags based on performance data
      console.log('📊 PHASE 1: Hashtag Optimization');
      console.log('─'.repeat(70));
      await this.hashtagOptimizer.optimize();
      this.insights.hashtags = this.hashtagOptimizer.performance;

      // Phase 2: Process agent feedback and auto-improve content
      console.log('\n🔄 PHASE 2: Content Feedback Loop');
      console.log('─'.repeat(70));
      await this.feedbackLoop.processAndApply();
      this.insights.improvements = this.feedbackLoop.improvements;

      // Phase 3: Generate integrated insights
      console.log('\n💡 PHASE 3: Generating Insights');
      console.log('─'.repeat(70));
      this.generateIntegratedInsights();

      // Phase 4: Create performance dashboard
      console.log('\n📈 PHASE 4: Creating Dashboard');
      console.log('─'.repeat(70));
      this.createDashboard();

      // Phase 5: Save results
      console.log('\n💾 PHASE 5: Saving Results');
      console.log('─'.repeat(70));
      this.savePerformanceData();

      console.log('\n' + '='.repeat(70));
      console.log('✅ SOCIAL INTELLIGENCE ENGINE - Complete');
      console.log('='.repeat(70) + '\n');

      this.printExecutiveSummary();

    } catch (err) {
      console.error('\n❌ Social Intelligence Engine failed:', err);
      throw err;
    }
  }

  /**
   * Generate integrated insights from all data sources
   */
  generateIntegratedInsights() {
    console.log('🔍 Analyzing cross-system patterns...\n');

    // Insight 1: Trending hashtags + content quality
    if (this.insights.hashtags.currentTrending && 
        this.insights.hashtags.currentTrending.length > 0) {
      
      const trending = this.insights.hashtags.currentTrending.slice(0, 3);
      this.insights.recommendations.push({
        type: 'content-strategy',
        priority: 'high',
        title: 'Create Content on Trending Topics',
        description: `Write blog posts about: ${trending.map(t => t.tag).join(', ')}`,
        expectedImpact: 'High visibility and engagement',
        action: 'Generate blog posts using agent-blog-production.js with these topics'
      });
    }

    // Insight 2: Low-performing content + improvement suggestions
    if (this.insights.improvements.deferredImprovements &&
        this.insights.improvements.deferredImprovements.length > 0) {
      
      this.insights.alerts.push({
        type: 'quality-alert',
        severity: 'medium',
        title: 'Content Quality Issues Detected',
        description: `${this.insights.improvements.deferredImprovements.length} posts need manual review`,
        action: 'Review feedback reports and apply improvements'
      });
    }

    // Insight 3: Hashtag performance correlation
    if (this.insights.hashtags.topPerformers && 
        this.insights.hashtags.topPerformers.length > 0) {
      
      this.insights.recommendations.push({
        type: 'hashtag-strategy',
        priority: 'high',
        title: 'Optimize Hashtag Usage',
        description: `Top performers: ${this.insights.hashtags.topPerformers.slice(0, 5).map(t => '#' + t).join(', ')}`,
        expectedImpact: 'Improved reach and engagement',
        action: 'Use these hashtags in next 5 posts'
      });
    }

    // Insight 4: Content volume analysis
    const postsDir = path.join(process.cwd(), '_posts');
    if (fs.existsSync(postsDir)) {
      const recentPosts = fs.readdirSync(postsDir)
        .filter(f => f.endsWith('.md'))
        .filter(f => {
          const stat = fs.statSync(path.join(postsDir, f));
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          return stat.mtimeMs > weekAgo;
        });

      if (recentPosts.length < 3) {
        this.insights.alerts.push({
          type: 'volume-alert',
          severity: 'low',
          title: 'Low Content Volume',
          description: `Only ${recentPosts.length} posts published in last 7 days`,
          action: 'Consider increasing content production frequency'
        });
      }
    }

    console.log(`   ✓ Generated ${this.insights.recommendations.length} recommendations`);
    console.log(`   ✓ Created ${this.insights.alerts.length} alerts`);
  }

  /**
   * Create human-readable analytics dashboard
   */
  createDashboard() {
    console.log('📊 Building analytics dashboard...\n');

    const now = new Date().toISOString();
    let dashboard = `---
title: Social Media Analytics Dashboard
layout: page
permalink: /analytics/social/
generated: ${now}
---

# 🧠 Social Media Intelligence Dashboard

**Last Updated:** ${new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' })}

---

## 📊 Performance Overview

`;

    // Hashtag Performance
    dashboard += `### 🏆 Top Performing Hashtags\n\n`;
    
    if (this.insights.hashtags.topPerformers && this.insights.hashtags.topPerformers.length > 0) {
      dashboard += `| Rank | Hashtag | Avg Engagement | Total Uses | Last Used |\n`;
      dashboard += `|------|---------|----------------|------------|----------|\n`;
      
      this.insights.hashtags.topPerformers.slice(0, 10).forEach((tag, i) => {
        const data = this.insights.hashtags.hashtags[tag];
        if (data) {
          const lastUsed = data.lastUsed ? 
            new Date(data.lastUsed).toLocaleDateString('en-CA') : 'N/A';
          dashboard += `| ${i + 1} | #${tag} | ${data.avgEngagementRate.toFixed(1)} | ${data.totalUses} | ${lastUsed} |\n`;
        }
      });
    } else {
      dashboard += `*No performance data available yet. Keep posting!*\n`;
    }

    // Trending Topics
    dashboard += `\n### 🔥 Currently Trending\n\n`;
    
    if (this.insights.hashtags.currentTrending && this.insights.hashtags.currentTrending.length > 0) {
      dashboard += `| Rank | Topic | Mentions | Source |\n`;
      dashboard += `|------|-------|----------|--------|\n`;
      
      this.insights.hashtags.currentTrending.slice(0, 10).forEach((trend, i) => {
        dashboard += `| ${i + 1} | #${trend.tag} | ${trend.mentions} | ${trend.source || 'social'} |\n`;
      });
    } else {
      dashboard += `*No trending topics detected.*\n`;
    }

    // Content Improvements
    dashboard += `\n### 🔄 Content Improvements\n\n`;
    
    if (this.insights.improvements) {
      dashboard += `- **Total improvements applied:** ${this.insights.improvements.totalImprovements || 0}\n`;
      dashboard += `- **Success rate:** ${this.insights.improvements.successMetrics ? 
        this.insights.improvements.successMetrics.issuesResolved : 0}%\n`;
    }

    // Recommendations
    dashboard += `\n## 💡 Recommendations\n\n`;
    
    if (this.insights.recommendations.length > 0) {
      this.insights.recommendations.forEach(rec => {
        dashboard += `### ${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.title}\n\n`;
        dashboard += `**Type:** ${rec.type}\n\n`;
        dashboard += `**Description:** ${rec.description}\n\n`;
        dashboard += `**Expected Impact:** ${rec.expectedImpact}\n\n`;
        dashboard += `**Action:** ${rec.action}\n\n`;
        dashboard += `---\n\n`;
      });
    } else {
      dashboard += `*No recommendations at this time.*\n`;
    }

    // Alerts
    if (this.insights.alerts.length > 0) {
      dashboard += `\n## ⚠️ Alerts\n\n`;
      
      this.insights.alerts.forEach(alert => {
        const icon = alert.severity === 'high' ? '🔴' : 
                     alert.severity === 'medium' ? '🟡' : '🟢';
        dashboard += `### ${icon} ${alert.title}\n\n`;
        dashboard += `**Severity:** ${alert.severity}\n\n`;
        dashboard += `${alert.description}\n\n`;
        dashboard += `**Action:** ${alert.action}\n\n`;
        dashboard += `---\n\n`;
      });
    }

    // Next Steps
    dashboard += `\n## 🚀 Next Steps\n\n`;
    dashboard += `1. Review top-performing hashtags and use in upcoming posts\n`;
    dashboard += `2. Create content on trending topics\n`;
    dashboard += `3. Apply recommended improvements to existing content\n`;
    dashboard += `4. Monitor alerts and take corrective action\n`;
    dashboard += `5. Continue A/B testing hashtag combinations\n`;

    // Save dashboard
    const dir = path.dirname(this.config.dashboardFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.config.dashboardFile, dashboard);
    console.log(`   ✓ Dashboard saved to ${this.config.dashboardFile}`);
  }

  /**
   * Save performance data
   */
  savePerformanceData() {
    const performanceData = {
      version: '1.0',
      generated: new Date().toISOString(),
      insights: this.insights,
      hashtags: this.insights.hashtags,
      improvements: this.insights.improvements
    };

    const dir = path.dirname(this.config.performanceFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.config.performanceFile, JSON.stringify(performanceData, null, 2));
    console.log(`   ✓ Performance data saved to ${this.config.performanceFile}`);
  }

  /**
   * Print executive summary
   */
  printExecutiveSummary() {
    console.log('━'.repeat(70));
    console.log('📋 EXECUTIVE SUMMARY');
    console.log('━'.repeat(70));
    
    console.log('\n🎯 Key Metrics:');
    console.log(`   • Top hashtag performance: ${this.insights.hashtags.topPerformers ? 
      this.insights.hashtags.topPerformers.length + ' high performers' : 'No data'}`);
    console.log(`   • Trending topics: ${this.insights.hashtags.currentTrending ? 
      this.insights.hashtags.currentTrending.length + ' detected' : 'None'}`);
    console.log(`   • Content improvements: ${this.insights.improvements.totalImprovements || 0} applied`);
    
    console.log('\n💡 Action Items:');
    console.log(`   • High priority: ${this.insights.recommendations.filter(r => r.priority === 'high').length}`);
    console.log(`   • Medium priority: ${this.insights.recommendations.filter(r => r.priority === 'medium').length}`);
    console.log(`   • Alerts: ${this.insights.alerts.length}`);

    console.log('\n📊 View full dashboard at: ' + this.config.dashboardFile);
    console.log('\n');
  }
}

// Run if called directly
if (require.main === module) {
  const engine = new SocialIntelligenceEngine();
  engine.run()
    .then(() => {
      console.log('✅ Social Intelligence Engine complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Social Intelligence Engine failed:', err);
      process.exit(1);
    });
}

module.exports = SocialIntelligenceEngine;
