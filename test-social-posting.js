#!/usr/bin/env node

/**
 * X and Mastodon Test Post Script
 * Posts test content to both platforms to verify API credentials are working
 * Usage: node test-social-posting.js
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

async function postToX(bearerToken) {
  log('blue', '\n🐦 Posting to X (Twitter)...');
  
  const testTweet = `🧪 Test post from 3mpwr App automation (${new Date().toLocaleTimeString()}) - X API verification`;
  
  log('cyan', `   Tweet: "${testTweet}"`);
  log('cyan', `   Length: ${testTweet.length}/280`);

  try {
    const response = await makeRequest(
      'POST',
      'https://api.twitter.com/2/tweets',
      {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        'User-Agent': '3mpwr-Test-Post/1.0',
      },
      {
        text: testTweet,
      }
    );

    if (response.status === 201) {
      try {
        const data = JSON.parse(response.body);
        log('green', `✅ SUCCESS: Tweet posted to X!`);
        log('cyan', `   Tweet ID: ${data.data.id}`);
        log('cyan', `   URL: https://x.com/3mpwrApp/status/${data.data.id}`);
        return true;
      } catch (e) {
        log('green', '✅ Tweet posted successfully');
        return true;
      }
    } else if (response.status === 401) {
      log('red', `❌ FAILED: Authentication error (401)`);
      log('yellow', '   Bearer token is invalid or expired');
      return false;
    } else if (response.status === 403) {
      log('red', `❌ FAILED: Permission denied (403)`);
      log('yellow', '   Check app permissions allow posting');
      return false;
    } else {
      log('red', `❌ FAILED: Status ${response.status}`);
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', `   Error: ${JSON.stringify(errorData, null, 2)}`);
      } catch {
        log('cyan', `   Response: ${response.body.substring(0, 100)}`);
      }
      return false;
    }
  } catch (error) {
    log('red', `❌ ERROR: ${error.message}`);
    return false;
  }
}

async function postToMastodon(instance, accessToken) {
  log('blue', '\n🐘 Posting to Mastodon...');
  
  const testToot = `🧪 Test post from 3mpwr App automation (${new Date().toLocaleTimeString()}) - Mastodon API verification`;
  
  log('cyan', `   Instance: ${instance}`);
  log('cyan', `   Toot: "${testToot}"`);
  log('cyan', `   Length: ${testToot.length}/500`);

  try {
    const response = await makeRequest(
      'POST',
      `https://${instance}/api/v1/statuses`,
      {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': '3mpwr-Test-Post/1.0',
      },
      {
        status: testToot,
        visibility: 'unlisted', // Post as unlisted so it doesn't spam
      }
    );

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        log('green', `✅ SUCCESS: Toot posted to Mastodon!`);
        log('cyan', `   Toot ID: ${data.id}`);
        log('cyan', `   URL: ${data.url}`);
        log('cyan', `   Visibility: ${data.visibility}`);
        return true;
      } catch (e) {
        log('green', '✅ Toot posted successfully');
        return true;
      }
    } else if (response.status === 401) {
      log('red', `❌ FAILED: Authentication error (401)`);
      log('yellow', '   Access token is invalid or expired');
      return false;
    } else if (response.status === 422) {
      log('red', `❌ FAILED: Validation error (422)`);
      log('yellow', '   Check toot format and length');
      return false;
    } else {
      log('red', `❌ FAILED: Status ${response.status}`);
      try {
        const errorData = JSON.parse(response.body);
        log('cyan', `   Error: ${JSON.stringify(errorData, null, 2)}`);
      } catch {
        log('cyan', `   Response: ${response.body.substring(0, 100)}`);
      }
      return false;
    }
  } catch (error) {
    log('red', `❌ ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  Social Media Test Post Script        ║');
  log('cyan', '║  X and Mastodon API Testing           ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('yellow', '⚠️  This will post test messages to your accounts');
  log('yellow', '   Posts will be created with test content\n');

  // Get credentials
  log('blue', '📋 Step 1: Gathering Credentials...\n');

  const xToken = await prompt('Enter your X Bearer Token (or press Enter to skip X): ');
  const mastodonInstance = await prompt('Enter Mastodon instance (e.g., mastodon.social, or press Enter to skip): ');
  const mastodonToken = mastodonInstance ? 
    await prompt('Enter your Mastodon Access Token (or press Enter to skip): ') : '';

  if (!xToken && !mastodonToken) {
    log('yellow', '\nNo credentials provided. Skipping tests.\n');
    process.exit(0);
  }

  log('blue', '\n📡 Step 2: Posting to Platforms...');

  const results = {
    x: null,
    mastodon: null,
  };

  // Post to X
  if (xToken && xToken.trim().length > 0) {
    results.x = await postToX(xToken.trim());
  } else {
    log('yellow', '\n🐦 Skipping X (no token provided)');
  }

  // Post to Mastodon
  if (mastodonToken && mastodonToken.trim().length > 0 && mastodonInstance) {
    results.mastodon = await postToMastodon(
      mastodonInstance.trim(),
      mastodonToken.trim()
    );
  } else if (mastodonInstance) {
    log('yellow', '\n🐘 Skipping Mastodon (no token provided)');
  }

  // Summary
  log('blue', '\n📊 Step 3: Results Summary...\n');

  const totalAttempts = (results.x !== null ? 1 : 0) + (results.mastodon !== null ? 1 : 0);
  const totalSuccess = (results.x === true ? 1 : 0) + (results.mastodon === true ? 1 : 0);

  if (results.x !== null) {
    log(results.x ? 'green' : 'red', `  X: ${results.x ? '✅ SUCCESS' : '❌ FAILED'}`);
  }
  if (results.mastodon !== null) {
    log(results.mastodon ? 'green' : 'red', `  Mastodon: ${results.mastodon ? '✅ SUCCESS' : '❌ FAILED'}`);
  }

  log('blue', `\n  Total: ${totalSuccess}/${totalAttempts} successful`);

  if (totalSuccess === totalAttempts && totalAttempts > 0) {
    log('green', '\n╔════════════════════════════════════════╗');
    log('green', '║  ✅ ALL TESTS PASSED!                 ║');
    log('green', '║  Your APIs are working!               ║');
    log('green', '╚════════════════════════════════════════╝\n');

    log('cyan', 'Next steps:');
    log('cyan', '1. Check your X profile for the tweet');
    log('cyan', '2. Check your Mastodon profile for the toot');
    log('cyan', '3. Daily automation will post at 9 AM UTC');
    log('cyan', '4. All credentials are secure in GitHub Secrets\n');

    process.exit(0);
  } else if (totalSuccess > 0) {
    log('yellow', '\n╔════════════════════════════════════════╗');
    log('yellow', '║  ⚠️  PARTIAL SUCCESS                  ║');
    log('yellow', '║  Some platforms worked, some failed   ║');
    log('yellow', '╚════════════════════════════════════════╝\n');
    process.exit(1);
  } else {
    log('red', '\n╔════════════════════════════════════════╗');
    log('red', '║  ❌ ALL TESTS FAILED                  ║');
    log('red', '║  Check credentials and try again      ║');
    log('red', '╚════════════════════════════════════════╝\n');
    process.exit(1);
  }
}

main().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
});
