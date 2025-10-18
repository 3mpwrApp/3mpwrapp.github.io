#!/usr/bin/env node

/**
 * Post to X (Twitter) - Daily Curation & App Promotion
 * 
 * Functionality:
 * 1. Posts daily curated news to @3mpwrApp
 * 2. Posts daily app feature promotion
 * 3. Uses OAuth 1.0a for Native App compatibility
 * 
 * Schedule: Runs at 9 AM UTC daily via GitHub Actions
 * 
 * Credentials needed (from GitHub Secrets):
 * - X_API_KEY
 * - X_API_SECRET
 * - X_ACCESS_TOKEN
 * - X_ACCESS_TOKEN_SECRET
 * - X_BEARER_TOKEN (for fallback read operations)
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Get credentials from environment
const credentials = {
  apiKey: process.env.X_API_KEY,
  apiSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
  bearerToken: process.env.X_BEARER_TOKEN,
};

// Validate credentials
const missingCredentials = Object.entries(credentials)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingCredentials.length > 0) {
  console.error(`❌ Missing X credentials: ${missingCredentials.join(', ')}`);
  process.exit(1);
}

/**
 * X API Client using OAuth 1.0a
 */
class XApiClient {
  constructor(apiKey, apiSecret, accessToken, accessTokenSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.accessToken = accessToken;
    this.accessTokenSecret = accessTokenSecret;
  }

  /**
   * Build OAuth 1.0a signature
   */
  buildOAuthSignature(method, url, params) {
    // Sort parameters
    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${this.encodeParam(k)}=${this.encodeParam(v)}`)
      .join('&');

    // Build base string
    const baseString = `${method}&${this.encodeParam(url)}&${this.encodeParam(sortedParams)}`;

    // Build signing key
    const signingKey = `${this.encodeParam(this.apiSecret)}&${this.encodeParam(this.accessTokenSecret)}`;

    // Generate signature
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    return signature;
  }

  /**
   * Encode parameter for OAuth
   */
  encodeParam(value) {
    return encodeURIComponent(value)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }

  /**
   * Build OAuth 1.0a Authorization header
   */
  buildAuthHeader(method, url, params) {
    const oauthParams = {
      oauth_consumer_key: this.apiKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: this.accessToken,
      oauth_version: '1.0',
    };

    // Add request params to signature calculation
    const allParams = { ...oauthParams, ...params };
    const signature = this.buildOAuthSignature(method, url, allParams);
    oauthParams.oauth_signature = signature;

    // Build authorization header
    const authHeader = 'OAuth ' + Object.entries(oauthParams)
      .map(([k, v]) => `${k}="${this.encodeParam(v)}"`)
      .join(', ');

    return authHeader;
  }

  /**
   * Make HTTPS request to X API
   */
  makeRequest(method, path, data) {
    return new Promise((resolve, reject) => {
      const url = `https://api.twitter.com${path}`;
      const urlObj = new URL(url);

      // Build query string for GET
      let queryString = '';
      if (method === 'GET' && data && Object.keys(data).length > 0) {
        queryString = '?' + Object.entries(data)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&');
      }

      const requestPath = path + queryString;

      // Build OAuth header
      const authHeader = this.buildAuthHeader(method, url, data || {});

      const options = {
        hostname: 'api.twitter.com',
        path: requestPath,
        method: method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': '3mpwrApp-Automation/1.0',
        },
      };

      // For POST, include data in body
      let body = '';
      if (method === 'POST' && data) {
        body = Object.entries(data)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&');
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve({
              status: res.statusCode,
              data: parsed,
              headers: res.headers,
            });
          } catch {
            resolve({
              status: res.statusCode,
              data: responseData,
              headers: res.headers,
            });
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  /**
   * Post a tweet using v1.1 API
   */
  async postTweet(text) {
    console.log(`📝 Posting tweet: "${text.substring(0, 50)}..."`);

    try {
      const response = await this.makeRequest('POST', '/1.1/statuses/update.json', {
        status: text,
      });

      if (response.status === 200) {
        console.log(`✅ Tweet posted successfully! ID: ${response.data.id}`);
        return {
          success: true,
          tweetId: response.data.id,
          url: `https://x.com/${response.data.user.screen_name}/status/${response.data.id}`,
        };
      } else {
        console.error(`❌ Failed to post tweet. Status: ${response.status}`);
        console.error(`Response:`, response.data);
        return {
          success: false,
          status: response.status,
          error: response.data,
        };
      }
    } catch (error) {
      console.error(`❌ Error posting tweet:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

/**
 * Get latest curated news headline
 */
function getLatestCurationHeadline() {
  const today = new Date().toISOString().split('T')[0];
  const curationFile = path.join(__dirname, '..', '_curation', `${today}-curation.md`);

  if (!fs.existsSync(curationFile)) {
    console.log(`⚠️  No curation file found for today: ${curationFile}`);
    return null;
  }

  try {
    const content = fs.readFileSync(curationFile, 'utf-8');
    
    // Extract first news item (usually after title)
    const lines = content.split('\n').filter(line => line.trim());
    
    // Find first numbered item or headline
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for markdown links
      if (line.includes('[') && line.includes('](')) {
        // Extract title from markdown link
        const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          const title = match[1];
          const url = match[2];
          
          // Shorten URL if needed
          const shortUrl = url.length > 23 ? url.substring(0, 20) + '...' : url;
          
          return {
            title: title,
            url: url,
            text: `📰 Today's top curated news:\n\n${title}\n\n${url}`,
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading curation file:`, error.message);
    return null;
  }
}

/**
 * Generate app feature promotion tweet
 */
function generateAppPromotionTweet() {
  const promotions = [
    "🚀 3mpwr App Features: Access 50+ free tools to expand your presence and reach more people globally! 🌍 #CommunityEmpowerment",
    "✨ 3mpwr App: Empower your community with our suite of free resources. Explore today! 💪 #DigitalTools",
    "🎯 3mpwr App: Your gateway to free tools for community growth. Simple. Powerful. Free. Start now! 🔥",
    "🌟 3mpwr App: Combining free tools with accessibility features to empower every community member. 💚 #A11y",
    "📱 3mpwr App: From content curation to community engagement - all free, all accessible. Learn more! 🎓",
  ];

  return promotions[Math.floor(Math.random() * promotions.length)];
}

/**
 * Main posting logic
 */
async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  X Daily Posting - Curation & Promo    ║');
  console.log('╚════════════════════════════════════════╝\n');

  const client = new XApiClient(
    credentials.apiKey,
    credentials.apiSecret,
    credentials.accessToken,
    credentials.accessTokenSecret,
  );

  const results = {
    curationPost: null,
    promotionPost: null,
    timestamp: new Date().toISOString(),
  };

  // Step 1: Post curation content
  console.log('📰 Step 1: Posting daily curation news...\n');
  
  const curationHeadline = getLatestCurationHeadline();
  if (curationHeadline) {
    results.curationPost = await client.postTweet(curationHeadline.text);
    console.log();
  } else {
    console.log('⚠️  Skipping curation post - no content found\n');
  }

  // Step 2: Post app promotion
  console.log('🎯 Step 2: Posting app feature promotion...\n');
  
  const promotionText = generateAppPromotionTweet();
  results.promotionPost = await client.postTweet(promotionText);
  console.log();

  // Step 3: Summary
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Posting Summary                       ║');
  console.log('╚════════════════════════════════════════╝\n');

  const curationSuccess = results.curationPost?.success ? '✅' : '❌';
  const promotionSuccess = results.promotionPost?.success ? '✅' : '❌';

  console.log(`${curationSuccess} Curation Post: ${results.curationPost?.success ? 'Posted' : 'Failed'}`);
  if (results.curationPost?.url) {
    console.log(`   ${results.curationPost.url}`);
  }
  
  console.log(`${promotionSuccess} Promotion Post: ${results.promotionPost?.success ? 'Posted' : 'Failed'}`);
  if (results.promotionPost?.url) {
    console.log(`   ${results.promotionPost.url}`);
  }

  console.log('\n✨ Daily X posting complete!\n');

  // Save results for debugging
  const resultsFile = path.join(__dirname, '..', 'public', 'x-posting-results.json');
  fs.mkdirSync(path.dirname(resultsFile), { recursive: true });
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  // Exit with success if at least one post succeeded
  const anySuccess = results.curationPost?.success || results.promotionPost?.success;
  process.exit(anySuccess ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
