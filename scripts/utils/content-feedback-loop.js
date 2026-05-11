#!/usr/bin/env node
/**
 * CONTENT FEEDBACK LOOP
 * 
 * Automated system to apply agent recommendations and improve content quality:
 * - Parse agent feedback reports
 * - Identify actionable improvements
 * - Auto-apply high-confidence fixes
 * - Track recommendation success rate
 * - Generate improvement reports
 * 
 * Integrates with: agent-feedback-system.js, agent-blog-production.js
 */

const fs = require('fs');
const path = require('path');

class ContentFeedbackLoop {
  constructor(config = {}) {
    this.config = {
      feedbackDir: config.feedbackDir || path.join(process.cwd(), 'feedback'),
      postsDir: config.postsDir || path.join(process.cwd(), '_posts'),
      logsDir: config.logsDir || path.join(process.cwd(), 'logs', 'feedback-loop'),
      improvementsFile: config.improvementsFile || path.join(process.cwd(), 'public', 'content-improvements.json'),
      autoApplyThreshold: config.autoApplyThreshold || 0.8, // 80% confidence
      ...config
    };

    // Create directories if needed
    [this.config.logsDir, path.dirname(this.config.improvementsFile)].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    this.improvements = this.loadImprovements();
    this.appliedFixes = [];
    this.stats = {
      feedbackReviewed: 0,
      issuesFound: 0,
      fixesApplied: 0,
      fixesDeferred: 0,
      successRate: 0
    };
  }

  /**
   * Load improvement tracking data
   */
  loadImprovements() {
    const defaultData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      totalImprovements: 0,
      appliedImprovements: [],
      deferredImprovements: [],
      successMetrics: {
        qualityScoreIncrease: 0,
        issuesResolved: 0,
        engagementImprovement: 0
      }
    };

    if (fs.existsSync(this.config.improvementsFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.config.improvementsFile, 'utf8'));
        return { ...defaultData, ...data };
      } catch (err) {
        console.warn(`⚠️ Improvements data load error: ${err.message}`);
      }
    }

    return defaultData;
  }

  /**
   * Save improvement tracking data
   */
  saveImprovements() {
    try {
      this.improvements.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.config.improvementsFile, JSON.stringify(this.improvements, null, 2));
      console.log(`✅ Saved improvements to ${this.config.improvementsFile}`);
    } catch (err) {
      console.error(`❌ Failed to save improvements: ${err.message}`);
    }
  }

  /**
   * MAIN: Process agent feedback and apply improvements
   */
  async processAndApply() {
    console.log('\n🔄 CONTENT FEEDBACK LOOP - Starting\n');

    // Step 1: Load latest agent feedback
    const feedback = this.loadLatestFeedback();
    if (!feedback) {
      console.log('⚠️ No feedback found to process');
      return;
    }

    console.log(`📄 Processing feedback from: ${feedback.filename}`);
    this.stats.feedbackReviewed++;

    // Step 2: Extract actionable recommendations
    const recommendations = this.extractRecommendations(feedback);
    console.log(`💡 Found ${recommendations.length} recommendations`);
    this.stats.issuesFound += recommendations.length;

    // Step 3: Classify recommendations by confidence
    const classified = this.classifyRecommendations(recommendations);
    console.log(`   ✓ High confidence: ${classified.highConfidence.length}`);
    console.log(`   ✓ Medium confidence: ${classified.mediumConfidence.length}`);
    console.log(`   ✓ Low confidence: ${classified.lowConfidence.length}`);

    // Step 4: Auto-apply high-confidence fixes
    await this.autoApplyFixes(classified.highConfidence, feedback);

    // Step 5: Generate guidance for medium-confidence fixes
    this.generateManualGuidance(classified.mediumConfidence);

    // Step 6: Update improvement tracking
    this.updateImprovementTracking();

    // Step 7: Save results
    this.saveImprovements();
    this.generateReport();

    console.log('\n✅ Feedback loop processing complete!\n');
  }

  /**
   * Load latest agent feedback report
   */
  loadLatestFeedback() {
    if (!fs.existsSync(this.config.feedbackDir)) {
      return null;
    }

    const feedbackFiles = fs.readdirSync(this.config.feedbackDir)
      .filter(f => f.startsWith('agent-feedback-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (feedbackFiles.length === 0) {
      return null;
    }

    const latestFile = feedbackFiles[0];
    const content = fs.readFileSync(path.join(this.config.feedbackDir, latestFile), 'utf8');
    
    return {
      filename: latestFile,
      data: JSON.parse(content)
    };
  }

  /**
   * Extract actionable recommendations from feedback
   */
  extractRecommendations(feedback) {
    const recommendations = [];

    // New structured format from enhanced agent-feedback-system
    if (feedback.data.actionableRecommendations) {
      const actionable = feedback.data.actionableRecommendations;
      
      // High priority
      if (actionable.highPriority) {
        actionable.highPriority.forEach(rec => {
          recommendations.push({
            type: rec.type,
            source: 'actionable-high',
            filename: rec.target,
            issue: rec.issue,
            action: rec.action,
            confidence: rec.confidence,
            priority: 'high'
          });
        });
      }

      // Medium priority
      if (actionable.mediumPriority) {
        actionable.mediumPriority.forEach(rec => {
          recommendations.push({
            type: rec.type,
            source: 'actionable-medium',
            filename: rec.target,
            issue: rec.issue,
            action: rec.action,
            confidence: rec.confidence,
            priority: 'medium'
          });
        });
      }

      // Low priority
      if (actionable.lowPriority) {
        actionable.lowPriority.forEach(rec => {
          recommendations.push({
            type: rec.type,
            source: 'actionable-low',
            filename: rec.target,
            issue: rec.issue,
            action: rec.action,
            confidence: rec.confidence,
            priority: 'low'
          });
        });
      }
    }

    // Legacy format support - extract from blog post issues
    if (feedback.data.results && feedback.data.results.posts) {
      feedback.data.results.posts.forEach(post => {
        if (post.issues && post.issues.length > 0) {
          post.issues.forEach(issue => {
            recommendations.push({
              type: 'issue',
              source: 'blog-post',
              filename: post.filename,
              issue,
              recommendation: post.recommendations || [],
              qualityScore: post.qualityScore,
              priority: 'medium'
            });
          });
        }
      });
    }

    // Extract general recommendations
    if (feedback.data.recommendations) {
      feedback.data.recommendations.forEach(rec => {
        recommendations.push({
          type: 'general',
          source: 'global',
          recommendation: rec,
          priority: 'low'
        });
      });
    }

    return recommendations;
  }

  /**
   * Classify recommendations by confidence level
   */
  classifyRecommendations(recommendations) {
    const classified = {
      highConfidence: [],
      mediumConfidence: [],
      lowConfidence: []
    };

    recommendations.forEach(rec => {
      const confidence = this.calculateConfidence(rec);
      rec.confidence = confidence;

      if (confidence >= 0.8) {
        classified.highConfidence.push(rec);
      } else if (confidence >= 0.5) {
        classified.mediumConfidence.push(rec);
      } else {
        classified.lowConfidence.push(rec);
      }
    });

    return classified;
  }

  /**
   * Calculate confidence score for a recommendation
   */
  calculateConfidence(rec) {
    // If confidence is already set (from actionable recommendations), use it
    if (rec.confidence !== undefined) {
      return rec.confidence;
    }

    let confidence = 0.5; // Base confidence

    // High confidence fixes (pattern-based, safe to auto-apply)
    const highConfidencePatterns = [
      /missing.*meta.*description/i,
      /no.*alt.*text/i,
      /heading.*structure/i,
      /too.*short/i,
      /missing.*cta/i,
      /no.*hashtags/i,
      /add.*hashtags/i
    ];

    // Medium confidence fixes (need some context)
    const mediumConfidencePatterns = [
      /readability/i,
      /sentence.*length/i,
      /paragraph.*length/i,
      /keyword.*density/i
    ];

    const issueText = rec.issue || rec.action || JSON.stringify(rec.recommendation);

    // Check patterns
    if (highConfidencePatterns.some(pattern => pattern.test(issueText))) {
      confidence = 0.9;
    } else if (mediumConfidencePatterns.some(pattern => pattern.test(issueText))) {
      confidence = 0.6;
    }

    // Boost confidence if same issue seen multiple times
    const historicalSuccessRate = this.getHistoricalSuccessRate(issueText);
    if (historicalSuccessRate > 0) {
      confidence = Math.min(1.0, confidence + historicalSuccessRate * 0.2);
    }

    return confidence;
  }

  /**
   * Get historical success rate for similar fixes
   */
  getHistoricalSuccessRate(issueText) {
    // Simplified - would check improvement history in production
    return 0;
  }

  /**
   * Auto-apply high-confidence fixes
   */
  async autoApplyFixes(fixes, feedback) {
    console.log(`\n🤖 Auto-applying ${fixes.length} high-confidence fixes...`);

    for (const fix of fixes) {
      try {
        const applied = await this.applyFix(fix);
        if (applied) {
          this.appliedFixes.push({
            ...fix,
            appliedAt: new Date().toISOString(),
            status: 'applied'
          });
          this.stats.fixesApplied++;
          console.log(`   ✓ Applied: ${fix.issue || JSON.stringify(fix.recommendation).substring(0, 50)}`);
        } else {
          this.stats.fixesDeferred++;
        }
      } catch (err) {
        console.error(`   ❌ Failed to apply fix: ${err.message}`);
        this.stats.fixesDeferred++;
      }
    }
  }

  /**
   * Apply a single fix
   */
  async applyFix(fix) {
    const issueText = fix.issue || '';

    // Fix 1: Missing hashtags
    if (/no.*hashtags|missing.*hashtags/i.test(issueText) && fix.filename) {
      return this.addHashtagsToPost(fix.filename);
    }

    // Fix 2: Missing CTA
    if (/missing.*cta|no.*call.*to.*action/i.test(issueText) && fix.filename) {
      return this.addCTAToPost(fix.filename);
    }

    // Fix 3: Too short content
    if (/too.*short|content.*too.*short/i.test(issueText) && fix.filename) {
      return this.flagForContentExpansion(fix.filename);
    }

    // More fixes can be added here
    return false;
  }

  /**
   * Add recommended hashtags to a post
   */
  addHashtagsToPost(filename) {
    const filePath = path.join(this.config.postsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }

    // Load optimized hashtags
    const optimizedHashtagsFile = path.join(process.cwd(), '_data', 'optimized-hashtags.json');
    if (!fs.existsSync(optimizedHashtagsFile)) {
      return false;
    }

    const optimized = JSON.parse(fs.readFileSync(optimizedHashtagsFile, 'utf8'));
    const recommendedTags = optimized.recommended.slice(0, 5);

    // Read post content
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if post already has tags
    if (content.match(/^tags:/m)) {
      return false; // Already has tags
    }

    // Find frontmatter end
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return false;
    }

    // Insert tags before closing ---
    const frontmatter = frontmatterMatch[1];
    const newFrontmatter = frontmatter + `\ntags: [${recommendedTags.join(', ')}]`;
    content = content.replace(frontmatterMatch[0], `---\n${newFrontmatter}\n---`);

    // Save updated content
    fs.writeFileSync(filePath, content);
    
    return true;
  }

  /**
   * Add call-to-action to a post
   */
  addCTAToPost(filename) {
    const filePath = path.join(this.config.postsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if post already has CTA
    if (/join.*waitlist|get.*involved|share.*this|learn.*more/i.test(content)) {
      return false; // Already has CTA
    }

    // Add CTA at the end
    const cta = `\n\n---\n\n## Get Involved\n\nWant to join the 3mpwrApp community?\n\n- **Join the waitlist:** [Sign up for beta access](https://3mpwrapp.com/waitlist)\n- **Share this post:** Help spread the word to those who need it\n- **Follow us:** Stay updated on [X](https://x.com/3mpwrApp), [Bluesky](https://bsky.app/profile/3mpwrapp.com), and [Mastodon](https://mastodon.social/@3mpwrapp)\n`;

    content += cta;

    // Save updated content
    fs.writeFileSync(filePath, content);
    
    return true;
  }

  /**
   * Flag content for expansion (manual task)
   */
  flagForContentExpansion(filename) {
    // Create a task file for human review
    const taskFile = path.join(this.config.logsDir, `expand-${filename}.txt`);
    const task = `CONTENT EXPANSION NEEDED\n\nFile: ${filename}\nReason: Content too short\nSuggestion: Add more detailed examples, case studies, or step-by-step guides\nTarget: 1500+ words\nPriority: Medium\n`;
    
    fs.writeFileSync(taskFile, task);
    return true;
  }

  /**
   * Generate manual guidance for medium-confidence fixes
   */
  generateManualGuidance(fixes) {
    if (fixes.length === 0) {
      return;
    }

    console.log(`\n📝 Generating manual guidance for ${fixes.length} medium-confidence fixes...`);

    const guidanceFile = path.join(this.config.logsDir, `manual-guidance-${Date.now()}.md`);
    let guidance = `# Content Improvement Guidance\n\nGenerated: ${new Date().toISOString()}\n\n`;
    guidance += `## Medium-Confidence Recommendations\n\n`;
    guidance += `These recommendations require human review before applying.\n\n`;

    fixes.forEach((fix, i) => {
      guidance += `### ${i + 1}. ${fix.filename || 'General'}\n\n`;
      guidance += `**Issue:** ${fix.issue || JSON.stringify(fix.recommendation)}\n\n`;
      guidance += `**Confidence:** ${(fix.confidence * 100).toFixed(0)}%\n\n`;
      guidance += `**Action:** Review and apply manually if appropriate\n\n`;
      guidance += `---\n\n`;
    });

    fs.writeFileSync(guidanceFile, guidance);
    console.log(`   ✓ Saved guidance to ${guidanceFile}`);
  }

  /**
   * Update improvement tracking
   */
  updateImprovementTracking() {
    this.improvements.totalImprovements += this.appliedFixes.length;
    this.improvements.appliedImprovements.push(...this.appliedFixes);

    // Calculate success metrics
    if (this.improvements.appliedImprovements.length > 0) {
      this.stats.successRate = this.stats.fixesApplied / 
        (this.stats.fixesApplied + this.stats.fixesDeferred);
    }
  }

  /**
   * Generate improvement report
   */
  generateReport() {
    console.log('\n━'.repeat(70));
    console.log('📊 CONTENT IMPROVEMENT REPORT');
    console.log('━'.repeat(70));
    console.log(`\n📄 Feedback reviewed: ${this.stats.feedbackReviewed}`);
    console.log(`🔍 Issues found: ${this.stats.issuesFound}`);
    console.log(`✅ Fixes applied: ${this.stats.fixesApplied}`);
    console.log(`⏸️  Fixes deferred: ${this.stats.fixesDeferred}`);
    console.log(`📈 Success rate: ${(this.stats.successRate * 100).toFixed(1)}%`);
    
    if (this.appliedFixes.length > 0) {
      console.log(`\n🤖 Applied Fixes:`);
      this.appliedFixes.forEach((fix, i) => {
        console.log(`   ${i + 1}. ${fix.filename || 'General'}: ${fix.issue || 'Improvement applied'}`);
      });
    }

    console.log('\n');
  }
}

// Run if called directly
if (require.main === module) {
  const feedbackLoop = new ContentFeedbackLoop();
  feedbackLoop.processAndApply()
    .then(() => {
      console.log('✅ Feedback loop complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Feedback loop failed:', err);
      process.exit(1);
    });
}

module.exports = ContentFeedbackLoop;
