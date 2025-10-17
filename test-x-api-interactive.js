#!/usr/bin/env node

/**
 * X API Connection Test - Interactive Version
 * Tests X Bearer Token and basic API connectivity
 * Usage: node test-x-api-interactive.js
 */

const https = require('https');
const readline = require('readline');

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

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
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

async function testXAPI(token) {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  X API Connection Test - 3mpwr App    ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  // Step 1: Validate token format
  log('blue', '📋 Step 1: Validating Bearer Token...');
  
  if (!token || token.trim().length === 0) {
    log('red', '❌ ERROR: No token provided');
    return false;
  }

  if (token.length < 50) {
    log('red', '❌ ERROR: Token seems too short (should be 100+ characters)');
    log('yellow', `   You provided: ${token.length} characters`);
    return false;
  }

  log('green', '✅ Token format looks valid');
  log('cyan', `   Length: ${token.length} characters`);
  log('cyan', `   Starts with: ${token.substring(0, 15)}...`);

  // Step 2: Test API connectivity
  log('blue', '\n📡 Step 2: Testing API Connectivity...');
  const endpoint = 'https://api.twitter.com/2/tweets/search/recent?query=from:3mpowrApp&max_results=10';
  log('cyan', `   Endpoint: X API v2 (search recent tweets)`);

  try {
    const response = await makeRequest(endpoint, token);
    
    // Step 3: Evaluate response
    log('blue', '\n📊 Step 3: API Response Analysis...');
    
    if (response.status === 200) {
      log('green', '✅ SUCCESS: Connected to X API v2');
      
      try {
        const data = JSON.parse(response.body);
        log('green', `✅ Valid JSON response received`);
        
        if (data.data) {
          log('cyan', `   Found ${data.data.length} tweets`);
          if (data.data.length > 0) {
            log('cyan', `   Most recent: ${data.data[0].text.substring(0, 50)}...`);
          }
        }
        if (data.meta) {
          log('cyan', `   Result count: ${data.meta.result_count}`);
          if (data.meta.newest_id) {
            log('cyan', `   Newest tweet ID: ${data.meta.newest_id}`);
          }
        }
      } catch (parseError) {
        log('yellow', '⚠️  Got 200 response but could not parse JSON');
        log('cyan', response.body.substring(0, 100));
      }
      
      return true;
    } 
    else if (response.status === 401) {
      log('red', '❌ AUTHENTICATION FAILED (401)');
      log('yellow', '   Your Bearer Token is invalid or expired');
      log('yellow', '\n   Steps to fix:');
      log('yellow', '   1. Go to: https://developer.twitter.com/en/portal/dashboard');
      log('yellow', '   2. Find your project and app');
      log('yellow', '   3. Go to "Keys and tokens" tab');
      log('yellow', '   4. Generate a new Bearer Token');
      log('yellow', '   5. Update GitHub Secrets with: X_BEARER_TOKEN');
      
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', `\n   API Error: ${errorData.title}`);
        log('cyan', `   ${errorData.detail}`);
      } catch {}
      
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
      log('yellow', '   \n   In your app settings on developer.twitter.com:');
      log('yellow', '   1. Go to "App permissions"');
      log('yellow', '   2. Make sure "Read and write" is enabled');
      log('yellow', '   3. Save and regenerate tokens');
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
    log('yellow', '   - Invalid endpoint URL');
    log('yellow', '   - DNS resolution problem');
    log('yellow', '\n   Try again or check your internet connection');
    return false;
  }
}

async function main() {
  log('yellow', '\n🔐 X Bearer Token Test\n');
  
  const token = await prompt('Paste your X Bearer Token (or press Enter to skip): ');
  
  if (!token || token.trim().length === 0) {
    log('yellow', '\nTest skipped. You can run this anytime with your token.\n');
    process.exit(0);
  }

  const success = await testXAPI(token.trim());
  
  if (success) {
    log('green', '\n╔════════════════════════════════════════╗');
    log('green', '║  ✅ ALL TESTS PASSED                  ║');
    log('green', '║  Your X API is ready to use!          ║');
    log('green', '╚════════════════════════════════════════╝\n');
    
    log('cyan', 'Next steps:');
    log('cyan', '1. Your token is already in GitHub Secrets');
    log('cyan', '2. Push this test file to repository');
    log('cyan', '3. GitHub Actions will use your token to post daily');
    log('cyan', '4. Check @3mpowrApp for your first automated post\n');
    
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
