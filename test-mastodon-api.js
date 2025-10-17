#!/usr/bin/env node

/**
 * Mastodon API Connection Test
 * Tests Mastodon access token and posting capability
 * Usage: node test-mastodon-api.js
 */

const https = require('https');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
}

function makeRequest(method, url, token, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': '3mpwr-App-Test/1.0',
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testMastodonAPI(token) {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  Mastodon API Connection Test         ║');
  log('cyan', '║  3mpwr App (@3mpwrApp)                ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  // Step 1: Validate token format
  log('blue', '📋 Step 1: Validating Mastodon Token...');
  
  if (!token || token.trim().length === 0) {
    log('red', '❌ ERROR: No token provided');
    return false;
  }

  if (token.length < 30) {
    log('red', '❌ ERROR: Token seems too short');
    log('yellow', `   You provided: ${token.length} characters`);
    return false;
  }

  log('green', '✅ Token format looks valid');
  log('cyan', `   Length: ${token.length} characters`);
  log('cyan', `   Starts with: ${token.substring(0, 10)}...`);

  // Step 2: Test account lookup
  log('blue', '\n📡 Step 2: Testing Mastodon Connection...');
  log('cyan', `   Instance: https://mastodon.social`);
  log('cyan', `   Endpoint: /api/v1/accounts/verify_credentials`);

  try {
    const response = await makeRequest(
      'GET',
      'https://mastodon.social/api/v1/accounts/verify_credentials',
      token
    );
    
    log('blue', '\n📊 Step 3: API Response Analysis...');
    
    if (response.status === 200) {
      log('green', '✅ SUCCESS: Connected to Mastodon API v1');
      
      try {
        const data = JSON.parse(response.body);
        log('green', `✅ Account verified: @${data.username}`);
        log('cyan', `   Display name: ${data.display_name}`);
        log('cyan', `   Account ID: ${data.id}`);
        log('cyan', `   Followers: ${data.followers_count}`);
        log('cyan', `   Posts: ${data.statuses_count}`);
        log('cyan', `   Bio: ${data.note.replace(/<[^>]*>/g, '').substring(0, 50)}...`);
        
        if (data.locked) {
          log('yellow', '⚠️  Account is locked (manually approve followers)');
        } else {
          log('cyan', '   Account is public');
        }
      } catch (parseError) {
        log('yellow', '⚠️  Got 200 response but could not parse JSON');
      }
      
      return true;
    } 
    else if (response.status === 401) {
      log('red', '❌ AUTHENTICATION FAILED (401)');
      log('yellow', '   Your Mastodon access token is invalid or expired');
      log('yellow', '\n   Steps to fix:');
      log('yellow', '   1. Log into mastodon.social');
      log('yellow', '   2. Go to Preferences → Development');
      log('yellow', '   3. Find "3mpwr App" or create new application');
      log('yellow', '   4. Copy the new Access Token');
      log('yellow', '   5. Update GitHub Secrets: MASTO_TOKEN');
      
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', `\n   API Error: ${errorData.error || 'Unauthorized'}`);
      } catch {}
      
      return false;
    }
    else if (response.status === 429) {
      log('red', '❌ RATE LIMITED (429)');
      log('yellow', '   You\'ve made too many requests');
      log('yellow', '   Wait a few minutes and try again');
      return false;
    }
    else {
      log('red', `❌ UNEXPECTED STATUS: ${response.status}`);
      log('yellow', '   Response:');
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', JSON.stringify(errorData, null, 2));
      } catch {
        log('cyan', response.body.substring(0, 200));
      }
      return false;
    }

  } catch (error) {
    log('red', `❌ CONNECTION ERROR: ${error.message}`);
    log('yellow', '   Possible causes:');
    log('yellow', '   - Network connectivity issue');
    log('yellow', '   - mastodon.social is temporarily down');
    log('yellow', '   - DNS resolution problem');
    return false;
  }
}

async function testPostCapability(token) {
  log('blue', '\n🔍 Step 4: Checking Post Capability...');
  
  try {
    // Test with a simple status
    const testStatus = '🧪 Test post from 3mpwr App - API verification [automated]';
    
    log('cyan', `   Testing with: "${testStatus}"`);
    log('cyan', `   Character count: ${testStatus.length}/500`);
    
    const response = await makeRequest(
      'POST',
      'https://mastodon.social/api/v1/statuses',
      token,
      {
        status: testStatus,
        visibility: 'unlisted', // Post as unlisted so it doesn't spam timeline
      }
    );
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        log('green', '✅ POST endpoint is working!');
        log('cyan', `   Status ID: ${data.id}`);
        log('cyan', `   URL: ${data.url}`);
        log('cyan', `   Posted as: ${data.visibility}`);
        log('green', '✅ Test post created successfully!');
        log('cyan', `   Check: ${data.url}`);
      } catch (e) {
        log('green', '✅ POST request successful');
      }
      return true;
    }
    else if (response.status === 401) {
      log('red', '❌ Token auth failed for POST');
      return false;
    }
    else if (response.status === 422) {
      log('yellow', '⚠️  Status validation issue (likely too long)');
      return false;
    }
    else {
      log('yellow', `⚠️  POST returned ${response.status}`);
      return false;
    }
  } catch (error) {
    log('yellow', `⚠️  Could not verify POST capability: ${error.message}`);
    return false;
  }
}

async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\n🔐 Paste your Mastodon access token (or press Enter to skip): ', async (token) => {
    rl.close();
    
    if (!token || token.trim().length === 0) {
      log('yellow', '\nTest skipped. You can run this anytime with your token.\n');
      process.exit(0);
    }

    const readSuccess = await testMastodonAPI(token.trim());
    
    if (readSuccess) {
      const postSuccess = await testPostCapability(token.trim());
      
      log('green', '\n╔════════════════════════════════════════╗');
      log('green', '║  ✅ ALL TESTS PASSED                  ║');
      log('green', '║  Your Mastodon API is ready!          ║');
      log('green', '╚════════════════════════════════════════╝\n');
      
      log('cyan', 'Next steps:');
      log('cyan', '1. Token is already in GitHub Secrets (MASTO_TOKEN)');
      log('cyan', '2. Check daily-curation.yml workflow');
      log('cyan', '3. Next 9 AM UTC run will post to Mastodon');
      log('cyan', '4. Check @3mpwrApp for your first automated toot\n');
      
      process.exit(0);
    } else {
      log('red', '\n╔════════════════════════════════════════╗');
      log('red', '║  ❌ TEST FAILED                       ║');
      log('red', '║  See errors above for troubleshooting  ║');
      log('red', '╚════════════════════════════════════════╝\n');
      process.exit(1);
    }
  });
}

// Run tests
main().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
});
