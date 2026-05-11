#!/usr/bin/env node
/**
 * HASHTAG-TRACKER.JS
 * Track #3mpwrApp and related hashtag usage across platforms
 * 
 * Features:
 * - Monitor hashtag mentions on Mastodon and Bluesky
 * - Track community engagement with #3mpwrApp
 * - Analyze hashtag performance and reach
 * - Generate weekly hashtag reports
 * - Identify community advocates and supporters
 * 
 * Runs: Daily via GitHub Actions
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TRACKING_FILE = path.join(process.cwd(), 'public', 'hashtag-tracking.json');

// Primary hashtag to track
const PRIMARY_HASHTAG = '3mpwrApp';

// Related hashtags to monitor
const RELATED_HASHTAGS = [
  '3mpwrApp',
  'DisabilityRights',
  'ChronicIllness', 
  'SpoonTheory',
  'DisabilityJustice',
  'InvisibleIllness',
  'InjuredWorkers',
  'WSIB',
  'DisabledAndProud'
];

class HashtagTracker {
  constructor() {
    this.data = this.loadTrackingData();
    this.config = {
      mastodon: {
        enabled: !!process.env.MASTO_TOKEN,
        instance: process.env.MASTO_INSTANCE || 'mastodon.social',
        token: process.env.MASTO_TOKEN || ''
      },
      bluesky: {
        enabled: !!process.env.BLUESKY_HANDLE && !!process.env.BLUESKY_PASSWORD,
        handle: process.env.BLUESKY_HANDLE || '',
        password: process.env.BLUESKY_PASSWORD || '',
        pds: process.env.BLUESKY_PDS || 'https://bsky.social'
      }
    };
  }

  /**
   * Load existing tracking data
   */
  loadTrackingData() {
    if (fs.existsSync(TRACKING_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf-8'));
      } catch (err) {
        console.warn(`⚠️ Could not load tracking data: ${err.message}`);
      }
    }
    
    return {
      version: '1.0.0',
      created: new Date().toISOString(),
      lastCheck: null,
      primaryHashtag: PRIMARY_HASHTAG,
      hashtags: {},
      mentions: [],
      dailyStats: [],
      weeklyReports: [],
      topAdvocates: [],
      reachEstimate: 0
    };
  }

  /**
   * Save tracking data
   */
  saveTrackingData() {
    const dir = path.dirname(TRACKING_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(this.data, null, 2));
    console.log(`✅ Tracking data saved: ${TRACKING_FILE}`);
  }

  /**
   * HTTP request helper
   */
  httpRequest(options, body = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, body: parsed });
          } catch (err) {
            resolve({ status: res.statusCode, body: data });
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
   * Search Mastodon for hashtag mentions
   */
  async searchMastodon(hashtag) {
    if (!this.config.mastodon.enabled) {
      console.log('⚠️ Mastodon not configured, skipping...');
      return [];
    }

    try {
      const options = {
        hostname: this.config.mastodon.instance,
        port: 443,
        path: `/api/v1/timelines/tag/${hashtag.toLowerCase()}?limit=40`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.mastodon.token}`,
          'User-Agent': '3mpwrApp-HashtagTracker/1.0'
        }
      };

      const res = await this.httpRequest(options);
      
      if (res.status === 200 && Array.isArray(res.body)) {
        return res.body.map(post => ({
          platform: 'mastodon',
          id: post.id,
          author: post.account?.acct || 'unknown',
          authorDisplayName: post.account?.display_name || '',
          content: this.stripHtml(post.content || ''),
          createdAt: post.created_at,
          url: post.url,
          reblogs: post.reblogs_count || 0,
          favorites: post.favourites_count || 0,
          replies: post.replies_count || 0,
          hashtags: (post.tags || []).map(t => t.name)
        }));
      }
      
      return [];
    } catch (err) {
      console.error(`❌ Mastodon search error: ${err.message}`);
      return [];
    }
  }

  /**
   * Search Bluesky for hashtag mentions
   */
  async searchBluesky(hashtag) {
    if (!this.config.bluesky.enabled) {
      console.log('⚠️ Bluesky not configured, skipping...');
      return [];
    }

    try {
      // Authenticate first
      const authOptions = {
        hostname: new URL(this.config.bluesky.pds).hostname,
        port: 443,
        path: '/xrpc/com.atproto.server.createSession',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': '3mpwrApp-HashtagTracker/1.0'
        }
      };

      const authRes = await this.httpRequest(authOptions, {
        identifier: this.config.bluesky.handle,
        password: this.config.bluesky.password
      });

      if (authRes.status !== 200) {
        throw new Error('Authentication failed');
      }

      const session = authRes.body;

      // Search for hashtag
      const searchOptions = {
        hostname: new URL(this.config.bluesky.pds).hostname,
        port: 443,
        path: `/xrpc/app.bsky.feed.searchPosts?q=%23${hashtag}&limit=25`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessJwt}`,
          'User-Agent': '3mpwrApp-HashtagTracker/1.0'
        }
      };

      const res = await this.httpRequest(searchOptions);
      
      if (res.status === 200 && res.body.posts) {
        return res.body.posts.map(post => ({
          platform: 'bluesky',
          id: post.uri,
          author: post.author?.handle || 'unknown',
          authorDisplayName: post.author?.displayName || '',
          content: post.record?.text || '',
          createdAt: post.record?.createdAt || post.indexedAt,
          url: `https://bsky.app/profile/${post.author?.handle}/post/${post.uri.split('/').pop()}`,
          reblogs: post.repostCount || 0,
          favorites: post.likeCount || 0,
          replies: post.replyCount || 0,
          hashtags: this.extractHashtags(post.record?.text || '')
        }));
      }
      
      return [];
    } catch (err) {
      console.error(`❌ Bluesky search error: ${err.message}`);
      return [];
    }
  }

  /**
   * Extract hashtags from text
   */
  extractHashtags(text) {
    const matches = text.match(/#\w+/g) || [];
    return matches.map(h => h.substring(1).toLowerCase());
  }

  /**
   * Strip HTML from content
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Track all hashtags
   */
  async trackHashtags() {
    console.log('\n🔍 Tracking hashtag mentions...\n');
    
    const today = new Date().toISOString().split('T')[0];
    const allMentions = [];
    
    // Track primary hashtag first
    console.log(`📌 Primary: #${PRIMARY_HASHTAG}`);
    
    const mastodonPrimary = await this.searchMastodon(PRIMARY_HASHTAG);
    const blueskyPrimary = await this.searchBluesky(PRIMARY_HASHTAG);
    
    allMentions.push(...mastodonPrimary, ...blueskyPrimary);
    
    console.log(`   Mastodon: ${mastodonPrimary.length} posts`);
    console.log(`   Bluesky: ${blueskyPrimary.length} posts`);
    
    // Track related hashtags
    for (const hashtag of RELATED_HASHTAGS.filter(h => h !== PRIMARY_HASHTAG)) {
      console.log(`\n📍 Related: #${hashtag}`);
      
      const mastodon = await this.searchMastodon(hashtag);
      const bluesky = await this.searchBluesky(hashtag);
      
      // Only add if they also mention #3mpwrApp
      const relevantMastodon = mastodon.filter(p => 
        p.hashtags.some(h => h.toLowerCase() === PRIMARY_HASHTAG.toLowerCase())
      );
      const relevantBluesky = bluesky.filter(p => 
        p.hashtags.some(h => h.toLowerCase() === PRIMARY_HASHTAG.toLowerCase())
      );
      
      allMentions.push(...relevantMastodon, ...relevantBluesky);
      
      console.log(`   Co-mentions with #${PRIMARY_HASHTAG}: ${relevantMastodon.length + relevantBluesky.length}`);
    }
    
    // Deduplicate mentions
    const uniqueMentions = this.deduplicateMentions(allMentions);
    
    // Filter out our own posts
    const communityMentions = uniqueMentions.filter(m => 
      !m.author.toLowerCase().includes('3mpwrapp')
    );
    
    // Update tracking data
    this.updateTrackingData(communityMentions, today);
    
    // Save
    this.saveTrackingData();
    
    return {
      date: today,
      totalMentions: uniqueMentions.length,
      communityMentions: communityMentions.length,
      platforms: {
        mastodon: uniqueMentions.filter(m => m.platform === 'mastodon').length,
        bluesky: uniqueMentions.filter(m => m.platform === 'bluesky').length
      }
    };
  }

  /**
   * Deduplicate mentions by ID
   */
  deduplicateMentions(mentions) {
    const seen = new Set();
    return mentions.filter(m => {
      const key = `${m.platform}:${m.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Update tracking data with new mentions
   */
  updateTrackingData(mentions, date) {
    this.data.lastCheck = new Date().toISOString();
    
    // Add new mentions (avoiding duplicates)
    const existingIds = new Set(this.data.mentions.map(m => `${m.platform}:${m.id}`));
    
    for (const mention of mentions) {
      const key = `${mention.platform}:${mention.id}`;
      if (!existingIds.has(key)) {
        this.data.mentions.unshift(mention);
        existingIds.add(key);
      }
    }
    
    // Keep only last 500 mentions
    if (this.data.mentions.length > 500) {
      this.data.mentions = this.data.mentions.slice(0, 500);
    }
    
    // Update daily stats
    const todayStats = {
      date,
      totalMentions: mentions.length,
      mastodon: mentions.filter(m => m.platform === 'mastodon').length,
      bluesky: mentions.filter(m => m.platform === 'bluesky').length,
      totalEngagement: mentions.reduce((sum, m) => 
        sum + (m.reblogs || 0) + (m.favorites || 0) + (m.replies || 0), 0),
      uniqueAuthors: new Set(mentions.map(m => m.author)).size
    };
    
    // Remove existing entry for today if exists
    this.data.dailyStats = this.data.dailyStats.filter(s => s.date !== date);
    this.data.dailyStats.unshift(todayStats);
    
    // Keep last 90 days
    if (this.data.dailyStats.length > 90) {
      this.data.dailyStats = this.data.dailyStats.slice(0, 90);
    }
    
    // Update top advocates (users who mention #3mpwrApp most)
    this.updateTopAdvocates();
    
    // Update hashtag co-occurrence stats
    this.updateHashtagStats();
    
    // Calculate reach estimate
    this.data.reachEstimate = this.calculateReach();
  }

  /**
   * Update top advocates list
   */
  updateTopAdvocates() {
    const authorCounts = {};
    
    for (const mention of this.data.mentions) {
      const author = mention.author;
      if (!authorCounts[author]) {
        authorCounts[author] = {
          author,
          displayName: mention.authorDisplayName,
          platform: mention.platform,
          mentionCount: 0,
          totalEngagement: 0,
          lastMention: mention.createdAt
        };
      }
      authorCounts[author].mentionCount++;
      authorCounts[author].totalEngagement += 
        (mention.reblogs || 0) + (mention.favorites || 0) + (mention.replies || 0);
    }
    
    this.data.topAdvocates = Object.values(authorCounts)
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 20);
  }

  /**
   * Update hashtag co-occurrence statistics
   */
  updateHashtagStats() {
    const hashtagCounts = {};
    
    for (const mention of this.data.mentions) {
      for (const hashtag of mention.hashtags || []) {
        const tag = hashtag.toLowerCase();
        if (!hashtagCounts[tag]) {
          hashtagCounts[tag] = 0;
        }
        hashtagCounts[tag]++;
      }
    }
    
    this.data.hashtags = hashtagCounts;
  }

  /**
   * Calculate estimated reach
   */
  calculateReach() {
    const last30Days = this.data.dailyStats.slice(0, 30);
    return last30Days.reduce((sum, day) => sum + day.totalEngagement, 0);
  }

  /**
   * Generate weekly report
   */
  generateWeeklyReport() {
    const last7Days = this.data.dailyStats.slice(0, 7);
    
    const report = {
      date: new Date().toISOString(),
      period: '7 days',
      totalMentions: last7Days.reduce((sum, d) => sum + d.totalMentions, 0),
      totalEngagement: last7Days.reduce((sum, d) => sum + d.totalEngagement, 0),
      uniqueAuthors: new Set(
        this.data.mentions
          .filter(m => {
            const mentionDate = new Date(m.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return mentionDate > weekAgo;
          })
          .map(m => m.author)
      ).size,
      topAdvocates: this.data.topAdvocates.slice(0, 5),
      topCoHashtags: Object.entries(this.data.hashtags)
        .filter(([tag]) => tag !== PRIMARY_HASHTAG.toLowerCase())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count })),
      platformBreakdown: {
        mastodon: last7Days.reduce((sum, d) => sum + d.mastodon, 0),
        bluesky: last7Days.reduce((sum, d) => sum + d.bluesky, 0)
      }
    };
    
    // Store report
    this.data.weeklyReports.unshift(report);
    if (this.data.weeklyReports.length > 12) {
      this.data.weeklyReports = this.data.weeklyReports.slice(0, 12);
    }
    
    this.saveTrackingData();
    
    return report;
  }

  /**
   * Get summary for display
   */
  getSummary() {
    return {
      primaryHashtag: `#${PRIMARY_HASHTAG}`,
      lastCheck: this.data.lastCheck,
      totalMentionsTracked: this.data.mentions.length,
      reachEstimate: this.data.reachEstimate,
      topAdvocates: this.data.topAdvocates.slice(0, 5).map(a => ({
        author: a.author,
        mentions: a.mentionCount
      })),
      recentMentions: this.data.mentions.slice(0, 5).map(m => ({
        author: m.author,
        preview: m.content.substring(0, 100) + '...',
        platform: m.platform,
        date: m.createdAt
      }))
    };
  }
}

// Run if called directly
if (require.main === module) {
  console.log('\n📊 3mpwrApp Hashtag Tracker\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const tracker = new HashtagTracker();
  
  (async () => {
    const results = await tracker.trackHashtags();
    
    console.log('\n📈 TRACKING RESULTS\n');
    console.log(`📅 Date: ${results.date}`);
    console.log(`📝 Total mentions found: ${results.totalMentions}`);
    console.log(`👥 Community mentions: ${results.communityMentions}`);
    console.log(`🐘 Mastodon: ${results.platforms.mastodon}`);
    console.log(`🦋 Bluesky: ${results.platforms.bluesky}`);
    
    const summary = tracker.getSummary();
    
    if (summary.topAdvocates.length > 0) {
      console.log('\n⭐ Top Community Advocates:');
      summary.topAdvocates.forEach((a, i) => {
        console.log(`   ${i + 1}. @${a.author} (${a.mentions} mentions)`);
      });
    }
    
    console.log('\n═══════════════════════════════════════════════════════\n');
  })();
}

module.exports = HashtagTracker;
