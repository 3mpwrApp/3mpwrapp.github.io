#!/usr/bin/env node

/**
 * X API v2 Posting Test - Proper OAuth 1.0a Implementation
 * Tests X API posting with correct authentication headers
 * Usage: node test-x-posting.js
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

async function testXWithBearerToken(bearerToken) {
  log('blue', '\n🐦 Testing X API v2 with Bearer Token...');
  
  const testTweet = `🧪 Test from 3mpwr App (${new Date().toLocaleTimeString()}) - API verification #DisabilityRights`;
  
  log('cyan', `   Tweet: "${testTweet}"`);
  log('cyan', `   Length: ${testTweet.length}/280`);

  try {
    const response = await makeRequest(
      'POST',
      'https://api.twitter.com/2/tweets',
      {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        'User-Agent': '3mpwr-Test/1.0',
      },
      {
        text: testTweet,
      }
    );

    if (response.status === 201) {
      try {
        const data = JSON.parse(response.body);
        log('green', `✅ SUCCESS: Tweet posted!`);
        log('cyan', `   Tweet ID: ${data.data.id}`);
        log('cyan', `   URL: https://x.com/3mpwrApp/status/${data.data.id}`);
        return { success: true, type: 'Bearer Token' };
      } catch (e) {
        log('green', '✅ Tweet posted successfully');
        return { success: true, type: 'Bearer Token' };
      }
    } else if (response.status === 401) {
      log('red', `❌ Unauthorized (401)`);
      log('yellow', '   Bearer token invalid or expired');
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', `   ${errorData.detail}`);
      } catch {}
      return { success: false, error: '401 Unauthorized' };
    } else if (response.status === 403) {
      log('red', `❌ Forbidden (403)`);
      log('yellow', '   App may not have write permissions');
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', `   ${errorData.detail}`);
      } catch {}
      return { success: false, error: '403 Forbidden' };
    } else {
      log('red', `❌ Error ${response.status}`);
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', JSON.stringify(errorData, null, 2));
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

async function testXWithOAuth(apiKey, apiSecret, accessToken, accessTokenSecret) {
  log('blue', '\n🐦 Testing X API v1.1 with OAuth 1.0a...');
  
  const testTweet = `🧪 Test from 3mpwr App (${new Date().toLocaleTimeString()}) - OAuth verification #DisabilityRights`;
  
  log('cyan', `   Tweet: "${testTweet}"`);
  log('cyan', `   Length: ${testTweet.length}/280`);

  try {
    // Generate OAuth signature (simplified)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const oauthParams = {
      'oauth_consumer_key': apiKey,
      'oauth_token': accessToken,
      'oauth_signature_method': 'HMAC-SHA1',
      'oauth_timestamp': timestamp,
      'oauth_nonce': nonce,
      'oauth_version': '1.0',
    };

    // Build signature base string (simplified)
    const paramString = Object.keys(oauthParams)
      .sort()
      .map(key => `${key}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    const signatureBaseString = `POST&${encodeURIComponent('https://api.twitter.com/1.1/statuses/update.json')}&${encodeURIComponent(paramString + `&status=${encodeURIComponent(testTweet)}`)}`;

    const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessTokenSecret)}`;
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(signatureBaseString)
      .digest('base64');

    oauthParams['oauth_signature'] = signature;

    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    const response = await makeRequest(
      'POST',
      `https://api.twitter.com/1.1/statuses/update.json?status=${encodeURIComponent(testTweet)}`,
      {
        'Authorization': authHeader,
        'User-Agent': '3mpwr-Test/1.0',
      }
    );

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        log('green', `✅ SUCCESS: Tweet posted with OAuth!`);
        log('cyan', `   Tweet ID: ${data.id}`);
        log('cyan', `   URL: https://x.com/3mpwrApp/status/${data.id_str}`);
        return { success: true, type: 'OAuth 1.0a' };
      } catch (e) {
        log('green', '✅ Tweet posted with OAuth');
        return { success: true, type: 'OAuth 1.0a' };
      }
    } else if (response.status === 401) {
      log('red', `❌ Unauthorized (401)`);
      log('yellow', '   OAuth credentials invalid');
      return { success: false, error: '401 Unauthorized' };
    } else {
      log('red', `❌ Error ${response.status}`);
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', JSON.stringify(errorData, null, 2));
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
  log('cyan', '║  X API Posting Test (Multiple Methods)║');
  log('cyan', '║  3mpwr App (@3mpwrApp)                ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('yellow', '⚠️  This script will POST test tweets to your account');
  log('yellow', '   We\'ll try different authentication methods\n');

  // Get credentials
  log('blue', '📋 Step 1: Gathering Credentials...\n');

  const bearerToken = await prompt('1. Enter X Bearer Token (for API v2): ');
  const useOAuth = (await prompt('\n2. Also test with OAuth 1.0a? (y/n): ')).toLowerCase() === 'y';

  let apiKey = '', apiSecret = '', accessToken = '', accessTokenSecret = '';
  
  if (useOAuth) {
    apiKey = await prompt('   API Key: ');
    apiSecret = await prompt('   API Secret: ');
    accessToken = await prompt('   Access Token: ');
    accessTokenSecret = await prompt('   Access Token Secret: ');
  }

  if (!bearerToken && !useOAuth) {
    log('yellow', '\nNo credentials provided.\n');
    process.exit(0);
  }

  log('blue', '\n📡 Step 2: Testing X API Posting...');

  const results = [];

  // Test Bearer Token (API v2)
  if (bearerToken && bearerToken.trim().length > 0) {
    const result = await testXWithBearerToken(bearerToken.trim());
    results.push(result);
  }

  // Test OAuth 1.0a (API v1.1)
  if (useOAuth && apiKey && accessToken) {
    const result = await testXWithOAuth(
      apiKey.trim(),
      apiSecret.trim(),
      accessToken.trim(),
      accessTokenSecret.trim()
    );
    results.push(result);
  }

  // Summary
  log('blue', '\n📊 Step 3: Results Summary...\n');

  const successful = results.filter(r => r.success);
  
  results.forEach((result, index) => {
    if (result.success) {
      log('green', `  ${index + 1}. ${result.type}: ✅ SUCCESS`);
    } else {
      log('red', `  ${index + 1}. ${result.type}: ❌ FAILED - ${result.error}`);
    }
  });

  log('blue', `\n  Total: ${successful.length}/${results.length} successful`);

  if (successful.length > 0) {
    log('green', '\n╔════════════════════════════════════════╗');
    log('green', '║  ✅ TEST SUCCESSFUL!                  ║');
    log('green', '║  At least one method is working       ║');
    log('green', '╚════════════════════════════════════════╝\n');

    log('cyan', 'Next steps:');
    log('cyan', '1. Check your X profile for the test tweets');
    log('cyan', '2. Daily automation uses this same method');
    log('cyan', '3. Posts will appear at 9 AM UTC\n');

    process.exit(0);
  } else {
    log('red', '\n╔════════════════════════════════════════╗');
    log('red', '║  ❌ ALL TESTS FAILED                  ║');
    log('red', '║  Check your credentials and try again ║');
    log('red', '╚════════════════════════════════════════╝\n');

    log('yellow', 'Troubleshooting:');
    log('yellow', '1. Verify credentials in X Developer Portal');
    log('yellow', '2. Check app has "Read and Write" permissions');
    log('yellow', '3. Try regenerating tokens');
    log('yellow', '4. Ensure tokens haven\'t expired\n');

    process.exit(1);
  }
}

main().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
});
