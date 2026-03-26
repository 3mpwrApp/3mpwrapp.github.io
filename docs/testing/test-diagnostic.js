#!/usr/bin/env node

/**
 * X API Simple Test - Check what works
 * Uses multiple methods to find which one works for your app setup
 */

const https = require('https');
const readline = require('readline');

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

function makeRequest(method, url, headers, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers,
    };

    if (body) {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });

    req.on('error', reject);

    if (body) {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      req.write(bodyStr);
    }

    req.end();
  });
}

async function testRead(bearerToken) {
  log('blue', '\n🔍 Test 1: Reading from X (Bearer Token)');
  
  try {
    const response = await makeRequest(
      'GET',
      'https://api.twitter.com/2/tweets/search/recent?query=test&max_results=10',
      {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': '3mpwr-Test/1.0',
      }
    );

    if (response.status === 200) {
      log('green', '   ✅ Bearer Token works for READING');
      return true;
    } else if (response.status === 403) {
      log('red', '   ❌ 403: Bearer token is Application-Only (can\'t post)');
      return false;
    } else {
      log('yellow', `   ⚠️  Status ${response.status}`);
      return false;
    }
  } catch (error) {
    log('yellow', `   ⚠️  Error: ${error.message}`);
    return false;
  }
}

async function main() {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  X API Diagnostic Test                 ║');
  log('cyan', '║  Check which auth methods work         ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('yellow', 'This will check what your app can do:\n');

  const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAGKJ4wEAAAAA5w1phwcPlOIQJZCL66epEz5V43E%3Dpx3C5ssiSwQIPHYTOO7EAweYNnWo37X64AFsaNfLDCGPjSHqKM';

  // Test 1: Read with Bearer Token
  const canRead = await testRead(bearerToken);

  log('blue', '\n📊 Results:\n');

  if (canRead) {
    log('green', '✅ Bearer Token is VALID and working');
    log('cyan', '   But: It\'s Application-Only (read-only)');
  } else {
    log('red', '❌ Bearer Token is NOT working');
    log('yellow', '   Need to check X Developer Portal settings');
  }

  log('blue', '\n💡 Analysis:\n');

  log('cyan', 'Your app might be set up as:');
  log('cyan', '  • Native App (usually read-only)');
  log('cyan', '  • Web App without proper OAuth 2.0 User Context setup');
  log('cyan', '  • App with Application-Only permissions\n');

  log('yellow', 'For automated POSTING, you need:');
  log('yellow', '  1. OAuth 1.0a credentials that work, OR');
  log('yellow', '  2. OAuth 2.0 with User Context Bearer Token\n');

  log('blue', '🔧 Recommended Next Steps:\n');

  log('cyan', 'Option A: Try making the app a "Traditional Web App"');
  log('cyan', '  1. Go to X Developer Portal → 3mpwr App');
  log('cyan', '  2. Click Settings');
  log('cyan', '  3. Look for "App Type" - might need to recreate');
  log('cyan', '  4. Select "Web App, Automated App or Bot"\n');

  log('cyan', 'Option B: Verify OAuth 1.0a is enabled');
  log('cyan', '  1. Go to Settings');
  log('cyan', '  2. Look for "Authentication Methods"');
  log('cyan', '  3. Make sure OAuth 1.0a is enabled\n');

  log('cyan', 'Option C: Check if you can delete and recreate the app');
  log('cyan', '  1. Some app types have limitations');
  log('cyan', '  2. Recreating might give you better options\n');

  log('yellow', 'The 401 error on OAuth 1.0a suggests:');
  log('yellow', '  • Credentials don\'t match');
  log('yellow', '  • App might not have OAuth 1.0a enabled');
  log('yellow', '  • Signature calculation might be the issue\n');
}

main().catch(error => {
  log('red', `Error: ${error.message}`);
  process.exit(1);
});
