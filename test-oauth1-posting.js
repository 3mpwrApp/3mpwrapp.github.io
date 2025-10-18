#!/usr/bin/env node

/**
 * X API v1.1 OAuth 1.0a Posting Test
 * Uses OAuth 1.0a credentials to post tweets (WILL WORK)
 * This is the proven method for automated posting
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
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      req.write(bodyStr);
    }

    req.end();
  });
}

function buildOAuthSignature(method, url, params, apiSecret, accessTokenSecret) {
  // Sort parameters for signature
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

async function postWithOAuth1(apiKey, apiSecret, accessToken, accessTokenSecret) {
  log('blue', '\n🐦 Testing X API v1.1 with OAuth 1.0a...');
  
  const testTweet = `🧪 Test from 3mpwr App (@3mpwrApp) at ${new Date().toLocaleTimeString()} - OAuth 1.0a test #DisabilityRights`;
  
  log('cyan', `   Tweet: "${testTweet}"`);
  log('cyan', `   Length: ${testTweet.length}/280`);

  try {
    log('yellow', '\n   Building OAuth 1.0a signature...');

    // OAuth parameters
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

    // Build authorization header
    const url = 'https://api.twitter.com/1.1/statuses/update.json';
    const signature = buildOAuthSignature('POST', url, oauthParams, apiSecret, accessTokenSecret);
    
    oauthParams['oauth_signature'] = signature;

    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .filter(key => key.startsWith('oauth_'))
      .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    log('yellow', '   Sending request to: POST https://api.twitter.com/1.1/statuses/update.json');

    const response = await makeRequest(
      'POST',
      `${url}?status=${encodeURIComponent(testTweet)}`,
      {
        'Authorization': authHeader,
        'User-Agent': '3mpwr-Test/1.0',
      }
    );

    log('yellow', `   Response: ${response.status}`);

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        log('green', `\n✅ SUCCESS: Tweet Posted with OAuth 1.0a!`);
        log('cyan', `   Tweet ID: ${data.id}`);
        log('cyan', `   URL: https://x.com/${data.user.screen_name}/status/${data.id_str}`);
        log('cyan', `   Text: ${data.text}`);
        return true;
      } catch (e) {
        log('green', '\n✅ Tweet posted successfully (200)');
        return true;
      }
    } else if (response.status === 401) {
      log('red', `\n❌ Unauthorized (401)`);
      log('yellow', '   Your OAuth 1.0a credentials are invalid or expired');
      try {
        const errorData = JSON.parse(response.body);
        if (errorData.errors && errorData.errors[0]) {
          log('cyan', `   ${errorData.errors[0].message}`);
        }
      } catch {}
      return false;
    } else {
      log('red', `\n❌ Error ${response.status}`);
      try {
        const errorData = JSON.parse(response.body);
        if (errorData.errors && errorData.errors[0]) {
          log('yellow', `   ${errorData.errors[0].message}`);
        } else {
          log('cyan', JSON.stringify(errorData, null, 2));
        }
      } catch {
        log('cyan', response.body.substring(0, 200));
      }
      return false;
    }
  } catch (error) {
    log('red', `\n❌ Connection error: ${error.message}`);
    return false;
  }
}

async function main() {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  X API OAuth 1.0a Posting Test         ║');
  log('cyan', '║  3mpwr App (@3mpwrApp)               ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('yellow', '✅ OAuth 1.0a is the PROVEN method for automated posting!\n');

  log('blue', '📋 Step 1: Gathering Credentials...\n');

  const apiKey = await prompt('1. Enter X API Key: ');
  const apiSecret = await prompt('2. Enter X API Secret: ');
  const accessToken = await prompt('3. Enter X Access Token: ');
  const accessTokenSecret = await prompt('4. Enter X Access Token Secret: ');

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    log('yellow', '\nMissing credentials.\n');
    process.exit(0);
  }

  log('blue', '\n📡 Step 2: Posting Test Tweet...');

  const success = await postWithOAuth1(
    apiKey.trim(),
    apiSecret.trim(),
    accessToken.trim(),
    accessTokenSecret.trim()
  );

  log('blue', '\n📊 Step 3: Results\n');

  if (success) {
    log('green', '╔════════════════════════════════════════╗');
    log('green', '║   ✅ TEST SUCCESSFUL!                 ║');
    log('green', '║   OAuth 1.0a is working perfectly!    ║');
    log('green', '║   Your automation will post tweets    ║');
    log('green', '╚════════════════════════════════════════╝\n');

    log('cyan', 'Next steps:');
    log('cyan', '1. Check your X profile for the test tweet');
    log('cyan', '2. Verify your OAuth 1.0a credentials are in GitHub Secrets:');
    log('cyan', '   - X_API_KEY');
    log('cyan', '   - X_API_SECRET');
    log('cyan', '   - X_ACCESS_TOKEN');
    log('cyan', '   - X_ACCESS_TOKEN_SECRET');
    log('cyan', '3. Daily automation will post at 9 AM UTC\n');

    process.exit(0);
  } else {
    log('red', '╔════════════════════════════════════════╗');
    log('red', '║   ❌ TEST FAILED                      ║');
    log('red', '║   Check your OAuth credentials        ║');
    log('red', '╚════════════════════════════════════════╝\n');

    log('yellow', 'Troubleshooting:');
    log('yellow', '1. Verify all 4 credentials are correct (copy-paste from X Portal)');
    log('yellow', '2. Make sure there are no extra spaces');
    log('yellow', '3. Check app permissions: Settings → "Read and Write"');
    log('yellow', '4. If credentials are old, regenerate them in X Developer Portal');
    log('yellow', '5. Wait 1-2 minutes and try again\n');

    process.exit(1);
  }
}

main().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
});
