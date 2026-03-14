#!/usr/bin/env node
/**
 * POST-DAILY-FEATURE.JS
 * Posts daily feature article to social media
 * 
 * Features:
 * - Reads daily-feature-social.json
 * - Posts to Bluesky and Mastodon
 * - Includes article link
 * - Tracks posting results
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class FeaturePoster {
  constructor() {
    this.socialDataPath = path.join(process.cwd(), 'public', 'daily-feature-social.json');
    this.resultsPath = path.join(process.cwd(), 'public', 'feature-posting-results.json');
    
    this.config = {
      mastodon: {
        enabled: !!process.env.MASTO_TOKEN,
        instance: process.env.MASTO_INSTANCE || 'https://mastodon.social',
        token: process.env.MASTO_TOKEN || '',
      },
      bluesky: {
        enabled: !!process.env.BLUESKY_HANDLE && !!process.env.BLUESKY_PASSWORD,
        handle: process.env.BLUESKY_HANDLE || '',
        password: process.env.BLUESKY_PASSWORD || '',
        pds: process.env.BLUESKY_PDS || 'https://bsky.social',
      },
      discord: {
        enabled: !!process.env.DISCORD_WEBHOOK_URL,
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
      }
    };

    this.results = {
      mastodon: { success: false, message: '', url: '' },
      bluesky: { success: false, message: '', url: '' },
      discord: { success: false, message: '' }
    };
  }

  /**
   * Load daily feature social content
   */
  loadSocialContent() {
    if (!fs.existsSync(this.socialDataPath)) {
      throw new Error('No daily feature social content found. Run daily-feature-generator first.');
    }

    return JSON.parse(fs.readFileSync(this.socialDataPath, 'utf-8'));
  }

  /**
   * Make HTTPS request
   */
  async httpsRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body), headers: res.headers });
          } catch {
            resolve({ statusCode: res.statusCode, body, headers: res.headers });
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * Post to Mastodon
   */
  async postToMastodon(content) {
    if (!this.config.mastodon.enabled) {
      return { success: false, message: 'Mastodon not configured' };
    }

    try {
      console.log('📤 Posting to Mastodon...');

      const instance = this.config.mastodon.instance.replace(/^https?:\/\//, '');
      const url = new URL(`https://${instance}/api/v1/statuses`);

      const options = {
        method: 'POST',
        hostname: url.hostname,
        path: url.pathname,
        headers: {
          'Authorization': `Bearer ${this.config.mastodon.token}`,
          'Content-Type': 'application/json',
        }
      };

      // Build a smart Mastodon post — URL and hashtags are never cut off
      const MASTO_LIMIT = 500;
      const articleUrl = content.url || '';
      const tags = '#3mpwrApp #DisabilityRights #Accessibility';
      const featureName = (content.feature || '').substring(0, 80);
      // Use the hook line (first line of shortPost) as the opening
      const hookLine = (content.shortPost || content.longPost || '').split('\n')[0].substring(0, 120);
      // Build full body — hook + feature + description excerpt + URL + tags
      const descLine = (content.longPost || '').split('\n').slice(1).join(' ').replace(/\s+/g, ' ').trim();
      let statusText = `${hookLine}\n\n✨ ${featureName}\n\n${descLine}\n\n${articleUrl}\n\n${tags}`;
      if (statusText.length > MASTO_LIMIT) {
        // Trim the description excerpt to fit
        const fixedParts = `\n\n✨ ${featureName}\n\n`;
        const suffix = `\n\n${articleUrl}\n\n${tags}`;
        const budget = MASTO_LIMIT - hookLine.length - fixedParts.length - suffix.length - 3;
        const trimmedDesc = budget > 20 ? descLine.substring(0, budget) + '...' : '';
        statusText = `${hookLine}${fixedParts}${trimmedDesc}${suffix}`;
      }
      if (statusText.length > MASTO_LIMIT) {
        // Last resort: shorten hook too
        const suffix = `\n\n${articleUrl}\n\n${tags}`;
        const maxHook = MASTO_LIMIT - suffix.length - featureName.length - 10;
        statusText = `${hookLine.substring(0, Math.max(20, maxHook))}...\n\n✨ ${featureName}${suffix}`;
      }

      const postData = {
        status: statusText,
        visibility: 'public',
        language: 'en'
      };

      const response = await this.httpsRequest(options, postData);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const postUrl = response.body.url || response.body.uri || '';
        console.log(`✅ Mastodon posted: ${postUrl}`);
        return { success: true, message: 'Posted successfully', url: postUrl };
      } else {
        console.error(`❌ Mastodon error: ${response.statusCode}`);
        return { success: false, message: `HTTP ${response.statusCode}: ${JSON.stringify(response.body)}` };
      }
    } catch (err) {
      console.error(`❌ Mastodon error: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  /**
   * Post to Discord #app-announcements via webhook
   * @param {object} content - Post content (url may be fallback blog page)
   * @param {string} [articleUrl] - The specific article URL (shown in Read Article field)
   */
  async postToDiscord(content, articleUrl) {
    if (!this.config.discord.enabled) {
      return { success: false, message: 'Discord not configured' };
    }

    try {
      console.log('📤 Posting to Discord...');

      const webhookUrl = new URL(this.config.discord.webhookUrl);

      const BLOG_URL = 'https://3mpwrapp.pages.dev/blog/';
      const readArticleUrl = articleUrl || content.url || BLOG_URL;

      // Strip URLs from description — links are shown cleanly in the two fields below
      const rawDescription = (content.shortPost || content.longPost || '');
      const cleanDescription = rawDescription
        .replace(/https?:\/\/\S+/g, '')        // remove all URLs
        .replace(/\n{3,}/g, '\n\n')             // collapse excess blank lines
        .trim();

      const embed = {
        title: content.feature || 'New Feature Spotlight',
        description: cleanDescription.substring(0, 4096),
        url: readArticleUrl,
        color: 0x6366f1,
        fields: [
          { name: '📖 Read Article', value: readArticleUrl, inline: false },
          { name: '📰 Blog', value: BLOG_URL, inline: false }
        ],
        footer: { text: '3mpwr App • app-announcements' },
        timestamp: new Date().toISOString()
      };

      const payload = JSON.stringify({
        username: '3mpwr App',
        embeds: [embed]
      });

      const options = {
        method: 'POST',
        hostname: webhookUrl.hostname,
        path: webhookUrl.pathname + webhookUrl.search,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const response = await this.httpsRequest(options, payload);

      if (response.statusCode === 200 || response.statusCode === 204) {
        console.log('✅ Discord posted to #app-announcements');
        return { success: true, message: 'Posted to Discord' };
      } else {
        console.error(`❌ Discord error: ${response.statusCode}`);
        return { success: false, message: `HTTP ${response.statusCode}` };
      }
    } catch (err) {
      console.error(`❌ Discord error: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  /**
   * Login to Bluesky
   */
  async blueskyLogin() {
    try {
      const url = new URL(`${this.config.bluesky.pds}/xrpc/com.atproto.server.createSession`);

      const options = {
        method: 'POST',
        hostname: url.hostname,
        path: url.pathname,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const loginData = {
        identifier: this.config.bluesky.handle,
        password: this.config.bluesky.password
      };

      const response = await this.httpsRequest(options, loginData);

      if (response.statusCode === 200 && response.body.accessJwt) {
        return response.body;
      }

      throw new Error(`Login failed: ${response.statusCode}`);
    } catch (err) {
      throw new Error(`Bluesky login error: ${err.message}`);
    }
  }

  /**
   * Post to Bluesky
   */
  async postToBluesky(content) {
    if (!this.config.bluesky.enabled) {
      return { success: false, message: 'Bluesky not configured' };
    }

    try {
      console.log('📤 Posting to Bluesky...');

      // Login first
      const session = await this.blueskyLogin();
      const url = new URL(`${this.config.bluesky.pds}/xrpc/com.atproto.repo.createRecord`);

      // Bluesky hard limit: 300 graphemes. Build a compact post that always fits.
      const BSKY_LIMIT = 300;
      const hookLine = (content.shortPost || '').split('\n')[0].substring(0, 80);
      const featureName = (content.feature || '').substring(0, 60);
      const tags = '#3mpwrApp #DisabilityRights';
      const articleUrl = content.url;
      // Base template: hook \n\n ✨ name \n\n url \n\n tags
      let postText = `${hookLine}\n\n✨ ${featureName}\n\n${articleUrl}\n\n${tags}`;
      if (postText.length > BSKY_LIMIT) {
        // Trim hook further to make it fit
        const excess = postText.length - BSKY_LIMIT;
        const trimmedHook = hookLine.substring(0, Math.max(10, hookLine.length - excess - 3)) + '...';
        postText = `${trimmedHook}\n\n✨ ${featureName}\n\n${articleUrl}\n\n${tags}`;
      }
      if (postText.length > BSKY_LIMIT) {
        // Last resort: trim the whole thing
        postText = postText.substring(0, BSKY_LIMIT - 3) + '...';
      }

      const options = {
        method: 'POST',
        hostname: url.hostname,
        path: url.pathname,
        headers: {
          'Authorization': `Bearer ${session.accessJwt}`,
          'Content-Type': 'application/json',
        }
      };

      const postData = {
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record: {
          text: postText,
          createdAt: new Date().toISOString(),
          $type: 'app.bsky.feed.post'
        }
      };

      const response = await this.httpsRequest(options, postData);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const postUrl = `https://bsky.app/profile/${this.config.bluesky.handle}/post/${response.body.uri.split('/').pop()}`;
        console.log(`✅ Bluesky posted: ${postUrl}`);
        return { success: true, message: 'Posted successfully', url: postUrl };
      } else {
        console.error(`❌ Bluesky error: ${response.statusCode}`);
        return { success: false, message: `HTTP ${response.statusCode}: ${JSON.stringify(response.body)}` };
      }
    } catch (err) {
      console.error(`❌ Bluesky error: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  /**
   * Verify URL is accessible before posting
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
   * Post to all platforms
   */
  async postAll() {
    console.log('\n📱 POSTING DAILY FEATURE TO SOCIAL MEDIA\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // Load content
    const content = this.loadSocialContent();
    console.log(`🌟 Feature: ${content.feature}`);
    console.log(`📅 Date: ${content.date}`);
    console.log(`🔗 URL: ${content.url}\n`);

    // Verify URL is accessible — retry up to 3 times with 30s gaps before falling back
    const BLOG_FALLBACK = 'https://3mpwrapp.pages.dev/blog/';
    const originalArticleUrl = content.url;
    console.log('🔍 Verifying article URL is accessible...');
    let isAccessible = await this.verifyUrl(content.url);

    if (!isAccessible) {
      console.warn(`⚠️  Article URL not live yet: ${content.url}`);
      for (let attempt = 1; attempt <= 3 && !isAccessible; attempt++) {
        console.log(`⏳ Retry ${attempt}/3 — waiting 30s...`);
        await this.sleep(30000);
        isAccessible = await this.verifyUrl(content.url);
        if (isAccessible) console.log(`✅ Article came live on retry ${attempt}!\n`);
      }
    }

    if (!isAccessible) {
      console.warn(`❌ Article URL still 404 after retries. Using blog fallback for all platforms.`);
      console.warn(`   Original URL (for reference): ${originalArticleUrl}\n`);
      // Replace URL everywhere so no platform posts a dead link
      content.url = BLOG_FALLBACK;
      if (content.shortPost) content.shortPost = content.shortPost.replace(/https?:\/\/\S+/g, BLOG_FALLBACK);
      if (content.longPost) content.longPost = content.longPost.replace(/https?:\/\/\S+/g, BLOG_FALLBACK);
    } else {
      console.log('✅ Article URL verified accessible!\n');
    }

    // Post to Mastodon
    this.results.mastodon = await this.postToMastodon(content);
    await this.sleep(2000); // 2 second delay between posts

    // Post to Bluesky
    this.results.bluesky = await this.postToBluesky(content);
    await this.sleep(1000);

    // Post to Discord #app-announcements — by this point content.url is the best live URL available
    this.results.discord = await this.postToDiscord(content, content.url);

    // Save results
    this.saveResults(content);

    // Summary
    console.log('\n═══════════════════════════════════════════════════════\n');
    console.log('📊 POSTING SUMMARY:\n');
    console.log(`Mastodon: ${this.results.mastodon.success ? '✅ Success' : '❌ Failed'}`);
    if (this.results.mastodon.url) console.log(`  ${this.results.mastodon.url}`);
    console.log(`Bluesky: ${this.results.bluesky.success ? '✅ Success' : '❌ Failed'}`);
    if (this.results.bluesky.url) console.log(`  ${this.results.bluesky.url}`);
    console.log(`Discord: ${this.results.discord.success ? '✅ Success' : '❌ Failed'}`);
    console.log('\n═══════════════════════════════════════════════════════\n');

    return this.results;
  }

  /**
   * Save posting results
   */
  saveResults(content) {
    const results = {
      feature: content.feature,
      date: content.date,
      articleUrl: content.url,
      timestamp: new Date().toISOString(),
      results: this.results
    };

    fs.writeFileSync(this.resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved: ${this.resultsPath}`);
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if called directly
if (require.main === module) {
  const poster = new FeaturePoster();
  poster.postAll().catch(err => {
    console.error(`\n❌ Fatal error: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = FeaturePoster;
