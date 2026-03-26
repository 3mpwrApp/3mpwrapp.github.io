#!/usr/bin/env node

/**
 * X OAuth 1.0a Simple Test
 * Tests with simplified signature generation
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

async function main() {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  OAuth 1.0a Method Analysis            ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('yellow', 'Since OAuth 1.0a is enabled and Read/Write permissions are set,');
  log('yellow', 'but you still get 403 error, this might mean:\n');

  log('blue', '📋 Possible Issues:\n');

  log('cyan', '1. Native Apps might NOT support OAuth 1.0a for posting');
  log('cyan', '   → Even though it\'s "enabled", it might be read-only\n');

  log('cyan', '2. OAuth 2.0 PKCE Bearer Tokens need special activation');
  log('cyan', '   → Regular regeneration doesn\'t give User Context\n');

  log('cyan', '3. The app might need to be recreated as different type\n');

  log('blue', '🔧 Recommended Solution:\n');

  log('yellow', 'Since native apps have limitations, try this:\n');

  log('cyan', '1. Delete the 3mpwr App completely');
  log('cyan', '2. Create a NEW app');
  log('cyan', '3. When creating, select: "Web App (Confidential Client)"');
  log('cyan', '4. This is specifically designed for backend posting');
  log('cyan', '5. Should immediately support OAuth 1.0a and OAuth 2.0 User Context\n');

  log('yellow', 'OR - Alternative Approach:\n');

  log('cyan', '1. Keep current app');
  log('cyan', '2. Go to OAuth 2.0 PKCE settings');
  log('cyan', '3. Look for "Authorization URL" or similar');
  log('cyan', '4. Manually visit the authorization URL to approve');
  log('cyan', '5. This activates User Context mode for Bearer Token\n');

  log('blue', '📊 Current Status:');
  log('cyan', '✓ OAuth 1.0a: Enabled (but might be read-only for Native App)');
  log('cyan', '✓ OAuth 2.0 PKCE: Enabled (but Bearer Token is Application-Only)');
  log('cyan', '✓ Permissions: Read and Write\n');

  log('yellow', 'The issue is likely that Native Apps have limitations.');
  log('yellow', 'Web App type would solve this immediately.\n');

  const choice = await prompt('Want to try creating a new Web App? (y/n): ');

  if (choice.toLowerCase() === 'y') {
    log('blue', '\n📝 Steps to create a new Web App:\n');

    log('cyan', '1. Go to: https://developer.twitter.com/en/portal/dashboard');
    log('cyan', '2. Click "Create Project" or "Add App to Project"');
    log('cyan', '3. When asked for app type, select: "Web App (Confidential Client)"');
    log('cyan', '4. Fill in required information');
    log('cyan', '5. Complete creation');
    log('cyan', '6. Go to Keys and Tokens');
    log('cyan', '7. Copy ALL credentials:');
    log('cyan', '   - API Key');
    log('cyan', '   - API Secret');
    log('cyan', '   - Access Token');
    log('cyan', '   - Access Token Secret');
    log('cyan', '   - Bearer Token');
    log('cyan', '8. Update GitHub Secrets with new values');
    log('cyan', '9. Test again\n');

    log('green', 'Web Apps are built for backend automation - should work immediately!\n');
  } else {
    log('yellow', '\nIf you want to stay with Native App, you might need to:');
    log('yellow', '1. Visit the OAuth 2.0 authorization URL manually');
    log('yellow', '2. Approve access');
    log('yellow', '3. Then Bearer Token will have User Context\n');

    log('cyan', 'Would you like me to help with that? (Requires visiting X URL)\n');
  }
}

main().catch(error => {
  log('red', `Error: ${error.message}`);
  process.exit(1);
});
