#!/usr/bin/env node
/**
 * POST-FAMILY-MATTERS-APRIL25.JS
 * Posts for Family Matters in-person focus group (April 25, 12-3 PM)
 * Rotates through 2 post variants
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

// State tracking
const STATE_FILE = path.join(__dirname, '../.github/state/family-matters-april25-state.json');
const EVENT_DATE = new Date('2026-04-25T15:00:00-04:00'); // 3 PM EST

// Check if event has passed
if (new Date() > EVENT_DATE) {
  console.log('ℹ️  Event has passed (April 25), stopping promotion');
  process.exit(0);
}

// Post variants
const POSTS = [
  {
    variant: 1,
    text: `🍽️ FREE LUNCH + $50: Family Matters Research (April 25)

In-person focus group at OPSEU Member Centre, Thunder Bay

📅 Friday, April 25
⏰ 12:00-3:00 PM (lunch provided!)
📍 Beside Merla Mae, Thunder Bay
💰 $50 gift card for participants

Workplace injuries don't just impact workers—they impact entire families. Share your family's experience in this important research.

Call Eugene: (807) 622-8897
Info: https://thunderbayinjuredworkers.com

#ThunderBay #WorkplaceInjury #Research #FamilySupport`
  },
  {
    variant: 2,
    text: `📢 LAST CHANCE: Family Matters In-Person Event

Friday, April 25 • 12-3 PM • Thunder Bay

This is your opportunity to participate in groundbreaking research about how workplace injuries affect families.

✅ In-person at OPSEU Member Centre (beside Merla Mae)
✅ Free lunch provided
✅ $50 gift card
✅ Confidential & respectful environment

Limited spots—register today!

Contact: Eugene Lefrancois
Phone: (807) 622-8897
Web: https://thunderbayinjuredworkers.com

Thunder Bay & District Injured Workers Support Group`
  }
];

console.log('🍽️ Family Matters In-Person Event - April 25, 2026');
console.log(`📅 ${Math.ceil((EVENT_DATE - new Date()) / (1000 * 60 * 60 * 24))} days until event`);
console.log('');

// Load state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (err) {
    // Ignore errors
  }
  return { lastVariant: 0, lastPosted: null };
}

// Save state
function saveState(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.log('⚠️  Could not save state:', err.message);
  }
}

// Get next post
function getNextPost(state) {
  const nextVariant = (state.lastVariant % POSTS.length) + 1;
  const post = POSTS.find(p => p.variant === nextVariant);
  console.log(`📝 Using post variant ${nextVariant}/${POSTS.length}`);
  return { post, variant: nextVariant };
}

// Discord
async function postToDiscord(text) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  No Discord webhook, skipping');
    return false;
  }

  const data = JSON.stringify({ content: text, username: '3mpwr Events' });
  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Mastodon
async function postToMastodon(text) {
  const token = process.env.MASTO_TOKEN;
  const instance = process.env.MASTO_INSTANCE || 'mastodon.social';
  
  if (!token) {
    console.log('⚠️  No Mastodon token, skipping');
    return false;
  }

  const data = JSON.stringify({ status: text, visibility: 'public' });
  const options = {
    hostname: instance,
    path: '/api/v1/statuses',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Bluesky
async function postToBluesky(text) {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_PASSWORD;
  
  if (!handle || !password) {
    console.log('⚠️  No Bluesky credentials, skipping');
    return false;
  }

  try {
    // Create session
    const sessionData = JSON.stringify({ identifier: handle, password });
    const session = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'bsky.social',
        path: '/xrpc/com.atproto.server.createSession',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(sessionData) }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => res.statusCode === 200 ? resolve(JSON.parse(body)) : reject(new Error(`Session failed: ${res.statusCode}`)));
      });
      req.on('error', reject);
      req.write(sessionData);
      req.end();
    });

    // Create post
    const postData = JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: { text, createdAt: new Date().toISOString(), $type: 'app.bsky.feed.post' }
    });

    return await new Promise((resolve) => {
      const req = https.request({
        hostname: 'bsky.social',
        path: '/xrpc/com.atproto.repo.createRecord',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessJwt}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
      req.on('error', () => resolve(false));
      req.write(postData);
      req.end();
    });
  } catch (err) {
    return false;
  }
}

// Main
async function main() {
  const state = loadState();
  const { post, variant } = getNextPost(state);

  const results = { discord: false, mastodon: false, bluesky: false };

  try {
    results.discord = await postToDiscord(post.text);
    if (results.discord) console.log('✅ Posted to Discord');
  } catch (err) {
    console.log('❌ Discord failed:', err.message);
  }

  try {
    results.mastodon = await postToMastodon(post.text);
    if (results.mastodon) console.log('✅ Posted to Mastodon');
  } catch (err) {
    console.log('❌ Mastodon failed:', err.message);
  }

  try {
    results.bluesky = await postToBluesky(post.text);
    if (results.bluesky) console.log('✅ Posted to Bluesky');
  } catch (err) {
    console.log('❌ Bluesky failed:', err.message);
  }

  const successCount = Object.values(results).filter(Boolean).length;
  console.log('');
  console.log(`✅ Posted to ${successCount}/3 platforms`);

  // Save state
  saveState({ lastVariant: variant, lastPosted: new Date().toISOString() });
  
  process.exit(successCount > 0 ? 0 : 1);
}

main();
