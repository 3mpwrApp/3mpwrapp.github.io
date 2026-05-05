#!/usr/bin/env node
/**
 * POST-INJURED-WORKERS-MOVEMENT-MAY7.JS
 * Posts for Injured Workers Movement event on May 7, 2026
 * 
 * Event: History and Future of the Injured Workers Movement
 * Time: May 7, 2-4 PM EST
 * Location: Online + IWC Toronto
 * Posts daily until event
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

const STATE_FILE = path.join(__dirname, '../.github/state/injured-workers-movement-may7-state.json');
const EVENT_DATE = new Date('2026-05-07T16:00:00-04:00');

// Check if event has passed
if (new Date() > EVENT_DATE) {
  console.log('ℹ️  Event has passed');
  process.exit(0);
}

const POSTS = [
  {
    variant: 1,
    text: `📚 Join the Conversation - May 7th!

The History and Future of the Injured Workers Movement

🗓️ Thursday, May 7, 2-4 PM EST
💻 Online + In-Person at IWC Toronto (815 Danforth Ave)

Reflect on our collective history. Discuss the path forward. Build solidarity.

Pre-register: https://tinyurl.com/2jr8jhy8

#InjuredWorkers #WorkersRights #History`
  },
  {
    variant: 2,
    text: `✊ The Injured Workers Movement - Past, Present, Future

Join us May 7th, 2-4 PM EST for a powerful conversation about where we've been and where we're going.

Hybrid event:
📍 In-person: IWC Toronto
💻 Online: Join from anywhere

Pre-register NOW: https://tinyurl.com/2jr8jhy8

#InjuredWorkers #Movement #Solidarity`
  },
  {
    variant: 3,
    text: `🔥 THURSDAY: History & Future of Injured Workers Movement

May 7, 2-4 PM EST
Hybrid: Online + IWC Toronto (815 Danforth)

Come join the conversation with injured workers, advocates, and community members. Learn our history. Shape our future.

Register: https://tinyurl.com/2jr8jhy8

#InjuredWorkers #WorkersRights #Toronto`
  },
  {
    variant: 4,
    text: `📢 Injured Workers Movement Event - May 7th

Where have we been? Where are we going?

Join this important conversation about the history and future of the injured workers movement.

⏰ 2-4 PM EST, May 7
📍 Online + IWC Toronto

Pre-register: https://tinyurl.com/2jr8jhy8

#InjuredWorkers #History #Advocacy`
  }
];

console.log('📚 Injured Workers Movement Event - May 7');
console.log(`⏰ ${Math.ceil((EVENT_DATE - new Date()) / (1000 * 60 * 60 * 24))} days until event`);
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
