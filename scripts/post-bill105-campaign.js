#!/usr/bin/env node
/**
 * POST-BILL105-CAMPAIGN.JS
 * URGENT: Stop Bill 105 Schedule 9 - Protect the 72-month lock-in
 * 
 * Campaign runs through May 15, 2026
 * Multiple variants emphasizing different angles
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

const STATE_FILE = path.join(__dirname, '../.github/state/bill105-campaign-state.json');
const CAMPAIGN_END = new Date('2026-05-15T23:59:59-04:00');

// Check if campaign has ended
if (new Date() > CAMPAIGN_END) {
  console.log('ℹ️  Campaign has ended');
  process.exit(0);
}

const POSTS = [
  {
    variant: 1,
    text: `🚨 URGENT: Injured Workers Under Attack! 🚨

Bill 105, Schedule 9 is a POISON PILL that will remove the 72-month lock-in for permanently injured workers, putting us on perpetual probation.

This threatens income security and will re-traumatize injured workers with constant surveillance and reassessment.

📞 CALL NOW:
• Minister Piccini: 416-326-7600
• Premier Ford: 416-325-1941
• WSIB CEO Lang: 416-344-1000

#StopBill105 #InjuredWorkers #72MonthLockIn`
  },
  {
    variant: 2,
    text: `⚠️ Hidden Poison Pill in Bill 105

Schedule 9 removes the 72-month lock-in for injured workers with permanent injuries. This lock-in provides crucial income security.

Removal = Perpetual insecurity, surveillance, reassessment
Disproportionate impact on refugees & undocumented workers

DEMAND: Withdraw Schedule 9!

📞 416-326-7600 (Minister Piccini)
📞 416-325-1941 (Premier Ford)

#Bill105 #InjuredWorkers #Ontario`
  },
  {
    variant: 3,
    text: `💔 Bill 105 Will Re-Traumatize Injured Workers

The 72-month lock-in provides income security for permanently injured workers who can't return to work.

Removing it = ongoing threat of benefit cuts, surveillance, mental health crisis

This is an ATTACK on the most vulnerable workers.

CALL YOUR MPP + these numbers:
📞 Piccini: 416-326-7600
📞 Ford: 416-325-1941
📞 WSIB: 416-344-1000

#StopBill105`
  },
  {
    variant: 4,
    text: `🔥 Take Action NOW: Stop Bill 105 Schedule 9

Injured workers with permanent injuries need the 72-month lock-in for income security. Bill 105 wants to remove it.

Result? Perpetual probation. Constant reassessment. Financial insecurity. Mental breakdown.

This affects ALL permanently injured workers.

📞 Make calls today:
Minister of Labour: 416-326-7600
Premier: 416-325-1941

#InjuredWorkers #ProtectTheLockIn`
  },
  {
    variant: 5,
    text: `⚖️ Bill 105: Income INsecurity for Injured Workers

Schedule 9 removes the 72-month lock-in = puts permanently injured workers on perpetual probation with ongoing surveillance and reassessment threats.

Huge impact on refugees and undocumented workers.

WE DEMAND: Withdraw Schedule 9 immediately!

Call NOW:
📞 416-326-7600 (Piccini)
📞 416-325-1941 (Ford)
📞 Call your local MPP

#Bill105 #72MonthLockIn`
  }
];

console.log('🚨 URGENT: Bill 105 Campaign - Protect the 72-Month Lock-In');
console.log(`📅 ${Math.ceil((CAMPAIGN_END - new Date()) / (1000 * 60 * 60 * 24))} days remaining in campaign`);
console.log('');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {}
  return { lastVariant: 0, lastPosted: null, totalPosts: 0 };
}

function saveState(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.log('⚠️  Could not save state:', err.message);
  }
}

function getNextPost(state) {
  const nextVariant = (state.lastVariant % POSTS.length) + 1;
  console.log(`📝 Using post variant ${nextVariant}/${POSTS.length} (Total posts: ${state.totalPosts || 0})`);
  return { post: POSTS.find(p => p.variant === nextVariant), variant: nextVariant };
}

async function postToDiscord(text) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) { console.log('⚠️  No Discord webhook'); return false; }
  const data = JSON.stringify({ content: text, username: '3mpwr Events' });
  const url = new URL(webhookUrl);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function postToMastodon(text) {
  const token = process.env.MASTO_TOKEN;
  const instance = process.env.MASTO_INSTANCE || 'mastodon.social';
  if (!token) { console.log('⚠️  No Mastodon token'); return false; }
  const data = JSON.stringify({ status: text, visibility: 'public' });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: instance, path: '/api/v1/statuses', method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function postToBluesky(text) {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_PASSWORD;
  if (!handle || !password) { console.log('⚠️  No Bluesky credentials'); return false; }
  try {
    const sessionData = JSON.stringify({ identifier: handle, password });
    const session = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'bsky.social', path: '/xrpc/com.atproto.server.createSession', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(sessionData) }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => res.statusCode === 200 ? resolve(JSON.parse(body)) : reject(new Error('Session failed')));
      });
      req.on('error', reject);
      req.write(sessionData);
      req.end();
    });
    const postData = JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: { text, createdAt: new Date().toISOString(), $type: 'app.bsky.feed.post' }
    });
    return await new Promise((resolve) => {
      const req = https.request({
        hostname: 'bsky.social', path: '/xrpc/com.atproto.repo.createRecord', method: 'POST',
        headers: { 'Authorization': `Bearer ${session.accessJwt}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
      }, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
      req.on('error', () => resolve(false));
      req.write(postData);
      req.end();
    });
  } catch (err) { return false; }
}

async function main() {
  const state = loadState();
  const { post, variant } = getNextPost(state);
  const results = { discord: false, mastodon: false, bluesky: false };

  try { results.discord = await postToDiscord(post.text); if (results.discord) console.log('✅ Discord'); } catch (err) { console.log('❌ Discord:', err.message); }
  try { results.mastodon = await postToMastodon(post.text); if (results.mastodon) console.log('✅ Mastodon'); } catch (err) { console.log('❌ Mastodon:', err.message); }
  try { results.bluesky = await postToBluesky(post.text); if (results.bluesky) console.log('✅ Bluesky'); } catch (err) { console.log('❌ Bluesky:', err.message); }

  const successCount = Object.values(results).filter(Boolean).length;
  console.log(`\n✅ Posted to ${successCount}/3 platforms`);

  saveState({ lastVariant: variant, lastPosted: new Date().toISOString(), totalPosts: (state.totalPosts || 0) + 1 });
  process.exit(successCount > 0 ? 0 : 1);
}

main();
