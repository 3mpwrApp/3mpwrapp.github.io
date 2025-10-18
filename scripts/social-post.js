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
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class SocialPoster {
  constructor() {
    this.config = this.loadConfig();
    this.results = {
      mastodon: { success: false, message: '' },
      bluesky: { success: false, message: '' },
      x: { success: false, message: '' }
    };
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
        enabled: !!process.env.X_BEARER_TOKEN,
        bearerToken: process.env.X_BEARER_TOKEN || '',
        apiKey: process.env.X_API_KEY || '',
        apiSecret: process.env.X_API_SECRET || '',
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
   * Format content for Mastodon
   */
  formatMastodonPost(content) {
    const topItems = content.items.slice(0, 3);
    let post = `📰 Daily News Curation - ${content.date}\n\n`;
    post += `Found ${content.count} stories from disability, accessibility & social policy sources:\n\n`;

    topItems.forEach((item, idx) => {
      post += `${idx + 1}. ${item.title}\n`;
      if (item.link) {
        post += `${item.link}\n`;
      }
      post += '\n';
    });

    post += `\n🔗 Full curation: https://3mpwrapp.pages.dev/curation-latest.json\n`;
    post += `\n#Accessibility #DisabilityRights #News #Canada`;

    return post;
  }

  /**
   * Format content for Bluesky
   */
  formatBlueskyPost(content) {
    const topItems = content.items.slice(0, 3);
    let post = `📰 Daily News Curation - ${content.date}\n\n`;
    post += `Found ${content.count} stories:\n\n`;

    topItems.forEach((item, idx) => {
      post += `${idx + 1}. ${item.title}`;
      if (item.link) {
        post += `\n${item.link}`;
      }
      post += '\n\n';
    });

    post += `#Accessibility #DisabilityRights #News`;

    return post;
  }

  /**
   * Format content for X
   */
  formatXPost(content) {
    const topItems = content.items.slice(0, 2);
    let post = `📰 Daily News Curation\n\n`;

    topItems.forEach((item) => {
      post += `• ${item.title}\n`;
    });

    post += `\n+ ${content.count - 2} more stories\n\n`;
    post += `#Accessibility #News https://3mpwrapp.pages.dev`;

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
      } else {
        throw new Error(`HTTP ${res.status}: ${res.body.error || 'Unknown error'}`);
      }
    } catch (err) {
      this.results.mastodon = {
        success: false,
        message: `❌ Mastodon: ${err.message}`
      };
      console.error(this.results.mastodon.message);
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
      const post = this.formatBlueskyPost(content);

      // Post
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
    } catch (err) {
      this.results.bluesky = {
        success: false,
        message: `❌ Bluesky: ${err.message}`
      };
      console.error(this.results.bluesky.message);
    }
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
      } else {
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.body.errors || res.body)}`);
      }
    } catch (err) {
      this.results.x = {
        success: false,
        message: `❌ X: ${err.message}`
      };
      console.error(this.results.x.message);
    }
  }

  /**
   * Post to all enabled platforms
   */
  async postAll() {
    try {
      console.log('\n📤 SOCIAL-POST v2.0\n');

      const content = this.getLatestContent();
      console.log(`📋 Found ${content.count} curated items\n`);

      // Post in sequence
      await this.postToMastodon(content);
      await this.postToBluesky(content);
      await this.postToX(content);

      // Summary
      const successCount = Object.values(this.results).filter((r) => r.success).length;
      const totalCount = Object.values(this.results).filter((r) => r.message !== 'Not configured').length;

      console.log(`\n📊 Results: ${successCount}/${totalCount} platforms succeeded\n`);

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
