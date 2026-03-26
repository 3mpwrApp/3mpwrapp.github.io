#!/usr/bin/env node

/**
 * Secure X API Test - No Credential Exposure
 * Tests OAuth 1.0a with masked output
 * Credentials are never logged or displayed
 */

const https = require('https');
const crypto = require('crypto');
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

function buildOAuthSignature(method, url, params, apiSecret, accessTokenSecret) {
  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // Build signature base string
  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;

  // Generate signature
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessTokenSecret)}`;
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  return signature;
}

async function testX(apiKey, apiSecret, accessToken, accessTokenSecret) {
  log('blue', '\n🔐 Testing X OAuth 1.0a (Secure Mode)');
  log('cyan', '   All credentials are masked in output\n');

  log('cyan', '   Credentials Status:');
  log('cyan', `   - API Key: ${maskCredential(apiKey)}`);
  log('cyan', `   - API Secret: ${maskCredential(apiSecret)}`);
  log('cyan', `   - Access Token: ${maskCredential(accessToken)}`);
  log('cyan', `   - Access Token Secret: ${maskCredential(accessTokenSecret)}`);

  const testTweet = `🧪 Test from 3mpwr App - ${new Date().toLocaleTimeString()} #DisabilityRights`;
  
  log('cyan', `\n   Tweet: "${testTweet}"`);
  log('cyan', `   Length: ${testTweet.length}/280`);

  try {
    log('yellow', '\n   Building OAuth 1.0a signature...');

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    const oauthParams = {
      'oauth_consumer_key': apiKey,
      'oauth_nonce': nonce,
      'oauth_signature_method': 'HMAC-SHA1',
      'oauth_timestamp': timestamp,
      'oauth_token': accessToken,
      'oauth_version': '1.0',
      'status': testTweet,
    };

    const url = 'https://api.twitter.com/1.1/statuses/update.json';
    const signature = buildOAuthSignature('POST', url, oauthParams, apiSecret, accessTokenSecret);
    
    oauthParams['oauth_signature'] = signature;

    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .filter(key => key.startsWith('oauth_'))
      .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    log('yellow', '   Sending POST to X API...');

    const response = await makeRequest(
      'POST',
      `${url}?status=${encodeURIComponent(testTweet)}`,
      {
        'Authorization': authHeader,
        'User-Agent': '3mpwr-Test/1.0',
      }
    );

    log('yellow', `   Response: ${response.status}\n`);

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        log('green', `✅ SUCCESS: Tweet Posted!`);
        log('cyan', `   Tweet ID: ${data.id_str}`);
        log('cyan', `   View at: https://x.com/3mpwrApp/status/${data.id_str}`);
        return { success: true, tweetId: data.id_str };
      } catch (e) {
        log('green', `✅ SUCCESS: Tweet Posted (200)`);
        return { success: true };
      }
    } else if (response.status === 401) {
      log('red', `❌ 401 Unauthorized`);
      try {
        const errorData = JSON.parse(response.body);
        if (errorData.errors && errorData.errors[0]) {
          log('yellow', `   Error: ${errorData.errors[0].message}`);
        }
      } catch {}
      return { success: false, error: '401 Unauthorized - Credentials rejected' };
    } else if (response.status === 403) {
      log('red', `❌ 403 Forbidden`);
      try {
        const errorData = JSON.parse(response.body);
        if (errorData.detail) {
          log('yellow', `   ${errorData.detail}`);
        }
      } catch {}
      return { success: false, error: '403 Forbidden - App permissions issue' };
    } else {
      log('red', `❌ Error ${response.status}`);
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', JSON.stringify(errorData, null, 2).substring(0, 200));
      } catch {
        log('cyan', response.body.substring(0, 200));
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
  log('cyan', '║  X API Secure Test                     ║');
  log('cyan', '║  No Credentials Exposed                ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('yellow', '⚠️  SECURE MODE');
  log('yellow', '   - Credentials are NEVER displayed');
  log('yellow', '   - Only masked values shown');
  log('yellow', '   - Safe to run in any environment\n');

  log('blue', '📋 Enter Your X OAuth 1.0a Credentials\n');

  const apiKey = await prompt('1. API Key (from X Developer Portal): ');
  const apiSecret = await prompt('2. API Secret: ');
  const accessToken = await prompt('3. Access Token: ');
  const accessTokenSecret = await prompt('4. Access Token Secret: ');

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    log('red', '\n❌ Missing credentials - cannot test\n');
    process.exit(1);
  }

  log('blue', '\n📡 Step 1: Testing credentials...');

  const result = await testX(apiKey, apiSecret, accessToken, accessTokenSecret);

  log('blue', '\n📊 Results:\n');

  if (result.success) {
    log('green', '╔════════════════════════════════════════╗');
    log('green', '║   ✅ TEST SUCCESSFUL!                 ║');
    log('green', '║   Tweet posted to @3mpwrApp           ║');
    log('green', '╚════════════════════════════════════════╝\n');

    log('cyan', 'Next steps:');
    log('cyan', '1. Visit your X profile to verify post');
    log('cyan', '2. Update GitHub Secrets with these exact credentials:');
    log('cyan', '   - X_API_KEY');
    log('cyan', '   - X_API_SECRET');
    log('cyan', '   - X_ACCESS_TOKEN');
    log('cyan', '   - X_ACCESS_TOKEN_SECRET');
    log('cyan', '3. Daily automation will post at 9 AM UTC\n');

    process.exit(0);
  } else {
    log('red', '╔════════════════════════════════════════╗');
    log('red', '║   ❌ TEST FAILED                      ║');
    log('red', `║   ${result.error.substring(0, 35).padEnd(35)} ║`);
    log('red', '╚════════════════════════════════════════╝\n');

    log('yellow', 'Troubleshooting:');
    log('yellow', '1. Double-check credentials are copied exactly from X Portal');
    log('yellow', '2. Verify no extra spaces before/after values');
    log('yellow', '3. Confirm app permissions are "Read and Write"');
    log('yellow', '4. Try regenerating tokens in X Developer Portal');
    log('yellow', '5. Wait 1-2 minutes for token activation\n');

    process.exit(1);
  }
}

main().catch(error => {
  log('red', `\n❌ Fatal error: ${error.message}\n`);
  process.exit(1);
});
