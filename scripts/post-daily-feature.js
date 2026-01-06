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
      }
    };

    this.results = {
      mastodon: { success: false, message: '', url: '' },
      bluesky: { success: false, message: '', url: '' }
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

      // Truncate to 500-character Mastodon limit (with 10 char buffer)
      let statusText = content.longPost;
      if (statusText.length > 490) {
        statusText = statusText.substring(0, 487) + '...';
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

      // Bluesky has 300 character limit (grapheme count)
      let postText = content.shortPost;
      if (postText.length > 275) {
        // Truncate and add ellipsis
        postText = postText.substring(0, 272) + '...';
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

    // Verify URL is accessible before posting
    console.log('🔍 Verifying article URL is accessible...');
    const isAccessible = await this.verifyUrl(content.url);
    
    if (!isAccessible) {
      console.error('\n❌ ERROR: Article URL is not accessible!');
      console.error(`Cannot post to social media with broken link: ${content.url}`);
      console.error('This would result in 404 errors for users.\n');
      
      this.results.mastodon = { success: false, message: 'Article URL not accessible (404)' };
      this.results.bluesky = { success: false, message: 'Article URL not accessible (404)' };
      
      this.saveResults(content);
      process.exit(1);
    }
    
    console.log('✅ Article URL verified accessible!\n');

    // Post to Mastodon
    this.results.mastodon = await this.postToMastodon(content);
    await this.sleep(2000); // 2 second delay between posts

    // Post to Bluesky
    this.results.bluesky = await this.postToBluesky(content);

    // Save results
    this.saveResults(content);

    // Summary
    console.log('\n═══════════════════════════════════════════════════════\n');
    console.log('📊 POSTING SUMMARY:\n');
    console.log(`Mastodon: ${this.results.mastodon.success ? '✅ Success' : '❌ Failed'}`);
    if (this.results.mastodon.url) console.log(`  ${this.results.mastodon.url}`);
    console.log(`Bluesky: ${this.results.bluesky.success ? '✅ Success' : '❌ Failed'}`);
    if (this.results.bluesky.url) console.log(`  ${this.results.bluesky.url}`);
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
