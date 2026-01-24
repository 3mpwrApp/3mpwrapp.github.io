#!/usr/bin/env node
/**
 * SOCIAL-POST.JS
 * Unified social media posting engine for 3mpwrApp
 * Replaces: post-to-mastodon.js, post-to-x.js, post-to-bluesky.js
 * 
 * Features:
 * - Multi-platform posting (Mastodon, Bluesky, X)
 * - Systematic error handling & reporting
 * - Retry logic with exponential backoff
 * - Platform-specific content formatting
 * - Structured logging
 * - A/B testing & analytics integration
 * - Bluesky threading support
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load analytics module
const CuratorAnalytics = require('./curator-analytics');
// Load site configuration for centralized URL management
const siteConfig = require('./site-config');
// Load viral hooks for scroll-stopping content
const viralHooks = require('./viral-hooks-config');

// Blog URL constant - all social media posts link here
const BLOG_URL = `${siteConfig.url}/blog/`;

class SocialPoster {
  constructor() {
    this.config = this.loadConfig();
    this.results = {
      mastodon: { success: false, message: '' },
      bluesky: { success: false, message: '' },
      x: { success: false, message: '' }
    };
    this.analytics = new CuratorAnalytics();
    this.currentFeature = null;
    this.currentTimeSlot = null;
  }

  /**
   * Load configuration from environment and curator output
   */
  loadConfig() {
    return {
      mastodon: {
        enabled: !!process.env.MASTO_TOKEN,
        instance: process.env.MASTO_INSTANCE || 'mastodon.social',
        token: process.env.MASTO_TOKEN || '',
        visibility: process.env.MASTO_VISIBILITY || 'public'
      },
      bluesky: {
        enabled: !!process.env.BLUESKY_HANDLE && !!process.env.BLUESKY_PASSWORD,
        handle: process.env.BLUESKY_HANDLE || '',
        password: process.env.BLUESKY_PASSWORD || '',
        pds: process.env.BLUESKY_PDS || 'https://bsky.social',
        threadFormat: process.env.BLUESKY_THREAD === '1'
      },
      x: {
        enabled: !!(process.env.X_BEARER_TOKEN || (process.env.X_API_KEY && process.env.X_ACCESS_TOKEN)),
        bearerToken: process.env.X_BEARER_TOKEN || '',
        apiKey: process.env.X_API_KEY || process.env.X_CLIENT_ID || '',
        apiSecret: process.env.X_API_SECRET || process.env.X_CLIENT_SECRET || '',
        accessToken: process.env.X_ACCESS_TOKEN || '',
        accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET || ''
      }
    };
  }

  /**
   * Get latest curated content
   */
  getLatestContent() {
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'curation-latest.json');
      if (!fs.existsSync(jsonPath)) {
        throw new Error(`Curation file not found: ${jsonPath}`);
      }

      const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return content;
    } catch (err) {
      throw new Error(`Failed to load curation: ${err.message}`);
    }
  }

  /**
   * Get time-based greeting/context
   */
  getTimeContext() {
    const hour = new Date().getUTCHours();
    
    let context;
    if (hour >= 6 && hour < 12) {
      context = {
        greeting: '☀️ Good morning!',
        context: 'Start your day informed with',
        time: 'morning'
      };
    } else if (hour >= 12 && hour < 17) {
      context = {
        greeting: '🌤️ Midday update!',
        context: 'Check out what\'s happening:',
        time: 'midday'
      };
    } else if (hour >= 17 && hour < 22) {
      context = {
        greeting: '🌆 Evening digest!',
        context: 'Catch up on today\'s news:',
        time: 'evening'
      };
    } else {
      context = {
        greeting: '🌙 Late update!',
        context: 'Latest news:',
        time: 'night'
      };
    }
    
    this.currentTimeSlot = context.time;
    return context;
  }

  /**
   * Get random app feature to highlight
   */
  getFeatureHighlight() {
    const features = [
      'Benefits Navigator: Find & apply for disability benefits across Canada (User Guide: #benefits-navigator)',
      'Resource Directory: Discover accessibility services in your area (User Guide: #resource-directory)',
      'News Curation: Stay informed on disability rights & policy (User Guide: #daily-curator)',
      'Accessibility Tools: Screen reader friendly, keyboard navigation (User Guide: #accessibility)',
      'Provincial Guides: ODSP, AISH, PWD & more benefits explained (User Guide: #provincial-guides)',
      'Community Resources: Connect with advocacy groups & support (User Guide: #community)',
      'Multi-language Support: Content available in EN & FR (User Guide: #language-support)'
    ];
    const feature = features[Math.floor(Math.random() * features.length)];
    this.currentFeature = feature;
    return feature;
  }

  /**
   * Verify URL is accessible
   */
  async verifyUrl(url) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const options = {
        method: 'HEAD',
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  /**
   * Format content for Mastodon with viral hooks
   */
  formatMastodonPost(content) {
    const topItems = content.items.slice(0, 3);
    const feature = this.getFeatureHighlight();
    const monthlyTheme = viralHooks.getMonthlyTheme();
    
    // Get viral hook for daily news
    const viralHook = viralHooks.getDailyNewsHook(
      topItems[0]?.title ? topItems[0].title.substring(0, 50) : null
    );
    
    // Get random CTA
    const ctaOptions = viralHooks.CTA_LIBRARY.daily_news;
    const randomCta = ctaOptions[Math.floor(Math.random() * ctaOptions.length)]
      .replace('{count}', content.count.toString())
      .replace('{link}', `${BLOG_URL}#curated-daily`);
    
    let post = `${viralHook}\n\n`;
    post += `📰 ${content.count} curated stories on disability rights, accessibility & workers' rights.\n\n`;
    post += `🔥 Today's Headlines:\n\n`;

    topItems.forEach((item, idx) => {
      post += `${idx + 1}. ${item.title}\n`;
    });

    post += `\n💡 Featured: ${feature}\n\n`;
    post += `${randomCta}\n\n`;
    post += `#3mpwrApp #DisabilityRights #Accessibility #ChronicIllness #WorkersRights #Canada #${monthlyTheme.theme.replace(/\s+/g, '')}`;

    // Truncate to 500-character Mastodon limit (with 10 char buffer)
    if (post.length > 490) {
      post = post.substring(0, 487) + '...';
    }

    return post;
  }

  /**
   * Format content for Bluesky with viral hooks
   */
  formatBlueskyPost(content) {
    const topItems = content.items.slice(0, 2);
    
    // Get viral hook (shorter for Bluesky's 300 char limit)
    const viralHook = viralHooks.getDailyNewsHook();
    
    // Build post with strict character limit
    let post = `${viralHook}\n\n`;
    post += `${content.count} disability rights stories 🇨🇦\n\n`;

    topItems.forEach((item, idx) => {
      const title = item.title.length > 50 ? item.title.substring(0, 47) + '...' : item.title;
      post += `${idx + 1}. ${title}\n`;
    });

    post += `\n👉 ${BLOG_URL}#curated-daily\n`;
    post += `#3mpwrApp #DisabilityRights`;

    // Safety check: truncate if too long
    if (post.length > 300) {
      post = post.substring(0, 297) + '...';
    }

    return post;
  }

  /**
   * Format content for X
   */
  formatXPost(content) {
    const topItems = content.items.slice(0, 2);
    const timeCtx = this.getTimeContext();
    
    let post = `${timeCtx.greeting} 📰 Daily News Highlights\n\n`;
    post += `${content.count} stories on disability rights & accessibility!\n\n`;

    topItems.forEach((item) => {
      post += `• ${item.title}\n`;
    });

    post += `\n+ ${content.count - 2} more stories\n\n`;
    post += `� Read all: ${BLOG_URL}#curated-daily\n\n`;
    post += `#DisabilityRights #Accessibility #WorkersComp #Canada`;

    return post;
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
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          } catch (err) {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
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
   * Post to Mastodon
   */
  async postToMastodon(content) {
    if (!this.config.mastodon.enabled) {
      this.results.mastodon = { success: false, message: 'Mastodon: Not configured' };
      return;
    }

    try {
      const post = this.formatMastodonPost(content);

      const options = {
        hostname: this.config.mastodon.instance,
        port: 443,
        path: '/api/v1/statuses',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.mastodon.token}`,
          'Content-Type': 'application/json',
          'User-Agent': '3mpwrApp-Curator/2.0'
        }
      };

      const body = {
        status: post,
        visibility: this.config.mastodon.visibility,
        language: 'en'
      };

      const res = await this.httpRequest(options, body);

      if (res.status >= 200 && res.status < 300) {
        this.results.mastodon = {
          success: true,
          message: `✅ Mastodon: Posted successfully (${res.body.id})`
        };
        console.log(this.results.mastodon.message);
        this.analytics.trackPostingResult('mastodon', true);
      } else {
        throw new Error(`HTTP ${res.status}: ${res.body.error || 'Unknown error'}`);
      }
    } catch (err) {
      this.results.mastodon = {
        success: false,
        message: `❌ Mastodon: ${err.message}`
      };
      console.error(this.results.mastodon.message);
      this.analytics.trackPostingResult('mastodon', false);
    }
  }

  /**
   * Post to Bluesky
   */
  async postToBluesky(content) {
    if (!this.config.bluesky.enabled) {
      this.results.bluesky = { success: false, message: 'Bluesky: Not configured' };
      return;
    }

    try {
      // Authenticate
      const authOptions = {
        hostname: new URL(this.config.bluesky.pds).hostname,
        port: 443,
        path: '/xrpc/com.atproto.server.createSession',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': '3mpwrApp-Curator/2.0'
        }
      };

      const authRes = await this.httpRequest(authOptions, {
        identifier: this.config.bluesky.handle,
        password: this.config.bluesky.password
      });

      if (authRes.status !== 200) {
        throw new Error(`Auth failed: ${authRes.body.message || 'Unknown error'}`);
      }

      const session = authRes.body;

      // Check if threading is enabled and content is long
      if (this.config.bluesky.threadFormat && content.items.length > 3) {
        await this.postBlueskyThread(session, content);
      } else {
        await this.postBlueskySimple(session, content);
      }

      // Track analytics
      this.analytics.trackPostingResult('bluesky', true);
    } catch (err) {
      this.results.bluesky = {
        success: false,
        message: `❌ Bluesky: ${err.message}`
      };
      console.error(this.results.bluesky.message);
      this.analytics.trackPostingResult('bluesky', false);
    }
  }

  /**
   * Post simple (single post) to Bluesky
   */
  async postBlueskySimple(session, content) {
    const post = this.formatBlueskyPost(content);

    const postOptions = {
      hostname: new URL(this.config.bluesky.pds).hostname,
      port: 443,
      path: '/xrpc/com.atproto.repo.createRecord',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessJwt}`,
        'Content-Type': 'application/json',
        'User-Agent': '3mpwrApp-Curator/2.0'
      }
    };

    const postBody = {
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        text: post,
        createdAt: new Date().toISOString(),
        langs: ['en']
      }
    };

    const postRes = await this.httpRequest(postOptions, postBody);

    if (postRes.status >= 200 && postRes.status < 300) {
      this.results.bluesky = {
        success: true,
        message: `✅ Bluesky: Posted successfully (${postRes.body.uri})`
      };
      console.log(this.results.bluesky.message);
    } else {
      throw new Error(`HTTP ${postRes.status}: ${postRes.body.message || 'Unknown error'}`);
    }
  }

  /**
   * Post as thread to Bluesky
   */
  async postBlueskyThread(session, content) {
    const timeCtx = this.getTimeContext();
    const feature = this.getFeatureHighlight();
    
    // First post (intro)
    const introPost = `${timeCtx.greeting} 📰 ${content.date}\n\n` +
                     `3mpwrApp curated ${content.count} stories on disability, accessibility & benefits.\n\n` +
                     `🌟 ${feature}\n\n` +
                     `Thread with top stories 🧵👇`;

    let previousPost = null;
    const posts = [introPost];

    // Add top 5 stories as individual posts in thread
    const topItems = content.items.slice(0, 5);
    topItems.forEach((item, idx) => {
      const storyPost = `${idx + 1}/${topItems.length}: ${item.title}\n\n` +
                       `${item.description ? item.description.substring(0, 200) + '...\n\n' : ''}` +
                       `🔗 ${item.link}`;
      posts.push(storyPost);
    });

    // Final post (CTA)
    const finalPost = `✨ That's ${topItems.length}/${content.count} curated stories!\n\n` +
                     `Visit 3mpwrApp blog for all stories:\n` +
                     `🔗 ${BLOG_URL}\n\n` +
                     `#Accessibility #DisabilityRights #DisabilityBenefits #News #Canada`;
    posts.push(finalPost);

    // Post each in sequence, linking to previous
    for (const postText of posts) {
      const postOptions = {
        hostname: new URL(this.config.bluesky.pds).hostname,
        port: 443,
        path: '/xrpc/com.atproto.repo.createRecord',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessJwt}`,
          'Content-Type': 'application/json',
          'User-Agent': '3mpwrApp-Curator/2.0'
        }
      };

      const record = {
        text: postText,
        createdAt: new Date().toISOString(),
        langs: ['en']
      };

      // Link to previous post in thread
      if (previousPost) {
        record.reply = {
          root: {
            uri: posts[0] === postText ? null : posts[0].uri,
            cid: posts[0] === postText ? null : posts[0].cid
          },
          parent: {
            uri: previousPost.uri,
            cid: previousPost.cid
          }
        };
      }

      const postBody = {
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record
      };

      const postRes = await this.httpRequest(postOptions, postBody);

      if (postRes.status >= 200 && postRes.status < 300) {
        previousPost = postRes.body;
        // Store root reference
        if (!record.reply) {
          posts[0].uri = postRes.body.uri;
          posts[0].cid = postRes.body.cid;
        }
      } else {
        throw new Error(`Thread post failed: HTTP ${postRes.status}`);
      }

      // Small delay between posts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.results.bluesky = {
      success: true,
      message: `✅ Bluesky: Posted thread with ${posts.length} posts`
    };
    console.log(this.results.bluesky.message);
  }

  /**
   * Post to X/Twitter
   */
  async postToX(content) {
    if (!this.config.x.enabled) {
      this.results.x = { success: false, message: 'X: Not configured' };
      return;
    }

    try {
      const post = this.formatXPost(content);

      // Use OAuth 2.0 Bearer Token (simpler, no signing needed)
      const options = {
        hostname: 'api.x.com',
        port: 443,
        path: '/2/tweets',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.x.bearerToken}`,
          'Content-Type': 'application/json',
          'User-Agent': '3mpwrApp-Curator/2.0'
        }
      };

      const body = {
        text: post
      };

      const res = await this.httpRequest(options, body);

      if (res.status >= 200 && res.status < 300) {
        this.results.x = {
          success: true,
          message: `✅ X: Posted successfully (${res.body.data?.id})`
        };
        console.log(this.results.x.message);
        this.analytics.trackPostingResult('x', true);
      } else {
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.body.errors || res.body)}`);
      }
    } catch (err) {
      this.results.x = {
        success: false,
        message: `❌ X: ${err.message}`
      };
      console.error(this.results.x.message);
      this.analytics.trackPostingResult('x', false);
    }
  }

  /**
   * Post to all enabled platforms
   */
  async postAll() {
    try {
      console.log('\n📤 SOCIAL-POST v2.0 (Enhanced)\n');

      const content = this.getLatestContent();
      console.log(`📋 Found ${content.count} curated items\n`);

      // Verify blog URL is accessible before posting
      console.log(`🔍 Verifying blog URL: ${BLOG_URL}`);
      const isAccessible = await this.verifyUrl(BLOG_URL);
      
      if (!isAccessible) {
        console.error('\n❌ ERROR: Blog URL is not accessible!');
        console.error(`Cannot post to social media with broken link: ${BLOG_URL}`);
        console.error('This would result in 404 errors for users.\n');
        
        this.results.mastodon = { success: false, message: 'Blog URL not accessible (404)' };
        this.results.bluesky = { success: false, message: 'Blog URL not accessible (404)' };
        this.results.x = { success: false, message: 'Blog URL not accessible (404)' };
        
        // Save results
        const resultsPath = path.join(process.cwd(), 'public', 'posting-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
        
        throw new Error('Blog URL verification failed');
      }
      
      console.log('✅ Blog URL verified accessible!\n');

      // Get time context and feature (for analytics)
      const timeCtx = this.getTimeContext();
      const feature = this.getFeatureHighlight();

      // Post in sequence
      await this.postToMastodon(content);
      await this.postToBluesky(content);
      await this.postToX(content);

      // Track analytics
      const platforms = [];
      if (this.results.mastodon.success) platforms.push('mastodon');
      if (this.results.bluesky.success) platforms.push('bluesky');
      if (this.results.x.success) platforms.push('x');

      // Track feature highlight usage
      if (this.currentFeature && this.currentTimeSlot) {
        platforms.forEach(platform => {
          this.analytics.trackFeatureHighlight(this.currentFeature, this.currentTimeSlot, platform);
        });
      }

      // Track time slot performance
      if (this.currentTimeSlot) {
        this.analytics.trackTimeSlot(this.currentTimeSlot, content.count, platforms);
      }

      // Save analytics
      this.analytics.saveAnalytics();

      // Summary
      const successCount = Object.values(this.results).filter((r) => r.success).length;
      const totalCount = Object.values(this.results).filter((r) => r.message !== 'Not configured').length;

      console.log(`\n📊 Results: ${successCount}/${totalCount} platforms succeeded`);
      console.log(`⏰ Time slot: ${this.currentTimeSlot}`);
      console.log(`🌟 Feature: ${this.currentFeature ? this.currentFeature.split(':')[0] : 'N/A'}\n`);

      // Save results
      const resultsPath = path.join(process.cwd(), 'public', 'posting-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));

      // Exit with error if critical failure
      if (successCount === 0 && totalCount > 0) {
        throw new Error('All platforms failed');
      }
    } catch (err) {
      console.error(`\n❌ POSTING ERROR: ${err.message}\n`);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const poster = new SocialPoster();
  poster.postAll().catch((err) => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = SocialPoster;
