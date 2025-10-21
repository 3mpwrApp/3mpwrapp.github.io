#!/usr/bin/env node
/**
 * CURATOR-SOCIAL-TRENDS.JS
 * Track viral disability hashtags and trends from social media
 * 
 * Features:
 * - Monitor Bluesky disability hashtags
 * - Track trending topics in disability community
 * - Identify viral conversations
 * - Boost curator scores for trending topics
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class CuratorSocialTrends {
  constructor() {
    this.trendsPath = path.join(process.cwd(), 'public', 'social-trends.json');
    this.trends = this.loadTrends();
    
    // Disability-related hashtags to monitor
    this.monitoredHashtags = [
      'DisabilityRights',
      'DisabilityJustice',
      'Accessibility',
      'A11y',
      'CripTheVote',
      'DisabilityPride',
      'DisabledAndProud',
      'ActuallyAutistic',
      'ChronicIllness',
      'DisabilityAdvocacy',
      'AccessibilityMatters',
      'InclusionMatters',
      'NothingAboutUsWithoutUs',
      'Ableism',
      'UniversalDesign'
    ];
    
    // Bluesky configuration
    this.blueskyPDS = process.env.BLUESKY_PDS || 'https://bsky.social';
    this.blueskyHandle = process.env.BLUESKY_HANDLE;
    this.blueskyPassword = process.env.BLUESKY_PASSWORD;
    this.blueskySession = null;
  }

  loadTrends() {
    const defaultTrends = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      hashtags: {},
      viralPosts: [],
      emergingTopics: []
    };

    if (fs.existsSync(this.trendsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.trendsPath, 'utf8'));
        return { ...defaultTrends, ...data };
      } catch (err) {
        console.warn(`⚠️ Social trends load error: ${err.message}`);
        return defaultTrends;
      }
    }

    return defaultTrends;
  }

  saveTrends() {
    try {
      this.trends.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.trendsPath, JSON.stringify(this.trends, null, 2));
      console.log(`✅ Saved social trends to ${this.trendsPath}`);
    } catch (err) {
      console.error(`❌ Failed to save social trends: ${err.message}`);
    }
  }

  /**
   * Make HTTP request to Bluesky API
   */
  async blueskyRequest(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
      const url = `${this.blueskyPDS}/xrpc/${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (this.blueskySession && this.blueskySession.accessJwt) {
        options.headers['Authorization'] = `Bearer ${this.blueskySession.accessJwt}`;
      }

      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      
      if (body) {
        req.write(JSON.stringify(body));
      }
      
      req.end();
    });
  }

  /**
   * Login to Bluesky
   */
  async blueskyLogin() {
    if (!this.blueskyHandle || !this.blueskyPassword) {
      console.log('⚠️ Bluesky credentials not configured');
      return false;
    }

    try {
      const response = await this.blueskyRequest('POST', 'com.atproto.server.createSession', {
        identifier: this.blueskyHandle,
        password: this.blueskyPassword
      });

      if (response.accessJwt) {
        this.blueskySession = response;
        console.log('✅ Logged into Bluesky');
        return true;
      }

      return false;
    } catch (err) {
      console.error(`❌ Bluesky login failed: ${err.message}`);
      return false;
    }
  }

  /**
   * Search Bluesky for hashtag mentions
   */
  async searchBlueskyHashtag(hashtag) {
    try {
      const response = await this.blueskyRequest(
        'GET',
        `app.bsky.feed.searchPosts?q=${encodeURIComponent('#' + hashtag)}&limit=25`
      );

      if (response.posts) {
        return response.posts;
      }

      return [];
    } catch (err) {
      console.error(`❌ Failed to search #${hashtag}: ${err.message}`);
      return [];
    }
  }

  /**
   * Extract keywords from viral posts
   */
  extractKeywords(posts) {
    const keywords = new Map();

    posts.forEach(post => {
      const text = post.record?.text || '';
      
      // Extract hashtags
      const hashtagMatches = text.match(/#[\w]+/g) || [];
      hashtagMatches.forEach(tag => {
        const clean = tag.substring(1).toLowerCase();
        keywords.set(clean, (keywords.get(clean) || 0) + 1);
      });

      // Extract meaningful phrases (2-3 words)
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3);

      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        if (this.isDisabilityRelated(phrase)) {
          keywords.set(phrase, (keywords.get(phrase) || 0) + 1);
        }
      }
    });

    return Array.from(keywords.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([keyword, count]) => ({ keyword, count }));
  }

  /**
   * Check if phrase is disability-related
   */
  isDisabilityRelated(phrase) {
    const indicators = [
      'disability', 'disabled', 'accessible', 'accessibility',
      'inclusion', 'barrier', 'accommodation', 'assistive',
      'wheelchair', 'mobility', 'deaf', 'blind', 'autism',
      'neurodivergent', 'chronic', 'advocate', 'rights'
    ];

    return indicators.some(ind => phrase.includes(ind));
  }

  /**
   * Track trending hashtags on Bluesky
   */
  async trackBlueskyTrends() {
    console.log('\n🔍 TRACKING SOCIAL MEDIA TRENDS\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // Login to Bluesky
    const loggedIn = await this.blueskyLogin();
    if (!loggedIn) {
      console.log('⚠️ Skipping Bluesky trends (not logged in)\n');
      return;
    }

    let totalPosts = 0;
    const allKeywords = [];

    // Search each monitored hashtag
    for (const hashtag of this.monitoredHashtags.slice(0, 5)) {
      console.log(`📊 Searching #${hashtag}...`);
      
      const posts = await this.searchBlueskyHashtag(hashtag);
      totalPosts += posts.length;

      if (posts.length > 0) {
        console.log(`   ✓ Found ${posts.length} posts`);
        
        // Track hashtag stats
        if (!this.trends.hashtags[hashtag]) {
          this.trends.hashtags[hashtag] = {
            firstSeen: new Date().toISOString(),
            totalPosts: 0,
            recentPosts: 0,
            peakPosts: 0
          };
        }

        const stats = this.trends.hashtags[hashtag];
        stats.recentPosts = posts.length;
        stats.totalPosts += posts.length;
        stats.peakPosts = Math.max(stats.peakPosts, posts.length);
        stats.lastSeen = new Date().toISOString();

        // Extract keywords from posts
        const keywords = this.extractKeywords(posts);
        allKeywords.push(...keywords);

        // Identify viral posts (high engagement)
        const viralPosts = posts
          .filter(p => (p.likeCount || 0) + (p.repostCount || 0) > 10)
          .slice(0, 3)
          .map(p => ({
            text: p.record?.text || '',
            author: p.author?.handle || 'unknown',
            engagement: (p.likeCount || 0) + (p.repostCount || 0),
            hashtag
          }));

        this.trends.viralPosts.push(...viralPosts);
      } else {
        console.log(`   ⊘ No posts found`);
      }

      // Rate limiting: small delay between searches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n📈 Total posts analyzed: ${totalPosts}\n`);

    // Aggregate keywords
    const keywordCounts = new Map();
    allKeywords.forEach(({ keyword, count }) => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + count);
    });

    const topKeywords = Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));

    this.trends.emergingTopics = topKeywords;

    if (topKeywords.length > 0) {
      console.log('🔥 Emerging Topics:');
      topKeywords.slice(0, 10).forEach(({ keyword, count }) => {
        console.log(`   • ${keyword} (${count} mentions)`);
      });
      console.log();
    }

    // Keep only recent viral posts (last 7 days worth)
    this.trends.viralPosts = this.trends.viralPosts.slice(-50);

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ Social trend tracking complete\n');

    this.saveTrends();

    return topKeywords;
  }

  /**
   * Get boost score for keyword based on social trends
   */
  getSocialBoost(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    
    // Check if it's an emerging topic
    const emerging = this.trends.emergingTopics.find(
      topic => topic.keyword === lowerKeyword
    );

    if (emerging) {
      // Scale boost based on mention count
      if (emerging.count >= 20) return 1.5;
      if (emerging.count >= 10) return 1.3;
      if (emerging.count >= 5) return 1.2;
      return 1.1;
    }

    return 1.0;
  }

  /**
   * Generate social trends report
   */
  generateReport() {
    console.log('\n📱 SOCIAL TRENDS REPORT\n');
    console.log('═══════════════════════════════════════════════════════\n');

    const hashtagCount = Object.keys(this.trends.hashtags).length;
    const viralPostCount = this.trends.viralPosts.length;
    const emergingCount = this.trends.emergingTopics.length;

    console.log(`📊 Monitored hashtags: ${hashtagCount}`);
    console.log(`🔥 Viral posts tracked: ${viralPostCount}`);
    console.log(`📈 Emerging topics: ${emergingCount}\n`);

    if (this.trends.emergingTopics.length > 0) {
      console.log('🔥 Top Emerging Topics:');
      this.trends.emergingTopics.slice(0, 10).forEach(({ keyword, count }) => {
        console.log(`   • ${keyword} (${count} mentions)`);
      });
      console.log();
    }

    if (this.trends.viralPosts.length > 0) {
      console.log('⭐ Recent Viral Posts:');
      this.trends.viralPosts.slice(-5).forEach(post => {
        const preview = post.text.substring(0, 60);
        console.log(`   • ${preview}... [${post.engagement} engagement]`);
      });
      console.log();
    }

    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// Run if called directly
if (require.main === module) {
  const tracker = new CuratorSocialTrends();
  
  tracker.trackBlueskyTrends()
    .then(() => tracker.generateReport())
    .catch(err => console.error(`❌ Error: ${err.message}`));
}

module.exports = CuratorSocialTrends;
