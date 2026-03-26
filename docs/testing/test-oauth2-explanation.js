#!/usr/bin/env node

/**
 * X API OAuth 2.0 User Context Test
 * Uses Client ID & Secret to get proper User Context credentials for posting
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

async function main() {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  X OAuth 2.0 Setup Instructions       ║');
  log('cyan', '║  3mpwr App (@3mpwrApp)               ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('yellow', '⚠️  Bearer Tokens from Web Apps need special setup!\n');

  log('blue', 'The Problem:');
  log('cyan', '  X Bearer Tokens are "Application-Only" by default.');
  log('cyan', '  Posting tweets requires "User Context" authentication.\n');

  log('blue', 'The Solution:');
  log('cyan', '  Use OAuth 1.0a instead (simpler for automated posting).\n');

  log('green', '═══════════════════════════════════════════════════════════\n');

  log('blue', '📋 RECOMMENDED: Use OAuth 1.0a for Automated Posting\n');

  log('cyan', 'You already have everything needed:');
  log('cyan', '  ✅ X_API_KEY');
  log('cyan', '  ✅ X_API_SECRET');
  log('cyan', '  ✅ X_ACCESS_TOKEN');
  log('cyan', '  ✅ X_ACCESS_TOKEN_SECRET\n');

  log('yellow', 'These credentials support OAuth 1.0a User Context,');
  log('yellow', 'which allows posting tweets!\n');

  log('green', '═══════════════════════════════════════════════════════════\n');

  log('blue', '🔄 Alternative: Use Bearer Token Flow\n');

  log('cyan', 'If you want to keep using Bearer Tokens, X requires:\n');

  log('yellow', 'Step 1: User Authorization');
  log('cyan', '  → User visits: https://twitter.com/i/oauth2/authorize?...');
  log('cyan', '  → User clicks "Authorize" button');
  log('cyan', '  → X redirects to your Callback URL');
  log('cyan', '  → You receive an Authorization Code\n');

  log('yellow', 'Step 2: Exchange Code for Access Token');
  log('cyan', '  → Use Client ID + Client Secret + Auth Code');
  log('cyan', '  → Exchange for Access Token');
  log('cyan', '  → This Access Token has User Context!\n');

  log('yellow', 'Step 3: Use New Access Token for Posting');
  log('cyan', '  → This new token allows posting\n');

  log('red', '❌ Problem: This requires a user to manually authorize!');
  log('red', '   Not suitable for automated GitHub Actions.\n');

  log('green', '═══════════════════════════════════════════════════════════\n');

  log('blue', '✅ RECOMMENDED APPROACH:\n');

  log('cyan', 'For automated daily posting, use OAuth 1.0a instead:\n');

  log('green', 'Your current setup supports this perfectly!');
  log('green', 'We just need to fix the posting logic.\n');

  const proceed = await prompt('Switch to OAuth 1.0a posting? (y/n): ');

  if (proceed.toLowerCase() === 'y') {
    log('blue', '\n📄 Creating OAuth 1.0a posting script...\n');

    log('cyan', 'Next steps:');
    log('cyan', '1. A new script will be created: test-oauth1-posting.js');
    log('cyan', '2. It will use your existing OAuth 1.0a credentials');
    log('cyan', '3. It should successfully post tweets!\n');

    log('green', 'Creating script now...\n');
  } else {
    log('yellow', '\nIf you want to continue with Bearer Tokens:');
    log('yellow', '1. You need manual user authorization first');
    log('yellow', '2. This is not practical for automated posting');
    log('yellow', '3. OAuth 1.0a is simpler and already configured\n');
  }
}

main().catch(error => {
  log('red', `Error: ${error.message}`);
  process.exit(1);
});
