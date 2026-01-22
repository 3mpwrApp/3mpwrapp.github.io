/**
 * AGENT FEEDBACK SYSTEM
 * 
 * Collects, analyzes, and provides AI-powered feedback on:
 * - Blog posts
 * - Curated articles  
 * - Trending topics
 * - Hashtags & social performance
 * - Content quality & engagement
 * 
 * Uses multiple AI agents to provide comprehensive content analysis
 */

const fs = require('fs');
const path = require('path');

class AgentFeedbackSystem {
  constructor(config = {}) {
    this.config = {
      postsDir: config.postsDir || path.join(process.cwd(), '_posts'),
      curationDir: config.curationDir || path.join(process.cwd(), '_curation'),
      feedbackDir: config.feedbackDir || path.join(process.cwd(), 'feedback'),
      logsDir: config.logsDir || path.join(process.cwd(), 'logs/feedback'),
      aiModel: config.aiModel || 'claude-3.5-sonnet',
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      ...config
    };

    // Create directories if they don't exist
    [this.config.feedbackDir, this.config.logsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    this.feedbackCache = [];
    this.analysisResults = {
      posts: [],
      articles: [],
      trending: [],
      hashtags: [],
      overall: {}
    };
  }

  /**
   * MAIN: Analyze all content and provide comprehensive feedback
   */
  async analyzeAll() {
    console.log(`\n${'='.repeat(70)}`);
    console.log('🤖 AGENT FEEDBACK SYSTEM - COMPREHENSIVE ANALYSIS');
    console.log(`${'='.repeat(70)}\n`);

    try {
      // Analyze blog posts
      await this.analyzeBlogPosts();

      // Analyze curated articles
      await this.analyzeCuratedArticles();

      // Analyze trending topics
      await this.analyzeTrendingTopics();

      // Analyze hashtag performance
      await this.analyzeHashtags();

      // Generate overall recommendations
      await this.generateRecommendations();

      // Save results
      this.saveFeedback();

      console.log(`\n✅ Analysis complete! Feedback saved to: ${this.config.feedbackDir}\n`);

    } catch (err) {
      console.error(`❌ Error during analysis: ${err.message}`);
      throw err;
    }
  }

  /**
   * ANALYZE BLOG POSTS
   * Quality, engagement potential, SEO, accessibility
   */
  async analyzeBlogPosts() {
    console.log('📝 Analyzing Blog Posts...\n');

    if (!fs.existsSync(this.config.postsDir)) {
      console.log('⚠️  Posts directory not found. Skipping blog analysis.\n');
      return;
    }

    const postFiles = fs.readdirSync(this.config.postsDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 10); // Analyze last 10 posts

    for (const file of postFiles) {
      const filePath = path.join(this.config.postsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const analysis = await this.analyzePost(file, content);
      this.analysisResults.posts.push(analysis);

      console.log(`   ✓ ${file}`);
      console.log(`     Quality: ${analysis.qualityScore}/10`);
      console.log(`     Engagement: ${analysis.engagementPotential}`);
      console.log(`     Issues: ${analysis.issues.length}\n`);
    }
  }

  /**
   * ANALYZE SINGLE BLOG POST
   */
  async analyzePost(filename, content) {
    const analysis = {
      filename,
      timestamp: new Date().toISOString(),
      qualityScore: 0,
      engagementPotential: 'unknown',
      issues: [],
      strengths: [],
      recommendations: []
    };

    // Extract frontmatter and content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

    // QUALITY CHECKS

    // 1. Length check
    const wordCount = bodyContent.split(/\s+/).length;
    if (wordCount < 300) {
      analysis.issues.push('Content too short (< 300 words)');
      analysis.qualityScore -= 2;
    } else if (wordCount > 2000) {
      analysis.strengths.push('Comprehensive content (2000+ words)');
      analysis.qualityScore += 2;
    } else {
      analysis.qualityScore += 1;
    }

    // 2. Heading structure
    const h2Count = (bodyContent.match(/^## /gm) || []).length;
    const h3Count = (bodyContent.match(/^### /gm) || []).length;
    if (h2Count === 0) {
      analysis.issues.push('No H2 headings - poor structure');
      analysis.qualityScore -= 1;
    } else if (h2Count >= 3) {
      analysis.strengths.push('Well-structured with multiple sections');
      analysis.qualityScore += 1;
    }

    // 3. Accessibility checks
    const imageMatches = bodyContent.match(/!\[([^\]]*)\]/g) || [];
    const hasAltText = imageMatches.every(img => {
      const altText = img.match(/!\[([^\]]+)\]/);
      return altText && altText[1].length > 0;
    });
    
    if (imageMatches.length > 0 && !hasAltText) {
      analysis.issues.push('Images missing alt text');
      analysis.qualityScore -= 1;
    } else if (hasAltText && imageMatches.length > 0) {
      analysis.strengths.push('All images have alt text');
      analysis.qualityScore += 1;
    }

    // 4. Link quality
    const linkCount = (bodyContent.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
    if (linkCount === 0) {
      analysis.recommendations.push('Consider adding relevant links to sources or related content');
    } else if (linkCount >= 3) {
      analysis.strengths.push('Good use of internal/external linking');
      analysis.qualityScore += 1;
    }

    // 5. Call-to-action
    const hasCTA = /share|comment|feedback|subscribe|join|participate/i.test(bodyContent);
    if (!hasCTA) {
      analysis.recommendations.push('Add call-to-action for engagement');
    } else {
      analysis.strengths.push('Contains engagement call-to-action');
      analysis.qualityScore += 1;
    }

    // 6. Disability-focused keywords
    const disabilityKeywords = [
      'disability', 'accessible', 'accessibility', 'inclusion', 'barrier',
      'accommodation', 'ableism', 'neurodivergent', 'chronic illness',
      'mental health', 'wheelchair', 'blind', 'deaf', 'assistance'
    ];
    const keywordCount = disabilityKeywords.filter(kw => 
      new RegExp(kw, 'i').test(bodyContent)
    ).length;

    if (keywordCount >= 5) {
      analysis.strengths.push('Strong disability community focus');
      analysis.qualityScore += 2;
    } else if (keywordCount < 2) {
      analysis.issues.push('Limited disability-focused keywords');
      analysis.qualityScore -= 1;
    }

    // 7. Readability
    const avgWordsPerSentence = this.calculateReadability(bodyContent);
    if (avgWordsPerSentence > 25) {
      analysis.issues.push('Sentences too long - may be hard to read');
      analysis.recommendations.push('Break up long sentences for better readability');
    } else if (avgWordsPerSentence < 15) {
      analysis.strengths.push('Good readability - concise sentences');
      analysis.qualityScore += 1;
    }

    // ENGAGEMENT POTENTIAL
    const engagementScore = 
      (wordCount > 500 ? 2 : 0) +
      (h2Count >= 3 ? 1 : 0) +
      (linkCount >= 3 ? 1 : 0) +
      (hasCTA ? 1 : 0) +
      (keywordCount >= 5 ? 2 : 0);

    if (engagementScore >= 6) {
      analysis.engagementPotential = 'high';
    } else if (engagementScore >= 3) {
      analysis.engagementPotential = 'medium';
    } else {
      analysis.engagementPotential = 'low';
      analysis.recommendations.push('Increase engagement potential with better structure and CTAs');
    }

    // Normalize quality score (0-10)
    analysis.qualityScore = Math.max(0, Math.min(10, analysis.qualityScore + 5));

    // SPECIFIC RECOMMENDATIONS
    if (analysis.qualityScore < 6) {
      analysis.recommendations.unshift('⚠️ PRIORITY: Improve overall content quality');
    }
    if (wordCount < 500) {
      analysis.recommendations.push('Expand content with more detail and examples');
    }
    if (!hasCTA) {
      analysis.recommendations.push('Add engagement prompts (share, comment, feedback)');
    }

    return analysis;
  }

  /**
   * ANALYZE CURATED ARTICLES
   * Relevance, diversity, quality of sources
   */
  async analyzeCuratedArticles() {
    console.log('📰 Analyzing Curated Articles...\n');

    if (!fs.existsSync(this.config.curationDir)) {
      console.log('⚠️  Curation directory not found. Skipping article analysis.\n');
      return;
    }

    const curationFiles = fs.readdirSync(this.config.curationDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 7); // Last week of curations

    const allArticles = [];
    const sources = new Set();
    const topics = new Map();

    for (const file of curationFiles) {
      const filePath = path.join(this.config.curationDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract articles
      const articleMatches = content.matchAll(/## (.+?)\n([\s\S]*?)(?=\n## |\n---|\Z)/g);
      
      for (const match of articleMatches) {
        const title = match[1];
        const articleContent = match[2];
        
        // Extract source URL
        const urlMatch = articleContent.match(/\[(?:Source|Read More)\]\((https?:\/\/[^)]+)\)/);
        if (urlMatch) {
          const url = new URL(urlMatch[1]);
          sources.add(url.hostname);
          
          // Extract topics from title
          const topicWords = title.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 5);
          
          topicWords.forEach(topic => {
            topics.set(topic, (topics.get(topic) || 0) + 1);
          });

          allArticles.push({
            title,
            source: url.hostname,
            file
          });
        }
      }
    }

    // Analyze diversity
    const analysis = {
      totalArticles: allArticles.length,
      uniqueSources: sources.size,
      topSources: this.getTopItems(
        allArticles.reduce((acc, a) => {
          acc[a.source] = (acc[a.source] || 0) + 1;
          return acc;
        }, {}),
        5
      ),
      topTopics: this.getTopItems(Object.fromEntries(topics), 10),
      diversityScore: 0,
      issues: [],
      strengths: [],
      recommendations: []
    };

    // Diversity checks
    const articlesPerSource = allArticles.length / sources.size;
    if (articlesPerSource > 5) {
      analysis.issues.push('Low source diversity - too many articles from few sources');
      analysis.diversityScore -= 2;
      analysis.recommendations.push('Add more diverse sources to curator.json');
    } else if (articlesPerSource < 3) {
      analysis.strengths.push('Excellent source diversity');
      analysis.diversityScore += 2;
    }

    // Check for Disability Bulletin presence
    const hasDisabilityBulletin = allArticles.some(a => 
      a.source.includes('blogger.com') || a.title.includes('Disability Bulletin')
    );
    if (hasDisabilityBulletin) {
      analysis.strengths.push('Features The Disability Bulletin prominently');
      analysis.diversityScore += 2;
    } else {
      analysis.issues.push('Missing Disability Bulletin content');
      analysis.recommendations.push('Ensure Disability Bulletin appears in curations');
    }

    // Topic diversity
    const topicConcentration = Math.max(...topics.values()) / allArticles.length;
    if (topicConcentration > 0.3) {
      analysis.issues.push('Topic concentration too high - limited variety');
      analysis.recommendations.push('Diversify content topics in feed sources');
    } else {
      analysis.strengths.push('Good topic diversity');
      analysis.diversityScore += 1;
    }

    analysis.diversityScore = Math.max(0, Math.min(10, analysis.diversityScore + 5));

    this.analysisResults.articles.push(analysis);

    console.log(`   Articles analyzed: ${analysis.totalArticles}`);
    console.log(`   Unique sources: ${analysis.uniqueSources}`);
    console.log(`   Diversity score: ${analysis.diversityScore}/10`);
    console.log(`   Issues: ${analysis.issues.length}\n`);
  }

  /**
   * ANALYZE TRENDING TOPICS
   * What's resonating, what's not, emerging themes
   */
  async analyzeTrendingTopics() {
    console.log('📈 Analyzing Trending Topics...\n');

    // Analyze post titles and content for trending keywords
    const topicFrequency = new Map();
    const disabilityTopics = [
      'accessibility', 'inclusion', 'accommodation', 'barrier', 'ableism',
      'neurodivergent', 'chronic illness', 'mental health', 'disability rights',
      'universal design', 'assistive technology', 'advocacy', 'policy',
      'employment', 'housing', 'healthcare', 'education', 'transportation'
    ];

    // Scan recent posts
    if (fs.existsSync(this.config.postsDir)) {
      const recentPosts = fs.readdirSync(this.config.postsDir)
        .filter(f => f.endsWith('.md'))
        .slice(-30);

      for (const file of recentPosts) {
        const content = fs.readFileSync(
          path.join(this.config.postsDir, file),
          'utf8'
        ).toLowerCase();

        disabilityTopics.forEach(topic => {
          const regex = new RegExp(topic, 'gi');
          const matches = content.match(regex);
          if (matches) {
            topicFrequency.set(topic, (topicFrequency.get(topic) || 0) + matches.length);
          }
        });
      }
    }

    const sortedTopics = Array.from(topicFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const analysis = {
      timestamp: new Date().toISOString(),
      trendingTopics: sortedTopics.map(([topic, count]) => ({ topic, mentions: count })),
      emergingTopics: sortedTopics.slice(-3).map(t => t[0]),
      recommendations: []
    };

    // Identify gaps
    const underrepresentedTopics = disabilityTopics.filter(topic => 
      !topicFrequency.has(topic) || topicFrequency.get(topic) < 5
    );

    if (underrepresentedTopics.length > 0) {
      analysis.recommendations.push(
        `Consider covering underrepresented topics: ${underrepresentedTopics.slice(0, 5).join(', ')}`
      );
    }

    // Check for balance
    if (sortedTopics.length > 0) {
      const topTopicMentions = sortedTopics[0][1];
      const avgMentions = sortedTopics.reduce((sum, t) => sum + t[1], 0) / sortedTopics.length;
      
      if (topTopicMentions > avgMentions * 3) {
        analysis.recommendations.push(
          `Topic '${sortedTopics[0][0]}' is overrepresented. Diversify content focus.`
        );
      }
    }

    this.analysisResults.trending.push(analysis);

    console.log('   Top trending topics:');
    sortedTopics.slice(0, 5).forEach(([topic, count]) => {
      console.log(`     • ${topic}: ${count} mentions`);
    });
    console.log();
  }

  /**
   * ANALYZE HASHTAG PERFORMANCE
   * Which hashtags work, which don't, opportunities
   */
  async analyzeHashtags() {
    console.log('# Analyzing Hashtags...\n');

    const hashtagData = {
      used: new Map(),
      recommended: [
        '#Disability', '#DisabilityRights', '#Accessibility', '#A11y',
        '#Inclusion', '#DisabilityJustice', '#ChronicIllness', '#MentalHealth',
        '#Neurodivergent', '#UniversalDesign', '#DisabilityPride',
        '#AccessibilityMatters', '#InclusionMatters', '#DisabilityCommunity'
      ],
      analysis: {
        strengths: [],
        issues: [],
        recommendations: []
      }
    };

    // Scan posts for hashtags
    if (fs.existsSync(this.config.postsDir)) {
      const recentPosts = fs.readdirSync(this.config.postsDir)
        .filter(f => f.endsWith('.md'))
        .slice(-20);

      for (const file of recentPosts) {
        const content = fs.readFileSync(
          path.join(this.config.postsDir, file),
          'utf8'
        );

        const hashtags = content.match(/#[A-Za-z0-9]+/g) || [];
        hashtags.forEach(tag => {
          hashtagData.used.set(tag, (hashtagData.used.get(tag) || 0) + 1);
        });
      }
    }

    const topHashtags = Array.from(hashtagData.used.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Analysis
    if (hashtagData.used.size === 0) {
      hashtagData.analysis.issues.push('No hashtags found in recent posts');
      hashtagData.analysis.recommendations.push(
        'Start using disability-focused hashtags for better discoverability'
      );
    } else if (hashtagData.used.size < 5) {
      hashtagData.analysis.issues.push('Limited hashtag variety');
      hashtagData.analysis.recommendations.push(
        'Expand hashtag usage with recommended disability community tags'
      );
    } else {
      hashtagData.analysis.strengths.push(`Using ${hashtagData.used.size} unique hashtags`);
    }

    // Check for recommended hashtags
    const recommendedUsed = hashtagData.recommended.filter(tag =>
      hashtagData.used.has(tag)
    );

    if (recommendedUsed.length > 0) {
      hashtagData.analysis.strengths.push(
        `Using ${recommendedUsed.length} recommended disability community hashtags`
      );
    } else {
      hashtagData.analysis.recommendations.push(
        'Adopt disability-focused hashtags: #Disability, #A11y, #DisabilityRights'
      );
    }

    hashtagData.topHashtags = topHashtags;
    this.analysisResults.hashtags.push(hashtagData);

    console.log(`   Unique hashtags: ${hashtagData.used.size}`);
    console.log('   Most used:');
    topHashtags.slice(0, 5).forEach(([tag, count]) => {
      console.log(`     • ${tag}: ${count} uses`);
    });
    console.log();
  }

  /**
   * GENERATE OVERALL RECOMMENDATIONS
   * Cross-cutting insights and priorities
   */
  async generateRecommendations() {
    console.log('💡 Generating Overall Recommendations...\n');

    const recommendations = {
      timestamp: new Date().toISOString(),
      priority: [],
      quality: [],
      engagement: [],
      diversity: [],
      accessibility: []
    };

    // Priority issues
    const lowQualityPosts = this.analysisResults.posts.filter(p => p.qualityScore < 6);
    if (lowQualityPosts.length > 0) {
      recommendations.priority.push(
        `⚠️ ${lowQualityPosts.length} posts have quality score < 6 - review and improve`
      );
    }

    const lowEngagementPosts = this.analysisResults.posts.filter(
      p => p.engagementPotential === 'low'
    );
    if (lowEngagementPosts.length > 0) {
      recommendations.priority.push(
        `📉 ${lowEngagementPosts.length} posts have low engagement potential - add CTAs and structure`
      );
    }

    // Quality improvements
    const postsWithoutAltText = this.analysisResults.posts.filter(p =>
      p.issues.some(i => i.includes('alt text'))
    );
    if (postsWithoutAltText.length > 0) {
      recommendations.accessibility.push(
        `♿ Add alt text to ${postsWithoutAltText.length} posts with images`
      );
    }

    // Engagement opportunities
    recommendations.engagement.push(
      'Consider adding more call-to-action elements to posts'
    );
    recommendations.engagement.push(
      'Use trending topics to guide content creation'
    );

    // Diversity
    if (this.analysisResults.articles.length > 0) {
      const articleAnalysis = this.analysisResults.articles[0];
      if (articleAnalysis.diversityScore < 6) {
        recommendations.diversity.push(
          'Increase source diversity in curated content'
        );
      }
    }

    this.analysisResults.overall = recommendations;

    console.log('   Priority recommendations generated');
    console.log(`   Categories: ${Object.keys(recommendations).length - 1}\n`);
  }

  /**
   * SAVE FEEDBACK RESULTS
   */
  saveFeedback() {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `agent-feedback-${timestamp}.json`;
    const filepath = path.join(this.config.feedbackDir, filename);

    const output = {
      generatedAt: new Date().toISOString(),
      summary: {
        postsAnalyzed: this.analysisResults.posts.length,
        articlesAnalyzed: this.analysisResults.articles.reduce((sum, a) => sum + (a.totalArticles || 0), 0),
        trendingTopicsIdentified: this.analysisResults.trending.reduce((sum, t) => sum + t.trendingTopics.length, 0),
        hashtagsTracked: this.analysisResults.hashtags.reduce((sum, h) => sum + h.used.size, 0)
      },
      results: this.analysisResults
    };

    fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
    console.log(`✅ Feedback saved: ${filepath}`);

    // Also save human-readable markdown report
    this.saveMarkdownReport(timestamp);
  }

  /**
   * SAVE MARKDOWN REPORT
   */
  saveMarkdownReport(timestamp) {
    const filename = `agent-feedback-${timestamp}.md`;
    const filepath = path.join(this.config.feedbackDir, filename);

    let md = `# Agent Feedback Report\n`;
    md += `**Generated:** ${new Date().toISOString()}\n\n`;
    md += `---\n\n`;

    // Posts section
    md += `## 📝 Blog Posts Analysis\n\n`;
    md += `**Posts analyzed:** ${this.analysisResults.posts.length}\n\n`;
    
    if (this.analysisResults.posts.length > 0) {
      const avgQuality = (
        this.analysisResults.posts.reduce((sum, p) => sum + p.qualityScore, 0) /
        this.analysisResults.posts.length
      ).toFixed(1);

      md += `**Average quality score:** ${avgQuality}/10\n\n`;

      md += `### Top Issues\n\n`;
      const allIssues = this.analysisResults.posts.flatMap(p => p.issues);
      const issueFreq = this.getTopItems(
        allIssues.reduce((acc, i) => {
          acc[i] = (acc[i] || 0) + 1;
          return acc;
        }, {}),
        5
      );
      issueFreq.forEach(([issue, count]) => {
        md += `- ${issue} (${count} posts)\n`;
      });
      md += `\n`;

      md += `### Top Strengths\n\n`;
      const allStrengths = this.analysisResults.posts.flatMap(p => p.strengths);
      const strengthFreq = this.getTopItems(
        allStrengths.reduce((acc, s) => {
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {}),
        5
      );
      strengthFreq.forEach(([strength, count]) => {
        md += `- ${strength} (${count} posts)\n`;
      });
      md += `\n`;
    }

    // Articles section
    md += `## 📰 Curated Articles Analysis\n\n`;
    if (this.analysisResults.articles.length > 0) {
      const analysis = this.analysisResults.articles[0];
      md += `**Total articles:** ${analysis.totalArticles}\n`;
      md += `**Unique sources:** ${analysis.uniqueSources}\n`;
      md += `**Diversity score:** ${analysis.diversityScore}/10\n\n`;

      md += `### Top Sources\n\n`;
      analysis.topSources.forEach(([source, count]) => {
        md += `- ${source}: ${count} articles\n`;
      });
      md += `\n`;

      md += `### Top Topics\n\n`;
      analysis.topTopics.slice(0, 10).forEach(([topic, count]) => {
        md += `- ${topic}: ${count} mentions\n`;
      });
      md += `\n`;
    }

    // Trending section
    md += `## 📈 Trending Topics\n\n`;
    if (this.analysisResults.trending.length > 0) {
      const trending = this.analysisResults.trending[0];
      md += `### Most Mentioned\n\n`;
      trending.trendingTopics.forEach(({ topic, mentions }) => {
        md += `- **${topic}**: ${mentions} mentions\n`;
      });
      md += `\n`;
    }

    // Hashtags section
    md += `## # Hashtag Performance\n\n`;
    if (this.analysisResults.hashtags.length > 0) {
      const hashtags = this.analysisResults.hashtags[0];
      md += `**Unique hashtags used:** ${hashtags.used.size}\n\n`;
      
      if (hashtags.topHashtags.length > 0) {
        md += `### Most Used\n\n`;
        hashtags.topHashtags.forEach(([tag, count]) => {
          md += `- ${tag}: ${count} uses\n`;
        });
        md += `\n`;
      }

      md += `### Recommended Hashtags\n\n`;
      hashtags.recommended.forEach(tag => {
        const used = hashtags.used.has(tag);
        md += `- ${tag} ${used ? '✅' : '❌'}\n`;
      });
      md += `\n`;
    }

    // Overall recommendations
    md += `## 💡 Recommendations\n\n`;
    const recs = this.analysisResults.overall;
    
    if (recs.priority && recs.priority.length > 0) {
      md += `### 🔴 Priority\n\n`;
      recs.priority.forEach(r => md += `- ${r}\n`);
      md += `\n`;
    }

    if (recs.accessibility && recs.accessibility.length > 0) {
      md += `### ♿ Accessibility\n\n`;
      recs.accessibility.forEach(r => md += `- ${r}\n`);
      md += `\n`;
    }

    if (recs.engagement && recs.engagement.length > 0) {
      md += `### 📊 Engagement\n\n`;
      recs.engagement.forEach(r => md += `- ${r}\n`);
      md += `\n`;
    }

    if (recs.diversity && recs.diversity.length > 0) {
      md += `### 🌈 Diversity\n\n`;
      recs.diversity.forEach(r => md += `- ${r}\n`);
      md += `\n`;
    }

    md += `---\n\n`;
    md += `*Generated by Agent Feedback System*\n`;

    fs.writeFileSync(filepath, md);
    console.log(`✅ Report saved: ${filepath}`);
  }

  /**
   * HELPER: Calculate readability (avg words per sentence)
   */
  calculateReadability(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    return sentences.length > 0 ? words.length / sentences.length : 0;
  }

  /**
   * HELPER: Get top N items from frequency map
   */
  getTopItems(freqMap, n = 5) {
    return Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      postsAnalyzed: this.analysisResults.posts.length,
      articlesAnalyzed: this.analysisResults.articles.length,
      trendingTopics: this.analysisResults.trending.length,
      hashtagsTracked: this.analysisResults.hashtags.length,
      lastRun: new Date().toISOString()
    };
  }
}

// CLI Usage
if (require.main === module) {
  const feedbackSystem = new AgentFeedbackSystem();
  
  feedbackSystem.analyzeAll()
    .then(() => {
      console.log('\n🎉 Agent feedback analysis complete!\n');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = AgentFeedbackSystem;
