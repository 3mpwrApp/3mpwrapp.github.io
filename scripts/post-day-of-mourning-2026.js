#!/usr/bin/env node
/**
 * POST-DAY-OF-MOURNING-2026.JS
 * Posts for National Day of Mourning - April 28, 2026
 * Canada-wide commemoration of workers killed or injured on the job
 * Rotates through 4 post variants
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

const STATE_FILE = path.join(__dirname, '../.github/state/day-of-mourning-2026-state.json');
const EVENT_DATE = new Date('2026-04-28T23:59:59-04:00');

// Check if event has passed
if (new Date() > EVENT_DATE) {
  console.log('ℹ️  Day of Mourning 2026 has passed, stopping promotion');
  process.exit(0);
}

// Post variants
const POSTS = [
  {
    variant: 1,
    text: `🕯️ National Day of Mourning - April 28

On April 28, we remember workers who have been killed, injured, or suffered illness due to workplace hazards.

Events are taking place across Canada to honor these workers and their families.

Let us remember those who went to work and never came home.

#DayOfMourning #April28 #WorkplaceSafety #InjuredWorkers #Canada`
  },
  {
    variant: 2,
    text: `Every year, thousands of Canadian workers are killed or seriously injured on the job.

April 28 is the National Day of Mourning—a day to:
• Remember those we've lost
• Support injured workers and their families
• Recommit to workplace safety

Find events in your community. Together we mourn, and together we demand safer workplaces.

#DayOfMourning #WorkersSafety #NeverForget`
  },
  {
    variant: 3,
    text: `🇨🇦 This Tuesday, April 28: National Day of Mourning

Ceremonies are being held across Ontario and Canada to commemorate workers who have died or been injured at work.

These workers were:
• Parents, children, partners
• Friends and community members
• People who deserved to come home safely

Honor their memory. Demand better workplace protections.

#April28 #DayOfMourning #WorkplaceSafety`
  },
  {
    variant: 4,
    text: `"Mourn for the dead, fight for the living."

April 28: National Day of Mourning for workers killed or injured on the job.

Workplace injuries don't just affect workers—they devastate families and communities.

Join events in your area to remember those we've lost and advocate for safer workplaces for all.

#DayOfMourning #InjuredWorkers #WorkplaceSafety #Canada`
  }
];

console.log('🕯️ National Day of Mourning - April 28, 2026');
console.log(`📅 ${Math.ceil((EVENT_DATE - new Date()) / (1000 * 60 * 60 * 24))} days until Day of Mourning`);
console.log('');

// Load/save state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (err) {}
  return { lastVariant: 0, lastPosted: null };
}

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

function getNextPost(state) {
  const nextVariant = (state.lastVariant % POSTS.length) + 1;
  const post = POSTS.find(p => p.variant === nextVariant);
  console.log(`📝 Using post variant ${nextVariant}/${POSTS.length}`);
  return { post, variant: nextVariant };
}

// Posting functions (same as before)
async function postToDiscord(text) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  No Discord webhook, skipping');
    return false;
  }
  const data = JSON.stringify({ content: text, username: '3mpwr Events' });
  const url = new URL(webhookUrl);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
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
  if (!token) {
    console.log('⚠️  No Mastodon token, skipping');
    return false;
  }
  const data = JSON.stringify({ status: text, visibility: 'public' });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: instance,
      path: '/api/v1/statuses',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function postToBluesky(text) {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_PASSWORD;
  if (!handle || !password) {
    console.log('⚠️  No Bluesky credentials, skipping');
    return false;
  }
  try {
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
        res.on('end', () => res.statusCode === 200 ? resolve(JSON.parse(body)) : reject(new Error(`Session failed`)));
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

  saveState({ lastVariant: variant, lastPosted: new Date().toISOString() });
  process.exit(successCount > 0 ? 0 : 1);
}

main();
