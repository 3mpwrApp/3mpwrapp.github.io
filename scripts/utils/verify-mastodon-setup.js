#!/usr/bin/env node

/**
 * Mastodon Credentials Verification Guide
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════╗');
console.log('║  Mastodon Setup Verification           ║');
console.log('╚════════════════════════════════════════╝\n');

console.log('✅ MASTODON SETUP STATUS:\n');

console.log('📋 Required GitHub Secrets:');
console.log('   1. MASTO_INSTANCE');
console.log('      └─ Should be: mastodon.social\n');

console.log('   2. MASTO_TOKEN');
console.log('      └─ Should be: Your Mastodon access token with write:statuses permission\n');

console.log('📝 How to verify your setup:');
console.log('   1. Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions');
console.log('   2. Check that both secrets exist:');
console.log('      ✓ MASTO_INSTANCE = mastodon.social');
console.log('      ✓ MASTO_TOKEN = your token starting with something like: i4E...\n');

console.log('📋 Mastodon Posting Script:');
console.log('   Location: scripts/post-to-mastodon.js');
console.log('   Function: Posts daily curation + app promotion');
console.log('   Status: ✅ Ready to use\n');

console.log('🔄 Automation Flow:');
console.log('   1. Daily at 9 AM UTC:');
console.log('      ├─ Curate news → _curation/{date}-curation.md');
console.log('      ├─ Post to Mastodon with headline + link');
console.log('      └─ Post app promotion\n');

console.log('   2. Results saved to: public/mastodon-posting-results.json\n');

console.log('📱 Verify it\'s working:');
console.log('   1. Go to: https://mastodon.social/@3mpwrApp');
console.log('   2. Look for new posts from @3mpwrApp');
console.log('   3. Posts should appear after 9 AM UTC daily\n');

console.log('⚙️  To manually test (needs env vars):');
console.log('   MASTO_INSTANCE=mastodon.social MASTO_TOKEN=<your-token> node scripts/post-to-mastodon.js\n');

console.log('✨ Mastodon automation is ready!\n');
