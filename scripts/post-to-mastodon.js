#!/usr/bin/env node

/**
 * Post to Mastodon - Daily Curation & App Promotion
 * 
 * Functionality:
 * 1. Posts daily curated news to @3mpwrApp@mastodon.social
 * 2. Posts daily app feature promotion
 * 3. Uses Mastodon REST API v1
 * 
 * Schedule: Runs at 9 AM UTC daily via GitHub Actions
 * 
 * Credentials needed (from GitHub Secrets):
 * - MASTO_INSTANCE (e.g., mastodon.social)
 * - MASTO_TOKEN (access token with write:statuses permission)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Get credentials from environment
const credentials = {
  instance: process.env.MASTO_INSTANCE,
  token: process.env.MASTO_TOKEN,
};

// Validate credentials
if (!credentials.instance || !credentials.token) {
  console.error('❌ Missing Mastodon credentials:');
  if (!credentials.instance) console.error('  - MASTO_INSTANCE');
  if (!credentials.token) console.error('  - MASTO_TOKEN');
  process.exit(1);
}

// Normalize instance (remove https:// if present)
let instance = credentials.instance;
if (instance.startsWith('https://')) {
  instance = instance.replace('https://', '');
}
if (instance.startsWith('http://')) {
  instance = instance.replace('http://', '');
}

/**
 * Mastodon API Client
 */
class MastodonClient {
  constructor(instance, token) {
    this.instance = instance;
    this.token = token;
  }

  /**
   * Make HTTPS request to Mastodon API
   */
  makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.instance,
        path: path,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'User-Agent': '3mpwrApp-Automation/1.0',
        },
      };

      let body = '';
      if (data) {
        body = JSON.stringify(data);
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
   * Post a status to Mastodon
   */
  async postStatus(text, options = {}) {
    const payload = {
      status: text,
      visibility: options.visibility || 'public',
      language: options.language || 'en',
    };

    if (options.mediaIds && options.mediaIds.length > 0) {
      payload.media_ids = options.mediaIds;
    }

    try {
      const response = await this.makeRequest('POST', '/api/v1/statuses', payload);

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Status posted successfully! ID: ${response.data.id}`);
        return {
          success: true,
          statusId: response.data.id,
          url: response.data.url,
          createdAt: response.data.created_at,
        };
      } else {
        console.error(`❌ Failed to post status. Status: ${response.status}`);
        console.error(`Response:`, JSON.stringify(response.data, null, 2));
        return {
          success: false,
          status: response.status,
          error: response.data,
        };
      }
    } catch (error) {
      console.error(`❌ Error posting status:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify token is valid
   */
  async verifyToken() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/accounts/verify_credentials');

      if (response.status === 200) {
        console.log(`✅ Token verified! Account: @${response.data.username}`);
        return {
          valid: true,
          username: response.data.username,
          displayName: response.data.display_name,
          url: response.data.url,
        };
      } else {
        console.error(`❌ Token verification failed. Status: ${response.status}`);
        return {
          valid: false,
          status: response.status,
          error: response.data,
        };
      }
    } catch (error) {
      console.error(`❌ Error verifying token:`, error.message);
      return {
        valid: false,
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
    
    // Extract first news item
    const lines = content.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for markdown links
      if (line.includes('[') && line.includes('](')) {
        const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          const title = match[1];
          const url = match[2];
          
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
 * Generate app feature promotion status
 */
function generateAppPromotionStatus() {
  const promotions = [
    "🚀 3mpwr App Features: Access 50+ free tools to expand your presence and reach more people globally! 🌍 #CommunityEmpowerment #FreeTools",
    "✨ 3mpwr App: Empower your community with our suite of free resources. Explore today! 💪 #DigitalTools #Community",
    "🎯 3mpwr App: Your gateway to free tools for community growth. Simple. Powerful. Free. Start now! 🔥 #Empowerment",
    "🌟 3mpwr App: Combining free tools with accessibility features to empower every community member. 💚 #A11y #Accessibility",
    "📱 3mpwr App: From content curation to community engagement - all free, all accessible. Learn more! 🎓 #OpenSource",
  ];

  return promotions[Math.floor(Math.random() * promotions.length)];
}

/**
 * Main posting logic
 */
async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Mastodon Daily Posting                ║');
  console.log('║  Curation & App Promotion              ║');
  console.log('╚════════════════════════════════════════╝\n');

  const client = new MastodonClient(credentials.instance, credentials.token);

  const results = {
    instance: credentials.instance,
    tokenVerified: false,
    curationPost: null,
    promotionPost: null,
    timestamp: new Date().toISOString(),
  };

  // Step 1: Verify credentials
  console.log('🔐 Step 1: Verifying Mastodon credentials...\n');
  
  const verification = await client.verifyToken();
  if (!verification.valid) {
    console.error('❌ Token verification failed!');
    console.error('   Make sure MASTO_TOKEN in GitHub Secrets is valid');
    process.exit(1);
  }
  
  results.tokenVerified = true;
  console.log(`   Account URL: ${verification.url}\n`);

  // Step 2: Post curation content
  console.log('📰 Step 2: Posting daily curation news...\n');
  
  const curationHeadline = getLatestCurationHeadline();
  if (curationHeadline) {
    console.log(`📝 Posting: "${curationHeadline.title}"`);
    results.curationPost = await client.postStatus(curationHeadline.text);
    console.log();
  } else {
    console.log('⚠️  Skipping curation post - no content found\n');
  }

  // Step 3: Post app promotion
  console.log('🎯 Step 3: Posting app feature promotion...\n');
  
  const promotionText = generateAppPromotionStatus();
  console.log(`📝 Posting promotion...`);
  results.promotionPost = await client.postStatus(promotionText);
  console.log();

  // Step 4: Summary
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

  console.log('\n✨ Daily Mastodon posting complete!\n');

  // Save results for debugging
  const resultsFile = path.join(__dirname, '..', 'public', 'mastodon-posting-results.json');
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
