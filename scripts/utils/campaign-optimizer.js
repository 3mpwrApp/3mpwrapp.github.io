#!/usr/bin/env node
/**
 * CAMPAIGN-OPTIMIZER.JS
 * Analyzes campaign analytics and provides optimization recommendations
 * 
 * Features:
 * - Reviews 7-day performance trends
 * - Identifies best posting times based on engagement
 * - Suggests content improvements based on top performers
 * - Recommends platform allocation adjustments
 * - Generates A/B testing suggestions
 * 
 * Runs: Weekly via GitHub Actions or manually
 */

const fs = require('fs');
const path = require('path');

const ANALYTICS_FILE = path.join(process.cwd(), 'public', 'campaign-analytics.json');
const OPTIMIZATION_FILE = path.join(process.cwd(), 'docs', 'campaign-optimization-report.md');

class CampaignOptimizer {
  constructor() {
    this.analytics = this.loadAnalytics();
  }

  loadAnalytics() {
    if (!fs.existsSync(ANALYTICS_FILE)) {
      console.log('⚠️ No analytics data found. Run campaign-analytics-tracker.js first.');
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
  }

  /**
   * Analyze 7-day trends
   */
  analyze7DayTrends() {
    const snapshots = this.analytics.dailySnapshots.slice(-7);
    
    if (snapshots.length < 2) {
      return { status: 'insufficient_data', message: 'Need at least 2 days of data' };
    }

    const trends = {};
    
    for (const [campaignId, campaign] of Object.entries(this.analytics.campaigns)) {
      const recentSnapshots = snapshots
        .map(s => s.campaigns[campaignId])
        .filter(Boolean);
      
      if (recentSnapshots.length < 2) continue;
      
      const first = recentSnapshots[0];
      const last = recentSnapshots[recentSnapshots.length - 1];
      
      const postGrowth = last.totalPosts - first.totalPosts;
      const engagementTrend = last.engagementRate - first.engagementRate;
      
      trends[campaignId] = {
        posts: postGrowth,
        engagementChange: engagementTrend,
        direction: engagementTrend > 0 ? '📈 Improving' : engagementTrend < 0 ? '📉 Declining' : '➡️ Stable'
      };
    }
    
    return trends;
  }

  /**
   * Generate platform allocation recommendations
   */
  analyzePlatformAllocation() {
    const recommendations = [];
    
    for (const [campaignId, campaign] of Object.entries(this.analytics.campaigns)) {
      const platforms = Object.entries(campaign.platforms)
        .map(([name, data]) => ({
          name,
          engagement: data.avgEngagement,
          posts: data.posts,
          successRate: data.posts / (data.posts + data.failures || 1)
        }))
        .sort((a, b) => b.engagement - a.engagement);
      
      if (platforms.length < 2) continue;
      
      const top = platforms[0];
      const bottom = platforms[platforms.length - 1];
      
      // If top platform has 2x+ engagement, recommend shifting focus
      if (top.engagement > bottom.engagement * 2) {
        recommendations.push({
          campaign: campaignId,
          priority: 'HIGH',
          type: 'platform_shift',
          recommendation: `${top.name} shows 2x better engagement than ${bottom.name}`,
          action: `Consider A/B testing: increase ${top.name} frequency or test ${bottom.name} at different times`,
          metrics: {
            topPlatform: top.name,
            topEngagement: top.engagement.toFixed(2),
            bottomPlatform: bottom.name,
            bottomEngagement: bottom.engagement.toFixed(2)
          }
        });
      }
      
      // Check for platform failures
      platforms.forEach(platform => {
        if (platform.successRate < 0.9 && platform.posts > 5) {
          recommendations.push({
            campaign: campaignId,
            priority: 'CRITICAL',
            type: 'technical_issue',
            recommendation: `${platform.name} success rate: ${(platform.successRate * 100).toFixed(0)}%`,
            action: 'Investigate API credentials, rate limits, or connectivity issues'
          });
        }
      });
    }
    
    return recommendations;
  }

  /**
   * Identify top-performing content variants
   */
  analyzeContentVariants() {
    const insights = [];
    
    for (const [campaignId, campaign] of Object.entries(this.analytics.campaigns)) {
      const variants = Object.entries(campaign.postVariants || {})
        .map(([key, data]) => ({
          index: data.index,
          uses: data.uses,
          engagement: data.avgEngagement,
          platforms: data.platforms
        }))
        .sort((a, b) => b.engagement - a.engagement);
      
      if (variants.length < 3) continue;
      
      const top = variants[0];
      const avg = variants.reduce((sum, v) => sum + v.engagement, 0) / variants.length;
      
      if (top.engagement > avg * 1.5) {
        insights.push({
          campaign: campaignId,
          topVariant: top.index,
          performance: `${((top.engagement / avg - 1) * 100).toFixed(0)}% above average`,
          recommendation: `Variant ${top.index + 1} performing best - analyze its messaging/structure for future posts`
        });
      }
    }
    
    return insights;
  }

  /**
   * Suggest optimal posting times based on engagement
   */
  suggestPostingTimes() {
    // This would require timestamp data - placeholder for future enhancement
    return {
      note: 'Time-based analysis requires timestamp tracking in post data',
      currentSchedule: {
        'Mon/Wed/Fri 8AM EST': 'Day of Mourning, Bill 86',
        'Tue/Thu 10AM EST': 'Migrant Worker',
        'Tue/Fri 11AM EST': 'Disability Bulletin'
      },
      suggestion: 'Monitor first 2 weeks to establish baseline before adjusting times'
    };
  }

  /**
   * Generate A/B testing recommendations
   */
  generateABTests() {
    const tests = [];
    
    // Suggest testing different post formats
    tests.push({
      test: 'Post Length Test',
      hypothesis: 'Shorter vs longer post text affects engagement',
      setup: 'Create 2 new variants: one with <100 chars, one with >200 chars',
      duration: '2 weeks',
      metric: 'Engagement rate per platform'
    });
    
    // Suggest testing emoji usage
    tests.push({
      test: 'Emoji Density Test',
      hypothesis: 'Emoji count affects click-through and shares',
      setup: 'Test posts with 0-1 emoji vs 3-5 emojis',
      duration: '2 weeks',
      metric: 'Click-through rate and shares'
    });
    
    // Suggest testing call-to-action variations
    tests.push({
      test: 'CTA Placement Test',
      hypothesis: 'CTA at beginning vs end affects engagement',
      setup: 'Alternate CTA position in post variants',
      duration: '1 week',
      metric: 'Action completion rate (link clicks, event RSVPs)'
    });
    
    return tests;
  }

  /**
   * Generate comprehensive optimization report
   */
  generateReport() {
    console.log('\n🔍 CAMPAIGN OPTIMIZATION ANALYSIS\n');
    console.log('='.repeat(70));
    
    const trends = this.analyze7DayTrends();
    const platformRecs = this.analyzePlatformAllocation();
    const contentInsights = this.analyzeContentVariants();
    const timingRecs = this.suggestPostingTimes();
    const abTests = this.generateABTests();
    
    // Build markdown report
    let report = `# Campaign Optimization Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `**Data Period:** Last ${this.analytics.dailySnapshots.length} days\n\n`;
    report += `---\n\n`;
    
    // 7-Day Trends
    report += `## 📊 7-Day Performance Trends\n\n`;
    if (trends.status === 'insufficient_data') {
      report += `⚠️ ${trends.message}\n\n`;
    } else {
      for (const [campaignId, trend] of Object.entries(trends)) {
        report += `### ${campaignId}\n`;
        report += `- Posts: +${trend.posts} this week\n`;
        report += `- Engagement: ${trend.direction}\n`;
        report += `- Change: ${trend.engagementChange > 0 ? '+' : ''}${trend.engagementChange.toFixed(2)}\n\n`;
      }
    }
    
    // Platform Recommendations
    report += `## 🎯 Platform Optimization\n\n`;
    if (platformRecs.length === 0) {
      report += `✅ All platforms performing consistently\n\n`;
    } else {
      platformRecs.forEach((rec, i) => {
        const icon = rec.priority === 'CRITICAL' ? '🔴' : rec.priority === 'HIGH' ? '🟡' : '🟢';
        report += `${icon} **${rec.campaign}** - ${rec.type}\n`;
        report += `   - Finding: ${rec.recommendation}\n`;
        report += `   - Action: ${rec.action}\n\n`;
      });
    }
    
    // Content Insights
    report += `## 💡 Content Performance Insights\n\n`;
    if (contentInsights.length === 0) {
      report += `📊 Need more data to identify top-performing variants\n\n`;
    } else {
      contentInsights.forEach(insight => {
        report += `### ${insight.campaign}\n`;
        report += `- **Top Variant:** #${insight.topVariant + 1}\n`;
        report += `- **Performance:** ${insight.performance}\n`;
        report += `- **Recommendation:** ${insight.recommendation}\n\n`;
      });
    }
    
    // Posting Times
    report += `## ⏰ Posting Schedule Analysis\n\n`;
    report += `**Current Schedule:**\n\n`;
    for (const [time, campaigns] of Object.entries(timingRecs.currentSchedule)) {
      report += `- ${time}: ${campaigns}\n`;
    }
    report += `\n💡 ${timingRecs.suggestion}\n\n`;
    
    // A/B Testing Suggestions
    report += `## 🧪 Recommended A/B Tests\n\n`;
    abTests.forEach((test, i) => {
      report += `### ${i + 1}. ${test.test}\n`;
      report += `- **Hypothesis:** ${test.hypothesis}\n`;
      report += `- **Setup:** ${test.setup}\n`;
      report += `- **Duration:** ${test.duration}\n`;
      report += `- **Metric:** ${test.metric}\n\n`;
    });
    
    // Overall Recommendations
    report += `## 🎬 Action Items\n\n`;
    report += `### This Week:\n`;
    report += `1. ✅ Continue current posting schedule\n`;
    report += `2. 📊 Monitor platform-specific engagement patterns\n`;
    report += `3. 🔍 Identify which post variants get most shares\n\n`;
    
    report += `### Next Week:\n`;
    report += `1. 🧪 Implement first A/B test (Post Length)\n`;
    report += `2. 📈 Review 14-day trends for timing optimization\n`;
    report += `3. 💬 Analyze Discord vs Mastodon vs Bluesky preferences\n\n`;
    
    report += `---\n\n`;
    report += `*Auto-generated by campaign-optimizer.js*\n`;
    
    // Save report
    const dir = path.dirname(OPTIMIZATION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(OPTIMIZATION_FILE, report);
    
    console.log(`\n✅ Optimization report saved: ${OPTIMIZATION_FILE}\n`);
    
    // Console summary
    console.log('📋 SUMMARY\n');
    console.log(`Platform Recommendations: ${platformRecs.length}`);
    console.log(`Content Insights: ${contentInsights.length}`);
    console.log(`A/B Tests Suggested: ${abTests.length}`);
    console.log('='.repeat(70) + '\n');
    
    return report;
  }
}

// Main execution
function main() {
  const optimizer = new CampaignOptimizer();
  optimizer.generateReport();
}

if (require.main === module) {
  main();
}

module.exports = CampaignOptimizer;
