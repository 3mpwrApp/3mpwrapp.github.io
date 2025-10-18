#!/usr/bin/env node

/**
 * X API v2 OAuth 2.0 User Context Test
 * Uses Client ID & Secret for proper User Context access
 * This is the recommended approach for Native Apps
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

function maskCredential(value) {
  if (!value) return 'MISSING';
  if (value.length < 10) return value;
  return value.substring(0, 4) + '...' + value.substring(value.length - 4);
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

async function testWithBearerToken(bearerToken) {
  log('blue', '\n🔐 Testing X API v2 with Bearer Token');
  log('cyan', `   Token: ${maskCredential(bearerToken)}\n`);

  const testTweet = `🧪 Test from 3mpwr App - ${new Date().toLocaleTimeString()} #DisabilityRights`;
  
  log('cyan', `   Tweet: "${testTweet}"`);
  log('cyan', `   Length: ${testTweet.length}/280\n`);

  log('yellow', '   Sending POST to /2/tweets...');

  try {
    const response = await makeRequest(
      'POST',
      'https://api.twitter.com/2/tweets',
      {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        'User-Agent': '3mpwr-Test/1.0',
      },
      { text: testTweet }
    );

    log('yellow', `   Response: ${response.status}\n`);

    if (response.status === 201) {
      try {
        const data = JSON.parse(response.body);
        log('green', `✅ SUCCESS: Tweet Posted!`);
        log('cyan', `   Tweet ID: ${data.data.id}`);
        return { success: true, tweetId: data.data.id };
      } catch (e) {
        log('green', `✅ SUCCESS: Tweet Posted (201)`);
        return { success: true };
      }
    } else if (response.status === 403) {
      log('red', `❌ 403 Forbidden - Application-Only Detected`);
      try {
        const errorData = JSON.parse(response.body);
        if (errorData.detail) {
          log('yellow', `   ${errorData.detail}`);
        }
      } catch {}
      log('yellow', '   → Bearer Token is Application-Only, not User Context');
      return { success: false, error: '403 - Bearer is Application-Only' };
    } else if (response.status === 401) {
      log('red', `❌ 401 Unauthorized`);
      return { success: false, error: '401 - Invalid token' };
    } else {
      log('red', `❌ Error ${response.status}`);
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', JSON.stringify(errorData, null, 2).substring(0, 150));
      } catch {
        log('cyan', response.body.substring(0, 150));
      }
      return { success: false, error: `${response.status}` };
    }
  } catch (error) {
    log('red', `❌ Connection error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  X API v2 Bearer Token Analysis       ║');
  log('cyan', '║  Check if User Context is Enabled     ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('yellow', '⚠️  ANALYSIS MODE');
  log('yellow', '   - Tests if Bearer Token supports posting');
  log('yellow', '   - Checks User Context vs Application-Only\n');

  log('blue', '📋 Enter Your X Bearer Token\n');

  const bearerToken = await prompt('Bearer Token (from X Developer Portal): ');

  if (!bearerToken) {
    log('red', '\n❌ No token provided\n');
    process.exit(1);
  }

  log('blue', '\n📡 Testing Bearer Token...');

  const result = await testWithBearerToken(bearerToken.trim());

  log('blue', '\n📊 Analysis Results:\n');

  if (result.success) {
    log('green', '╔════════════════════════════════════════╗');
    log('green', '║   ✅ BEARER TOKEN WORKS FOR POSTING!  ║');
    log('green', '║   It has User Context permissions     ║');
    log('green', '╚════════════════════════════════════════╝\n');

    log('cyan', 'This means:');
    log('cyan', '✓ Bearer Token can post tweets');
    log('cyan', '✓ No need for OAuth 1.0a');
    log('cyan', '✓ Application is ready for automation\n');

  } else if (result.error.includes('Application-Only')) {
    log('red', '╔════════════════════════════════════════╗');
    log('red', '║   ❌ BEARER IS APPLICATION-ONLY       ║');
    log('red', '║   Needs User Context for posting      ║');
    log('red', '╚════════════════════════════════════════╝\n');

    log('yellow', 'This is the issue:');
    log('yellow', '✗ Bearer Token is read-only (Application-Only)');
    log('yellow', '✗ Cannot post tweets');
    log('yellow', '✗ Need to enable User Context\n');

    log('cyan', 'Solutions:');
    log('cyan', '1. In X Developer Portal → 3mpwr App → Settings');
    log('cyan', '2. Look for "OAuth 2.0 Authorization Code with PKCE"');
    log('cyan', '3. Enable it');
    log('cyan', '4. Generate a NEW Bearer Token (should have User Context)');
    log('cyan', '5. Update GitHub Secret X_BEARER_TOKEN');
    log('cyan', '6. Test again\n');

  } else {
    log('red', '╔════════════════════════════════════════╗');
    log('red', '║   ⚠️  OTHER ERROR                     ║');
    log(`║   ${result.error.substring(0, 33).padEnd(33)} ║`);
    log('red', '╚════════════════════════════════════════╝\n');

    log('yellow', 'Troubleshooting:');
    log('yellow', '1. Verify Bearer Token is correct (copy from X Portal)');
    log('yellow', '2. Check for extra spaces before/after');
    log('yellow', '3. Try regenerating the token\n');
  }
}

main().catch(error => {
  log('red', `\n❌ Fatal error: ${error.message}\n`);
  process.exit(1);
});
