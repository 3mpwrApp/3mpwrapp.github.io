#!/usr/bin/env node

/**
 * Test Social Media API - OAuth 1.0a X & Mastodon
 * Tests posting to X (OAuth 1.0a) and Mastodon with environment variables
 */

const { SocialMediaManager } = require('./scripts/social-media-api.js');

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

async function main() {
  log('cyan', '\n╔════════════════════════════════════════╗');
  log('cyan', '║  Social Media API Test                 ║');
  log('cyan', '║  X (OAuth 1.0a) & Mastodon            ║');
  log('cyan', '╚════════════════════════════════════════╝\n');

  log('blue', '📋 Checking environment variables...\n');

  const requiredVars = {
    'X_API_KEY': process.env.X_API_KEY,
    'X_API_SECRET': process.env.X_API_SECRET,
    'X_ACCESS_TOKEN': process.env.X_ACCESS_TOKEN,
    'X_ACCESS_TOKEN_SECRET': process.env.X_ACCESS_TOKEN_SECRET,
    'MASTO_INSTANCE': process.env.MASTO_INSTANCE || process.env.MASTODON_INSTANCE,
    'MASTO_TOKEN': process.env.MASTO_TOKEN || process.env.MASTODON_ACCESS_TOKEN,
  };

  let missingVars = [];

  for (const [name, value] of Object.entries(requiredVars)) {
    if (value) {
      const display = value.length > 20 ? value.substring(0, 10) + '...' + value.substring(value.length - 10) : value;
      log('green', `   ✅ ${name}`);
    } else {
      log('red', `   ❌ ${name}`);
      missingVars.push(name);
    }
  }

  if (missingVars.length > 0) {
    log('red', `\n❌ Missing ${missingVars.length} environment variable(s):`);
    missingVars.forEach(v => log('yellow', `   - ${v}`));
    log('yellow', '\nSet these in GitHub Secrets or .env file\n');
    process.exit(1);
  }

  log('green', '\n✅ All credentials found\n');

  log('blue', '📡 Creating Social Media Manager...\n');

  const manager = new SocialMediaManager();

  log('blue', '🚀 Testing posts...\n');

  const testContent = {
    x: `🧪 Test from 3mpwr App - OAuth 1.0a test (${new Date().toLocaleTimeString()}) #DisabilityRights`,
    mastodon: `🧪 Test from 3mpwr App - Mastodon test (${new Date().toLocaleTimeString()}) #DisabilityRights`,
  };

  const results = await manager.postToAll(testContent);

  log('blue', '\n📊 Results:\n');

  let successCount = 0;

  if (results.x) {
    log('green', '   ✅ X: Posted successfully');
    log('cyan', `      Tweet ID: ${results.x.id_str}`);
    successCount++;
  } else {
    log('red', '   ❌ X: Failed to post');
  }

  if (results.mastodon) {
    log('green', '   ✅ Mastodon: Posted successfully');
    log('cyan', `      Status ID: ${results.mastodon.id}`);
    successCount++;
  } else {
    log('red', '   ❌ Mastodon: Failed to post');
  }

  log('blue', `\n   Total: ${successCount}/2 successful\n`);

  if (successCount === 2) {
    log('green', '╔════════════════════════════════════════╗');
    log('green', '║   ✅ ALL TESTS SUCCESSFUL!            ║');
    log('green', '║   Ready for daily automation           ║');
    log('green', '╚════════════════════════════════════════╝\n');

    log('cyan', 'Next steps:');
    log('cyan', '1. Check @3mpwrApp on X for your test tweet');
    log('cyan', '2. Check @3mpwrApp@mastodon.social for your test toot');
    log('cyan', '3. At 9 AM UTC, automation will post daily!\n');

    process.exit(0);
  } else {
    log('red', '╔════════════════════════════════════════╗');
    log('red', '║   ⚠️  PARTIAL SUCCESS                 ║');
    log('red', '║   Some platforms failed                ║');
    log('red', '╚════════════════════════════════════════╝\n');

    process.exit(1);
  }
}

main().catch(error => {
  log('red', `\n❌ Fatal error: ${error.message}\n`);
  console.error(error);
  process.exit(1);
});
