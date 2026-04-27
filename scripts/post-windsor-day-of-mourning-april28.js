#!/usr/bin/env node
/**
 * POST-WINDSOR-DAY-OF-MOURNING-APRIL28.JS
 * Posts for Windsor National Day of Mourning on April 28, 2026
 * 
 * Event: National Day of Mourning - Windsor & District Labour Council
 * Time: April 28, 5 PM EST
 * Location: Reaume Park at The Injured Workers Monument, Windsor ON
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

const STATE_FILE = path.join(__dirname, '../.github/state/windsor-day-of-mourning-state.json');
const EVENT_DATE = new Date('2026-04-28T17:00:00-04:00');

// Check if event has passed
if (new Date() > EVENT_DATE) {
  console.log('ℹ️  Event has passed');
  process.exit(0);
}

const POSTS = [
  {
    variant: 1,
    text: `🕯️ National Day of Mourning - Windsor

Tuesday, April 28 at 5 PM EST
📍 Reaume Park at The Injured Workers Monument, Windsor ON

Join Windsor & District Labour Council as we lay flowers at the riverfront to remember those killed or injured in the workplace.

Renew your commitment to worker health, safety, and well-being.

🍽️ Refreshments 6 PM at Hook and Ladder (3690 Seminole Street)

#DayOfMourning #April28 #Windsor #WorkplaceSafety`
  },
  {
    variant: 2,
    text: `🌹 Remember. Honour. Commit.

National Day of Mourning
April 28, 5 PM | Reaume Park, Windsor

We gather at The Injured Workers Monument to lay flowers and remember workers lost to workplace injuries and illness.

Together, we renew our commitment to worker safety and well-being.

Organized by Windsor & District Labour Council
Refreshments follow at Hook and Ladder, 6 PM

#DayOfMourning #InjuredWorkers #Windsor`
  },
  {
    variant: 3,
    text: `💔 National Day of Mourning - April 28

For every worker killed or injured on the job.

📍 The Injured Workers Monument, Reaume Park, Windsor
⏰ 5:00 PM EST
🌹 Laying of flowers at the riverfront

Join Windsor & District Labour Council in honoring those we've lost and fighting for those still with us.

Refreshments: 6 PM at Hook and Ladder (3690 Seminole Street)

#April28 #WorkplaceSafety #Windsor`
  },
  {
    variant: 4,
    text: `🕊️ TOMORROW: National Day of Mourning

Windsor & District Labour Council invites you to The Injured Workers Monument at Reaume Park.

We will lay flowers at the riverfront and remember those killed or injured in the workplace.

Your presence honors their memory and strengthens our commitment to workplace safety.

📅 April 28, 5 PM
📍 Reaume Park, Windsor ON
🍽️ Refreshments 6 PM (Hook and Ladder)

#DayOfMourning #Windsor`
  }
];

console.log('🕯️ Windsor National Day of Mourning');
console.log(`⏰ ${Math.ceil((EVENT_DATE - new Date()) / (1000 * 60 * 60 * 24))} days until event`);
console.log('');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {}
  return { lastVariant: 0, lastPosted: null };
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
  console.log(`📝 Using post variant ${nextVariant}/${POSTS.length}`);
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

  saveState({ lastVariant: variant, lastPosted: new Date().toISOString() });
  process.exit(successCount > 0 ? 0 : 1);
}

main();
