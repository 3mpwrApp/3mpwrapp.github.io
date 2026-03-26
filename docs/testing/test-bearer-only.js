#!/usr/bin/env node

/**
 * Simple X API v2 Bearer Token Test
 * Tests posting with just Bearer Token (simplest method)
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

async function testBearerToken(bearerToken) {
  log('blue', '\n🐦 Testing X API v2 Bearer Token...');
  
  const testTweet = `🧪 Test from 3mpwr App (@3mpwrApp) at ${new Date().toLocaleTimeString()} - Bearer Token test #DisabilityRights`;
  
  log('cyan', `   Tweet: "${testTweet}"`);
  log('cyan', `   Length: ${testTweet.length}/280`);
  log('cyan', `   Token: ${bearerToken.substring(0, 20)}...${bearerToken.substring(bearerToken.length - 10)}`);

  try {
    log('yellow', '\n   Sending request to: POST https://api.twitter.com/2/tweets');
    
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

    log('yellow', `   Response: ${response.status}`);

    if (response.status === 201) {
      try {
        const data = JSON.parse(response.body);
        log('green', `\n✅ SUCCESS: Tweet Posted!`);
        log('cyan', `   Tweet ID: ${data.data.id}`);
        log('cyan', `   URL: https://x.com/3mpwrApp/status/${data.data.id}`);
        return true;
      } catch (e) {
        log('green', '\n✅ Tweet posted successfully (201)');
        return true;
      }
    } else {
      log('red', `\n❌ Failed with status ${response.status}`);
      
      try {
        const errorData = JSON.parse(response.body);
        log('yellow', '\nError Details:');
        
        if (errorData.errors && errorData.errors[0]) {
          const error = errorData.errors[0];
          log('red', `   Error: ${error.message}`);
          log('red', `   Code: ${error.code}`);
          log('red', `   Type: ${error.type}`);
        } else if (errorData.detail) {
          log('red', `   ${errorData.detail}`);
        } else if (errorData.title) {
          log('red', `   ${errorData.title}: ${errorData.detail}`);
        } else {
          log('cyan', JSON.stringify(errorData, null, 2));
        }
      } catch {
        log('cyan', `   Raw response: ${response.body.substring(0, 200)}`);
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
  log('cyan', '║   X API v2 Bearer Token Test           ║');
  log('cyan', '║   3mpwr App (@3mpwrApp)               ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('yellow', '⚠️  This script will POST a test tweet');
  log('yellow', '   Make sure you have:');
  log('yellow', '   - App Type: Web App');
  log('yellow', '   - Permissions: Read and Write');
  log('yellow', '   - New Bearer Token (regenerated)\n');

  const bearerToken = await prompt('Enter your X Bearer Token: ');

  if (!bearerToken || bearerToken.trim().length === 0) {
    log('yellow', 'No token provided.\n');
    process.exit(0);
  }

  log('blue', '\n📡 Sending test tweet...');

  const success = await testBearerToken(bearerToken.trim());

  log('blue', '\n📊 Results:');
  
  if (success) {
    log('green', '\n╔════════════════════════════════════════╗');
    log('green', '║   ✅ TEST SUCCESSFUL!                 ║');
    log('green', '║   Your Bearer Token is working        ║');
    log('green', '╚════════════════════════════════════════╝\n');

    log('cyan', 'Next steps:');
    log('cyan', '1. Check your X profile for the test tweet');
    log('cyan', '2. Update GitHub Secret X_BEARER_TOKEN with this token');
    log('cyan', '3. Daily automation will post at 9 AM UTC\n');
  } else {
    log('red', '\n╔════════════════════════════════════════╗');
    log('red', '║   ❌ TEST FAILED                      ║');
    log('red', '║   Bearer Token not working            ║');
    log('red', '╚════════════════════════════════════════╝\n');

    log('yellow', 'Troubleshooting steps:');
    log('yellow', '1. Verify token was regenerated in X Developer Portal');
    log('yellow', '2. Check app permissions: Settings → "Read and Write"');
    log('yellow', '3. Verify app type is "Web App" (Confidential client)');
    log('yellow', '4. Try regenerating the Bearer Token again');
    log('yellow', '5. Wait 1-2 minutes and try again\n');

    log('yellow', 'If still failing, check X Developer Portal:');
    log('yellow', '→ dashboard: https://developer.twitter.com/en/portal/dashboard');
    log('yellow', '→ Select 3mpwr App');
    log('yellow', '→ Click "Settings"');
    log('yellow', '→ Verify "OAuth 2.0 Authorization Code with PKCE" is enabled\n');
  }
}

main().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
});
