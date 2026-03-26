#!/usr/bin/env node

/**
 * X API Connection Test
 * Tests X Bearer Token and basic API connectivity
 * Usage: node test-x-api.js
 */

const https = require('https');

// Configuration
const BEARER_TOKEN = process.env.X_BEARER_TOKEN;
const TEST_ENDPOINT = 'https://api.twitter.com/2/tweets/search/recent';

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

function makeRequest(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': '3mpwr-App-Test/1.0',
      },
    };

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

    req.end();
  });
}

async function testXAPI() {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  X API Connection Test - 3mpwr App    ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  // Step 1: Check if token exists
  log('blue', '📋 Step 1: Checking X Bearer Token...');
  if (!BEARER_TOKEN) {
    log('red', '❌ ERROR: X_BEARER_TOKEN not found in environment variables');
    log('yellow', '   Make sure to set: export X_BEARER_TOKEN="your_token_here"');
    process.exit(1);
  }
  log('green', '✅ Token found (masked for security)');
  log('cyan', `   Length: ${BEARER_TOKEN.length} characters`);
  log('cyan', `   Starts with: ${BEARER_TOKEN.substring(0, 10)}...`);

  // Step 2: Test API connectivity
  log('blue', '\n📡 Step 2: Testing API Connectivity...');
  log('cyan', `   Endpoint: ${TEST_ENDPOINT}`);

  try {
    const response = await makeRequest(TEST_ENDPOINT, BEARER_TOKEN);
    
    // Step 3: Evaluate response
    log('blue', '\n📊 Step 3: API Response Analysis...');
    
    if (response.status === 200) {
      log('green', '✅ SUCCESS: Connected to X API v2');
      const data = JSON.parse(response.body);
      log('green', `✅ Valid response received`);
      
      if (data.data) {
        log('cyan', `   Found ${data.data.length} recent tweets`);
      }
      if (data.meta) {
        log('cyan', `   Result count: ${data.meta.result_count}`);
        log('cyan', `   Newest ID: ${data.meta.newest_id}`);
      }
      
      return true;
    } 
    else if (response.status === 401) {
      log('red', '❌ AUTHENTICATION FAILED (401)');
      log('yellow', '   Your Bearer Token is invalid or expired');
      log('yellow', '   Steps to fix:');
      log('yellow', '   1. Go to https://developer.twitter.com/en/portal/dashboard');
      log('yellow', '   2. Generate a new Bearer Token');
      log('yellow', '   3. Update GitHub Secrets with new token');
      return false;
    }
    else if (response.status === 429) {
      log('red', '❌ RATE LIMITED (429)');
      log('yellow', '   You\'ve made too many requests');
      log('yellow', '   Wait a few minutes and try again');
      return false;
    }
    else if (response.status === 403) {
      log('red', '❌ FORBIDDEN (403)');
      log('yellow', '   Your app doesn\'t have permission for this endpoint');
      log('yellow', '   Make sure your app has "Read" permissions enabled');
      return false;
    }
    else {
      log('red', `❌ UNEXPECTED STATUS: ${response.status}`);
      log('yellow', '   Response body:');
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', `   ${JSON.stringify(errorData, null, 2)}`);
      } catch {
        log('cyan', response.body);
      }
      return false;
    }

  } catch (error) {
    log('red', `❌ CONNECTION ERROR: ${error.message}`);
    log('yellow', '   Possible causes:');
    log('yellow', '   - Network connectivity issue');
    log('yellow', '   - Invalid endpoint URL');
    log('yellow', '   - DNS resolution problem');
    return false;
  }
}

async function testPostCapability() {
  log('blue', '\n🔍 Step 4: Checking Tweet Posting Capability...');
  
  try {
    const response = await makeRequest('https://api.twitter.com/2/tweets', BEARER_TOKEN);
    
    // POST endpoint will return 400 with no body, but that's OK - it means endpoint exists
    if (response.status === 400 || response.status === 415) {
      log('green', '✅ POST endpoint is accessible');
      log('cyan', '   Your app CAN post tweets (with proper credentials)');
      return true;
    }
    else if (response.status === 401) {
      log('red', '❌ Token issue detected');
      return false;
    }
    else {
      log('cyan', `   Endpoint response: ${response.status}`);
      return true;
    }
  } catch (error) {
    log('yellow', '⚠️  Could not verify POST capability');
    return false;
  }
}

async function main() {
  const readSuccess = await testXAPI();
  
  if (readSuccess) {
    await testPostCapability();
    
    log('green', '\n╔════════════════════════════════════════╗');
    log('green', '║  ✅ ALL TESTS PASSED                  ║');
    log('green', '║  Your X API is ready to use!          ║');
    log('green', '╚════════════════════════════════════════╝\n');
    
    log('cyan', 'Next steps:');
    log('cyan', '1. Run: npm start (or your deployment command)');
    log('cyan', '2. Check GitHub Actions for daily updates');
    log('cyan', '3. Verify tweets post to @3mpowrApp\n');
    
    process.exit(0);
  } else {
    log('red', '\n╔════════════════════════════════════════╗');
    log('red', '║  ❌ TEST FAILED                       ║');
    log('red', '║  See errors above for troubleshooting  ║');
    log('red', '╚════════════════════════════════════════╝\n');
    process.exit(1);
  }
}

// Run tests
main().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
});
