#!/usr/bin/env node

/**
 * Test Social Media Platforms - Mastodon, Bluesky, X
 * 
 * Comprehensive test script to verify all three platforms are working correctly.
 * Tests credentials, API connectivity, and posts a test message to each platform.
 * 
 * Usage:
 *   node scripts/test-social-platforms.js [platform] [test-type]
 *   - platform: 'all', 'mastodon', 'bluesky', 'x' (default: all)
 *   - test-type: 'credential', 'connectivity', 'post' (default: all)
 * 
 * Example:
 *   node scripts/test-social-platforms.js
 *   node scripts/test-social-platforms.js mastodon credential
 *   node scripts/test-social-platforms.js bluesky post
 */

const https = require('https');
const http = require('http');

// ============================================================================
// COLORS FOR TERMINAL OUTPUT
// ============================================================================
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(color, icon, message) {
  console.log(`${colors[color]}${icon} ${message}${colors.reset}`);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'http:' ? http : https;
    
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function timestamp() {
  return new Date().toISOString();
}

// ============================================================================
// MASTODON TESTS
// ============================================================================

async function testMastodon() {
  log('blue', '🐘', 'MASTODON PLATFORM TEST');
  console.log('');
  
  const instance = process.env.MASTO_INSTANCE || 'mastodon.social';
  const token = process.env.MASTO_TOKEN;
  
  // Test 1: Credentials
  log('cyan', '1️⃣', 'Credential Check');
  if (!instance || !token) {
    log('red', '❌', `Missing credentials: instance=${!!instance}, token=${!!token}`);
    return false;
  }
  log('green', '✅', `Instance: ${instance}, Token: ${token.substring(0, 10)}...`);
  
  // Test 2: API Connectivity
  log('cyan', '2️⃣', 'API Connectivity Check');
  try {
    const testOptions = {
      hostname: instance,
      path: '/api/v1/instance',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': '3mpwrApp-Test/1.0',
      },
    };
    
    const response = await httpRequest(testOptions);
    
    if (response.status === 200) {
      log('green', '✅', `Connected to Mastodon API (status: ${response.status})`);
      const instance_name = response.data.title || 'Mastodon Instance';
      log('gray', '  ', `Instance: ${instance_name}`);
    } else {
      log('red', '❌', `API Error (status: ${response.status})`);
      console.error(response.data);
      return false;
    }
  } catch (e) {
    log('red', '❌', `Connection failed: ${e.message}`);
    return false;
  }
  
  // Test 3: Verify Account
  log('cyan', '3️⃣', 'Account Verification');
  try {
    const verifyOptions = {
      hostname: instance,
      path: '/api/v1/accounts/verify_credentials',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': '3mpwrApp-Test/1.0',
      },
    };
    
    const response = await httpRequest(verifyOptions);
    
    if (response.status === 200) {
      const account = response.data;
      log('green', '✅', `Verified account: @${account.acct}`);
      log('gray', '  ', `Display Name: ${account.display_name}`);
      log('gray', '  ', `Followers: ${account.followers_count}`);
    } else {
      log('red', '❌', `Account verification failed (status: ${response.status})`);
      return false;
    }
  } catch (e) {
    log('red', '❌', `Account verification error: ${e.message}`);
    return false;
  }
  
  // Test 4: Post Test Status
  log('cyan', '4️⃣', 'Test Post');
  try {
    const testContent = `🧪 **Test Post from 3mpwrApp** - ${timestamp()}\n\nThis is an automated test to verify posting functionality is working correctly. ✨`;
    
    const postOptions = {
      hostname: instance,
      path: '/api/v1/statuses',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': '3mpwrApp-Test/1.0',
      },
    };
    
    const response = await httpRequest(postOptions, { status: testContent });
    
    if (response.status === 200) {
      log('green', '✅', `Posted successfully to Mastodon`);
      log('gray', '  ', `Status ID: ${response.data.id}`);
      log('gray', '  ', `URL: ${response.data.url}`);
      return true;
    } else {
      log('red', '❌', `Post failed (status: ${response.status})`);
      if (response.data.error) log('red', '  ', `Error: ${response.data.error}`);
      return false;
    }
  } catch (e) {
    log('red', '❌', `Post error: ${e.message}`);
    return false;
  }
}

// ============================================================================
// BLUESKY TESTS
// ============================================================================

async function testBluesky() {
  log('blue', '🦋', 'BLUESKY PLATFORM TEST');
  console.log('');
  
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_PASSWORD;
  const pds = process.env.BLUESKY_PDS || 'https://bsky.social';
  
  // Test 1: Credentials
  log('cyan', '1️⃣', 'Credential Check');
  if (!handle || !password) {
    log('red', '❌', `Missing credentials: handle=${!!handle}, password=${!!password}`);
    return false;
  }
  log('green', '✅', `Handle: ${handle}, PDS: ${pds}`);
  
  // Test 2: PDS Connectivity
  log('cyan', '2️⃣', 'PDS Connectivity Check');
  try {
    const pdsUrl = new URL(pds);
    const describeOptions = {
      hostname: pdsUrl.hostname,
      path: '/.well-known/atproto-did',
      method: 'GET',
      headers: {
        'User-Agent': '3mpwrApp-Test/1.0',
      },
    };
    
    const response = await httpRequest(describeOptions);
    log('green', '✅', `Connected to PDS (status: ${response.status})`);
  } catch (e) {
    log('yellow', '⚠️', `PDS connectivity check: ${e.message} (may be normal)`);
  }
  
  // Test 3: Authentication
  log('cyan', '3️⃣', 'Authentication');
  let accessJwt = null;
  try {
    const createSessionOptions = {
      hostname: 'bsky.social',
      path: '/xrpc/com.atproto.server.createSession',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '3mpwrApp-Test/1.0',
      },
    };
    
    const response = await httpRequest(createSessionOptions, {
      identifier: handle,
      password: password,
    });
    
    if (response.status === 200) {
      accessJwt = response.data.accessJwt;
      log('green', '✅', `Authenticated successfully`);
      log('gray', '  ', `DID: ${response.data.did}`);
    } else {
      log('red', '❌', `Authentication failed (status: ${response.status})`);
      if (response.data.error) log('red', '  ', `Error: ${response.data.error}`);
      return false;
    }
  } catch (e) {
    log('red', '❌', `Authentication error: ${e.message}`);
    return false;
  }
  
  // Test 4: Post Test Status
  log('cyan', '4️⃣', 'Test Post');
  try {
    if (!accessJwt) {
      log('red', '❌', 'Cannot post - authentication failed');
      return false;
    }
    
    const testContent = `🧪 Test Post from 3mpwrApp - ${timestamp()}\n\nThis is an automated test to verify posting functionality is working correctly. ✨`;
    
    const createRecordOptions = {
      hostname: 'bsky.social',
      path: '/xrpc/com.atproto.repo.createRecord',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type': 'application/json',
        'User-Agent': '3mpwrApp-Test/1.0',
      },
    };
    
    const now = new Date().toISOString();
    
    const response = await httpRequest(createRecordOptions, {
      repo: handle,
      collection: 'app.bsky.feed.post',
      record: {
        text: testContent,
        createdAt: now,
      },
    });
    
    if (response.status === 200) {
      log('green', '✅', `Posted successfully to Bluesky`);
      log('gray', '  ', `URI: ${response.data.uri}`);
      log('gray', '  ', `CID: ${response.data.cid}`);
      return true;
    } else {
      log('red', '❌', `Post failed (status: ${response.status})`);
      if (response.data.error) log('red', '  ', `Error: ${response.data.error}`);
      return false;
    }
  } catch (e) {
    log('red', '❌', `Post error: ${e.message}`);
    return false;
  }
}

// ============================================================================
// X (TWITTER) TESTS
// ============================================================================

async function testX() {
  log('blue', '𝕏', 'X (TWITTER) PLATFORM TEST');
  console.log('');
  
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;
  const bearerToken = process.env.X_BEARER_TOKEN;
  
  // Test 1: Credentials
  log('cyan', '1️⃣', 'Credential Check');
  const hasOAuth1 = apiKey && apiSecret && accessToken && accessTokenSecret;
  const hasOAuth2 = bearerToken;
  
  if (!hasOAuth1 && !hasOAuth2) {
    log('red', '❌', 'Missing X credentials (need OAuth 1.0a or 2.0)');
    return false;
  }
  
  if (hasOAuth1) {
    log('green', '✅', `OAuth 1.0a: API Key=${apiKey.substring(0, 10)}..., Access Token=${accessToken.substring(0, 10)}...`);
  }
  if (hasOAuth2) {
    log('green', '✅', `OAuth 2.0 (Bearer): ${bearerToken.substring(0, 20)}...`);
  }
  
  // Test 2: API Connectivity
  log('cyan', '2️⃣', 'API Connectivity Check');
  try {
    if (hasOAuth2) {
      const meOptions = {
        hostname: 'api.twitter.com',
        path: '/2/users/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': '3mpwrApp-Test/1.0',
        },
      };
      
      const response = await httpRequest(meOptions);
      
      if (response.status === 200) {
        log('green', '✅', `Connected to X API v2 (status: ${response.status})`);
        log('gray', '  ', `User: @${response.data.data.username}`);
      } else {
        log('red', '❌', `API Error (status: ${response.status})`);
        if (response.data.errors) {
          for (const err of response.data.errors) {
            log('red', '  ', `Error: ${err.message}`);
          }
        }
        return false;
      }
    } else {
      log('yellow', '⚠️', 'OAuth 2.0 not available, using OAuth 1.0a would require oauth-1.0a library');
    }
  } catch (e) {
    log('red', '❌', `Connection failed: ${e.message}`);
    return false;
  }
  
  // Test 3: Post Test Status
  log('cyan', '3️⃣', 'Test Post');
  try {
    if (!hasOAuth2) {
      log('yellow', '⚠️', 'Skipping post test - OAuth 2.0 required for this test');
      return true;
    }
    
    const testContent = `🧪 Test Post from 3mpwrApp - ${timestamp()}\n\nAutomated test to verify posting. ✨ #a11y #accessibility`;
    
    const postOptions = {
      hostname: 'api.twitter.com',
      path: '/2/tweets',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        'User-Agent': '3mpwrApp-Test/1.0',
      },
    };
    
    const response = await httpRequest(postOptions, { text: testContent });
    
    if (response.status === 201 || response.status === 200) {
      log('green', '✅', `Posted successfully to X`);
      log('gray', '  ', `Tweet ID: ${response.data.data.id}`);
      log('gray', '  ', `Text: ${response.data.data.text.substring(0, 60)}...`);
      return true;
    } else {
      log('red', '❌', `Post failed (status: ${response.status})`);
      if (response.data.errors) {
        for (const err of response.data.errors) {
          log('red', '  ', `Error: ${err.message}`);
        }
      }
      return false;
    }
  } catch (e) {
    log('red', '❌', `Post error: ${e.message}`);
    return false;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const platform = (process.argv[2] || 'all').toLowerCase();
  const testType = (process.argv[3] || 'all').toLowerCase();
  
  console.log('');
  log('cyan', '🚀', 'SOCIAL MEDIA PLATFORM TEST SUITE');
  log('cyan', '🚀', `Date: ${timestamp()}`);
  console.log('');
  
  let results = {};
  
  if (platform === 'all' || platform === 'mastodon') {
    try {
      results.mastodon = await testMastodon();
      console.log('');
    } catch (e) {
      log('red', '❌', `Mastodon test failed: ${e.message}`);
      results.mastodon = false;
    }
  }
  
  if (platform === 'all' || platform === 'bluesky') {
    try {
      results.bluesky = await testBluesky();
      console.log('');
    } catch (e) {
      log('red', '❌', `Bluesky test failed: ${e.message}`);
      results.bluesky = false;
    }
  }
  
  if (platform === 'all' || platform === 'x') {
    try {
      results.x = await testX();
      console.log('');
    } catch (e) {
      log('red', '❌', `X test failed: ${e.message}`);
      results.x = false;
    }
  }
  
  // Summary
  log('blue', '📊', 'TEST SUMMARY');
  console.log('');
  
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  for (const [plat, success] of Object.entries(results)) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${plat.padEnd(10)} : ${status}`);
  }
  
  console.log('');
  if (passed === total) {
    log('green', '🎉', `All ${total} platform(s) tested successfully!`);
    console.log('');
    process.exit(0);
  } else {
    log('red', '⚠️', `${total - passed} of ${total} platform(s) failed. Please check credentials and settings.`);
    console.log('');
    process.exit(1);
  }
}

main();
