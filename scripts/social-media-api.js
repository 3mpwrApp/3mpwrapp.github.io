#!/usr/bin/env node

/**
 * Social Media API Integration
 * 
 * Enables direct posting to social media platforms via their official APIs.
 * Currently supports:
 * - X (Twitter) API v2
 * - Mastodon REST API
 * - Facebook Graph API (via manual posting URL)
 * - Instagram Graph API (via manual posting URL)
 * 
 * Configuration stored in environment variables or .env file.
 * 
 * Supported environment variables:
 * - X_API_KEY: X API Bearer Token
 * - X_API_SECRET: X API Secret
 * - X_ACCESS_TOKEN: X Access Token
 * - X_ACCESS_SECRET: X Access Token Secret
 * - X_CLIENT_ID: X OAuth Client ID
 * - X_CLIENT_SECRET: X OAuth Client Secret
 * 
 * - MASTODON_INSTANCE: Mastodon instance URL (e.g., mastodon.social)
 * - MASTODON_ACCESS_TOKEN: Mastodon API token
 * 
 * - FACEBOOK_PAGE_ID: Facebook page ID
 * - FACEBOOK_ACCESS_TOKEN: Facebook API token
 * 
 * - INSTAGRAM_BUSINESS_ACCOUNT_ID: Instagram business account ID
 * - INSTAGRAM_ACCESS_TOKEN: Instagram API token
 * 
 * Usage:
 * X_API_KEY=xxx MASTODON_ACCESS_TOKEN=yyy node scripts/social-media-api.js
 * 
 * Or create a .env file in the root directory with credentials.
 */

const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue;

      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();

      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  }
}

loadEnv();

/**
 * Make HTTPS request helper
 */
function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => req.destroy(new Error('Request timeout')));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * X (Twitter) API v1.1 Integration with OAuth 1.0a
 * Uses OAuth 1.0a for reliable posting to native apps
 */
class XApiClient {
  constructor(apiKey, apiSecret, accessToken, accessTokenSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.accessToken = accessToken;
    this.accessTokenSecret = accessTokenSecret;
    this.endpoint = 'https://api.twitter.com';
  }

  buildOAuthSignature(method, url, params) {
    const crypto = require('crypto');
    
    // Sort parameters
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    // Build signature base string
    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;

    // Generate signature
    const signingKey = `${encodeURIComponent(this.apiSecret)}&${encodeURIComponent(this.accessTokenSecret)}`;
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    return signature;
  }

  async postTweet(text) {
    if (!this.apiKey || !this.apiSecret || !this.accessToken || !this.accessTokenSecret) {
      console.warn('[X API] Missing OAuth 1.0a credentials');
      return null;
    }

    if (text.length > 280) {
      console.warn(`[X API] Tweet exceeds 280 characters (${text.length}), truncating`);
      text = text.substring(0, 277) + '...';
    }

    try {
      const crypto = require('crypto');
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = crypto.randomBytes(16).toString('hex');

      const oauthParams = {
        'oauth_consumer_key': this.apiKey,
        'oauth_nonce': nonce,
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': timestamp,
        'oauth_token': this.accessToken,
        'oauth_version': '1.0',
        'status': text,
      };

      const url = 'https://api.twitter.com/1.1/statuses/update.json';
      const signature = this.buildOAuthSignature('POST', url, oauthParams);
      
      oauthParams['oauth_signature'] = signature;

      const authHeader = 'OAuth ' + Object.keys(oauthParams)
        .filter(key => key.startsWith('oauth_'))
        .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');

      const options = {
        hostname: 'api.twitter.com',
        path: `/1.1/statuses/update.json?status=${encodeURIComponent(text)}`,
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'User-Agent': '3mpwrApp/1.0',
        },
      };

      const res = await httpsRequest(options);

      if (res.status === 200) {
        console.log(`[X API] ✓ Tweet posted: ${res.data.id_str}`);
        return res.data;
      } else {
        console.error(`[X API] Failed to post tweet: ${res.status}`);
        if (res.data.errors) {
          console.error(`[X API] Error: ${res.data.errors[0].message}`);
        }
        return null;
      }
    } catch (e) {
      console.error(`[X API] Error posting tweet: ${e.message}`);
      return null;
    }
  }
}

/**
 * Mastodon API Integration
 */
class MastodonApiClient {
  constructor(instance, accessToken) {
    this.instance = instance || 'mastodon.social';
    this.accessToken = accessToken;
  }

  async postStatus(text, visibility = 'public') {
    if (!this.accessToken) {
      console.warn('[Mastodon API] No access token configured');
      return null;
    }

    try {
      const options = {
        hostname: this.instance,
        path: '/api/v1/statuses',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': '3mpwrApp/1.0',
        },
      };

      const body = { status: text, visibility };
      const res = await httpsRequest(options, body);

      if (res.status === 200) {
        console.log(`[Mastodon API] ✓ Status posted: ${res.data.id}`);
        return res.data;
      } else {
        console.error(
          `[Mastodon API] Failed to post status: ${res.status} - ${res.data}`
        );
        return null;
      }
    } catch (e) {
      console.error(`[Mastodon API] Error posting status: ${e.message}`);
      return null;
    }
  }
}

/**
 * Facebook Graph API Integration
 * Note: Requires manual setup in Facebook App Dashboard
 */
class FacebookApiClient {
  constructor(pageId, accessToken) {
    this.pageId = pageId;
    this.accessToken = accessToken;
  }

  async postPage(message, link = null) {
    if (!this.accessToken || !this.pageId) {
      console.warn('[Facebook API] No credentials configured');
      return null;
    }

    try {
      const query = {
        message: message,
        access_token: this.accessToken,
      };

      if (link) {
        query.link = link;
      }

      const queryStr = querystring.stringify(query);

      const options = {
        hostname: 'graph.facebook.com',
        path: `/v18.0/${this.pageId}/feed?${queryStr}`,
        method: 'POST',
        headers: {
          'User-Agent': '3mpwrApp/1.0',
        },
      };

      const res = await httpsRequest(options);

      if (res.status === 200) {
        console.log(`[Facebook API] ✓ Post created: ${res.data.id}`);
        return res.data;
      } else {
        console.error(
          `[Facebook API] Failed to create post: ${res.status} - ${res.data}`
        );
        return null;
      }
    } catch (e) {
      console.error(`[Facebook API] Error posting: ${e.message}`);
      return null;
    }
  }
}

/**
 * Instagram Graph API Integration
 * Note: Requires business account and app approval
 */
class InstagramApiClient {
  constructor(businessAccountId, accessToken) {
    this.businessAccountId = businessAccountId;
    this.accessToken = accessToken;
  }

  async createCarousel(mediaItems, caption) {
    if (!this.accessToken || !this.businessAccountId) {
      console.warn('[Instagram API] No credentials configured');
      return null;
    }

    try {
      // Create media container first
      const containerOptions = {
        hostname: 'graph.instagram.com',
        path: `/v18.0/${this.businessAccountId}/media`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': '3mpwrApp/1.0',
        },
      };

      const containerBody = {
        media_type: 'CAROUSEL',
        children: mediaItems.map(item => item.id),
        caption: caption,
        access_token: this.accessToken,
      };

      const res = await httpsRequest(containerOptions, containerBody);

      if (res.status === 200) {
        console.log(`[Instagram API] ✓ Carousel created: ${res.data.id}`);
        return res.data;
      } else {
        console.error(
          `[Instagram API] Failed to create carousel: ${res.status} - ${res.data}`
        );
        return null;
      }
    } catch (e) {
      console.error(`[Instagram API] Error creating carousel: ${e.message}`);
      return null;
    }
  }

  async createPhoto(imageUrl, caption) {
    if (!this.accessToken || !this.businessAccountId) {
      console.warn('[Instagram API] No credentials configured');
      return null;
    }

    try {
      const options = {
        hostname: 'graph.instagram.com',
        path: `/v18.0/${this.businessAccountId}/media`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': '3mpwrApp/1.0',
        },
      };

      const body = {
        image_url: imageUrl,
        caption: caption,
        access_token: this.accessToken,
      };

      const res = await httpsRequest(options, body);

      if (res.status === 200) {
        console.log(`[Instagram API] ✓ Photo uploaded: ${res.data.id}`);
        return res.data;
      } else {
        console.error(
          `[Instagram API] Failed to upload photo: ${res.status} - ${res.data}`
        );
        return null;
      }
    } catch (e) {
      console.error(`[Instagram API] Error uploading photo: ${e.message}`);
      return null;
    }
  }
}

/**
 * Main Social Media Manager
 */
class SocialMediaManager {
  constructor() {
    this.x = new XApiClient(
      process.env.X_API_KEY,
      process.env.X_API_SECRET,
      process.env.X_ACCESS_TOKEN,
      process.env.X_ACCESS_TOKEN_SECRET
    );
    this.mastodon = new MastodonApiClient(
      process.env.MASTODON_INSTANCE,
      process.env.MASTODON_ACCESS_TOKEN
    );
    this.facebook = new FacebookApiClient(
      process.env.FACEBOOK_PAGE_ID,
      process.env.FACEBOOK_ACCESS_TOKEN
    );
    this.instagram = new InstagramApiClient(
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
      process.env.INSTAGRAM_ACCESS_TOKEN
    );
  }

  async postToAll(content) {
    const results = {
      x: null,
      mastodon: null,
      facebook: null,
      instagram: null,
    };

    console.log('[social-media-api] Posting to all platforms...\n');

    // Post to X
    if (content.x) {
      console.log('[social-media-api] Posting to X...');
      results.x = await this.x.postTweet(content.x);
    }

    // Post to Mastodon
    if (content.mastodon) {
      console.log('[social-media-api] Posting to Mastodon...');
      results.mastodon = await this.mastodon.postStatus(content.mastodon, 'public');
    }

    // Post to Facebook
    if (content.facebook) {
      console.log('[social-media-api] Posting to Facebook...');
      results.facebook = await this.facebook.postPage(content.facebook, content.link);
    }

    // Post to Instagram
    if (content.instagram) {
      console.log('[social-media-api] Posting to Instagram...');
      results.instagram = await this.instagram.createPhoto(
        content.imageUrl,
        content.instagram
      );
    }

    return results;
  }

  async schedulePost(content, delayMs) {
    console.log(`[social-media-api] Post scheduled for ${new Date(Date.now() + delayMs).toISOString()}`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return this.postToAll(content);
  }
}

/**
 * Configuration status
 */
function getConfigStatus() {
  const status = {
    x_configured: !!process.env.X_API_KEY,
    mastodon_configured: !!(
      process.env.MASTODON_INSTANCE && process.env.MASTODON_ACCESS_TOKEN
    ),
    facebook_configured: !!(
      process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_ACCESS_TOKEN
    ),
    instagram_configured: !!(
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID &&
      process.env.INSTAGRAM_ACCESS_TOKEN
    ),
  };

  return status;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    XApiClient,
    MastodonApiClient,
    FacebookApiClient,
    InstagramApiClient,
    SocialMediaManager,
    getConfigStatus,
  };
}

// Test mode
async function main() {
  console.log('[social-media-api] Social Media API Integration\n');

  const status = getConfigStatus();

  console.log('Configuration Status:');
  console.log(`  X (Twitter): ${status.x_configured ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  Mastodon: ${status.mastodon_configured ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  Facebook: ${status.facebook_configured ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  Instagram: ${status.instagram_configured ? '✓ Configured' : '✗ Not configured'}\n`);

  if (!Object.values(status).some(v => v)) {
    console.log('⚠ No social media APIs are configured.\n');
    console.log('To enable API posting, set environment variables:');
    console.log('  X_API_KEY=your_bearer_token');
    console.log('  MASTODON_INSTANCE=mastodon.social');
    console.log('  MASTODON_ACCESS_TOKEN=your_token');
    console.log('  FACEBOOK_PAGE_ID=your_page_id');
    console.log('  FACEBOOK_ACCESS_TOKEN=your_token');
    console.log('  INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id');
    console.log('  INSTAGRAM_ACCESS_TOKEN=your_token\n');
    console.log('Or create a .env file in the project root with these values.\n');
  }

  const manager = new SocialMediaManager();
  console.log('[social-media-api] Manager initialized and ready');
}

if (require.main === module) {
  main().catch(err => {
    console.error('[social-media-api] Error:', err.message);
    process.exit(1);
  });
}
