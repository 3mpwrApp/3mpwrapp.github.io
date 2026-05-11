#!/usr/bin/env node
/**
 * POST-IAVGO-DAY-OF-MOURNING-APRIL28.JS
 * Posts for IAVGO Day of Action on April 28, 2026
 * 
 * Event: Day of Mourning - Day of Action at WSIB Toronto
 * Time: April 28, 2 PM EST
 * Location: 200 Front Street West, Toronto
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

const STATE_FILE = path.join(__dirname, '../.github/state/iavgo-day-of-mourning-state.json');
const EVENT_DATE = new Date('2026-04-28T14:00:00-04:00');

// Check if event has passed
if (new Date() > EVENT_DATE) {
  console.log('ℹ️  Event has passed');
  process.exit(0);
}

const POSTS = [
  {
    variant: 1,
    text: `🕯️ TOMORROW: Day of Mourning - Day of Action

📍 WSIB, 200 Front Street West, Toronto
⏰ 2:00 PM EST, April 28th

Join IAVGO Community Legal Clinic as we mourn for the dead and fight for the living.

This Day of Action brings together injured workers, advocates, and community to honor those lost to workplace injuries and demand justice.

Contact: iwaction4j@gmail.com | 647-832-1514

#DayOfMourning #April28 #InjuredWorkers #Toronto`
  },
  {
    variant: 2,
    text: `📢 Day of Action - April 28, 2 PM

Mourn for the dead. Fight for the living.

IAVGO Community Legal Clinic invites you to join us at WSIB headquarters (200 Front St W, Toronto) for a Day of Mourning action.

We remember those lost. We demand justice for injured workers.

Info: iwaction4j@gmail.com | 647-832-1514

#DayOfMourning #InjuredWorkers #IAVGO #Toronto`
  },
  {
    variant: 3,
    text: `🔥 URGENT: Day of Mourning - Day of Action

Tuesday, April 28 at 2 PM
WSIB, 200 Front Street West, Toronto

We mourn for the dead.
We fight for the living.

Join IAVGO Community Legal Clinic and fellow injured workers demanding fair treatment and accountability.

647-832-1514 | iwaction4j@gmail.com

#April28 #InjuredWorkers #DayOfAction`
  }
];

console.log('🕯️ IAVGO Day of Mourning - Day of Action');
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
