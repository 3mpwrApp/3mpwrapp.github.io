#!/usr/bin/env node
/**
 * POST-INJURED-WORKERS-DAY-RALLIES-2026.JS
 * Posts for Injured Workers Day 2026 rallies
 * 
 * Theme: Stop the Cuts to Workers Comp - Justice for Injured Workers
 * Events: Thunder Bay (May 29), Toronto Queens Park (June 1), Hamilton (June 1), London (June 1)
 * Posts 3x per week through June 1
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

const STATE_FILE = path.join(__dirname, '../.github/state/injured-workers-day-rallies-2026-state.json');
const CAMPAIGN_END = new Date('2026-06-01T23:59:59-04:00');

// Check if campaign has ended
if (new Date() > CAMPAIGN_END) {
  console.log('ℹ️  Campaign has ended');
  process.exit(0);
}

const POSTS = [
  {
    variant: 1,
    text: `🚨 Injured Workers Day 2026 - Join the Fight!

Stop the Cuts to Workers Comp!

📅 May 29: Thunder Bay City Hall, 10 AM
📅 June 1: Toronto Queens Park, 11 AM
📅 June 1: Hamilton City Hall, 11 AM
📅 June 1: London Victoria Park (NW), 1 PM

Injured workers across Ontario are standing up against benefit cuts and demanding JUSTICE.

Info: thunderbayinjuredworkers.com

#InjuredWorkersDay #StopTheCuts #WorkersRights`
  },
  {
    variant: 2,
    text: `⚖️ Justice for Injured Workers!

Injured Workers Day rallies happening across Ontario:

🔥 Thunder Bay - May 29, 10 AM (City Hall)
🔥 Toronto - June 1, 11 AM (Queens Park)
🔥 Hamilton - June 1, 11 AM (City Hall)
🔥 London - June 1, 1 PM (Victoria Park NW)

We demand an end to cuts to workers compensation. Stand with injured workers!

More info: thunderbayinjuredworkers.com

#InjuredWorkersDay #Justice #Ontario`
  },
  {
    variant: 3,
    text: `💪 Stand with Injured Workers - June 1st!

After decades of cuts, injured workers are fighting back.

Join rallies at:
📍 Toronto Queens Park - 11 AM
📍 Hamilton City Hall - 11 AM
📍 London Victoria Park NW - 1 PM
📍 Thunder Bay City Hall - May 29, 10 AM

Stop the Cuts to Workers Comp!
Justice for Injured Workers!

thunderbayinjuredworkers.com

#InjuredWorkersDay #WorkersComp`
  },
  {
    variant: 4,
    text: `🔥 Injured Workers Day 2026

Ontario's injured workers are under attack. Benefit cuts threaten the most vulnerable.

TIME TO FIGHT BACK:
• Thunder Bay: May 29, 10 AM (City Hall)
• Toronto: June 1, 11 AM (Queens Park)
• Hamilton: June 1, 11 AM (City Hall)
• London: June 1, 1 PM (Victoria Park NW)

Join the movement for justice!

Info: thunderbayinjuredworkers.com

#StopTheCuts #InjuredWorkers`
  },
  {
    variant: 5,
    text: `✊ Injured Workers Day - Mark Your Calendar!

Four powerful rallies demanding justice:

May 29 @ 10 AM: Thunder Bay City Hall
June 1 @ 11 AM: Toronto Queens Park
June 1 @ 11 AM: Hamilton City Hall
June 1 @ 1 PM: London Victoria Park NW

Stop the Cuts to Workers Comp!

Injured workers deserve dignity, fair benefits, and respect. Join us!

thunderbayinjuredworkers.com

#InjuredWorkersDay #WorkersRights #Ontario`
  },
  {
    variant: 6,
    text: `📢 Injured Workers Day 2026 - A Call to Action

Across Ontario, injured workers are rallying against benefit cuts:

🗓️ Thunder Bay: May 29, 10 AM
🗓️ Toronto: June 1, 11 AM
🗓️ Hamilton: June 1, 11 AM
🗓️ London: June 1, 1 PM

We demand justice, not cuts!

Be there. Stand with injured workers.

More: thunderbayinjuredworkers.com

#InjuredWorkersDay #Justice #StopTheCuts`
  },
  {
    variant: 7,
    text: `⚡ Injured Workers Need YOU!

Injured Workers Day rallies - Stop the Cuts to Workers Comp

📌 Thunder Bay City Hall - May 29, 10 AM
📌 Queens Park, Toronto - June 1, 11 AM
📌 Hamilton City Hall - June 1, 11 AM
📌 Victoria Park NW, London - June 1, 1 PM

Every voice matters. Every worker matters.

Join the fight for justice!

thunderbayinjuredworkers.com

#InjuredWorkersDay #WorkersComp`
  },
  {
    variant: 8,
    text: `💔 Injured Workers Are Fighting for Survival

Benefit cuts are devastating lives. But we're not giving up.

Injured Workers Day 2026:
• May 29: Thunder Bay (10 AM, City Hall)
• June 1: Toronto (11 AM, Queens Park)
• June 1: Hamilton (11 AM, City Hall)
• June 1: London (1 PM, Victoria Park NW)

Stand with us. Stop the cuts.

thunderbayinjuredworkers.com

#InjuredWorkersDay #Justice #Ontario`
  }
];

console.log('✊ Injured Workers Day 2026 Rallies Campaign');
console.log(`📅 ${Math.ceil((CAMPAIGN_END - new Date()) / (1000 * 60 * 60 * 24))} days until June 1`);
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
